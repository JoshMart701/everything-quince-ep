"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: 0,
    annualPrice: 0,
    description: "Get started and see how it works.",
    cta: "Start for free",
    highlighted: false,
    features: [
      { text: "1 manager account", included: true },
      { text: "Up to 5 employees", included: true },
      { text: "10 reviews per month", included: true },
      { text: "Category breakdowns", included: true },
      { text: "AI coaching summaries", included: false },
      { text: "Review history & trends", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Starter",
    price: 49,
    annualPrice: 37,
    description: "For growing teams who want AI coaching.",
    cta: "Start Starter trial",
    highlighted: true,
    features: [
      { text: "1 manager account", included: true },
      { text: "Up to 25 employees", included: true },
      { text: "Unlimited reviews", included: true },
      { text: "Category breakdowns", included: true },
      { text: "AI coaching summaries", included: true },
      { text: "Review history & trends", included: true },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: 99,
    annualPrice: 74,
    description: "For teams that need unlimited scale and support.",
    cta: "Start Pro trial",
    highlighted: false,
    features: [
      { text: "Up to 5 manager accounts", included: true },
      { text: "Unlimited employees", included: true },
      { text: "Unlimited reviews", included: true },
      { text: "Category breakdowns", included: true },
      { text: "AI coaching summaries", included: true },
      { text: "Review history & trends", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

export function PricingToggle() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Toggle */}
      <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1 mb-10">
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
          <span className="text-xs font-bold text-[#12b76a] bg-[#12b76a]/10 px-1.5 py-0.5 rounded-full">
            Save 25%
          </span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const displayPrice = annual ? plan.annualPrice : plan.price;
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border ${
                plan.highlighted
                  ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-xl shadow-[#4f46e5]/25"
                  : "bg-white border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  {displayPrice === 0 ? (
                    <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                      Free
                    </span>
                  ) : (
                    <>
                      <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                        ${displayPrice}
                      </span>
                      <span className={`text-sm pb-1 ${plan.highlighted ? "text-indigo-200" : "text-gray-500"}`}>
                        /mo
                      </span>
                    </>
                  )}
                </div>
                {annual && plan.price > 0 && (
                  <p className={`text-xs ${plan.highlighted ? "text-indigo-200" : "text-gray-400"}`}>
                    Save ${(plan.price - plan.annualPrice) * 12}/year vs monthly
                  </p>
                )}
                <p className={`text-sm mt-2 ${plan.highlighted ? "text-indigo-100" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        f.included
                          ? plan.highlighted ? "text-indigo-200" : "text-[#12b76a]"
                          : plan.highlighted ? "text-white/20" : "text-gray-200"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        f.included
                          ? plan.highlighted ? "text-indigo-100" : "text-gray-700"
                          : plan.highlighted ? "text-white/30 line-through" : "text-gray-300 line-through"
                      }`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signup"
                className={`block w-full text-center text-sm font-semibold py-3 rounded-xl transition-colors ${
                  plan.highlighted
                    ? "bg-white text-[#4f46e5] hover:bg-indigo-50"
                    : "bg-[#4f46e5] text-white hover:bg-[#4338ca]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
