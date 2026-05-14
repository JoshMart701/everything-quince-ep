import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VendorsListClient from "./VendorsListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quinceañera Vendors in El Paso, TX — Venues, Photographers, DJs & More",
  description:
    "Find trusted quinceañera vendors in El Paso, TX. Browse venues, photographers, DJs, caterers, dress boutiques, florists, hair & makeup artists, and more. Compare prices and get free quotes.",
  keywords: [
    "quinceañera vendors El Paso TX",
    "quince vendors El Paso",
    "quinceañera photographer El Paso",
    "quinceañera venue El Paso TX",
    "quinceañera DJ El Paso",
    "quinceañera catering El Paso",
    "quinceañera dress El Paso TX",
  ],
  openGraph: {
    type: "website",
    title: "Quinceañera Vendors in El Paso, TX",
    description: "Find trusted quinceañera venues, photographers, DJs, caterers, dresses, and more in El Paso, TX.",
  },
};

export default function VendorsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pt-28 pb-10 bg-gradient-to-br from-[#3D1A2E] to-[#5c2044]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
              Find Your Perfect Vendor
            </h1>
            <p className="text-white/70 text-lg font-body max-w-2xl mx-auto">
              Browse El Paso&apos;s most trusted quinceañera professionals.
              Filter by category, city, and price to find your match.
            </p>
          </div>
        </section>
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-[#C4547A]/30 border-t-[#C4547A] rounded-full animate-spin" /></div>}>
          <VendorsListClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
