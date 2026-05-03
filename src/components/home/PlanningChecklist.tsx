"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { PLANNING_CHECKLIST } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SESSION_KEY = "quince-checklist";

export default function PlanningChecklist() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedTimelines, setExpandedTimelines] = useState<Set<string>>(new Set(["18–12 months", "12–9 months"]));

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      setCompleted(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleTask = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const toggleTimeline = (timeline: string) => {
    setExpandedTimelines((prev) => {
      const next = new Set(prev);
      if (next.has(timeline)) next.delete(timeline);
      else next.add(timeline);
      return next;
    });
  };

  const timelines = Array.from(new Set(PLANNING_CHECKLIST.map((t) => t.timeline)));
  const totalCompleted = completed.size;
  const totalTasks = PLANNING_CHECKLIST.length;
  const progress = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <section id="checklist" className="py-20 bg-[#FDF7F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">Quinceañera Planning Checklist</h2>
          <p className="section-subtitle">
            25 essential tasks to ensure your daughter&apos;s quinceañera is perfect.
            Check them off as you go — your progress is saved locally.
          </p>
        </div>

        {/* Progress bar */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg">Your Progress</h3>
            <span className="font-body font-bold text-[#C4547A] text-lg">
              {totalCompleted} / {totalTasks}
            </span>
          </div>
          <div className="w-full bg-[#f3ddb9] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#C4547A] to-[#C9A84C] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-[#3D1A2E]/60 mt-2 font-body">
            {progress === 100
              ? "🎉 You&apos;re all set! Your quinceañera planning is complete!"
              : progress > 50
              ? "✨ Great progress! You&apos;re more than halfway there!"
              : "🌹 Start checking off tasks to track your planning progress!"}
          </p>
        </div>

        {/* Checklist by timeline */}
        <div className="space-y-4">
          {timelines.map((timeline) => {
            const tasks = PLANNING_CHECKLIST.filter((t) => t.timeline === timeline);
            const doneCount = tasks.filter((t) => completed.has(t.id)).length;
            const isExpanded = expandedTimelines.has(timeline);

            return (
              <div key={timeline} className="card overflow-hidden">
                <button
                  onClick={() => toggleTimeline(timeline)}
                  className="w-full flex items-center justify-between p-5 hover:bg-[#FDF7F0] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm",
                        doneCount === tasks.length
                          ? "bg-[#C4547A] text-white"
                          : "bg-[#f3ddb9] text-[#3D1A2E]"
                      )}
                    >
                      {doneCount}/{tasks.length}
                    </div>
                    <div className="text-left">
                      <p className="font-heading font-semibold text-[#3D1A2E]">{timeline}</p>
                      <p className="text-xs text-[#3D1A2E]/50 font-body">
                        {tasks.length} tasks • {doneCount} completed
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#3D1A2E]/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#3D1A2E]/40" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-[#f3ddb9] divide-y divide-[#f3ddb9]/50">
                    {tasks.map((task) => {
                      const done = completed.has(task.id);
                      return (
                        <button
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#FDF7F0] transition-colors",
                            done && "opacity-70"
                          )}
                        >
                          {done ? (
                            <CheckCircle2 className="w-5 h-5 text-[#C4547A] flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#3D1A2E]/30 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={cn("font-body text-sm text-[#3D1A2E]", done && "line-through")}>
                              {task.task}
                            </p>
                          </div>
                          <span className="text-xs bg-[#f3ddb9] text-[#3D1A2E]/60 px-2 py-0.5 rounded-full font-body">
                            {task.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-[#3D1A2E]/60 font-body mb-4">Need help finding vendors for these tasks?</p>
          <a href="/vendors" className="btn-primary">
            Browse All Vendors
          </a>
        </div>
      </div>
    </section>
  );
}
