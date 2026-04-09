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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="text-center px-6">
        <div className="mb-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/30 border border-outline-variant/15 glass-card">
          <span
            className="material-symbols-outlined text-tertiary text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="text-on-secondary-container text-xs uppercase tracking-widest font-semibold">
            Curating Your Picks
          </span>
        </div>

        <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-on-surface tracking-tight mb-6">
          Analyzing your{" "}
          <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent italic">
            cinematic profile
          </span>
        </h2>

        <p className="text-on-surface-variant text-lg mb-12 max-w-lg mx-auto">
          The Curator is reviewing thousands of films to find your perfect
          match…
        </p>

        <div className="flex items-center justify-center gap-3">
          <div className="loader-dot w-3 h-3 rounded-full bg-primary" />
          <div className="loader-dot w-3 h-3 rounded-full bg-primary" />
          <div className="loader-dot w-3 h-3 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-6 block">
          error
        </span>
        <h2 className="font-headline text-3xl font-extrabold mb-4 text-on-surface">
          Something went wrong
        </h2>
        <p className="text-on-surface-variant mb-8">{message}</p>
        <button
          onClick={onRetry}
          className="persona-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-widest px-10 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all"
          style={{ boxShadow: "0 4px 20px rgba(93,54,229,0.3)" }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
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

  function fetchRecommendations(parsed: QuizAnswers) {
    setLoading(true);
    setError(null);

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
      .catch(() => setError("Could not fetch recommendations."))
      .finally(() => setLoading(false));
  }

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
    fetchRecommendations(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, router]);

  function handleNewRecs(
    newRecs: Recommendation[],
    newClosing: string,
    newHistory: ClaudeMessage[]
  ) {
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

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => answers && fetchRecommendations(answers)}
      />
    );
  }

  return (
    <main className="pt-24 pb-16 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/30 border border-outline-variant/15 glass-card">
            <span
              className="material-symbols-outlined text-tertiary text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="text-on-secondary-container text-xs uppercase tracking-widest font-semibold">
              Your Curated Matches
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight mb-4 text-glow">
            Three films,{" "}
            <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent italic">
              chosen for tonight
            </span>
          </h1>
          {closing && (
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
              {closing}
            </p>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {recs.map((rec) => (
            <MovieCard key={rec.tmdbId} rec={rec} />
          ))}
        </div>

        {/* Profile summary */}
        {answers && <ProfileSummary answers={answers} />}

        {/* Chat thread */}
        <ChatThread history={thread} />

        {/* Chat input */}
        <ChatFollowUp
          chatHistory={chatHistory}
          onNewRecommendations={handleNewRecs}
        />
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResultsContent />
    </Suspense>
  );
}
