import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  sendQuoteNotificationToOwner,
  sendQuoteConfirmationToClient,
  sendLeadToVendor,
} from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, eventDate, eventCity,
      guestCount, budgetRange, categories, message,
    } = body;

    if (!name || !email || !categories?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Insert lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        name, email, phone, event_date: eventDate || null,
        event_city: eventCity, guest_count: guestCount ? parseInt(guestCount) : null,
        budget_range: budgetRange, categories, message,
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // Find matching vendors (Pro/Premium, approved, matching categories)
    const { data: vendors } = await supabase
      .from("vendors")
      .select("id, email, business_name, plan")
      .eq("status", "approved")
      .in("plan", ["pro", "premium"])
      .overlaps("cities_served", [eventCity ?? "El Paso"])
      .in("category", categories)
      .limit(10);

    // Route lead to matching vendors
    if (vendors && vendors.length > 0) {
      const routingRecords = vendors.map((v) => ({
        lead_id: lead.id,
        vendor_id: v.id,
      }));

      await supabase.from("lead_routing").insert(routingRecords);

      // Email each vendor
      await Promise.allSettled(
        vendors.map((v) =>
          sendLeadToVendor(
            { email: v.email, businessName: v.business_name, leadId: lead.id },
            { name, eventDate, eventCity, guestCount: guestCount ? parseInt(guestCount) : undefined, budgetRange, categories }
          )
        )
      );
    }

    // Email owner and confirm to client
    await Promise.allSettled([
      sendQuoteNotificationToOwner({
        name, email, phone, eventDate, eventCity,
        guestCount: guestCount ? parseInt(guestCount) : undefined,
        budgetRange, categories, message,
      }),
      sendQuoteConfirmationToClient({ name, email, categories }),
    ]);

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err) {
    console.error("Quote submission error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
