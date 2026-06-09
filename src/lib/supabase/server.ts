import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://placeholder.supabase.co";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder_anon_key";
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder_service_role_key";

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return createServerClient(URL, ANON, { cookies: { getAll: () => [], setAll: () => {} } });
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
    },
  });
}

export async function createServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return createServerClient(URL, SVC, { cookies: { getAll: () => [], setAll: () => {} } });
  return createServerClient(URL, SVC, { cookies: { getAll: () => [], setAll: () => {} } });
}
