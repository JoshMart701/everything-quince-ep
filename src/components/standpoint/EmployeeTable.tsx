"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { ReviewSlideOver } from "@/components/standpoint/ReviewSlideOver";
import type { CategoryStatus } from "@/lib/types";

export interface EmployeeRow {
  id: string;
  full_name: string;
  avatar_initials: string;
  role: string;
  avgScore: number | null;
  status: CategoryStatus | null;
  lastReviewedAt: string | null;
  isDue: boolean;
}

interface EmployeeTableProps {
  employees: EmployeeRow[];
}

const STATUS_STYLES: Record<CategoryStatus, string> = {
  strong:     "bg-emerald-50 text-emerald-700",
  developing: "bg-amber-50 text-amber-700",
  needs_work: "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<CategoryStatus, string> = {
  strong:     "Strong",
  developing: "Developing",
  needs_work: "Needs Work",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [selected, setSelected] = useState<EmployeeRow | null>(null);

  if (employees.length === 0) {
    return (
      <>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-500 mb-1">No employees yet</h3>
          <p className="text-sm text-gray-400">
            Share your join code with your team to get started.
          </p>
        </div>
        <ReviewSlideOver employee={null} onClose={() => setSelected(null)} />
      </>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-[280px]">
                Employee
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Avg Score
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Last Reviewed
              </th>
              <th className="px-4 py-3 w-[100px]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {emp.avatar_initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{emp.full_name}</p>
                      {emp.isDue && (
                        <p className="text-xs text-amber-600 font-medium mt-0.5">
                          Due for review
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-500 capitalize">{emp.role}</td>
                <td className="px-4 py-4 font-semibold text-gray-900">
                  {emp.avgScore !== null ? `${Math.round(emp.avgScore)}%` : "—"}
                </td>
                <td className="px-4 py-4">
                  {emp.status ? (
                    <span
                      className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[emp.status]}`}
                    >
                      {STATUS_LABELS[emp.status]}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">No reviews</span>
                  )}
                </td>
                <td className="px-4 py-4 text-gray-500">{formatDate(emp.lastReviewedAt)}</td>
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => setSelected(emp)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {emp.avatar_initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {emp.full_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{emp.role}</p>
                </div>
              </div>
              {emp.isDue && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                  Due
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {emp.avgScore !== null ? `${Math.round(emp.avgScore)}%` : "—"}
                </span>
                {emp.status && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[emp.status]}`}
                  >
                    {STATUS_LABELS[emp.status]}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelected(emp)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#4f46e5] hover:bg-[#4338ca] px-3 py-1.5 rounded-lg transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Review
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Last reviewed: {formatDate(emp.lastReviewedAt)}
            </p>
          </div>
        ))}
      </div>

      <ReviewSlideOver
        employee={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
