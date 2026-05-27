import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ReviewCategory } from "@/lib/types";
import { REVIEW_CATEGORIES } from "@/lib/types";

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
      return NextResponse.json({ error: "Only managers can submit reviews" }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, period, overallNotes, scores } = body as {
      employeeId: string;
      period: string;
      overallNotes?: string;
      scores: Array<{ category: ReviewCategory; rating: number; notes?: string }>;
    };

    if (!employeeId || !period || !scores || scores.length !== 5) {
      return NextResponse.json({ error: "All 5 category scores are required" }, { status: 400 });
    }

    // Validate categories
    const validCategories = REVIEW_CATEGORIES.map((c) => c.key);
    const submittedCategories = scores.map((s) => s.category);
    const missingCategories = validCategories.filter((c) => !submittedCategories.includes(c));
    if (missingCategories.length > 0) {
      return NextResponse.json({ error: `Missing categories: ${missingCategories.join(", ")}` }, { status: 400 });
    }

    // Verify employee is in same org
    const { data: employee } = await supabase
      .from("profiles")
      .select("id, org_id")
      .eq("id", employeeId)
      .eq("org_id", profile.org_id)
      .single();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found in your organization" }, { status: 404 });
    }

    const serviceClient = await createServiceClient();

    // Create review
    const { data: review, error: reviewError } = await serviceClient
      .from("performance_reviews")
      .insert({
        org_id: profile.org_id,
        employee_id: employeeId,
        manager_id: user.id,
        period,
        overall_notes: overallNotes ?? null,
      })
      .select()
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: reviewError?.message ?? "Failed to create review" }, { status: 500 });
    }

    // Insert scores
    const scoreInserts = scores.map((s) => ({
      review_id: review.id,
      category: s.category,
      rating: s.rating,
      notes: s.notes ?? null,
    }));

    const { error: scoresError } = await serviceClient
      .from("review_scores")
      .insert(scoreInserts);

    if (scoresError) {
      await serviceClient.from("performance_reviews").delete().eq("id", review.id);
      return NextResponse.json({ error: scoresError.message }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    let query = supabase
      .from("performance_reviews")
      .select("*, review_scores(*), employee:profiles!employee_id(full_name, email, title), manager:profiles!manager_id(full_name)")
      .order("created_at", { ascending: false });

    if (profile?.role === "manager") {
      query = query.eq("org_id", profile.org_id!);
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
    } else {
      // Employee can only see their own
      query = query.eq("employee_id", user.id);
    }

    const { data: reviews, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(reviews ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
