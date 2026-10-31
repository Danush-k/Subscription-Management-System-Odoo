"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OdooAppGrid } from "@/components/dashboard/odoo-app-grid";
import {
  RotateCcw,
  FileText,
  CreditCard,
  Percent,
  Layers,
  BarChart3,
  Users,
  ShieldCheck,
  Package,
  Receipt,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  const [metrics, setMetrics] = useState({
    totalCustomers: 24,
    totalProducts: 12,
    totalPlans: 6,
    totalSubscriptions: 38,
    activeSubscriptions: 29,
    pausedSubscriptions: 4,
    closedSubscriptions: 5,
    totalInvoices: 86,
    totalPayments: 79,
    revenueCollected: 1485600.0,
    outstandingAmount: 182400.0,
    overdueInvoices: 3,
    overdueAmount: 54000.0,
    mrr: 248000.0,
  });

  const recentSubscriptions = [
    {
      id: "SUB-2026-0042",
      customer: "SSN Technology Labs",
      plan: "Enterprise Cloud Suite",
      variant: "Odoo Enterprise Edition",
      amount: "₹1,20,000.00",
      cadence: "Annual",
      nextBilling: "15 Jan 2027",
      status: "ACTIVE" as const,
    },
    {
      id: "SUB-2026-0041",
      customer: "Kalyan Retailers LLP",
      plan: "Odoo Business Suite",
      variant: "Standard Cloud Tier",
      amount: "₹18,500.00",
      cadence: "Monthly",
      nextBilling: "01 Nov 2026",
      status: "ACTIVE" as const,
    },
    {
      id: "SUB-2026-0040",
      customer: "AeroDynamics Corp",
      plan: "Growth Monthly Tier",
      variant: "SAP Migration Edition",
      amount: "₹8,400.00",
      cadence: "Monthly",
      nextBilling: "10 Nov 2026",
      status: "PAUSED" as const,
    },
    {
      id: "SUB-2026-0039",
      customer: "Zenith Financials Ltd.",
      plan: "Standard Core License",
      variant: "Standard Cloud Tier",
      amount: "₹24,000.00",
      cadence: "Monthly",
      nextBilling: "—",
      status: "CLOSED" as const,
    },
  ];

  const recentInvoices = [
    {
      id: "INV-2026-0086",
      customer: "SSN Technology Labs Pvt. Ltd.",
      date: "31 Oct 2026",
      dueDate: "15 Nov 2026",
      amount: "₹1,20,000.00",
      paid: "₹1,20,000.00",
      status: "PAID" as const,
    },
    {
      id: "INV-2026-0085",
      customer: "Kalyan Retailers LLP",
      date: "30 Oct 2026",
      dueDate: "14 Nov 2026",
      amount: "₹18,500.00",
      paid: "₹0.00",
      status: "CONFIRMED" as const,
    },
    {
      id: "INV-2026-0084",
      customer: "Apex Logistics & Supply",
      date: "15 Oct 2026",
      dueDate: "25 Oct 2026",
      amount: "₹35,500.00",
      paid: "₹0.00",
      status: "OVERDUE" as const,
    },
    {
      id: "INV-2026-0083",
      customer: "Digital Dynamics Corp",
      date: "28 Oct 2026",
      dueDate: "12 Nov 2026",
      amount: "₹14,200.00",
      paid: "₹14,200.00",
      status: "PAID" as const,
    },
  ];

  const triggerBillingEngine = () => {
    setBillingRunning(true);
    setBillingResult(null);

    setTimeout(() => {
      setBillingRunning(false);
      setBillingResult(
        "Automated recurring billing run complete: 3 subscriptions renewed, 3 invoices posted with zero duplicates."
      );
      setMetrics((prev) => ({
        ...prev,
        totalInvoices: prev.totalInvoices + 3,
        outstandingAmount: prev.outstandingAmount + 42000,
      }));
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      {/* Unified Enterprise Navigation */}
      <AdminNav />

      {/* Page Title & Operational Action Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="dashboard-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#714B67] bg-[#714B67]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Admin Console
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Executive Workspace &amp; Overview
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time subscription lifecycles, recurring revenue cadence, and financial operations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={triggerBillingEngine}
              disabled={billingRunning}
              variant="secondary"
              size="sm"
              className="gap-2 font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 text-[#714B67] fill-[#714B67]" />
              {billingRunning ? "Processing Recurrence..." : "Run Recurring Billing"}
            </Button>

            <Link href="/admin/subscriptions/new">
              <Button
                size="sm"
                className="gap-2 font-bold text-xs bg-[#714B67] hover:bg-[#5C3C54] text-white rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                New Subscription
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="dashboard-container pt-8 space-y-8 animate-fadeIn">
        {/* Billing Success Notification */}
        {billingResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-slideDown">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{billingResult}</span>
            </div>
            <button
              onClick={() => setBillingResult(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 rounded hover:bg-emerald-100/60"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Overdue Warning Alert */}
        {metrics.overdueInvoices > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-amber-950">
                  {metrics.overdueInvoices} Invoices Require Payment Reconciliation
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Total outstanding overdue balance:{" "}
                  <span className="font-mono font-bold">
                    ₹{metrics.overdueAmount.toLocaleString("en-IN")}.00
                  </span>
                </p>
              </div>
            </div>
            <Link href="/admin/invoices">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100/80 text-xs font-bold rounded-xl whitespace-nowrap shadow-2xs"
              >
                View Overdue Invoices &rarr;
              </Button>
            </Link>
          </div>
        )}

        {/* 12 Key Operational & Financial Metrics Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#714B67]" />
              Financial &amp; Operational Cadence
            </h2>
            <span className="text-xs text-slate-400 font-medium">Auto-updated live</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Collected
                </p>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-700 font-mono mt-2">
                ₹{metrics.revenueCollected.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {metrics.totalPayments} reconciled payments
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Outstanding Receivables
                </p>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 font-mono mt-2">
                ₹{metrics.outstandingAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Across {metrics.totalInvoices} generated invoices
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-[#714B67] uppercase tracking-wider">
                  Monthly RR (MRR)
                </p>
                <span className="w-2 h-2 rounded-full bg-[#714B67]" />
              </div>
              <p className="text-2xl font-black text-[#714B67] font-mono mt-2">
                ₹{metrics.mrr.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.2% MoM growth
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Subscriptions
                </p>
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono mt-2">
                {metrics.totalSubscriptions}
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-semibold">
                <span className="text-emerald-700">{metrics.activeSubscriptions} Active</span>
                <span>•</span>
                <span className="text-amber-700">{metrics.pausedSubscriptions} Paused</span>
                <span>•</span>
                <span className="text-slate-400">{metrics.closedSubscriptions} Closed</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active B2B Clients
              </p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-2">
                {metrics.totalCustomers}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Verified GSTIN profiles</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Products &amp; Tiers
              </p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-2">
                {metrics.totalProducts}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">With multi-variant pricing</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Subscription Plans
              </p>
              <p className="text-2xl font-black text-slate-900 font-mono mt-2">
                {metrics.totalPlans}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Monthly &amp; Yearly intervals</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                Overdue Invoices
              </p>
              <p className="text-2xl font-black text-rose-600 font-mono mt-2">
                {metrics.overdueInvoices}
              </p>
              <p className="text-[11px] text-rose-600 font-medium mt-1">Requires reconciliation</p>
            </div>
          </div>
        </div>

        {/* Embedded Modular Odoo-style App Grid Launcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Enterprise Module Launcher
              </h2>
              <p className="text-xs text-slate-500">
                Odoo-inspired integrated subscription and accounting applications
              </p>
            </div>
          </div>
          <OdooAppGrid />
        </div>

        {/* Data Tables: Active Subscriptions & Invoices in Zoho Books Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Subscriptions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Subscription Agreements</h3>
                  <p className="text-xs text-slate-500">Real-time state transitions and next renewal</p>
                </div>
                <Link
                  href="/admin/subscriptions"
                  className="text-xs font-bold text-[#714B67] hover:text-[#5C3C54] flex items-center gap-1 group"
                >
                  <span>Manage All</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {recentSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{sub.id}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : sub.status === "PAUSED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sub.status === "ACTIVE"
                                ? "bg-emerald-500 animate-pulse"
                                : sub.status === "PAUSED"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        {sub.customer} &bull; <span className="text-slate-400">{sub.plan}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono text-slate-900 text-sm">{sub.amount}</p>
                      <p className="text-[10px] text-slate-400">Next: {sub.nextBilling}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link
                href="/admin/subscriptions"
                className="text-xs font-bold text-[#714B67] hover:underline"
              >
                View all 38 active contracts &rarr;
              </Link>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Recent Billing Invoices</h3>
                  <p className="text-xs text-slate-500">Automated recurring invoice snapshots</p>
                </div>
                <Link
                  href="/admin/invoices"
                  className="text-xs font-bold text-[#714B67] hover:text-[#5C3C54] flex items-center gap-1 group"
                >
                  <span>View All Invoices</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inv.status === "CONFIRMED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.status === "PAID"
                                ? "bg-emerald-500 animate-pulse"
                                : inv.status === "CONFIRMED"
                                ? "bg-amber-500"
                                : "bg-rose-500 animate-ping"
                            }`}
                          />
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        {inv.customer} &bull; <span className="text-slate-400">{inv.date}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono text-slate-900 text-sm">{inv.amount}</p>
                      <p className="text-[10px] text-slate-400">Paid: {inv.paid}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link
                href="/admin/invoices"
                className="text-xs font-bold text-[#714B67] hover:underline"
              >
                Reconcile all 86 invoices &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

