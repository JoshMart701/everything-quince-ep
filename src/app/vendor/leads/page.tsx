import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MessageSquare, Calendar, MapPin, Users, DollarSign, ChevronLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function VendorLeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, plan, business_name")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/vendor/signup");
  if (vendor.plan === "free") redirect("/vendor/upgrade");

  const { data: leadRoutings } = await supabase
    .from("lead_routing")
    .select("*, leads(*)")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/vendor/dashboard" className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-heading font-bold">Lead Inbox</span>
          <span className="ml-2 bg-[#C4547A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {leadRoutings?.filter(r => r.status === "new").length ?? 0} new
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!leadRoutings || leadRoutings.length === 0 ? (
          <div className="card p-16 text-center">
            <MessageSquare className="w-16 h-16 text-[#f3ddb9] mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-2">No leads yet</h2>
            <p className="text-[#3D1A2E]/60 font-body">
              Leads will appear here when families request quotes matching your category and service area.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {leadRoutings.map((routing: any) => {
              const lead = routing.leads;
              return (
                <div key={routing.id} className={`card p-6 ${routing.status === "new" ? "border-l-4 border-l-[#C4547A]" : ""}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg">{lead?.name}</h3>
                        {routing.status === "new" && (
                          <span className="text-xs bg-[#C4547A]/10 text-[#C4547A] font-semibold px-2 py-0.5 rounded-full">New</span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm font-body">
                        {lead?.email && (
                          <div className="flex items-center gap-2 text-[#3D1A2E]/70">
                            <span className="font-medium text-[#3D1A2E]">Email:</span>
                            <a href={`mailto:${lead.email}`} className="text-[#C4547A] hover:underline">{lead.email}</a>
                          </div>
                        )}
                        {lead?.phone && (
                          <div className="flex items-center gap-2 text-[#3D1A2E]/70">
                            <span className="font-medium text-[#3D1A2E]">Phone:</span>
                            <a href={`tel:${lead.phone}`} className="text-[#C4547A] hover:underline">{lead.phone}</a>
                          </div>
                        )}
                        {lead?.event_date && (
                          <div className="flex items-center gap-2 text-[#3D1A2E]/70">
                            <Calendar className="w-3.5 h-3.5" />
                            Event: {formatDate(lead.event_date)}
                          </div>
                        )}
                        {lead?.event_city && (
                          <div className="flex items-center gap-2 text-[#3D1A2E]/70">
                            <MapPin className="w-3.5 h-3.5" />
                            {lead.event_city}
                          </div>
                        )}
                        {lead?.guest_count && (
                          <div className="flex items-center gap-2 text-[#3D1A2E]/70">
                            <Users className="w-3.5 h-3.5" />
                            {lead.guest_count} guests
                          </div>
                        )}
                        {lead?.budget_range && (
                          <div className="flex items-center gap-2 text-[#3D1A2E]/70">
                            <DollarSign className="w-3.5 h-3.5" />
                            Budget: {lead.budget_range}
                          </div>
                        )}
                      </div>

                      {lead?.message && (
                        <div className="mt-4 p-4 bg-[#FDF7F0] rounded-xl">
                          <p className="text-sm text-[#3D1A2E]/80 font-body italic">&ldquo;{lead.message}&rdquo;</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <p className="text-xs text-[#3D1A2E]/50 font-body">{formatDate(routing.created_at)}</p>
                      {lead?.email && (
                        <a href={`mailto:${lead.email}?subject=Re: Your Quinceañera Quote Request`} className="btn-primary text-sm px-4 py-2">
                          Reply by Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
