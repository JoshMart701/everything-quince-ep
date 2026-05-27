"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, UserPlus, Mail, Copy, Check, Clock, CheckCircle, Loader2 } from "lucide-react";
import type { Profile, EmployeeInvite } from "@/lib/types";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<EmployeeInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [empRes, invRes] = await Promise.all([
      fetch("/api/employees"),
      fetch("/api/invites"),
    ]);
    const [emp, inv] = await Promise.all([empRes.json(), invRes.json()]);
    setEmployees(emp ?? []);
    setInvites(inv ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setInviteResult(null);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInviteResult({ url: data.inviteUrl });
      setInviteEmail("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your team and send invitations</p>
      </div>

      {/* Invite Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Invite an Employee</h2>
        </div>

        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="employee@company.com"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={inviting}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {inviting ? "Sending…" : "Send Invite"}
          </button>
        </form>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        {inviteResult && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium mb-2">Invite created! Share this link:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteResult.url}
                className="flex-1 text-xs bg-white border border-green-200 rounded px-2 py-1.5 font-mono text-gray-700"
              />
              <button
                onClick={() => copyUrl(inviteResult.url)}
                className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium px-2 py-1.5 bg-white border border-green-200 rounded"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h2 className="font-semibold text-gray-900">Team Members</h2>
          <span className="ml-auto text-xs text-gray-400">{employees.length} employees</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto" />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No employees yet. Invite someone above to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <div key={emp.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{emp.full_name}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                    {emp.title && <p className="text-xs text-gray-400">{emp.title}</p>}
                  </div>
                </div>
                <Link
                  href={`/manager/reviews/new?employeeId=${emp.id}&employeeName=${encodeURIComponent(emp.full_name)}`}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {invites.some((i) => i.status === "pending") && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Pending Invites</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {invites
              .filter((i) => i.status === "pending")
              .map((invite) => (
                <div key={invite.id} className="px-6 py-3 flex items-center justify-between">
                  <p className="text-sm text-gray-700">{invite.invited_email}</p>
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {invites.some((i) => i.status === "accepted") && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">Accepted Invites</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {invites
              .filter((i) => i.status === "accepted")
              .map((invite) => (
                <div key={invite.id} className="px-6 py-3 flex items-center justify-between">
                  <p className="text-sm text-gray-700">{invite.invited_email}</p>
                  <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Joined
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
