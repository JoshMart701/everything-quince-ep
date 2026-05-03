import Link from "next/link";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#3D1A2E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🌹</span>
              <div>
                <p className="font-heading font-bold text-xl leading-none">Everything Quince</p>
                <p className="text-[#C9A84C] text-sm">El Paso</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              El Paso&apos;s premier quinceañera planning hub. Connecting families with
              trusted local vendors since 2024.
            </p>
            <div className="flex gap-3">
              {["📸", "📘", "🎵", "📌"].map((icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#C4547A] transition-colors"
                >
                  <span className="text-sm">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-[#C9A84C]">Vendor Categories</h4>
            <ul className="space-y-2">
              {VENDOR_CATEGORIES.slice(0, 8).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-2"
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-[#C9A84C]">Cities We Serve</h4>
            <ul className="space-y-2 mb-6">
              {CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/cities/${city.slug}`}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {city.name}, {city.state}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-heading font-semibold text-lg mb-4 text-[#C9A84C]">Planning Tools</h4>
            <ul className="space-y-2">
              {[
                { label: "Budget Calculator", href: "/#budget" },
                { label: "Planning Checklist", href: "/#checklist" },
                { label: "Price Guide", href: "/#prices" },
                { label: "Inspiration Gallery", href: "/#gallery" },
                { label: "Get Free Quotes", href: "/#quotes" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-[#C9A84C]">For Vendors</h4>
            <ul className="space-y-2 mb-6">
              {[
                { label: "List Your Business (Free)", href: "/vendor/signup" },
                { label: "Vendor Dashboard", href: "/vendor/dashboard" },
                { label: "Upgrade to Pro – $49/mo", href: "/vendor/upgrade" },
                { label: "Premium Plan – $149/mo", href: "/vendor/upgrade" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="bg-white/10 rounded-2xl p-5">
              <p className="font-heading font-semibold text-lg mb-1">Reach More Families</p>
              <p className="text-white/70 text-sm mb-4">
                Get discovered by hundreds of quinceañera families in El Paso.
              </p>
              <Link
                href="/vendor/signup"
                className="block text-center bg-[#C9A84C] text-[#3D1A2E] font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-[#e5c97a] transition-all"
              >
                Get Listed Free
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Everything Quince EP. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((item) => (
              <Link key={item} href="#" className="text-white/50 hover:text-white text-sm transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
