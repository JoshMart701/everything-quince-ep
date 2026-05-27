"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface NavbarProps {
  profile: Profile;
  orgName: string;
}

export function Navbar({ profile, orgName }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const isManager = profile.role === "manager";
  const dashboardHref = isManager ? "/manager/dashboard" : "/employee/dashboard";

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={dashboardHref} className="flex items-center gap-2 font-bold text-gray-900">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span className="text-indigo-600">Standpoint</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          {isManager ? (
            <>
              <Link href="/manager/dashboard" className="hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/manager/employees" className="hover:text-gray-900 transition-colors">
                Employees
              </Link>
              <Link href="/manager/reviews/new" className="hover:text-gray-900 transition-colors">
                New Review
              </Link>
              <Link href="/billing" className="hover:text-gray-900 transition-colors">
                Billing
              </Link>
            </>
          ) : (
            <Link href="/employee/dashboard" className="hover:text-gray-900 transition-colors">
              My Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{profile.full_name}</p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{profile.role} · {orgName}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
