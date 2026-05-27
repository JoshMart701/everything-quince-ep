import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Star, ClipboardList, TrendingUp, ChevronRight } from "lucide-react";
import { REVIEW_CATEGORIES } from "@/lib/types";
import type { PerformanceReview } from "@/lib/types";

export default async function ManagerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, full_name")
    .eq("id", user!.id)
    .single();

  const [
    { data: employees },
    { data: reviews },
    { data: org },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, title")
      .eq("org_id", profile!.org_id)
      .eq("role", "employee"),
    supabase
      .from("performance_reviews")
      .select("*, review_scores(*), employee:profiles!employee_id(full_name)")
      .eq("org_id", profile!.org_id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("organizations")
      .select("name, plan")
      .eq("id", profile!.org_id)
      .single(),
  ]);

  const totalReviews = reviews?.length ?? 0;
  const employeeCount = employees?.length ?? 0;

  // Compute average scores per category across all reviews
  const categoryAverages = REVIEW_CATEGORIES.map((cat) => {
    const allScores = (reviews as PerformanceReview[] ?? [])
      .flatMap((r) => r.review_scores ?? [])
      .filter((s) => s.category === cat.key);
    const avg =
      allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s.rating, 0) / allScores.length
        : null;
    return { ...cat, avg };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{org?.name} · Manager Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{employeeCount}</p>
              <p className="text-xs text-gray-500">Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalReviews > 0
                  ? (
                      (reviews as PerformanceReview[])
                        .flatMap((r) => r.review_scores ?? [])
                        .reduce((sum, s) => sum + s.rating, 0) /
                      ((reviews as PerformanceReview[]).flatMap((r) => r.review_scores ?? []).length || 1)
                    ).toFixed(1)
                  : "—"}
              </p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/manager/reviews/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          New Review
        </Link>
        <Link
          href="/manager/employees"
          className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Users className="w-4 h-4" />
          Manage Employees
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">Team Performance</h2>
          </div>
          {totalReviews === 0 ? (
            <p className="text-sm text-gray-400 italic">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryAverages.map((cat) => (
                <div key={cat.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.label}</span>
                    <span className="font-medium text-gray-900">
                      {cat.avg !== null ? `${cat.avg.toFixed(1)}/5` : "—"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: cat.avg !== null ? `${(cat.avg / 5) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Reviews</h2>
            <Link
              href="/manager/employees"
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {!reviews || reviews.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {(reviews as PerformanceReview[]).map((review) => {
                const avgRating =
                  review.review_scores && review.review_scores.length > 0
                    ? review.review_scores.reduce((s, r) => s + r.rating, 0) /
                      review.review_scores.length
                    : 0;
                const employeeName =
                  (review.employee as { full_name: string } | null)?.full_name ?? "Unknown";
                return (
                  <div
                    key={review.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{employeeName}</p>
                      <p className="text-xs text-gray-500">{review.period}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pro upsell if on free plan */}
      {org?.plan === "free" && (
        <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Unlock AI Coaching Summaries</h3>
          <p className="text-indigo-100 text-sm mb-4">
            Upgrade to Pro and get Claude-powered coaching summaries for every employee review.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1 bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Upgrade to Pro →
          </Link>
        </div>
      )}
    </div>
  );
}
