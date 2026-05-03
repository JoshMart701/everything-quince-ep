"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Plus, Trash2, FileText, Send } from "lucide-react";
import { formatCurrency, generateInvoiceNumber } from "@/lib/utils";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

function newLineItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0 };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [invoiceNumber] = useState(generateInvoiceNumber());
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(8.25);
  const [depositAmount, setDepositAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("50% deposit required to secure your date. Balance due 7 days before event.");
  const [lineItems, setLineItems] = useState<LineItem[]>([newLineItem()]);

  // Computations
  const subtotal = lineItems.reduce((s, item) => s + item.quantity * item.unit_price, 0);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;
  const balanceDue = total - depositAmount * 100;

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/vendor/login"); return; }

      const { data: v } = await supabase
        .from("vendors")
        .select("id, plan, business_name, email, phone, address, city, state")
        .eq("user_id", user.id)
        .single();

      if (!v || v.plan !== "premium") { router.push("/vendor/upgrade"); return; }
      setVendor(v);
      setLoading(false);
    };
    load();
  }, []);

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const addLineItem = () => setLineItems(prev => [...prev, newLineItem()]);
  const removeLineItem = (id: string) => setLineItems(prev => prev.filter(item => item.id !== id));

  const saveInvoice = async (status: "draft" | "sent") => {
    if (!vendor || !clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    setIsSaving(true);

    const { error } = await supabase.from("invoices").insert({
      vendor_id: vendor.id,
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail || null,
      line_items: lineItems.filter(i => i.description),
      subtotal: Math.round(subtotal * 100),
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total: Math.round(total * 100),
      deposit_amount: Math.round(depositAmount * 100),
      balance_due: balanceDue,
      due_date: dueDate || null,
      notes: notes || null,
      terms: terms || null,
      status,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    });

    if (error) {
      toast.error("Failed to save invoice");
    } else {
      toast.success(status === "sent" ? "Invoice saved & marked as sent!" : "Invoice saved as draft!");
      router.push("/vendor/invoices");
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF7F0] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C4547A]/30 border-t-[#C4547A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7F0]">
      <header className="bg-[#3D1A2E] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/invoices" className="text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <span className="font-heading font-bold">New Invoice</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveInvoice("draft")} disabled={isSaving} className="btn-outline-white text-sm px-4 py-2">
              Save Draft
            </button>
            <button onClick={() => saveInvoice("sent")} disabled={isSaving} className="btn-secondary text-sm px-4 py-2">
              <Send className="w-4 h-4" />
              {isSaving ? "Saving…" : "Mark as Sent"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── EDITOR ── */}
          <div className="space-y-6">
            {/* Client details */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-[#3D1A2E] text-lg mb-4">Client Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Client Name *</label>
                  <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. García Family" className="input-field" />
                </div>
                <div>
                  <label className="label">Client Email</label>
                  <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="maria@email.com" className="input-field" />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-[#3D1A2E] text-lg mb-4">Services & Items</h2>
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-body font-semibold text-[#3D1A2E]/50 pb-1">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-3 text-right">Unit Price</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>

                {lineItems.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={item.description}
                      onChange={e => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="e.g. Photography package"
                      className="col-span-5 input-field text-sm py-2"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 1)}
                      className="col-span-2 input-field text-sm py-2 text-center"
                    />
                    <div className="col-span-3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D1A2E]/40 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price || ""}
                        onChange={e => updateLineItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="input-field text-sm py-2 pl-6 text-right"
                      />
                    </div>
                    <div className="col-span-1 text-right text-sm font-semibold text-[#3D1A2E]">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </div>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="text-[#3D1A2E]/30 hover:text-red-500 transition-colors disabled:opacity-20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button onClick={addLineItem} className="flex items-center gap-2 text-sm text-[#C4547A] hover:text-[#b03a63] font-body font-medium transition-colors mt-2">
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>

              {/* Totals */}
              <div className="mt-5 pt-5 border-t border-[#f3ddb9] space-y-2">
                <div className="flex justify-between text-sm font-body text-[#3D1A2E]/70">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-body text-[#3D1A2E]/70 items-center">
                  <span className="flex items-center gap-2">
                    Tax (
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={taxRate}
                      onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-12 border border-[#f3ddb9] rounded px-1 py-0.5 text-xs text-center"
                    />
                    %)
                  </span>
                  <span>{formatCurrency(taxAmount / 100)}</span>
                </div>
                <div className="flex justify-between font-heading font-bold text-[#3D1A2E] text-lg pt-2 border-t border-[#f3ddb9]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm font-body text-[#3D1A2E]/70 items-center">
                  <span className="flex items-center gap-2">
                    Deposit (
                    <span className="text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={depositAmount || ""}
                      onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-20 border border-[#f3ddb9] rounded px-2 py-0.5 text-xs"
                    />
                    )
                  </span>
                  <span className="text-green-600">−{formatCurrency(depositAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#C4547A] text-base">
                  <span>Balance Due</span>
                  <span>{formatCurrency(Math.max(0, balanceDue / 100))}</span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="card p-6">
              <div className="space-y-4">
                <div>
                  <label className="label">Notes to Client</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Thank you for choosing us for your quinceañera!" className="input-field resize-none" />
                </div>
                <div>
                  <label className="label">Payment Terms</label>
                  <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={2} className="input-field resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <p className="text-xs text-[#3D1A2E]/50 font-body mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Live Preview
            </p>
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(61,26,46,0.12)] overflow-hidden border border-[#f3ddb9]">
              {/* Invoice header */}
              <div className="bg-gradient-to-r from-[#3D1A2E] to-[#5c2044] px-8 py-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-heading font-bold text-xl">{vendor?.business_name}</p>
                    {vendor?.address && <p className="text-white/60 text-xs mt-1">{vendor.address}</p>}
                    {vendor?.phone && <p className="text-white/60 text-xs">{vendor.phone}</p>}
                    {vendor?.email && <p className="text-white/60 text-xs">{vendor.email}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[#C9A84C] font-heading font-bold text-2xl">INVOICE</p>
                    <p className="text-white/70 text-sm mt-1">#{invoiceNumber}</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6">
                {/* Bill to */}
                <div className="flex justify-between mb-6">
                  <div>
                    <p className="text-xs text-[#3D1A2E]/50 font-body uppercase tracking-wider mb-1">Bill To</p>
                    <p className="font-body font-semibold text-[#3D1A2E]">{clientName || "Client Name"}</p>
                    {clientEmail && <p className="text-xs text-[#3D1A2E]/60">{clientEmail}</p>}
                  </div>
                  {dueDate && (
                    <div className="text-right">
                      <p className="text-xs text-[#3D1A2E]/50 font-body uppercase tracking-wider mb-1">Due Date</p>
                      <p className="font-body font-semibold text-[#C4547A] text-sm">{new Date(dueDate + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
                    </div>
                  )}
                </div>

                {/* Line items */}
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b border-[#f3ddb9]">
                      <th className="text-left pb-2 font-body font-semibold text-[#3D1A2E]/50 text-xs">Description</th>
                      <th className="text-center pb-2 font-body font-semibold text-[#3D1A2E]/50 text-xs">Qty</th>
                      <th className="text-right pb-2 font-body font-semibold text-[#3D1A2E]/50 text-xs">Price</th>
                      <th className="text-right pb-2 font-body font-semibold text-[#3D1A2E]/50 text-xs">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3ddb9]">
                    {lineItems.filter(i => i.description).map(item => (
                      <tr key={item.id}>
                        <td className="py-2 text-[#3D1A2E] font-body">{item.description}</td>
                        <td className="py-2 text-center text-[#3D1A2E]/60">{item.quantity}</td>
                        <td className="py-2 text-right text-[#3D1A2E]/60">{formatCurrency(item.unit_price)}</td>
                        <td className="py-2 text-right font-semibold text-[#3D1A2E]">{formatCurrency(item.quantity * item.unit_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t border-[#f3ddb9] pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-[#3D1A2E]/60 font-body">
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-sm text-[#3D1A2E]/60 font-body">
                      <span>Tax ({taxRate}%)</span><span>{formatCurrency(taxAmount / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-heading font-bold text-[#3D1A2E] text-base border-t border-[#f3ddb9] pt-2">
                    <span>Total</span><span>{formatCurrency(total)}</span>
                  </div>
                  {depositAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-body">
                      <span>Deposit Paid</span><span>−{formatCurrency(depositAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-heading font-bold text-[#C4547A] text-lg bg-[#C4547A]/5 rounded-xl px-3 py-2 mt-2">
                    <span>Balance Due</span>
                    <span>{formatCurrency(Math.max(0, balanceDue / 100))}</span>
                  </div>
                </div>

                {/* Notes */}
                {(notes || terms) && (
                  <div className="mt-5 space-y-3">
                    {notes && (
                      <div>
                        <p className="text-xs text-[#3D1A2E]/50 uppercase tracking-wider font-body mb-1">Notes</p>
                        <p className="text-xs text-[#3D1A2E]/70 font-body">{notes}</p>
                      </div>
                    )}
                    {terms && (
                      <div>
                        <p className="text-xs text-[#3D1A2E]/50 uppercase tracking-wider font-body mb-1">Terms</p>
                        <p className="text-xs text-[#3D1A2E]/70 font-body">{terms}</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-center text-xs text-[#3D1A2E]/30 font-body mt-6">
                  Thank you for your business! 🌹 Everything Quince EP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
