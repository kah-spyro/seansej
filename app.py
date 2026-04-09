"""
Seansej — chatbot-kinoman z TMDB (wersja z formularzem)
Uruchomienie:
    pip install streamlit anthropic requests python-dotenv
    # utwórz .env z ANTHROPIC_API_KEY=... i TMDB_API_KEY=...
    streamlit run app.py
"""

import os
import json
import requests
import streamlit as st
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

# ───────────────────────── Konfiguracja ─────────────────────────

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
TMDB_API_KEY = "0a07a48844636b188b7a3fcb263b0614"
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG = "https://image.tmdb.org/t/p/w500"
MODEL = "claude-sonnet-4-5"
MAX_TOKENS = 1500

with open("system_prompt.md", "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()

client = Anthropic(api_key=ANTHROPIC_API_KEY)

# ───────────────────────── Opcje formularza ─────────────────────────

MOODS = {
    "😴 Odpocząć / zrelaksować się": "user chce się zrelaksować, nic ciężkiego, komfortowe oglądanie",
    "🤣 Pośmiać się": "user potrzebuje humoru i lekkości",
    "😭 Wzruszyć się / wypłakać": "user chce emocjonalnego, poruszającego przeżycia",
    "🤯 Coś wciągającego": "user chce być wciągnięty, nie móc przestać oglądać",
    "🧠 Coś mądrego do myślenia": "user chce czegoś intelektualnie stymulującego",
    "🌀 Uciec od rzeczywistości": "user chce eskapizmu, fantazji, innego świata",
}

CONTEXTS = {
    "🧑 Sam/sama": "ogląda sam",
    "💕 Z partnerem/partnerką": "ogląda z partnerem, film na wspólny wieczór",
    "👨‍👩‍👧 Z rodziną (w tym starsi/dzieci)": "ogląda z rodziną różnych pokoleń, musi być uniwersalne",
    "🍻 Ze znajomymi": "ogląda ze znajomymi, musi być dobre do wspólnego oglądania",
}

DURATIONS = {
    "🎬 Film ~1.5-2h": ("movie", "jeden film pełnometrażowy"),
    "🍿 Dłuższy film / epic (2.5h+)": ("movie", "user ma czas na długi film"),
    "📺 Serial — chcę wejść w coś nowego": ("tv", "user szuka serialu do rozpoczęcia"),
    "🎞️ Tylko 1-2 odcinki / krótki serial / miniserial": ("tv", "user chce krótki serial lub miniserial, max kilka odcinków"),
}

GENRES = [
    "Dramat", "Komedia", "Thriller", "Sci-fi", "Fantasy",
    "Horror", "Kryminał", "Romans", "Animacja", "Dokument",
    "Akcja", "Przygodowy", "Historyczny",
]

# ───────────────────────── Definicja narzędzia ─────────────────────────

TOOLS = [
    {
        "name": "search_movies",
        "description": (
            "Wyszukuje filmy lub seriale w bazie TMDB na podstawie kryteriów. "
            "Używaj tego narzędzia zawsze, gdy potrzebujesz realnych tytułów do rekomendacji. "
            "Możesz wywołać je kilka razy z różnymi parametrami, żeby zebrać różnorodną pulę kandydatów."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "Opis po angielsku tego, czego szukasz — np. 'slow meditative drama', "
                        "'cozy mystery series', 'feel-good comedy 90s'. TMDB używa tego jako keyword search."
                    ),
                },
                "media_type": {
                    "type": "string",
                    "enum": ["movie", "tv", "both"],
                },
                "min_year": {"type": "integer"},
                "max_year": {"type": "integer"},
                "min_rating": {
                    "type": "number",
                    "description": "Minimalna ocena TMDB (0-10), domyślnie 6.5.",
                },
            },
            "required": ["query", "media_type"],
        },
    }
]

# ───────────────────────── TMDB helpers ─────────────────────────

