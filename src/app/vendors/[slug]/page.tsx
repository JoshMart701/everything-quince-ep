import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { VENDOR_CATEGORIES } from "@/lib/constants";
import { MapPin, Phone, Globe, Star, ChevronLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("business_name, description, category, city")
    .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
    .eq("status", "approved")
    .single();

  if (!vendor) return {};

  return {
    title: `${vendor.business_name} — Quinceañera ${vendor.category} in ${vendor.city}`,
    description: vendor.description ?? `${vendor.business_name} offers professional quinceañera services in ${vendor.city}, TX.`,
  };
}

export default async function VendorDetailPage({ params }: Props) {
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .or(`slug.eq.${params.slug},id.eq.${params.slug}`)
    .eq("status", "approved")
    .single();

  if (!vendor) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("vendor_id", vendor.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const catInfo = VENDOR_CATEGORIES.find((c) => c.slug === vendor.category);

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Cover / Header */}
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#3D1A2E] to-[#5c2044] overflow-hidden">
          {vendor.cover_url && (
            <Image src={vendor.cover_url} alt="Cover" fill className="object-cover opacity-40" sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D1A2E]/80 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
          <Link href="/vendors" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 font-body text-sm">
            <ChevronLeft className="w-4 h-4" />
            Back to vendors
          </Link>

          <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(61,26,46,0.15)] overflow-hidden">
            {/* Profile header */}
            <div className="p-8 border-b border-[#f3ddb9]">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-[#FDF7F0] flex items-center justify-center flex-shrink-0">
                  {vendor.logo_url ? (
                    <Image src={vendor.logo_url} alt={vendor.business_name} width={96} height={96} className="object-cover" />
                  ) : (
                    <span className="text-4xl">{catInfo?.icon ?? "🏢"}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h1 className="font-heading font-bold text-3xl text-[#3D1A2E]">{vendor.business_name}</h1>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[#C4547A] font-body font-medium capitalize">
                          {catInfo?.icon} {catInfo?.label ?? vendor.category}
                        </span>
                        <span className="text-[#3D1A2E]/40">•</span>
                        <span className="flex items-center gap-1 text-[#3D1A2E]/60 font-body text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          {vendor.city}, {vendor.state}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {vendor.plan === "premium" && <span className="badge-premium">⭐ Premium</span>}
                      {vendor.plan === "pro" && <span className="badge-pro">Pro</span>}
                    </div>
                  </div>

                  {/* Rating */}
                  {vendor.review_count > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(vendor.average_rating) ? "fill-[#C9A84C] text-[#C9A84C]" : "text-[#f3ddb9]"}`} />
                        ))}
                      </div>
                      <span className="font-semibold text-[#3D1A2E]">{vendor.average_rating}</span>
                      <span className="text-[#3D1A2E]/50 text-sm font-body">({vendor.review_count} reviews)</span>
                    </div>
                  )}

                  {/* Contact info */}
                  <div className="flex flex-wrap gap-4">
                    {vendor.phone && (
                      <a href={`tel:${vendor.phone}`} className="flex items-center gap-1.5 text-sm text-[#3D1A2E]/70 hover:text-[#C4547A] transition-colors">
                        <Phone className="w-4 h-4" />
                        {vendor.phone}
                      </a>
                    )}
                    {vendor.website && (
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#3D1A2E]/70 hover:text-[#C4547A] transition-colors">
                        <Globe className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  {vendor.starting_price && (
                    <div className="text-right">
                      <p className="text-xs text-[#3D1A2E]/50 font-body">Starting at</p>
                      <p className="font-heading font-bold text-2xl text-[#C4547A]">
                        ${vendor.starting_price.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <Link href="/#quotes" className="btn-primary text-sm">
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-8">
              {vendor.description && (
                <div className="mb-8">
                  <h2 className="font-heading font-bold text-xl text-[#3D1A2E] mb-3">About {vendor.business_name}</h2>
                  <p className="font-body text-[#3D1A2E]/80 leading-relaxed">{vendor.description}</p>
                </div>
              )}

              {/* Gallery */}
              {vendor.gallery_urls?.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-heading font-bold text-xl text-[#3D1A2E] mb-4">Photo Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vendor.gallery_urls.map((url: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f3ddb9]">
                        <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="200px" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <h2 className="font-heading font-bold text-xl text-[#3D1A2E] mb-4">
                  Reviews {reviews && reviews.length > 0 && `(${reviews.length})`}
                </h2>

                {!reviews || reviews.length === 0 ? (
                  <div className="text-center py-8 bg-[#FDF7F0] rounded-2xl">
                    <Star className="w-10 h-10 text-[#f3ddb9] mx-auto mb-2" />
                    <p className="text-[#3D1A2E]/60 font-body">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-[#FDF7F0] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-body font-semibold text-[#3D1A2E]">{review.reviewer_name}</p>
                            {review.event_date && (
                              <p className="text-xs text-[#3D1A2E]/50 font-body">
                                Event: {formatDate(review.event_date)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#C9A84C] text-[#C9A84C]" />
                            ))}
                          </div>
                        </div>
                        {review.title && <p className="font-body font-semibold text-[#3D1A2E] mb-1">{review.title}</p>}
                        <p className="text-sm text-[#3D1A2E]/80 font-body">{review.body}</p>
                        {review.vendor_reply && (
                          <div className="mt-3 pl-4 border-l-2 border-[#C4547A]/30">
                            <p className="text-xs font-semibold text-[#C4547A] mb-1">Response from {vendor.business_name}</p>
                            <p className="text-sm text-[#3D1A2E]/70 font-body">{review.vendor_reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
