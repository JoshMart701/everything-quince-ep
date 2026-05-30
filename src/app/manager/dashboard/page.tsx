import { createClient } from "@/lib/supabase/server";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { EmployeeTable } from "@/components/standpoint/EmployeeTable";
import type { EmployeeRow } from "@/components/standpoint/EmployeeTable";
import type { CategoryStatus } from "@/lib/types";

function statusFromPct(pct: number): CategoryStatus {
  if (pct >= 80) return "strong";
  if (pct >= 60) return "developing";
  return "needs_work";
}

function employeeIsDue(lastReviewedAt: string | null): boolean {
  if (!lastReviewedAt) return true;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(lastReviewedAt) < thirtyDaysAgo;
}

type ReviewRow = {
  id: string;
  employee_id: string;
  overall_score: number | null;
  created_at: string;
  review_categories: { percentage_score: number }[];
};

export default async function ManagerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_id, full_name")
    .eq("user_id", user!.id)
    .single();

  const businessId = profile!.business_id;

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
        .select("id, employee_id, overall_score, created_at, review_categories(percentage_score)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("businesses")
        .select("name, plan, join_code")
        .eq("id", businessId)
        .single(),
    ]);

  const reviews = (rawReviews ?? []) as ReviewRow[];

  // Group reviews by employee (already sorted desc, so first = most recent)
  const reviewsByEmployee: Record<string, ReviewRow[]> = {};
  for (const r of reviews) {
    if (!reviewsByEmployee[r.employee_id]) reviewsByEmployee[r.employee_id] = [];
    reviewsByEmployee[r.employee_id].push(r);
  }

  // Build per-employee rows
  const employeeRows: EmployeeRow[] = (rawEmployees ?? []).map((emp) => {
    const empReviews = reviewsByEmployee[emp.id] ?? [];

    // Avg score across all reviews: use category percentage_scores if available
    let avgScore: number | null = null;
    if (empReviews.length > 0) {
      const allPcts: number[] = empReviews.flatMap((r) => {
        const cats = r.review_categories;
        if (cats.length > 0) return cats.map((c) => c.percentage_score);
        // Fallback: overall_score is avg star rating (1–5); *20 converts to %
        return r.overall_score !== null ? [r.overall_score * 20] : [];
      });
      avgScore =
        allPcts.length > 0
          ? allPcts.reduce((a, b) => a + b, 0) / allPcts.length
          : null;
    }

    const lastReviewedAt = empReviews[0]?.created_at ?? null;

    return {
      id:             emp.id,
      full_name:      emp.full_name,
      avatar_initials: emp.avatar_initials,
      role:           emp.role,
      avgScore,
      status:         avgScore !== null ? statusFromPct(avgScore) : null,
      lastReviewedAt,
      isDue:          employeeIsDue(lastReviewedAt),
    };
  });

  // KPI calculations
  const totalEmployees = employeeRows.length;
  const scoredEmployees = employeeRows.filter((e) => e.avgScore !== null);
  const teamAvgPct =
    scoredEmployees.length > 0
      ? Math.round(
          scoredEmployees.reduce((s, e) => s + e.avgScore!, 0) / scoredEmployees.length
        )
      : null;
  const dueCount = employeeRows.filter((e) => e.isDue).length;

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hey, {firstName} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">
          {business?.name} · Manager Dashboard
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users className="w-5 h-5 text-[#4f46e5]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              <p className="text-xs text-gray-500">Total Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {teamAvgPct !== null ? `${teamAvgPct}%` : "—"}
              </p>
              <p className="text-xs text-gray-500">Avg Team Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${dueCount > 0 ? "bg-amber-50" : "bg-gray-50"}`}>
              <AlertCircle
                className={`w-5 h-5 ${dueCount > 0 ? "text-amber-500" : "text-gray-400"}`}
              />
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${dueCount > 0 ? "text-amber-600" : "text-gray-900"}`}
              >
                {dueCount}
              </p>
              <p className="text-xs text-gray-500">Due for Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Your Team</h2>
          {business?.join_code && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              Join code:
              <span className="font-mono font-bold text-[#4f46e5] bg-[#4f46e5]/8 px-2 py-0.5 rounded">
                {business.join_code}
              </span>
            </div>
          )}
        </div>
        <EmployeeTable employees={employeeRows} />
      </div>

      {/* Pro upsell */}
      {business?.plan === "free" && (
        <div className="rounded-xl bg-[#4f46e5] p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Unlock AI Coaching Summaries</h3>
          <p className="text-indigo-200 text-sm mb-4">
            Upgrade to Pro and get Claude-powered coaching summaries for every review —
            personalized for each employee.
          </p>
          <a
            href="/billing"
            className="inline-flex items-center gap-1 bg-white text-[#4f46e5] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Upgrade to Pro →
          </a>
        </div>
      )}
    </div>
  );
}
