"use client";

import { useState, useCallback } from "react";
import { BUDGET_CATEGORIES } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export default function BudgetCalculator() {
  const [totalBudget, setTotalBudget] = useState(10000);
  const [customPercents, setCustomPercents] = useState<Record<string, number>>(
    Object.fromEntries(BUDGET_CATEGORIES.map((cat) => [cat.id, cat.defaultPercent]))
  );

  const totalPercent = Object.values(customPercents).reduce((a, b) => a + b, 0);

  const handleSliderChange = useCallback(
    (id: string, value: number) => {
      setCustomPercents((prev) => {
        const others = Object.entries(prev).filter(([k]) => k !== id);
        const remainingPercent = 100 - value;
        const currentOtherTotal = others.reduce((a, [, v]) => a + v, 0);

        if (currentOtherTotal === 0) return { ...prev, [id]: value };

        const adjusted = Object.fromEntries(
          others.map(([k, v]) => [k, Math.round((v / currentOtherTotal) * remainingPercent)])
        );
        return { ...adjusted, [id]: value };
      });
    },
    []
  );

  const categoryAmounts = BUDGET_CATEGORIES.map((cat) => ({
    ...cat,
    amount: Math.round((customPercents[cat.id] / 100) * totalBudget),
    percent: customPercents[cat.id],
  }));

  return (
    <section id="budget" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">Budget Calculator</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Drag the sliders to allocate your quinceañera budget across each category.
            We&apos;ll show you exactly how much to set aside.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Controls */}
          <div className="space-y-6">
            {/* Total Budget */}
            <div className="card p-6">
              <label className="label text-base font-heading font-semibold text-[#3D1A2E] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#C9A84C]" />
                Total Quinceañera Budget
              </label>
              <div className="mt-3">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={2000}
                    max={50000}
                    step={500}
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    className="flex-1 accent-[#C4547A]"
                  />
                  <div className="bg-[#3D1A2E] text-white font-heading font-bold text-xl px-4 py-2 rounded-xl min-w-[120px] text-center">
                    {formatCurrency(totalBudget)}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-[#3D1A2E]/50 mt-1 px-0">
                  <span>$2,000</span>
                  <span>$50,000</span>
                </div>
              </div>
            </div>

            {/* Category sliders */}
            <div className="card p-6 space-y-5">
              <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg flex items-center gap-2">
                Adjust by Category
                <span className="text-sm font-body font-normal text-[#3D1A2E]/50 ml-auto">
                  Total: {totalPercent}%
                </span>
              </h3>
              {BUDGET_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-2 text-sm font-body font-medium text-[#3D1A2E]">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#C4547A]">
                        {formatCurrency(Math.round((customPercents[cat.id] / 100) * totalBudget))}
                      </span>
                      <span className="text-xs text-[#3D1A2E]/50">
                        ({customPercents[cat.id]}%)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={customPercents[cat.id]}
                    onChange={(e) => handleSliderChange(cat.id, Number(e.target.value))}
                    className="w-full accent-[#C4547A]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary / Chart */}
          <div className="space-y-6">
            {/* Budget breakdown */}
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg mb-5">
                Your Budget Breakdown
              </h3>

              {/* Donut chart (CSS-based) */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {categoryAmounts.reduce(
                    (acc, cat, i) => {
                      const colors = ["#C4547A", "#C9A84C", "#3D1A2E", "#a03e7a", "#906523", "#612349"];
                      const strokeDasharray = `${cat.percent} ${100 - cat.percent}`;
                      const strokeDashoffset = -acc.offset;
                      acc.offset += cat.percent;
                      acc.elements.push(
                        <circle
                          key={cat.id}
                          r="15.9"
                          cx="50"
                          cy="50"
                          fill="none"
                          stroke={colors[i]}
                          strokeWidth="31.8"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                      return acc;
                    },
                    { offset: 0, elements: [] as React.ReactElement[] }
                  ).elements}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-bold text-2xl text-[#3D1A2E]">
                    {formatCurrency(totalBudget)}
                  </span>
                  <span className="text-xs text-[#3D1A2E]/60">Total</span>
                </div>
              </div>

              <div className="space-y-3">
                {categoryAmounts.map((cat, i) => {
                  const colors = ["bg-[#C4547A]", "bg-[#C9A84C]", "bg-[#3D1A2E]", "bg-[#a03e7a]", "bg-[#906523]", "bg-[#612349]"];
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full flex-shrink-0", colors[i])} />
                      <span className="text-sm font-body text-[#3D1A2E] flex-1">{cat.label}</span>
                      <span className="text-sm font-semibold text-[#3D1A2E]">
                        {formatCurrency(cat.amount)}
                      </span>
                      <span className="text-xs text-[#3D1A2E]/50 w-8 text-right">
                        {cat.percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-[#3D1A2E] to-[#5c2044] rounded-2xl p-6 text-white">
              <h4 className="font-heading font-bold text-xl mb-2">Ready to get quotes?</h4>
              <p className="text-white/70 text-sm mb-4">
                Share your budget with top El Paso vendors and receive personalized quotes.
              </p>
              <a href="#quotes" className="btn-secondary w-full text-center">
                Get Free Quotes
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
