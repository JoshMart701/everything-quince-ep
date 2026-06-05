import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PricingCards } from "./PricingCards";

export const metadata: Metadata = {
  title: "Pricing | Standpoint",
  description: "Simple, transparent pricing for teams of any size. Start your 14-day free trial today.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isManager = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    isManager = profile?.role === "manager";
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-20 pb-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-[#4f46e5] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          14-day free trial · No credit card required
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Simple, honest pricing
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Give your team the reviews they deserve. Start free, upgrade when you&apos;re ready.
        </p>
      </section>

      {/* Cards */}
      <section className="px-4 pb-20 max-w-4xl mx-auto">
        <PricingCards isManager={isManager} isLoggedIn={!!user} />
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-100 py-16 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Common questions</h2>
          {[
            {
              q: "Do I need a credit card to start?",
              a: "No. Your 14-day free trial starts immediately with no payment information required.",
            },
            {
              q: "What happens when the trial ends?",
              a: "You'll receive an email before your trial expires. If you add a payment method and your trial converts, you won't be charged until the trial period ends.",
            },
            {
              q: "Can I switch plans?",
              a: "Yes — upgrade or downgrade at any time from the billing portal. Changes take effect immediately.",
            },
            {
              q: "What's the difference between Starter and Pro?",
              a: "Starter is great for a single manager with up to 25 employees. Pro supports up to 5 manager accounts, unlimited employees, and priority support.",
            },
            {
              q: "Is there a free plan?",
              a: "Not currently — but the 14-day trial is completely free with no card required, giving you time to see the full product before committing.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="font-semibold text-gray-900 mb-1">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
