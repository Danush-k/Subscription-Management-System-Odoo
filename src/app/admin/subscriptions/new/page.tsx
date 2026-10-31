"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Building,
  Layers,
  Percent,
  Tag,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState("CUST-2026-0001");
  const [plan, setPlan] = useState("PLAN-ENT-ANNUAL");
  const [variant, setVariant] = useState("SKU-ERP-ODOO");
  const [discountCode, setDiscountCode] = useState("BRIGHT20");
  const [discountApplied, setDiscountApplied] = useState(true);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [billingFrequency, setBillingFrequency] = useState("YEARLY");
  const [status, setStatus] = useState<"ACTIVE" | "CONFIRMED">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing calculations
  const basePrice = plan === "PLAN-ENT-ANNUAL" ? 120000 : 18500;
  const variantAddon = variant === "SKU-ERP-ODOO" ? 5000 : 0;
  const subtotalBeforeDiscount = basePrice + variantAddon;
  const discountAmount = discountApplied ? Math.round(subtotalBeforeDiscount * 0.2) : 0;
  const taxableSubtotal = subtotalBeforeDiscount - discountAmount;
  const taxRate = 0.18; // GST 18%
  const taxAmount = Math.round(taxableSubtotal * taxRate);
  const totalAmount = taxableSubtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/admin/subscriptions");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/subscriptions"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Create New Subscription Agreement
            </h1>
            <p className="text-sm text-slate-500">
              Configure customer contract, pricing variant, tax breakdown, and recurrence terms.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#714B67]" />
              Customer & Plan Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Customer Account
                </label>
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                >
                  <option value="CUST-2026-0001">SSN Technology Labs (CUST-2026-0001)</option>
                  <option value="CUST-2026-0002">Kalyan Retailers LLP (CUST-2026-0002)</option>
                  <option value="CUST-2026-0003">AeroDynamics Corp (CUST-2026-0003)</option>
                  <option value="CUST-2026-0004">Zenith Financials (CUST-2026-0004)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Subscription Plan
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                >
                  <option value="PLAN-ENT-ANNUAL">Enterprise Cloud Suite (Annual - ₹1,20,000/yr)</option>
                  <option value="PLAN-ODOO-MONTH">Odoo Business Suite (Monthly - ₹18,500/mo)</option>
                  <option value="PLAN-GROWTH-MONTH">Growth Monthly Tier (Monthly - ₹8,400/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Product Variant & Edition
                </label>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                >
                  <option value="SKU-ERP-ODOO">Odoo Enterprise Edition (+₹5,000)</option>
                  <option value="SKU-ERP-STD">Standard Cloud Tier (+₹0)</option>
                  <option value="SKU-ERP-SAP">SAP Migration Edition (+₹12,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Billing Frequency
                </label>
                <select
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                >
                  <option value="YEARLY">Yearly Recurrence</option>
                  <option value="MONTHLY">Monthly Recurrence</option>
                  <option value="QUARTERLY">Quarterly Recurrence</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing, Tax & Discount Calculator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#714B67]" />
              Discounts & Tax Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Promotional Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="e.g. BRIGHT20"
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDiscountApplied(!discountApplied)}
                    className="text-xs font-bold"
                  >
                    {discountApplied ? "Remove" : "Apply"}
                  </Button>
                </div>
                {discountApplied && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    20% Brightloop Launch Discount applied!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Tax Calculation Rule
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={!taxInclusive}
                      onChange={() => setTaxInclusive(false)}
                      className="text-[#714B67] focus:ring-[#714B67]"
                    />
                    GST 18% Exclusive (Standard)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      checked={taxInclusive}
                      onChange={() => setTaxInclusive(true)}
                      className="text-[#714B67] focus:ring-[#714B67]"
                    />
                    GST 18% Inclusive
                  </label>
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Base Plan Price:</span>
                <span className="font-mono">₹{basePrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Variant Add-on:</span>
                <span className="font-mono">+₹{variantAddon.toLocaleString("en-IN")}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount (20%):</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono">₹{taxableSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%):</span>
                <span className="font-mono">+₹{taxAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-base">
                <span>Total Recurring Billing Amount:</span>
                <span className="text-[#714B67] font-mono">
                  ₹{totalAmount.toLocaleString("en-IN")} / {billingFrequency.toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/subscriptions">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold"
            >
              {isSubmitting ? "Creating Agreement..." : "Confirm & Activate Subscription"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
