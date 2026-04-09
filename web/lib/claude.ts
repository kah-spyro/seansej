import Anthropic from "@anthropic-ai/sdk";
import { searchMovies } from "./tmdb";
import type { SearchParams } from "./tmdb";
import { ClaudeMessage } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Jesteś doświadczonym kinomanem i znajomym, do którego ludzie dzwonią z pytaniem "co obejrzeć". Nie jesteś algorytmem. Twoim celem jest znalezienie 3 filmów lub seriali idealnie dopasowanych do tego, czego użytkownik *naprawdę* potrzebuje dziś wieczorem.

## Jak działasz

Użytkownik wypełnił krótki formularz — dostajesz jego odpowiedzi jako pierwszą wiadomość. Na tej podstawie:

1. **Analizujesz kontekst** — nastrój, towarzystwo, czas, ciężar, era, jakość, platforma, wykluczenia.
2. **Wołasz \`search_movies\`** — możesz wywołać kilkukrotnie z różnymi parametrami (np. różne gatunki, różny sortBy) żeby zebrać zróżnicowaną pulę.
3. **Wybierasz 3 najlepsze tytuły** i piszesz osobiste uzasadnienia.

## Jak używać search_movies

Narzędzie używa TMDB Discover API — filtry, NIE wolnytekst. Kluczowe parametry:

- **genres** — tablica ID gatunków TMDB:
  Filmy: 28=Akcja, 12=Przygoda, 16=Animacja, 35=Komedia, 80=Kryminał, 99=Dokument, 18=Dramat, 10751=Familijny, 14=Fantasy, 27=Horror, 9648=Tajemnica, 10749=Romans, 878=Sci-Fi, 53=Thriller, 10752=Wojenny, 37=Western
  Seriale: 10759=Akcja, 35=Komedia, 80=Kryminał, 99=Dokument, 18=Dramat, 10765=Sci-Fi&Fantasy, 9648=Tajemnica
- **exclude_genres** — wykluczone gatunki (np. jeśli user nie chce horrorów: [27])
- **sort_by** — "popularity.desc" (hity), "vote_average.desc" (arcydzieła), "primary_release_date.desc" (najnowsze)
- **min_rating / max_rating** — zakres ocen (0-10). Guilty pleasure: max_rating ok. 7.0; hidden gem: min_rating 7.0 + sort vote_average.desc
- **keywords** — opcjonalnie: szukaj po TYTULE (np. "Parasite", "Breaking Bad") gdy znasz konkretny film

Przykłady:
- Relaksująca komedia, Netflix, najnowsza → genres:[35], sort_by:"popularity.desc", min_year:2018, min_rating:6.5
- Kryminał premium, klasyk → genres:[80,18], sort_by:"vote_average.desc", max_year:2000, min_rating:7.5
- Guilty pleasure horror → genres:[27], sort_by:"popularity.desc", max_rating:7.0

## Zasady twarde

- **Nigdy nie wymyślasz filmów.** Wszystkie tytuły z \`search_movies\`.
- **Zawsze dokładnie 3 rekomendacje**.
- **Uzasadnienia osobiste** — odwołują się do profilu usera.
- **Nie zadajesz pytań na starcie.**

## Format odpowiedzi — ZAWSZE dokładnie taki

\`\`\`json
{
  "recommendations": [
    {
      "tmdb_id": 12345,
      "media_type": "movie",
      "why": "Osobiste uzasadnienie 2-3 zdania."
    },
    {
      "tmdb_id": 67890,
      "media_type": "tv",
      "why": "..."
    },
    {
      "tmdb_id": 11111,
      "media_type": "movie",
      "why": "..."
    }
  ],
  "closing": "Krótki, ciepły komentarz — jedno zdanie."
}
\`\`\`

## Ton

Ciepły, konkretny, bez ściemy. Po polsku.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_movies",
    description:
      "Wyszukuje filmy/seriale w TMDB Discover API na podstawie filtrów. Wywołuj wielokrotnie z różnymi parametrami dla zróżnicowanej puli.",
    input_schema: {
      type: "object" as const,
      properties: {
        media_type: {
          type: "string",
          enum: ["movie", "tv", "both"],
          description: "Typ mediów.",
        },
        genres: {
          type: "array",
          items: { type: "integer" },
          description: "TMDB genre IDs do uwzględnienia.",
        },
        exclude_genres: {
          type: "array",
          items: { type: "integer" },
          description: "TMDB genre IDs do wykluczenia.",
        },
        sort_by: {
          type: "string",
          enum: [
            "popularity.desc",
            "vote_average.desc",
            "vote_count.desc",
            "primary_release_date.desc",
          ],
          description: "Sortowanie. Domyślnie popularity.desc.",
        },
        min_year: { type: "integer", description: "Rok produkcji od." },
        max_year: { type: "integer", description: "Rok produkcji do." },
        min_rating: { type: "number", description: "Minimalna ocena TMDB (0-10)." },
        max_rating: { type: "number", description: "Maksymalna ocena (np. 7.0 na guilty pleasure)." },
        keywords: {
          type: "string",
          description: "Opcjonalnie: szukaj po konkretnym TYTULE zamiast Discover.",
        },
      },
      required: ["media_type"],
    },
  },
];

export interface ParsedResponse {
  recommendations: Array<{
    tmdb_id: number;
    media_type: "movie" | "tv";
    why: string;
  }>;
  closing: string;
}

function parseResponse(text: string): ParsedResponse | null {
  // Try with code fence first
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch { /* fall through */ }
  }
  // Try to find raw JSON object
  const raw = text.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
  if (raw) {
    try {
      return JSON.parse(raw[0]);
    } catch { /* fall through */ }
  }
  return null;
}

export async function runConversation(
  messages: ClaudeMessage[]
): Promise<{ text: string; messages: ClaudeMessage[]; parsed: ParsedResponse | null }> {
  const mutableMessages = [...messages];

  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: mutableMessages,
    });

    mutableMessages.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      return { text, messages: mutableMessages, parsed: parseResponse(text) };
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      if (block.name === "search_movies") {
        const input = block.input as SearchParams;
        try {
          const results = await searchMovies(input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(results),
          });
        } catch (e) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify({ error: String(e) }),
          });
        }
      }
    }

    mutableMessages.push({ role: "user", content: toolResults });
  }
}
