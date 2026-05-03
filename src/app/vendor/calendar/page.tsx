"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DateStatus = "available" | "booked" | "unavailable";

const STATUS_COLORS: Record<DateStatus, string> = {
  available: "bg-green-100 text-green-700 hover:bg-green-200",
  booked: "bg-[#C4547A]/20 text-[#C4547A] hover:bg-[#C4547A]/30",
  unavailable: "bg-gray-100 text-gray-500 hover:bg-gray-200",
};

const STATUS_LABELS: Record<DateStatus, string> = {
  available: "Available",
  booked: "Booked",
  unavailable: "Unavailable",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function VendorCalendarPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vendor, setVendor] = useState<any>(null);
  const [availability, setAvailability] = useState<Record<string, DateStatus>>({});
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedStatus, setSelectedStatus] = useState<DateStatus>("available");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/vendor/login"); return; }

      const { data: v } = await supabase
        .from("vendors")
        .select("id, plan, availability")
        .eq("user_id", user.id)
        .single();

      if (!v) { router.push("/vendor/signup"); return; }
      if (v.plan === "free") { router.push("/vendor/upgrade"); return; }

      setVendor(v);
      setAvailability(v.availability ?? {});
      setLoading(false);
    };
    load();
  }, []);

  const toggleDate = (dateKey: string) => {
    setAvailability(prev => {
      if (prev[dateKey] === selectedStatus) {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      }
      return { ...prev, [dateKey]: selectedStatus };
    });
  };

  const saveCalendar = async () => {
    if (!vendor) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("vendors")
      .update({ availability, updated_at: new Date().toISOString() })
      .eq("id", vendor.id);

    if (error) toast.error("Failed to save");
    else toast.success("Calendar saved!");
    setIsSaving(false);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF7F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C4547A]/30 border-t-[#C4547A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard" className="text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-heading font-bold">Availability Calendar</span>
          </div>
          <button onClick={saveCalendar} disabled={isSaving} className="btn-secondary text-sm px-4 py-2">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <><Save className="w-4 h-4" /> Save</>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status picker */}
        <div className="card p-4 mb-6">
          <p className="text-sm font-body font-medium text-[#3D1A2E]/70 mb-3">
            Click a date to mark it as:
          </p>
          <div className="flex gap-3 flex-wrap">
            {(["available", "booked", "unavailable"] as DateStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-body font-medium transition-all border-2",
                  selectedStatus === status ? "border-[#3D1A2E] scale-105 shadow-sm" : "border-transparent",
                  STATUS_COLORS[status]
                )}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#3D1A2E]/40 font-body mt-2">
            Click same date again to clear it.
          </p>
        </div>

        {/* Calendar */}
        <div className="card p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FDF7F0] transition-colors">
              <ChevronLeft className="w-5 h-5 text-[#3D1A2E]" />
            </button>
            <h2 className="font-heading font-bold text-xl text-[#3D1A2E]">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FDF7F0] transition-colors">
              <ChevronRight className="w-5 h-5 text-[#3D1A2E]" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map(d => (
              <div key={d} className="text-center text-xs font-body font-semibold text-[#3D1A2E]/40 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const status = availability[dateKey];
              const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <button
                  key={day}
                  onClick={() => !isPast && toggleDate(dateKey)}
                  disabled={isPast}
                  className={cn(
                    "aspect-square rounded-xl text-sm font-body font-medium transition-all",
                    isPast && "opacity-30 cursor-not-allowed",
                    !isPast && !status && "hover:bg-[#FDF7F0] text-[#3D1A2E]",
                    status && STATUS_COLORS[status],
                    !status && !isPast && "text-[#3D1A2E]",
                    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear() && !status && "border-2 border-[#C4547A] font-bold"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-[#f3ddb9]">
            {(["available","booked","unavailable"] as DateStatus[]).map(status => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("w-4 h-4 rounded", STATUS_COLORS[status].split(" ")[0])} />
                <span className="text-xs text-[#3D1A2E]/60 font-body">{STATUS_LABELS[status]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border-2 border-[#C4547A]" />
              <span className="text-xs text-[#3D1A2E]/60 font-body">Today</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {(["available","booked","unavailable"] as DateStatus[]).map(status => {
            const count = Object.values(availability).filter(v => v === status).length;
            return (
              <div key={status} className="card p-4 text-center">
                <p className="font-heading font-bold text-2xl text-[#3D1A2E]">{count}</p>
                <p className="text-xs text-[#3D1A2E]/60 font-body capitalize">{status} days</p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[#3D1A2E]/40 font-body text-center mt-6">
          Your availability calendar is visible to families browsing your profile.
        </p>
      </div>
    </div>
  );
}
