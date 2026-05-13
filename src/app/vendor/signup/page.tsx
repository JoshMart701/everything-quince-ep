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
import { CheckCircle2 } from "lucide-react";

const signupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  category: z.string().min(1, "Select a category"),
  phone: z.string().optional(),
  city: z.string().min(1, "Select a city"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(20, "Please provide at least 20 characters").max(500),
  agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function VendorSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { city: "El Paso", agreeToTerms: false },
  });

  const nextStep = async () => {
    const fields = step === 1
      ? ["email", "password"] as const
      : ["businessName", "category", "city", "description"] as const;

    const valid = await trigger(fields);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { business_name: data.businessName, role: "vendor" },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setIsLoading(false);
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
      toast.error("Failed to create vendor profile. Please try again.");
      setIsLoading(false);
      return;
    }

    toast.success("Your listing has been submitted for review!");
    router.push("/vendor/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FDF7F0] py-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">🌹</span>
            <div>
              <p className="font-heading font-bold text-xl text-[#3D1A2E]">Everything Quince EP</p>
            </div>
          </Link>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > s ? "bg-[#C4547A] text-white" :
                step === s ? "bg-[#3D1A2E] text-white" :
                "bg-[#f3ddb9] text-[#3D1A2E]/50"
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-[#C4547A]" : "bg-[#f3ddb9]"}`} />}
            </div>
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-1">Create Your Account</h1>
                  <p className="text-[#3D1A2E]/60 text-sm font-body">Start with your login credentials.</p>
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input {...register("email")} type="email" placeholder="you@business.com" className="input-field" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input {...register("password")} type="password" placeholder="Min 8 characters" className="input-field" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <button type="button" onClick={nextStep} className="btn-primary w-full">
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Business Info */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-1">Your Business</h1>
                  <p className="text-[#3D1A2E]/60 text-sm font-body">Tell us about your quinceañera services.</p>
                </div>
                <div>
                  <label className="label">Business Name *</label>
                  <input {...register("businessName")} placeholder="e.g. Rosa Photography Studio" className="input-field" />
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select {...register("category")} className="input-field">
                    <option value="">Select your category</option>
                    {VENDOR_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City *</label>
                    <select {...register("city")} className="input-field">
                      {CITIES.map((city) => (
                        <option key={city.slug} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input {...register("phone")} type="tel" placeholder="(915) 555-0100" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Website</label>
                  <input {...register("website")} type="url" placeholder="https://yoursite.com" className="input-field" />
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </div>
                <div>
                  <label className="label">Business Description *</label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    placeholder="Describe your quinceañera services, experience, and what makes you special..."
                    className="input-field resize-none"
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="btn-primary flex-1">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-1">Almost Done!</h1>
                  <p className="text-[#3D1A2E]/60 text-sm font-body">Review your listing details before submitting.</p>
                </div>

                {/* Plan comparison */}
                <div className="space-y-3">
                  {[
                    { name: "Free", price: "$0/mo", desc: "Basic listing in directory", current: true },
                    { name: "Pro", price: "$49/mo", desc: "Leads, profile editor, reviews & analytics" },
                    { name: "Premium", price: "$149/mo", desc: "CRM, invoicing, priority leads" },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className={`p-4 rounded-xl border-2 ${
                        plan.current ? "border-[#C4547A] bg-[#C4547A]/5" : "border-[#f3ddb9]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-heading font-semibold text-[#3D1A2E]">{plan.name}</p>
                          <p className="text-xs text-[#3D1A2E]/60 font-body">{plan.desc}</p>
                        </div>
                        <p className="font-bold text-[#C4547A]">{plan.price}</p>
                      </div>
                      {plan.current && (
                        <p className="text-xs text-[#C4547A] font-semibold mt-1">✓ Starting with this plan</p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-[#3D1A2E]/50 font-body">
                  You can upgrade to Pro or Premium from your dashboard at any time.
                </p>

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("agreeToTerms")}
                      className="mt-0.5 accent-[#C4547A]"
                    />
                    <span className="text-sm text-[#3D1A2E]/80 font-body">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#C4547A] hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="text-[#C4547A] hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1">
                    Back
                  </button>
                  <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                    {isLoading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : "Submit Listing"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-[#f3ddb9] text-center">
            <p className="text-sm text-[#3D1A2E]/60 font-body">
              Already have an account?{" "}
              <Link href="/vendor/login" className="text-[#C4547A] font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
