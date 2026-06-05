import { createClient } from "@/lib/supabase/server";
import { ManagerSettings } from "@/components/standpoint/ManagerSettings";

export default async function ManagerSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, business_id, role")
    .eq("user_id", user!.id)
    .single();

  if (!profile?.business_id) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">No business found for your account.</p>
      </div>
    );
  }

  const [{ data: business }, { data: employees }] = await Promise.all([
    supabase
      .from("businesses")
      .select("name, join_code, subscription_status, stripe_customer_id")
      .eq("id", profile.business_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_initials, created_at")
      .eq("business_id", profile.business_id)
      .eq("role", "employee")
      .order("full_name"),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <ManagerSettings
      businessId={profile.business_id}
      initialBusinessName={business?.name ?? ""}
      joinCode={business?.join_code ?? null}
      appUrl={appUrl}
      employees={(employees ?? []).map((e) => ({
        id: e.id,
        full_name: e.full_name,
        avatar_initials: e.avatar_initials,
        created_at: e.created_at,
      }))}
      subscriptionStatus={business?.subscription_status ?? null}
      hasStripeCustomer={!!business?.stripe_customer_id}
    />
  );
}
