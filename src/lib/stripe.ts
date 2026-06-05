import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder",
  { apiVersion: "2026-04-22.dahlia" }
);

export function createStripeClient(): Stripe {
  return stripe;
}

export const STANDPOINT_PRO_PRICE_ID = process.env.STRIPE_STANDPOINT_PRICE_ID ?? "";

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "Basic business listing",
      "Business name, category & city",
      "Phone & website link",
      "Appear in vendor directory",
    ],
    limits: {
      photos: 0,
      leads: 0,
    },
  },
  pro: {
    name: "Pro",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Everything in Free",
      "Lead inbox with contact details",
      "Full profile editor",
      "Photo gallery (up to 20 photos)",
      "Reviews management",
      "Analytics dashboard",
      "Availability calendar",
      "Priority in search results",
    ],
    limits: {
      photos: 20,
      leads: -1,
    },
  },
  premium: {
    name: "Premium",
    price: 149,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      "Everything in Pro",
      "Client CRM",
      "Invoice generator with live preview",
      "Performance analytics",
      "Priority leads (first access)",
      "Featured badge",
      "Unlimited photos",
      "Dedicated support",
    ],
    limits: {
      photos: -1,
      leads: -1,
    },
  },
} as const;

// ── Standpoint billing ──────────────────────────────────────────────────────

export const STANDPOINT_PRICES = {
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? "",
  starter_annual:  process.env.STRIPE_STARTER_ANNUAL_PRICE_ID  ?? "",
  pro_monthly:     process.env.STRIPE_PRO_MONTHLY_PRICE_ID     ?? "",
  pro_annual:      process.env.STRIPE_PRO_ANNUAL_PRICE_ID      ?? "",
} as const;

export type StandpointPriceKey = keyof typeof STANDPOINT_PRICES;

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | null;

export function canSubmitReviews(status: SubscriptionStatus): boolean {
  // null = no subscription started yet → allow (free/legacy access)
  // canceled = explicitly ended → lock
  return status !== "canceled";
}

export function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
