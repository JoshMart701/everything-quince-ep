import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/standpoint/Navbar";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(name, plan, stripe_customer_id)")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "manager") redirect("/employee/dashboard");

  const org = profile.organizations as { name: string; plan: string; stripe_customer_id: string | null } | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} orgName={org?.name ?? "Your Org"} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <BillingClient
          currentPlan={org?.plan ?? "free"}
          hasStripeCustomer={!!org?.stripe_customer_id}
        />
      </main>
    </div>
  );
}
