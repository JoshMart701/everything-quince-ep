"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Review, ReviewCategory, CategoryStatus } from "@/lib/types";

const CATEGORY_EMOJIS: Record<string, string> = {
  Performance:   "⚡",
  Attitude:      "🤝",
  Reliability:   "🎯",
  Growth:        "📈",
  Communication: "💬",
};

const STATUS_STYLES: Record<CategoryStatus, { badge: string; bar: string; label: string }> = {
  strong:     { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", bar: "bg-emerald-500", label: "Strong"     },
  developing: { badge: "bg-amber-50 text-amber-700 border border-amber-200",       bar: "bg-amber-500",  label: "Developing" },
  needs_work: { badge: "bg-red-50 text-red-700 border border-red-200",             bar: "bg-red-500",    label: "Needs Work" },
};

function reviewAvgPct(r: Review): number | null {
  const cats = r.review_categories ?? [];
  if (cats.length === 0) return r.overall_score !== null ? Math.round((r.overall_score as number) * 20) : null;
  return Math.round(cats.reduce((s, c) => s + c.percentage_score, 0) / cats.length);
}

function statusFromPct(pct: number): CategoryStatus {
  if (pct >= 80) return "strong";
  if (pct >= 60) return "developing";
  return "needs_work";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

interface Props {
  reviews: Review[];
}

export function ReviewHistoryAccordion({ reviews }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <p className="text-gray-400 text-sm">No reviews yet — check back after your first review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const avgPct = reviewAvgPct(review);
        const status = avgPct !== null ? statusFromPct(avgPct) : null;
        const isOpen = openId === review.id;
        const cats   = (review.review_categories ?? []) as ReviewCategory[];

        return (
          <div
            key={review.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Row toggle */}
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : review.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left min-h-[64px] active:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {review.period ?? formatDate(review.created_at)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(review.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                {avgPct !== null && (
                  <span className="font-bold text-gray-900 text-sm tabular-nums">
                    {avgPct}%
                  </span>
                )}
                {status && (
                  <span
                    className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[status].badge}`}
                  >
                    {STATUS_STYLES[status].label}
                  </span>
                )}
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </button>

            {/* Expanded body */}
            {isOpen && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                {/* Category breakdown */}
                {cats.length > 0 && (
                  <div className="space-y-2.5">
                    {cats.map((cat) => {
                      const s = STATUS_STYLES[cat.status];
                      return (
                        <div key={cat.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700 font-medium">
                              {CATEGORY_EMOJIS[cat.category_name] ?? ""} {cat.category_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900 tabular-nums">
                                {cat.percentage_score}%
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.badge}`}
                              >
                                {s.label}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.bar}`}
                              style={{ width: `${cat.percentage_score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI Summary */}
                {review.ai_summary && (
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#4f46e5] mb-2 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full bg-[#4f46e5] inline-block"
                        aria-hidden
                      />
                      AI Coach Summary
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {review.ai_summary}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
