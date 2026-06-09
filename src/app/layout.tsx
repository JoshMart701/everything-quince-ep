import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Amen Goodnight | Faith-Filled Bedtime Stories for Children", template: "%s | Amen Goodnight" },
  description: "Personalized, faith-filled bedtime stories delivered every night for your children.",
  keywords: ["bedtime stories for kids", "Christian children stories", "personalized bedtime stories", "faith-based kids stories", "AI bedtime stories"],
  authors: [{ name: "Amen Goodnight" }],
  openGraph: { type: "website", locale: "en_US", siteName: "Amen Goodnight", title: "Amen Goodnight | Faith-Filled Bedtime Stories", description: "Personalized bedtime stories rooted in faith, delivered nightly for your children." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-parchment antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
