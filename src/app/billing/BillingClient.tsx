"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Check, CreditCard, Loader2 } from "lucide-react";

interface BillingClientProps {
  currentPlan: string;
  hasStripeCustomer: boolean;
}

function SuccessBanner() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  if (!success) return null;
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm font-medium">
      Subscription activated! AI coaching summaries are now available.
    </div>
  );
}

export default function BillingClient({ currentPlan, hasStripeCustomer }: BillingClientProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const isPro = currentPlan === "pro";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Current plan:{" "}
          <span className={`font-semibold ${isPro ? "text-indigo-600" : "text-gray-600"}`}>
            {isPro ? "Pro" : "Free"}
          </span>
        </p>
      </div>

      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className={`rounded-xl border-2 p-6 ${!isPro ? "border-indigo-500 shadow-md" : "border-gray-200"} bg-white`}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900 text-lg">Free</h2>
            {!isPro && (
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            $0 <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {[
              "Unlimited employees",
              "Unlimited performance reviews",
              "5-category ratings & notes",
              "Manager & employee dashboards",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className={`rounded-xl border-2 p-6 ${isPro ? "border-indigo-500 shadow-md" : "border-gray-200"} bg-white`}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900 text-lg">Pro</h2>
            {isPro && (
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            $49 <span className="text-sm font-normal text-gray-500">/mo</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {[
              "Everything in Free",
              "AI coaching summaries (Claude)",
              "Per-review AI regeneration",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {!isPro && (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {loading ? "Redirecting…" : "Upgrade to Pro"}
            </button>
          )}
        </div>
      </div>

      {isPro && hasStripeCustomer && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Manage Subscription</h3>
          <p className="text-sm text-gray-500 mb-4">
            Update payment method, download invoices, or cancel your subscription.
          </p>
          <button
            onClick={handleManage}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {loading ? "Loading…" : "Customer Portal"}
          </button>
        </div>
      )}
    </div>
  );
}
