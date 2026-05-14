import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import { Clock, ArrowLeft, Tag } from "lucide-react";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com";

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${appUrl}/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://everythingquince.com";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Everything Quince EP",
      url: appUrl,
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${appUrl}/blog/${post.slug}` },
    keywords: post.keywords.join(", "),
  };

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-28 pb-10 bg-gradient-to-br from-[#3D1A2E] to-[#5c2044]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 font-body text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-semibold bg-[#C9A84C]/20 text-[#C9A84C] px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/50 font-body">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
              <time className="text-xs text-white/50 font-body" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </time>
            </div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-white/70 text-lg font-body leading-relaxed">
              {post.description}
            </p>
          </div>
        </section>

        {/* Article content */}
        <section className="py-12 bg-[#FDF7F0]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-card border border-[#f3ddb9] p-8 md:p-12">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:font-heading prose-headings:text-[#3D1A2E]
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-[#3D1A2E]/80 prose-p:leading-relaxed prose-p:font-body
                  prose-li:text-[#3D1A2E]/80 prose-li:font-body
                  prose-strong:text-[#3D1A2E] prose-strong:font-semibold
                  prose-a:text-[#C4547A] prose-a:font-semibold hover:prose-a:text-[#b03a63]
                  prose-table:text-sm prose-th:bg-[#FDF7F0] prose-th:text-[#3D1A2E] prose-th:font-semibold
                  prose-td:text-[#3D1A2E]/80"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Keywords */}
            <div className="mt-8 flex flex-wrap gap-2 items-center">
              <Tag className="w-4 h-4 text-[#3D1A2E]/40" />
              {post.keywords.map((kw) => (
                <span key={kw} className="text-xs bg-white border border-[#f3ddb9] text-[#3D1A2E]/60 px-3 py-1 rounded-full font-body">
                  {kw}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 bg-gradient-to-br from-[#3D1A2E] to-[#5c2044] rounded-3xl p-8 text-center">
              <h3 className="font-heading font-bold text-white text-2xl mb-2">
                Ready to Find El Paso Quinceañera Vendors?
              </h3>
              <p className="text-white/70 font-body mb-6">
                Browse trusted local vendors, compare prices, and request free quotes — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/vendors" className="btn-secondary">
                  Browse Vendors
                </Link>
                <Link href="/get-quotes" className="btn-outline-white">
                  Get Free Quotes
                </Link>
              </div>
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="font-heading font-bold text-[#3D1A2E] text-xl mb-6">More Planning Guides</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((related) => (
                    <Link key={related.slug} href={`/blog/${related.slug}`} className="card p-6 hover:shadow-[0_8px_32px_rgba(196,84,122,0.12)] transition-shadow">
                      <span className="text-xs font-semibold text-[#C4547A] mb-2 block">{related.category}</span>
                      <h3 className="font-heading font-semibold text-[#3D1A2E] leading-snug mb-2 hover:text-[#C4547A] transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-sm text-[#3D1A2E]/60 font-body line-clamp-2">{related.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
