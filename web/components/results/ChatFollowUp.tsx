"use client";

import { useState } from "react";
import { ClaudeMessage, Recommendation } from "@/types";
import MovieCard from "./MovieCard";

interface Props {
  chatHistory: ClaudeMessage[];
  onNewRecommendations: (recs: Recommendation[], closing: string, history: ClaudeMessage[]) => void;
}

export default function ChatFollowUp({ chatHistory, onNewRecommendations }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: chatHistory }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      onNewRecommendations(data.recommendations, data.closing, data.chatHistory);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-on-surface-variant mb-3">
        Want different picks? Ask away.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="e.g. something older, no subtitles, more action…"
          disabled={loading}
          className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant/40 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="persona-gradient px-5 py-3 rounded-xl font-semibold text-sm text-on-primary hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}

export function ChatThread({
  history,
}: {
  history: Array<{ role: string; recs: Recommendation[]; closing: string; text?: string }>;
}) {
  if (history.length === 0) return null;

  return (
    <div className="mt-10 space-y-10">
      {history.map((entry, i) => (
        <div key={i}>
          {entry.role === "user" && entry.text && (
            <div className="mb-4">
              <span className="text-xs text-on-surface-variant uppercase tracking-widest block mb-1">You</span>
              <p className="text-on-surface/80 text-sm">{entry.text}</p>
            </div>
          )}
          {entry.role === "assistant" && entry.recs.length > 0 && (
            <div>
              <span className="text-xs text-on-surface-variant uppercase tracking-widest block mb-4">New picks</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {entry.recs.map((rec) => (
                  <MovieCard key={rec.tmdbId} rec={rec} />
                ))}
              </div>
              {entry.closing && (
                <p className="text-on-surface-variant text-sm italic mt-4">{entry.closing}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
