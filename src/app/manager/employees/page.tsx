"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Copy, Check, Loader2, ClipboardList } from "lucide-react";
import type { Profile, Business } from "@/lib/types";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [business, setBusiness]   = useState<Business | null>(null);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);

  const fetchData = useCallback(async () => {
    const [empRes, bizRes] = await Promise.all([
      fetch("/api/employees"),
      fetch("/api/businesses"),
    ]);
    const [emp, biz] = await Promise.all([empRes.json(), bizRes.json()]);
    setEmployees(emp ?? []);
    setBusiness(biz ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyJoinCode = async () => {
    if (!business?.join_code) return;
    await navigator.clipboard.writeText(business.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your employees and share the join code</p>
      </div>

      {/* Join Code Card */}
      {business?.join_code && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Team Join Code</h2>
          <p className="text-sm text-gray-500 mb-4">
            Share this code with employees so they can create their accounts.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
              <span className="font-mono text-3xl font-bold tracking-[0.3em] text-[#4f46e5] select-all">
                {business.join_code}
              </span>
            </div>
            <button
              onClick={copyJoinCode}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Employees go to the sign-up page, choose &ldquo;I&apos;m an Employee&rdquo;, and enter this code.
          </p>
        </div>
      )}

      {/* Employee List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#4f46e5]" />
          <h2 className="font-semibold text-gray-900">Employees</h2>
          <span className="ml-auto text-xs text-gray-400">{employees.length} members</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#4f46e5] mx-auto" />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No employees yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Share the join code above so your team can sign up.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <div key={emp.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#4f46e5] font-bold text-sm">
                    {emp.avatar_initials}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{emp.full_name}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </div>
                </div>
                <Link
                  href={`/manager/reviews/new?employeeId=${emp.id}&employeeName=${encodeURIComponent(emp.full_name)}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#4f46e5] hover:text-[#4338ca] px-3 py-1.5 border border-[#4f46e5]/30 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
