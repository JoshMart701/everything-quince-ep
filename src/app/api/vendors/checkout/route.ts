import { NextRequest, NextResponse } from "next/server";
import { createStripeClient, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  try {
    const { plan } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id, stripe_customer_id, plan")
      .eq("user_id", user.id)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig || !planConfig.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const stripe = createStripeClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: vendor.stripe_customer_id || undefined,
      customer_email: vendor.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      metadata: { vendor_id: vendor.id, plan },
      success_url: `${appUrl}/vendor/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/vendor/upgrade`,
      subscription_data: {
        metadata: { vendor_id: vendor.id, plan },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
