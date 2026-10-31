"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    customerName: "Zenith Financials",
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
            setActionAlert(`Subscription ${sub.subscriptionNumber} paused successfully. Next billing suspended.`);
            return { ...sub, status: "PAUSED" as const };
          } else if (sub.status === "PAUSED") {
            setActionAlert(`Subscription ${sub.subscriptionNumber} resumed. Next billing active.`);
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Subscription Lifecycle Management
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Automated recurring agreements, status transitions, and period renewals.
            </p>
          </div>

          <Link href="/admin/subscriptions/new">
            <Button className="bg-[#714B67] hover:bg-[#5C3C54] text-white gap-2 font-bold shadow-md">
              <Plus className="w-4 h-4" />
              New Subscription
            </Button>
          </Link>
        </div>

        {/* Action Alert */}
        {actionAlert && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{actionAlert}</span>
            </div>
            <button
              onClick={() => setActionAlert(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Subscriptions</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{subscriptions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Active</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-xs">
            <p className="text-xs font-semibold text-amber-600 uppercase">Paused</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{pausedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-xs">
            <p className="text-xs font-semibold text-rose-600 uppercase">Closed</p>
            <p className="text-2xl font-black text-rose-700 mt-1">{closedCount}</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subscription #, customer, email, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "ACTIVE", "PAUSED", "CONFIRMED", "CLOSED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === status
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Subscription</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Plan & Variant</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Next Billing</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{sub.customerName}</div>
                      <div className="text-xs text-slate-400">{sub.customerEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{sub.planName}</div>
                      <div className="text-xs text-slate-500">{sub.variantName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">
                        ₹{sub.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        {sub.billingFrequency}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      {sub.nextBillingDate}
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          sub.status === "ACTIVE"
                            ? "success"
                            : sub.status === "PAUSED"
                            ? "warning"
                            : sub.status === "CONFIRMED"
                            ? "info"
                            : "outline"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.status === "ACTIVE" && (
                          <button
                            onClick={() => handlePauseResume(sub.id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Pause Subscription"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {sub.status === "PAUSED" && (
                          <button
                            onClick={() => handlePauseResume(sub.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Resume Subscription"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {sub.status !== "CLOSED" && (
                          <button
                            onClick={() => handleClose(sub.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Close Subscription"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/admin/invoices?sub=${sub.subscriptionNumber}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Invoices"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
