import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";

type Props = { params: { category: string } };

export function generateStaticParams() {
  return VENDOR_CATEGORIES.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const cat = VENDOR_CATEGORIES.find((c) => c.slug === params.category);
  if (!cat) return {};
  return {
    title: `${cat.label} for Quinceañeras in El Paso, TX`,
    description: `Find the best ${cat.label.toLowerCase()} vendors for quinceañeras in El Paso, TX. Compare prices, read reviews, and get free quotes.`,
  };
}

export default function CategoryPage({ params }: Props) {
  const cat = VENDOR_CATEGORIES.find((c) => c.slug === params.category);
  if (!cat) notFound();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#3D1A2E] via-[#5c2044] to-[#C4547A] overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-6xl block mb-4">{cat.icon}</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {cat.label}
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              {cat.description} for quinceañeras in El Paso and surrounding communities.
              Compare vendors, read reviews, and get free quotes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/vendors?category=${cat.slug}`} className="btn-secondary">
                Browse {cat.label} Vendors
              </Link>
              <Link href="/#quotes" className="btn-outline-white">
                Get Free Quotes
              </Link>
            </div>
          </div>
        </section>

        {/* By City */}
        <section className="py-16 bg-[#FDF7F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="gold-divider mx-auto mb-4" />
              <h2 className="section-title">Find {cat.label} Near You</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/vendors?category=${cat.slug}&city=${city.name}`}
                  className="card p-6 text-center hover:shadow-[0_8px_24px_rgba(196,84,122,0.15)] transition-all duration-300 hover:-translate-y-1 group"
                >
                  <span className="text-3xl block mb-3">📍</span>
                  <h3 className="font-heading font-semibold text-[#3D1A2E] mb-1 group-hover:text-[#C4547A] transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-sm text-[#3D1A2E]/60 font-body">{city.state}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-6 text-center">
              Other Vendor Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {VENDOR_CATEGORIES.filter((c) => c.slug !== cat.slug).map((other) => (
                <Link
                  key={other.slug}
                  href={`/categories/${other.slug}`}
                  className="flex items-center gap-2 bg-[#FDF7F0] border border-[#f3ddb9] hover:border-[#C4547A]/30 rounded-full px-4 py-2 text-sm font-body text-[#3D1A2E]/80 hover:text-[#C4547A] transition-all"
                >
                  <span>{other.icon}</span>
                  {other.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
