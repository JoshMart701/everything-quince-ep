import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Star, ClipboardList, TrendingUp, ChevronRight } from "lucide-react";
import type { Review } from "@/lib/types";

export default async function ManagerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_id, full_name")
    .eq("user_id", user!.id)
    .single();

  const [{ data: employees }, { data: reviews }, { data: business }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_initials, email")
      .eq("business_id", profile!.business_id)
      .eq("role", "employee"),
    supabase
      .from("reviews")
      .select("*, review_categories(*), employee:profiles!employee_id(full_name, avatar_initials)")
      .eq("business_id", profile!.business_id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("businesses")
      .select("name, plan")
      .eq("id", profile!.business_id)
      .single(),
  ]);

  const totalReviews  = reviews?.length ?? 0;
  const employeeCount = employees?.length ?? 0;

  const allCategoryScores = (reviews as Review[] ?? []).flatMap((r) => r.review_categories ?? []);
  const globalAvg =
    allCategoryScores.length > 0
      ? allCategoryScores.reduce((s, c) => s + c.star_rating, 0) / allCategoryScores.length
      : null;

  // Per-category averages across all reviews
  const catMap: Record<string, number[]> = {};
  allCategoryScores.forEach((c) => {
    if (!catMap[c.category_name]) catMap[c.category_name] = [];
    catMap[c.category_name].push(c.star_rating);
  });
  const catAverages = Object.entries(catMap).map(([name, vals]) => ({
    name,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  })).sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{business?.name} · Manager Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Users,       value: employeeCount,                           label: "Employees",  color: "bg-indigo-50 text-[#4f46e5]" },
          { icon: ClipboardList, value: totalReviews,                          label: "Reviews",    color: "bg-emerald-50 text-emerald-600" },
          { icon: Star,        value: globalAvg !== null ? globalAvg.toFixed(1) : "—", label: "Avg Rating", color: "bg-amber-50 text-amber-500" },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm col-span-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${color.split(" ")[0]}`}>
                <Icon className={`w-5 h-5 ${color.split(" ")[1]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/manager/reviews/new"
          className="inline-flex items-center gap-2 bg-[#4f46e5] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338ca] transition-colors"
        >
          <ClipboardList className="w-4 h-4" /> New Review
        </Link>
        <Link
          href="/manager/employees"
          className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Users className="w-4 h-4" /> Manage Team
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#4f46e5]" />
            <h2 className="font-semibold text-gray-900">Team Performance</h2>
          </div>
          {catAverages.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {catAverages.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.name}</span>
                    <span className="font-medium text-gray-900">{cat.avg.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#4f46e5] h-2 rounded-full"
                      style={{ width: `${(cat.avg / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent reviews */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Reviews</h2>
            <Link href="/manager/employees" className="text-xs text-[#4f46e5] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {totalReviews === 0 ? (
            <p className="text-sm text-gray-400 italic">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {(reviews as Review[]).map((r) => {
                const emp = r.employee as { full_name: string; avatar_initials: string } | null;
                return (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] text-xs font-bold">
                        {emp?.avatar_initials ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp?.full_name ?? "Unknown"}</p>
                        <p className="text-xs text-gray-500">{r.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {r.overall_score?.toFixed(1) ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pro upsell */}
      {business?.plan === "free" && (
        <div className="rounded-xl bg-[#4f46e5] p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Unlock AI Coaching Summaries</h3>
          <p className="text-indigo-200 text-sm mb-4">
            Upgrade to Pro and get Claude-powered coaching summaries for every review — personalized for each employee.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1 bg-white text-[#4f46e5] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Upgrade to Pro →
          </Link>
        </div>
      )}
    </div>
  );
}
