"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface NavbarProps {
  profile: Profile;
  businessName: string;
}

export function Navbar({ profile, businessName }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isManager = profile.role === "manager";
  const dashHref  = isManager ? "/manager/dashboard" : "/employee/dashboard";

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={dashHref} className="flex items-center gap-2 font-bold">
          <BarChart3 className="w-5 h-5 text-[#4f46e5]" />
          <span className="text-[#4f46e5]">Standpoint</span>
        </Link>

        {isManager && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/manager/dashboard"   className="hover:text-gray-900 transition-colors">Dashboard</Link>
            <Link href="/manager/employees"   className="hover:text-gray-900 transition-colors">Team</Link>
            <Link href="/manager/reviews/new" className="hover:text-gray-900 transition-colors">New Review</Link>
            <Link href="/billing"             className="hover:text-gray-900 transition-colors">Billing</Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-xs font-bold">
              {profile.avatar_initials}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 leading-none">{profile.full_name}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{profile.role} · {businessName}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
