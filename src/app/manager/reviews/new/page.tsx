"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { StarRating } from "@/components/standpoint/StarRating";
import { DEFAULT_REVIEW_CATEGORIES, deriveStatus, derivePercentage } from "@/lib/types";
import type { Profile } from "@/lib/types";

interface CategoryState {
  category_name: string;
  star_rating: number;
  notes: string;
}

function NewReviewForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const preId   = searchParams.get("employeeId") ?? "";
  const preName = searchParams.get("employeeName") ?? "";

  const [employees, setEmployees]       = useState<Profile[]>([]);
  const [loadingEmps, setLoadingEmps]   = useState(true);
  const [employeeId, setEmployeeId]     = useState(preId);
  const [period, setPeriod]             = useState(() => {
    const now = new Date();
    return `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
  });
  const [overallNotes, setOverallNotes] = useState("");
  const [categories, setCategories]     = useState<CategoryState[]>(
    DEFAULT_REVIEW_CATEGORIES.map((name) => ({ category_name: name, star_rating: 0, notes: "" }))
  );
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    const res  = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data ?? []);
    setLoadingEmps(false);
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const updateCategory = (
    idx: number,
    field: "star_rating" | "notes",
    value: number | string
  ) => {
    setCategories((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) { setError("Please select an employee"); return; }
    const unrated = categories.filter((c) => c.star_rating === 0);
    if (unrated.length > 0) { setError("Please rate all categories"); return; }

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
          categories: categories.map((c) => ({
            category_name:    c.category_name,
            star_rating:      c.star_rating,
            percentage_score: derivePercentage(c.star_rating),
            status:           deriveStatus(c.star_rating),
            notes:            c.notes.trim() || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      router.push("/manager/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const rated    = categories.filter((c) => c.star_rating > 0);
  const avgStars = rated.length > 0
    ? rated.reduce((s, c) => s + c.star_rating, 0) / rated.length
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/manager/employees" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Review</h1>
          <p className="text-sm text-gray-500">Rate across 5 categories with notes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee + Period */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            {preId ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-sm font-bold">
                  {preName.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">{preName}</span>
              </div>
            ) : loadingEmps ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm p-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : (
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              >
                <option value="">Select an employee…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.full_name} — {emp.email}</option>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
              placeholder="e.g. Q2 2025, Annual 2025"
            />
          </div>
        </div>

        {/* Category Ratings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Category Ratings</h2>
            {avgStars !== null && (
              <span className="text-sm text-gray-500">
                Avg: <span className="text-[#4f46e5] font-semibold">{avgStars.toFixed(1)}/5</span>
              </span>
            )}
          </div>

          <div className="space-y-6">
            {categories.map((cat, i) => {
              const statusLabel =
                cat.star_rating > 0
                  ? cat.star_rating >= 4 ? "Strong" : cat.star_rating === 3 ? "Developing" : "Needs Work"
                  : null;
              return (
                <div key={cat.category_name} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{cat.category_name}</h3>
                      {statusLabel && (
                        <span className={`text-xs font-medium ${
                          cat.star_rating >= 4 ? "text-emerald-600" :
                          cat.star_rating === 3 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {statusLabel} · {derivePercentage(cat.star_rating)}%
                        </span>
                      )}
                    </div>
                    <StarRating
                      value={cat.star_rating}
                      onChange={(v) => updateCategory(i, "star_rating", v)}
                    />
                  </div>
                  <textarea
                    value={cat.notes}
                    onChange={(e) => updateCategory(i, "notes", e.target.value)}
                    rows={2}
                    placeholder={`Notes for ${cat.category_name.toLowerCase()}…`}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Overall Notes</h2>
          <textarea
            value={overallNotes}
            onChange={(e) => setOverallNotes(e.target.value)}
            rows={4}
            placeholder="Summarize this review period — achievements, focus areas, context…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#4f46e5] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#4338ca] transition-colors disabled:opacity-50 text-sm"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
          <Link
            href="/manager/dashboard"
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto animate-pulse space-y-6"><div className="h-16 bg-gray-100 rounded-xl" /><div className="h-64 bg-gray-100 rounded-xl" /></div>}>
      <NewReviewForm />
    </Suspense>
  );
}
