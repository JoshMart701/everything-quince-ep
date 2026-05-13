"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { VENDOR_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Find Vendors", href: "/vendors" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Budget Calculator", href: "/#budget" },
  { label: "Planning Checklist", href: "/#checklist" },
  { label: "Get Quotes", href: "/#quotes" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_16px_rgba(61,26,46,0.08)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌹</span>
            <div>
              <span className={cn("font-heading font-bold text-lg leading-none", scrolled ? "text-[#3D1A2E]" : "text-white")}>
                Everything Quince
              </span>
              <span className={cn("block text-xs font-body leading-none", scrolled ? "text-[#C4547A]" : "text-[#C9A84C]")}>
                El Paso
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-body font-medium text-sm transition-colors duration-200",
                  scrolled ? "text-[#3D1A2E]/80 hover:text-[#C4547A]" : "text-white/90 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories dropdown */}
            <div className="relative group">
              <button
                className={cn(
                  "flex items-center gap-1 font-body font-medium text-sm transition-colors duration-200",
                  scrolled ? "text-[#3D1A2E]/80 hover:text-[#C4547A]" : "text-white/90 hover:text-white"
                )}
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                Categories <ChevronDown className="w-3 h-3" />
              </button>
              {categoriesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_8px_32px_rgba(61,26,46,0.15)] border border-[#f3ddb9] py-2 z-50"
                  onMouseEnter={() => setCategoriesOpen(true)}
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  {VENDOR_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FDF7F0] transition-colors"
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-body text-sm text-[#3D1A2E]">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/vendor/login"
              className={cn(
                "font-body font-medium text-sm transition-colors duration-200",
                scrolled ? "text-[#3D1A2E]/80 hover:text-[#C4547A]" : "text-white/90 hover:text-white"
              )}
            >
              Vendor Login
            </Link>
            <Link
              href="/vendor/signup"
              className="bg-[#C4547A] text-white font-body font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#b03a63] transition-all duration-200 hover:shadow-lg"
            >
              List Your Business
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className={cn("md:hidden", scrolled ? "text-[#3D1A2E]" : "text-white")}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#f3ddb9] shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block font-body font-medium text-[#3D1A2E]/80 hover:text-[#C4547A] py-2.5 border-b border-[#f3ddb9]/50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 space-y-1">
              {VENDOR_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-[#3D1A2E]/70 hover:text-[#C4547A]"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
            <div className="pt-4 space-y-3 border-t border-[#f3ddb9]">
              <Link href="/vendor/login" className="block text-center font-body font-medium text-[#3D1A2E]/80 py-2">
                Vendor Login
              </Link>
              <Link
                href="/vendor/signup"
                onClick={() => setOpen(false)}
                className="block text-center bg-[#C4547A] text-white font-body font-semibold px-5 py-3 rounded-full hover:bg-[#b03a63] transition-all"
              >
                List Your Business
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
