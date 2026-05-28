import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id, name, join_code, plan, created_at")
      .eq("id", profile.business_id)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Redact join_code for employees
    if (profile.role !== "manager") {
      return NextResponse.json({ ...business, join_code: null });
    }

    return NextResponse.json(business);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
