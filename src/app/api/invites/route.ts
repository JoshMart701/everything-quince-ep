import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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
      return NextResponse.json({ error: "Only managers can invite employees" }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check for existing pending invite
    const { data: existing } = await supabase
      .from("employee_invites")
      .select("id, status")
      .eq("org_id", profile.org_id)
      .eq("invited_email", email.toLowerCase())
      .eq("status", "pending")
      .single();

    if (existing) {
      return NextResponse.json({ error: "A pending invite already exists for this email" }, { status: 409 });
    }

    const serviceClient = await createServiceClient();
    const { data: invite, error: inviteError } = await serviceClient
      .from("employee_invites")
      .insert({
        org_id: profile.org_id,
        invited_email: email.toLowerCase(),
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: inviteError?.message ?? "Failed to create invite" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${appUrl}/auth/invite/${invite.token}`;

    return NextResponse.json({ invite, inviteUrl });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: invites } = await supabase
      .from("employee_invites")
      .select("*")
      .eq("org_id", profile.org_id)
      .order("created_at", { ascending: false });

    return NextResponse.json(invites ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
