"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Moon } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormValues) => {
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push(redirect);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
      </div>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-[#6B4FA0] hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[#6B4FA0] text-white font-semibold hover:bg-[#5A3F8A] disabled:opacity-60 transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FDF7F0] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
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
          <h1 className="font-heading text-2xl font-bold text-[#1E1B4B] mb-1">Welcome back</h1>
          <p className="text-[#1E1B4B]/60 text-sm mb-6">Sign in to your account to continue.</p>

          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-[#F3F0FA]" />}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-[#E5E0F0] text-center">
            <p className="text-sm text-[#1E1B4B]/60">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#6B4FA0] font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
