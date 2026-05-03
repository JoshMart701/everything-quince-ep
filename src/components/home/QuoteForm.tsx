"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2 } from "lucide-react";
import { VENDOR_CATEGORIES, CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const quoteSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  eventCity: z.string().min(1, "Please select a city"),
  guestCount: z.string().optional(),
  budgetRange: z.string().optional(),
  categories: z.array(z.string()).min(1, "Please select at least one service"),
  message: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 – $10,000",
  "$10,000 – $20,000",
  "$20,000 – $35,000",
  "$35,000+",
];

export default function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { categories: [], eventCity: "El Paso" },
  });

  const selectedCategories = watch("categories");

  const toggleCategory = (slug: string) => {
    const current = selectedCategories ?? [];
    if (current.includes(slug)) {
      setValue("categories", current.filter((c) => c !== slug));
    } else {
      setValue("categories", [...current, slug]);
    }
  };

  const onSubmit = async (data: QuoteFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="quotes" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="card p-12">
            <CheckCircle2 className="w-16 h-16 text-[#C4547A] mx-auto mb-4" />
            <h2 className="font-heading text-3xl font-bold text-[#3D1A2E] mb-3">
              Quote Request Sent! 🌹
            </h2>
            <p className="text-[#3D1A2E]/70 font-body mb-6">
              We&apos;ve received your request and are matching you with the best El Paso vendors.
              You&apos;ll hear from us and matched vendors within 24–48 hours.
            </p>
            <p className="text-sm text-[#3D1A2E]/50 font-body">
              Check your inbox for a confirmation email.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quotes" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">Get Free Quotes</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Fill out this quick form and we&apos;ll match you with the best El Paso quinceañera vendors
            for your date, budget, and style — at no cost to you.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label className="label">Your Name *</label>
              <input {...register("name")} placeholder="María García" className="input-field" />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address *</label>
              <input {...register("email")} type="email" placeholder="maria@example.com" className="input-field" />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone Number</label>
              <input {...register("phone")} type="tel" placeholder="(915) 555-0100" className="input-field" />
            </div>

            {/* Event Date */}
            <div>
              <label className="label">Event Date</label>
              <input {...register("eventDate")} type="date" className="input-field" />
            </div>

            {/* City */}
            <div>
              <label className="label">Event City *</label>
              <select {...register("eventCity")} className="input-field">
                {CITIES.map((city) => (
                  <option key={city.slug} value={city.name}>
                    {city.name}, {city.state}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {errors.eventCity && (
                <p className="text-red-500 text-xs mt-1">{errors.eventCity.message}</p>
              )}
            </div>

            {/* Guest Count */}
            <div>
              <label className="label">Expected Guest Count</label>
              <select {...register("guestCount")} className="input-field">
                <option value="">Select range</option>
                <option value="Under 50">Under 50</option>
                <option value="50–100">50–100</option>
                <option value="100–200">100–200</option>
                <option value="200–300">200–300</option>
                <option value="300+">300+</option>
              </select>
            </div>
          </div>

          {/* Budget Range */}
          <div className="mb-6">
            <label className="label">Budget Range</label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_RANGES.map((range) => (
                <label key={range} className="cursor-pointer">
                  <input
                    type="radio"
                    {...register("budgetRange")}
                    value={range}
                    className="sr-only"
                  />
                  <span className={cn(
                    "inline-flex items-center px-4 py-2 rounded-full border text-sm font-body transition-all",
                    watch("budgetRange") === range
                      ? "bg-[#C4547A] text-white border-[#C4547A]"
                      : "border-[#f3ddb9] text-[#3D1A2E]/70 hover:border-[#C4547A]/50"
                  )}>
                    {range}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Services Needed */}
          <div className="mb-6">
            <label className="label">Services Needed *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {VENDOR_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories?.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-body transition-all text-left",
                      isSelected
                        ? "bg-[#C4547A]/10 border-[#C4547A] text-[#C4547A]"
                        : "border-[#f3ddb9] text-[#3D1A2E]/70 hover:border-[#C4547A]/40"
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-xs mt-1">{errors.categories.message}</p>
            )}
          </div>

          {/* Message */}
          <div className="mb-8">
            <label className="label">Additional Details</label>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Tell us more about your vision, theme, or any specific requests..."
              className="input-field resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Quote Request
                </>
              )}
            </button>
            <p className="text-xs text-[#3D1A2E]/50 font-body text-center">
              Free service • No spam • Matched vendors will contact you directly
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
