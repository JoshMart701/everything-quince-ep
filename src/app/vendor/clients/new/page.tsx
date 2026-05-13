"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function NewClientPage() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    event_date: "",
    guest_count: "",
    venue: "",
    budget: "",
    notes: "",
    status: "prospect",
  });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/vendor/login"); return; }
      const { data: v } = await supabase
        .from("vendors")
        .select("id, plan")
        .eq("user_id", user.id)
        .single();
      if (!v || v.plan !== "premium") { router.push("/vendor/upgrade"); return; }
      setVendorId(v.id);
    };
    load();
  }, []);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !form.name.trim()) { toast.error("Name is required"); return; }
    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from("clients").insert({
      vendor_id: vendorId,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      event_date: form.event_date || null,
      guest_count: form.guest_count ? parseInt(form.guest_count) : null,
      venue: form.venue || null,
      budget: form.budget ? parseInt(form.budget) : null,
      notes: form.notes || null,
      status: form.status,
    });

    if (error) toast.error("Failed to add client");
    else { toast.success("Client added!"); router.push("/vendor/clients"); }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/vendor/clients" className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading font-bold">Add Client</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <h2 className="font-heading font-bold text-[#3D1A2E] text-xl">New Quinceañera Client</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label">Client / Family Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. García Family" className="input-field" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="maria@email.com" className="input-field" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(915) 555-0100" className="input-field" />
            </div>
            <div>
              <label className="label">Event Date</label>
              <input type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label">Expected Guests</label>
              <input type="number" min="0" value={form.guest_count} onChange={e => set("guest_count", e.target.value)} placeholder="150" className="input-field" />
            </div>
            <div>
              <label className="label">Venue</label>
              <input value={form.venue} onChange={e => set("venue", e.target.value)} placeholder="El Paso Marriott" className="input-field" />
            </div>
            <div>
              <label className="label">Budget ($)</label>
              <input type="number" min="0" value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="15000" className="input-field" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="input-field">
                <option value="prospect">Prospect</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={4} placeholder="Theme, special requests, referral source…" className="input-field resize-none" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…
                </span>
              ) : (
                <><UserPlus className="w-4 h-4" /> Add Client</>
              )}
            </button>
            <Link href="/vendor/clients" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
