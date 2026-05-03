"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Star, ChevronRight } from "lucide-react";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";

// Sample vendor data for homepage preview
const SAMPLE_VENDORS = [
  {
    id: "1",
    businessName: "Rosa Photography Studio",
    category: "photography",
    city: "El Paso",
    rating: 4.9,
    reviewCount: 127,
    startingPrice: 899,
    plan: "premium",
    isFeature: true,
    description: "Award-winning quinceañera photography capturing your most precious moments.",
    logo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  },
  {
    id: "2",
    businessName: "El Paso Grand Ballroom",
    category: "venues",
    city: "El Paso",
    rating: 4.8,
    reviewCount: 89,
    startingPrice: 2500,
    plan: "pro",
    isFeature: false,
    description: "Stunning 500-guest capacity ballroom with full catering and décor packages.",
    logo: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&h=100&fit=crop&q=80",
  },
  {
    id: "3",
    businessName: "Glamour by Maria",
    category: "hair-makeup",
    city: "El Paso",
    rating: 5.0,
    reviewCount: 203,
    startingPrice: 250,
    plan: "premium",
    isFeature: true,
    description: "Luxury hair and makeup for quinceañeras and entire courts. Mobile service available.",
    logo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&q=80",
  },
  {
    id: "4",
    businessName: "DJ Fuego El Paso",
    category: "djs",
    city: "El Paso",
    rating: 4.7,
    reviewCount: 156,
    startingPrice: 550,
    plan: "pro",
    isFeature: false,
    description: "Bilingual DJ specializing in quinceañeras. Lighting, sound, and MC included.",
    logo: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=100&h=100&fit=crop&q=80",
  },
  {
    id: "5",
    businessName: "Sweet Fifteen Cakes",
    category: "catering",
    city: "Horizon City",
    rating: 4.9,
    reviewCount: 78,
    startingPrice: 350,
    plan: "pro",
    isFeature: false,
    description: "Custom quinceañera cakes and dessert tables. Gluten-free options available.",
    logo: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop&q=80",
  },
  {
    id: "6",
    businessName: "Corona Floral Design",
    category: "florals",
    city: "El Paso",
    rating: 4.8,
    reviewCount: 94,
    startingPrice: 400,
    plan: "premium",
    isFeature: true,
    description: "Exquisite floral arrangements and full event décor for unforgettable quinceañeras.",
    logo: "https://images.unsplash.com/photo-1487530811015-780d15dce33a?w=100&h=100&fit=crop&q=80",
  },
];

export default function VendorDirectory() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const filtered = SAMPLE_VENDORS.filter((v) => {
    const matchesSearch = v.businessName.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
    const matchesCity = selectedCity === "all" || v.city === selectedCity;
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <section id="vendors" className="py-20 bg-[#FDF7F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">Find Local Vendors</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Discover El Paso&apos;s most trusted quinceañera professionals, vetted and ready to make your celebration unforgettable.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D1A2E]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors by name or service..."
                className="input-field pl-10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field md:w-56"
            >
              <option value="all">All Categories</option>
              {VENDOR_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field md:w-44"
            >
              <option value="all">All Cities</option>
              {CITIES.map((city) => (
                <option key={city.slug} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vendor grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filtered.map((vendor) => (
            <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
              <div className="card hover:shadow-[0_8px_32px_rgba(196,84,122,0.15)] transition-all duration-300 hover:-translate-y-1 group">
                {/* Header */}
                <div className="relative h-36 bg-gradient-to-br from-[#3D1A2E] to-[#5c2044] overflow-hidden">
                  {vendor.isFeature && (
                    <div className="absolute top-3 right-3 bg-[#C9A84C] text-[#3D1A2E] text-xs font-bold px-2 py-0.5 rounded-full z-10">
                      ⭐ Featured
                    </div>
                  )}
                  {vendor.plan === "premium" && (
                    <div className="absolute top-3 left-3 badge-premium z-10">Premium</div>
                  )}
                  {vendor.plan === "pro" && (
                    <div className="absolute top-3 left-3 badge-pro z-10">Pro</div>
                  )}
                  <div className="absolute inset-0 opacity-20">
                    <Image
                      src={vendor.logo}
                      alt={vendor.businessName}
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                  {/* Logo */}
                  <div className="absolute bottom-0 left-4 translate-y-1/2">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-3 border-white shadow-lg bg-white">
                      <Image
                        src={vendor.logo}
                        alt={vendor.businessName}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-10">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg leading-tight group-hover:text-[#C4547A] transition-colors">
                      {vendor.businessName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-[#C4547A] font-body font-medium capitalize bg-[#C4547A]/10 px-2 py-0.5 rounded-full">
                      {VENDOR_CATEGORIES.find(c => c.slug === vendor.category)?.label ?? vendor.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#3D1A2E]/60 font-body">
                      <MapPin className="w-3 h-3" />
                      {vendor.city}
                    </span>
                  </div>

                  <p className="text-sm text-[#3D1A2E]/70 font-body mb-4 line-clamp-2">
                    {vendor.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />
                      <span className="font-semibold text-sm text-[#3D1A2E]">{vendor.rating}</span>
                      <span className="text-xs text-[#3D1A2E]/50 font-body">
                        ({vendor.reviewCount})
                      </span>
                    </div>
                    <span className="text-sm font-body text-[#3D1A2E]">
                      From <strong className="text-[#C4547A]">${vendor.startingPrice.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center">
          <Link href="/vendors" className="btn-primary inline-flex items-center gap-2">
            View All {SAMPLE_VENDORS.length}+ Vendors
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
