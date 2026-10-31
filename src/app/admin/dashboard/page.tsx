"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OdooAppGrid } from "@/components/dashboard/odoo-app-grid";

export default function AdminDashboardPage() {
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  // Mock initial state representing real PostgreSQL dataset
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
      plan: "Enterprise Cloud (Annual)",
      amount: "₹1,20,000.00",
      nextBilling: "15 Nov 2026",
      status: "ACTIVE" as const,
    },
    {
      id: "SUB-2026-0041",
      customer: "Kalyan Retailers LLP",
      plan: "Odoo Business Suite",
      amount: "₹18,500.00",
      nextBilling: "01 Nov 2026",
      status: "ACTIVE" as const,
    },
    {
      id: "SUB-2026-0040",
      customer: "AeroDynamics Corp",
      plan: "Growth Monthly Tier",
      amount: "₹8,400.00",
      nextBilling: "05 Nov 2026",
      status: "PAUSED" as const,
    },
    {
      id: "SUB-2026-0039",
      customer: "Zenith Financials",
      plan: "Standard License",
      amount: "₹24,000.00",
      nextBilling: "-",
      status: "CLOSED" as const,
    },
  ];

  const recentInvoices = [
    {
      id: "INV-2026-0086",
      customer: "SSN Technology Labs",
      date: "31 Oct 2026",
      amount: "₹1,20,000.00",
      paid: "₹1,20,000.00",
      status: "PAID" as const,
    },
    {
      id: "INV-2026-0085",
      customer: "Kalyan Retailers LLP",
      date: "30 Oct 2026",
      amount: "₹18,500.00",
      paid: "₹0.00",
      status: "CONFIRMED" as const,
    },
    {
      id: "INV-2026-0084",
      customer: "Apex Logistics",
      date: "15 Oct 2026",
      amount: "₹35,500.00",
      paid: "₹0.00",
      status: "OVERDUE" as const,
    },
    {
      id: "INV-2026-0083",
      customer: "Digital Dynamics",
      date: "28 Oct 2026",
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
      setBillingResult("Billing engine completed: 3 eligible subscriptions identified, 3 invoices generated, 0 skipped.");
      setMetrics((prev) => ({
        ...prev,
        totalInvoices: prev.totalInvoices + 3,
        outstandingAmount: prev.outstandingAmount + 42000,
      }));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-odoo-700 font-bold text-odoo-700">
              Brightloop
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Admin Workspace</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={triggerBillingEngine}
              disabled={billingRunning}
              variant="secondary"
              size="sm"
              className="gap-2 font-bold"
            >
              <Play className="w-3.5 h-3.5 text-odoo-700 fill-odoo-700" />
              {billingRunning ? "Running Engine..." : "Run Recurring Billing"}
            </Button>

            <Link href="/admin/subscriptions/new">
              <Button variant="default" size="sm" className="gap-2 font-bold">
                <Plus className="w-4 h-4" />
                New Subscription
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {billingResult && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {billingResult}
            </div>
            <button
              onClick={() => setBillingResult(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Overdue Warning Alert */}
        {metrics.overdueInvoices > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">
                  {metrics.overdueInvoices} Invoices Require Payment Reconciliation
                </p>
                <p className="text-xs text-amber-800">
                  Total outstanding overdue balance: ₹{metrics.overdueAmount.toLocaleString("en-IN")}.00
                </p>
              </div>
            </div>
            <Link href="/admin/invoices?status=OVERDUE">
              <Button variant="outline" size="sm" className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold">
                View Overdue Invoices
              </Button>
            </Link>
          </div>
        )}

        {/* 12 Required Operational & Financial Statistics */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Financial &amp; Operational Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Total Revenue Collected</CardDescription>
                <CardTitle className="text-2xl font-black text-emerald-700">
                  ₹{metrics.revenueCollected.toLocaleString("en-IN")}.00
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-slate-500 font-medium">
                {metrics.totalPayments} reconciled payments
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Outstanding Receivables</CardDescription>
                <CardTitle className="text-2xl font-black text-amber-600">
                  ₹{metrics.outstandingAmount.toLocaleString("en-IN")}.00
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-slate-500 font-medium">
                Across {metrics.totalInvoices} generated invoices
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Monthly Recurring Revenue (MRR)</CardDescription>
                <CardTitle className="text-2xl font-black text-odoo-800">
                  ₹{metrics.mrr.toLocaleString("en-IN")}.00
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Normalised monthly cadence
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Total Subscriptions</CardDescription>
                <CardTitle className="text-2xl font-black text-slate-900">
                  {metrics.totalSubscriptions}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-slate-500 flex gap-2">
                <span className="text-emerald-700 font-bold">{metrics.activeSubscriptions} Active</span>
                <span>&bull;</span>
                <span className="text-amber-700 font-bold">{metrics.pausedSubscriptions} Paused</span>
                <span>&bull;</span>
                <span className="text-slate-500 font-bold">{metrics.closedSubscriptions} Closed</span>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Active Customers</CardDescription>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {metrics.totalCustomers}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-slate-500">
                Verified B2B accounts
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Products &amp; Tiers</CardDescription>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {metrics.totalProducts}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-slate-500">
                With multi-variant pricing
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Subscription Plans</CardDescription>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {metrics.totalPlans}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-slate-500">
                Daily, Weekly, Monthly, Yearly
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Overdue Invoices</CardDescription>
                <CardTitle className="text-xl font-bold text-red-600">
                  {metrics.overdueInvoices}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-red-600 font-medium">
                Needs manual or gateway dunning
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Embedded Odoo-style App Launcher */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Subscription Control Apps</h2>
              <p className="text-xs text-slate-500">Launch any dedicated operational module</p>
            </div>
          </div>
          <OdooAppGrid />
        </div>

        {/* Data Tables: Recent Subscriptions and Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subscriptions Card */}
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Active Subscriptions</CardTitle>
                <CardDescription className="text-xs">Real-time status transitions</CardDescription>
              </div>
              <Link href="/admin/subscriptions" className="text-xs font-bold text-odoo-700 hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentSubscriptions.map((sub) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{sub.id}</span>
                        <Badge
                          variant={
                            sub.status === "ACTIVE"
                              ? "active"
                              : sub.status === "PAUSED"
                              ? "paused"
                              : "closed"
                          }
                        >
                          {sub.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{sub.customer} &bull; {sub.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{sub.amount}</p>
                      <p className="text-[11px] text-slate-400">Next: {sub.nextBilling}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoices Card */}
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Billing Invoices</CardTitle>
                <CardDescription className="text-xs">Automated &amp; confirmed cycles</CardDescription>
              </div>
              <Link href="/admin/invoices" className="text-xs font-bold text-odoo-700 hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{inv.id}</span>
                        <Badge
                          variant={
                            inv.status === "PAID"
                              ? "paid"
                              : inv.status === "CONFIRMED"
                              ? "confirmed"
                              : "overdue"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{inv.customer} &bull; {inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{inv.amount}</p>
                      <p className="text-[11px] text-slate-400">Paid: {inv.paid}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
