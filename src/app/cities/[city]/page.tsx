import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CITIES, VENDOR_CATEGORIES } from "@/lib/constants";
import { MapPin } from "lucide-react";

type Props = { params: { city: string } };

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const city = CITIES.find((c) => c.slug === params.city);
  if (!city) return {};
  return {
    title: `Quinceañera Vendors in ${city.name}, ${city.state}`,
    description: `Find the best quinceañera vendors in ${city.name}, ${city.state}. Venues, photographers, DJs, caterers, dresses, and more for your quinceañera celebration.`,
  };
}

export default function CityPage({ params }: Props) {
  const city = CITIES.find((c) => c.slug === params.city);
  if (!city) notFound();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#3D1A2E] via-[#5c2044] to-[#C4547A] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-96 h-96 bg-[#C9A84C] rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <MapPin className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-white/90 text-sm">{city.name}, {city.state}</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Quinceañera Vendors in {city.name}
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              {city.description}. Discover trusted local vendors for every aspect of your daughter&apos;s special celebration.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/vendors?city=${city.name}`} className="btn-secondary">
                Browse All {city.name} Vendors
              </Link>
              <Link href="/#quotes" className="btn-outline-white">
                Get Free Quotes
              </Link>
            </div>
          </div>
        </section>

        {/* Category grid */}
        <section className="py-20 bg-[#FDF7F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="gold-divider mx-auto mb-4" />
              <h2 className="section-title">Browse by Service in {city.name}</h2>
              <p className="section-subtitle">
                Find the perfect vendor for every part of your quinceañera.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {VENDOR_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/vendors?category=${cat.slug}&city=${city.name}`}
                  className="card p-5 text-center hover:shadow-[0_8px_24px_rgba(196,84,122,0.15)] transition-all duration-300 hover:-translate-y-1 group"
                >
                  <span className="text-3xl block mb-3">{cat.icon}</span>
                  <h3 className="font-heading font-semibold text-[#3D1A2E] text-sm mb-1 group-hover:text-[#C4547A] transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-[#3D1A2E]/50 text-xs font-body">{cat.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats / Info */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-8 text-center">
                <p className="font-heading text-4xl font-bold text-[#C4547A] mb-2">50+</p>
                <p className="font-body text-[#3D1A2E]/70">Vendors in {city.name}</p>
              </div>
              <div className="card p-8 text-center">
                <p className="font-heading text-4xl font-bold text-[#C9A84C] mb-2">4.8★</p>
                <p className="font-body text-[#3D1A2E]/70">Average Vendor Rating</p>
              </div>
              <div className="card p-8 text-center">
                <p className="font-heading text-4xl font-bold text-[#3D1A2E] mb-2">500+</p>
                <p className="font-body text-[#3D1A2E]/70">Quinceañeras Planned</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO content */}
        <section className="py-16 bg-[#FDF7F0]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-bold text-[#3D1A2E] mb-6">
              Planning a Quinceañera in {city.name}, {city.state}
            </h2>
            <div className="prose prose-lg max-w-none text-[#3D1A2E]/80 font-body space-y-4">
              <p>
                {city.name} is home to a vibrant community that celebrates quinceañeras with passion
                and tradition. Whether you&apos;re planning an intimate gathering or a grand celebration
                with hundreds of guests, Everything Quince EP connects you with the finest local
                vendors who understand the cultural significance of this milestone.
              </p>
              <p>
                From stunning ballrooms and outdoor venues to world-class photographers, talented DJs,
                and exquisite dress boutiques — our platform features every service category you need
                to make your daughter&apos;s quinceañera truly unforgettable.
              </p>
              <p>
                All vendors listed on Everything Quince EP are reviewed and approved by our team.
                Use our free budget calculator to plan your budget, then request free quotes from
                multiple vendors at once to compare prices and packages.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/#budget" className="btn-primary">Budget Calculator</Link>
              <Link href="/#checklist" className="btn-outline">Planning Checklist</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
