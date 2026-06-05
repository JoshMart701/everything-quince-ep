import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, business_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: employees } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, email, avatar_initials, created_at")
      .eq("business_id", profile.business_id)
      .eq("role", "employee")
      .order("full_name");

    return NextResponse.json(employees ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