def tmdb_search(query, media_type, min_year=None, max_year=None, min_rating=6.5):
    results = []
    types = ["movie", "tv"] if media_type == "both" else [media_type]

    for t in types:
        r = requests.get(
            f"{TMDB_BASE}/search/{t}",
            params={
                "api_key": TMDB_API_KEY,
                "query": query,
                "language": "en-US",
                "include_adult": "false",
            },
            timeout=10,
        )
        if r.status_code != 200:
            continue

        for item in r.json().get("results", [])[:10]:
            year_str = item.get("release_date") or item.get("first_air_date") or ""
            year = int(year_str[:4]) if year_str[:4].isdigit() else None
            rating = item.get("vote_average", 0)
            votes = item.get("vote_count", 0)

            if min_year and year and year < min_year:
                continue
            if max_year and year and year > max_year:
                continue
            if rating < min_rating or votes < 50:
                continue

            results.append({
                "tmdb_id": item["id"],
                "media_type": t,
                "title": item.get("title") or item.get("name"),
                "year": year,
                "rating": round(rating, 1),
                "overview": (item.get("overview") or "")[:300],
            })

    return results[:15]


def tmdb_details(tmdb_id, media_type):
    r = requests.get(
        f"{TMDB_BASE}/{media_type}/{tmdb_id}",
        params={"api_key": TMDB_API_KEY, "language": "en-US"},
        timeout=10,
    )
    if r.status_code != 200:
        return None
    data = r.json()

    providers = []
    try:
        pr = requests.get(
            f"{TMDB_BASE}/{media_type}/{tmdb_id}/watch/providers",
            params={"api_key": TMDB_API_KEY},
            timeout=10,
        ).json()
        pl = pr.get("results", {}).get("PL", {})
        for p in pl.get("flatrate", []) or []:
            providers.append(p["provider_name"])
    except Exception:
        pass

    return {
        "title": data.get("title") or data.get("name"),
        "year": (data.get("release_date") or data.get("first_air_date") or "")[:4],
        "rating": round(data.get("vote_average", 0), 1),
        "overview": data.get("overview", ""),
        "poster_url": f"{TMDB_IMG}{data['poster_path']}" if data.get("poster_path") else None,
        "providers": providers,
    }

# ───────────────────────── Budowa promptu z formularza ─────────────────────────

def build_form_message(form):
    """Zamienia dane z formularza na strukturalną wiadomość dla Claude'a."""
    lines = ["Oto moje odpowiedzi z formularza:\n"]
    lines.append(f"**Nastrój / czego potrzebuję:** {form['mood_label']}")
    lines.append(f"  → kontekst: {form['mood_desc']}")
    lines.append(f"**Z kim oglądam:** {form['context_label']}")
    lines.append(f"  → kontekst: {form['context_desc']}")
    lines.append(f"**Ile czasu / format:** {form['duration_label']}")
    lines.append(f"  → kontekst: {form['duration_desc']}")

    if form.get("genres"):
        lines.append(f"**Lubię gatunki:** {', '.join(form['genres'])}")

    if form.get("liked"):
        lines.append(f"**Tytuł, który mi się ostatnio podobał:** {form['liked']}")

    if form.get("disliked"):
        lines.append(f"**Tytuł, który mi NIE podszedł:** {form['disliked']}")

    if form.get("extra"):
        lines.append(f"**Coś od siebie:** {form['extra']}")

    lines.append("\nZnajdź dla mnie 3 propozycje. Pamiętaj — używaj search_movies, uzasadnienia osobiste.")
    return "\n".join(lines)

# ───────────────────────── Pętla rozmowy ─────────────────────────

def run_conversation(messages):
    while True:
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
            return text, messages

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if block.name == "search_movies":
                try:
                    result = tmdb_search(**block.input)
                    content = json.dumps(result, ensure_ascii=False)
                except Exception as e:
                    content = json.dumps({"error": str(e)})
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": content,
                })

        messages.append({"role": "user", "content": tool_results})

# ───────────────────────── Parsowanie i renderowanie ─────────────────────────

def extract_recommendations(text):
    if "```json" not in text:
        return None, text
    try:
        start = text.index("```json") + len("```json")
        end = text.index("```", start)
        payload = json.loads(text[start:end].strip())
        intro = text[:text.index("```json")].strip()
        return payload, intro
    except (ValueError, json.JSONDecodeError):
        return None, text


def render_recommendations(payload):
    cols = st.columns(3)
    for col, rec in zip(cols, payload.get("recommendations", [])):
        with col:
            details = tmdb_details(rec["tmdb_id"], rec["media_type"])
            if not details:
                st.warning("Nie udało się pobrać detali.")
                continue
            if details["poster_url"]:
                st.image(details["poster_url"], use_container_width=True)
            st.markdown(f"**{details['title']}** ({details['year']})")
            st.caption(f"⭐ {details['rating']}/10")
            st.write(rec["why"])
            if details["providers"]:
                st.caption("📺 " + ", ".join(details["providers"][:3]))

    if payload.get("closing"):
        st.markdown(f"_{payload['closing']}_")

