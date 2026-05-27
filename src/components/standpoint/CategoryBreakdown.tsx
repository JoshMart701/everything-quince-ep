import { REVIEW_CATEGORIES, type ReviewScore } from "@/lib/types";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  scores: ReviewScore[];
  showNotes?: boolean;
}

const ratingColors: Record<number, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-emerald-100 text-emerald-700",
  5: "bg-green-100 text-green-700",
};

const ratingLabels: Record<number, string> = {
  1: "Needs Improvement",
  2: "Below Expectations",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
};

export function CategoryBreakdown({ scores, showNotes = true }: CategoryBreakdownProps) {
  const scoreMap = Object.fromEntries(scores.map((s) => [s.category, s]));

  return (
    <div className="space-y-4">
      {REVIEW_CATEGORIES.map((cat) => {
        const score = scoreMap[cat.key];
        if (!score) return null;
        return (
          <div key={cat.key} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{cat.label}</h3>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      ratingColors[score.rating] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {ratingLabels[score.rating]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{cat.description}</p>
                {showNotes && score.notes && (
                  <p className="mt-2 text-sm text-gray-700 italic">&ldquo;{score.notes}&rdquo;</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <StarRating value={score.rating} readonly size="sm" />
                <p className="text-center text-xs text-gray-500 mt-1">{score.rating}/5</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(score.rating / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
