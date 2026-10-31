"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

interface CustomerOption {
  id: string;
  customerNumber: string;
  name: string;
  companyName: string;
}

interface PlanOption {
  id: string;
  planCode: string;
  name: string;
  frequency: string;
  price: number;
}

interface ProductVariantOption {
  id: string;
  name: string;
  sku: string;
  addonPrice: number;
}

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [variants, setVariants] = useState<ProductVariantOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState("");
  const [plan, setPlan] = useState("");
  const [variant, setVariant] = useState("");
  const [discountCode, setDiscountCode] = useState("BRIGHT20");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [billingFrequency, setBillingFrequency] = useState("MONTHLY");
  const [status, setStatus] = useState<"ACTIVE" | "CONFIRMED">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormData() {
      try {
        const [cRes, pRes, prodRes] = await Promise.all([
          fetch("/api/admin/customers"),
          fetch("/api/admin/plans"),
          fetch("/api/admin/products"),
        ]);

        if (cRes.ok && pRes.ok && prodRes.ok) {
          const cData = await cRes.json();
          const pData = await pRes.json();
          const prodData = await prodRes.json();

          const custList = cData.customers || [];
          const planList = pData.plans || [];
          const allVariants: ProductVariantOption[] = [];

          (prodData.products || []).forEach((prod: any) => {
            (prod.variants || []).forEach((v: any) => {
              allVariants.push({
                id: v.id,
                name: `${prod.name} - ${v.name}`,
                sku: v.sku,
                addonPrice: v.addonPrice,
              });
            });
          });

          setCustomers(custList);
          setPlans(planList);
          setVariants(allVariants);

          if (custList.length > 0) setCustomer(custList[0].id);
          if (planList.length > 0) {
            setPlan(planList[0].id);
            setBillingFrequency(planList[0].frequency || "MONTHLY");
          }
          if (allVariants.length > 0) setVariant(allVariants[0].id);
        }
      } catch (err) {
        console.error("Failed to load options", err);
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, []);

  const selectedPlanObj = plans.find((p) => p.id === plan);
  const selectedVariantObj = variants.find((v) => v.id === variant);

  // Pricing calculations
  const basePrice = selectedPlanObj ? Number(selectedPlanObj.price) : 0;
  const variantAddon = selectedVariantObj ? Number(selectedVariantObj.addonPrice) : 0;
  const subtotalBeforeDiscount = basePrice + variantAddon;
  const discountAmount = discountApplied ? Math.round(subtotalBeforeDiscount * 0.2) : 0;
  const taxableSubtotal = subtotalBeforeDiscount - discountAmount;
  const taxRate = 0.18; // GST 18%
  const taxAmount = Math.round(taxableSubtotal * taxRate);
  const totalAmount = taxableSubtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer,
          planId: plan,
          variantId: variant || null,
          billingFrequency,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/subscriptions");
      } else {
        setErrorMessage(data.error || "Failed to create subscription agreement.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
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
              Configure customer contract, pricing variant, tax breakdown, and recurrence terms in PostgreSQL.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#714B67]" />
            <p className="mt-3 text-sm">Loading options from database...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#714B67]" />
                Customer &amp; Plan Details
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
                    required
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName || c.name} ({c.customerNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Subscription Plan
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => {
                      setPlan(e.target.value);
                      const selected = plans.find((p) => p.id === e.target.value);
                      if (selected) setBillingFrequency(selected.frequency);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                    required
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.frequency} - ₹{p.price.toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Product Variant &amp; Edition
                  </label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                  >
                    <option value="">No Variant Add-on</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.addonPrice > 0 ? `+₹${v.addonPrice.toLocaleString("en-IN")}` : "Included"})
                      </option>
                    ))}
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
                    <option value="WEEKLY">Weekly Recurrence</option>
                    <option value="DAILY">Daily Recurrence</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing, Tax & Discount Calculator */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#714B67]" />
                Discounts &amp; Tax Configuration
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
                  <span className="font-mono">₹{basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Variant Add-on:</span>
                  <span className="font-mono">+₹{variantAddon.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount (20%):</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono">₹{taxableSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (18%):</span>
                  <span className="font-mono">+₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-base">
                  <span>Total Recurring Billing Amount:</span>
                  <span className="text-[#714B67] font-mono">
                    ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / {billingFrequency.toLowerCase()}
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
        )}
      </main>
    </div>
  );
}
