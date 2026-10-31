"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
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
  X,
  CreditCard,
  ShieldCheck,
  User,
  ArrowRight,
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
  earlyClosureAllowed?: boolean;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubscriptionItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/subscriptions", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      }
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleStatusTransition = async (id: string, action: "PAUSE" | "RESUME" | "CLOSE", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/subscriptions/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      const targetLabel = action === "PAUSE" ? "paused" : action === "RESUME" ? "resumed" : "closed";
      setActionAlert(`Subscription successfully ${targetLabel}.`);
      setTimeout(() => setActionAlert(null), 5000);

      await fetchSubscriptions();

      if (selectedSub && selectedSub.id === id) {
        const targetStatus = action === "PAUSE" ? "PAUSED" : action === "RESUME" ? "ACTIVE" : "CLOSED";
        setSelectedSub((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update subscription status");
    } finally {
      setIsUpdating(false);
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
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="subscriptions" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Subscription Lifecycle Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated recurring agreements, status transitions, and period renewals. Click any row for details.
              </p>
            </div>
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
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
            ) : (
              <p className="text-2xl font-black text-slate-900 font-mono mt-2">
                {subscriptions.length}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">Automated recurring base</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Active Contracts
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
            ) : (
              <p className="text-2xl font-black text-emerald-700 font-mono mt-2">{activeCount}</p>
            )}
            <p className="text-[11px] text-emerald-600 mt-0.5">Generating recurring revenue</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Paused
              </p>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
            ) : (
              <p className="text-2xl font-black text-amber-600 font-mono mt-2">{pausedCount}</p>
            )}
            <p className="text-[11px] text-amber-600 mt-0.5">Billing temporarily held</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed</p>
            {loading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-2" />
            ) : (
              <p className="text-2xl font-black text-slate-600 font-mono mt-2">{closedCount}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">Cancelled / Non-renewed</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by contract #, customer, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {["ALL", "ACTIVE", "PAUSED", "CLOSED"].map((status) => {
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
                    {loading ? "..." : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscriptions Table with Clickable Rows */}
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-5">
                        <div className="h-4 bg-slate-200/80 rounded-md w-28 mb-1.5" />
                        <div className="h-3 bg-slate-100 rounded-md w-16" />
                      </td>
                      <td className="py-4 px-5">
                        <div className="h-4 bg-slate-200/80 rounded-md w-36 mb-1.5" />
                        <div className="h-3 bg-slate-100 rounded-md w-24" />
                      </td>
                      <td className="py-4 px-5">
                        <div className="h-4 bg-slate-200/80 rounded-md w-28 mb-1.5" />
                        <div className="h-3 bg-slate-100 rounded-md w-20" />
                      </td>
                      <td className="py-4 px-5">
                        <div className="h-4 bg-slate-200/80 rounded-md w-20 mb-1.5" />
                        <div className="h-3 bg-slate-100 rounded-md w-14" />
                      </td>
                      <td className="py-4 px-5">
                        <div className="h-4 bg-slate-200/80 rounded-md w-24 mb-1.5" />
                      </td>
                      <td className="py-4 px-5">
                        <div className="h-5 bg-slate-200/80 rounded-full w-16" />
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="h-7 bg-slate-100 rounded-md w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No subscriptions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const isActive = sub.status === "ACTIVE";
                    const isPaused = sub.status === "PAUSED";
                    const isConfirmed = sub.status === "CONFIRMED";

                    return (
                      <tr
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className={`hover:bg-purple-50/20 cursor-pointer transition-colors relative ${
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
                                onClick={(e) => handleStatusTransition(sub.id, "PAUSE", e)}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200/60"
                                title="Pause Subscription"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {sub.status === "PAUSED" && (
                              <button
                                onClick={(e) => handleStatusTransition(sub.id, "RESUME", e)}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/60"
                                title="Resume Subscription"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {sub.status !== "CLOSED" && (
                              <button
                                onClick={(e) => handleStatusTransition(sub.id, "CLOSE", e)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60"
                                title="Close Subscription"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <Link
                              href={`/admin/invoices?sub=${sub.subscriptionNumber}`}
                              onClick={(e) => e.stopPropagation()}
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
              <CheckCircle2 className="w-3.5 h-3.5" /> Direct Database Connected
            </span>
          </div>
        </div>
      </main>

      {/* Subscription Comprehensive Detailed View Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg">{selectedSub.subscriptionNumber}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedSub.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : selectedSub.status === "PAUSED"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {selectedSub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Subscription Contract &amp; Recurrence Ledger</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Profile Section */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                  <User className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Customer Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Subscriber / Entity</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedSub.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Contact Email</span>
                    <span className="font-mono text-slate-800">{selectedSub.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Plan & Pricing Section */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Plan &amp; Billing Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Subscription Plan</span>
                    <span className="font-bold text-slate-900">{selectedSub.planName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Edition / Line Variant</span>
                    <span className="font-semibold text-slate-800">{selectedSub.variantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Recurring Rate</span>
                    <span className="font-mono font-black text-slate-900 text-base">
                      ₹{selectedSub.amount.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Billing Frequency</span>
                    <span className="font-bold text-[#714B67] uppercase">{selectedSub.billingFrequency}</span>
                  </div>
                </div>
              </div>

              {/* Lifecycle & Dates */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Cadence Timelines &amp; Terms</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contract Activation Date</span>
                    <span className="font-mono text-slate-800">{selectedSub.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Next Automatic Renewal</span>
                    <span className="font-mono font-bold text-slate-900">{selectedSub.nextBillingDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer Pause Permitted</span>
                    <span className={`font-semibold ${selectedSub.pauseAllowed ? "text-emerald-700" : "text-rose-600"}`}>
                      {selectedSub.pauseAllowed ? "Yes (Active)" : "No (Blocked by Terms)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Early Closure Permitted</span>
                    <span className="font-semibold text-slate-700">
                      {selectedSub.earlyClosureAllowed !== false ? "Yes" : "Subject to Fee"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {selectedSub.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleStatusTransition(selectedSub.id, "PAUSE")}
                    className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs"
                  >
                    <Pause className="w-3.5 h-3.5 mr-1" />
                    Pause Agreement
                  </Button>
                )}
                {selectedSub.status === "PAUSED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleStatusTransition(selectedSub.id, "RESUME")}
                    className="border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold text-xs"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Resume Agreement
                  </Button>
                )}
                {selectedSub.status !== "CLOSED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleStatusTransition(selectedSub.id, "CLOSE")}
                    className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Terminate Contract
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/admin/invoices?sub=${selectedSub.subscriptionNumber}`}>
                  <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs">
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Invoicing History
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
