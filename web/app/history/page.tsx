"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getHistory, HistoryEntry } from "@/lib/auth";
import { Recommendation } from "@/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MiniCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high">
      <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest">
        {rec.posterUrl ? (
          <Image
            src={rec.posterUrl}
            alt={rec.title}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant text-xl absolute inset-0 flex items-center justify-center">
            movie
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-on-surface font-bold text-sm truncate">{rec.title}</p>
        <p className="text-on-surface-variant text-xs">
          {rec.mediaType === "tv" ? "Series" : "Film"} · {rec.year}
        </p>
      </div>
    </div>
  );
}

function SessionCard({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant/15 overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-5 hover:bg-surface-container-high transition-colors text-left"
      >
        {/* Poster strip */}
        <div className="flex -space-x-3 flex-shrink-0">
          {entry.recommendations.slice(0, 3).map((rec) => (
            <div
              key={rec.tmdbId}
              className="relative w-10 h-14 rounded-lg overflow-hidden ring-2 ring-surface-container flex-shrink-0 bg-surface-container-highest"
            >
              {rec.posterUrl && (
                <Image
                  src={rec.posterUrl}
                  alt={rec.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-on-surface font-bold text-sm truncate">
            {entry.recommendations.map((r) => r.title).join(", ")}
          </p>
          <p className="text-on-surface-variant text-xs mt-0.5">
            {formatDate(entry.date)}
          </p>
        </div>

        <span
          className="material-symbols-outlined text-on-surface-variant text-lg flex-shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          expand_more
        </span>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-outline-variant/10">
          {entry.closing && (
            <p className="text-on-surface-variant text-sm italic py-4">
              &ldquo;{entry.closing}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {entry.recommendations.map((rec) => (
              <MiniCard key={rec.tmdbId} rec={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const { account, openModal } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (account) {
      setHistory(getHistory(account.id));
    }
  }, [account, hydrated]);

  if (!hydrated) return null;

  if (!account) {
    return (
      <main className="pt-32 pb-16 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined text-primary text-6xl mb-6 block">
            person
          </span>
          <h2 className="font-headline text-3xl font-extrabold mb-4 text-on-surface">
            Sign in to see your picks
          </h2>
          <p className="text-on-surface-variant mb-8">
            Create an account to keep a history of movies recommended for you.
          </p>
          <button
            onClick={openModal}
            className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container rounded-xl text-on-primary font-headline font-bold hover:scale-105 active:scale-95 transition-all"
            style={{ boxShadow: "0 4px 20px rgba(93,54,229,0.3)" }}
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold mb-2">
            Your profile
          </p>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">
            Recent Picks
          </h1>
          <p className="text-on-surface-variant mt-2">
            Movies and shows curated for{" "}
            <span className="text-primary font-bold">{account.username}</span>
          </p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-6 block opacity-30">
              movie
            </span>
            <p className="text-on-surface-variant mb-6">
              No picks yet. Take the quiz to get started.
            </p>
            <Link
              href="/quiz"
              className="inline-block px-8 py-4 bg-gradient-to-br from-primary to-primary-container rounded-xl text-on-primary font-headline font-bold hover:scale-105 active:scale-95 transition-all"
              style={{ boxShadow: "0 4px 20px rgba(93,54,229,0.3)" }}
            >
              Start the Quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <SessionCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
