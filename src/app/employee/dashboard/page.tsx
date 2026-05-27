import { createClient } from "@/lib/supabase/server";
import { CategoryBreakdown } from "@/components/standpoint/CategoryBreakdown";
import { CoachingSummary } from "@/components/standpoint/CoachingSummary";
import { Star, ClipboardList, TrendingUp, Calendar } from "lucide-react";
import type { PerformanceReview } from "@/lib/types";

export default async function EmployeeDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(name, plan)")
    .eq("id", user!.id)
    .single();

  const org = profile?.organizations as { name: string; plan: string } | null;
  const isPro = org?.plan === "pro";

  const { data: reviews } = await supabase
    .from("performance_reviews")
    .select("*, review_scores(*), manager:profiles!manager_id(full_name)")
    .eq("employee_id", user!.id)
    .order("created_at", { ascending: false });

  const latestReview = reviews?.[0] as PerformanceReview | undefined;

  const allScores = (reviews as PerformanceReview[] ?? []).flatMap((r) => r.review_scores ?? []);

  const overallAvg =
    allScores.length > 0
      ? allScores.reduce((sum, s) => sum + s.rating, 0) / allScores.length
      : null;

  // Category averages across all reviews
  const categoryAvgs: Record<string, number> = {};
  if (allScores.length > 0) {
    const grouped = allScores.reduce<Record<string, number[]>>((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s.rating);
      return acc;
    }, {});
    for (const [cat, vals] of Object.entries(grouped)) {
      categoryAvgs[cat] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }

  const bestCategory = Object.entries(categoryAvgs).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hi, {profile?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your performance overview · {org?.name}
        </p>
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
                {overallAvg !== null ? overallAvg.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-gray-500">Overall Avg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviews?.length ?? 0}</p>
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
              <p className="text-sm font-bold text-gray-900 truncate">
                {bestCategory ? bestCategory[0].replace("_", " ") : "—"}
              </p>
              <p className="text-xs text-gray-500">Top Category</p>
            </div>
          </div>
        </div>
      </div>

      {reviews && reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-400">Your manager hasn&apos;t submitted a review yet.</p>
        </div>
      ) : (
        <>
          {/* Latest Review */}
          {latestReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Latest Review</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {latestReview.period}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Reviewed by{" "}
                    <span className="font-medium text-gray-700">
                      {(latestReview.manager as { full_name: string } | null)?.full_name ?? "Manager"}
                    </span>
                  </p>
                  {latestReview.review_scores && latestReview.review_scores.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-gray-900 text-sm">
                        {(
                          latestReview.review_scores.reduce((s, r) => s + r.rating, 0) /
                          latestReview.review_scores.length
                        ).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {latestReview.review_scores && (
                  <CategoryBreakdown scores={latestReview.review_scores} showNotes />
                )}

                {latestReview.overall_notes && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Manager Notes
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {latestReview.overall_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Coaching Summary */}
              <CoachingSummary
                reviewId={latestReview.id}
                summary={latestReview.coaching_summary}
                generatedAt={latestReview.coaching_generated_at}
                isPro={isPro}
                isManager={false}
              />
            </div>
          )}

          {/* Review History */}
          {reviews && reviews.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Review History</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {(reviews as PerformanceReview[]).slice(1).map((review) => {
                  const avg =
                    review.review_scores && review.review_scores.length > 0
                      ? review.review_scores.reduce((s, r) => s + r.rating, 0) /
                        review.review_scores.length
                      : null;
                  return (
                    <div key={review.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{review.period}</p>
                        {avg !== null && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-gray-700">
                              {avg.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      {review.review_scores && (
                        <CategoryBreakdown scores={review.review_scores} showNotes={false} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
