"use client";

import Link from "next/link";
import { AlertTriangle, CreditCard } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/stripe";

interface Props {
  status:      SubscriptionStatus;
  daysLeft:    number | null;
  hasBilling:  boolean;
}

export function TrialBanner({ status, daysLeft, hasBilling }: Props) {
  // Trial expiry warning (≤ 3 days left)
  if (status === "trialing" && daysLeft !== null && daysLeft <= 3) {
    const urgency = daysLeft === 0 ? "expires today" : `expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
    return (
      <div className="flex items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-amber-800 font-medium">
            Your free trial <strong>{urgency}</strong>.{" "}
            <span className="font-normal">Add a payment method to keep access.</span>
          </p>
        </div>
        <Link
          href="/billing"
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Add card
        </Link>
      </div>
    );
  }

  // Payment failed / past due
  if (status === "past_due") {
    return (
      <div className="flex items-start sm:items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-red-800 font-medium">
            Payment failed — <span className="font-normal">please update your payment method to avoid losing access.</span>
          </p>
        </div>
        <Link
          href="/billing"
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Fix billing
        </Link>
      </div>
    );
  }

  // Subscription canceled / locked
  if (status === "canceled") {
    return (
      <div className="flex items-start sm:items-center justify-between gap-3 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <AlertTriangle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-gray-700">
            <strong>Subscription ended.</strong>{" "}
            <span className="font-normal">New reviews are paused — you can still view past reviews.</span>
          </p>
        </div>
        <Link
          href="/pricing"
          className="flex-shrink-0 text-xs font-semibold bg-[#4f46e5] text-white px-3 py-1.5 rounded-lg hover:bg-[#4338ca] transition-colors whitespace-nowrap"
        >
          Resubscribe
        </Link>
      </div>
    );
  }

  if (!hasBilling) return null;
  return null;
}
