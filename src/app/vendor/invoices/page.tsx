import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Plus, ChevronLeft } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function VendorInvoicesPage() {
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

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const statusColors = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    canceled: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/dashboard" className="text-white/70 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-heading font-bold">Invoices</span>
          </div>
          <Link href="/vendor/invoices/new" className="btn-secondary text-sm px-4 py-2">
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Outstanding", value: formatCurrency(invoices?.filter(i => i.status === "sent" || i.status === "overdue").reduce((a, i) => a + i.balance_due, 0) ?? 0), color: "text-[#C4547A]" },
            { label: "Paid (All Time)", value: formatCurrency(invoices?.filter(i => i.status === "paid").reduce((a, i) => a + i.total, 0) ?? 0), color: "text-green-600" },
            { label: "Total Invoices", value: String(invoices?.length ?? 0), color: "text-[#3D1A2E]" },
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <p className={`font-heading font-bold text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[#3D1A2E]/60 font-body mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {!invoices || invoices.length === 0 ? (
          <div className="card p-16 text-center">
            <FileText className="w-16 h-16 text-[#f3ddb9] mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-[#3D1A2E] mb-2">No invoices yet</h2>
            <p className="text-[#3D1A2E]/60 font-body mb-6">Create your first invoice for a quinceañera client.</p>
            <Link href="/vendor/invoices/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f3ddb9] bg-[#FDF7F0]">
                  <th className="text-left px-6 py-3 font-body font-semibold text-[#3D1A2E]/70">#</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Client</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Total</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Due Date</th>
                  <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3ddb9]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#FDF7F0] transition-colors">
                    <td className="px-6 py-4 font-body font-medium text-[#C4547A]">{inv.invoice_number}</td>
                    <td className="px-4 py-4">
                      <p className="font-body font-medium text-[#3D1A2E]">{inv.client_name}</p>
                      <p className="text-xs text-[#3D1A2E]/50">{inv.client_email}</p>
                    </td>
                    <td className="px-4 py-4 font-body font-bold text-[#3D1A2E]">
                      {formatCurrency(inv.total / 100)}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#3D1A2E]/70 font-body">
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[inv.status as keyof typeof statusColors] ?? "bg-gray-100"}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
