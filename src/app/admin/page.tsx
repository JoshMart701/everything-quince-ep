import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import {
  Users, MessageSquare, DollarSign, TrendingUp, Crown, Zap, Star,
} from "lucide-react";
import AdminVendorTable from "./AdminVendorTable";
import AdminLeadsTable from "./AdminLeadsTable";
import AdminAnnouncementForm from "./AdminAnnouncementForm";

export const dynamic = 'force-dynamic';

async function getAdminData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Check admin role (you can set this in user metadata or a separate admin table)
  const isAdmin =
    user.email === process.env.OWNER_EMAIL ||
    user.user_metadata?.role === "admin";

  if (!isAdmin) return null;

  const serviceSupabase = await createServiceClient();

  const [
    { data: vendors, count: vendorCount },
    { data: leads, count: leadCount },
  ] = await Promise.all([
    serviceSupabase.from("vendors").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(50),
    serviceSupabase.from("leads").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(50),
  ]);

  const proCount = vendors?.filter((v) => v.plan === "pro").length ?? 0;
  const premiumCount = vendors?.filter((v) => v.plan === "premium").length ?? 0;
  const pendingCount = vendors?.filter((v) => v.status === "pending").length ?? 0;
  const approvedCount = vendors?.filter((v) => v.status === "approved").length ?? 0;

  const mrr = proCount * 49 + premiumCount * 149;

  return {
    vendors: vendors ?? [],
    leads: leads ?? [],
    vendorCount: vendorCount ?? 0,
    leadCount: leadCount ?? 0,
    proCount,
    premiumCount,
    pendingCount,
    approvedCount,
    mrr,
  };
}

export default async function AdminPage() {
  const data = await getAdminData();

  if (!data) redirect("/vendor/login");

  const { vendors, leads, vendorCount, leadCount, proCount, premiumCount, pendingCount, mrr } = data;

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      {/* Header */}
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌹</span>
              <span className="font-heading font-bold">Everything Quince EP</span>
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-white/70 text-sm font-body">Admin Dashboard</span>
          </div>
          <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
            View Site →
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Monthly Recurring Revenue", value: formatCurrency(mrr), icon: DollarSign, color: "text-[#C4547A]", sub: "Active subscriptions" },
            { label: "Total Vendors", value: vendorCount.toString(), icon: Users, color: "text-[#C9A84C]", sub: `${pendingCount} pending approval` },
            { label: "Total Leads", value: leadCount.toString(), icon: MessageSquare, color: "text-[#3D1A2E]", sub: "Quote requests" },
            { label: "Pro + Premium", value: `${proCount + premiumCount}`, icon: TrendingUp, color: "text-[#C4547A]", sub: `${proCount} Pro • ${premiumCount} Premium` },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="font-heading font-bold text-2xl text-[#3D1A2E]">{stat.value}</p>
              <p className="text-xs font-body font-medium text-[#3D1A2E]/80 mt-0.5">{stat.label}</p>
              <p className="text-xs text-[#3D1A2E]/50 font-body">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Plan breakdown */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { plan: "Free", count: vendorCount - proCount - premiumCount, revenue: 0, icon: Star, color: "bg-gray-100 text-gray-600" },
            { plan: "Pro", count: proCount, revenue: proCount * 49, icon: Zap, color: "bg-[#C9A84C]/10 text-[#906523]" },
            { plan: "Premium", count: premiumCount, revenue: premiumCount * 149, icon: Crown, color: "bg-[#3D1A2E]/10 text-[#3D1A2E]" },
          ].map((row) => (
            <div key={row.plan} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${row.color} flex items-center justify-center`}>
                <row.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-heading font-bold text-[#3D1A2E] text-xl">{row.count}</p>
                <p className="text-sm text-[#3D1A2E]/70 font-body">{row.plan} vendors</p>
                {row.revenue > 0 && (
                  <p className="text-xs text-[#C4547A] font-semibold">{formatCurrency(row.revenue)}/mo</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Admin tabs */}
        <div className="space-y-8">
          {/* Vendors table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-[#f3ddb9] flex items-center justify-between">
              <h2 className="font-heading font-bold text-[#3D1A2E] text-xl">Vendor Management</h2>
              <span className="text-sm text-[#3D1A2E]/50 font-body">{pendingCount} pending approval</span>
            </div>
            <AdminVendorTable vendors={vendors} />
          </div>

          {/* Leads table */}
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-[#f3ddb9]">
              <h2 className="font-heading font-bold text-[#3D1A2E] text-xl">Quote Requests (Leads)</h2>
            </div>
            <AdminLeadsTable leads={leads} />
          </div>

          {/* Announcements */}
          <div className="card p-6">
            <h2 className="font-heading font-bold text-[#3D1A2E] text-xl mb-4">Send Email Announcement</h2>
            <AdminAnnouncementForm />
          </div>
        </div>
      </div>
    </div>
  );
}