# ───────────────────────── UI ─────────────────────────

st.set_page_config(page_title="Movie Buddy", page_icon="🎬", layout="wide")
st.title("🎬 Movie Buddy")
st.caption("Twój znajomy kinoman. Odpowiedz na kilka pytań, a ja wybiorę coś dla ciebie.")

# Init state
if "stage" not in st.session_state:
    st.session_state.stage = "form"  # form → results → chat
if "messages" not in st.session_state:
    st.session_state.messages = []

# ─── STAGE 1: FORMULARZ ───
if st.session_state.stage == "form":
    with st.form("preferences"):
        st.subheader("Powiedz mi o sobie")

        mood_label = st.radio(
            "Czego dziś potrzebujesz?",
            options=list(MOODS.keys()),
            index=0,
        )

        col1, col2 = st.columns(2)
        with col1:
            context_label = st.radio(
                "Z kim oglądasz?",
                options=list(CONTEXTS.keys()),
                index=0,
            )
        with col2:
            duration_label = st.radio(
                "Na co masz czas?",
                options=list(DURATIONS.keys()),
                index=0,
            )

        genres = st.multiselect(
            "Ulubione gatunki (opcjonalnie, wybierz do 3)",
            options=GENRES,
            max_selections=3,
        )

        liked = st.text_input(
            "Tytuł, który ostatnio ci się podobał",
            placeholder="np. Ojciec chrzestny, Fleabag, Everything Everywhere All at Once...",
            help="To najważniejsze pytanie — daj mi konkretny tytuł.",
        )

        disliked = st.text_input(
            "Tytuł, który NIE podszedł (opcjonalnie)",
            placeholder="np. coś co ci się nie podobało mimo że było popularne",
        )

        extra = st.text_area(
            "Coś jeszcze? (opcjonalnie)",
            placeholder="np. 'nie chcę nic po angielsku', 'bez horrorów', 'coś z lat 90.'",
            height=80,
        )

        submitted = st.form_submit_button("🎬 Znajdź mi coś do obejrzenia", use_container_width=True, type="primary")

    if submitted:
        form_data = {
            "mood_label": mood_label,
            "mood_desc": MOODS[mood_label],
            "context_label": context_label,
            "context_desc": CONTEXTS[context_label],
            "duration_label": duration_label,
            "duration_desc": DURATIONS[duration_label][1],
            "genres": genres,
            "liked": liked,
            "disliked": disliked,
            "extra": extra,
        }
        user_msg = build_form_message(form_data)
        st.session_state.messages = [{"role": "user", "content": user_msg}]
        st.session_state.stage = "results"
        st.rerun()

# ─── STAGE 2/3: WYNIKI + OPCJONALNY CZAT ───
else:
    # Jeśli ostatnia wiadomość jest od usera, czas wywołać Claude'a
    last = st.session_state.messages[-1] if st.session_state.messages else None
    needs_response = (
        last
        and last["role"] == "user"
        and isinstance(last["content"], str)
    )

    if needs_response:
        with st.spinner("Szukam filmów dla ciebie..."):
            text, st.session_state.messages = run_conversation(st.session_state.messages)

    # Render całej historii (pomijając tool calls)
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            if isinstance(msg["content"], list):
                continue  # tool results
            # Pierwsza wiadomość (z formularza) — nie pokazujemy jej dosłownie
            if msg == st.session_state.messages[0]:
                continue
            with st.chat_message("user"):
                st.markdown(msg["content"])
        else:  # assistant
            if isinstance(msg["content"], list):
                text = "".join(b.text for b in msg["content"] if getattr(b, "type", None) == "text")
                if not text:
                    continue
                with st.chat_message("assistant"):
                    payload, intro = extract_recommendations(text)
                    if intro:
                        st.markdown(intro)
                    if payload:
                        render_recommendations(payload)
                    elif not intro:
                        st.markdown(text)

    # Pole do doprecyzowania
    st.divider()
    col_a, col_b = st.columns([3, 1])
    with col_a:
        followup = st.chat_input("Chcesz coś doprecyzować? Inne propozycje?")
    with col_b:
        if st.button("🔄 Zacznij od nowa", use_container_width=True):
            st.session_state.stage = "form"
            st.session_state.messages = []
            st.rerun()

    if followup:
        st.session_state.messages.append({"role": "user", "content": followup})
        st.rerun()
