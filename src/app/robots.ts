import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vendors", "/blog", "/categories/", "/cities/", "/gallery", "/budget-calculator", "/planning-checklist", "/get-quotes"],
        disallow: ["/admin", "/vendor/dashboard", "/vendor/leads", "/vendor/analytics", "/vendor/clients", "/vendor/invoices", "/vendor/calendar", "/vendor/profile", "/vendor/reviews", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
