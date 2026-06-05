"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Star, Users, ClipboardList, Sparkles, BarChart3, CheckCircle, Bell,
} from "lucide-react";

function SceneSignup() {
  return (
    <div className="p-5 bg-gray-50 h-full flex items-center">
      <div className="w-full max-w-[260px] mx-auto">
        <div className="text-center mb-4">
          <div className="w-7 h-7 bg-[#4f46e5] rounded-lg flex items-center justify-center mx-auto mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-[11px] font-bold text-gray-900">Create your account</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Choose your role to get started</p>
        </div>
        <div className="space-y-2 mb-3">
          <div className="border-2 border-[#4f46e5] rounded-lg p-2.5 bg-[#4f46e5]/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#4f46e5]/10 rounded-md flex items-center justify-center">
                <ClipboardList className="w-3 h-3 text-[#4f46e5]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-900">Manager</p>
                <p className="text-[9px] text-gray-500">Create reviews for your team</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-2.5 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                <Users className="w-3 h-3 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-600">Employee</p>
                <p className="text-[9px] text-gray-400">View your performance reviews</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-[10px] text-gray-700">Acme Corp</div>
          <div className="bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-[10px] text-gray-700">Sarah Johnson</div>
          <button className="w-full bg-[#4f46e5] text-white text-[10px] font-semibold py-1.5 rounded-md">
            Create account →
          </button>
        </div>
      </div>
    </div>
  );
}

