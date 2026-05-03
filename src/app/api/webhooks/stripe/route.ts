import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { vendor_id, plan } = session.metadata ?? {};

        if (!vendor_id || !plan) break;

        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await supabase.from("vendors").update({
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        }).eq("id", vendor_id);

        // current_period_* lives on the subscription item in newer Stripe versions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny = subscription as any;
        const periodStart = subAny.current_period_start ?? subAny.items?.data?.[0]?.current_period_start;
        const periodEnd = subAny.current_period_end ?? subAny.items?.data?.[0]?.current_period_end;

        await supabase.from("subscriptions").upsert({
          vendor_id,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
          plan: plan as "pro" | "premium",
          status: "active",
          current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        }, { onConflict: "stripe_subscription_id" });

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const vendorId = sub.metadata?.vendor_id;

        if (!vendorId) break;

        const plan = sub.metadata?.plan ?? "free";
        const status = sub.status === "active" ? "active" :
          sub.status === "canceled" ? "canceled" :
          sub.status === "past_due" ? "past_due" : "trialing";

        await supabase.from("vendors").update({
          plan: status === "active" ? plan : "free",
          updated_at: new Date().toISOString(),
        }).eq("id", vendorId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny2 = sub as any;
        const ps = subAny2.current_period_start ?? subAny2.items?.data?.[0]?.current_period_start;
        const pe = subAny2.current_period_end ?? subAny2.items?.data?.[0]?.current_period_end;

        await supabase.from("subscriptions").update({
          status,
          current_period_start: ps ? new Date(ps * 1000).toISOString() : null,
          current_period_end: pe ? new Date(pe * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          canceled_at: sub.canceled_at
            ? new Date(sub.canceled_at * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", sub.id);

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const vendorId = sub.metadata?.vendor_id;

        if (!vendorId) break;

        await supabase.from("vendors").update({
          plan: "free",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq("id", vendorId);

        await supabase.from("subscriptions").update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", sub.id);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase.from("subscriptions").update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("stripe_customer_id", customerId);

        break;
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return NextResponse.json({ received: true });
}
