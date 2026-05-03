import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Everything Quince EP | El Paso's Quinceañera Planning Hub",
    template: "%s | Everything Quince EP",
  },
  description:
    "El Paso's premier quinceañera planning hub. Find trusted vendors, plan your budget, and create the quinceañera of your dreams in El Paso, TX.",
  keywords: [
    "quinceañera El Paso",
    "quince años El Paso TX",
    "quinceañera vendors El Paso",
    "quince planning El Paso",
    "quinceañera photographer El Paso",
    "quince venue El Paso",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Everything Quince EP",
    title: "Everything Quince EP | El Paso's Quinceañera Planning Hub",
    description:
      "El Paso's premier quinceañera planning hub. Find trusted vendors, plan your budget, and create the quinceañera of your dreams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everything Quince EP",
    description: "El Paso's premier quinceañera planning hub.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-cream antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
