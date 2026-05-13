"use client";
import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient is a singleton internally; safe to call multiple times.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder_key"
  );
}
