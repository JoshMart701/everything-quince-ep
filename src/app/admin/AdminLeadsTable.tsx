"use client";

import { formatDate } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  event_city?: string;
  guest_count?: number;
  budget_range?: string;
  categories: string[];
  status: string;
  created_at: string;
}

export default function AdminLeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f3ddb9] bg-[#FDF7F0]">
            <th className="text-left px-6 py-3 font-body font-semibold text-[#3D1A2E]/70">Client</th>
            <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Event Date</th>
            <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">City</th>
            <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Budget</th>
            <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Services</th>
            <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Received</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f3ddb9]">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-[#FDF7F0] transition-colors">
              <td className="px-6 py-4">
                <div>
                  <p className="font-body font-medium text-[#3D1A2E]">{lead.name}</p>
                  <p className="text-xs text-[#3D1A2E]/50">{lead.email}</p>
                  {lead.phone && <p className="text-xs text-[#3D1A2E]/50">{lead.phone}</p>}
                </div>
              </td>
              <td className="px-4 py-4 text-xs text-[#3D1A2E]/70 font-body">
                {lead.event_date ? formatDate(lead.event_date) : "TBD"}
              </td>
              <td className="px-4 py-4 text-xs text-[#3D1A2E]/70 font-body">
                {lead.event_city ?? "–"}
              </td>
              <td className="px-4 py-4">
                <span className="text-xs bg-[#C9A84C]/10 text-[#906523] px-2 py-0.5 rounded-full">
                  {lead.budget_range ?? "Not specified"}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {lead.categories.slice(0, 3).map((cat) => (
                    <span key={cat} className="text-xs bg-[#C4547A]/10 text-[#C4547A] px-2 py-0.5 rounded-full capitalize">
                      {cat}
                    </span>
                  ))}
                  {lead.categories.length > 3 && (
                    <span className="text-xs text-[#3D1A2E]/50">+{lead.categories.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-xs text-[#3D1A2E]/60 font-body">
                {formatDate(lead.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="text-center py-10 text-[#3D1A2E]/50 font-body">No leads yet.</div>
      )}
    </div>
  );
}
