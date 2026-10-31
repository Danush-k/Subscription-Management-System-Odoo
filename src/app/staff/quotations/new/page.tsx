"use client";

import React, { useState } from "react";
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

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-900 text-sm">Quotation Dispatched</h3>
              <p className="text-xs text-emerald-700">
                Quotation dispatched to {customer} and added to the Operations Queue.
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
                    <option value="SSN Technology Labs">SSN Technology Labs Pvt Ltd (GST: 33AABCS1429B1Z2)</option>
                    <option value="Kalyan Retailers LLP">Kalyan Retailers LLP (GST: 29AABCK9901M1Z1)</option>
                    <option value="CyberSol Software Systems">CyberSol Software Systems</option>
                    <option value="Apex Logistics India">Apex Logistics India</option>
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
                    <option value="Enterprise Cloud Suite">Enterprise Cloud Suite (₹1,20,000 / yr)</option>
                    <option value="Odoo Business Suite">Odoo Business Suite (₹18,500 / mo)</option>
                    <option value="Growth Monthly Tier">Growth Monthly Tier (₹8,400 / mo)</option>
                    <option value="Starter Cloud Tier">Starter Cloud Tier (₹2,500 / mo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Tier Edition
                  </label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] outline-none font-semibold text-slate-800"
                  >
                    <option value="Odoo Enterprise Edition">Odoo Enterprise Edition</option>
                    <option value="SAP Migration Edition">SAP Migration Edition</option>
                    <option value="Standard Cloud Tier">Standard Cloud Tier</option>
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
