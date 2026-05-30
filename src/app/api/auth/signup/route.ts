import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { computeInitials, generateJoinCode } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { role, fullName, email, password, businessName, joinCode } =
      await request.json();

    if (!role || !fullName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (role === "manager" && !businessName) {
      return NextResponse.json({ error: "Business name is required" }, { status: 400 });
    }
    if (role === "employee" && !joinCode) {
      return NextResponse.json({ error: "Join code is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // For employees: validate join code first
    let businessId: string | null = null;
    if (role === "employee") {
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("join_code", joinCode.toUpperCase().trim())
        .single();

      if (!business) {
        return NextResponse.json(
          { error: "Invalid join code. Ask your manager to double-check it." },
          { status: 404 }
        );
      }
      businessId = business.id;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? "Failed to create account" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    const avatarInitials = computeInitials(fullName);

    if (role === "manager") {
      // Generate a collision-free join code (up to 5 attempts; DB unique constraint is the final guard)
      let code = generateJoinCode();
      for (let attempt = 0; attempt < 4; attempt++) {
        const { data: existing } = await supabase
          .from("businesses")
          .select("id")
          .eq("join_code", code)
          .maybeSingle();
        if (!existing) break;
        code = generateJoinCode();
      }

      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .insert({ name: businessName.trim(), owner_id: userId, join_code: code })
        .select()
        .single();

      if (bizError || !business) {
        await supabase.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: bizError?.message ?? "Failed to create business" },
          { status: 500 }
        );
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        user_id:         userId,
        business_id:     business.id,
        full_name:       fullName.trim(),
        email,
        role:            "manager",
        avatar_initials: avatarInitials,
      });

      if (profileError) {
        await supabase.auth.admin.deleteUser(userId);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    } else {
      // Employee: join existing business
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id:         userId,
        business_id:     businessId!,
        full_name:       fullName.trim(),
        email,
        role:            "employee",
        avatar_initials: avatarInitials,
      });

      if (profileError) {
        await supabase.auth.admin.deleteUser(userId);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
