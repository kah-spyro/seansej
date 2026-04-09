"""
Movie Match — FastAPI backend (9-field profile)
Run:
    pip install fastapi uvicorn anthropic requests python-dotenv
    uvicorn backend:app --reload --port 8000
"""

import os
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"
MODEL = "claude-sonnet-4-5"
MAX_TOKENS = 2000

with open("system_prompt.md", "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()

client = Anthropic(api_key=ANTHROPIC_API_KEY)

app = FastAPI(title="Movie Match API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ───────────────────────── TMDB genre IDs ─────────────────────────
# Used to hard-filter excluded genres on the backend side
TMDB_GENRE_IDS = {
    "horror": 27,
    "romance": 10749,
    "animation": 16,
    "documentary": 99,
    "scifi": 878,
    "musical": 10402,  # "Music" in TMDB
}

# ───────────────────────── Request / response models ─────────────────────────

class QuizProfile(BaseModel):
    mood: str                          # comedy | emotional | thrill | relax | think
    company: str                       # solo | partner | family | friends
    duration: str                      # short | medium | long | any
    weight: str                        # light | balanced | heavy
    era: str                           # classic | modern | recent | any
    quality: str                       # hit | gem | guilty | random
    setting: str                       # cinema | tv | small
    platforms: List[str] = Field(default_factory=list)   # [netflix, prime, disney, hbo, apple] or [any]
    exclusions: List[str] = Field(default_factory=list)  # [horror, romance, animation, documentary, scifi, musical]


class MovieRecommendation(BaseModel):
    tmdb_id: int
    media_type: str
    title: str
    year: str
    rating: float
    match_score: int
    overview: str
    poster_url: Optional[str]
    backdrop_url: Optional[str]
    genres: List[str]
    runtime: Optional[int]
    providers: List[str]
    why: str


class RecommendResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    closing: Optional[str] = None

# ───────────────────────── Tool definition ─────────────────────────

TOOLS = [
    {
        "name": "search_movies",
        "description": (
            "Searches TMDB for movies. Always use this before recommending — never invent titles. "
            "Call multiple times with different queries to gather diverse candidates."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Natural-language keyword search in English, e.g. 'slow meditative drama', 'feel-good family comedy'",
                },
                "min_year": {"type": "integer"},
                "max_year": {"type": "integer"},
                "min_rating": {
                    "type": "number",
                    "description": "Minimum TMDB rating 0-10, defaults to 6.5",
                },
            },
            "required": ["query"],
        },
    }
]

# ───────────────────────── TMDB helpers ─────────────────────────

def tmdb_search(query, min_year=None, max_year=None, min_rating=6.5, excluded_genre_ids=None):
    """Search TMDB with optional exclusion of genres. Returns simplified records for the LLM."""
    excluded_genre_ids = excluded_genre_ids or []
    results = []

    r = requests.get(
        f"{TMDB_BASE}/search/movie",
        params={
            "api_key": TMDB_API_KEY,
            "query": query,
            "language": "en-US",
            "include_adult": "false",
        },
        timeout=10,
    )
    if r.status_code != 200:
        return []

    for item in r.json().get("results", [])[:15]:
        year_str = item.get("release_date", "")
        year = int(year_str[:4]) if year_str[:4].isdigit() else None
        rating = item.get("vote_average", 0)
        votes = item.get("vote_count", 0)
        genre_ids = item.get("genre_ids", [])

        if min_year and year and year < min_year:
            continue
        if max_year and year and year > max_year:
            continue
        if rating < min_rating or votes < 50:
            continue
        # Hard exclusion: if movie has any excluded genre, skip
        if any(gid in excluded_genre_ids for gid in genre_ids):
            continue

        results.append({
            "tmdb_id": item["id"],
            "title": item.get("title"),
            "year": year,
            "rating": round(rating, 1),
            "overview": (item.get("overview") or "")[:250],
        })

    return results[:12]


def tmdb_details(tmdb_id):
    """Fetches full movie details for the response payload."""
    r = requests.get(
        f"{TMDB_BASE}/movie/{tmdb_id}",
        params={"api_key": TMDB_API_KEY, "language": "en-US"},
        timeout=10,
    )
    if r.status_code != 200:
        return None
    data = r.json()

    providers = []
    try:
        pr = requests.get(
            f"{TMDB_BASE}/movie/{tmdb_id}/watch/providers",
            params={"api_key": TMDB_API_KEY},
            timeout=10,
        ).json()
        pl = pr.get("results", {}).get("PL", {})
        for p in pl.get("flatrate", []) or []:
            providers.append(p["provider_name"])
    except Exception:
        pass

    return {
        "title": data.get("title") or "",
        "year": (data.get("release_date") or "")[:4],
        "rating": round(data.get("vote_average", 0), 1),
        "overview": data.get("overview", ""),
        "poster_url": f"{TMDB_IMG}{data['poster_path']}" if data.get("poster_path") else None,
        "backdrop_url": f"https://image.tmdb.org/t/p/w1280{data['backdrop_path']}" if data.get("backdrop_path") else None,
        "genres": [g["name"] for g in data.get("genres", [])],
        "runtime": data.get("runtime"),
        "providers": providers,
    }

