import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncSubscription(sub: Stripe.Subscription) {
  const businessId = sub.metadata?.businessId;
  if (!businessId) return;

  const status = sub.status as string;
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;

  await supabase
    .from("businesses")
    .update({
      subscription_status:    status,
      trial_ends_at:          trialEnd,
      stripe_subscription_id: sub.id,
    })
    .eq("id", businessId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Checkout completed ─────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.businessId;
        if (!businessId) break;

        // Store the Stripe customer ID on the business
        if (session.customer) {
          await supabase
            .from("businesses")
            .update({ stripe_customer_id: session.customer as string })
            .eq("id", businessId);
        }

        // Fetch and sync the subscription
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscription(sub);
        }
        break;
      }

      // ── Subscription updated (trial→active, payment method added, etc.) ─
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }

      // ── Subscription canceled / deleted ───────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const businessId = sub.metadata?.businessId;
        if (!businessId) break;
        await supabase
          .from("businesses")
          .update({ subscription_status: "canceled" })
          .eq("id", businessId);
        break;
      }

      // ── Payment failed ────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoiceRaw = event.data.object as unknown as {
          id: string;
          amount_due: number;
          currency: string;
          subscription?: string;
        };
        const subId = invoiceRaw.subscription;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const businessId = sub.metadata?.businessId;
        if (!businessId) break;

        // Update status to past_due
        await supabase
          .from("businesses")
          .update({ subscription_status: "past_due" })
          .eq("id", businessId);

        // Log the warning — wire to Resend here for production
        const { data: biz } = await supabase
          .from("businesses")
          .select("name")
          .eq("id", businessId)
          .single();

        console.warn(
          `[stripe/webhook] Payment failed for business "${biz?.name}" (${businessId}).` +
          ` Invoice: ${invoiceRaw.id}. Amount due: ${invoiceRaw.amount_due / 100} ${invoiceRaw.currency.toUpperCase()}.`
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
