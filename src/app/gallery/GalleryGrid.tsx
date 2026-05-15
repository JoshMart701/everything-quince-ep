"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All", icon: "✨" },
  { id: "venues", label: "Venues & Halls", icon: "🏰" },
  { id: "photography", label: "Photography", icon: "📸" },
  { id: "dresses", label: "Dresses", icon: "👗" },
  { id: "catering", label: "Cakes & Catering", icon: "🎂" },
  { id: "djs", label: "DJs & Entertainment", icon: "🎵" },
  { id: "florals", label: "Florals & Décor", icon: "💐" },
  { id: "hair-makeup", label: "Hair & Makeup", icon: "💄" },
  { id: "invitations", label: "Invitations", icon: "💌" },
];

interface Photo {
  id: string;
  src: string;
  thumb?: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
}

function PhotoCard({ photo, liked, onLike }: { photo: Photo; liked: boolean; onLike: () => void }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="break-inside-avoid mb-4 relative group rounded-2xl overflow-hidden bg-[#f3ddb9] cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300">
      {!loaded && <div className="w-full h-48 bg-[#f3ddb9] animate-pulse" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.src}
        alt={photo.alt}
        className={cn(
          "w-full h-auto block transition-transform duration-500 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0 absolute inset-0"
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#3D1A2E]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-auto">
          {photo.photographer ? (
            <a
              href={photo.photographerUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 text-xs font-body hover:text-white transition-colors flex items-center gap-1 min-w-0 mr-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{photo.photographer}</span>
            </a>
          ) : <span />}
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors flex-shrink-0"
          >
            <Heart className={cn("w-4 h-4", liked ? "fill-[#C4547A] text-[#C4547A]" : "text-[#3D1A2E]")} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryGrid() {
  const [active, setActive] = useState("all");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const cache = useRef<Record<string, Photo[]>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  const fetchPhotos = useCallback(async (category: string) => {
    if (cache.current[category]) {
      setPhotos(cache.current[category]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/gallery?category=${category}&per_page=24`);
      if (res.ok) {
        const data = await res.json();
        cache.current[category] = data.photos ?? [];
        setPhotos(cache.current[category]);
      }
    } catch {
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos(active);
  }, [active, fetchPhotos]);

  const handleCategory = (id: string) => {
    if (id === active) return;
    setActive(id);
    if (!cache.current[id]) setIsLoading(true);
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  return (
    <div>
      {/* Scrollable category tabs */}
      <div
        ref={tabsRef}
        className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center"
        style={{ scrollbarWidth: "none" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategory(cat.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all flex-shrink-0",
              active === cat.id
                ? "bg-[#C4547A] text-white shadow-[0_4px_12px_rgba(196,84,122,0.3)]"
                : "bg-white text-[#3D1A2E]/70 border border-[#f3ddb9] hover:border-[#C4547A]/30 hover:text-[#C4547A]"
            )}
          >
            <span aria-hidden>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      {isLoading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              style={{ height: `${[192, 256, 320, 224, 288][i % 5]}px` }}
              className="break-inside-avoid rounded-2xl bg-[#f3ddb9] animate-pulse mb-4"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🌹</p>
          <p className="text-[#3D1A2E]/60 font-body">No photos found. Try another category.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              liked={liked.has(photo.id)}
              onLike={() => toggleLike(photo.id)}
            />
          ))}
        </div>
      )}

      {/* Unsplash attribution — required by their API guidelines */}
      <p className="text-center mt-10 text-xs text-[#3D1A2E]/40 font-body">
        Photos by talented photographers on{" "}
        <a
          href="https://unsplash.com?utm_source=everything_quince_ep&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#3D1A2E]/60"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
}
