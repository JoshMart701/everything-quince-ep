import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReviewCategory } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json() as { reviewId?: string };
    const { reviewId } = body;
    if (!reviewId) return NextResponse.json({ error: "reviewId is required" }, { status: 400 });

    const { data: review } = await supabase
      .from("reviews")
      .select(
        "*, review_categories(*), employee:profiles!employee_id(full_name, email), business:businesses!business_id(name)"
      )
      .eq("id", reviewId)
      .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const employee = review.employee as { full_name: string; email: string } | null;
    const business = review.business as { name: string } | null;
    const categories = (review.review_categories ?? []) as ReviewCategory[];

    const overallPct =
      review.overall_score !== null
        ? Math.round((review.overall_score as number) * 20)
        : null;

    const emailLines = [
      `To: ${employee?.email ?? "unknown"}`,
      `Subject: Your ${review.period ?? "latest"} performance review from ${business?.name ?? "your manager"} is ready`,
      ``,
      `Hi ${employee?.full_name ?? "there"},`,
      ``,
      `Your manager at ${business?.name} has submitted your ${review.period ?? "latest"} performance review.`,
      ``,
      `Overall Score: ${overallPct !== null ? `${overallPct}%` : "—"}`,
      ``,
      `Category Breakdown:`,
      ...categories.map(
        (c) => `  • ${c.category_name}: ${c.percentage_score}% (${c.status.replace("_", " ")})`
      ),
      ``,
      review.ai_summary
        ? `AI Coaching Summary:\n${review.ai_summary}`
        : "(No AI coaching summary generated.)",
      ``,
      `Log in to view your full review: https://standpointapp.com/employee/dashboard`,
    ];

    console.log("[send-review-email] Would send:\n", emailLines.join("\n"));

    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
