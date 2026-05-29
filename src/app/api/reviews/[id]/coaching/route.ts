import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ReviewCategory } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, business_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "manager") {
      return NextResponse.json({ error: "Only managers can generate coaching summaries" }, { status: 403 });
    }

    const { data: review } = await supabase
      .from("reviews")
      .select("*, review_categories(*), employee:profiles!employee_id(full_name)")
      .eq("id", reviewId)
      .eq("business_id", profile.business_id)
      .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const employeeName =
      (review.employee as { full_name: string } | null)?.full_name ?? "the employee";
    const categories = (review.review_categories ?? []) as ReviewCategory[];

    const scoreLines = categories.map((c) => {
      const stars = "★".repeat(c.star_rating) + "☆".repeat(5 - c.star_rating);
      return `- ${c.category_name}: ${stars} (${c.percentage_score}%)${c.notes ? ` — "${c.notes}"` : ""}`;
    });

    const avgPct =
      categories.length > 0
        ? Math.round(categories.reduce((s, c) => s + c.percentage_score, 0) / categories.length)
        : 0;

    const prompt = `You are an expert performance coach. Write a personalized, constructive coaching summary for ${employeeName} based on their ${review.period ?? "recent"} performance review.

Performance scores (overall average: ${avgPct}%):
${scoreLines.join("\n")}

Structure your response with exactly these three sections using bold headers:
**Strengths** — 2–3 specific strengths based on the highest-rated categories
**Growth Areas** — 2–3 actionable improvement areas for lower-rated categories
**90-Day Action Plan** — 3 concrete, measurable steps for the next quarter

Tone: warm, encouraging, specific. Address the employee directly as "you". Total length: 250–350 words.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected Anthropic response type");

    const summary = content.text;

    const service = await createServiceClient();
    await service.from("reviews").update({ ai_summary: summary }).eq("id", reviewId);

    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
