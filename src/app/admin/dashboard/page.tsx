"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

interface DashboardMetrics {
  totalCustomers: number;
  totalProducts: number;
  totalPlans: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  closedSubscriptions: number;
  totalInvoices: number;
  revenueCollected: number;
  outstandingAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
  mrr: number;
  arr: number;
}

interface RecentSubscription {
  id: string;
  dbId: string;
  customer: string;
  companyName: string | null;
  plan: string;
  variant: string;
  amount: string;
  rawAmount: number;
  cadence: string;
  nextBilling: string;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";
}

interface RecentInvoice {
  id: string;
  dbId: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: string;
  paid: string;
  status: "DRAFT" | "CONFIRMED" | "PAID" | "OVERDUE" | "CANCELLED";
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    totalProducts: 0,
    totalPlans: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pausedSubscriptions: 0,
    closedSubscriptions: 0,
    totalInvoices: 0,
    revenueCollected: 0,
    outstandingAmount: 0,
    overdueInvoices: 0,
    overdueAmount: 0,
    mrr: 0,
    arr: 0,
  });

  const [recentSubscriptions, setRecentSubscriptions] = useState<RecentSubscription[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setRecentSubscriptions(data.recentSubscriptions || []);
        setRecentInvoices(data.recentInvoices || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerBillingEngine = async () => {
    setBillingRunning(true);
    setBillingResult(null);

    try {
      const res = await fetch("/api/admin/billing/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBillingResult(data.message || "Recurring billing run complete.");
        await fetchDashboardData();
      } else {
        setBillingResult(data.error || "Failed to execute billing run.");
      }
    } catch (err: any) {
      setBillingResult(err.message || "Network error while running billing.");
    } finally {
      setBillingRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      {/* Unified Enterprise Navigation */}
      <AdminNav />

      {/* Page Title & Operational Action Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              Live PostgreSQL database metrics, recurring revenue cadence, and financial operations.
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
              {billingRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#714B67]" />
              ) : (
                <Play className="w-3.5 h-3.5 text-[#714B67] fill-[#714B67]" />
              )}
              {billingRunning ? "Processing Recurrence..." : "Run Recurring Billing"}
            </Button>

            <Link href="/admin/subscriptions">
              <Button
                size="sm"
                className="gap-2 font-bold text-xs bg-[#714B67] hover:bg-[#5C3C54] text-white rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Manage Subscriptions
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-fadeIn">
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
                  {metrics.overdueInvoices} Invoice{metrics.overdueInvoices > 1 ? "s" : ""} Require Payment Reconciliation
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Total outstanding overdue balance:{" "}
                  <span className="font-mono font-bold">
                    ₹{metrics.overdueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#714B67]" />
              <span>Core Revenue &amp; Operational Health</span>
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              Live from PostgreSQL
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* MRR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#714B67]/30 transition-all">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Monthly Recurring
              </p>
              <p className="text-xl font-black text-slate-900 font-mono mt-1">
                ₹{metrics.mrr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Run Rate</span>
              </div>
            </div>

            {/* ARR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#714B67]/30 transition-all">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Annual Run Rate
              </p>
              <p className="text-xl font-black text-[#714B67] font-mono mt-1">
                ₹{metrics.arr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                <span>12x MRR projection</span>
              </div>
            </div>

            {/* Collected Revenue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-200 transition-all">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Revenue Collected
              </p>
              <p className="text-xl font-black text-emerald-700 font-mono mt-1">
                ₹{metrics.revenueCollected.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Settled in bank</span>
              </div>
            </div>

            {/* Outstanding Receivables */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-200 transition-all">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Outstanding Balance
              </p>
              <p className="text-xl font-black text-amber-700 font-mono mt-1">
                ₹{metrics.outstandingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold mt-1">
                <Clock className="w-3 h-3" />
                <span>Pending invoices</span>
              </div>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Contracts
              </p>
              <p className="text-xl font-black text-slate-900 font-mono mt-1">
                {metrics.activeSubscriptions}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                <span>{metrics.pausedSubscriptions} paused &bull; {metrics.closedSubscriptions} closed</span>
              </div>
            </div>

            {/* Total Invoices */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tax Invoices
              </p>
              <p className="text-xl font-black text-slate-900 font-mono mt-1">
                {metrics.totalInvoices}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                <span>GST-18 compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Odoo Modular App Launcher Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-[#714B67]" />
              <span>Odoo Modular Enterprise Applications</span>
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              10 Interconnected Modules
            </span>
          </div>

          <OdooAppGrid />
        </div>

        {/* Recent Operational Feeds (Subscriptions & Invoices) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Subscriptions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Recent Active Subscriptions</h3>
                  <p className="text-xs text-slate-500">Live multi-tier contracts from PostgreSQL</p>
                </div>
                <Link
                  href="/admin/subscriptions"
                  className="text-xs font-bold text-[#714B67] hover:text-[#5C3C54] flex items-center gap-1 group"
                >
                  <span>View All Contracts</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#714B67]" />
                    <p className="mt-2 text-xs">Loading subscriptions from database...</p>
                  </div>
                ) : recentSubscriptions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No subscriptions found</div>
                ) : (
                  recentSubscriptions.map((sub) => (
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
                          {sub.companyName || sub.customer} &bull; <span className="text-slate-400">{sub.plan}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold font-mono text-slate-900 text-sm">{sub.amount}</p>
                        <p className="text-[10px] text-slate-400">Next: {sub.nextBilling}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link
                href="/admin/subscriptions"
                className="text-xs font-bold text-[#714B67] hover:underline"
              >
                View all {metrics.totalSubscriptions} contracts in database &rarr;
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
                {loading ? (
                  <div className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#714B67]" />
                    <p className="mt-2 text-xs">Loading invoices from database...</p>
                  </div>
                ) : recentInvoices.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No invoices found</div>
                ) : (
                  recentInvoices.map((inv) => (
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
                  ))
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link
                href="/admin/invoices"
                className="text-xs font-bold text-[#714B67] hover:underline"
              >
                Reconcile all {metrics.totalInvoices} invoices in database &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
