import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { fullName, orgName, email, password } = await request.json();

    if (!fullName || !orgName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 });
    }

    const userId = authData.user.id;

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: orgName, owner_id: userId })
      .select()
      .single();

    if (orgError || !org) {
      // Rollback user
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: orgError?.message ?? "Failed to create organization" }, { status: 500 });
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        org_id: org.id,
        full_name: fullName,
        email,
        role: "manager",
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Sign in the user to establish a session
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return NextResponse.json({ error: "Account created but sign-in failed. Please log in." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
