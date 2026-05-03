/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
  // Required for Stripe webhook raw body
  async headers() {
    return [
      {
        source: "/api/webhooks/:path*",
        headers: [{ key: "content-type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
