import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
