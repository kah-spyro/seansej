# Seansej — Architecture & Developer Guide

## What this project is

**Seansej** ("Movie Match") is a Polish-language movie recommendation web app. The user answers 9 quiz questions about their mood, context, and preferences. The answers are sent to Claude (Anthropic), which uses TMDB's Discover API to find real movies/shows and returns 3 personalised picks with written justifications. After seeing results the user can continue chatting to refine recommendations.

There is also an older Streamlit prototype at `/app.py` with a different form layout — it is **not** the active implementation.

---

## Repository layout

```
/                          — project root
├── app.py                 — legacy Streamlit prototype (not active)
├── system_prompt.md       — Polish-language Claude persona used in app.py
├── requirements/
│   ├── questions_to_user.md  — quiz Q&A spec (9 questions, options, UI rules)
│   └── architecture.md       — this file
└── web/                   — Next.js 16 app (the active implementation)
    ├── app/
    │   ├── page.tsx           — landing page
    │   ├── quiz/page.tsx      — quiz shell (renders QuizShell component)
    │   ├── results/page.tsx   — results + chat follow-up (client component)
    │   └── api/
    │       ├── recommend/route.ts  — POST: quiz answers → recommendations
    │       └── chat/route.ts       — POST: follow-up message → new recommendations
    ├── components/
    │   ├── quiz/
    │   │   ├── QuizShell.tsx    — full quiz state machine (9 steps, animations)
    │   │   ├── OptionCard.tsx   — single selectable option button
    │   │   └── ProgressBar.tsx  — step x/9 progress indicator
    │   └── results/
    │       ├── MovieCard.tsx    — poster + title + year + rating + why + providers
    │       ├── ProfileSummary.tsx — 9 answers displayed as "Movie Profile"
    │       └── ChatFollowUp.tsx  — chat input + threaded follow-up display
    ├── lib/
    │   ├── questions.ts   — QUESTIONS array: all 9 quiz questions with options
    │   ├── prompt.ts      — buildPrompt(QuizAnswers) → Polish string for Claude
    │   ├── tmdb.ts        — TMDB Discover + details + PL watch providers
    │   └── claude.ts      — Anthropic tool_use loop + response parser
    ├── types/index.ts     — shared TypeScript interfaces
    ├── .env.local         — ANTHROPIC_API_KEY + TMDB_API_KEY (not committed)
    └── next.config.ts     — image domains whitelist (image.tmdb.org)
```

---

## Quiz flow (9 questions)

Defined in `lib/questions.ts`. Each question has `id` (matches `QuizAnswers` key), `question` text, `options[]` (label + value + emoji), optional `multiSelect`.

| Step | id | Question | Type |
|------|----|----------|------|
| 1 | mood | What are you in the mood for? | single |
| 2 | company | Who's watching with you? | single |
| 3 | duration | How much time do you have? | single |
| 4 | weight | How heavy should it be? | single |
| 5 | era | Old or new? | single |
| 6 | quality | What kind of pick? | single |
| 7 | setting | Where are you watching? | single |
| 8 | platform | Where will you stream it? | single |
| 9 | exclusions | Anything you want to avoid? | **multi-select** |

**UI rules:**
- Single-choice questions auto-advance 180 ms after selection.
- Q9 (exclusions) shows a manual Confirm / Skip button.
- Framer Motion `AnimatePresence mode="wait"` handles slide+fade transitions.
- Go back button available from step 2 onward.
- On confirm, answers are JSON-serialised and URL-encoded into `/results?q=...`.

---

## Data flow

```
QuizShell (client)
  └─ router.push("/results?q=<encoded QuizAnswers>")
        └─ ResultsContent (client)
              └─ fetch POST /api/recommend { answers }
                    └─ buildPrompt(answers)         lib/prompt.ts
                    └─ runConversation(messages)    lib/claude.ts
                          └─ Claude API (tool_use loop)
                                └─ search_movies tool → searchMovies()  lib/tmdb.ts
                                      └─ TMDB /discover/movie or /tv
                          └─ parseResponse(text) → ParsedResponse
                    └─ getDetails(tmdbId, mediaType)  lib/tmdb.ts
                          └─ TMDB /movie/{id} + /watch/providers (PL)
                    └─ return { recommendations[], closing, chatHistory }
```

Follow-up chat uses `POST /api/chat { message, history }` which appends the user message to the existing `chatHistory` and re-runs `runConversation`.

---

## TMDB integration (`lib/tmdb.ts`)

**Key design decision:** TMDB's `/search/movie` only searches by title — it returns 0 results for descriptive queries like "slow meditative drama". The app therefore uses **TMDB Discover** (`/discover/movie`, `/discover/tv`) which filters by genre IDs, year, rating, and sort order.

`searchMovies(params: SearchParams)` builds either:
- a **Discover URL** when no `keywords` field is provided (default, filter-based)
- a **Search URL** (`/search/movie`) when `keywords` is set (title lookup)

**Watch providers** are fetched for the Polish market (`PL`) via `/watch/providers`.

Image domain `image.tmdb.org` must be whitelisted in `next.config.ts` for `next/image` to work.

---

## Claude integration (`lib/claude.ts`)

- Model: `claude-sonnet-4-6`, `max_tokens: 2000`
- System prompt: Polish-language "kinoman znajomy" persona
- Single tool: `search_movies` with structured Discover parameters (genre IDs, year, rating, sortBy, optional keyword)
- The system prompt includes the full TMDB genre ID map so Claude knows which IDs to use
- Tool-use loop runs until `stop_reason !== "tool_use"`, then `parseResponse` extracts the JSON block
- `parseResponse` tries two formats: ` ```json...``` ` fenced block, then a raw `{...}` JSON fallback

**Expected Claude response format:**
```json
{
  "recommendations": [
    { "tmdb_id": 12345, "media_type": "movie", "why": "..." },
    ...
  ],
  "closing": "One warm sentence."
}
```

---

## Environment variables

| Variable | Where used | Notes |
|----------|-----------|-------|
| `ANTHROPIC_API_KEY` | `lib/claude.ts` | Server-side only |
| `TMDB_API_KEY` | `lib/tmdb.ts` | Server-side only. Key `0a07a48844636b188b7a3fcb263b0614` is pre-filled in `.env.local` |

---

## Current status (as of project start)

- **Quiz UI**: complete — 9 steps, animations, progress bar, back navigation
- **Results page**: complete — movie cards with poster/rating/providers, profile summary, chat follow-up input
- **API `/recommend`**: temporarily **mocked** (returns 3 hardcoded films, 800 ms delay). Real implementation exists and is tested — re-enable by replacing the body of `app/api/recommend/route.ts` with the Claude+TMDB call (see git history or the `TODO` comment in the file)
- **API `/chat`**: implemented with real Claude call (not mocked)
- **Auth**: not implemented — `userId?: string` param is stubbed in the API

---

## Planned features (not yet implemented)

- **Supabase auth** — email + Google OAuth
- **History** — save `quiz_profiles` and `recommendations` tables per user
- **Profile save button** — visible after results for logged-in users
- **Thumbs up/down** on recommendations

---

## Running locally

```bash
cd web
# fill in ANTHROPIC_API_KEY in .env.local (TMDB key is already there)
npm run dev       # http://localhost:3000
```

```bash
cd web
npm run build     # production build check
```
