"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  XCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
} from "lucide-react";

interface SubscriptionItem {
  id: string;
  subscriptionNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  variantName: string;
  amount: number;
  currency: string;
  billingFrequency: string;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED";
  startDate: string;
  nextBillingDate: string;
  pauseAllowed: boolean;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: "sub-1",
    subscriptionNumber: "SUB-2026-0042",
    customerName: "SSN Technology Labs",
    customerEmail: "billing@ssntechlabs.com",
    planName: "Enterprise Cloud Suite",
    variantName: "Odoo Enterprise Edition",
    amount: 120000,
    currency: "INR",
    billingFrequency: "YEARLY",
    status: "ACTIVE",
    startDate: "2026-01-15",
    nextBillingDate: "2027-01-15",
    pauseAllowed: true,
  },
  {
    id: "sub-2",
    subscriptionNumber: "SUB-2026-0041",
    customerName: "Kalyan Retailers LLP",
    customerEmail: "finance@kalyanretail.in",
    planName: "Odoo Business Suite",
    variantName: "Standard Cloud Tier",
    amount: 18500,
    currency: "INR",
    billingFrequency: "MONTHLY",
    status: "ACTIVE",
    startDate: "2026-06-01",
    nextBillingDate: "2026-11-01",
    pauseAllowed: true,
  },
  {
    id: "sub-3",
    subscriptionNumber: "SUB-2026-0040",
    customerName: "AeroDynamics Corp",
    customerEmail: "procure@aerodynamics.com",
    planName: "Growth Monthly Tier",
    variantName: "SAP Migration Edition",
    amount: 8400,
    currency: "INR",
    billingFrequency: "MONTHLY",
    status: "PAUSED",
    startDate: "2026-03-10",
    nextBillingDate: "2026-11-10",
    pauseAllowed: true,
  },
  {
    id: "sub-4",
    subscriptionNumber: "SUB-2026-0039",
    customerName: "Zenith Financials Ltd.",
    customerEmail: "accounts@zenithfin.co",
    planName: "Standard Core License",
    variantName: "Standard Cloud Tier",
    amount: 24000,
    currency: "INR",
    billingFrequency: "MONTHLY",
    status: "CLOSED",
    startDate: "2025-08-01",
    nextBillingDate: "—",
    pauseAllowed: false,
  },
  {
    id: "sub-5",
    subscriptionNumber: "SUB-2026-0038",
    customerName: "BlueHorizon Logistics",
    customerEmail: "ops@bluehorizon.io",
    planName: "Enterprise Cloud Suite",
    variantName: "Odoo Enterprise Edition",
    amount: 45000,
    currency: "INR",
    billingFrequency: "QUARTERLY",
    status: "CONFIRMED",
    startDate: "2026-11-01",
    nextBillingDate: "2026-11-01",
    pauseAllowed: true,
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const handlePauseResume = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          if (sub.status === "ACTIVE") {
            if (!sub.pauseAllowed) {
              setActionAlert(`Action blocked: Subscription ${sub.subscriptionNumber} plan terms do not permit pause.`);
              return sub;
            }
            setActionAlert(`Subscription ${sub.subscriptionNumber} paused successfully. Next billing cycle suspended.`);
            return { ...sub, status: "PAUSED" as const };
          } else if (sub.status === "PAUSED") {
            setActionAlert(`Subscription ${sub.subscriptionNumber} resumed. Automated recurring billing active.`);
            return { ...sub, status: "ACTIVE" as const };
          }
        }
        return sub;
      })
    );
  };

  const handleClose = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          setActionAlert(`Subscription ${sub.subscriptionNumber} closed. Recurring billing cancelled.`);
          return { ...sub, status: "CLOSED" as const, nextBillingDate: "—" };
        }
        return sub;
      })
    );
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const pausedCount = subscriptions.filter((s) => s.status === "PAUSED").length;
  const closedCount = subscriptions.filter((s) => s.status === "CLOSED").length;
  const confirmedCount = subscriptions.filter((s) => s.status === "CONFIRMED").length;

  const countByStatus = (status: string) => {
    if (status === "ALL") return subscriptions.length;
    return subscriptions.filter((s) => s.status === status).length;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        {/* Sub-header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-xl text-[#714B67]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Subscription Lifecycle Management
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated recurring agreements, status transitions, and period renewals.
            </p>
          </div>

          <Link href="/admin/subscriptions/new">
            <Button className="bg-[#714B67] hover:bg-[#5C3C54] text-white gap-2 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              New Subscription
            </Button>
          </Link>
        </div>

        {/* Action Alert */}
        {actionAlert && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-slideDown">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionAlert}</span>
            </div>
            <button
              onClick={() => setActionAlert(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Subscriptions
            </p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-2">
              {subscriptions.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Automated recurring base</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Active Contracts
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-2">{activeCount}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Generating recurring revenue</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Paused
              </p>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600 font-mono mt-2">{pausedCount}</p>
            <p className="text-[11px] text-amber-600 mt-0.5">Billing temporarily held</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed</p>
            <p className="text-2xl font-black text-slate-600 font-mono mt-2">{closedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cancelled / Non-renewed</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subscription #, customer, email, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {["ALL", "ACTIVE", "PAUSED", "CONFIRMED", "CLOSED"].map((status) => {
              const count = countByStatus(status);
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#714B67] text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-600 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Subscription #</th>
                  <th className="py-3.5 px-5">Customer Profile</th>
                  <th className="py-3.5 px-5">Plan &amp; Variant Edition</th>
                  <th className="py-3.5 px-5">Recurring Amount</th>
                  <th className="py-3.5 px-5">Next Billing</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscriptions.map((sub) => {
                  const isActive = sub.status === "ACTIVE";
                  const isPaused = sub.status === "PAUSED";
                  const isConfirmed = sub.status === "CONFIRMED";

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-[#F8FAFC] transition-colors relative ${
                        isActive
                          ? "border-l-4 border-l-emerald-500"
                          : isPaused
                          ? "border-l-4 border-l-amber-400"
                          : isConfirmed
                          ? "border-l-4 border-l-blue-400"
                          : "border-l-4 border-l-slate-300"
                      }`}
                    >
                      <td className="py-4 px-5 font-mono font-bold text-slate-900">
                        {sub.subscriptionNumber}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Start: {sub.startDate}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{sub.customerName}</div>
                        <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{sub.planName}</div>
                        <div className="text-[11px] text-slate-500">{sub.variantName}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold font-mono text-slate-900 text-sm">
                          ₹{sub.amount.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          {sub.billingFrequency}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {sub.nextBillingDate}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isPaused
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : isConfirmed
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive
                                ? "bg-emerald-500 animate-pulse"
                                : isPaused
                                ? "bg-amber-500"
                                : isConfirmed
                                ? "bg-blue-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === "ACTIVE" && (
                            <button
                              onClick={() => handlePauseResume(sub.id)}
                              className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200/60"
                              title="Pause Subscription"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {sub.status === "PAUSED" && (
                            <button
                              onClick={() => handlePauseResume(sub.id)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/60"
                              title="Resume Subscription"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {sub.status !== "CLOSED" && (
                            <button
                              onClick={() => handleClose(sub.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60"
                              title="Close Subscription"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            href={`/admin/invoices?sub=${sub.subscriptionNumber}`}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60"
                            title="View Invoices"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200/80 px-5 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredSubscriptions.length} of {subscriptions.length} subscription contracts
            </span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Month-end leap year calculation active
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
