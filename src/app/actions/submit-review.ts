// ─────────────────────────────────────────────────────────────────
// STANDPOINT — How to trigger the email from review submission
// Add this to your review submission server action or API route
// File: app/actions/submit-review.ts
// ─────────────────────────────────────────────────────────────────

"use server";

import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function submitReview(formData: {
  employeeId:  string;
  businessId:  string;
  managerId:   string;
  period?:     string;
  categories:  Array<{
    name:       string;
    stars:      number;
    percentage: number;
    status:     string;
    notes:      string;
  }>;
}) {
  const supabase = await createClient();

  // ── 1. Calculate overall score ─────────────────────────────────
  const overallScore = Math.round(
    formData.categories.reduce((sum, c) => sum + c.percentage, 0) / formData.categories.length
  );

  // ── 2. Generate AI summary ─────────────────────────────────────
  const { data: employee } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", formData.employeeId)
    .single();

  const categoryText = formData.categories
    .map((c) => `- ${c.name}: ${c.stars}/5 stars (${c.percentage}%)${c.notes ? ` — "${c.notes}"` : ""}`)
    .join("\n");

  const aiResponse = await anthropic.messages.create({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [{
      role:    "user",
      content: `You are a supportive workplace coach writing a performance review summary for ${employee?.full_name}. Their manager rated them across 5 categories:\n\n${categoryText}\n\nWrite a SHORT (3-4 sentences) honest, encouraging, and actionable summary. Use their first name. Mention their strongest area and one specific area to grow. Be direct but kind. No bullet points. No markdown.`,
    }],
  });

  const aiSummary = (aiResponse.content[0] as { text: string }).text;

  // ── 3. Save review to Supabase ─────────────────────────────────
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .insert({
      employee_id:   formData.employeeId,
      manager_id:    formData.managerId,
      business_id:   formData.businessId,
      period:        formData.period,
      overall_score: overallScore,
      ai_summary:    aiSummary,
    })
    .select()
    .single();

  if (reviewError || !review) {
    throw new Error("Failed to save review: " + reviewError?.message);
  }

  // ── 4. Save category scores ────────────────────────────────────
  const categoryRows = formData.categories.map((c) => ({
    review_id:        review.id,
    category_name:    c.name,
    star_rating:      c.stars,
    percentage_score: c.percentage,
    status:           c.status,
    notes:            c.notes,
  }));

  await supabase.from("review_categories").insert(categoryRows);

  // ── 5. Send email to employee ──────────────────────────────────
  // Fire and forget — don't block the UI waiting for email
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-review-email`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ reviewId: review.id }),
  }).catch((err) => console.error("Email send failed:", err));

  return { success: true, reviewId: review.id, overallScore, aiSummary };
}


// ─────────────────────────────────────────────────────────────────
// ENVIRONMENT VARIABLES NEEDED
// Add these to your .env.local file:
// ─────────────────────────────────────────────────────────────────

/*
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key

# Resend
RESEND_API_KEY=re_your_resend_key

# App URL (used for email links)
NEXT_PUBLIC_APP_URL=https://standpointapp.com
# During development use: http://localhost:3000
*/


// ─────────────────────────────────────────────────────────────────
// SUPABASE TABLE ADDITION
// Add this column to your reviews table:
// ─────────────────────────────────────────────────────────────────

/*
ALTER TABLE reviews ADD COLUMN email_sent_at TIMESTAMPTZ;
*/


// ─────────────────────────────────────────────────────────────────
// RESEND SETUP STEPS (5 minutes)
// ─────────────────────────────────────────────────────────────────

/*
1. Go to resend.com and create a free account
2. Add your domain (or use the sandbox for testing)
3. Copy your API key into .env.local as RESEND_API_KEY
4. For testing before your domain is set up, change the "from" address in
   the API route to: onboarding@resend.dev
   (Resend's sandbox address — works instantly, no domain needed)
5. Install packages:
   npm install resend @react-email/components
6. Test by calling the API route directly:
   POST /api/send-review-email with body: { "reviewId": "your-test-review-id" }
*/
