"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import { Tag, Plus, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface DiscountItem {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minPurchase: number;
  maxUsage: number;
  usedCount: number;
  status: "ACTIVE" | "EXPIRED" | string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [formValue, setFormValue] = useState("10");
  const [formMinPurchase, setFormMinPurchase] = useState("0");
  const [formMaxUsage, setFormMaxUsage] = useState("100");

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/discounts");
      if (res.ok) {
        const data = await res.json();
        if (data.discounts && data.discounts.length > 0) {
          setDiscounts(data.discounts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch discounts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          type: formType,
          value: Number(formValue),
          minPurchase: Number(formMinPurchase) || 0,
          maxUsage: Number(formMaxUsage) || 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create discount coupon");
      }

      setNotification(`Discount coupon "${formCode.toUpperCase()}" created successfully!`);
      setTimeout(() => setNotification(null), 4000);
      setIsModalOpen(false);

      // Reset form fields
      setFormCode("");
      setFormName("");
      setFormType("PERCENTAGE");
      setFormValue("10");
      setFormMinPurchase("0");
      setFormMaxUsage("100");

      await fetchDiscounts();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create discount coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Tag className="w-4 h-4" />
            <span>Add Discount Coupon</span>
          </Button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

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
                          style={{
                            width: `${Math.min(100, (d.usedCount / (d.maxUsage || 1)) * 100)}%`,
                          }}
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

      {/* Add Discount Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#714B67]/10 flex items-center justify-center text-[#714B67]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Create Discount Coupon</h3>
                  <p className="text-xs text-slate-500">Configure promotional voucher or loyalty rebate rule</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateDiscount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code (Promo Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25, SPRINGBOOST"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign / Promotion Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Holiday Onboarding 25% Off"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED_AMOUNT">FIXED AMOUNT (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {formType === "PERCENTAGE" ? "Discount Rate (%) *" : "Deduction Amount (₹) *"}
                  </label>
                  <input
                    type="number"
                    step={formType === "PERCENTAGE" ? "0.1" : "1"}
                    min="0"
                    max={formType === "PERCENTAGE" ? "100" : undefined}
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Purchase Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formMinPurchase}
                    onChange={(e) => setFormMinPurchase(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Redemptions Cap</label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxUsage}
                    onChange={(e) => setFormMaxUsage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#714B67] shrink-0 mt-0.5" />
                <p>
                  Coupons are validated at subscription invoice generation. Customers entering{" "}
                  <span className="font-mono font-bold">{formCode || "CODE"}</span> receive{" "}
                  {formType === "PERCENTAGE" ? `${formValue || "0"}%` : `₹${formValue || "0"}`} discount
                  {Number(formMinPurchase) > 0 ? ` on orders above ₹${Number(formMinPurchase).toLocaleString("en-IN")}` : ""}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold"
                >
                  {isSubmitting ? "Saving..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
