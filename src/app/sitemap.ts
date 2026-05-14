import { MetadataRoute } from "next";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog";
import { createServiceClient } from "@/lib/supabase/server";

export const revalidate = 3600; // regenerate every hour so new vendors appear automatically

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                         lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/vendors`,            lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/blog`,               lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/get-quotes`,         lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/planning-checklist`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/budget-calculator`,  lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/gallery`,            lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/vendor/signup`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/vendor/login`,       lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = VENDOR_CATEGORIES.map((cat) => ({
    url: `${BASE}/categories/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${BASE}/cities/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Fetch live vendor slugs — gracefully omitted if Supabase not configured
  let vendorRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createServiceClient();
    const { data: vendors } = await supabase
      .from("vendors")
      .select("slug, updated_at")
      .eq("status", "approved")
      .not("slug", "is", null);

    if (vendors) {
      vendorRoutes = vendors.map((v) => ({
        url: `${BASE}/vendors/${v.slug}`,
        lastModified: v.updated_at ? new Date(v.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Supabase not configured — vendor detail URLs omitted from sitemap
  }

  return [...staticRoutes, ...categoryRoutes, ...cityRoutes, ...blogRoutes, ...vendorRoutes];
}
