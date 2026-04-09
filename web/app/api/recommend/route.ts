import { NextRequest, NextResponse } from "next/server";
import { runConversation } from "@/lib/claude";
import { getDetails } from "@/lib/tmdb";
import { buildPrompt } from "@/lib/prompt";
import { QuizAnswers, Recommendation } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { answers }: { answers: QuizAnswers } = await req.json();

    if (!answers) {
      return NextResponse.json({ error: "Missing answers" }, { status: 400 });
    }

    const messages = [{ role: "user" as const, content: buildPrompt(answers) }];

    const { parsed, messages: chatHistory } = await runConversation(messages);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse recommendations" },
        { status: 500 }
      );
    }

    const recommendations: Recommendation[] = await Promise.all(
      parsed.recommendations.map(async (r) => {
        const details = await getDetails(r.tmdb_id, r.media_type);
        return {
          tmdbId: r.tmdb_id,
          mediaType: r.media_type,
          why: r.why,
          title: details?.title ?? "Unknown",
          year: details?.year ?? "",
          rating: details?.rating ?? 0,
          posterUrl: details?.posterUrl ?? null,
          stream: details?.stream ?? [],
          rent: details?.rent ?? [],
          buy: details?.buy ?? [],
          watchLink: details?.watchLink ?? null,
        };
      })
    );

    return NextResponse.json({
      recommendations,
      closing: parsed.closing,
      chatHistory,
    });
  } catch (e) {
    console.error("[/api/recommend]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
