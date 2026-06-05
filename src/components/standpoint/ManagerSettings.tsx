"use client";

import { useState } from "react";
import Link from "next/link";

interface EmployeeEntry {
  id: string;
  full_name: string;
  avatar_initials: string;
  created_at: string;
}

interface Props {
  businessId: string;
  initialBusinessName: string;
  joinCode: string | null;
  appUrl: string;
  employees: EmployeeEntry[];
  subscriptionStatus: string | null;
  hasStripeCustomer: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ManagerSettings({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  businessId: _businessId,
  initialBusinessName,
  joinCode,
  appUrl,
  employees: initialEmployees,
  subscriptionStatus,
  hasStripeCustomer,
}: Props) {
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [bizSaving, setBizSaving] = useState(false);
  const [bizMessage, setBizMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [employees, setEmployees] = useState<EmployeeEntry[]>(initialEmployees);

  const [copied, setCopied] = useState(false);

  const [portalLoading, setPortalLoading] = useState(false);

  const joinLink = joinCode ? `${appUrl}/auth/signup?join=${joinCode}` : "";

  // ── Business name save ─────────────────────────────────────────
  const handleSaveBusiness = async () => {
    if (!businessName.trim()) return;
    setBizSaving(true);
    setBizMessage(null);
    try {
      const res = await fetch("/api/standpoint/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setBizMessage({ type: "error", text: data.error ?? "Failed to save." });
      } else {
        setBizMessage({ type: "success", text: "Saved!" });
      }
    } catch {
      setBizMessage({ type: "error", text: "Network error." });
    } finally {
      setBizSaving(false);
    }
  };

  // ── Copy join link ─────────────────────────────────────────────
  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Remove employee ────────────────────────────────────────────
  const handleRemoveEmployee = async (emp: EmployeeEntry) => {
    if (!window.confirm(`Remove ${emp.full_name}? They will lose access.`)) return;
    try {
      const res = await fetch(`/api/standpoint/employees/${emp.id}`, { method: "DELETE" });
      if (res.ok) {
        setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
      }
    } catch {
      // silent — could add error toast
    }
  };

  // ── Stripe portal ──────────────────────────────────────────────
  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your business, team, and subscription.</p>
      </div>

      {/* ── Section 1: Business ──────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Business</h2>

        {/* Business name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="biz-name">
            Business name
          </label>
          <div className="flex gap-2">
            <input
              id="biz-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
            />
            <button
              onClick={handleSaveBusiness}
              disabled={bizSaving}
              className="px-4 py-2 bg-[#4f46e5] text-white text-sm font-semibold rounded-lg hover:bg-[#4338ca] transition-colors disabled:opacity-60"
            >
              {bizSaving ? "Saving…" : "Save"}
            </button>
          </div>
          {bizMessage && (
            <p className={`text-xs mt-1 ${bizMessage.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {bizMessage.text}
            </p>
          )}
        </div>

        {/* Join link */}
        {joinCode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee join link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={joinLink}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Join code:{" "}
              <span className="font-mono font-bold text-[#4f46e5] bg-[#4f46e5]/10 px-2 py-0.5 rounded">
                {joinCode}
              </span>
            </p>
          </div>
        )}
      </section>

      {/* ── Section 2: Team Members ──────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Team Members</h2>

        {employees.length === 0 ? (
          <p className="text-sm text-gray-400">No employees yet.</p>
        ) : (
          <ul className="space-y-3">
            {employees.map((emp) => (
              <li key={emp.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {emp.avatar_initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{emp.full_name}</p>
                    <p className="text-xs text-gray-400">Joined {formatDate(emp.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveEmployee(emp)}
                  className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Section 3: Subscription ──────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Subscription</h2>

        {!subscriptionStatus && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">No active plan.</p>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] transition-colors"
            >
              Start free trial →
            </Link>
          </div>
        )}

        {subscriptionStatus === "trialing" && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Free trial
            </span>
            <button
              onClick={handlePortal}
              disabled={portalLoading || !hasStripeCustomer}
              className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] disabled:opacity-60 transition-colors"
            >
              {portalLoading ? "Loading…" : "Manage subscription"}
            </button>
          </div>
        )}

        {subscriptionStatus === "active" && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active
            </span>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] disabled:opacity-60 transition-colors"
            >
              {portalLoading ? "Loading…" : "Manage subscription"}
            </button>
          </div>
        )}

        {subscriptionStatus === "past_due" && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              Payment failed
            </span>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-60 transition-colors"
            >
              {portalLoading ? "Loading…" : "Update payment method"}
            </button>
          </div>
        )}

        {subscriptionStatus === "canceled" && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              Canceled
            </span>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] transition-colors"
            >
              Resubscribe →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
