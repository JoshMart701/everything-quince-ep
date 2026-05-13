import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Plus, ChevronLeft, Calendar, Phone, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function VendorClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, plan, business_name")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/vendor/signup");
  if (vendor.plan !== "premium") redirect("/vendor/upgrade");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("event_date", { ascending: true });

  const statusColors: Record<string, string> = {
    prospect: "bg-yellow-100 text-yellow-700",
    booked: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    lost: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard" className="text-white/70 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-heading font-bold">Client CRM</span>
          </div>
          <Link href="/vendor/clients/new" className="btn-secondary text-sm px-4 py-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {["prospect", "booked", "completed", "lost"].map((status) => (
            <div key={status} className="card p-4 text-center">
              <p className="font-heading font-bold text-2xl text-[#3D1A2E]">
                {clients?.filter((c) => c.status === status).length ?? 0}
              </p>
              <p className="text-xs text-[#3D1A2E]/60 font-body capitalize">{status}</p>
            </div>
          ))}
        </div>

        {!clients || clients.length === 0 ? (
          <div className="card p-16 text-center">
            <Users className="w-16 h-16 text-[#f3ddb9] mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-2">No clients yet</h2>
            <p className="text-[#3D1A2E]/60 font-body mb-6">Add your quinceañera clients to track bookings and event details.</p>
            <Link href="/vendor/clients/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Add First Client
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {clients.map((client) => (
              <div key={client.id} className="card p-5 hover:shadow-[0_4px_24px_rgba(196,84,122,0.12)] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg">{client.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[client.status] ?? "bg-gray-100"}`}>
                      {client.status}
                    </span>
                  </div>
                  {client.event_date && (
                    <div className="text-right">
                      <p className="text-xs text-[#3D1A2E]/50">Event Date</p>
                      <p className="text-sm font-semibold text-[#C4547A]">{formatDate(client.event_date)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-sm font-body text-[#3D1A2E]/70">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${client.email}`} className="hover:text-[#C4547A] transition-colors">{client.email}</a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      <a href={`tel:${client.phone}`} className="hover:text-[#C4547A] transition-colors">{client.phone}</a>
                    </div>
                  )}
                  {client.guest_count && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      {client.guest_count} guests
                    </div>
                  )}
                  {client.venue && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {client.venue}
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="mt-3 text-xs text-[#3D1A2E]/60 bg-[#FDF7F0] rounded-lg p-3 font-body italic">
                    {client.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
