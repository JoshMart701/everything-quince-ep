"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Moon } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "@/lib/supabase";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ fullName, email, password }: FormValues) => {
    setLoading(true);
    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! Let's set up your family.");
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#FDF7F0] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Moon className="w-8 h-8 text-[#6B4FA0]" />
            <div className="text-left">
              <p className="font-heading font-bold text-xl text-[#1E1B4B]">Amen Goodnight</p>
              <p className="text-[#6B4FA0] text-sm">Faith-filled bedtime stories</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E0F0] p-8">
          <h1 className="font-heading text-2xl font-bold text-[#1E1B4B] mb-1">
            Create your account
          </h1>
          <p className="text-[#1E1B4B]/60 text-sm mb-6">
            Start your free trial — no credit card required.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1E1B4B] mb-1">
                Full name
              </label>
              <input
                {...register("fullName")}
                type="text"
                placeholder="Jane Smith"
                className="w-full px-4 py-2.5 rounded-lg border border-[#E5E0F0] bg-white text-[#1E1B4B] placeholder:text-[#1E1B4B]/30 focus:outline-none focus:ring-2 focus:ring-[#6B4FA0]/40 focus:border-[#6B4FA0] transition"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E1B4B] mb-1">
                Email address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-[#E5E0F0] bg-white text-[#1E1B4B] placeholder:text-[#1E1B4B]/30 focus:outline-none focus:ring-2 focus:ring-[#6B4FA0]/40 focus:border-[#6B4FA0] transition"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E1B4B] mb-1">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-[#E5E0F0] bg-white text-[#1E1B4B] placeholder:text-[#1E1B4B]/30 focus:outline-none focus:ring-2 focus:ring-[#6B4FA0]/40 focus:border-[#6B4FA0] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E1B4B]/40 hover:text-[#1E1B4B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-[#1E1B4B]/40 mt-1">
                Min 8 characters, one uppercase letter, one number.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#6B4FA0] text-white font-semibold hover:bg-[#5A3F8A] disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>

            <p className="text-xs text-center text-[#1E1B4B]/40">
              By signing up you agree to our{" "}
              <Link href="/terms" className="underline hover:text-[#6B4FA0]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-[#6B4FA0]">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5E0F0] text-center">
            <p className="text-sm text-[#1E1B4B]/60">
              Already have an account?{" "}
              <Link href="/login" className="text-[#6B4FA0] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
