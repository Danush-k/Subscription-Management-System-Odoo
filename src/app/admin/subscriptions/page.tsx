"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
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
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED";
  startDate: string;
  nextBillingDate: string;
  pauseAllowed: boolean;
  earlyClosureAllowed: boolean;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/subscriptions", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handlePauseResume = async (sub: SubscriptionItem) => {
    const action = sub.status === "ACTIVE" ? "PAUSE" : "RESUME";
    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert(
          action === "PAUSE"
            ? `Subscription ${sub.subscriptionNumber} paused successfully. Next billing cycle suspended.`
            : `Subscription ${sub.subscriptionNumber} resumed. Automated recurring billing active.`
        );
        fetchSubscriptions();
      } else {
        setActionAlert(`Action blocked: ${data.error || "Cannot change status"}`);
      }
    } catch (err: any) {
      setActionAlert(`Error: ${err.message || "Failed to update subscription"}`);
    }
  };

  const handleClose = async (sub: SubscriptionItem) => {
    if (!confirm(`Are you sure you want to close subscription ${sub.subscriptionNumber}?`)) return;

    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLOSE" }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert(`Subscription ${sub.subscriptionNumber} closed. Recurring billing cancelled.`);
        fetchSubscriptions();
      } else {
        setActionAlert(`Action blocked: ${data.error || "Cannot close subscription"}`);
      }
    } catch (err: any) {
      setActionAlert(`Error: ${err.message || "Failed to close subscription"}`);
    }
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        {/* Header Title with Odoo/Zoho aesthetics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Subscription Lifecycle Directory
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Live contracts loaded from PostgreSQL database with automated recurrence management.
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
            <p className="text-2xl font-black text-amber-700 font-mono mt-2">{pausedCount}</p>
            <p className="text-[11px] text-amber-600 mt-0.5">Temporarily suspended</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed</p>
            <p className="text-2xl font-black text-slate-600 font-mono mt-2">{closedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cancelled or terminated</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search contract number, company, email, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {["ALL", "ACTIVE", "PAUSED", "CONFIRMED", "CLOSED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Zoho-styled Data-dense Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Contract #</th>
                  <th className="py-3.5 px-4">Customer &amp; Account</th>
                  <th className="py-3.5 px-4">Plan &amp; Variant Edition</th>
                  <th className="py-3.5 px-4">Billing Cadence</th>
                  <th className="py-3.5 px-4">Recurring Total</th>
                  <th className="py-3.5 px-4">Next Billing Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#714B67]" />
                      <p className="mt-2 text-xs">Loading subscriptions from PostgreSQL...</p>
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No subscriptions match the filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const isPaused = sub.status === "PAUSED";
                    const isActive = sub.status === "ACTIVE";

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {sub.subscriptionNumber}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{sub.customerName}</div>
                          <div className="text-[11px] text-slate-400">{sub.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{sub.planName}</div>
                          <div className="text-[11px] text-[#714B67] font-medium">{sub.variantName}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {sub.billingFrequency}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          ₹{sub.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                          {sub.nextBillingDate}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isPaused
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : sub.status === "CONFIRMED"
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
                                  : sub.status === "CONFIRMED"
                                  ? "bg-blue-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isActive && (
                              <button
                                onClick={() => handlePauseResume(sub)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200/60"
                                title="Pause Subscription"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isPaused && (
                              <button
                                onClick={() => handlePauseResume(sub)}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/60"
                                title="Resume Subscription"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {sub.status !== "CLOSED" && (
                              <button
                                onClick={() => handleClose(sub)}
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
                  })
                )}
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
