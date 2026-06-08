import Stripe from "stripe";

export function createStripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// ── Amen Goodnight family subscription plans ──────────────────────────────
export const FAMILY_PLANS = {
  family: {
    name: "Family Plan",
    price: 12,
    priceId: process.env.STRIPE_FAMILY_PRICE_ID,
    trialDays: 7,
    features: [
      "Personalized bedtime stories for up to 2 children",
      "Faith-based themes and scripture",
      "Daily story delivery",
      "7-day free trial",
    ],
  },
  growing_family: {
    name: "Growing Family Plan",
    price: 18,
    priceId: process.env.STRIPE_GROWING_PRICE_ID,
    trialDays: 7,
    features: [
      "Personalized bedtime stories for unlimited children",
      "Faith-based themes and scripture",
      "Daily story delivery",
      "Priority story generation",
      "7-day free trial",
    ],
  },
} as const;

export type FamilyPlanKey = keyof typeof FAMILY_PLANS;

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
