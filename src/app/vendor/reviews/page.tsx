"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Star, ChevronLeft, MessageSquare, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string | null;
  rating: number;
  title: string | null;
  body: string;
  event_date: string | null;
  is_approved: boolean;
  vendor_reply: string | null;
  created_at: string;
}

interface VendorSummary {
  id: string;
  plan: string;
  business_name: string;
  average_rating: number;
  review_count: number;
}

export default function VendorReviewsPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/vendor/login"); return; }

      const { data: v } = await supabase
        .from("vendors")
        .select("id, plan, business_name, average_rating, review_count")
        .eq("user_id", user.id)
        .single();

      if (!v) { router.push("/vendor/signup"); return; }
      if (v.plan === "free") { router.push("/vendor/upgrade"); return; }

      setVendor(v);

      const { data: r } = await supabase
        .from("reviews")
        .select("*")
        .eq("vendor_id", v.id)
        .order("created_at", { ascending: false });

      setReviews(r ?? []);
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitReply = async (reviewId: string) => {
    const reply = replyDraft[reviewId]?.trim();
    if (!reply) return;
    setIsSaving(reviewId);
    const supabase = createClient();

    const { error } = await supabase
      .from("reviews")
      .update({ vendor_reply: reply, vendor_reply_at: new Date().toISOString() })
      .eq("id", reviewId);

    if (error) {
      toast.error("Failed to save reply");
    } else {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, vendor_reply: reply } : r));
      setReplyDraft(prev => { const n = { ...prev }; delete n[reviewId]; return n; });
      toast.success("Reply saved!");
    }
    setIsSaving(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF7F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C4547A]/30 border-t-[#C4547A] rounded-full animate-spin" />
      </div>
    );
  }

  const approved = reviews.filter(r => r.is_approved);
  const pending = reviews.filter(r => !r.is_approved);

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading font-bold">Reviews</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-5 text-center">
            <p className="font-heading font-bold text-3xl text-[#C9A84C]">
              {(vendor?.average_rating ?? 0) > 0 ? vendor!.average_rating : "–"}
            </p>
            <div className="flex justify-center gap-0.5 my-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(vendor?.average_rating ?? 0) ? "fill-[#C9A84C] text-[#C9A84C]" : "text-[#f3ddb9]"}`} />
              ))}
            </div>
            <p className="text-xs text-[#3D1A2E]/60 font-body">Average Rating</p>
          </div>
          <div className="card p-5 text-center">
            <p className="font-heading font-bold text-3xl text-[#C4547A]">{approved.length}</p>
            <p className="text-xs text-[#3D1A2E]/60 font-body mt-1">Published Reviews</p>
          </div>
          <div className="card p-5 text-center">
            <p className="font-heading font-bold text-3xl text-[#C9A84C]">{pending.length}</p>
            <p className="text-xs text-[#3D1A2E]/60 font-body mt-1">Pending Approval</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="card p-16 text-center">
            <MessageSquare className="w-16 h-16 text-[#f3ddb9] mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-2">No reviews yet</h2>
            <p className="text-[#3D1A2E]/60 font-body">Reviews from your clients will appear here once submitted and approved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending */}
            {pending.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-2">
                <p className="text-sm font-semibold text-yellow-800 font-body">
                  {pending.length} review{pending.length !== 1 ? "s" : ""} pending admin approval
                </p>
              </div>
            )}

            {reviews.map((review) => (
              <div key={review.id} className={`card p-6 ${!review.is_approved ? "opacity-70 border-yellow-200" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-body font-semibold text-[#3D1A2E]">{review.reviewer_name}</p>
                      {!review.is_approved && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                      )}
                    </div>
                    {review.event_date && (
                      <p className="text-xs text-[#3D1A2E]/50 font-body">
                        Event: {formatDate(review.event_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-[#C9A84C] text-[#C9A84C]" : "text-[#f3ddb9]"}`} />
                    ))}
                  </div>
                </div>

                {review.title && (
                  <p className="font-body font-semibold text-[#3D1A2E] mb-1">{review.title}</p>
                )}
                <p className="text-sm text-[#3D1A2E]/80 font-body mb-4">{review.body}</p>

                {/* Existing reply */}
                {review.vendor_reply && (
                  <div className="bg-[#FDF7F0] rounded-xl p-4 border-l-4 border-[#C4547A]/40 mb-4">
                    <p className="text-xs font-semibold text-[#C4547A] mb-1">Your Response</p>
                    <p className="text-sm text-[#3D1A2E]/80 font-body">{review.vendor_reply}</p>
                  </div>
                )}

                {/* Reply input */}
                {!review.vendor_reply && review.is_approved && (
                  <div className="mt-2">
                    {replyDraft[review.id] !== undefined ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={replyDraft[review.id]}
                          onChange={(e) => setReplyDraft(prev => ({ ...prev, [review.id]: e.target.value }))}
                          placeholder="Write a professional, warm response…"
                          className="input-field resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitReply(review.id)}
                            disabled={isSaving === review.id}
                            className="flex items-center gap-1 text-xs bg-[#C4547A] text-white px-3 py-1.5 rounded-lg hover:bg-[#b03a63] transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            {isSaving === review.id ? "Saving…" : "Post Reply"}
                          </button>
                          <button
                            onClick={() => setReplyDraft(prev => { const n = { ...prev }; delete n[review.id]; return n; })}
                            className="flex items-center gap-1 text-xs text-[#3D1A2E]/50 px-3 py-1.5 rounded-lg hover:text-[#3D1A2E] transition-colors"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyDraft(prev => ({ ...prev, [review.id]: "" }))}
                        className="text-xs text-[#C4547A] hover:underline font-body"
                      >
                        + Reply to this review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
