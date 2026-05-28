import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { deriveStatus, derivePercentage } from "@/lib/types";

interface CategoryInput {
  category_name: string;
  star_rating: number;
  notes?: string;
}

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
      return NextResponse.json({ error: "Only managers can submit reviews" }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, period, overallNotes, categories } = body as {
      employeeId: string;
      period: string;
      overallNotes?: string;
      categories: CategoryInput[];
    };

    if (!employeeId || !period || !categories || categories.length === 0) {
      return NextResponse.json({ error: "Employee, period, and categories are required" }, { status: 400 });
    }

    // Validate employee is in same business
    const { data: employee } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", employeeId)
      .eq("business_id", profile.business_id)
      .single();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found in your business" }, { status: 404 });
    }

    // Compute overall score (average star rating)
    const avgStars = categories.reduce((s, c) => s + c.star_rating, 0) / categories.length;
    const overallScore = Math.round(avgStars * 100) / 100;

    const service = await createServiceClient();

    const { data: review, error: reviewError } = await service
      .from("reviews")
      .insert({
        business_id:   profile.business_id,
        manager_id:    profile.id,
        employee_id:   employeeId,
        period,
        overall_score: overallScore,
        overall_notes: overallNotes ?? null,
      })
      .select()
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: reviewError?.message ?? "Failed to create review" }, { status: 500 });
    }

    const categoryRows = categories.map((c) => ({
      review_id:        review.id,
      category_name:    c.category_name,
      star_rating:      c.star_rating,
      percentage_score: derivePercentage(c.star_rating),
      status:           deriveStatus(c.star_rating),
      notes:            c.notes ?? null,
    }));

    const { error: catError } = await service.from("review_categories").insert(categoryRows);

    if (catError) {
      await service.from("reviews").delete().eq("id", review.id);
      return NextResponse.json({ error: catError.message }, { status: 500 });
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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, business_id")
      .eq("user_id", user.id)
      .single();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    let query = supabase
      .from("reviews")
      .select(
        "*, review_categories(*), employee:profiles!employee_id(id, full_name, avatar_initials), manager:profiles!manager_id(id, full_name)"
      )
      .order("created_at", { ascending: false });

    if (profile?.role === "manager") {
      query = query.eq("business_id", profile.business_id!);
      if (employeeId) query = query.eq("employee_id", employeeId);
    } else {
      query = query.eq("employee_id", profile!.id);
    }

    const { data: reviews, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(reviews ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
