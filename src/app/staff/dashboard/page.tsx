"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  FileText,
  CreditCard,
  Percent,
  Receipt,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  UserCheck,
  Search,
  DollarSign,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PortalNav } from "@/components/navigation/portal-nav";

export default function StaffDashboardPage() {
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [paymentModalInv, setPaymentModalInv] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI / Instant Transfer");

  const staffMetrics = [
    { title: "Customers", value: "24", sub: "Active B2B Accounts", color: "text-slate-900", icon: Users },
    { title: "Active Subscriptions", value: "29", sub: "Currently In Service", color: "text-emerald-700", icon: RotateCcw },
    { title: "Pending Quotations", value: "7", sub: "Awaiting Client Acceptance", color: "text-blue-700", icon: Receipt },
    { title: "Pending Invoices", value: "14", sub: "Unpaid Billing Cycles", color: "text-amber-600", icon: FileText },
    { title: "Recent Payments", value: "18", sub: "Auto & Manual Reconciled", color: "text-purple-700", icon: CreditCard },
    { title: "Overdue Invoices", value: "3", sub: "Requires Immediate Follow-up", color: "text-rose-600", icon: AlertTriangle },
  ];

  const [pendingQuotations, setPendingQuotations] = useState([
    {
      id: "QUO-2026-0012",
      customer: "CyberSol Software Systems",
      plan: "Growth Monthly Tier",
      amount: "₹8,400.00",
      status: "QUOTATION" as const,
      validUntil: "15 Nov 2026",
    },
    {
      id: "QUO-2026-0011",
      customer: "Kalyan Retailers LLP",
      plan: "Odoo Business Suite",
      amount: "₹18,500.00",
      status: "DRAFT" as const,
      validUntil: "10 Nov 2026",
    },
  ]);

  const [pendingInvoices, setPendingInvoices] = useState([
    {
      id: "INV-2026-0085",
      customer: "Kalyan Retailers LLP",
      amount: "₹18,500.00",
      dueDate: "10 Nov 2026",
      status: "CONFIRMED" as const,
    },
    {
      id: "INV-2026-0084",
      customer: "Apex Logistics India",
      amount: "₹35,500.00",
      dueDate: "25 Oct 2026",
      status: "OVERDUE" as const,
    },
  ]);

  const handleConvertQuotation = (id: string, customer: string) => {
    setPendingQuotations((prev) => prev.filter((q) => q.id !== id));
    setSuccessNotice(`Quotation ${id} confirmed and converted to recurring Subscription agreement for ${customer}!`);
  };

  const handleRecordPayment = () => {
    if (!paymentModalInv) return;
    setPendingInvoices((prev) => prev.filter((inv) => inv.id !== paymentModalInv.id));
    setSuccessNotice(`Payment of ${paymentModalInv.amount} successfully recorded against ${paymentModalInv.id} via ${paymentMethod}!`);
    setPaymentModalInv(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 select-none">
      {/* Top Portal Header */}
      <PortalNav
        portalType="staff"
        portalTitle="Staff Operations Portal"
        userName="Danush Kalyan"
        userRole="Billing Operations Officer"
        companyName="Brightloop Enterprise Ops"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
                Sales &amp; Billing Desk
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">Shift: APAC Morning</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Operations Control Queue
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/staff/quotations/new">
              <Button
                size="sm"
                className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold gap-2 px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quotation</span>
              </Button>
            </Link>

            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-bold border-slate-300 text-slate-700 hover:text-[#714B67]"
              >
                Admin Suite
              </Button>
            </Link>
          </div>
        </div>

        {/* Success Notice Banner */}
        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 6 Required Staff Operational Metrics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Live Operational Throughput
            </h2>
            <span className="text-xs text-slate-400 font-mono">Updated just now</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {staffMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.title}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 truncate">
                      {metric.title}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                  <div className={`text-2xl font-black ${metric.color} tracking-tight font-mono`}>
                    {metric.value}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {metric.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Queue 1: Quotations Awaiting Confirmation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Quotations Awaiting Confirmation
                </h3>
                <p className="text-xs text-slate-500">
                  Convert proposals directly into active recurring subscription agreements
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {pendingQuotations.length} Pending
              </span>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {pendingQuotations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  All pending quotations have been converted!
                </div>
              ) : (
                pendingQuotations.map((quo) => (
                  <div
                    key={quo.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-mono">
                          {quo.id}
                        </span>
                        <Badge variant={quo.status === "QUOTATION" ? "quotation" : "draft"}>
                          {quo.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-700">{quo.customer}</p>
                      <p className="text-[11px] text-slate-500">Plan: {quo.plan} &bull; Valid: {quo.validUntil}</p>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {quo.amount}
                      </span>
                      <Button
                        size="sm"
                        className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs active:scale-95"
                        onClick={() => handleConvertQuotation(quo.id, quo.customer)}
                      >
                        Confirm &amp; Convert
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Queue 2: Invoices Requiring Manual Payment */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Invoices Requiring Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Record manual cash, UPI, cheque or RTGS settlements
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {pendingInvoices.length} Due
              </span>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {pendingInvoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  All invoices in this queue have been paid and settled!
                </div>
              ) : (
                pendingInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-mono">
                          {inv.id}
                        </span>
                        <Badge variant={inv.status === "OVERDUE" ? "overdue" : "confirmed"}>
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-700">{inv.customer}</p>
                      <p className="text-[11px] text-slate-500">Payment Due: {inv.dueDate}</p>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-base font-black text-rose-600 font-mono">
                        {inv.amount}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 active:scale-95"
                        onClick={() => setPaymentModalInv(inv)}
                      >
                        Record Payment
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Record Payment Settlement Modal */}
      {paymentModalInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Payment Entry
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Record Settlement for {paymentModalInv.id}
                </h3>
              </div>
              <span className="text-base font-black text-emerald-700 font-mono">
                {paymentModalInv.amount}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Customer
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800">
                  {paymentModalInv.customer}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Settlement Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#714B67] outline-none"
                >
                  <option value="UPI / Instant Transfer">UPI / Instant Transfer (GPay / PhonePe)</option>
                  <option value="Bank Transfer (NEFT / RTGS)">Bank Transfer (NEFT / RTGS)</option>
                  <option value="Cheque Deposit">Cheque Deposit</option>
                  <option value="Cash at Counter">Cash Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  Transaction Reference / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR247003099881"
                  defaultValue="UTR247003099881"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-[#714B67] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentModalInv(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                onClick={handleRecordPayment}
              >
                Confirm Settlement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
