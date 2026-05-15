"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, MapPin, Tag, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  city: string;
  email: string;
  plan: string;
  status: string;
  created_at: string;
  description?: string;
  phone?: string;
}

export default function AdminVendorCards({ vendors }: { vendors: Vendor[] }) {
  const [list, setList] = useState(vendors);
  const [loading, setLoading] = useState<string | null>(null);

  const update = async (id: string, status: "approved" | "rejected") => {
    setLoading(id);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setList((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
      toast.success(status === "approved" ? "Vendor approved — email sent!" : "Vendor rejected");
    } catch {
      toast.error("Failed to update vendor");
    } finally {
      setLoading(null);
    }
  };

  if (list.length === 0) {
    return (
      <div className="card p-10 text-center text-[#3D1A2E]/50 font-body">
        No vendors here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((vendor) => (
        <div
          key={vendor.id}
          className={`card p-5 ${vendor.status === "pending" ? "border-l-4 border-l-yellow-400" : ""}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-heading font-bold text-[#3D1A2E] text-lg leading-tight">{vendor.business_name}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  vendor.plan === "premium" ? "badge-premium" :
                  vendor.plan === "pro" ? "badge-pro" : "badge-free"
                }`}>
                  {vendor.plan}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  vendor.status === "approved" ? "bg-green-100 text-green-700" :
                  vendor.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {vendor.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> :
                   vendor.status === "pending" ? <Clock className="w-3 h-3" /> :
                   <XCircle className="w-3 h-3" />}
                  {vendor.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#3D1A2E]/60 font-body mb-2">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{vendor.category}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vendor.city}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{vendor.email}</span>
                <span>Joined {formatDate(vendor.created_at)}</span>
              </div>

              {vendor.description && (
                <p className="text-xs text-[#3D1A2E]/60 font-body line-clamp-2">{vendor.description}</p>
              )}
            </div>

            {vendor.status === "pending" && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => update(vendor.id, "approved")}
                  disabled={loading === vendor.id}
                  className="flex items-center gap-1.5 text-sm bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 font-body font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => update(vendor.id, "rejected")}
                  disabled={loading === vendor.id}
                  className="flex items-center gap-1.5 text-sm bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 font-body font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}

            {vendor.status === "approved" && (
              <button
                onClick={() => update(vendor.id, "rejected")}
                disabled={loading === vendor.id}
                className="text-xs text-red-600 hover:text-red-800 font-body transition-colors flex-shrink-0"
              >
                Suspend
              </button>
            )}

            {vendor.status === "rejected" && (
              <button
                onClick={() => update(vendor.id, "approved")}
                disabled={loading === vendor.id}
                className="text-xs text-green-600 hover:text-green-800 font-body transition-colors flex-shrink-0"
              >
                Re-approve
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
