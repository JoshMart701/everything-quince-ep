import { createClient } from "@/lib/supabase/server";
import { ClipboardList } from "lucide-react";
import type { CategoryStatus } from "@/lib/types";

function statusFromPct(pct: number): CategoryStatus {
  if (pct >= 80) return "strong";
  if (pct >= 60) return "developing";
  return "needs_work";
}

const STATUS_STYLES: Record<CategoryStatus, { badge: string; label: string }> = {
  strong:     { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Strong"     },
  developing: { badge: "bg-amber-50 text-amber-700 border border-amber-200",       label: "Developing" },
  needs_work: { badge: "bg-red-50 text-red-700 border border-red-200",             label: "Needs Work" },
};

type ReviewRow = {
  id: string;
  employee_id: string;
  created_at: string;
  review_categories: { percentage_score: number }[];
};

function avgCategoryScore(r: ReviewRow): number | null {
  const cats = r.review_categories;
  if (!cats || cats.length === 0) return null;
  return Math.round(cats.reduce((s, c) => s + c.percentage_score, 0) / cats.length);
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_id, full_name")
    .eq("user_id", user!.id)
    .single();

  const businessId = profile?.business_id;

  if (!businessId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8">
        <p className="text-gray-500">No business found for your account.</p>
      </div>
    );
  }

  const [{ data: rawEmployees }, { data: rawReviews }, { data: business }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_initials, role")
        .eq("business_id", businessId)
        .eq("role", "employee")
        .order("full_name"),
      supabase
        .from("reviews")
        .select("id, employee_id, created_at, review_categories(percentage_score)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single(),
    ]);

  const reviews = (rawReviews ?? []) as ReviewRow[];
  const employees = rawEmployees ?? [];

  // Group reviews by employee (already sorted desc → first = most recent)
  const reviewsByEmployee: Record<string, ReviewRow[]> = {};
  for (const r of reviews) {
    if (!reviewsByEmployee[r.employee_id]) reviewsByEmployee[r.employee_id] = [];
    reviewsByEmployee[r.employee_id].push(r);
  }

  // Build per-employee computed data
  const employeeData = employees.map((emp) => {
    const empReviews = reviewsByEmployee[emp.id] ?? [];
    const latest     = empReviews[0] ?? null;
    const previous   = empReviews[1] ?? null;

    const currentScore  = latest   ? avgCategoryScore(latest)   : null;
    const previousScore = previous ? avgCategoryScore(previous) : null;

    const trend  = currentScore !== null && previousScore !== null ? currentScore - previousScore : null;
    const isDrop = trend !== null && trend <= -5;

    return {
      id:              emp.id,
      full_name:       emp.full_name,
      avatar_initials: emp.avatar_initials,
      role:            emp.role as string,
      currentScore,
      previousScore,
      trend,
      isDrop,
      lastReviewedAt:  latest?.created_at ?? null,
    };
  });

  const dropCount = employeeData.filter((e) => e.isDrop).length;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Team</h1>
        <p className="text-sm text-gray-500 mt-1">
          {employees.length} employee{employees.length !== 1 ? "s" : ""}{business?.name ? ` · ${business.name}` : ""}
        </p>
      </div>

      {/* Drop warning banner */}
      {dropCount > 0 && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-600 flex-shrink-0">⚠</span>
          <p className="text-sm text-amber-800 font-medium">
            {dropCount} employee{dropCount !== 1 ? "s" : ""} need attention — score dropped 5%+ since last review.
          </p>
        </div>
      )}

      {/* Empty state */}
      {employees.length === 0 && (
        <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
          <ClipboardList className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-500 mb-1">No employees yet</h3>
          <p className="text-sm text-gray-400">Share your join code to get started.</p>
        </div>
      )}

      {/* Employee grid */}
      {employees.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employeeData.map((emp) => {
            const status = emp.currentScore !== null ? statusFromPct(emp.currentScore) : null;
            const statusStyle = status ? STATUS_STYLES[status] : null;

            return (
              <div
                key={emp.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1 space-y-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {emp.avatar_initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{emp.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{emp.role}</p>
                    </div>
                  </div>

                  {/* Score + status badge */}
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-gray-900 tabular-nums">
                      {emp.currentScore !== null ? `${emp.currentScore}%` : "—"}
                    </span>
                    {statusStyle && (
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.badge}`}
                      >
                        {statusStyle.label}
                      </span>
                    )}
                  </div>

                  {/* Trend chip */}
                  <div>
                    {emp.trend === null && emp.currentScore !== null && (
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        → No prior review
                      </span>
                    )}
                    {emp.trend === null && emp.currentScore === null && (
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        No reviews
                      </span>
                    )}
                    {emp.trend !== null && emp.trend > 0 && (
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        ↑ +{emp.trend}%
                      </span>
                    )}
                    {emp.trend !== null && emp.trend < 0 && (
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">
                        ↓ {emp.trend}%
                      </span>
                    )}
                    {emp.trend !== null && emp.trend === 0 && (
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        → No change
                      </span>
                    )}
                  </div>

                  {/* Last reviewed */}
                  <p className="text-xs text-gray-400">
                    Last reviewed: {formatDate(emp.lastReviewedAt)}
                  </p>
                </div>

                {/* Drop warning strip */}
                {emp.isDrop && emp.trend !== null && (
                  <div className="bg-red-50 border-t border-red-100 px-4 py-2 flex items-center gap-1.5">
                    <span className="text-red-500 text-xs">⚠</span>
                    <p className="text-xs font-medium text-red-700">
                      Dropped {Math.abs(emp.trend)}% — needs attention
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
