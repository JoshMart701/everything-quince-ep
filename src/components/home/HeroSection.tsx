"use client";

import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VENDOR_CATEGORIES } from "@/lib/constants";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/vendors?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3D1A2E] via-[#5c2044] to-[#C4547A]" />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#C4547A]/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />

      {/* Floating decorations */}
      <div className="absolute top-32 left-16 text-4xl opacity-20 animate-pulse">✨</div>
      <div className="absolute top-48 right-24 text-3xl opacity-20 animate-pulse delay-100">🌹</div>
      <div className="absolute bottom-40 right-16 text-4xl opacity-20 animate-pulse delay-200">👑</div>
      <div className="absolute bottom-32 left-24 text-3xl opacity-20 animate-pulse delay-75">💐</div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-white/90 text-sm font-body font-medium">
              El Paso&apos;s #1 Quinceañera Planning Hub
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Plan the{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#C9A84C] to-[#e5c97a] bg-clip-text text-transparent">
                Quinceañera
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A84C] to-[#e5c97a] rounded-full" />
            </span>
            {" "}of Her Dreams
          </h1>

          <p className="font-body text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with El Paso&apos;s most trusted quinceañera vendors — from stunning venues
            and photographers to dresses, DJs, and everything in between.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
            <div className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden">
              <Search className="absolute left-5 w-5 h-5 text-[#3D1A2E]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues, photographers, DJs..."
                className="flex-1 pl-14 pr-4 py-4 text-[#3D1A2E] font-body text-base focus:outline-none bg-transparent placeholder:text-[#3D1A2E]/40"
              />
              <button
                type="submit"
                className="m-1.5 bg-[#C4547A] text-white font-body font-semibold px-6 py-3 rounded-xl hover:bg-[#b03a63] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category quick links */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {VENDOR_CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-body px-4 py-2 rounded-full transition-all duration-200"
              >
                <span>{cat.icon}</span>
                <span>{cat.label.split(" ")[0]}</span>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto">
            {[
              { value: "200+", label: "Local Vendors" },
              { value: "1,500+", label: "Quinces Planned" },
              { value: "4.9★", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-2xl md:text-3xl font-bold text-[#C9A84C]">
                  {stat.value}
                </p>
                <p className="font-body text-xs md:text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 20C1440 20 1080 80 720 80C360 80 0 20 0 20L0 80Z" fill="#FDF7F0" />
        </svg>
      </div>
    </section>
  );
}
