"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import type { StandpointPriceKey } from "@/lib/stripe";

const PLANS = [
  {
    name:        "Starter",
    monthlyKey:  "starter_monthly" as StandpointPriceKey,
    annualKey:   "starter_annual"  as StandpointPriceKey,
    monthlyPrice: 49,
    annualTotal:  490,
    description: "For growing teams who want AI-powered coaching.",
    highlighted: true,
    badge:       "Most popular",
    features: [
      "1 manager account",
      "Up to 25 employees",
      "Unlimited reviews",
      "AI coaching summaries",
      "Review history & trends",
      "Employee mobile dashboard",
    ],
  },
  {
    name:        "Pro",
    monthlyKey:  "pro_monthly" as StandpointPriceKey,
    annualKey:   "pro_annual"  as StandpointPriceKey,
    monthlyPrice: 99,
    annualTotal:  990,
    description: "For teams that need unlimited scale and support.",
    highlighted: false,
    badge:       null,
    features: [
      "Up to 5 manager accounts",
      "Unlimited employees",
      "Unlimited reviews",
      "AI coaching summaries",
      "Review history & trends",
      "Employee mobile dashboard",
      "Priority support",
    ],
  },
] as const;

interface Props {
  isLoggedIn: boolean;
  isManager:  boolean;
}

export function PricingCards({ isLoggedIn, isManager }: Props) {
  const router = useRouter();
  const [annual,  setAnnual]  = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const startCheckout = async (priceKey: StandpointPriceKey) => {
    if (!isLoggedIn) {
      router.push(`/auth/signup?redirect=/pricing`);
      return;
    }
    if (!isManager) {
      router.push(`/manager/dashboard`);
      return;
    }

    setLoading(priceKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceKey }),
      });
      const { url, error } = await res.json() as { url?: string; error?: string };
      if (error || !url) throw new Error(error ?? "Failed to create checkout session");
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <>
      {/* Toggle */}
      <div className="flex justify-center mb-10 mt-8">
        <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-all ${
              !annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-all flex items-center gap-2 ${
              annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Annual
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Save ~17%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {PLANS.map((plan) => {
          const priceKey     = annual ? plan.annualKey   : plan.monthlyKey;
          const isLoading    = loading === priceKey;
          const perMonthAnnual = Math.round(plan.annualTotal / 12);

          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border ${
                plan.highlighted
                  ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-xl shadow-[#4f46e5]/25"
                  : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>
                {plan.name}
              </p>

              <div className="flex items-end gap-1 mb-1">
                <span className={`text-5xl font-bold tracking-tight ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  ${annual ? perMonthAnnual : plan.monthlyPrice}
                </span>
                <span className={`text-sm pb-1.5 ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>
                  /mo
                </span>
              </div>

              {annual ? (
                <p className={`text-xs mb-1 ${plan.highlighted ? "text-indigo-200" : "text-gray-400"}`}>
                  ${plan.annualTotal}/year — save ${plan.monthlyPrice * 12 - plan.annualTotal}
                </p>
              ) : (
                <p className={`text-xs mb-1 ${plan.highlighted ? "text-indigo-200" : "text-gray-400"}`}>
                  or ${plan.annualTotal}/year
                </p>
              )}

              <p className={`text-sm mt-2 mb-6 ${plan.highlighted ? "text-indigo-100" : "text-gray-500"}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? "text-indigo-200" : "text-emerald-500"
                      }`}
                    />
                    <span className={`text-sm ${plan.highlighted ? "text-indigo-100" : "text-gray-700"}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => startCheckout(priceKey)}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  plan.highlighted
                    ? "bg-white text-[#4f46e5] hover:bg-indigo-50"
                    : "bg-[#4f46e5] text-white hover:bg-[#4338ca]"
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? "Redirecting…" : "Start Free Trial"}
              </button>

              <p className={`text-xs text-center mt-3 ${plan.highlighted ? "text-indigo-300" : "text-gray-400"}`}>
                14 days free · No credit card required
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
