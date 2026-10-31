"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface DiscountItem {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minPurchase: number;
  maxUsage: number;
  usedCount: number;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch("/api/admin/discounts", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data.discounts || []);
      }
    } catch (err) {
      console.error("Failed to fetch discounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Tag className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Discount Coupons &amp; Promotion Rules
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Percentage and fixed discounts, redemption caps, and minimum purchase thresholds from PostgreSQL.
            </p>
          </div>
        </div>

        {/* Discounts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Discount Code</th>
                  <th className="py-3.5 px-6">Campaign Name</th>
                  <th className="py-3.5 px-6">Deduction Value</th>
                  <th className="py-3.5 px-6">Min Purchase</th>
                  <th className="py-3.5 px-6">Redemptions</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#714B67]" />
                      <p className="mt-2 text-xs">Loading promotional rules from database...</p>
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No discount rules found in database.
                    </td>
                  </tr>
                ) : (
                  discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#714B67] text-sm">
                        {d.code}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{d.name}</td>
                      <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                        {d.type === "PERCENTAGE"
                          ? `${d.value}% Off`
                          : `₹${d.value.toLocaleString("en-IN")} Off`}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600 text-xs">
                        ₹{d.minPurchase.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-xs font-semibold text-slate-800">
                          {d.usedCount} / {d.maxUsage} used
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-[#714B67] h-full rounded-full"
                            style={{ width: `${Math.min(100, (d.usedCount / d.maxUsage) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={d.status === "ACTIVE" ? "success" : "outline"}>
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
