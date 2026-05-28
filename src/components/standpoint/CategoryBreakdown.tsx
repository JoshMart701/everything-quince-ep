import { StarRating } from "./StarRating";
import { CATEGORY_STATUS_LABELS, CATEGORY_STATUS_COLORS } from "@/lib/types";
import type { ReviewCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  categories: ReviewCategory[];
  showNotes?: boolean;
}

export function CategoryBreakdown({ categories, showNotes = true }: CategoryBreakdownProps) {
  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const colors = CATEGORY_STATUS_COLORS[cat.status];
        const label  = CATEGORY_STATUS_LABELS[cat.status];
        return (
          <div key={cat.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 text-sm">{cat.category_name}</h3>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full border",
                      colors.bg, colors.text, colors.border
                    )}
                  >
                    {label}
                  </span>
                </div>
                {showNotes && cat.notes && (
                  <p className="mt-1.5 text-sm text-gray-600 italic">&ldquo;{cat.notes}&rdquo;</p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <StarRating value={cat.star_rating} readonly size="sm" />
                <p className="text-xs text-gray-400 mt-0.5">{cat.percentage_score}%</p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-[#4f46e5] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${cat.percentage_score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
