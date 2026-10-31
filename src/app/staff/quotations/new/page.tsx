"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Receipt,
  Building,
  CheckCircle2,
  Calendar,
  Send,
} from "lucide-react";

export default function StaffNewQuotationPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState("SSN Technology Labs");
  const [plan, setPlan] = useState("Enterprise Cloud Suite");
  const [variant, setVariant] = useState("Odoo Enterprise Edition");
  const [validDays, setValidDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        router.push("/staff/dashboard");
      }, 700);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/dashboard"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Staff Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-sm">New Quotation Proposal</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-10 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Draft Client Quotation Proposal
              </h1>
              <p className="text-xs text-slate-500">
                Generate an official subscription quotation and email proposal to the client.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-900 text-sm">Quotation Dispatched!</h3>
              <p className="text-xs text-emerald-700">Returning to staff dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Client / Customer Account
                </label>
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="SSN Technology Labs">SSN Technology Labs (CUST-2026-0001)</option>
                  <option value="Kalyan Retailers LLP">Kalyan Retailers LLP (CUST-2026-0002)</option>
                  <option value="AeroDynamics Corp">AeroDynamics Corp (CUST-2026-0003)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Subscription Plan
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Enterprise Cloud Suite">Enterprise Cloud Suite (Annual - ₹1,20,000)</option>
                  <option value="Odoo Business Suite">Odoo Business Suite (Monthly - ₹18,500)</option>
                  <option value="Growth Monthly Tier">Growth Monthly Tier (Monthly - ₹8,400)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Variant Edition
                </label>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Odoo Enterprise Edition">Odoo Enterprise Edition (+₹5,000)</option>
                  <option value="Standard Cloud Tier">Standard Cloud Tier (+₹0)</option>
                  <option value="SAP Migration Edition">SAP Migration Edition (+₹12,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Proposal Validity (Days)
                </label>
                <input
                  type="number"
                  value={validDays}
                  onChange={(e) => setValidDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/staff/dashboard">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Dispatching..." : "Send Proposal"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
