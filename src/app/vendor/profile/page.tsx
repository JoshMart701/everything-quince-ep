"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";
import { toast } from "sonner";
import { ChevronLeft, Upload, Save } from "lucide-react";

const profileSchema = z.object({
  business_name: z.string().min(2, "Business name required"),
  category: z.string().min(1, "Category required"),
  city: z.string().min(1, "City required"),
  phone: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(20, "At least 20 characters").max(1000),
  short_bio: z.string().max(160, "Max 160 characters").optional(),
  address: z.string().optional(),
  starting_price: z.number().min(0).optional(),
  tags: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function VendorProfilePage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vendor, setVendor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<ProfileValues, unknown, ProfileValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
  });

  const shortBio = watch("short_bio") ?? "";

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/vendor/login"); return; }

      const { data } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!data) { router.push("/vendor/signup"); return; }

      setVendor(data);
      reset({
        business_name: data.business_name ?? "",
        category: data.category ?? "",
        city: data.city ?? "El Paso",
        phone: data.phone ?? "",
        website: data.website ?? "",
        description: data.description ?? "",
        short_bio: data.short_bio ?? "",
        address: data.address ?? "",
        starting_price: data.starting_price ?? undefined,
        tags: (data.tags ?? []).join(", "),
      });
      setIsLoading(false);
    };
    load();
  }, []);

  const onSubmit = async (values: ProfileValues) => {
    if (!vendor) return;
    setIsSaving(true);
    const supabase = createClient();

    const tags = values.tags
      ? values.tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    const { error } = await supabase
      .from("vendors")
      .update({
        business_name: values.business_name,
        category: values.category,
        city: values.city,
        phone: values.phone || null,
        website: values.website || null,
        description: values.description,
        short_bio: values.short_bio || null,
        address: values.address || null,
        starting_price: values.starting_price ?? null,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendor.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved!");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF7F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C4547A]/30 border-t-[#C4547A] rounded-full animate-spin" />
      </div>
    );
  }

  const isPro = vendor?.plan === "pro" || vendor?.plan === "premium";

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard" className="text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-heading font-bold">Edit Profile</span>
          </div>
          <div className="flex items-center gap-2">
            {vendor?.plan && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                vendor.plan === "premium" ? "bg-[#3D1A2E] text-[#C9A84C] border border-[#C9A84C]/30" :
                vendor.plan === "pro" ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-white/10 text-white/70"
              }`}>
                {vendor.plan.charAt(0).toUpperCase() + vendor.plan.slice(1)} Plan
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isPro && (
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-[#906523] font-body">
              <strong>Free plan:</strong> Basic info only. Upgrade to Pro to add photos, tags, bio, and pricing.
            </p>
            <Link href="/vendor/upgrade" className="text-xs font-semibold text-[#906523] border border-[#C9A84C] px-3 py-1.5 rounded-full hover:bg-[#C9A84C]/20 transition-colors flex-shrink-0">
              Upgrade Now
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="font-heading font-bold text-[#3D1A2E] text-lg mb-5">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="label">Business Name *</label>
                <input {...register("business_name")} className="input-field" />
                {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name.message}</p>}
              </div>

              <div>
                <label className="label">Category *</label>
                <select {...register("category")} className="input-field">
                  {VENDOR_CATEGORIES.map(c => (
                    <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="label">Primary City *</label>
                <select {...register("city")} className="input-field">
                  {CITIES.map(c => (
                    <option key={c.slug} value={c.name}>{c.name}, {c.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Phone</label>
                <input {...register("phone")} type="tel" placeholder="(915) 555-0100" className="input-field" />
              </div>

              <div>
                <label className="label">Website</label>
                <input {...register("website")} type="url" placeholder="https://yoursite.com" className="input-field" />
                {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="label">Street Address</label>
                <input {...register("address")} placeholder="123 Main St, El Paso, TX 79901" className="input-field" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="font-heading font-bold text-[#3D1A2E] text-lg mb-5">About Your Business</h2>
            <div className="space-y-5">
              <div>
                <label className="label">Full Description *</label>
                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Describe your services, experience, style, and what makes your business special for quinceañeras..."
                  className="input-field resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className={!isPro ? "opacity-50 pointer-events-none" : ""}>
                <label className="label flex items-center justify-between">
                  <span>Short Bio <span className="text-[#3D1A2E]/40">(shown in directory cards)</span></span>
                  <span className={`text-xs ${shortBio.length > 160 ? "text-red-500" : "text-[#3D1A2E]/40"}`}>
                    {shortBio.length}/160
                  </span>
                </label>
                <textarea
                  {...register("short_bio")}
                  rows={2}
                  disabled={!isPro}
                  placeholder="One-line description for directory listings..."
                  className="input-field resize-none"
                />
                {!isPro && <p className="text-xs text-[#C9A84C] mt-1">Pro feature</p>}
              </div>
            </div>
          </div>

          {/* Pricing & Tags — Pro only */}
          <div className={`card p-6 ${!isPro ? "opacity-60" : ""}`}>
            <h2 className="font-heading font-bold text-[#3D1A2E] text-lg mb-1">
              Pricing & Tags
              {!isPro && <span className="ml-2 badge-pro">Pro</span>}
            </h2>
            <p className="text-sm text-[#3D1A2E]/50 font-body mb-5">Shown publicly to help families find and compare you.</p>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Starting Price ($)</label>
                <input
                  {...register("starting_price", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  disabled={!isPro}
                  placeholder="e.g. 500"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Tags <span className="text-[#3D1A2E]/40">(comma separated)</span></label>
                <input
                  {...register("tags")}
                  disabled={!isPro}
                  placeholder="elegant, bilingual, outdoor, same-day"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Photo upload placeholder — Pro only */}
          <div className={`card p-6 ${!isPro ? "opacity-60" : ""}`}>
            <h2 className="font-heading font-bold text-[#3D1A2E] text-lg mb-1">
              Photos
              {!isPro && <span className="ml-2 badge-pro">Pro</span>}
            </h2>
            <p className="text-sm text-[#3D1A2E]/50 font-body mb-5">
              Add up to {vendor?.plan === "premium" ? "unlimited" : "20"} photos to showcase your work.
            </p>

            {isPro ? (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-[#f3ddb9] rounded-2xl cursor-pointer hover:border-[#C4547A]/40 transition-colors bg-[#FDF7F0]">
                <Upload className="w-8 h-8 text-[#3D1A2E]/30 mb-2" />
                <p className="text-sm text-[#3D1A2E]/50 font-body">Click to upload photos</p>
                <p className="text-xs text-[#3D1A2E]/30 font-body mt-1">JPG, PNG up to 10MB each</p>
                <input type="file" multiple accept="image/*" className="hidden" onChange={async (e) => {
                  if (!e.target.files || !vendor) return;
                  const supabase = createClient();
                  const files = Array.from(e.target.files);
                  const urls: string[] = [];
                  for (const file of files) {
                    const path = `vendors/${vendor.id}/${Date.now()}-${file.name}`;
                    const { data: uploadData } = await supabase.storage
                      .from("vendor-photos")
                      .upload(path, file, { upsert: true });
                    if (uploadData) {
                      const { data: { publicUrl } } = supabase.storage
                        .from("vendor-photos")
                        .getPublicUrl(path);
                      urls.push(publicUrl);
                    }
                  }
                  if (urls.length > 0) {
                    const newUrls = [...(vendor.gallery_urls ?? []), ...urls];
                    await supabase.from("vendors").update({ gallery_urls: newUrls }).eq("id", vendor.id);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setVendor((prev: any) => ({ ...prev, gallery_urls: newUrls }));
                    toast.success(`${urls.length} photo(s) uploaded!`);
                  }
                }} />
              </label>
            ) : (
              <div className="h-40 border-2 border-dashed border-[#f3ddb9] rounded-2xl flex flex-col items-center justify-center bg-[#FDF7F0]">
                <Upload className="w-8 h-8 text-[#3D1A2E]/20 mb-2" />
                <p className="text-sm text-[#3D1A2E]/30 font-body">Photo upload requires Pro plan</p>
              </div>
            )}

            {/* Existing photos */}
            {vendor?.gallery_urls?.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {vendor.gallery_urls.map((url: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f3ddb9] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={async () => {
                        const newUrls = vendor.gallery_urls.filter((_: string, idx: number) => idx !== i);
                        const supabase = createClient();
                        await supabase.from("vendors").update({ gallery_urls: newUrls }).eq("id", vendor.id);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setVendor((prev: any) => ({ ...prev, gallery_urls: newUrls }));
                        toast.success("Photo removed");
                      }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="btn-primary disabled:opacity-50"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <><Save className="w-4 h-4" /> Save Profile</>
              )}
            </button>
            <Link href="/vendor/dashboard" className="text-sm text-[#3D1A2E]/60 hover:text-[#3D1A2E] font-body transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
