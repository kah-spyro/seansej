import type { WatchProvider } from "@/types";

const TMDB_KEY = process.env.TMDB_API_KEY!;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

export interface TmdbSearchResult {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  year: number | null;
  rating: number;
  overview: string;
}

export interface TmdbDetails {
  title: string;
  year: string;
  rating: number;
  overview: string;
  posterUrl: string | null;
  stream: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  watchLink: string | null;
}

export interface SearchParams {
  /** Free-text title keyword — optional, uses /search when provided */
  keywords?: string;
  /** TMDB genre IDs to include */
  genres?: number[];
  /** TMDB genre IDs to exclude */
  exclude_genres?: number[];
  media_type: "movie" | "tv" | "both";
  min_year?: number;
  max_year?: number;
  min_rating?: number;
  max_rating?: number;
  /** Defaults to "popularity.desc" */
  sort_by?: string;
}

// TMDB genre IDs for reference (included in tool description for Claude)
// Movie: 28 Action, 12 Adventure, 16 Animation, 35 Comedy, 80 Crime,
//        99 Documentary, 18 Drama, 10751 Family, 14 Fantasy, 36 History,
//        27 Horror, 10402 Music, 9648 Mystery, 10749 Romance, 878 Sci-Fi,
//        53 Thriller, 10752 War, 37 Western
// TV:    10759 Action&Adventure, 16 Animation, 35 Comedy, 80 Crime,
//        99 Documentary, 18 Drama, 10751 Family, 10765 Sci-Fi&Fantasy,
//        9648 Mystery, 37 Western

type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  overview: string;
};

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

function buildDiscoverUrl(type: "movie" | "tv", p: SearchParams): string {
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    language: "en-US",
    include_adult: "false",
    sort_by: p.sort_by ?? "popularity.desc",
    "vote_count.gte": "80",
  });

  if (p.min_rating) params.set("vote_average.gte", String(p.min_rating));
  if (p.max_rating) params.set("vote_average.lte", String(p.max_rating));
  if (p.genres?.length) params.set("with_genres", p.genres.join(","));
  if (p.exclude_genres?.length) params.set("without_genres", p.exclude_genres.join(","));

  const dateFrom = type === "movie" ? "primary_release_date" : "first_air_date";
  if (p.min_year) params.set(`${dateFrom}.gte`, `${p.min_year}-01-01`);
  if (p.max_year) params.set(`${dateFrom}.lte`, `${p.max_year}-12-31`);

  return `${BASE}/discover/${type}?${params}`;
}

function buildSearchUrl(type: "movie" | "tv", keywords: string): string {
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    language: "en-US",
    include_adult: "false",
    query: keywords,
  });
  return `${BASE}/search/${type}?${params}`;
}

function parseItem(item: TmdbItem, type: "movie" | "tv", p: SearchParams): TmdbSearchResult | null {
  const yearStr = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4);
  const year = yearStr ? parseInt(yearStr) : null;
  const rating = item.vote_average ?? 0;
  const votes = item.vote_count ?? 0;
  const minRating = p.min_rating ?? 6.0;

  if (p.min_year && year && year < p.min_year) return null;
  if (p.max_year && year && year > p.max_year) return null;
  if (rating < minRating || votes < 50) return null;

  return {
    tmdb_id: item.id,
    media_type: type,
    title: (item.title || item.name) ?? "Unknown",
    year,
    rating: Math.round(rating * 10) / 10,
    overview: (item.overview ?? "").slice(0, 300),
  };
}

export async function searchMovies(p: SearchParams): Promise<TmdbSearchResult[]> {
  const types: Array<"movie" | "tv"> = p.media_type === "both" ? ["movie", "tv"] : [p.media_type];
  const results: TmdbSearchResult[] = [];

  for (const type of types) {
    const url = p.keywords
      ? buildSearchUrl(type, p.keywords)
      : buildDiscoverUrl(type, p);

    try {
      const data = (await fetchJson(url)) as { results?: TmdbItem[] };
      for (const item of (data.results ?? []).slice(0, 15)) {
        const parsed = parseItem(item, type, p);
        if (parsed) results.push(parsed);
      }
    } catch (e) {
      console.error(`[TMDB] search failed for ${type}:`, e);
    }
  }

  return results.slice(0, 15);
}

export async function getDetails(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<TmdbDetails | null> {
  try {
    const url = `${BASE}/${mediaType}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`;
    const data = (await fetchJson(url)) as {
      title?: string;
      name?: string;
      release_date?: string;
      first_air_date?: string;
      vote_average?: number;
      overview?: string;
      poster_path?: string;
    };

    const { stream, rent, buy, link: watchLink } = await getProviders(tmdbId, mediaType);

    return {
      title: (data.title || data.name) ?? "Unknown",
      year:
        data.release_date?.slice(0, 4) ||
        data.first_air_date?.slice(0, 4) ||
        "",
      rating: Math.round((data.vote_average ?? 0) * 10) / 10,
      overview: data.overview ?? "",
      posterUrl: data.poster_path ? `${IMG}${data.poster_path}` : null,
      stream,
      rent,
      buy,
      watchLink,
    };
  } catch {
    return null;
  }
}

type RawProvider = { provider_id: number; provider_name: string; logo_path: string };

function parseProviders(arr: RawProvider[] | undefined): WatchProvider[] {
  return (arr ?? []).slice(0, 5).map((p) => ({
    id: p.provider_id,
    name: p.provider_name,
    logo: p.logo_path,
  }));
}

async function getProviders(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<{ stream: WatchProvider[]; rent: WatchProvider[]; buy: WatchProvider[]; link: string | null }> {
  try {
    const url = `${BASE}/${mediaType}/${tmdbId}/watch/providers?api_key=${TMDB_KEY}`;
    const data = (await fetchJson(url)) as {
      results?: {
        PL?: {
          link?: string;
          flatrate?: RawProvider[];
          rent?: RawProvider[];
          buy?: RawProvider[];
        };
      };
    };
    const pl = data.results?.PL;
    return {
      stream: parseProviders(pl?.flatrate),
      rent: parseProviders(pl?.rent),
      buy: parseProviders(pl?.buy),
      link: pl?.link ?? null,
    };
  } catch {
    return { stream: [], rent: [], buy: [], link: null };
  }
}
