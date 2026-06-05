import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const supabase = await createServiceClient();

    const { data: invite, error } = await supabase
      .from("employee_invites")
      .select("*, organizations(name)")
      .eq("token", token)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "This invite has already been used or expired" }, { status: 410 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from("employee_invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
    }

    return NextResponse.json({
      email: invite.invited_email,
      orgName: (invite.organizations as { name: string } | null)?.name ?? "Unknown",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { fullName, password } = await request.json();

    if (!fullName || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: invite, error: inviteError } = await supabase
      .from("employee_invites")
      .select("*, organizations(name)")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      await supabase.from("employee_invites").update({ status: "expired" }).eq("id", invite.id);
      return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invite.invited_email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Failed to create account" }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create profile as employee
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        org_id: invite.org_id,
        full_name: fullName,
        email: invite.invited_email,
        role: "employee",
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Mark invite accepted
    await supabase
      .from("employee_invites")
      .update({ status: "accepted", accepted_by: userId })
      .eq("id", invite.id);

    // Sign in
    await supabase.auth.signInWithPassword({
      email: invite.invited_email,
      password,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
