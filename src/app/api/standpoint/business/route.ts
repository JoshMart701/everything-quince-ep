import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as { name?: string };
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    const { error } = await supabase
      .from("businesses")
      .update({ name: trimmedName })
      .eq("id", profile.business_id);

    if (error) {
      console.error("[standpoint/business PATCH]", error);
      return NextResponse.json({ error: "Failed to update business name" }, { status: 500 });
    }

    return NextResponse.json({ name: trimmedName });
  } catch (err) {
    console.error("[standpoint/business PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
