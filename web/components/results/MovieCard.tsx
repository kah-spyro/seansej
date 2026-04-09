"use client";

import Image from "next/image";
import { Recommendation, WatchProvider } from "@/types";

const LOGO_BASE = "https://image.tmdb.org/t/p/w45";

const PROVIDER_BY_NAME: Array<[RegExp, string]> = [
  [/netflix/i,                   "https://www.netflix.com/search?q={q}"],
  [/amazon prime|prime video/i,  "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={q}&ie=UTF8"],
  [/apple tv/i,                  "https://tv.apple.com/pl/search?term={q}"],
  [/\bhbo\b|^max$/i,             "https://www.hbomax.com/search?q={q}"],
  [/google play/i,               "https://play.google.com/store/search?q={q}&c=movies"],
  [/youtube/i,                   "https://www.youtube.com/results?search_query={q}"],
  [/rakuten/i,                   "https://rakuten.tv/pl/search?query={q}"],
];

function providerUrl(provider: WatchProvider, title: string, fallback: string): string {
  const q = encodeURIComponent(title);
  for (const [pattern, template] of PROVIDER_BY_NAME) {
    if (pattern.test(provider.name)) return template.replace("{q}", q);
  }
  return fallback;
}

/** TMDB rating (0-10) → visual score (0-100) for the gauge ring */
function ratingToScore(rating: number): number {
  return Math.round(Math.min(100, Math.max(0, rating * 10)));
}

const RING_R = 28;
const RING_CIRC = 2 * Math.PI * RING_R;

interface Props {
  rec: Recommendation;
}

function ProviderRow({
  label,
  providers,
  title,
  watchLink,
}: {
  label: string;
  providers: WatchProvider[];
  title: string;
  watchLink: string;
}) {
  if (providers.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-on-surface-variant/60 w-16 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {providers.map((p) => (
          <a
            key={p.id}
            href={providerUrl(p, title, watchLink)}
            target="_blank"
            rel="noopener noreferrer"
            title={p.name}
            className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-outline-variant/30 hover:ring-primary/50 transition shrink-0"
          >
            <Image
              src={`${LOGO_BASE}${p.logo}`}
              alt={p.name}
              fill
              className="object-cover"
              sizes="32px"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function MovieCard({ rec }: Props) {
  const score = ratingToScore(rec.rating);
  const dashOffset = RING_CIRC * (1 - score / 100);
  const hasAnyProviders =
    rec.stream.length > 0 || rec.rent.length > 0 || rec.buy.length > 0;

  return (
    <div className="relative bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/15 hover:border-primary/30 transition-all duration-500 group flex flex-col">
      {/* Poster */}
      <div className="relative">
        {rec.posterUrl ? (
          <div className="relative w-full aspect-[2/3]">
            <Image
              src={rec.posterUrl}
              alt={rec.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-full aspect-[2/3] bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-6xl">
              movie
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />

        {/* Match / rating gauge */}
        <div className="absolute top-4 right-4">
          <div className="relative w-16 h-16">
            <svg
              className="w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
              viewBox="0 0 64 64"
            >
              <circle
                cx="32"
                cy="32"
                r={RING_R}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-surface-container-highest"
              />
              <circle
                cx="32"
                cy="32"
                r={RING_R}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_CIRC}
                strokeDashoffset={dashOffset}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-headline text-sm font-black text-on-surface">
                {rec.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 flex flex-col gap-0 flex-1">
        {/* Genres / media type */}
        <p className="text-on-surface-variant text-xs uppercase tracking-widest font-bold mb-3">
          {rec.mediaType === "tv" ? "Series" : "Film"} · {rec.year}
        </p>

        {/* Title */}
        <h3 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight mb-4 leading-tight">
          {rec.title}
        </h3>

        {/* Why card */}
        <div className="bg-surface-container-high rounded-xl p-5 mb-4">
          <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-2">
            Why this pick
          </p>
          <p className="text-on-surface text-sm leading-relaxed">{rec.why}</p>
        </div>

        {/* Providers */}
        {hasAnyProviders && rec.watchLink && (
          <div className="flex flex-col gap-2 pt-1 border-t border-outline-variant/10">
            <ProviderRow
              label="Stream"
              providers={rec.stream}
              title={rec.title}
              watchLink={rec.watchLink}
            />
            <ProviderRow
              label="Rent"
              providers={rec.rent}
              title={rec.title}
              watchLink={rec.watchLink}
            />
            <ProviderRow
              label="Buy"
              providers={rec.buy}
              title={rec.title}
              watchLink={rec.watchLink}
            />
          </div>
        )}

        {!hasAnyProviders && rec.watchLink && (
          <a
            href={rec.watchLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-sm font-medium text-on-surface transition"
          >
            <span className="material-symbols-outlined text-base">play_circle</span>
            Where to watch
          </a>
        )}
      </div>
    </div>
  );
}
