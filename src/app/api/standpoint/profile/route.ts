import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function computeInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { full_name?: string; email_notifications?: boolean };
    const { full_name, email_notifications } = body;

    // Build update payload
    const updatePayload: Record<string, unknown> = {};

    if (full_name !== undefined) {
      if (typeof full_name !== "string" || full_name.trim().length === 0) {
        return NextResponse.json({ error: "full_name must be a non-empty string" }, { status: 400 });
      }
      const trimmed = full_name.trim();
      updatePayload.full_name       = trimmed;
      updatePayload.avatar_initials = computeInitials(trimmed);
    }

    if (email_notifications !== undefined) {
      updatePayload.email_notifications = email_notifications;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user.id)
      .select("full_name, avatar_initials, email_notifications")
      .single();

    if (error || !data) {
      console.error("[standpoint/profile PATCH]", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      full_name:           data.full_name,
      avatar_initials:     data.avatar_initials,
      email_notifications: data.email_notifications,
    });
  } catch (err) {
    console.error("[standpoint/profile PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
