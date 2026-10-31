"use client";

import React from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import {
  BarChart3,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function ReportsPage() {
  const financialMetrics = {
    invoicedRevenue: 1668000,
    collectedRevenue: 1485600,
    outstandingReceivables: 182400,
    mrr: 248000,
    arr: 2976000,
    collectionRate: 89.1,
    activeSubscribers: 29,
    churnRate: 1.2,
    cgstLiability: 113305,
    sgstLiability: 113305,
  };

  const monthlyTrend = [
    { month: "Jun 2026", invoiced: 180000, collected: 175000 },
    { month: "Jul 2026", invoiced: 210000, collected: 205000 },
    { month: "Aug 2026", invoiced: 235000, collected: 220000 },
    { month: "Sep 2026", invoiced: 245000, collected: 240000 },
    { month: "Oct 2026", invoiced: 268000, collected: 252000 },
  ];

  const [hoveredMonthIndex, setHoveredMonthIndex] = React.useState<number | null>(null);

  const totalPeriodInvoiced = monthlyTrend.reduce((acc, m) => acc + m.invoiced, 0);
  const totalPeriodCollected = monthlyTrend.reduce((acc, m) => acc + m.collected, 0);
  const totalPeriodPending = totalPeriodInvoiced - totalPeriodCollected;
  const overallRealizationRate = ((totalPeriodCollected / totalPeriodInvoiced) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        <div>
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="analytics" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Financial Analytics &amp; Revenue Intelligence
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Separation of Invoiced vs Collected revenue, recurring run rates, and GST compliance liability.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Key Revenue Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Monthly RR (MRR)</p>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">
              ₹{(financialMetrics.mrr / 1000).toFixed(0)}k
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2% MoM
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Annual RR (ARR)</p>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">
              ₹{(financialMetrics.arr / 100000).toFixed(1)}L
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Projected run-rate</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Invoiced (Accrual)</p>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">
              ₹{(financialMetrics.invoicedRevenue / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Gross billing total</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-2xs hover:shadow-xs transition-shadow">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase">Collected (Cash)</p>
            <p className="text-xl font-black text-emerald-700 font-mono mt-1">
              ₹{(financialMetrics.collectedRevenue / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              {financialMetrics.collectionRate}% efficiency
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-2xs hover:shadow-xs transition-shadow">
            <p className="text-[11px] font-semibold text-amber-600 uppercase">Receivables</p>
            <p className="text-xl font-black text-amber-700 font-mono mt-1">
              ₹{(financialMetrics.outstandingReceivables / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Pending collection</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Net Churn</p>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">{financialMetrics.churnRate}%</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">Industry benchmark &lt;3%</p>
          </div>
        </div>

        {/* Compact & Executive Monthly Invoiced vs. Collected Cash Flow */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          {/* Header & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#714B67]" />
                <h2 className="text-sm font-bold text-slate-900">
                  Monthly Invoiced vs. Collected Cash Flow
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {overallRealizationRate}% Realized
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Accrual billing volume and liquid cash realization across subscription cycles.
              </p>
            </div>

            {/* Compact Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#714B67]" />
                <span>Collected Cash</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Pending Receivables</span>
              </div>
            </div>
          </div>

          {/* Compact Monthly Cash Flow Bars */}
          <div className="space-y-1.5">
            {monthlyTrend.map((m, idx) => {
              const pending = m.invoiced - m.collected;
              const rate = ((m.collected / m.invoiced) * 100).toFixed(1);
              const maxScale = 300000;
              const barTotalPct = (m.invoiced / maxScale) * 100;
              const collectedPct = (m.collected / m.invoiced) * 100;
              const pendingPct = (pending / m.invoiced) * 100;
              const isHovered = hoveredMonthIndex === idx;

              return (
                <div
                  key={m.month}
                  onMouseEnter={() => setHoveredMonthIndex(idx)}
                  onMouseLeave={() => setHoveredMonthIndex(null)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl transition-all relative ${
                    isHovered
                      ? "bg-purple-50/50 ring-1 ring-[#714B67]/20 shadow-xs"
                      : "hover:bg-slate-50/70"
                  }`}
                >
                  {/* Floating Rich Hover Tooltip with Pending Info */}
                  {isHovered && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white text-[11px] px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-3 whitespace-nowrap pointer-events-none border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#714B67]" />
                        <span>
                          Collected: <strong className="font-mono text-slate-100">₹{m.collected.toLocaleString("en-IN")}</strong> ({rate}%)
                        </span>
                      </div>
                      <span className="text-slate-600">|</span>
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>
                          Pending: <strong className="font-mono text-amber-200">₹{pending.toLocaleString("en-IN")}</strong> ({pendingPct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
                    </div>
                  )}

                  {/* Month Label */}
                  <div className="w-20 shrink-0 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{m.month}</span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div
                    className="flex-1 mx-0 sm:mx-3 h-2.5 bg-slate-100 rounded-full overflow-hidden flex relative cursor-pointer"
                  >
                    <div
                      className="h-full rounded-full overflow-hidden flex transition-all duration-300"
                      style={{ width: `${barTotalPct}%` }}
                    >
                      {/* Collected Segment */}
                      <div
                        className="h-full bg-[#714B67] hover:brightness-110 transition-all"
                        style={{ width: `${collectedPct}%` }}
                        title={`Collected: ₹${m.collected.toLocaleString("en-IN")} (${rate}%)`}
                      />
                      {/* Pending Segment */}
                      <div
                        className="h-full bg-amber-400 hover:brightness-110 transition-all"
                        style={{ width: `${pendingPct}%` }}
                        title={`Pending: ₹${pending.toLocaleString("en-IN")} (${pendingPct.toFixed(1)}%)`}
                      />
                    </div>
                  </div>

                  {/* Tabular Amounts, Pending Highlight on Hover & Realized Pill */}
                  <div className="flex items-center gap-2.5 shrink-0 text-xs font-mono">
                    {/* Inline Pending Badge on Hover */}
                    {isHovered && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-in fade-in duration-150 font-sans shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending: ₹{pending.toLocaleString("en-IN")} ({pendingPct.toFixed(1)}%)
                      </span>
                    )}

                    <span className="text-slate-600">
                      ₹{(m.collected / 100000).toFixed(2)}L
                      <span className="text-slate-400 font-sans text-[11px]">
                        {" "}/ ₹{(m.invoiced / 100000).toFixed(2)}L
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans border ${
                        Number(rate) >= 97
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {rate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Strategic Summary Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-3">
              <span>
                Total Realized:{" "}
                <strong className="text-slate-900 font-mono">
                  ₹{(totalPeriodCollected / 100000).toFixed(2)}L
                </strong>
              </span>
              <span>•</span>
              <span>
                Pending AR:{" "}
                <strong className="text-amber-700 font-mono">
                  ₹{(totalPeriodPending / 1000).toFixed(0)}k
                </strong>
              </span>
            </div>
            <div className="text-slate-400">
              Peak Realization: <strong className="text-slate-700">Sep 2026 (98.0%)</strong>
            </div>
          </div>
        </div>

        {/* Tax Compliance & GST Filing Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#714B67]" />
            GST Tax Compliance Ledger (GSTR-1 Summary)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Intrastate CGST (9%)</div>
              <div className="text-2xl font-mono font-black text-slate-900">
                ₹{financialMetrics.cgstLiability.toLocaleString("en-IN")}
              </div>
              <p className="text-slate-500">Credited to Central Tax Electronic Ledger</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Intrastate SGST (9%)</div>
              <div className="text-2xl font-mono font-black text-slate-900">
                ₹{financialMetrics.sgstLiability.toLocaleString("en-IN")}
              </div>
              <p className="text-slate-500">Credited to State Tax (Tamil Nadu) Ledger</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
