import Stripe from "stripe";

export function createStripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

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
