import Stripe from "stripe";

export function createStripeClient(): Stripe { return new Stripe(process.env.STRIPE_SECRET_KEY!); }

export const FAMILY_PLANS = {
  family: {
    name: "Family Plan", price: 12, priceId: process.env.STRIPE_FAMILY_PRICE_ID, trialDays: 7,
    features: ["Personalized bedtime stories for up to 2 children", "Faith-based themes and scripture", "Daily story delivery", "7-day free trial"],
  },
  growing_family: {
    name: "Growing Family Plan", price: 18, priceId: process.env.STRIPE_GROWING_PRICE_ID, trialDays: 7,
    features: ["Personalized bedtime stories for unlimited children", "Faith-based themes and scripture", "Daily story delivery", "Priority story generation", "7-day free trial"],
  },
} as const;

export type FamilyPlanKey = keyof typeof FAMILY_PLANS;
