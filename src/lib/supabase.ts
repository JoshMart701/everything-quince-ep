"use client";
import { createClient } from "@/lib/supabase/client";

export async function signUp(email: string, password: string, fullName?: string) {
  return createClient().auth.signUp({ email, password, options: { data: { full_name: fullName ?? "" } } });
}
export async function signIn(email: string, password: string) {
  return createClient().auth.signInWithPassword({ email, password });
}
export async function signOut() { return createClient().auth.signOut(); }
export async function getClientUser() { return createClient().auth.getUser(); }
