import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/standpoint/Navbar";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, businesses(name, plan, join_code)")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "manager") redirect("/employee/dashboard");

  const biz = profile.businesses as unknown as { name: string; plan: string; join_code: string } | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} businessName={biz?.name ?? "Your Team"} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
