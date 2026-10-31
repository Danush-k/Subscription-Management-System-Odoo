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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StaffDashboardPage() {
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const staffMetrics = {
    totalCustomers: 24,
    activeSubscriptions: 29,
    pendingQuotations: 7,
    pendingInvoices: 14,
    recentPaymentsCount: 18,
    overdueInvoicesCount: 3,
  };

  const pendingQuotations = [
    {
      id: "QUO-2026-0012",
      customer: "CyberSol Software",
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
  ];

  const pendingInvoices = [
    {
      id: "INV-2026-0085",
      customer: "Kalyan Retailers LLP",
      amount: "₹18,500.00",
      dueDate: "10 Nov 2026",
      status: "CONFIRMED" as const,
    },
    {
      id: "INV-2026-0084",
      customer: "Apex Logistics",
      amount: "₹35,500.00",
      dueDate: "25 Oct 2026",
      status: "OVERDUE" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-odoo-700 font-bold text-odoo-700">
              Brightloop
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Staff Operations Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/staff/quotations/new">
              <Button variant="default" size="sm" className="gap-2 font-bold">
                <Plus className="w-4 h-4" />
                Create Quotation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {successNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {successNotice}
            </div>
            <button onClick={() => setSuccessNotice(null)} className="text-xs font-bold text-emerald-800">
              Dismiss
            </button>
          </div>
        )}

        {/* 6 Required Staff Operational Metrics */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Operations Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Customers</CardDescription>
                <CardTitle className="text-2xl font-black text-slate-900">
                  {staffMetrics.totalCustomers}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-slate-500">Accounts</CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Active Subscriptions</CardDescription>
                <CardTitle className="text-2xl font-black text-emerald-700">
                  {staffMetrics.activeSubscriptions}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-emerald-600 font-semibold">In service</CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Pending Quotations</CardDescription>
                <CardTitle className="text-2xl font-black text-blue-700">
                  {staffMetrics.pendingQuotations}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-blue-600 font-semibold">Awaiting acceptance</CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Pending Invoices</CardDescription>
                <CardTitle className="text-2xl font-black text-amber-600">
                  {staffMetrics.pendingInvoices}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-amber-700 font-semibold">Unpaid cycles</CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Recent Payments</CardDescription>
                <CardTitle className="text-2xl font-black text-purple-700">
                  {staffMetrics.recentPaymentsCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-purple-600 font-semibold">Reconciled</CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-semibold">Overdue Invoices</CardDescription>
                <CardTitle className="text-2xl font-black text-red-600">
                  {staffMetrics.overdueInvoicesCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-red-600 font-semibold">Requires follow-up</CardContent>
            </Card>
          </div>
        </div>

        {/* Operational Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Quotations Awaiting Confirmation</CardTitle>
                <CardDescription className="text-xs">Convert directly into live subscriptions</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {pendingQuotations.map((quo) => (
                  <div key={quo.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{quo.id}</span>
                        <Badge variant={quo.status === "QUOTATION" ? "quotation" : "draft"}>
                          {quo.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{quo.customer} &bull; {quo.plan}</p>
                      <p className="text-[11px] text-slate-400">Valid until: {quo.validUntil}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{quo.amount}</p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 text-xs font-bold"
                        onClick={() => setSuccessNotice(`Quotation ${quo.id} confirmed and converted to Subscription!`)}
                      >
                        Confirm &amp; Convert
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Invoices Requiring Payment</CardTitle>
                <CardDescription className="text-xs">Record manual cash, UPI or bank transfers</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {pendingInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{inv.id}</span>
                        <Badge variant={inv.status === "OVERDUE" ? "overdue" : "confirmed"}>
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{inv.customer}</p>
                      <p className="text-[11px] text-slate-400">Due: {inv.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{inv.amount}</p>
                      <Button
                        size="sm"
                        variant="pill"
                        className="mt-2 text-xs font-bold"
                        onClick={() => setSuccessNotice(`Payment of ${inv.amount} recorded against ${inv.id}!`)}
                      >
                        Record Payment
                      </Button>
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
