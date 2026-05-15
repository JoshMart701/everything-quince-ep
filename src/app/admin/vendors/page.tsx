import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ChevronLeft, Clock } from "lucide-react";
import AdminVendorCards from "./AdminVendorCards";

export const dynamic = 'force-dynamic';

export default async function AdminVendorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAdmin = user?.email === process.env.OWNER_EMAIL || user?.user_metadata?.role === "admin";
  if (!isAdmin) redirect("/vendor/login");

  const serviceSupabase = await createServiceClient();

  const { data: allVendors } = await serviceSupabase
    .from("vendors")
    .select("id, business_name, category, city, email, plan, status, created_at, description, phone")
    .order("created_at", { ascending: false });

  const vendors = allVendors ?? [];
  const pending = vendors.filter((v) => v.status === "pending");
  const approved = vendors.filter((v) => v.status === "approved");
  const rejected = vendors.filter((v) => v.status === "rejected" || v.status === "suspended");

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-heading font-bold">Vendor Management</span>
            {pending.length > 0 && (
              <span className="flex items-center gap-1 bg-yellow-400 text-[#3D1A2E] text-xs font-bold px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {pending.length} pending
              </span>
            )}
          </div>
          <span className="text-white/50 text-sm font-body">{vendors.length} total vendors</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {pending.length > 0 ? (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-heading font-bold text-[#3D1A2E] text-xl">Pending Approval</h2>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">{pending.length}</span>
            </div>
            <AdminVendorCards vendors={pending} />
          </section>
        ) : (
          <div className="card p-8 text-center">
            <p className="font-heading font-semibold text-[#3D1A2E] text-lg mb-1">All caught up!</p>
            <p className="text-[#3D1A2E]/50 font-body text-sm">No vendors are waiting for approval.</p>
          </div>
        )}

        {approved.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-[#3D1A2E] text-xl mb-4">
              Active Vendors <span className="text-[#3D1A2E]/40 font-normal text-base">({approved.length})</span>
            </h2>
            <AdminVendorCards vendors={approved} />
          </section>
        )}

        {rejected.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-[#3D1A2E] text-xl mb-4">
              Rejected / Suspended <span className="text-[#3D1A2E]/40 font-normal text-base">({rejected.length})</span>
            </h2>
            <AdminVendorCards vendors={rejected} />
          </section>
        )}
      </div>
    </div>
  );
}
