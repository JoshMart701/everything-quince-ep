import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BLOG_POSTS } from "@/lib/blog";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Quinceañera Planning Blog — Tips, Guides & Inspiration | El Paso TX",
  description:
    "Expert quinceañera planning advice for El Paso families. Budget guides, venue tips, vendor checklists, and inspiration for your daughter's perfect quinceañera in El Paso, TX.",
  keywords: [
    "quinceañera planning blog El Paso",
    "quinceañera tips El Paso TX",
    "quince planning guide",
    "quinceañera advice El Paso",
  ],
  openGraph: {
    title: "Quinceañera Planning Blog — Everything Quince EP",
    description: "Expert tips, budget guides, and planning advice for El Paso quinceañera families.",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Budget Planning": "bg-[#C9A84C]/10 text-[#906523]",
  "Venues": "bg-[#C4547A]/10 text-[#C4547A]",
  "Planning": "bg-[#3D1A2E]/10 text-[#3D1A2E]",
};

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="pt-28 pb-12 bg-gradient-to-br from-[#3D1A2E] to-[#5c2044]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-white/80 text-sm font-body">Planning Guides &amp; Tips</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Quinceañera Planning Blog
            </h1>
            <p className="text-white/70 text-lg font-body max-w-2xl mx-auto">
              Expert advice, local insights, and step-by-step guides for El Paso families planning the
              quinceañera of a lifetime.
            </p>
          </div>
        </section>

        <section className="py-16 bg-[#FDF7F0]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {BLOG_POSTS.map((post) => (
                <article key={post.slug} className="card p-0 overflow-hidden hover:shadow-[0_8px_32px_rgba(196,84,122,0.12)] transition-shadow duration-300">
                  <Link href={`/blog/${post.slug}`} className="block p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#3D1A2E]/50 font-body">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span className="text-xs text-[#3D1A2E]/50 font-body">
                        {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-[#3D1A2E] mb-3 hover:text-[#C4547A] transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="font-body text-[#3D1A2E]/70 leading-relaxed mb-5">
                      {post.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[#C4547A] font-semibold text-sm font-body">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-16 text-center">
              <div className="inline-block bg-white rounded-2xl shadow-card border border-[#f3ddb9] p-8 max-w-md">
                <p className="text-2xl mb-3">🌹</p>
                <h3 className="font-heading font-bold text-[#3D1A2E] text-xl mb-2">Ready to Start Planning?</h3>
                <p className="text-[#3D1A2E]/70 font-body text-sm mb-5">
                  Browse El Paso&apos;s top quinceañera vendors and get free quotes all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/vendors" className="btn-primary text-sm">
                    Find Vendors
                  </Link>
                  <Link href="/get-quotes" className="btn-outline text-sm">
                    Get Free Quotes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
