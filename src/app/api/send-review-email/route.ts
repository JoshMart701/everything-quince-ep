// ─────────────────────────────────────────────────────────────────
// STANDPOINT — Send Review Email API Route
// File: app/api/send-review-email/route.ts
// ─────────────────────────────────────────────────────────────────

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import ReviewEmail from "@/emails/review-email";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role to bypass RLS
);

export async function POST(req: NextRequest) {
  try {
    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    }

    // ── 1. Fetch review + all related data ──────────────────────────
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select(`
        id,
        created_at,
        overall_score,
        ai_summary,
        employee:profiles!reviews_employee_id_fkey (
          full_name,
          email
        ),
        manager:profiles!reviews_manager_id_fkey (
          full_name
        ),
        business:businesses (
          name
        ),
        review_categories (
          category_name,
          star_rating,
          percentage_score,
          status,
          notes
        )
      `)
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      console.error("Review fetch error:", reviewError);
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // ── 2. Shape the data ──────────────────────────────────────────
    const categoryIconMap: Record<string, string> = {
      Performance:   "⚡",
      Attitude:      "🤝",
      Reliability:   "🎯",
      Growth:        "📈",
      Communication: "💬",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = (review.review_categories as any[]).map((cat) => ({
      name:       cat.category_name,
      icon:       categoryIconMap[cat.category_name] ?? "•",
      stars:      cat.star_rating,
      percentage: cat.percentage_score,
      status:     cat.status,
      notes:      cat.notes ?? "",
    }));

    const overallScore  = review.overall_score as number;
    const overallStatus = overallScore >= 70 ? "strong" : overallScore >= 40 ? "developing" : "needs_work";
    const reviewMonth   = new Date(review.created_at).toLocaleDateString("en-US", {
      month: "long",
      year:  "numeric",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeName  = (review.employee as any).full_name as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeEmail = (review.employee as any).email as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const managerName   = ((review.manager as any).full_name as string).split(" ")[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const businessName  = (review.business as any).name as string;
    const dashboardUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/my-standing`;

    // ── 3. Send the email ──────────────────────────────────────────
    const { data: emailData, error: emailError } = await resend.emails.send({
      from:    "Standpoint <reviews@standpointapp.com>",
      to:      [employeeEmail],
      subject: `${managerName} submitted your ${reviewMonth} performance review`,
      react:   ReviewEmail({
        employeeName,
        managerName,
        businessName,
        reviewMonth,
        overallScore,
        overallStatus,
        categories,
        aiSummary:    review.ai_summary ?? "",
        dashboardUrl,
      }),
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // ── 4. Mark email as sent in DB (optional but useful) ──────────
    await supabase
      .from("reviews")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", reviewId);

    return NextResponse.json({ success: true, emailId: emailData?.id });

  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
