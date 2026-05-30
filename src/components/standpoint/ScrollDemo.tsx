"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { DEMO_SCENES, BrowserMockup } from "./AutoplayDemo";

interface ScrollFeature {
  scene: number;
  eyebrow: string;
  heading: string;
  body: string;
  bullets: string[];
}

const FEATURES: ScrollFeature[] = [
  {
    scene: 0,
    eyebrow: "Onboarding",
    heading: "Up and running in under 5 minutes",
    body: "Create your account, name your business, and share a 6-character join code with your team. No IT setup, no complex permissions.",
    bullets: ["No credit card required", "Free plan available", "Team joins in seconds"],
  },
  {
    scene: 1,
    eyebrow: "Manager Dashboard",
    heading: "Your whole team at a glance",
    body: "See employee count, total reviews, and average rating the moment you log in. Quick-action buttons keep common tasks one click away.",
    bullets: ["Live team stats", "Recent review feed", "One-click new review"],
  },
  {
    scene: 2,
    eyebrow: "Structured Reviews",
    heading: "Consistent, fair evaluations every time",
    body: "Rate each employee across 5 standard categories with star ratings. Add notes to any category for context managers and employees both appreciate.",
    bullets: ["5 standard categories", "Star ratings + written notes", "Automatic score calculation"],
  },
  {
    scene: 3,
    eyebrow: "AI Coaching",
    heading: "Claude writes the coaching summary for you",
    body: "Submit a review and Claude instantly generates a personalized summary — strengths, growth areas, and a concrete 90-day action plan — tailored to each employee's scores.",
    bullets: ["Powered by Claude AI", "Personalized per employee", "90-day action plan included"],
  },
  {
    scene: 4,
    eyebrow: "Employee Visibility",
    heading: "Employees know the moment a review lands",
    body: "Employees receive a clear notification when a new review is submitted, with the overall score shown upfront so there are no surprises.",
    bullets: ["Instant notification", "Overall score preview", "Private and secure"],
  },
  {
    scene: 5,
    eyebrow: "Employee Dashboard",
    heading: "Crystal-clear view of personal performance",
    body: "Employees see their overall average, category-by-category breakdown, and the full coaching summary — all in one clean dashboard built just for them.",
    bullets: ["Overall & per-category scores", "Progress bars for each area", "AI coaching summary"],
  },
  {
    scene: 6,
    eyebrow: "Trend Tracking",
    heading: "Spot growth and celebrate progress",
    body: "Each review adds a data point. Employees and managers can see how scores trend over time, making improvement visible and rewarding.",
    bullets: ["Quarter-over-quarter trends", "Score change indicators", "Full review history"],
  },
  {
    scene: 7,
    eyebrow: "Team Analytics",
    heading: "See where your team shines and where to invest",
    body: "The team overview shows category averages across all employees and ranks individuals by overall score — helping managers know exactly where to focus coaching.",
    bullets: ["Category averages across team", "Individual performance ranking", "Identify coaching priorities"],
  },
];

export function ScrollDemo() {
  const [activeScene, setActiveScene] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setRef = useCallback((el: HTMLDivElement | null, i: number) => {
    itemRefs.current[i] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = itemRefs.current.findIndex((r) => r === entry.target);
            if (idx !== -1) setActiveScene(idx);
          }
        }
      },
      { threshold: 0.5, rootMargin: "-20% 0px -20% 0px" }
    );

    const current = itemRefs.current;
    current.forEach((el) => { if (el) observer.observe(el); });
    return () => current.forEach((el) => { if (el) observer.unobserve(el); });
  }, []);

  const SceneComponent = DEMO_SCENES[FEATURES[activeScene].scene];

  return (
    <div className="flex gap-12 items-start">
      {/* Sticky device */}
      <div className="hidden lg:block w-[440px] flex-shrink-0 sticky top-24">
        <BrowserMockup>
          <div className="relative overflow-hidden" style={{ height: 420 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScene}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <SceneComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </BrowserMockup>

        <div className="flex justify-center gap-1.5 mt-4">
          {FEATURES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeScene ? "w-5 bg-[#4f46e5]" : "w-1 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll items */}
      <div className="flex-1 space-y-0">
        {FEATURES.map((f, i) => {
          const MobileScene = DEMO_SCENES[f.scene];
          return (
            <div
              key={i}
              ref={(el) => setRef(el, i)}
              className={`py-14 transition-opacity duration-300 ${
                i === activeScene ? "opacity-100" : "opacity-40"
              }`}
            >
              <span className="inline-block text-xs font-semibold text-[#4f46e5] bg-[#4f46e5]/8 px-2.5 py-1 rounded-full mb-3">
                {f.eyebrow}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">{f.heading}</h3>
              <p className="text-gray-500 leading-relaxed mb-5">{f.body}</p>
              <ul className="space-y-2">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#12b76a] flex-shrink-0" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Mobile: show scene card below text */}
              <div className="lg:hidden mt-6">
                <BrowserMockup>
                  <div style={{ height: 320 }}>
                    <MobileScene />
                  </div>
                </BrowserMockup>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
