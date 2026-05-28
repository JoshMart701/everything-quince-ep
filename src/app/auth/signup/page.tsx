"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Briefcase, Users, Eye, EyeOff, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/lib/types";

type Step = "role" | "details";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<MemberRole | null>(null);

  const [fullName, setFullName]       = useState("");
  const [businessName, setBusinessName] = useState("");
  const [joinCode, setJoinCode]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleRoleSelect = (selected: MemberRole) => {
    setRole(selected);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName,
          email,
          password,
          businessName: role === "manager" ? businessName : undefined,
          joinCode:     role === "employee" ? joinCode.toUpperCase().trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");

      router.push(role === "manager" ? "/manager/dashboard" : "/employee/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <BarChart3 className="w-7 h-7 text-[#4f46e5]" />
            <span className="text-[#4f46e5]">Standpoint</span>
          </Link>
        </div>

        {step === "role" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
              Get started
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8">
              How will you use Standpoint?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect("manager")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-left",
                  "border-gray-200 hover:border-[#4f46e5] hover:bg-indigo-50 group"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-[#4f46e5] transition-colors">
                  <Briefcase className="w-6 h-6 text-[#4f46e5] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">I&apos;m a Manager</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Create a workspace and review my team
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("employee")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-left",
                  "border-gray-200 hover:border-[#4f46e5] hover:bg-indigo-50 group"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-[#4f46e5] transition-colors">
                  <Users className="w-6 h-6 text-[#4f46e5] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">I&apos;m an Employee</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Join my team with a code from my manager
                  </p>
                </div>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#4f46e5] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <button
              onClick={() => { setStep("role"); setError(null); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#4f46e5] flex items-center justify-center">
                {role === "manager"
                  ? <Briefcase className="w-5 h-5 text-white" />
                  : <Users className="w-5 h-5 text-white" />
                }
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {role === "manager" ? "Create your workspace" : "Join your team"}
                </h2>
                <p className="text-xs text-gray-500">
                  {role === "manager"
                    ? "You'll get a join code to share with your team"
                    : "Enter the code your manager gave you"}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  placeholder="Alex Johnson"
                />
              </div>

              {role === "manager" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business / Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    placeholder="Acme Corp Engineering"
                  />
                </div>
              )}

              {role === "employee" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Join Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    placeholder="ABCDEF"
                  />
                  <p className="text-xs text-gray-400 mt-1">6-character code from your manager</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#4f46e5] text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? "Creating account…"
                  : role === "manager" ? "Create workspace" : "Join team"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#4f46e5] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