function SceneDashboard() {
  return (
    <div className="bg-gray-50 h-full">
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#4f46e5] rounded flex items-center justify-center">
            <BarChart3 className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-[#4f46e5]">Standpoint</span>
          <span className="text-[9px] text-gray-400 ml-1">Acme Corp</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[8px] font-bold text-[#4f46e5]">SJ</div>
      </div>
      <div className="p-3 space-y-2.5">
        <div>
          <p className="text-[11px] font-bold text-gray-900">Welcome back, Sarah</p>
          <p className="text-[9px] text-gray-500">Acme Corp · Manager Overview</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { v: "8", l: "Employees" },
            { v: "24", l: "Reviews" },
            { v: "4.2★", l: "Avg Rating" },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-1.5">
              <p className="text-[11px] font-bold text-gray-900">{s.v}</p>
              <p className="text-[8px] text-gray-500">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button className="flex-1 bg-[#4f46e5] text-white text-[9px] font-semibold py-1.5 rounded-md">+ New Review</button>
          <button className="flex-1 bg-white border border-gray-200 text-gray-600 text-[9px] font-semibold py-1.5 rounded-md">Manage Team</button>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-2.5">
          <p className="text-[9px] font-semibold text-gray-600 mb-2">Recent Reviews</p>
          {[
            { name: "Alex Kim", period: "Q4 2024", score: "4.5" },
            { name: "Maria Lopez", period: "Q4 2024", score: "3.8" },
            { name: "Jordan Park", period: "Q3 2024", score: "4.1" },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[7px] font-bold text-[#4f46e5]">{r.name[0]}</div>
                <div>
                  <p className="text-[9px] font-medium text-gray-900">{r.name}</p>
                  <p className="text-[8px] text-gray-400">{r.period}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                <span className="text-[9px] font-semibold text-gray-900">{r.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneReview() {
  return (
    <div className="bg-gray-50 h-full overflow-hidden">
      <div className="p-3">
        <p className="text-[11px] font-bold text-gray-900 mb-0.5">New Performance Review</p>
        <p className="text-[9px] text-gray-500 mb-2.5">Alex Kim · Q4 2024</p>
        <div className="space-y-1.5">
          {[
            { cat: "Communication", stars: 4 },
            { cat: "Productivity", stars: 5 },
            { cat: "Teamwork", stars: 4 },
            { cat: "Leadership", stars: 3 },
            { cat: "Technical Skills", stars: 5 },
          ].map((c) => (
            <div key={c.cat} className="bg-white rounded-lg border border-gray-100 p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-medium text-gray-700">{c.cat}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-2.5 h-2.5 ${s <= c.stars ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-[#4f46e5] h-1 rounded-full" style={{ width: `${c.stars * 20}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-2.5 bg-[#4f46e5] text-white text-[9px] font-semibold py-1.5 rounded-md">
          Submit Review
        </button>
      </div>
    </div>
  );
}

function SceneAI() {
  return (
    <div className="bg-gray-50 h-full p-3">
      <div className="bg-white rounded-lg border border-[#4f46e5]/20 p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-5 h-5 rounded-md bg-[#4f46e5]/10 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-[#4f46e5]" />
          </div>
          <span className="text-[10px] font-semibold text-[#4f46e5]">AI Coaching Summary</span>
          <span className="ml-auto text-[8px] bg-[#4f46e5] text-white rounded px-1 py-0.5">Pro</span>
        </div>
        <div className="space-y-2.5">
          <div>
            <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Strengths</p>
            <p className="text-[9px] text-gray-700 leading-relaxed">Alex demonstrates exceptional technical skills and productivity. Delivers complex features ahead of schedule consistently.</p>
          </div>
          <div>
            <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Growth Areas</p>
            <p className="text-[9px] text-gray-700 leading-relaxed">Leadership presence in team meetings could be stronger. Consider taking ownership of the weekly standup in Q1.</p>
          </div>
          <div>
            <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide mb-1">90-Day Action Plan</p>
            <div className="space-y-1">
              {["Lead 2 sprint retrospectives", "Mentor one junior developer", "Present at team demo day"].map((a) => (
                <div key={a} className="flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 text-[#12b76a] flex-shrink-0" />
                  <span className="text-[9px] text-gray-700">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneNotification() {
  return (
    <div className="bg-gray-50 h-full flex items-center justify-center p-4">
      <div className="w-full max-w-[260px]">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-3 mb-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[9px] font-bold text-[#4f46e5] flex-shrink-0">
              <Bell className="w-3 h-3" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-900">New Review Available</p>
              <p className="text-[9px] text-gray-500 mt-0.5 leading-relaxed">Sarah submitted your Q4 2024 performance review</p>
              <div className="flex items-center gap-0.5 mt-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-2.5 h-2.5 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                ))}
                <span className="text-[9px] font-semibold text-gray-900 ml-1">4.5 overall</span>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full bg-[#4f46e5] text-white text-[10px] font-semibold py-1.5 rounded-lg">
          View Your Review →
        </button>
      </div>
    </div>
  );
}

function SceneEmployeeDash() {
  return (
    <div className="bg-gray-50 h-full">
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#4f46e5] rounded flex items-center justify-center">
            <BarChart3 className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-[#4f46e5]">Standpoint</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[8px] font-bold text-[#4f46e5]">AK</div>
      </div>
      <div className="p-3 space-y-2.5">
        <div>
          <p className="text-[11px] font-bold text-gray-900">Hi, Alex</p>
          <p className="text-[9px] text-gray-500">Your Performance Overview</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ v: "4.5", l: "Overall" }, { v: "8", l: "Reviews" }, { v: "Tech", l: "Top Area" }].map((s) => (
            <div key={s.l} className="bg-white rounded-lg border border-gray-100 p-1.5">
              <p className="text-[11px] font-bold text-gray-900">{s.v}</p>
              <p className="text-[8px] text-gray-500">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-2.5">
          <p className="text-[9px] font-semibold text-gray-600 mb-2">Latest Review — Q4 2024</p>
          {[
            { cat: "Communication", pct: 80 },
            { cat: "Productivity", pct: 100 },
            { cat: "Technical", pct: 100 },
            { cat: "Leadership", pct: 60 },
            { cat: "Teamwork", pct: 80 },
          ].map((c) => (
            <div key={c.cat} className="mb-1.5 last:mb-0">
              <div className="flex justify-between mb-0.5">
                <span className="text-[8px] text-gray-600">{c.cat}</span>
                <span className="text-[8px] font-medium text-gray-900">{c.pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-[#4f46e5] h-1 rounded-full" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneHistory() {
  return (
    <div className="bg-gray-50 h-full p-3">
      <p className="text-[11px] font-bold text-gray-900 mb-2.5">Review History</p>
      <div className="space-y-1.5">
        {[
          { period: "Q4 2024", score: 4.5, trend: "+0.3" },
          { period: "Q3 2024", score: 4.2, trend: "+0.4" },
          { period: "Q2 2024", score: 3.8, trend: "+0.2" },
          { period: "Q1 2024", score: 3.6, trend: null },
        ].map((r) => (
          <div key={r.period} className="bg-white rounded-lg border border-gray-100 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-semibold text-gray-900">{r.period}</span>
              <div className="flex items-center gap-2">
                {r.trend && (
                  <span className="text-[8px] font-medium text-[#12b76a]">↑ {r.trend}</span>
                )}
                <div className="flex items-center gap-0.5">
                  <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                  <span className="text-[9px] font-semibold text-gray-900">{r.score}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div className="bg-[#4f46e5] h-1 rounded-full" style={{ width: `${(r.score / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneTeam() {
  return (
    <div className="bg-gray-50 h-full p-3">
      <p className="text-[11px] font-bold text-gray-900 mb-2.5">Team Performance</p>
      <div className="bg-white rounded-lg border border-gray-100 p-2.5 mb-2">
        <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Category Averages</p>
        {[
          { cat: "Technical Skills", avg: 4.6 },
          { cat: "Productivity", avg: 4.3 },
          { cat: "Communication", avg: 4.0 },
          { cat: "Teamwork", avg: 3.9 },
          { cat: "Leadership", avg: 3.5 },
        ].map((c) => (
          <div key={c.cat} className="mb-1.5 last:mb-0">
            <div className="flex justify-between mb-0.5">
              <span className="text-[8px] text-gray-600">{c.cat}</span>
              <span className="text-[8px] font-medium text-gray-900">{c.avg}/5</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div className="bg-[#4f46e5] h-1 rounded-full" style={{ width: `${(c.avg / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {[
          { name: "Alex Kim", init: "AK", score: 4.5 },
          { name: "Maria Lopez", init: "ML", score: 4.2 },
          { name: "Jordan Park", init: "JP", score: 3.9 },
        ].map((e) => (
          <div key={e.name} className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-2 py-1.5">
            <div className="w-5 h-5 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[7px] font-bold text-[#4f46e5]">{e.init}</div>
            <span className="text-[9px] font-medium text-gray-900 flex-1">{e.name}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
              <span className="text-[9px] font-semibold text-gray-700">{e.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const DEMO_SCENES = [
  SceneSignup,
  SceneDashboard,
  SceneReview,
  SceneAI,
  SceneNotification,
  SceneEmployeeDash,
  SceneHistory,
  SceneTeam,
] as const;

export const DEMO_LABELS = [
  "Manager signup",
  "Manager dashboard",
  "Submit review",
  "AI coaching summary",
  "Employee notification",
  "Employee dashboard",
  "Progress history",
  "Team overview",
];

function BrowserMockup({ children, url = "app.standpoint.co" }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200/80 shadow-2xl bg-white">
      <div className="bg-gray-100 border-b border-gray-200 flex items-center gap-1.5 px-3 py-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 bg-white rounded text-[10px] text-gray-400 px-3 py-1 flex items-center gap-1">
          <span className="text-gray-300">🔒</span> {url}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AutoplayDemo() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % DEMO_SCENES.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const SceneComponent = DEMO_SCENES[current];

  return (
    <div className="relative">
      <BrowserMockup>
        <div className="relative overflow-hidden" style={{ height: 420 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <SceneComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </BrowserMockup>

      <div className="flex justify-center items-center gap-1.5 mt-4">
        {DEMO_SCENES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={DEMO_LABELS[i]}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-[#4f46e5]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
      <p className="text-center text-[11px] text-gray-400 mt-2">{DEMO_LABELS[current]}</p>
    </div>
  );
}

export { BrowserMockup };
