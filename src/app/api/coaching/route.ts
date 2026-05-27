import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateCoachingSummary } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, org_id")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "manager") {
      return NextResponse.json({ error: "Only managers can generate coaching summaries" }, { status: 403 });
    }

    // Check org plan
    const { data: org } = await supabase
      .from("organizations")
      .select("plan")
      .eq("id", profile.org_id)
      .single();

    if (org?.plan !== "pro") {
      return NextResponse.json({ error: "AI coaching requires a Pro plan" }, { status: 402 });
    }

    const { reviewId } = await request.json();
    if (!reviewId) {
      return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    }

    // Fetch review with scores and employee info
    const { data: review } = await supabase
      .from("performance_reviews")
      .select("*, review_scores(*), employee:profiles!employee_id(full_name)")
      .eq("id", reviewId)
      .eq("org_id", profile.org_id)
      .single();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const employeeName = (review.employee as { full_name: string } | null)?.full_name ?? "the employee";
    const summary = await generateCoachingSummary(
      employeeName,
      review.period,
      review.review_scores ?? [],
      review.overall_notes
    );

    const serviceClient = await createServiceClient();
    const { data: updated, error: updateError } = await serviceClient
      .from("performance_reviews")
      .update({
        coaching_summary: summary,
        coaching_generated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
