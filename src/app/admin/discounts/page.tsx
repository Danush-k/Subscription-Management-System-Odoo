"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import { Tag, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface DiscountItem {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minPurchase: number;
  maxUsage: number;
  usedCount: number;
  status: "ACTIVE" | "EXPIRED";
}

const INITIAL_DISCOUNTS: DiscountItem[] = [
  {
    id: "d-1",
    code: "BRIGHT20",
    name: "Brightloop Launch Promo",
    type: "PERCENTAGE",
    value: 20,
    minPurchase: 10000,
    maxUsage: 100,
    usedCount: 38,
    status: "ACTIVE",
  },
  {
    id: "d-2",
    code: "ENTERPRISE5000",
    name: "Enterprise Annual Voucher",
    type: "FIXED_AMOUNT",
    value: 5000,
    minPurchase: 50000,
    maxUsage: 50,
    usedCount: 22,
    status: "ACTIVE",
  },
  {
    id: "d-3",
    code: "STARTUP10",
    name: "Startup Boost Tier",
    type: "PERCENTAGE",
    value: 10,
    minPurchase: 5000,
    maxUsage: 200,
    usedCount: 142,
    status: "ACTIVE",
  },
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>(INITIAL_DISCOUNTS);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrightLoopModuleIcon appId="discounts" className="w-12 h-12" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Discount Coupons &amp; Promotion Rules
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Percentage and fixed discounts, redemption caps, and minimum purchase thresholds.
                </p>
              </div>
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
                {discounts.map((d) => (
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
                          style={{ width: `${(d.usedCount / d.maxUsage) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="active">{d.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
