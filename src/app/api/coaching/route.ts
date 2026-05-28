import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateCoachingSummary } from "@/lib/anthropic";
import type { ReviewCategory } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
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

    const { data: business } = await supabase
      .from("businesses")
      .select("plan")
      .eq("id", profile.business_id)
      .single();

    if (business?.plan !== "pro") {
      return NextResponse.json({ error: "AI coaching requires a Pro plan" }, { status: 402 });
    }

    const { reviewId } = await request.json();
    if (!reviewId) return NextResponse.json({ error: "reviewId is required" }, { status: 400 });

    const { data: review } = await supabase
      .from("reviews")
      .select("*, review_categories(*), employee:profiles!employee_id(full_name)")
      .eq("id", reviewId)
      .eq("business_id", profile.business_id)
      .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const employeeName =
      (review.employee as { full_name: string } | null)?.full_name ?? "the employee";

    // Map review_categories to the shape generateCoachingSummary expects
    const scores = ((review.review_categories ?? []) as ReviewCategory[]).map((c) => ({
      id:        c.id,
      review_id: c.review_id,
      category:  c.category_name as never,
      rating:    c.star_rating,
      notes:     c.notes,
      created_at: c.created_at,
    }));

    const summary = await generateCoachingSummary(
      employeeName,
      review.period,
      scores,
      review.overall_notes
    );

    const service = await createServiceClient();
    const { data: updated, error: updateError } = await service
      .from("reviews")
      .update({ ai_summary: summary })
      .eq("id", reviewId)
      .select()
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
