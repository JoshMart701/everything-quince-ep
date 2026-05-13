"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
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
  average_rating: number;
  review_count: number;
}

export default function AdminVendorTable({ vendors }: { vendors: Vendor[] }) {
  const [vendorList, setVendorList] = useState(vendors);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const filtered = filter === "all" ? vendorList : vendorList.filter((v) => v.status === filter);

  const updateVendorStatus = async (id: string, status: "approved" | "rejected") => {
    setIsLoading(id);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setVendorList((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));
      toast.success(`Vendor ${status === "approved" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Failed to update vendor status");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 px-6 py-3 border-b border-[#f3ddb9] bg-[#FDF7F0]">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-medium capitalize transition-all ${
              filter === f ? "bg-[#C4547A] text-white" : "text-[#3D1A2E]/60 hover:text-[#C4547A]"
            }`}
          >
            {f} ({f === "all" ? vendorList.length : vendorList.filter((v) => v.status === f).length})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f3ddb9] bg-[#FDF7F0]">
              <th className="text-left px-6 py-3 font-body font-semibold text-[#3D1A2E]/70">Business</th>
              <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Category</th>
              <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Plan</th>
              <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Status</th>
              <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Joined</th>
              <th className="text-left px-4 py-3 font-body font-semibold text-[#3D1A2E]/70">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3ddb9]">
            {filtered.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-[#FDF7F0] transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-body font-medium text-[#3D1A2E]">{vendor.business_name}</p>
                    <p className="text-xs text-[#3D1A2E]/50">{vendor.email}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs bg-[#FDF7F0] border border-[#f3ddb9] text-[#3D1A2E]/70 px-2 py-1 rounded-full capitalize">
                    {vendor.category}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    vendor.plan === "premium" ? "badge-premium" :
                    vendor.plan === "pro" ? "badge-pro" : "badge-free"
                  }`}>
                    {vendor.plan}
                  </span>
                </td>
                <td className="px-4 py-4">
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
                </td>
                <td className="px-4 py-4 text-xs text-[#3D1A2E]/60 font-body">
                  {formatDate(vendor.created_at)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {vendor.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateVendorStatus(vendor.id, "approved")}
                          disabled={isLoading === vendor.id}
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateVendorStatus(vendor.id, "rejected")}
                          disabled={isLoading === vendor.id}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}
                    {vendor.status === "approved" && (
                      <button
                        onClick={() => updateVendorStatus(vendor.id, "rejected")}
                        disabled={isLoading === vendor.id}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                    {vendor.status === "rejected" && (
                      <button
                        onClick={() => updateVendorStatus(vendor.id, "approved")}
                        disabled={isLoading === vendor.id}
                        className="text-xs text-green-600 hover:text-green-800 transition-colors"
                      >
                        Re-approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-[#3D1A2E]/50 font-body">
            No vendors with status &quot;{filter}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
