import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STANDPOINT_PRICES, type StandpointPriceKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { priceKey } = await req.json() as { priceKey?: StandpointPriceKey };
    if (!priceKey || !(priceKey in STANDPOINT_PRICES)) {
      return NextResponse.json({ error: "Invalid priceKey" }, { status: 400 });
    }

    const priceId = STANDPOINT_PRICES[priceKey];
    if (!priceId) {
      return NextResponse.json({ error: "Price not configured — set env vars" }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, role, business_id, businesses(id, name, stripe_customer_id)")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "manager") {
      return NextResponse.json({ error: "Only managers can start a subscription" }, { status: 403 });
    }

    const biz = profile.businesses as unknown as {
      id: string;
      name: string;
      stripe_customer_id: string | null;
    } | null;

    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode:                      "subscription",
      payment_method_collection: "if_required", // no CC required during free trial
      customer:                  biz.stripe_customer_id ?? undefined,
      customer_email:            biz.stripe_customer_id ? undefined : profile.email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { businessId: biz.id },
      },
      metadata: { businessId: biz.id, userId: user.id },
      success_url: `${appUrl}/manager/dashboard?checkout=success`,
      cancel_url:  `${appUrl}/pricing?checkout=canceled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
