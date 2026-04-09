"use client";

import Image from "next/image";
import { Recommendation, WatchProvider } from "@/types";

const LOGO_BASE = "https://image.tmdb.org/t/p/w45";

// Name-based mapping: normalized provider name → search URL ("{q}" = encodeURIComponent(title))
// Only providers with verified/working deep-link search URLs are included.
// Providers without a known search URL fall back to the TMDB watchLink.
//
// Verified:
//   Netflix          – https://www.netflix.com/search?q=       (SPA deep link, standard)
//   Amazon Prime     – https://www.primevideo.com/search/…     (confirmed returns results)
//   Apple TV / TV+   – https://tv.apple.com/pl/search?term=    (confirmed returns results)
//   Max / HBO Max    – https://www.hbomax.com/search?q=        (max.com → hbomax.com redirect)
//   Google Play      – https://play.google.com/store/search    (standard Google URL)
//   YouTube          – https://www.youtube.com/results         (standard YouTube URL)
//   Rakuten TV       – https://rakuten.tv/pl/search?query=     (SPA, URL confirmed to load)
//
// No working search URL found (fall back to TMDB watchLink):
//   Disney Plus, SkyShowtime, Player.pl, Polsat Box Go, Canal+, Mubi, Paramount+
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
    if (pattern.test(provider.name)) {
      return template.replace("{q}", q);
    }
  }
  return fallback;
}

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
      <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {providers.map((p) => (
          <a
            key={p.id}
            href={providerUrl(p, title, watchLink)}
            target="_blank"
            rel="noopener noreferrer"
            title={p.name}
            className="relative w-8 h-8 rounded-md overflow-hidden ring-1 ring-white/10 hover:ring-white/40 transition shrink-0"
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
  const hasAnyProviders =
    rec.stream.length > 0 || rec.rent.length > 0 || rec.buy.length > 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-white/5">
        {rec.posterUrl ? (
          <Image
            src={rec.posterUrl}
            alt={rec.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-white/20">
            🎬
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
          ⭐ {rec.rating.toFixed(1)}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-lg leading-tight">{rec.title}</h3>
          <p className="text-sm text-gray-400">
            {rec.year} · {rec.mediaType === "tv" ? "Serial" : "Film"}
          </p>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed flex-1">{rec.why}</p>

        {/* Watch providers */}
        {hasAnyProviders && rec.watchLink && (
          <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
            <ProviderRow label="Stream" providers={rec.stream} title={rec.title} watchLink={rec.watchLink} />
            <ProviderRow label="Wynajem" providers={rec.rent} title={rec.title} watchLink={rec.watchLink} />
            <ProviderRow label="Kup" providers={rec.buy} title={rec.title} watchLink={rec.watchLink} />
          </div>
        )}

        {/* Fallback when no providers but TMDB link exists */}
        {!hasAnyProviders && rec.watchLink && (
          <a
            href={rec.watchLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition"
          >
            ▶ Gdzie obejrzeć
          </a>
        )}
      </div>
    </div>
  );
}
