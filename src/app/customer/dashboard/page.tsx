"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  FileText,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Clock,
  Download,
  PauseCircle,
  PlayCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "payments">("subscriptions");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [subscriptions, setSubscriptions] = useState([
    {
      id: "SUB-2026-0042",
      planName: "Enterprise Cloud Suite",
      frequency: "ANNUAL",
      amount: "₹1,20,000.00",
      startDate: "15 Nov 2025",
      nextBillingDate: "15 Nov 2026",
      status: "ACTIVE" as "ACTIVE" | "PAUSED" | "CLOSED",
      pauseAllowed: true,
      earlyClosureAllowed: true,
      renewalAllowed: true,
    },
    {
      id: "SUB-2026-0018",
      planName: "Odoo Business Sync Add-on",
      frequency: "MONTHLY",
      amount: "₹2,500.00",
      startDate: "01 Jan 2026",
      nextBillingDate: "01 Nov 2026",
      status: "PAUSED" as "ACTIVE" | "PAUSED" | "CLOSED",
      pauseAllowed: true,
      earlyClosureAllowed: false,
      renewalAllowed: true,
    },
  ]);

  const invoices = [
    {
      id: "INV-2026-0086",
      period: "15 Nov 2025 - 14 Nov 2026",
      date: "15 Nov 2025",
      amount: "₹1,20,000.00",
      paid: "₹1,20,000.00",
      outstanding: "₹0.00",
      status: "PAID" as const,
    },
    {
      id: "INV-2026-0045",
      period: "01 Oct 2026 - 31 Oct 2026",
      date: "01 Oct 2026",
      amount: "₹2,500.00",
      paid: "₹2,500.00",
      outstanding: "₹0.00",
      status: "PAID" as const,
    },
  ];

  const payments = [
    {
      id: "PAY-2026-0079",
      invoiceId: "INV-2026-0086",
      method: "Bank Transfer (NEFT)",
      date: "15 Nov 2025",
      amount: "₹1,20,000.00",
      ref: "UTR247003099182",
    },
    {
      id: "PAY-2026-0041",
      invoiceId: "INV-2026-0045",
      method: "UPI (Google Pay)",
      date: "01 Oct 2026",
      amount: "₹2,500.00",
      ref: "UPI/390192837190",
    },
  ];

  const handlePauseRequest = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === subId ? { ...sub, status: sub.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : sub
      )
    );
    setActionMessage(`Subscription ${subId} status successfully toggled!`);
  };

  const handleCancelRequest = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === subId ? { ...sub, status: "CLOSED" } : sub))
    );
    setActionMessage(`Subscription cancellation request processed for ${subId}.`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      {/* Top Customer Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black text-xl text-odoo-700">
              brightloop
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-800">Customer Self-Service Portal</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">SSN Technology Labs</span>
            <Badge variant="active">Active Customer</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {actionMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {actionMessage}
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Customer KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card>
            <CardHeader className="p-5 pb-2">
              <CardDescription className="text-xs font-semibold">Active Subscriptions</CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900">
                {subscriptions.filter((s) => s.status === "ACTIVE").length}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs text-slate-500">
              1 Paused &bull; 0 Overdue
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-2">
              <CardDescription className="text-xs font-semibold">Upcoming Renewal</CardDescription>
              <CardTitle className="text-2xl font-black text-odoo-800">
                15 Nov 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Auto-renew enabled
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 pb-2">
              <CardDescription className="text-xs font-semibold">Outstanding Balance</CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-700">
                ₹0.00
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 text-xs text-slate-500">
              All invoices settled
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`pb-3 text-sm font-bold transition-all px-4 border-b-2 ${
              activeTab === "subscriptions"
                ? "border-odoo-700 text-odoo-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            My Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3 text-sm font-bold transition-all px-4 border-b-2 ${
              activeTab === "invoices"
                ? "border-odoo-700 text-odoo-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Invoices &amp; Receipts ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3 text-sm font-bold transition-all px-4 border-b-2 ${
              activeTab === "payments"
                ? "border-odoo-700 text-odoo-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Payment History ({payments.length})
          </button>
        </div>

        {/* Tab 1: Subscriptions */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{sub.planName}</h4>
                      <Badge variant={sub.status === "ACTIVE" ? "active" : sub.status === "PAUSED" ? "paused" : "closed"}>
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Subscription ID: <span className="font-mono text-slate-700">{sub.id}</span> &bull; Cadence: {sub.frequency}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                      <div>
                        Started: <span className="font-semibold">{sub.startDate}</span>
                      </div>
                      <div>
                        Next Billing: <span className="font-semibold">{sub.nextBillingDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-3">
                    <span className="text-xl font-black text-slate-900">{sub.amount}</span>
                    <div className="flex items-center gap-2">
                      {sub.status !== "CLOSED" && sub.pauseAllowed && (
                        <Button
                          onClick={() => handlePauseRequest(sub.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold gap-1.5"
                        >
                          {sub.status === "PAUSED" ? (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" /> Resume Subscription
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-amber-600" /> Pause Subscription
                            </>
                          )}
                        </Button>
                      )}

                      {sub.status !== "CLOSED" && sub.earlyClosureAllowed && (
                        <Button
                          onClick={() => handleCancelRequest(sub.id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === "invoices" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Billing Period</th>
                    <th className="p-4">Invoice Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{inv.id}</td>
                      <td className="p-4 text-slate-600">{inv.period}</td>
                      <td className="p-4 text-slate-600">{inv.date}</td>
                      <td className="p-4 font-black text-slate-900">{inv.amount}</td>
                      <td className="p-4">
                        <Badge variant="paid">{inv.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs font-bold"
                          onClick={() => setActionMessage(`Invoice PDF downloaded for ${inv.id}`)}
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: Payments */}
        {activeTab === "payments" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-4">Receipt #</th>
                    <th className="p-4">Invoice Ref</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Transaction Ref</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{pay.id}</td>
                      <td className="p-4 font-medium text-slate-600">{pay.invoiceId}</td>
                      <td className="p-4 text-slate-600">{pay.method}</td>
                      <td className="p-4 text-slate-600">{pay.date}</td>
                      <td className="p-4 font-mono text-slate-500">{pay.ref}</td>
                      <td className="p-4 text-right font-black text-emerald-700">{pay.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
