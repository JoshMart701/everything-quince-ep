"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown, Zap, Star } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { toast } from "sonner";

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: "pro" | "premium") => {
    setIsLoading(plan);
    try {
      const res = await fetch("/api/vendors/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        window.location.href = "/vendor/login";
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const plans = [
    {
      key: "free" as const,
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Get discovered by El Paso families",
      icon: Star,
      color: "border-[#f3ddb9]",
      headerColor: "bg-[#FDF7F0]",
      cta: "Current Plan",
      ctaDisabled: true,
    },
    {
      key: "pro" as const,
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "Grow your bookings with leads & full profile",
      icon: Zap,
      color: "border-[#C9A84C]",
      headerColor: "bg-gradient-to-br from-[#C9A84C]/10 to-[#e5c97a]/10",
      popular: true,
      cta: "Start Pro",
      ctaDisabled: false,
    },
    {
      key: "premium" as const,
      name: "Premium",
      price: "$149",
      period: "per month",
      description: "Full business management suite",
      icon: Crown,
      color: "border-[#3D1A2E]",
      headerColor: "bg-gradient-to-br from-[#3D1A2E] to-[#5c2044]",
      cta: "Start Premium",
      ctaDisabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF7F0] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <Link href="/vendor/dashboard" className="text-sm text-[#C4547A] hover:underline font-body mb-6 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="gold-divider mx-auto mb-4" />
          <h1 className="section-title">Choose Your Plan</h1>
          <p className="section-subtitle">
            Start free and upgrade when you&apos;re ready to grow.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-3xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1 ${plan.color} ${plan.popular ? "shadow-[0_8px_32px_rgba(201,168,76,0.25)]" : "shadow-card"}`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-[#C9A84C] text-[#3D1A2E] text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div className={`p-6 ${plan.headerColor} ${plan.key === "premium" ? "text-white" : ""}`}>
                <plan.icon className={`w-8 h-8 mb-3 ${plan.key === "premium" ? "text-[#C9A84C]" : "text-[#3D1A2E]"}`} />
                <h2 className={`font-heading font-bold text-2xl ${plan.key === "premium" ? "text-white" : "text-[#3D1A2E]"}`}>
                  {plan.name}
                </h2>
                <p className={`text-sm font-body mt-1 ${plan.key === "premium" ? "text-white/70" : "text-[#3D1A2E]/60"}`}>
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className={`font-heading font-bold text-4xl ${plan.key === "premium" ? "text-[#C9A84C]" : "text-[#3D1A2E]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-body ml-1 ${plan.key === "premium" ? "text-white/60" : "text-[#3D1A2E]/50"}`}>
                    /{plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 bg-white">
                <ul className="space-y-3 mb-6">
                  {PLANS[plan.key].features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#C4547A] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#3D1A2E]/80 font-body">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.ctaDisabled ? (
                  <button disabled className="w-full py-3 rounded-xl bg-[#f3ddb9] text-[#3D1A2E]/50 font-semibold text-sm cursor-not-allowed">
                    {plan.cta}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.key as "pro" | "premium")}
                    disabled={isLoading !== null}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.key === "pro"
                        ? "bg-[#C9A84C] text-[#3D1A2E] hover:bg-[#b3862a] hover:text-white"
                        : "bg-[#3D1A2E] text-white hover:bg-[#C4547A]"
                    } disabled:opacity-50`}
                  >
                    {isLoading === plan.key ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        Redirecting...
                      </span>
                    ) : plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="card p-8">
          <h3 className="font-heading font-bold text-[#3D1A2E] text-xl mb-6">Common Questions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! Cancel your subscription at any time from your dashboard. You'll keep Pro/Premium access until the end of your billing period.",
              },
              {
                q: "When will I receive leads?",
                a: "Leads are routed instantly when families submit quote requests matching your category and service area.",
              },
              {
                q: "How does the approval process work?",
                a: "All new listings are reviewed within 1–2 business days. We verify business information before approving.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit and debit cards through Stripe's secure payment processing.",
              },
            ].map((faq, i) => (
              <div key={i}>
                <p className="font-heading font-semibold text-[#3D1A2E] mb-1">{faq.q}</p>
                <p className="text-sm text-[#3D1A2E]/70 font-body">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
