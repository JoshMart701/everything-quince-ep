import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendVendorApprovalEmail } from "@/lib/resend";

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || (user.email !== process.env.OWNER_EMAIL && user.user_metadata?.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  const serviceSupabase = await createServiceClient();

  const { data: vendor, error } = await serviceSupabase
    .from("vendors")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (status === "approved" && vendor) {
    await sendVendorApprovalEmail({
      email: vendor.email,
      businessName: vendor.business_name,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true, vendor });
}
