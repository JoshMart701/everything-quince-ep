"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Heart, ZoomIn } from "lucide-react";

const GALLERY_ITEMS = [
  { id: 1, src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80", alt: "Elegant ballroom quinceañera", category: "venues", tags: ["elegant", "ballroom"] },
  { id: 2, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80", alt: "Garden ceremony", category: "venues", tags: ["outdoor", "garden"] },
  { id: 3, src: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80", alt: "Floral decorations", category: "florals", tags: ["flowers", "centerpieces"] },
  { id: 4, src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80", alt: "Three-tier celebration cake", category: "cakes", tags: ["cake", "dessert"] },
  { id: 5, src: "https://images.unsplash.com/photo-1570174007290-73fb32e77379?w=600&q=80", alt: "Pink quinceañera dress", category: "dresses", tags: ["dress", "pink", "gown"] },
  { id: 6, src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80", alt: "Reception dance floor", category: "entertainment", tags: ["dance", "party"] },
  { id: 7, src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80", alt: "Hair and makeup", category: "beauty", tags: ["makeup", "hair"] },
  { id: 8, src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80", alt: "Professional photography", category: "photography", tags: ["photo", "portrait"] },
  { id: 9, src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80", alt: "Champagne tower", category: "catering", tags: ["champagne", "celebration"] },
  { id: 10, src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80", alt: "Purple and gold theme", category: "themes", tags: ["purple", "gold", "royal"] },
  { id: 11, src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", alt: "Tiara and accessories", category: "jewelry", tags: ["tiara", "crown"] },
  { id: 12, src: "https://images.unsplash.com/photo-1529636562189-d99c5b33e5ef?w=600&q=80", alt: "Invitation suite", category: "invitations", tags: ["invitations", "stationery"] },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "venues", label: "Venues" },
  { id: "florals", label: "Florals" },
  { id: "dresses", label: "Dresses" },
  { id: "cakes", label: "Cakes" },
  { id: "entertainment", label: "Entertainment" },
  { id: "photography", label: "Photography" },
  { id: "themes", label: "Themes" },
];

export default function InspirationGallery() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const filtered = activeFilter === "all"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <section id="gallery" className="py-20 bg-[#FDF7F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">Inspiration Gallery</h2>
          <p className="section-subtitle">
            Real quinceañeras from El Paso. Get inspired for your perfect celebration.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200",
                activeFilter === filter.id
                  ? "bg-[#C4547A] text-white shadow-[0_4px_12px_rgba(196,84,122,0.3)]"
                  : "bg-white text-[#3D1A2E]/70 border border-[#f3ddb9] hover:border-[#C4547A]/30 hover:text-[#C4547A]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Masonry-style grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-[#f3ddb9] cursor-pointer"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#3D1A2E]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <p className="text-white text-xs font-body font-medium capitalize">{item.category}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiked((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        });
                      }}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Heart
                        className={cn("w-4 h-4", liked.has(item.id) ? "fill-[#C4547A] text-[#C4547A]" : "text-[#3D1A2E]")}
                      />
                    </button>
                    <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <ZoomIn className="w-4 h-4 text-[#3D1A2E]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-[#3D1A2E]/60 font-body mb-4">
            Are you a vendor? Showcase your work in our gallery.
          </p>
          <a href="/vendor/signup" className="btn-outline">
            List Your Business
          </a>
        </div>
      </div>
    </section>
  );
}
