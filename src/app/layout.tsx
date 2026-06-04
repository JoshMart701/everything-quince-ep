import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { AddToHomeScreen } from "@/components/standpoint/AddToHomeScreen";

const geist = localFont({
  src: [{ path: "./fonts/GeistVF.woff", weight: "100 900", style: "normal" }],
  variable: "--font-geist",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifests/default.json",
  title: {
    default: "Standpoint | Performance Reviews Made Clear",
    template: "%s | Standpoint",
  },
  description:
    "Standpoint helps managers submit structured performance reviews and gives employees a clear, AI-powered view of their growth.",
  authors: [{ name: "Standpoint" }],
  creator: "Standpoint",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://standpoint.app",
    siteName: "Standpoint",
    title: "Standpoint | Performance Reviews Made Clear",
    description:
      "Structured performance reviews with AI-generated coaching summaries for every employee.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Standpoint | Performance Reviews Made Clear",
    description: "Structured reviews. AI coaching. Clear employee growth.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
        <Toaster position="top-right" richColors />
        <ServiceWorkerRegistration />
        <AddToHomeScreen />
      </body>
    </html>
  );
}
