import { MetadataRoute } from "next";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/vendors`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/vendor/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/vendor/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = VENDOR_CATEGORIES.map(cat => ({
    url: `${BASE}/categories/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map(city => ({
    url: `${BASE}/cities/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Cross-city/category combos
  const comboRoutes: MetadataRoute.Sitemap = CITIES.flatMap(city =>
    VENDOR_CATEGORIES.map(cat => ({
      url: `${BASE}/vendors?category=${cat.slug}&city=${encodeURIComponent(city.name)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [...staticRoutes, ...categoryRoutes, ...cityRoutes, ...comboRoutes];
}
