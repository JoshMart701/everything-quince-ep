import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeProfileId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get manager profile
    const { data: managerProfile } = await supabase
      .from("profiles")
      .select("business_id, role")
      .eq("user_id", user.id)
      .single();

    if (!managerProfile || managerProfile.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get employee profile
    const { data: employeeProfile } = await supabase
      .from("profiles")
      .select("id, business_id")
      .eq("id", employeeProfileId)
      .single();

    if (!employeeProfile) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Verify same business
    if (employeeProfile.business_id !== managerProfile.business_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove employee from business
    const { error } = await supabase
      .from("profiles")
      .update({ business_id: null })
      .eq("id", employeeProfileId);

    if (error) {
      console.error("[standpoint/employees DELETE]", error);
      return NextResponse.json({ error: "Failed to remove employee" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[standpoint/employees DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
