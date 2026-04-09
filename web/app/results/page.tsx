"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { QuizAnswers, Recommendation, ClaudeMessage } from "@/types";
import MovieCard from "@/components/results/MovieCard";
import ProfileSummary from "@/components/results/ProfileSummary";
import ChatFollowUp, { ChatThread } from "@/components/results/ChatFollowUp";

interface ChatEntry {
  role: "user" | "assistant";
  text?: string;
  recs: Recommendation[];
  closing: string;
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [closing, setClosing] = useState("");
  const [chatHistory, setChatHistory] = useState<ClaudeMessage[]>([]);
  const [thread, setThread] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = params.get("q");
    if (!raw) {
      router.replace("/quiz");
      return;
    }

    let parsed: QuizAnswers;
    try {
      parsed = JSON.parse(decodeURIComponent(raw));
    } catch {
      router.replace("/quiz");
      return;
    }

    setAnswers(parsed);

    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: parsed }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        setRecs(data.recommendations);
        setClosing(data.closing);
        setChatHistory(data.chatHistory);
      })
      .catch(() => setError("Something went wrong. Please try again."))
      .finally(() => setLoading(false));
  }, [params, router]);

  function handleNewRecs(
    newRecs: Recommendation[],
    newClosing: string,
    newHistory: ClaudeMessage[]
  ) {
    // Grab the last user message text from the diff
    const lastUserMsg = newHistory
      .slice(chatHistory.length)
      .find((m) => m.role === "user" && typeof m.content === "string");

    setThread((prev) => [
      ...prev,
      {
        role: "user",
        text: lastUserMsg?.content as string | undefined,
        recs: [],
        closing: "",
      },
      { role: "assistant", recs: newRecs, closing: newClosing },
    ]);
    setChatHistory(newHistory);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="text-4xl animate-pulse">🎬</div>
        <p className="text-gray-400 text-sm">Finding your perfect films…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6 px-6">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.push("/quiz")}
          className="px-6 py-3 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your picks 🎬</h1>
          <button
            onClick={() => router.push("/quiz")}
            className="text-sm text-gray-400 hover:text-white transition px-4 py-2 rounded-xl border border-white/10 hover:border-white/30"
          >
            Start over
          </button>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {recs.map((rec) => (
            <MovieCard key={rec.tmdbId} rec={rec} />
          ))}
        </div>

        {closing && (
          <p className="text-gray-400 text-sm italic">{closing}</p>
        )}

        {/* Profile summary */}
        {answers && <ProfileSummary answers={answers} />}

        {/* Follow-up chat thread */}
        <ChatThread history={thread} />

        {/* Chat input */}
        <ChatFollowUp
          chatHistory={chatHistory}
          onNewRecommendations={handleNewRecs}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <div className="text-4xl animate-pulse">🎬</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
