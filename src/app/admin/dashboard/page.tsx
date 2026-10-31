"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRIGHTLOOP_APPS } from "@/components/home/odoo-app-icons";
import {
  RotateCcw,
  FileText,
  CreditCard,
  Percent,
  Layers,
  BarChart3,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Play,
  Plus,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Building,
  Download,
  PauseCircle,
  PlayCircle,
  ChevronRight,
  ShieldAlert,
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

  const [subscriptionsList, setSubscriptionsList] = useState([
    {
      id: "SUB-2026-0042",
      customer: "SSN Technology Labs",
      plan: "Enterprise Cloud Suite",
      variant: "Odoo Enterprise Edition",
      amount: "₹1,20,000.00",
      cadence: "Annual",
      nextBilling: "15 Jan 2027",
      status: "ACTIVE" as "ACTIVE" | "PAUSED" | "CLOSED",
    },
    {
      id: "SUB-2026-0041",
      customer: "Kalyan Retailers LLP",
      plan: "Odoo Business Suite",
      variant: "Standard Cloud Tier",
      amount: "₹18,500.00",
      cadence: "Monthly",
      nextBilling: "01 Nov 2026",
      status: "ACTIVE" as "ACTIVE" | "PAUSED" | "CLOSED",
    },
    {
      id: "SUB-2026-0040",
      customer: "AeroDynamics Corp",
      plan: "Growth Monthly Tier",
      variant: "SAP Migration Edition",
      amount: "₹8,400.00",
      cadence: "Monthly",
      nextBilling: "10 Nov 2026",
      status: "PAUSED" as "ACTIVE" | "PAUSED" | "CLOSED",
    },
    {
      id: "SUB-2026-0039",
      customer: "Zenith Financials Ltd",
      plan: "Standard Core License",
      variant: "Standard Cloud Tier",
      amount: "₹24,000.00",
      cadence: "Monthly",
      nextBilling: "15 Nov 2026",
      status: "ACTIVE" as "ACTIVE" | "PAUSED" | "CLOSED",
    },
  ]);

  const [invoicesList, setInvoicesList] = useState([
    {
      id: "INV-2026-0086",
      customer: "SSN Technology Labs Pvt Ltd",
      date: "31 Oct 2026",
      dueDate: "15 Nov 2026",
      amount: "₹1,20,000.00",
      status: "PAID" as const,
    },
    {
      id: "INV-2026-0085",
      customer: "Kalyan Retailers LLP",
      date: "30 Oct 2026",
      dueDate: "14 Nov 2026",
      amount: "₹18,500.00",
      status: "CONFIRMED" as const,
    },
    {
      id: "INV-2026-0084",
      customer: "Apex Logistics & Supply",
      date: "15 Oct 2026",
      dueDate: "25 Oct 2026",
      amount: "₹35,500.00",
      status: "OVERDUE" as const,
    },
    {
      id: "INV-2026-0083",
      customer: "Digital Dynamics Corp",
      date: "28 Oct 2026",
      dueDate: "12 Nov 2026",
      amount: "₹14,200.00",
      status: "PAID" as const,
    },
  ]);

  const handleToggleSubStatus = (subId: string) => {
    setSubscriptionsList((prev) =>
      prev.map((sub) => {
        if (sub.id === subId) {
          const next = sub.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
          setBillingResult(`Subscription ${subId} state toggled to ${next}!`);
          return { ...sub, status: next };
        }
        return sub;
      })
    );
  };

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
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 pb-20 font-sans select-none">
      {/* Unified Enterprise Navigation */}
      <AdminNav />

      {/* Clean, Minimalist Executive Workspace Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                Executive Workspace
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                Financial Operations &amp; Subscription Cadence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Executive Overview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={triggerBillingEngine}
              disabled={billingRunning}
              variant="outline"
              size="sm"
              className="gap-2 font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border-slate-300 rounded-xl transition-all active:scale-95 shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 text-[#714B67] fill-[#714B67]" />
              <span>{billingRunning ? "Processing..." : "Run Recurring Billing"}</span>
            </Button>

            <Link href="/admin/subscriptions/new">
              <Button
                size="sm"
                className="gap-2 font-bold text-xs bg-[#714B67] hover:bg-[#5C3C54] text-white rounded-xl shadow-xs transition-all active:scale-95 px-4"
              >
                <Plus className="w-4 h-4" />
                <span>New Subscription</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-fadeIn">
        {/* Billing Success Notification */}
        {billingResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-slideDown">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{billingResult}</span>
            </div>
            <button
              onClick={() => setBillingResult(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Minimalist Attention Banner for Overdue Accounts */}
        {metrics.overdueInvoices > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-amber-950">
                  {metrics.overdueInvoices} Invoices Require Payment Reconciliation
                </p>
                <p className="text-[11px] text-amber-800">
                  Total outstanding overdue:{" "}
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
                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100/80 text-xs font-bold rounded-xl shadow-2xs"
              >
                Reconcile Overdue &rarr;
              </Button>
            </Link>
          </div>
        )}

        {/* 4 High-Impact Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: MRR */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Monthly Recurring (MRR)
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-[#714B67] font-mono tracking-tight">
              ₹{metrics.mrr.toLocaleString("en-IN")}.00
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+14.2% MoM growth rate</span>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#714B67]" />
          </div>

          {/* Card 2: Revenue Collected */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Net Collections
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-700 font-mono tracking-tight">
              ₹{metrics.revenueCollected.toLocaleString("en-IN")}
            </div>
            <div className="mt-2 text-xs text-slate-500 font-semibold">
              {metrics.totalPayments} settled transactions
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          </div>

          {/* Card 3: Outstanding Receivables */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Outstanding Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-amber-600 font-mono tracking-tight">
              ₹{metrics.outstandingAmount.toLocaleString("en-IN")}
            </div>
            <div className="mt-2 text-xs text-slate-500 font-semibold">
              Across {metrics.totalInvoices} generated invoices
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          </div>

          {/* Card 4: Active Subscriptions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Subscriptions
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 font-mono tracking-tight">
              {metrics.activeSubscriptions}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{metrics.activeSubscriptions} Active</span>
              <span className="text-slate-300">•</span>
              <span>{metrics.pausedSubscriptions} Paused</span>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          </div>
        </div>

        {/* Minimalist Odoo-Style Quick Launchpad: Clean, compact 12 vector glyph icons */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Enterprise Module Launcher
              </h2>
              <p className="text-xs text-slate-400">
                12 integrated subscription and billing modules
              </p>
            </div>
            <span className="text-xs font-semibold text-[#714B67]">
              Unified Ecosystem
            </span>
          </div>

          {/* Sleek, compact 12-icon grid with custom Odoo vector graphics from main page */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 sm:gap-4 pt-1">
            {BRIGHTLOOP_APPS.map((app) => (
              <Link
                key={app.id}
                href={app.href}
                className="group flex flex-col items-center text-center p-2 rounded-2xl hover:bg-slate-50 transition-all duration-200 hover:-translate-y-1"
                title={app.description}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-2 shadow-2xs group-hover:shadow-md group-hover:border-[#714B67]/30 transition-all">
                  {app.iconSvg}
                </div>
                <span className="mt-2 text-[11px] font-bold text-slate-700 group-hover:text-[#714B67] transition-colors truncate max-w-[80px]">
                  {app.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Operational Queues: 2 Elevated Zoho Books Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table 1: Recent Active Subscriptions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Subscription Agreements</h3>
                  <p className="text-xs text-slate-400">Live agreement states and recurrence schedules</p>
                </div>
                <Link
                  href="/admin/subscriptions"
                  className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1"
                >
                  <span>View All ({metrics.totalSubscriptions})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {subscriptionsList.map((sub) => {
                  const isActive = sub.status === "ACTIVE";
                  return (
                    <div
                      key={sub.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{sub.id}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                              }`}
                            />
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{sub.customer}</p>
                        <p className="text-[11px] text-slate-500">
                          {sub.plan} &bull; Next: {sub.nextBilling}
                        </p>
                      </div>

                      <div className="text-right space-y-1.5">
                        <span className="text-sm font-black text-slate-900 font-mono block">
                          {sub.amount}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] font-bold text-slate-600 hover:text-[#714B67] gap-1 px-2"
                          onClick={() => handleToggleSubStatus(sub.id)}
                        >
                          {isActive ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Resume</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
              <Link
                href="/admin/subscriptions"
                className="text-xs font-bold text-slate-600 hover:text-[#714B67] transition-colors"
              >
                Manage All Subscriptions &rarr;
              </Link>
            </div>
          </div>

          {/* Table 2: Recent Invoices & Reconciliation */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Recent Invoices &amp; Billing Cycles</h3>
                  <p className="text-xs text-slate-400">Automated cycle runs and payment settlements</p>
                </div>
                <Link
                  href="/admin/invoices"
                  className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1"
                >
                  <span>View All ({metrics.totalInvoices})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {invoicesList.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{inv.id}</span>
                        <Badge
                          variant={
                            inv.status === "PAID"
                              ? "paid"
                              : inv.status === "OVERDUE"
                              ? "overdue"
                              : "confirmed"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{inv.customer}</p>
                      <p className="text-[11px] text-slate-500">Due: {inv.dueDate}</p>
                    </div>

                    <div className="text-right space-y-1.5">
                      <span className="text-sm font-black text-slate-900 font-mono block">
                        {inv.amount}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] font-bold text-slate-600 hover:text-slate-900 gap-1 px-2"
                        onClick={() =>
                          setBillingResult(`Tax invoice receipt downloaded for ${inv.id}.`)
                        }
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
              <Link
                href="/admin/invoices"
                className="text-xs font-bold text-slate-600 hover:text-[#714B67] transition-colors"
              >
                Open Full Invoicing Ledger &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
