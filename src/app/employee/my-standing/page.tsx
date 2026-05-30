import { createClient } from "@/lib/supabase/server";
import { Instrument_Serif } from "next/font/google";
import { Calendar } from "lucide-react";
import { ReviewHistoryAccordion } from "@/components/standpoint/ReviewHistoryAccordion";
import type { Review, ReviewCategory, CategoryStatus } from "@/lib/types";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

const CATEGORY_EMOJIS: Record<string, string> = {
  Performance:   "⚡",
  Attitude:      "🤝",
  Reliability:   "🎯",
  Growth:        "📈",
  Communication: "💬",
};

const STATUS_STYLES: Record<CategoryStatus, { label: string; badge: string; bar: string; hero: string }> = {
  strong:     { label: "Strong",     badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", bar: "bg-emerald-500", hero: "bg-white/20 text-white border border-white/30" },
  developing: { label: "Developing", badge: "bg-amber-50 text-amber-700 border border-amber-200",       bar: "bg-amber-500",   hero: "bg-white/20 text-white border border-white/30" },
  needs_work: { label: "Needs Work", badge: "bg-red-50 text-red-700 border border-red-200",             bar: "bg-red-500",     hero: "bg-white/20 text-white border border-white/30" },
};

function statusFromPct(pct: number): CategoryStatus {
  if (pct >= 80) return "strong";
  if (pct >= 60) return "developing";
  return "needs_work";
}

function reviewAvgPct(r: Review): number | null {
  const cats = r.review_categories ?? [];
  if (cats.length === 0) {
    return r.overall_score !== null ? Math.round((r.overall_score as number) * 20) : null;
  }
  return Math.round(cats.reduce((s, c) => s + c.percentage_score, 0) / cats.length);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
    year:  "numeric",
  });
}

export default async function MyStandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_initials, businesses(name, plan)")
    .eq("user_id", user!.id)
    .single();

  const biz = profile?.businesses as unknown as { name: string; plan: string } | null;

  const { data: rawReviews } = await supabase
    .from("reviews")
    .select("*, review_categories(*)")
    .eq("employee_id", profile!.id)
    .order("created_at", { ascending: false });

  const reviews   = (rawReviews ?? []) as Review[];
  const latest    = reviews[0] ?? null;
  const previous  = reviews[1] ?? null;

  const latestAvgPct  = latest   ? reviewAvgPct(latest)   : null;
  const prevAvgPct    = previous ? reviewAvgPct(previous) : null;

  const trend       = latestAvgPct !== null && prevAvgPct !== null ? latestAvgPct - prevAvgPct : null;
  const isImproving = trend !== null && trend > 0;

  const overallStatus = latestAvgPct !== null ? statusFromPct(latestAvgPct) : null;
  const latestCats    = (latest?.review_categories ?? []) as ReviewCategory[];

  return (
    <div className="space-y-6 pb-10">

      {/* Top header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{biz?.name}</p>
          {latest && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Last reviewed {formatDate(latest.created_at)}
            </div>
          )}
        </div>
        {isImproving && (
          <span className="flex-shrink-0 mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ↑ Improving
          </span>
        )}
      </div>

      {/* Hero card */}
      {latestAvgPct !== null && overallStatus !== null ? (
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }}
        >
          {/* Decorative circle */}
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: "white" }}
            aria-hidden
          />

          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
            Overall Standing
          </p>

          <div className="flex items-end gap-4 mb-4">
            <span
              className={`${serif.className} text-7xl font-normal leading-none`}
            >
              {latestAvgPct}%
            </span>
            <div className="mb-2 flex flex-col gap-1.5">
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[overallStatus].hero}`}
              >
                {STATUS_STYLES[overallStatus].label}
              </span>
              {trend !== null && (
                <span className="text-sm font-semibold text-white/80">
                  {trend >= 0 ? `↑ +${trend}%` : `↓ ${trend}%`} vs last review
                </span>
              )}
            </div>
          </div>

          <p className="text-white/60 text-xs">{latest?.period ?? "Latest review"}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-400 text-sm">
            No reviews yet — your manager will submit one soon.
          </p>
        </div>
      )}

      {/* Category grid */}
      {latestCats.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Category Scores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {latestCats.map((cat) => {
              const s = STATUS_STYLES[cat.status];
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {CATEGORY_EMOJIS[cat.category_name] ?? ""}{" "}
                      {cat.category_name}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${s.badge}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2 tabular-nums">
                    {cat.percentage_score}%
                  </p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.bar} transition-all`}
                      style={{ width: `${cat.percentage_score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Coach Summary */}
      {latest?.ai_summary && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#4f46e5] animate-pulse flex-shrink-0"
              aria-hidden
            />
            <h2 className="font-semibold text-gray-900 text-sm">AI Coach Summary</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {latest.ai_summary}
          </p>
        </div>
      )}

      {/* Review History */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Review History</h2>
        <ReviewHistoryAccordion reviews={reviews} />
      </div>
    </div>
  );
}
