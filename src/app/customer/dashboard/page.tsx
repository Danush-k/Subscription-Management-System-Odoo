"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  PauseCircle,
  PlayCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Building,
  Printer,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PortalNav } from "@/components/navigation/portal-nav";

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "payments" | "tax">("subscriptions");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [cancelModalSub, setCancelModalSub] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const [subscriptions, setSubscriptions] = useState([
    {
      id: "SUB-2026-0042",
      planName: "Enterprise Cloud Suite",
      frequency: "ANNUAL",
      amount: "₹1,20,000.00",
      numericAmount: 120000,
      startDate: "15 Nov 2025",
      nextBillingDate: "15 Nov 2026",
      status: "ACTIVE" as "ACTIVE" | "PAUSED" | "CLOSED",
      pauseAllowed: true,
      earlyClosureAllowed: true,
      autoRenew: true,
      features: ["Multi-Entity ERP", "Priority 24/7 SLA", "Full GSTR-1 Tax Engine", "50 Staff Seats"],
    },
    {
      id: "SUB-2026-0018",
      planName: "Odoo Business Sync Add-on",
      frequency: "MONTHLY",
      amount: "₹2,500.00",
      numericAmount: 2500,
      startDate: "01 Jan 2026",
      nextBillingDate: "01 Nov 2026",
      status: "PAUSED" as "ACTIVE" | "PAUSED" | "CLOSED",
      pauseAllowed: true,
      earlyClosureAllowed: false,
      autoRenew: false,
      features: ["Two-Way Inventory Sync", "Automated Journals", "PostgreSQL Webhook Relay"],
    },
  ]);

  const invoices = [
    {
      id: "INV-2026-0086",
      period: "15 Nov 2025 - 14 Nov 2026",
      date: "15 Nov 2025",
      dueDate: "30 Nov 2025",
      baseAmount: "₹1,01,694.92",
      taxAmount: "₹18,305.08",
      amount: "₹1,20,000.00",
      paid: "₹1,20,000.00",
      outstanding: "₹0.00",
      status: "PAID" as const,
      paymentMethod: "Bank Transfer (NEFT)",
      utr: "UTR247003099182",
    },
    {
      id: "INV-2026-0045",
      period: "01 Oct 2026 - 31 Oct 2026",
      date: "01 Oct 2026",
      dueDate: "15 Oct 2026",
      baseAmount: "₹2,118.64",
      taxAmount: "₹381.36",
      amount: "₹2,500.00",
      paid: "₹2,500.00",
      outstanding: "₹0.00",
      status: "PAID" as const,
      paymentMethod: "UPI (Google Pay)",
      utr: "UPI/390192837190",
    },
  ];

  const payments = [
    {
      id: "PAY-2026-0079",
      invoiceId: "INV-2026-0086",
      method: "Bank Transfer (NEFT / RTGS)",
      date: "15 Nov 2025",
      amount: "₹1,20,000.00",
      ref: "UTR247003099182",
      bankName: "HDFC Bank Ltd",
      status: "SUCCESSFUL",
    },
    {
      id: "PAY-2026-0041",
      invoiceId: "INV-2026-0045",
      method: "UPI Instant Transfer",
      date: "01 Oct 2026",
      amount: "₹2,500.00",
      ref: "UPI/390192837190",
      bankName: "Google Pay / Axis",
      status: "SUCCESSFUL",
    },
  ];

  const handlePauseToggle = (subId: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subId) {
          const nextStatus = sub.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
          setActionMessage(
            `Subscription ${subId} successfully updated to ${nextStatus}! Recurring billing state synced.`
          );
          return { ...sub, status: nextStatus };
        }
        return sub;
      })
    );
  };

  const handleConfirmCancel = () => {
    if (!cancelModalSub) return;
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === cancelModalSub ? { ...sub, status: "CLOSED" } : sub))
    );
    setActionMessage(`Subscription agreement ${cancelModalSub} has been cancelled.`);
    setCancelModalSub(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 select-none">
      {/* Elevated Portal Header */}
      <PortalNav
        portalType="customer"
        portalTitle="Customer Self-Service Portal"
        userName="Danush Kalyan"
        userRole="Company Billing Admin"
        companyName="SSN Technology Labs"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Welcome & Context Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
                Enterprise Client Portal
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">Account ID: CUST-2026-0001</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              SSN Technology Labs
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab("invoices");
                setActionMessage("Viewing all settled invoices and tax receipts.");
              }}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 text-[#714B67]" />
              <span>Tax Receipts</span>
            </button>

            <Link href="/register">
              <Button
                size="sm"
                className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                + New Subscription
              </Button>
            </Link>
          </div>
        </div>

        {/* Action / Success Banner */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3 Zoho/Odoo-Elevated KPI Cards matching Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Active Subscriptions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Subscriptions
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 tracking-tight">
              {subscriptions.filter((s) => s.status === "ACTIVE").length}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              <span>1 Paused</span>
              <span className="text-slate-300">•</span>
              <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
              <span>0 Overdue</span>
            </div>
          </div>

          {/* Card 2: Upcoming Renewal */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Renewal
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-[#714B67] tracking-tight">
              15 Nov 2026
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Auto-renew enabled (e-Mandate)</span>
            </div>
          </div>

          {/* Card 3: Outstanding Balance */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Outstanding Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-black text-emerald-600 tracking-tight font-mono">
              ₹0.00
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>All invoices settled (Zero dues)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation with Counters matching Image 1 */}
        <div className="flex items-center gap-2 border-b border-slate-200/90 pt-2">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`pb-3.5 text-xs sm:text-sm font-bold transition-all px-4 border-b-2 flex items-center gap-2 ${
              activeTab === "subscriptions"
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>My Subscriptions</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "subscriptions"
                  ? "bg-[#714B67]/10 text-[#714B67]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {subscriptions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-3.5 text-xs sm:text-sm font-bold transition-all px-4 border-b-2 flex items-center gap-2 ${
              activeTab === "invoices"
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Invoices &amp; Receipts</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "invoices"
                  ? "bg-[#714B67]/10 text-[#714B67]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {invoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3.5 text-xs sm:text-sm font-bold transition-all px-4 border-b-2 flex items-center gap-2 ${
              activeTab === "payments"
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Payment History</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "payments"
                  ? "bg-[#714B67]/10 text-[#714B67]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {payments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tax")}
            className={`pb-3.5 text-xs sm:text-sm font-bold transition-all px-4 border-b-2 flex items-center gap-2 ${
              activeTab === "tax"
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>GST &amp; Company Profile</span>
          </button>
        </div>

        {/* Tab 1: Subscriptions List */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const isActive = sub.status === "ACTIVE";
              const isPaused = sub.status === "PAUSED";
              const isClosed = sub.status === "CLOSED";

              return (
                <div
                  key={sub.id}
                  className={`bg-white rounded-2xl p-6 sm:p-7 border shadow-xs transition-all ${
                    isActive
                      ? "border-emerald-200 border-l-4 border-l-emerald-500"
                      : isPaused
                      ? "border-amber-200 border-l-4 border-l-amber-500"
                      : "border-slate-200 border-l-4 border-l-slate-400 opacity-70"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Metadata */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                          {sub.planName}
                        </h3>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isPaused
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md bg-slate-100 uppercase">
                          {sub.frequency}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500">
                        Subscription ID:{" "}
                        <span className="font-mono font-bold text-slate-700">
                          {sub.id}
                        </span>{" "}
                        &bull; Cadence: {sub.frequency}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-1">
                        <div>
                          Started:{" "}
                          <span className="font-bold text-slate-800">{sub.startDate}</span>
                        </div>
                        <div>
                          Next Billing:{" "}
                          <span className="font-bold text-slate-800">
                            {sub.nextBillingDate}
                          </span>
                        </div>
                        {sub.autoRenew && (
                          <div className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Renew Active
                          </div>
                        )}
                      </div>

                      {/* Included Capabilities */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sub.features.map((feat) => (
                          <span
                            key={feat}
                            className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            &bull; {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Price & Real-time Action Buttons */}
                    <div className="flex flex-col md:items-end justify-between gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                          {sub.amount}
                        </span>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Billed {sub.frequency.toLowerCase()} in INR (inc. GST)
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Pause / Resume Button */}
                        {!isClosed && sub.pauseAllowed && (
                          <Button
                            onClick={() => handlePauseToggle(sub.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold gap-1.5 border-slate-300 hover:border-[#714B67] hover:text-[#714B67]"
                          >
                            {isPaused ? (
                              <>
                                <PlayCircle className="w-4 h-4 text-emerald-600" />
                                <span>Resume Subscription</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-4 h-4 text-amber-600" />
                                <span>Pause Subscription</span>
                              </>
                            )}
                          </Button>
                        )}

                        {/* Agreement PDF Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 gap-1"
                          onClick={() =>
                            setActionMessage(
                              `Contract agreement PDF for ${sub.id} downloaded.`
                            )
                          }
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Contract</span>
                        </Button>

                        {/* Early Closure / Cancel Button */}
                        {!isClosed && sub.earlyClosureAllowed && (
                          <Button
                            onClick={() => setCancelModalSub(sub.id)}
                            variant="ghost"
                            size="sm"
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Invoices & Receipts */}
        {activeTab === "invoices" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tax Invoices &amp; B2B Receipts
                </h3>
                <p className="text-xs text-slate-500">
                  Legally compliant GST invoices generated according to Rule 46 of CGST Rules, 2017.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Billing Period</th>
                    <th className="p-4">Invoice Date</th>
                    <th className="p-4">Base Amount</th>
                    <th className="p-4">GST (18%)</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900 font-mono">
                        {inv.id}
                      </td>
                      <td className="p-4 text-slate-600">{inv.period}</td>
                      <td className="p-4 text-slate-600">{inv.date}</td>
                      <td className="p-4 font-mono text-slate-600">{inv.baseAmount}</td>
                      <td className="p-4 font-mono text-slate-600">{inv.taxAmount}</td>
                      <td className="p-4 font-black text-slate-900 font-mono text-sm">
                        {inv.amount}
                      </td>
                      <td className="p-4">
                        <Badge variant="paid">{inv.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs font-bold"
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            <FileText className="w-3.5 h-3.5 text-[#714B67]" />
                            <span>View</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1 text-xs font-bold"
                            onClick={() =>
                              setActionMessage(`Official GST Tax Invoice PDF downloaded for ${inv.id}.`)
                            }
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Payment History */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Payment Settlement Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Verified payment confirmations through banking gateway and RTGS/UPI reconciliations.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Receipt #</th>
                    <th className="p-4">Invoice Ref</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Settlement Date</th>
                    <th className="p-4">Transaction UTR / Ref</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-bold text-slate-900 font-mono">
                        {pay.id}
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700">
                        {pay.invoiceId}
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>{pay.method}</div>
                        <div className="text-[10px] text-slate-400">{pay.bankName}</div>
                      </td>
                      <td className="p-4 text-slate-600">{pay.date}</td>
                      <td className="p-4 font-mono text-slate-600 text-[11px]">
                        {pay.ref}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-emerald-700 font-mono text-sm">
                        {pay.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: GST & Company Profile */}
        {activeTab === "tax" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#714B67]" />
                <span>Registered Entity Information</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Legal Name
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    SSN Technology Labs Private Limited
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    GSTIN (Tax Identification)
                  </span>
                  <p className="font-mono font-bold text-emerald-700 text-sm">
                    33AABCS1429B1Z2
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Registered Office Address
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    SSN Nagar, Rajiv Gandhi Salai (OMR), Kalavakkam,
                    <br />
                    Chennai, Tamil Nadu – 603110, India
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">
                    Authorized Billing Contact
                  </span>
                  <p className="text-slate-700">
                    Danush Kalyan &bull; billing@ssntechlabs.com
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#714B67]" />
                <span>Primary Payment Method</span>
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Corporate NetBanking &amp; e-Mandate
                  </span>
                  <Badge variant="active">Default</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  HDFC Bank Corporate Account &bull;&bull;&bull;&bull; 8892
                </p>
                <p className="text-[11px] text-slate-400">
                  Auto-debit mandate registered for recurring subscriptions.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={() =>
                    setActionMessage("Payment mandate update form dispatched to authorized signatory.")
                  }
                >
                  Update Payment Method
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Subscription Cancellation
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to cancel subscription agreement{" "}
                <span className="font-mono font-bold text-slate-800">{cancelModalSub}</span>? Your
                cloud instances and API quotas will remain active until the end of the current paid billing period.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalSub(null)}
                className="text-xs font-bold"
              >
                Keep Subscription
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tax Invoice Preview
                </span>
                <h3 className="text-xl font-black text-slate-900 font-mono">
                  {selectedInvoice.id}
                </h3>
              </div>
              <Badge variant="paid">{selectedInvoice.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Billed To</span>
                <p className="font-bold text-slate-900">SSN Technology Labs Pvt Ltd</p>
                <p className="text-slate-500 font-mono">GSTIN: 33AABCS1429B1Z2</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Issued By</span>
                <p className="font-bold text-slate-900">Brightloop Software Corp</p>
                <p className="text-slate-500 font-mono">GSTIN: 33AAAAA0000A1Z5</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Period: {selectedInvoice.period}</span>
                <span className="font-mono">{selectedInvoice.baseAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%) + SGST (9%)</span>
                <span className="font-mono">{selectedInvoice.taxAmount}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Settled (INR)</span>
                <span className="font-mono text-emerald-700">{selectedInvoice.amount}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Paid via {selectedInvoice.paymentMethod} (UTR: {selectedInvoice.utr}) on {selectedInvoice.date}.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="text-xs font-bold"
              >
                Close Preview
              </Button>
              <Button
                size="sm"
                className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold gap-1.5"
                onClick={() => {
                  setActionMessage(`Invoice PDF downloaded for ${selectedInvoice.id}`);
                  setSelectedInvoice(null);
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
