/**
 * High-level auth helpers.
 * Client functions: import directly in "use client" components.
 * Server functions: import in Server Components or Route Handlers.
 */

// ── Client-side helpers ────────────────────────────────────────────────────

import { createClient as createBrowserClient } from "@/lib/supabase/client";

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName ?? "" },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getClientUser() {
  const supabase = createBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// ── Server-side helpers ────────────────────────────────────────────────────
// These are async and must only be called from Server Components or
// Route Handlers — never in "use client" modules.

export async function getServerUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getServerProfile() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { profile };
}
