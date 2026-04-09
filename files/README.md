# Movie Match 🎬

AI-powered movie recommender with a 9-question cinematic quiz, built on top of a Google Stitch design system ("Cinema Noir / Editorial"). Backend uses Claude with tool use + TMDB; frontend is a single-page static HTML/JS app that preserves Stitch's visual language.

## Stack

- **Frontend**: Static HTML + Tailwind (CDN) + vanilla JS
- **Backend**: FastAPI + Anthropic SDK + TMDB API
- **AI**: Claude (Sonnet 4.5) with tool use loop

## Files

```
movie-match/
├── index.html          ← single-page shell (welcome, quiz, loading, results, error)
├── quiz-data.js        ← 9 questions with per-question grid layouts
├── app.js              ← state machine, rendering, API calls
├── backend.py          ← FastAPI with /recommend endpoint
├── system_prompt.md    ← Claude's curator persona
└── .env.example        ← template for API keys
```

## Setup

### 1. API keys

- **Anthropic**: https://console.anthropic.com → API Keys
- **TMDB**: https://www.themoviedb.org/settings/api → request a v3 key (free)

Copy `.env.example` to `.env` and fill in both.

### 2. Backend

```bash
pip install fastapi uvicorn anthropic requests python-dotenv
uvicorn backend:app --reload --port 8000
```

Verify it works:

```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "think",
    "company": "solo",
    "duration": "long",
    "weight": "heavy",
    "era": "classic",
    "quality": "hit",
    "setting": "tv",
    "platforms": [],
    "exclusions": ["horror"]
  }'
```

You should get back a JSON with 3 enriched recommendations.

### 3. Frontend

Serve the static files on any port (NOT `file://` — browsers block fetch from that scheme):

```bash
python -m http.server 3000
```

Open `http://localhost:3000` in the browser. Done.

## How it works

1. **Welcome screen** → click Start Quiz
2. **9-question quiz** — single-select questions auto-advance; last question (genre exclusions) is multi-select with Confirm + Skip
3. **Loading screen** — POST to `/recommend`
4. **Backend**:
   - Maps genre exclusions → TMDB genre IDs
   - Builds structured profile message for Claude
   - Runs tool-use loop: Claude calls `search_movies` multiple times with different queries
   - Backend filters results by `min_year`/`max_year`/`min_rating` AND excluded genres
   - Claude picks 3 and returns JSON with `tmdb_id` + `match_score` + `why`
   - Backend enriches each pick with full TMDB details (poster, runtime, providers, genres)
5. **Results screen** — 3 cards with poster, match gauge (circular progress), Why this pick, streaming providers

## Customization

### Editing the quiz
All questions live in `quiz-data.js`. Each has:
- `id` — matches backend field name
- `question` — HTML with highlighted word
- `type` — `single` (auto-advance) or `multi` (confirm button)
- `gridClass` — Tailwind grid classes for this question's layout
- `options[]` — each with `value`, `title`, `sub`, `icon` (Material Symbols), `cardClass` (per-card size)

To add a new question: append an object to the `QUIZ` array AND add the corresponding field to `QuizProfile` in `backend.py`, AND document it in `system_prompt.md`.

### Tweaking Claude's behavior
Edit `system_prompt.md` — it's loaded on backend startup. Restart `uvicorn` after changes (or use `--reload` which does it automatically).

### Changing the design
- Colors and tokens are in the Tailwind config inline in `index.html` (top `<script>` block)
- Custom CSS (glass cards, animations, loader) is in the `<style>` block right below
- The design follows Stitch's `cinema_noir/DESIGN.md` philosophy: no solid 1px borders for sectioning, glassmorphism, tonal layering, gradient CTAs

## Troubleshooting

- **CORS errors** → make sure you're serving frontend via `http://` not `file://`. Backend has `allow_origins=["*"]` so any origin works in dev.
- **"Model did not return valid JSON"** → Claude didn't emit the expected ```json block. Usually means system prompt needs reinforcing. Check backend logs for the raw response.
- **Empty recommendations** → your `min_rating` or `exclusions` may be too restrictive. Try a profile with fewer filters first.
- **TMDB 401** → wrong API key, or you used a v4 Bearer token instead of v3 API key. Go to TMDB settings and copy the "API Key (v3 auth)" value.
- **Slow first request** → first Claude call cold-starts; subsequent requests are faster.

## Demo tips for hackathon

- Pre-run one or two profiles before demo so TMDB posters are cached in your browser
- Keep the 9-question quiz brisk — auto-advance is your friend
- The match gauge animations catch the eye — make sure poster images load before you demo
- If the backend fails, the error screen has a retry button, so you can recover gracefully
