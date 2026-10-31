"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PortalNav } from "@/components/navigation/portal-nav";
import {
  ArrowLeft,
  Receipt,
  Building,
  CheckCircle2,
  Calendar,
  Send,
  Sparkles,
} from "lucide-react";

export default function StaffNewQuotationPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [plan, setPlan] = useState("");
  const [productId, setProductId] = useState("");
  const [validDays, setValidDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<{
    customers: { id: string; name: string; companyName: string | null; email: string }[];
    plans: { id: string; name: string; subscriptionPrice: string; billingFrequency: string }[];
    products: { id: string; name: string; salesPrice: string }[];
  }>({ customers: [], plans: [], products: [] });

  useEffect(() => {
    void fetch("/api/staff/quotations/options", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error ?? "Unable to load quotation options");
        setOptions(payload.data);
        setCustomer(payload.data.customers[0]?.id ?? "");
        setPlan(payload.data.plans[0]?.id ?? "");
        setProductId(payload.data.products[0]?.id ?? "");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load quotation options"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const selectedPlan = options.plans.find((item) => item.id === plan);
      const response = await fetch("/api/staff/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer,
          planId: plan,
          expiryDate: new Date(Date.now() + validDays * 86400000).toISOString(),
          lines: [{ productId, quantity: 1, unitPrice: Number(selectedPlan?.subscriptionPrice ?? 0), taxRate: 0, discountAmount: 0 }],
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Unable to create quotation");
      setEmailSent(payload.data.emailSent);
      setSubmitted(true);
      setTimeout(() => router.push("/staff/dashboard"), 700);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 select-none">
      <PortalNav
        portalType="staff"
        portalTitle="Staff Operations Portal"
        userName="Danush Kalyan"
        userRole="Billing Operations Officer"
        companyName="Brightloop Enterprise Ops"
      />

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/dashboard"
            className="p-2 hover:bg-slate-200/60 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sales Proposal Engine
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Create Client Quotation
            </h1>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">New Quotation Proposal</h2>
              <p className="text-xs text-slate-500">
                Draft customer proposal with automated plan pricing and validity rules
              </p>
            </div>
          </div>

          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>}
          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-900 text-sm">Quotation Created</h3>
              <p className="text-xs text-emerald-700">
                Added to the Operations Queue. {emailSent ? "The customer email was sent." : "Email was not sent; configure Brevo to enable dispatch."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Account
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] outline-none font-semibold text-slate-800"
                  >
                    {options.customers.map((item) => <option key={item.id} value={item.id}>{item.companyName ?? item.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] outline-none font-semibold text-slate-800"
                  >
                    {options.plans.map((item) => <option key={item.id} value={item.id}>{item.name} (₹{Number(item.subscriptionPrice).toLocaleString("en-IN")} / {item.billingFrequency.toLowerCase()})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Tier Edition
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] outline-none font-semibold text-slate-800"
                  >
                    {options.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Proposal Validity (Days)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/staff/dashboard">
                  <Button variant="outline" size="sm" type="button" className="text-xs font-bold">
                    Cancel
                  </Button>
                </Link>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold gap-2 px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Generating..." : "Generate & Send Proposal"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
