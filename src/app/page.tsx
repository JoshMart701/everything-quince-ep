import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import BudgetCalculator from "@/components/home/BudgetCalculator";
import PlanningChecklist from "@/components/home/PlanningChecklist";
import PriceGuide from "@/components/home/PriceGuide";
import InspirationGallery from "@/components/home/InspirationGallery";
import InvitationIdeas from "@/components/home/InvitationIdeas";
import VendorDirectory from "@/components/home/VendorDirectory";
import QuoteForm from "@/components/home/QuoteForm";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";
import Link from "next/link";

function CategorySection() {
  return (
    <section className="py-20 bg-[#3D1A2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-1 bg-[#C9A84C] rounded-full mx-auto mb-4" />
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Browse by Category
          </h2>
          <p className="text-white/70 mt-3 text-lg">
            Everything you need for a perfect quinceañera, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {VENDOR_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C9A84C]/40 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
            >
              <span className="text-4xl block mb-3">{cat.icon}</span>
              <h3 className="font-heading font-semibold text-white text-sm md:text-base mb-1">
                {cat.label}
              </h3>
              <p className="text-white/50 text-xs font-body hidden md:block">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CitiesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">We Serve Your Community</h2>
          <p className="section-subtitle">
            Connecting families with trusted vendors across the Borderland.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="card p-6 text-center hover:shadow-[0_8px_32px_rgba(196,84,122,0.15)] transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#C4547A]/20 to-[#C9A84C]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-heading font-bold text-[#3D1A2E] text-xl mb-1">{city.name}</h3>
              <p className="text-sm text-[#C4547A] font-body font-medium mb-2">{city.state}</p>
              <p className="text-xs text-[#3D1A2E]/60 font-body">{city.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Maria & Ricardo L.",
      quote: "Everything Quince EP made planning Sofia's quinceañera so easy! We found our photographer, DJ, and florist all in one place. The budget calculator was a lifesaver.",
      rating: 5,
      city: "El Paso, TX",
    },
    {
      name: "Ana Hernandez",
      quote: "As a quinceañera photographer, listing on this platform tripled my bookings. The Pro plan is worth every penny. I get qualified leads every week!",
      rating: 5,
      city: "El Paso Vendor",
    },
    {
      name: "Sandra & Jorge M.",
      quote: "The planning checklist kept us organized through the entire 18-month planning process. We didn't miss a single detail for Isabella's special day.",
      rating: 5,
      city: "Horizon City, TX",
    },
  ];

  return (
    <section className="py-20 bg-[#FDF7F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">What Families Are Saying</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="card p-7">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-[#C9A84C] text-lg">★</span>
                ))}
              </div>
              <p className="font-body text-[#3D1A2E]/80 leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="font-heading font-semibold text-[#3D1A2E]">{t.name}</p>
                <p className="text-sm text-[#C4547A] font-body">{t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VendorCTABanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#3D1A2E] to-[#5c2044]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
          Are You a Quinceañera Vendor?
        </h2>
        <p className="text-white/70 font-body text-lg mb-8 max-w-2xl mx-auto">
          Join hundreds of El Paso vendors growing their business through Everything Quince EP.
          Start free — upgrade anytime for leads and full profile access.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/vendor/signup" className="btn-secondary">
            List Your Business Free
          </Link>
          <Link href="/vendor/upgrade" className="btn-outline-white">
            See Pro &amp; Premium Plans
          </Link>
        </div>
        <p className="text-white/40 text-sm font-body mt-4">
          No credit card required for free listing • Upgrade anytime
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategorySection />
        <VendorDirectory />
        <BudgetCalculator />
        <PlanningChecklist />
        <PriceGuide />
        <InspirationGallery />
        <InvitationIdeas />
        <TestimonialsSection />
        <CitiesSection />
        <QuoteForm />
        <VendorCTABanner />
      </main>
      <Footer />
    </>
  );
}
