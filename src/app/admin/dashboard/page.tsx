"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  X,
  Eye,
  Info,
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

interface DashboardSubscription {
  id: string;
  dbId: string;
  customer: string;
  companyName?: string;
  plan: string;
  variant: string;
  amount: string;
  rawAmount: number;
  cadence: string;
  nextBilling: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "CONFIRMED" | "DRAFT";
}

interface DashboardInvoice {
  id: string;
  dbId: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: string;
  paid: string;
  status: "PAID" | "CONFIRMED" | "OVERDUE" | "DRAFT" | "CANCELLED";
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

  const [subscriptionsList, setSubscriptionsList] = useState<DashboardSubscription[]>([]);
  const [invoicesList, setInvoicesList] = useState<DashboardInvoice[]>([]);

  // Detailed view modal state
  const [selectedSub, setSelectedSub] = useState<DashboardSubscription | null>(null);
  const [selectedInv, setSelectedInv] = useState<DashboardInvoice | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentSubscriptions) setSubscriptionsList(data.recentSubscriptions);
        if (data.recentInvoices) setInvoicesList(data.recentInvoices);
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

  const handleToggleSubStatus = async (sub: DashboardSubscription, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const action = sub.status === "ACTIVE" ? "PAUSE" : "RESUME";

    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.dbId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update subscription status");
      }

      setBillingResult(`Subscription ${sub.id} successfully updated to ${action === "PAUSE" ? "PAUSED" : "ACTIVE"}!`);
      setTimeout(() => setBillingResult(null), 5000);
      await fetchDashboardData();
      if (selectedSub && selectedSub.id === sub.id) {
        setSelectedSub((prev) => (prev ? { ...prev, status: action === "PAUSE" ? "PAUSED" : "ACTIVE" } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to transition status");
    }
  };

  const triggerBillingEngine = async () => {
    setBillingRunning(true);
    setBillingResult(null);

    try {
      const res = await fetch("/api/admin/billing/run", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setBillingResult(data.message || "Automated recurring billing run completed successfully.");
        await fetchDashboardData();
      } else {
        setBillingResult(data.error || "Billing run error.");
      }
    } catch (err) {
      setBillingResult("Recurring billing execution failed.");
    } finally {
      setBillingRunning(false);
      setTimeout(() => setBillingResult(null), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 font-sans select-none">
      {/* Unified Enterprise Navigation */}
      <AdminNav />

      {/* Clean, Minimalist Executive Workspace Header */}
      <div className="bg-white border-b border-slate-200/80 py-5">
        <div className="dashboard-container flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-3">
              <span>Executive Overview</span>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-[#714B67]" />}
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
              <span>{billingRunning ? "Processing Billing..." : "Run Recurring Billing"}</span>
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

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
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

        {/* Professional Alert Banner for Overdue Accounts */}
        {!loading && metrics.overdueInvoices > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900">
                  {metrics.overdueInvoices} Invoices Require Payment Reconciliation
                </p>
                <p className="text-[11px] text-slate-600">
                  Total outstanding overdue:{" "}
                  <span className="font-mono font-bold text-slate-900">
                    ₹{metrics.overdueAmount.toLocaleString("en-IN")}.00
                  </span>
                </p>
              </div>
            </div>
            <Link href="/admin/invoices">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-2xs px-3"
              >
                Reconcile Overdue &rarr;
              </Button>
            </Link>
          </div>
        )}

        {/* 4 Professional Financial & Operational Cadence KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: MRR */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Monthly Recurring (MRR)
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3 space-y-2 animate-pulse">
                <div className="h-8 w-36 bg-slate-100 rounded-lg" />
                <div className="h-4 w-44 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  ₹{metrics.mrr.toLocaleString("en-IN")}.00
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <Sparkles className="w-3 h-3" />
                    <span>Active Run Rate</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ARR ₹{((metrics.arr || metrics.mrr * 12) / 100000).toFixed(2)}L
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Card 2: Net Collections */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Net Collections
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3 space-y-2 animate-pulse">
                <div className="h-8 w-40 bg-slate-100 rounded-lg" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  ₹{metrics.revenueCollected.toLocaleString("en-IN")}.00
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-flex items-center text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {metrics.totalInvoices} Invoices
                  </span>
                  <span className="text-[11px] text-slate-400">Database Verified</span>
                </div>
              </>
            )}
          </div>

          {/* Card 3: Outstanding Receivables */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Outstanding Balance
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3 space-y-2 animate-pulse">
                <div className="h-8 w-40 bg-slate-100 rounded-lg" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  ₹{metrics.outstandingAmount.toLocaleString("en-IN")}.00
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    {metrics.overdueInvoices} Overdue
                  </span>
                  <span className="text-[11px] text-slate-400">Total Unpaid</span>
                </div>
              </>
            )}
          </div>

          {/* Card 4: Active Subscriptions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Subscriptions
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3 space-y-2 animate-pulse">
                <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                <div className="h-4 w-40 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {metrics.activeSubscriptions}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{metrics.activeSubscriptions} Active</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {metrics.pausedSubscriptions} Paused &bull; {metrics.closedSubscriptions} Closed
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Minimalist Quick Launchpad */}
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

        {/* Operational Queues: 2 Elevated Zoho Books Tables with Clickable Detailed View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table 1: Recent Active Subscriptions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Subscription Agreements</h3>
                  <p className="text-xs text-slate-400">Click any agreement to inspect comprehensive terms</p>
                </div>
                <Link
                  href="/admin/subscriptions"
                  className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1"
                >
                  <span>View All ({loading ? "..." : metrics.totalSubscriptions})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <div className="divide-y divide-slate-100 p-4 space-y-4 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex justify-between items-center py-2">
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-slate-100 rounded" />
                          <div className="h-3 w-40 bg-slate-100 rounded" />
                        </div>
                        <div className="h-5 w-20 bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : subscriptionsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No subscriptions in database yet.
                  </div>
                ) : (
                  subscriptionsList.map((sub) => {
                    const isActive = sub.status === "ACTIVE";
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className="p-4 flex items-center justify-between hover:bg-purple-50/30 cursor-pointer transition-colors group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">
                              {sub.id}
                            </span>
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
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] font-bold text-slate-600 hover:text-[#714B67] gap-1 px-2"
                              onClick={(e) => handleToggleSubStatus(sub, e)}
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
                      </div>
                    );
                  })
                )}
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
                  <p className="text-xs text-slate-400">Click any invoice to view detailed ledger entry</p>
                </div>
                <Link
                  href="/admin/invoices"
                  className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1"
                >
                  <span>View All ({loading ? "..." : metrics.totalInvoices})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <div className="divide-y divide-slate-100 p-4 space-y-4 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex justify-between items-center py-2">
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-slate-100 rounded" />
                          <div className="h-3 w-40 bg-slate-100 rounded" />
                        </div>
                        <div className="h-5 w-20 bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : invoicesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No invoices generated yet.
                  </div>
                ) : (
                  invoicesList.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInv(inv)}
                      className="p-4 flex items-center justify-between hover:bg-purple-50/30 cursor-pointer transition-colors group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">
                            {inv.id}
                          </span>
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
                        <p className="text-[11px] text-slate-500">Date: {inv.date} &bull; Due: {inv.dueDate}</p>
                      </div>

                      <div className="text-right space-y-1.5">
                        <span className="text-sm font-black text-slate-900 font-mono block">
                          {inv.amount}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Paid: {inv.paid}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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

      {/* Subscription Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedSub.id}</h3>
                  <p className="text-xs text-slate-400">Subscription Contract Overview</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedSub.customer}</span>
                </div>
                {selectedSub.companyName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Company:</span>
                    <span className="font-semibold text-slate-800">{selectedSub.companyName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <Badge variant={selectedSub.status === "ACTIVE" ? "active" : "paused"}>
                    {selectedSub.status}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold text-slate-900">{selectedSub.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Edition / Variant:</span>
                  <span className="font-semibold text-slate-800">{selectedSub.variant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Cadence:</span>
                  <span className="font-semibold text-slate-800">{selectedSub.cadence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recurring Price:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedSub.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Scheduled Billing:</span>
                  <span className="font-mono font-semibold text-[#714B67]">{selectedSub.nextBilling}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => handleToggleSubStatus(selectedSub, e)}
                className="font-bold text-xs"
              >
                {selectedSub.status === "ACTIVE" ? "Pause Subscription" : "Resume Subscription"}
              </Button>
              <Link href={`/admin/invoices?sub=${selectedSub.id}`}>
                <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs">
                  View Invoices &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedInv.id}</h3>
                  <p className="text-xs text-slate-400">Invoice Ledger Summary</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInv(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Account / Customer:</span>
                  <span className="font-bold text-slate-900">{selectedInv.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Status:</span>
                  <Badge variant={selectedInv.status === "PAID" ? "paid" : selectedInv.status === "OVERDUE" ? "overdue" : "confirmed"}>
                    {selectedInv.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Issue Date:</span>
                  <span className="font-mono text-slate-800">{selectedInv.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Due Date:</span>
                  <span className="font-mono text-slate-800">{selectedInv.dueDate}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Billed:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedInv.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid Amount:</span>
                  <span className="font-mono font-semibold text-emerald-600">{selectedInv.paid}</span>
                </div>
                {selectedInv.status !== "PAID" ? (
                  <div className="flex justify-between font-bold text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 mt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pending Balance:
                    </span>
                    <span className="font-mono text-amber-900">{selectedInv.amount}</span>
                  </div>
                ) : (
                  <div className="flex justify-between font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 mt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Status:
                    </span>
                    <span className="font-mono">Settled</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInv(null)}
              >
                Close
              </Button>
              <Link href="/admin/invoices">
                <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs">
                  Open Invoicing Ledger &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
