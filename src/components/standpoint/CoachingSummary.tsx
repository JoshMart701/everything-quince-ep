"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachingSummaryProps {
  reviewId: string;
  summary: string | null;
  isPro: boolean;
  isManager?: boolean;
}

export function CoachingSummary({ reviewId, summary, isPro, isManager = false }: CoachingSummaryProps) {
  const [currentSummary, setCurrentSummary] = useState(summary);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to generate");
      }
      const data = await res.json();
      setCurrentSummary(data.ai_summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#4f46e5]" />
          <h3 className="font-semibold text-[#4f46e5] text-sm">AI Coaching Summary</h3>
        </div>
        <p className="text-sm text-indigo-700">
          Upgrade to Pro for Claude-powered coaching summaries tailored to each employee.
        </p>
        <a href="/billing" className="mt-2 inline-flex text-sm font-medium text-[#4f46e5] hover:underline">
          Upgrade to Pro →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#4f46e5]" />
          <h3 className="font-semibold text-[#4f46e5] text-sm">AI Coaching Summary</h3>
        </div>
        {isManager && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            {loading ? "Generating…" : currentSummary ? "Regenerate" : "Generate"}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {currentSummary ? (
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {currentSummary}
        </div>
      ) : (
        <p className="text-sm text-indigo-500 italic">
          {isManager
            ? 'Click "Generate" to create an AI coaching summary for this employee.'
            : "Your manager hasn&apos;t generated a coaching summary yet."}
        </p>
      )}
    </div>
  );
}
