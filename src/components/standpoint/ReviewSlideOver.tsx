"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/standpoint/StarRating";
import type { CategoryStatus } from "@/lib/types";

const REVIEW_CATEGORIES = [
  "Performance",
  "Attitude",
  "Reliability",
  "Growth",
  "Communication",
] as const;

type SubmitStep = "idle" | "saving" | "coaching" | "email";

interface CategoryState {
  name: string;
  stars: number;
  notes: string;
  notesOpen: boolean;
}

export interface SlideOverEmployee {
  id: string;
  full_name: string;
  avatar_initials: string;
}

interface ReviewSlideOverProps {
  employee: SlideOverEmployee | null;
  onClose: () => void;
}

const STATUS_STYLES: Record<CategoryStatus, string> = {
  strong:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
  developing: "bg-amber-50 text-amber-700 border border-amber-200",
  needs_work: "bg-red-50 text-red-700 border border-red-200",
};

const STATUS_LABELS: Record<CategoryStatus, string> = {
  strong:     "Strong",
  developing: "Developing",
  needs_work: "Needs Work",
};

function statusFromPct(pct: number): CategoryStatus {
  if (pct >= 80) return "strong";
  if (pct >= 60) return "developing";
  return "needs_work";
}

function defaultPeriod(): string {
  const now = new Date();
  return `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;
}

function freshCategories(): CategoryState[] {
  return REVIEW_CATEGORIES.map((name) => ({
    name,
    stars: 0,
    notes: "",
    notesOpen: false,
  }));
}

export function ReviewSlideOver({ employee, onClose }: ReviewSlideOverProps) {
  const router = useRouter();

  const [period, setPeriod]         = useState(defaultPeriod);
  const [categories, setCategories] = useState<CategoryState[]>(freshCategories);
  const [step, setStep]             = useState<SubmitStep>("idle");
  const [error, setError]           = useState<string | null>(null);

  const isOpen     = !!employee;
  const submitting = step !== "idle";

  // Reset form whenever a different employee is selected.
  // Capture the id as a primitive so the effect dep is stable.
  const employeeId = employee?.id;
  useEffect(() => {
    if (employeeId) {
      setPeriod(defaultPeriod());
      setCategories(freshCategories());
      setStep("idle");
      setError(null);
    }
  }, [employeeId]);

  const updateStars = (idx: number, stars: number) =>
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, stars } : c)));

  const updateNotes = (idx: number, notes: string) =>
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, notes } : c)));

  const toggleNotes = (idx: number) =>
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, notesOpen: !c.notesOpen } : c))
    );

  const ratedCats  = categories.filter((c) => c.stars > 0);
  const overallPct =
    ratedCats.length > 0
      ? Math.round(ratedCats.reduce((s, c) => s + c.stars * 20, 0) / ratedCats.length)
      : null;

  const stepLabel: Record<SubmitStep, string> = {
    idle:     "",
    saving:   "Saving review…",
    coaching: "Generating AI coaching summary…",
    email:    "Notifying employee…",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || submitting) return;

    if (categories.some((c) => c.stars === 0)) {
      setError("Please rate all 5 categories before submitting.");
      return;
    }

    setError(null);

    try {
      // 1 — save review
      setStep("saving");
      const reviewRes = await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          employeeId: employee.id,
          period,
          categories: categories.map((c) => ({
            category_name: c.name,
            star_rating:   c.stars,
            notes:         c.notes.trim() || undefined,
          })),
        }),
      });

      const reviewData = await reviewRes.json() as { review?: { id: string }; error?: string };
      if (!reviewRes.ok) throw new Error(reviewData.error ?? "Failed to save review");
      const reviewId = reviewData.review!.id;

      // 2 — generate AI coaching summary (non-fatal if it fails)
      setStep("coaching");
      try {
        await fetch(`/api/reviews/${reviewId}/coaching`, { method: "POST" });
      } catch {
        // Coaching failure is non-fatal — review is already saved
      }

      // 3 — send email notification
      setStep("email");
      await fetch("/api/send-review-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reviewId }),
      });

      toast.success(`Review submitted for ${employee.full_name}!`, {
        description: "Coaching summary generated and employee notified.",
      });

      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("idle");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={employee ? `Review form for ${employee.full_name}` : "Review form"}
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {employee?.avatar_initials ?? ""}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {employee?.full_name ?? ""}
              </p>
              <p className="text-xs text-gray-500">New Review</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto">
          <form id="review-slide-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Period */}
            <div>
              <label
                htmlFor="review-period"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Review Period
              </label>
              <input
                id="review-period"
                type="text"
                required
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                placeholder="e.g. May 2026"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Category Ratings</h3>
              <div className="space-y-3">
                {categories.map((cat, i) => {
                  const pct    = cat.stars > 0 ? cat.stars * 20 : null;
                  const status = pct !== null ? statusFromPct(pct) : null;

                  return (
                    <div key={cat.name} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                            {cat.name}
                          </span>
                          {status && pct !== null && (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[status]}`}
                            >
                              {pct}% · {STATUS_LABELS[status]}
                            </span>
                          )}
                        </div>
                        <StarRating
                          value={cat.stars}
                          onChange={(v) => updateStars(i, v)}
                          size="sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleNotes(i)}
                        className="flex items-center gap-1 text-xs text-[#4f46e5] hover:text-[#4338ca] transition-colors"
                      >
                        {cat.notesOpen ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        {cat.notesOpen ? "Hide notes" : "Add notes +"}
                      </button>

                      {cat.notesOpen && (
                        <textarea
                          value={cat.notes}
                          onChange={(e) => updateNotes(i, e.target.value)}
                          rows={2}
                          placeholder={`Notes for ${cat.name.toLowerCase()}…`}
                          className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall preview */}
            {overallPct !== null && (
              <div className="bg-[#4f46e5]/5 border border-[#4f46e5]/20 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-[#4f46e5]">Overall Score Preview</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-[#4f46e5]/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4f46e5] rounded-full transition-all duration-300"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#4f46e5] tabular-nums">
                    {overallPct}%
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          {submitting && (
            <p className="text-xs text-gray-400 text-center mb-2">{stepLabel[step]}</p>
          )}
          <button
            type="submit"
            form="review-slide-form"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#4f46e5] text-white font-semibold py-3 rounded-xl hover:bg-[#4338ca] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {submitting ? "Submitting…" : "Submit & Generate Coaching Summary"}
          </button>
        </div>
      </div>
    </>
  );
}
