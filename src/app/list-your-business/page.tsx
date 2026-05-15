"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";
import { toast } from "sonner";
import { CheckCircle2, Upload, X, Check } from "lucide-react";

const schema = z.object({
  businessName: z.string().min(2, "Business name required"),
  category: z.string().min(1, "Select a category"),
  city: z.string().min(1, "Select a city"),
  phone: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(20, "At least 20 characters").max(1000),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
  agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms"),
});

type FormValues = z.infer<typeof schema>;

const PLAN_OPTIONS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0/mo",
    description: "Get listed in the directory",
    features: ["Basic directory listing", "Contact info visible", "No credit card required"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$49/mo",
    description: "Grow with leads & analytics",
    features: ["Everything in Free", "Lead inbox with contact details", "Up to 20 photos", "Reviews & analytics", "Availability calendar"],
    highlight: true,
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "$149/mo",
    description: "Full business management suite",
    features: ["Everything in Pro", "Priority & unlimited leads", "Client CRM", "Invoicing", "Unlimited photos", "Featured badge in directory"],
  },
];

export default function ListYourBusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "premium">("free");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { city: "El Paso", agreeToTerms: false },
  });

  const step1Fields = ["businessName", "category", "city", "description", "email", "password"] as const;

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(step1Fields);
      if (valid) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - photoFiles.length);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPhotoFiles((prev) => [...prev, ...newFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { business_name: data.businessName, role: "vendor" } },
    });

    if (authError) {
      toast.error(authError.message);
      setIsSubmitting(false);
      return;
    }

    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: data.businessName,
        category: data.category,
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        city: data.city,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to create listing. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const { vendor } = await res.json();

    if (photoFiles.length > 0 && vendor?.id) {
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const path = `vendors/${vendor.id}/${Date.now()}-${file.name}`;
        const { data: uploadData } = await supabase.storage
          .from("vendor-photos")
          .upload(path, file, { upsert: true });
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("vendor-photos").getPublicUrl(path);
          uploadedUrls.push(publicUrl);
        }
      }
      if (uploadedUrls.length > 0) {
        await supabase.from("vendors").update({ gallery_urls: uploadedUrls }).eq("id", vendor.id);
      }
    }

    if (selectedPlan !== "free" && vendor?.id) {
      const checkoutRes = await fetch("/api/vendors/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (checkoutRes.ok) {
        const { url } = await checkoutRes.json();
        if (url) { window.location.href = url; return; }
      }
    }

    toast.success("Listing submitted! Check your email for confirmation.");
    router.push("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FDF7F0] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🌹</span>
            <span className="font-heading font-bold text-xl text-[#3D1A2E]">Everything Quince EP</span>
          </Link>
          <h1 className="font-heading font-bold text-3xl text-[#3D1A2E] mb-2">List Your Business</h1>
          <p className="text-[#3D1A2E]/60 font-body text-sm">Join vendors reaching El Paso quinceañera families every day</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {[
            { n: 1, label: "Your Business" },
            { n: 2, label: "Photos" },
            { n: 3, label: "Choose Plan" },
          ].map(({ n, label }, idx) => (
            <div key={n} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > n ? "bg-[#C4547A] text-white" :
                  step === n ? "bg-[#3D1A2E] text-white" :
                  "bg-[#f3ddb9] text-[#3D1A2E]/40"
                }`}>
                  {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                </div>
                <span className={`text-xs font-body hidden sm:block ${step === n ? "text-[#3D1A2E] font-semibold" : "text-[#3D1A2E]/40"}`}>
                  {label}
                </span>
              </div>
              {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${step > n ? "bg-[#C4547A]" : "bg-[#f3ddb9]"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1: Business Info */}
          {step === 1 && (
            <div className="card p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[#3D1A2E] mb-1">Your Business</h2>
                <p className="text-sm text-[#3D1A2E]/60 font-body">Tell families about your quinceañera services.</p>
              </div>

              <div>
                <label className="label">Business Name *</label>
                <input {...register("businessName")} placeholder="e.g. Rosa Photography Studio" className="input-field" />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select {...register("category")} className="input-field">
                    <option value="">Select category</option>
                    {VENDOR_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="label">City *</label>
                  <select {...register("city")} className="input-field">
                    {CITIES.map((c) => (
                      <option key={c.slug} value={c.name}>{c.name}, TX</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input {...register("phone")} type="tel" placeholder="(915) 555-0100" className="input-field" />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input {...register("website")} type="url" placeholder="https://yoursite.com" className="input-field" />
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Describe your services, experience, and what makes you special for quinceañeras..."
                  className="input-field resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <hr className="border-[#f3ddb9]" />

              <div>
                <h3 className="font-heading font-semibold text-[#3D1A2E] mb-4">Account Credentials</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email *</label>
                    <input {...register("email")} type="email" placeholder="you@business.com" className="input-field" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <input {...register("password")} type="password" placeholder="Min 8 characters" className="input-field" />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              </div>

              <button type="button" onClick={nextStep} className="btn-primary w-full">
                Continue to Photos →
              </button>

              <p className="text-center text-sm text-[#3D1A2E]/50 font-body">
                Already listed?{" "}
                <Link href="/vendor/login" className="text-[#C4547A] hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* STEP 2: Photos */}
          {step === 2 && (
            <div className="card p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[#3D1A2E] mb-1">Add Photos</h2>
                <p className="text-sm text-[#3D1A2E]/60 font-body">
                  Show your best work. Optional — you can add photos after approval too.
                </p>
              </div>

              <label
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#f3ddb9] rounded-2xl cursor-pointer hover:border-[#C4547A]/50 transition-colors bg-[#FDF7F0] group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); }}
              >
                <Upload className="w-10 h-10 text-[#3D1A2E]/20 group-hover:text-[#C4547A]/40 transition-colors mb-3" />
                <p className="text-[#3D1A2E]/60 font-body text-sm font-medium">Drag & drop or tap to upload</p>
                <p className="text-[#3D1A2E]/30 font-body text-xs mt-1">JPG, PNG — up to 10 photos, 10MB each</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => addPhotos(e.target.files)}
                />
              </label>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f3ddb9] group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
                <button type="button" onClick={nextStep} className="btn-primary flex-1">
                  {photoFiles.length === 0
                    ? "Skip for Now →"
                    : `Continue with ${photoFiles.length} photo${photoFiles.length !== 1 ? "s" : ""} →`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Plan Selection */}
          {step === 3 && (
            <div className="card p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[#3D1A2E] mb-1">Choose Your Plan</h2>
                <p className="text-sm text-[#3D1A2E]/60 font-body">Start free and upgrade anytime from your dashboard.</p>
              </div>

              <div className="space-y-3">
                {PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedPlan === plan.id
                        ? "border-[#C4547A] bg-[#C4547A]/5"
                        : "border-[#f3ddb9] hover:border-[#C4547A]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPlan === plan.id ? "border-[#C4547A] bg-[#C4547A]" : "border-[#f3ddb9]"
                        }`}>
                          {selectedPlan === plan.id && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="font-heading font-bold text-[#3D1A2E]">{plan.name}</span>
                        {plan.highlight && (
                          <span className="text-xs bg-[#C4547A] text-white font-semibold px-2 py-0.5 rounded-full">Popular</span>
                        )}
                      </div>
                      <span className="font-bold text-[#C4547A]">{plan.price}</span>
                    </div>
                    <p className="text-xs text-[#3D1A2E]/60 font-body mb-2 ml-6">{plan.description}</p>
                    <div className="ml-6 space-y-1">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-[#3D1A2E]/70 font-body">
                          <CheckCircle2 className="w-3 h-3 text-[#C4547A] flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" {...register("agreeToTerms")} className="mt-0.5 accent-[#C4547A]" />
                  <span className="text-sm text-[#3D1A2E]/80 font-body">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#C4547A] hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-[#C4547A] hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms.message}</p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1">← Back</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </span>
                  ) : selectedPlan === "free"
                    ? "Submit Free Listing"
                    : `Start ${PLAN_OPTIONS.find((p) => p.id === selectedPlan)?.name} Plan →`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
