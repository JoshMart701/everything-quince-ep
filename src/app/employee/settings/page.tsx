import { createClient } from "@/lib/supabase/server";
import { EmployeeSettings } from "@/components/standpoint/EmployeeSettings";

export default async function EmployeeSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user!.id)
    .single();

  return (
    <EmployeeSettings
      initialFullName={profile?.full_name ?? ""}
    />
  );
}