# ───────────────────────── Profile → prompt ─────────────────────────

def build_profile_message(p: QuizProfile) -> str:
    lines = ["Oto profil użytkownika z quizu:\n"]
    lines.append(f"- **mood**: {p.mood}")
    lines.append(f"- **company**: {p.company}")
    lines.append(f"- **duration**: {p.duration}")
    lines.append(f"- **weight**: {p.weight}")
    lines.append(f"- **era**: {p.era}")
    lines.append(f"- **quality**: {p.quality}")
    lines.append(f"- **setting**: {p.setting}")
    lines.append(f"- **platforms**: {', '.join(p.platforms) if p.platforms else 'any'}")
    lines.append(f"- **exclusions**: {', '.join(p.exclusions) if p.exclusions else 'none'}")
    lines.append("")
    lines.append("Znajdź 3 filmy. Użyj search_movies wielokrotnie, napisz osobiste uzasadnienia po polsku, zwróć JSON w wymaganym formacie.")
    return "\n".join(lines)

# ───────────────────────── Conversation loop ─────────────────────────

def run_conversation(messages, excluded_genre_ids):
    """Runs the tool-use loop. Excluded genres are filtered inside tmdb_search."""
    max_iterations = 8  # safety
    for _ in range(max_iterations):
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            text = "".join(b.text for b in response.content if b.type == "text")
            return text

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if block.name == "search_movies":
                try:
                    result = tmdb_search(
                        **block.input,
                        excluded_genre_ids=excluded_genre_ids,
                    )
                    content = json.dumps(result, ensure_ascii=False)
                except Exception as e:
                    content = json.dumps({"error": str(e)})
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": content,
                })

        messages.append({"role": "user", "content": tool_results})

    raise HTTPException(status_code=500, detail="Tool loop exceeded max iterations")


def extract_json(text):
    if "```json" not in text:
        return None
    try:
        start = text.index("```json") + len("```json")
        end = text.index("```", start)
        return json.loads(text[start:end].strip())
    except (ValueError, json.JSONDecodeError):
        return None

# ───────────────────────── Endpoint ─────────────────────────

@app.post("/recommend", response_model=RecommendResponse)
def recommend(profile: QuizProfile):
    excluded_genre_ids = [TMDB_GENRE_IDS[g] for g in profile.exclusions if g in TMDB_GENRE_IDS]

    user_msg = build_profile_message(profile)
    messages = [{"role": "user", "content": user_msg}]

    try:
        text = run_conversation(messages, excluded_genre_ids)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    payload = extract_json(text)
    if not payload:
        raise HTTPException(status_code=500, detail="Model did not return valid JSON")

    # Enrich each recommendation with full TMDB details
    enriched = []
    for rec in payload.get("recommendations", []):
        details = tmdb_details(rec["tmdb_id"])
        if not details:
            continue
        # Safety net: if the model somehow picked a movie in an excluded genre, drop it
        if any(g.lower() in [ex.lower() for ex in profile.exclusions] for g in details["genres"]):
            # Try a rough name match
            for ex in profile.exclusions:
                if any(ex.lower() in g.lower() for g in details["genres"]):
                    continue
        enriched.append(MovieRecommendation(
            tmdb_id=rec["tmdb_id"],
            media_type=rec.get("media_type", "movie"),
            title=details["title"],
            year=details["year"],
            rating=details["rating"],
            match_score=rec.get("match_score", 85),
            overview=details["overview"],
            poster_url=details["poster_url"],
            backdrop_url=details["backdrop_url"],
            genres=details["genres"],
            runtime=details["runtime"],
            providers=details["providers"],
            why=rec["why"],
        ))

    if not enriched:
        raise HTTPException(status_code=500, detail="No valid recommendations produced")

    return RecommendResponse(
        recommendations=enriched,
        closing=payload.get("closing"),
    )


@app.get("/")
def root():
    return {"status": "ok", "service": "movie-match"}
