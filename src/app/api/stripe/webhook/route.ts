import { NextRequest, NextResponse } from "next/server";
import { createStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Raw body must be read as text before any other parsing for signature verification
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = createStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      // ── Checkout completed → subscription enters trial ──────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { user_id, plan } = session.metadata ?? {};
        if (!user_id || !plan) break;

        const customerId = session.customer as string;

        // Persist the Stripe customer ID and set initial trialing status
        await supabase
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            subscription_status: "trialing",
            plan,
          })
          .eq("id", user_id);

        break;
      }

      // ── Subscription updated → sync plan + status ───────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const { user_id, plan } = sub.metadata ?? {};
        if (!user_id) break;

        const status = mapStripeStatus(sub.status);

        await supabase
          .from("profiles")
          .update({
            subscription_status: status,
            // Only update plan when actively subscribed; keep old value on grace states
            ...(plan && (status === "active" || status === "trialing") ? { plan } : {}),
          })
          .eq("id", user_id);

        break;
      }

      // ── Subscription deleted → canceled ─────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { user_id } = sub.metadata ?? {};
        if (!user_id) break;

        await supabase
          .from("profiles")
          .update({ subscription_status: "canceled" })
          .eq("id", user_id);

        break;
      }
    }
  } catch (err) {
    // Log but always return 200 so Stripe doesn't retry indefinitely
    console.error("[stripe/webhook] Processing error:", err);
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(
  status: Stripe.Subscription["status"]
): "trialing" | "active" | "past_due" | "canceled" {
  switch (status) {
    case "trialing":  return "trialing";
    case "active":    return "active";
    case "past_due":
    case "unpaid":    return "past_due";
    default:          return "canceled";
  }
}
