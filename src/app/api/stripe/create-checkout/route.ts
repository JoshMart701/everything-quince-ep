import { NextRequest, NextResponse } from "next/server";
import { createStripeClient, FAMILY_PLANS, type FamilyPlanKey } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  try {
    const { plan } = await req.json() as { plan: FamilyPlanKey };
    const planConfig = FAMILY_PLANS[plan];
    if (!planConfig?.priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();
    const stripe = createStripeClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...(profile?.stripe_customer_id ? { customer: profile.stripe_customer_id } : { customer_email: user.email }),
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      subscription_data: { trial_period_days: planConfig.trialDays, metadata: { user_id: user.id, plan } },
      metadata: { user_id: user.id, plan },
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/create-checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
