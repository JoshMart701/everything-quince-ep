import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/standpoint/Navbar";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(name, plan)")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employee") {
    redirect("/manager/dashboard");
  }

  const org = profile.organizations as { name: string; plan: string } | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} orgName={org?.name ?? "Your Org"} />
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
