"use client";

import { useState } from "react";

interface Props {
  initialFullName: string;
}

export function EmployeeSettings({ initialFullName }: Props) {
  const [fullName, setFullName] = useState(initialFullName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/standpoint/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setMessage({ type: "error", text: data.error ?? "Failed to save." });
      } else {
        setMessage({ type: "success", text: "Saved!" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile.</p>
      </div>

      {/* ── Profile section ──────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Profile</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="full-name">
            Full name
          </label>
          <div className="flex gap-2">
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#4f46e5] text-white text-sm font-semibold rounded-lg hover:bg-[#4338ca] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
          {message && (
            <p className={`text-xs mt-1 ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
        </div>
      </section>

      {/* ── Notifications section ─────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Notifications</h2>
        <p className="text-sm text-gray-500">
          Email notifications will be added in a future update.
        </p>
      </section>
    </div>
  );
}
