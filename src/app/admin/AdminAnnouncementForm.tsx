"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function AdminAnnouncementForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "pro" | "premium">("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, target }),
      });

      if (!res.ok) throw new Error("Failed to send");

      const { count } = await res.json();
      toast.success(`Announcement sent to ${count} vendors!`);
      setSubject("");
      setBody("");
    } catch {
      toast.error("Failed to send announcement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {(["all", "pro", "premium"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTarget(t)}
            className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all capitalize ${
              target === t ? "bg-[#C4547A] text-white" : "border border-[#f3ddb9] text-[#3D1A2E]/70 hover:border-[#C4547A]/30"
            }`}
          >
            {t === "all" ? "All Vendors" : `${t.charAt(0).toUpperCase() + t.slice(1)} Only`}
          </button>
        ))}
      </div>

      <div>
        <label className="label">Subject *</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. New Feature Announcement"
          className="input-field"
        />
      </div>

      <div>
        <label className="label">Message Body *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Write your announcement here. HTML is supported."
          className="input-field resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={isLoading}
        className="btn-primary"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Announcement
          </>
        )}
      </button>
    </div>
  );
}
