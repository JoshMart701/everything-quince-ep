import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: "Quinceañera Inspiration Gallery | Everything Quince EP",
  description: "Browse stunning quinceañera inspiration photos for venues, dresses, florals, cakes, hair & makeup, and more. Find ideas for your perfect El Paso celebration.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#FDF7F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="gold-divider mx-auto mb-4" />
            <h1 className="font-heading font-bold text-4xl text-[#3D1A2E] mb-3">
              Inspiration Gallery
            </h1>
            <p className="text-[#3D1A2E]/60 font-body text-lg max-w-2xl mx-auto">
              Browse ideas for venues, dresses, florals, cakes, and more.
              Filter by category to find your perfect quinceañera style.
            </p>
          </div>

          <GalleryGrid />

          {/* CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-[#3D1A2E] to-[#5c2044] rounded-3xl p-10">
            <h2 className="font-heading font-bold text-2xl text-white mb-3">
              Ready to start planning?
            </h2>
            <p className="text-white/70 font-body mb-6 max-w-md mx-auto">
              Connect with top-rated vendors in El Paso to bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/vendors" className="btn-primary">
                Browse Vendors
              </Link>
              <Link href="/#quotes" className="btn-outline-white">
                Get Free Quotes
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
