"use client";

import React from "react";
import {
  RotateCcw,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  PauseCircle,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";
import { MetricSummary } from "./types";

interface CustomerOverviewCardsProps {
  metrics: MetricSummary;
  onSelectTab: (tab: "overview" | "subscriptions" | "invoices" | "payments" | "billing") => void;
  onPayBalance: () => void;
}

export function CustomerOverviewCards({
  metrics,
  onSelectTab,
  onPayBalance,
}: CustomerOverviewCardsProps) {
  const upcomingDateFormatted = metrics.upcomingRenewal
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(metrics.upcomingRenewal.date))
    : null;

  return (
    <div className="summary-grid">
      {/* 1. Active Subscriptions */}
      <div
        onClick={() => onSelectTab("subscriptions")}
        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-[#714B67]/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Subscriptions
          </span>
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 group-hover:scale-105 transition-transform">
            <RotateCcw className="w-4 h-4 text-[#714B67]" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-slate-900">
            {metrics.activeSubscriptions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>{metrics.pausedSubscriptions} paused</span>
            <span>•</span>
            <span>{metrics.totalSubscriptions} total</span>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Renewals */}
      <div
        onClick={() => onSelectTab("subscriptions")}
        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-[#714B67]/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Next Renewal
          </span>
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-4 h-4 text-[#714B67]" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xl font-black text-[#714B67] truncate">
            {upcomingDateFormatted || "None Scheduled"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate font-medium">
            {metrics.upcomingRenewal?.planName || "No active renewal"}
          </div>
        </div>
      </div>

      {/* 3. Recurring Commitment (MRR / ARR) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Monthly Run-Rate (MRR)
          </span>
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
            <TrendingUp className="w-4 h-4 text-[#714B67]" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-slate-900">
            ₹{metrics.mrr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            <span className="text-xs font-semibold text-slate-400">/mo</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            ARR: ₹{metrics.arr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/yr
          </div>
        </div>
      </div>

      {/* 4. Outstanding Balance */}
      <div
        onClick={metrics.outstandingBalance > 0 ? onPayBalance : () => onSelectTab("invoices")}
        className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between ${
          metrics.outstandingBalance > 0
            ? "border-[#714B67]/20 bg-[#714B67]/5 hover:border-amber-300"
            : "border-slate-200/90 hover:border-[#714B67]/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Outstanding Due
          </span>
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 group-hover:scale-105 transition-transform">
            <CreditCard className="w-4 h-4 text-[#714B67]" />
          </div>
        </div>
        <div className="mt-4">
          <div
            className={`text-2xl font-black ${
              metrics.outstandingBalance > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            ₹{metrics.outstandingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            {metrics.outstandingBalance > 0 ? (
              <span className="text-amber-700 font-semibold group-hover:underline">
                Pay invoice balance &rarr;
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#714B67]" /> All settled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Paused Subscriptions */}
      <div
        onClick={() => onSelectTab("subscriptions")}
        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-[#714B67]/40 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Paused Services
          </span>
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 group-hover:scale-105 transition-transform">
            <PauseCircle className="w-4 h-4 text-[#714B67]" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-black text-slate-900">
            {metrics.pausedSubscriptions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {metrics.pausedSubscriptions > 0 ? "Instant resume" : "Zero paused"}
          </div>
        </div>
      </div>

      {/* 6. Overdue Invoices */}
      <div
        onClick={() => onSelectTab("invoices")}
        className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between ${
          metrics.overdueInvoices > 0
            ? "border-[#714B67]/20 bg-[#714B67]/5 hover:border-rose-300"
            : "border-slate-200/90 hover:border-[#714B67]/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Overdue Invoices
          </span>
          <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 group-hover:scale-105 transition-transform">
            <AlertOctagon className="w-4 h-4 text-[#714B67]" />
          </div>
        </div>
        <div className="mt-4">
          <div
            className={`text-2xl font-black ${
              metrics.overdueInvoices > 0 ? "text-rose-700" : "text-slate-900"
            }`}
          >
            {metrics.overdueInvoices}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {metrics.overdueInvoices > 0 ? (
              <span className="text-rose-600 font-semibold">Action needed</span>
            ) : (
              "No overdue accounts"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
