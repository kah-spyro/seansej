import { NextRequest, NextResponse } from "next/server";
import { runConversation } from "@/lib/claude";
import { getDetails } from "@/lib/tmdb";
import { ClaudeMessage, Recommendation } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      history,
    }: { message: string; history: ClaudeMessage[] } = await req.json();

    if (!message || !history) {
      return NextResponse.json({ error: "Missing message or history" }, { status: 400 });
    }

    const messages: ClaudeMessage[] = [
      ...history,
      { role: "user", content: message },
    ];

    const { parsed, messages: updatedHistory } = await runConversation(messages);

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
      chatHistory: updatedHistory,
    });
  } catch (e) {
    console.error("[/api/chat]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
