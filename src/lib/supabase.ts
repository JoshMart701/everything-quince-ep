"use client";
/**
 * Client-side auth helpers — safe to import in "use client" components.
 * For server-side helpers see /lib/supabase-server.ts
 */

import { createClient } from "@/lib/supabase/client";

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName ?? "" } },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getClientUser() {
  const supabase = createClient();
  return supabase.auth.getUser();
}
