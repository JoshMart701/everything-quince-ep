import { createClient } from "@/lib/supabase/server";
import { CategoryBreakdown } from "@/components/standpoint/CategoryBreakdown";
import { CoachingSummary } from "@/components/standpoint/CoachingSummary";
import { Star, ClipboardList, TrendingUp, Calendar } from "lucide-react";
import type { Review } from "@/lib/types";

export default async function EmployeeDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_initials, businesses(name, plan)")
    .eq("user_id", user!.id)
    .single();

  const biz    = profile?.businesses as unknown as { name: string; plan: string } | null;
  const isPro  = biz?.plan === "pro";

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, review_categories(*), manager:profiles!manager_id(full_name)")
    .eq("employee_id", profile!.id)
    .order("created_at", { ascending: false });

  const reviewList = (reviews ?? []) as Review[];
  const latest     = reviewList[0];

  const allCats = reviewList.flatMap((r) => r.review_categories ?? []);
  const globalAvg =
    allCats.length > 0
      ? allCats.reduce((s, c) => s + c.star_rating, 0) / allCats.length
      : null;

  const bestCat = allCats.length > 0
    ? Object.entries(
        allCats.reduce<Record<string, number[]>>((acc, c) => {
          if (!acc[c.category_name]) acc[c.category_name] = [];
          acc[c.category_name].push(c.star_rating);
          return acc;
        }, {})
      )
      .map(([name, vals]) => ({ name, avg: vals.reduce((a, b) => a + b, 0) / vals.length }))
      .sort((a, b) => b.avg - a.avg)[0]
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hi, {profile?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{biz?.name} · Your Performance Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {globalAvg !== null ? globalAvg.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-gray-500">Overall Avg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-[#4f46e5]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviewList.length}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 capitalize truncate">
                {bestCat?.name ?? "—"}
              </p>
              <p className="text-xs text-gray-500">Top Category</p>
            </div>
          </div>
        </div>
      </div>

      {reviewList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-500 mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-400">Your manager hasn&apos;t submitted a review yet.</p>
        </div>
      ) : (
        <>
          {/* Latest Review */}
          {latest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Latest Review</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {latest.period}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    By{" "}
                    <span className="font-medium text-gray-700">
                      {(latest.manager as { full_name: string } | null)?.full_name ?? "Manager"}
                    </span>
                  </p>
                  {latest.overall_score !== null && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-gray-900 text-sm">
                        {latest.overall_score?.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {latest.review_categories && latest.review_categories.length > 0 && (
                  <CategoryBreakdown categories={latest.review_categories} showNotes />
                )}

                {latest.overall_notes && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Manager Notes
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{latest.overall_notes}</p>
                  </div>
                )}
              </div>

              <CoachingSummary
                reviewId={latest.id}
                summary={latest.ai_summary}
                isPro={isPro}
                isManager={false}
              />
            </div>
          )}

          {/* History */}
          {reviewList.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Review History</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {reviewList.slice(1).map((rev) => (
                  <div key={rev.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-900">{rev.period}</p>
                      {rev.overall_score !== null && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-gray-700">
                            {rev.overall_score?.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    {rev.review_categories && rev.review_categories.length > 0 && (
                      <CategoryBreakdown categories={rev.review_categories} showNotes={false} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
