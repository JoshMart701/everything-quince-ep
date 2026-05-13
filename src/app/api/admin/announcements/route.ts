import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendAnnouncementToVendors } from "@/lib/resend";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.email !== process.env.OWNER_EMAIL && user.user_metadata?.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body, target } = await req.json();
  if (!subject || !body) {
    return NextResponse.json({ error: "Subject and body required" }, { status: 400 });
  }

  const serviceSupabase = await createServiceClient();

  let query = serviceSupabase.from("vendors").select("email").eq("status", "approved");
  if (target === "pro") query = query.eq("plan", "pro");
  else if (target === "premium") query = query.eq("plan", "premium");

  const { data: vendors } = await query;
  const emails = (vendors ?? []).map((v: { email: string }) => v.email);

  if (emails.length > 0) {
    await sendAnnouncementToVendors(emails, subject, body);
  }

  await serviceSupabase.from("announcements").insert({
    subject,
    body,
    sent_to: target,
    sent_count: emails.length,
    sent_at: new Date().toISOString(),
    created_by: user.id,
  });

  return NextResponse.json({ success: true, count: emails.length });
}
