"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Star } from "lucide-react";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Vendor {
  id: string;
  business_name: string;
  slug: string;
  category: string;
  city: string;
  description: string;
  logo_url?: string;
  plan: string;
  is_featured: boolean;
  average_rating: number;
  review_count: number;
  starting_price?: number;
  status: string;
}

export default function VendorsListClient() {
  const searchParams = useSearchParams();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    params.set("page", page.toString());

    const res = await fetch(`/api/vendors?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setVendors(data.vendors ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    }
    setIsLoading(false);
  }, [search, category, city, page]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const getCategoryIcon = (slug: string) =>
    VENDOR_CATEGORIES.find((c) => c.slug === slug)?.icon ?? "🏢";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-card border border-[#f3ddb9] p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D1A2E]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search vendors..."
              className="input-field pl-10"
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="input-field md:w-56"
          >
            <option value="">All Categories</option>
            {VENDOR_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.label}</option>
            ))}
          </select>

          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1); }}
            className="input-field md:w-44"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={cn("px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all", !category ? "bg-[#3D1A2E] text-white" : "border border-[#f3ddb9] text-[#3D1A2E]/60 hover:border-[#C4547A]/30")}
          >
            All
          </button>
          {VENDOR_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setCategory(cat.slug); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all flex items-center gap-1",
                category === cat.slug ? "bg-[#C4547A] text-white" : "border border-[#f3ddb9] text-[#3D1A2E]/60 hover:border-[#C4547A]/30")}
            >
              <span>{cat.icon}</span>
              {cat.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#3D1A2E]/60 font-body text-sm">
          {isLoading ? "Loading..." : `${total} vendors found`}
          {category && ` in ${VENDOR_CATEGORIES.find(c => c.slug === category)?.label}`}
          {city && ` in ${city}`}
        </p>
      </div>

      {/* Vendor Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-36 bg-[#f3ddb9]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#f3ddb9] rounded w-3/4" />
                <div className="h-3 bg-[#f3ddb9] rounded w-1/2" />
                <div className="h-3 bg-[#f3ddb9] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="font-heading text-xl font-bold text-[#3D1A2E] mb-2">No vendors found</h3>
          <p className="text-[#3D1A2E]/60 font-body mb-4">Try adjusting your filters or search term</p>
          <button onClick={() => { setSearch(""); setCategory(""); setCity(""); }} className="btn-outline">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.slug || vendor.id}`}>
                <div className="card hover:shadow-[0_8px_32px_rgba(196,84,122,0.15)] transition-all duration-300 hover:-translate-y-1 group">
                  <div className="relative h-36 bg-gradient-to-br from-[#3D1A2E] to-[#5c2044] overflow-hidden">
                    {vendor.is_featured && (
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
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                      {getCategoryIcon(vendor.category)}
                    </div>
                    {vendor.logo_url && (
                      <Image
                        src={vendor.logo_url}
                        alt={vendor.business_name}
                        fill
                        className="object-cover opacity-30"
                        sizes="400px"
                      />
                    )}
                    <div className="absolute bottom-0 left-4 translate-y-1/2">
                      <div className="w-14 h-14 rounded-xl bg-white border-2 border-white shadow-lg flex items-center justify-center text-2xl">
                        {getCategoryIcon(vendor.category)}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-10">
                    <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg mb-1 group-hover:text-[#C4547A] transition-colors">
                      {vendor.business_name}
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-[#C4547A] font-medium capitalize bg-[#C4547A]/10 px-2 py-0.5 rounded-full">
                        {VENDOR_CATEGORIES.find(c => c.slug === vendor.category)?.label ?? vendor.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#3D1A2E]/60 font-body">
                        <MapPin className="w-3 h-3" />{vendor.city}
                      </span>
                    </div>
                    <p className="text-sm text-[#3D1A2E]/70 mb-4 line-clamp-2 font-body">{vendor.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />
                        <span className="font-semibold text-sm text-[#3D1A2E]">
                          {vendor.average_rating > 0 ? vendor.average_rating : "New"}
                        </span>
                        <span className="text-xs text-[#3D1A2E]/50 font-body">({vendor.review_count})</span>
                      </div>
                      {vendor.starting_price && (
                        <span className="text-sm font-body text-[#3D1A2E]">
                          From <strong className="text-[#C4547A]">${vendor.starting_price.toLocaleString()}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-sm font-semibold transition-all",
                    page === p
                      ? "bg-[#C4547A] text-white"
                      : "bg-white border border-[#f3ddb9] text-[#3D1A2E]/70 hover:border-[#C4547A]/30"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
