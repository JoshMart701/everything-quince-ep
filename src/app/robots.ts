import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/vendor/dashboard", "/vendor/leads", "/vendor/analytics", "/vendor/clients", "/vendor/invoices", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
