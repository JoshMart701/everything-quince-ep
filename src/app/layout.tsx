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
    "El Paso's #1 quinceañera planning hub. Find trusted venues, photographers, DJs, caterers, dresses, and more in El Paso, TX. Get free quotes and plan your perfect quinceañera.",
  keywords: [
    "quinceañera El Paso TX",
    "quince años El Paso",
    "quinceañera vendors El Paso",
    "quinceañera venues El Paso TX",
    "quince photography El Paso",
    "quinceañera DJ El Paso",
    "quinceañera catering El Paso",
    "quinceañera dress El Paso",
    "quinceañera planning El Paso",
    "quince party El Paso TX",
    "quinceañera photographer El Paso TX",
    "Horizon City quinceañera vendors",
    "Las Cruces quinceañera vendors",
  ],
  authors: [{ name: "Everything Quince EP" }],
  creator: "Everything Quince EP",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com",
    siteName: "Everything Quince EP",
    title: "Everything Quince EP | El Paso's Quinceañera Planning Hub",
    description:
      "El Paso's #1 quinceañera planning hub. Find trusted vendors, plan your budget, and create the quinceañera of your dreams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everything Quince EP | El Paso Quinceañera Planning",
    description:
      "El Paso's #1 quinceañera planning hub — vendors, quotes, budget tools, and more.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com",
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
