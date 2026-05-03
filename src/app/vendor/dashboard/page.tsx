import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard, Users, Star, BarChart2, Calendar,
  FileText, Settings, Crown, AlertCircle, CheckCircle2,
  Clock, TrendingUp, MessageSquare,
} from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { formatDate } from "@/lib/utils";

async function getVendorData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!vendor) return null;

  const [{ data: leads }, { data: reviews }, { data: analytics }] = await Promise.all([
    supabase.from("lead_routing").select("*, leads(*)").eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("reviews").select("*").eq("vendor_id", vendor.id).eq("is_approved", true).order("created_at", { ascending: false }).limit(5),
    supabase.from("vendor_analytics").select("event_type").eq("vendor_id", vendor.id),
  ]);

  const profileViews = analytics?.filter((a) => a.event_type === "profile_view").length ?? 0;
  const leadClicks = analytics?.filter((a) => a.event_type === "lead_click").length ?? 0;

  return { vendor, leads: leads ?? [], reviews: reviews ?? [], profileViews, leadClicks };
}

export default async function VendorDashboardPage() {
  const data = await getVendorData();

  if (!data) redirect("/vendor/login");

  const { vendor, leads, reviews, profileViews } = data;
  const plan = vendor.plan as keyof typeof PLANS;
  const planConfig = PLANS[plan];
  const isPro = plan === "pro" || plan === "premium";
  const isPremium = plan === "premium";

  const statusMap: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
    approved: { label: "Live & Active", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
    suspended: { label: "Suspended", color: "bg-gray-100 text-gray-700 border-gray-200", icon: AlertCircle },
  };
  const statusBadge = statusMap[vendor.status] ?? { label: vendor.status, color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock };

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
            <span className="text-white/70 text-sm">Vendor Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
            <Link href="/vendor/profile" className="text-white/70 hover:text-white text-sm transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan banner */}
        {!isPro && (
          <div className="bg-gradient-to-r from-[#C9A84C] to-[#e5c97a] rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-heading font-bold text-[#3D1A2E] text-lg">
                🚀 Upgrade to Pro to unlock lead access
              </p>
              <p className="text-[#3D1A2E]/70 text-sm font-body">
                Get lead contact details, edit your full profile, manage reviews & analytics.
              </p>
            </div>
            <Link href="/vendor/upgrade" className="bg-[#3D1A2E] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#5c2044] transition-colors flex-shrink-0">
              Upgrade to Pro — $49/mo
            </Link>
          </div>
        )}

        {/* Pending approval notice */}
        {vendor.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">Your listing is pending review</p>
              <p className="text-yellow-700 text-sm font-body">
                Our team will review your listing within 1–2 business days. You&apos;ll receive an email once approved.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Profile Views", value: profileViews, icon: BarChart2, color: "text-[#C4547A]", locked: false },
            { label: "Leads Received", value: isPro ? leads.length : "–", icon: Users, color: "text-[#C9A84C]", locked: !isPro },
            { label: "Reviews", value: reviews.length, icon: Star, color: "text-[#3D1A2E]", locked: false },
            { label: "Avg Rating", value: vendor.average_rating ? `${vendor.average_rating}★` : "–", icon: TrendingUp, color: "text-[#C4547A]", locked: false },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                {stat.locked && (
                  <span className="text-xs bg-[#f3ddb9] text-[#3D1A2E]/60 px-2 py-0.5 rounded-full">Pro</span>
                )}
              </div>
              <p className={`font-heading font-bold text-2xl ${stat.locked ? "blur-sm text-[#3D1A2E]/40" : "text-[#3D1A2E]"}`}>
                {stat.value}
              </p>
              <p className="text-xs text-[#3D1A2E]/60 font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: nav */}
          <div className="space-y-2">
            {[
              { href: "/vendor/dashboard", label: "Overview", icon: LayoutDashboard, active: true },
              { href: "/vendor/profile", label: "Edit Profile", icon: Settings, locked: false },
              { href: "/vendor/leads", label: "Lead Inbox", icon: MessageSquare, locked: !isPro },
              { href: "/vendor/reviews", label: "Reviews", icon: Star, locked: !isPro },
              { href: "/vendor/analytics", label: "Analytics", icon: BarChart2, locked: !isPro },
              { href: "/vendor/calendar", label: "Availability", icon: Calendar, locked: !isPro },
              { href: "/vendor/clients", label: "Client CRM", icon: Users, locked: !isPremium },
              { href: "/vendor/invoices", label: "Invoices", icon: FileText, locked: !isPremium },
              { href: "/vendor/upgrade", label: "Upgrade Plan", icon: Crown, locked: false },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.locked ? "/vendor/upgrade" : item.href}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-body font-medium transition-all ${
                  item.active
                    ? "bg-[#C4547A] text-white"
                    : item.locked
                    ? "text-[#3D1A2E]/30 bg-white border border-[#f3ddb9] cursor-not-allowed"
                    : "text-[#3D1A2E]/70 bg-white border border-[#f3ddb9] hover:text-[#C4547A] hover:border-[#C4547A]/30"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {item.locked && (
                  <span className="text-xs bg-[#f3ddb9] text-[#3D1A2E]/50 px-2 py-0.5 rounded-full">
                    {item.locked && item.href.includes("clients") ? "Premium" : "Pro"}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right: content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor profile card */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#3D1A2E]">{vendor.business_name}</h2>
                  <p className="text-sm text-[#C4547A] font-body capitalize">{vendor.category} • {vendor.city}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  plan === "premium" ? "badge-premium" : plan === "pro" ? "badge-pro" : "badge-free"
                }`}>
                  {planConfig.name} Plan
                </span>
              </div>

              <p className="text-sm text-[#3D1A2E]/70 font-body mb-4">{vendor.description ?? "No description yet."}</p>

              <Link href="/vendor/profile" className="btn-outline text-sm px-4 py-2">
                Edit Profile
              </Link>
            </div>

            {/* Recent Leads */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg">Recent Leads</h3>
                {isPro && <Link href="/vendor/leads" className="text-sm text-[#C4547A] hover:underline font-body">View all</Link>}
              </div>

              {!isPro ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-[#3D1A2E]/20 mx-auto mb-3" />
                  <p className="text-[#3D1A2E]/60 font-body text-sm mb-4">
                    Upgrade to Pro to see your lead inbox and contact details.
                  </p>
                  <Link href="/vendor/upgrade" className="btn-primary text-sm px-5 py-2">
                    Upgrade to Pro
                  </Link>
                </div>
              ) : leads.length === 0 ? (
                <p className="text-center text-[#3D1A2E]/50 font-body py-6">No leads yet. Stay patient!</p>
              ) : (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {leads.map((routing: any) => (
                    <div key={routing.id} className="flex items-center gap-3 p-3 bg-[#FDF7F0] rounded-xl">
                      <div className="w-10 h-10 bg-[#C4547A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-[#C4547A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-medium text-[#3D1A2E] text-sm truncate">
                          {routing.leads?.name ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-[#3D1A2E]/50 font-body">
                          {routing.leads?.event_date
                            ? `Event: ${formatDate(routing.leads.event_date)}`
                            : "Date TBD"
                          } • {routing.leads?.event_city ?? "El Paso"}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        routing.status === "new" ? "bg-[#C4547A]/10 text-[#C4547A]" : "bg-[#f3ddb9] text-[#3D1A2E]/60"
                      }`}>
                        {routing.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg">Recent Reviews</h3>
                <Link href="/vendor/reviews" className="text-sm text-[#C4547A] hover:underline font-body">View all</Link>
              </div>

              {reviews.length === 0 ? (
                <p className="text-center text-[#3D1A2E]/50 font-body py-6">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-[#f3ddb9] pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-body font-medium text-[#3D1A2E] text-sm">{review.reviewer_name}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="text-[#C9A84C] text-sm">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#3D1A2E]/70 font-body">{review.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
