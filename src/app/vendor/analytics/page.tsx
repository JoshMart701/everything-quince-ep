import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BarChart2, ChevronLeft, Eye, Users, TrendingUp } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function VendorAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, plan, business_name, average_rating, review_count")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/vendor/signup");
  if (vendor.plan === "free") redirect("/vendor/upgrade");

  const { data: analytics } = await supabase
    .from("vendor_analytics")
    .select("event_type, created_at")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const profileViews = analytics?.filter(a => a.event_type === "profile_view").length ?? 0;
  const leadClicks = analytics?.filter(a => a.event_type === "lead_click").length ?? 0;
  const quoteRequests = analytics?.filter(a => a.event_type === "quote_request").length ?? 0;
  const directoryImpressions = analytics?.filter(a => a.event_type === "directory_impression").length ?? 0;

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-white/70 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading font-bold">Analytics</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Profile Views", value: profileViews, icon: Eye, color: "text-[#C4547A]" },
            { label: "Directory Impressions", value: directoryImpressions, icon: BarChart2, color: "text-[#C9A84C]" },
            { label: "Lead Interactions", value: leadClicks, icon: Users, color: "text-[#3D1A2E]" },
            { label: "Quote Requests", value: quoteRequests, icon: TrendingUp, color: "text-[#C4547A]" },
          ].map((metric) => (
            <div key={metric.label} className="card p-5">
              <metric.icon className={`w-5 h-5 ${metric.color} mb-3`} />
              <p className="font-heading font-bold text-3xl text-[#3D1A2E]">{metric.value}</p>
              <p className="text-xs text-[#3D1A2E]/60 font-body mt-1">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="card p-6 mb-6">
          <h3 className="font-heading font-bold text-[#3D1A2E] text-lg mb-4">Reputation</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-heading font-bold text-5xl text-[#C9A84C]">
                {vendor.average_rating > 0 ? vendor.average_rating : "–"}
              </p>
              <div className="flex gap-0.5 justify-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.round(vendor.average_rating) ? "text-[#C9A84C]" : "text-[#f3ddb9]"}`}>★</span>
                ))}
              </div>
              <p className="text-xs text-[#3D1A2E]/50 font-body mt-1">{vendor.review_count} reviews</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-xs w-2 text-[#3D1A2E]/60">{star}</span>
                  <span className="text-[#C9A84C] text-xs">★</span>
                  <div className="flex-1 bg-[#f3ddb9] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#C9A84C] h-1.5 rounded-full" style={{ width: "40%" }} />
                  </div>
                  <span className="text-xs text-[#3D1A2E]/50 w-4">0</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 text-center">
          <p className="text-[#3D1A2E]/60 font-body text-sm">
            Analytics tracking starts from when your listing goes live. Data updates in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
