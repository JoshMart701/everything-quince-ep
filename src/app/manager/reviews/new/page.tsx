"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ClipboardList, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { StarRating } from "@/components/standpoint/StarRating";
import { REVIEW_CATEGORIES } from "@/lib/types";
import type { Profile, ReviewCategory } from "@/lib/types";

interface ScoreState {
  category: ReviewCategory;
  rating: number;
  notes: string;
}

export default function NewReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedId = searchParams.get("employeeId") ?? "";
  const preselectedName = searchParams.get("employeeName") ?? "";

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [employeeId, setEmployeeId] = useState(preselectedId);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
  });
  const [overallNotes, setOverallNotes] = useState("");

  const initialScores: ScoreState[] = REVIEW_CATEGORIES.map((cat) => ({
    category: cat.key,
    rating: 0,
    notes: "",
  }));
  const [scores, setScores] = useState<ScoreState[]>(initialScores);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data ?? []);
    setLoadingEmployees(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const updateScore = (index: number, field: "rating" | "notes", value: number | string) => {
    setScores((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId) {
      setError("Please select an employee");
      return;
    }

    const unrated = scores.filter((s) => s.rating === 0);
    if (unrated.length > 0) {
      setError("Please rate all 5 categories");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          period,
          overallNotes: overallNotes.trim() || undefined,
          scores: scores.map((s) => ({
            category: s.category,
            rating: s.rating,
            notes: s.notes.trim() || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");

      router.push("/manager/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const averageRating =
    scores.filter((s) => s.rating > 0).length > 0
      ? scores.filter((s) => s.rating > 0).reduce((s, r) => s + r.rating, 0) /
        scores.filter((s) => s.rating > 0).length
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/manager/employees" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Performance Review</h1>
          <p className="text-gray-500 text-sm">Rate across 5 categories with optional notes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee + Period */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            {preselectedId ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                  {preselectedName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">{preselectedName}</span>
              </div>
            ) : loadingEmployees ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm p-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading employees…
              </div>
            ) : (
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select an employee…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} — {emp.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Period</label>
            <input
              type="text"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Q1 2025, Annual 2025"
            />
          </div>
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-gray-900">Category Ratings</h2>
            </div>
            {averageRating !== null && (
              <div className="text-sm font-medium text-gray-500">
                Avg: <span className="text-indigo-600">{averageRating.toFixed(1)}/5</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {REVIEW_CATEGORIES.map((cat, i) => (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{cat.label}</h3>
                    <p className="text-xs text-gray-500">{cat.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StarRating
                      value={scores[i].rating}
                      onChange={(val) => updateScore(i, "rating", val)}
                    />
                    {scores[i].rating > 0 && (
                      <p className="text-center text-xs text-gray-400 mt-0.5">
                        {scores[i].rating}/5
                      </p>
                    )}
                  </div>
                </div>
                <textarea
                  value={scores[i].notes}
                  onChange={(e) => updateScore(i, "notes", e.target.value)}
                  rows={2}
                  placeholder={`Optional notes for ${cat.label.toLowerCase()}…`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overall Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Overall Manager Notes</h2>
          <textarea
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            rows={4}
            placeholder="Summarize this review period — key achievements, areas to watch, etc."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
          <Link
            href="/manager/dashboard"
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
