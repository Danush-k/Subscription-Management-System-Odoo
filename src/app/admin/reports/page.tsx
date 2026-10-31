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
  CreditCard,
  FileText,
  RotateCcw,
  ShieldCheck,
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

  const [hoveredMonthIndex, setHoveredMonthIndex] = React.useState<number | null>(4);
  const [activeSegment, setActiveSegment] = React.useState<"all" | "collected" | "pending">("all");

  const activeMonth = hoveredMonthIndex !== null ? monthlyTrend[hoveredMonthIndex] : monthlyTrend[monthlyTrend.length - 1];
  const activeRate = ((activeMonth.collected / activeMonth.invoiced) * 100).toFixed(1);
  const activePending = activeMonth.invoiced - activeMonth.collected;

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

        {/* Enhanced Interactive Monthly Invoiced vs. Collected Cash Flow Graph */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Monthly Invoiced vs. Collected Cash Flow
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#714B67]/10 text-[#714B67]">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Hover over any month to inspect collection rates, realized cash, and receivables balance.
              </p>
            </div>

            {/* Quick Segment Filter Pill Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveSegment("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeSegment === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Streams
              </button>
              <button
                onClick={() => setActiveSegment("collected")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeSegment === "collected"
                    ? "bg-[#714B67] text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#8A4E7A]" />
                Collected
              </button>
              <button
                onClick={() => setActiveSegment("pending")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeSegment === "pending"
                    ? "bg-amber-500 text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-300" />
                Receivables
              </button>
            </div>
          </div>

          {/* Interactive Inspection Callout Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 transition-all">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Inspecting Period
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span>{activeMonth.month}</span>
                <span className="text-[10px] font-semibold text-slate-500">(FY 2026-27)</span>
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Invoiced
              </p>
              <p className="text-sm font-black font-mono text-slate-900 mt-0.5">
                ₹{activeMonth.invoiced.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#714B67] uppercase tracking-wider">
                Collected Cash ({activeRate}%)
              </p>
              <p className="text-sm font-black font-mono text-[#714B67] mt-0.5">
                ₹{activeMonth.collected.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Pending Receivables
              </p>
              <p className="text-sm font-black font-mono text-amber-700 mt-0.5">
                ₹{activePending.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Interactive Stacked Horizontal Chart */}
          <div className="space-y-4 pt-1">
            {monthlyTrend.map((m, idx) => {
              const isHovered = hoveredMonthIndex === idx;
              const pending = m.invoiced - m.collected;
              const rate = ((m.collected / m.invoiced) * 100).toFixed(1);
              const maxScale = 300000;
              const collectedPct = (m.collected / maxScale) * 100;
              const pendingPct = (pending / maxScale) * 100;

              return (
                <div
                  key={m.month}
                  onMouseEnter={() => setHoveredMonthIndex(idx)}
                  className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isHovered
                      ? "bg-slate-50 border border-slate-200 shadow-xs translate-x-1"
                      : "hover:bg-slate-50/60 border border-transparent"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isHovered ? "text-[#714B67]" : "text-slate-800"}`}>
                        {m.month}
                      </span>
                      {isHovered && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fadeIn">
                          {rate}% Realized
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                      <span>
                        Invoiced: <strong className="text-slate-800">₹{m.invoiced.toLocaleString("en-IN")}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Collected: <strong className="text-[#714B67]">₹{m.collected.toLocaleString("en-IN")}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Pending: <strong className="text-amber-600">₹{pending.toLocaleString("en-IN")}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Dual Segment Stacked Progress Track */}
                  <div className="h-6 bg-slate-100 rounded-xl overflow-hidden flex relative p-0.5 border border-slate-200/70 shadow-2xs">
                    {/* Collected Cash Segment */}
                    <div
                      className={`h-full rounded-l-lg transition-all duration-300 flex items-center justify-end pr-2 text-[10px] font-bold text-white ${
                        activeSegment === "pending"
                          ? "opacity-25"
                          : isHovered
                          ? "bg-gradient-to-r from-[#5C3C54] via-[#714B67] to-[#8A4E7A] shadow-inner"
                          : "bg-[#714B67]"
                      }`}
                      style={{ width: `${collectedPct}%` }}
                      title={`Collected: ₹${m.collected.toLocaleString("en-IN")} (${rate}%)`}
                    >
                      {collectedPct > 25 && <span>₹{m.collected.toLocaleString("en-IN")}</span>}
                    </div>

                    {/* Pending Receivables Segment */}
                    <div
                      className={`h-full rounded-r-lg transition-all duration-300 flex items-center justify-start pl-2 text-[10px] font-bold text-slate-900 ${
                        activeSegment === "collected"
                          ? "opacity-25"
                          : isHovered
                          ? "bg-gradient-to-r from-amber-400 to-amber-300 shadow-inner"
                          : "bg-amber-400/80"
                      }`}
                      style={{ width: `${pendingPct}%` }}
                      title={`Pending: ₹${pending.toLocaleString("en-IN")}`}
                    >
                      {pendingPct > 8 && <span>₹{pending.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend and Axis Benchmarks */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-6">
              <div
                onClick={() => setActiveSegment(activeSegment === "collected" ? "all" : "collected")}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-3.5 h-3.5 rounded-md bg-[#714B67] group-hover:scale-110 transition-transform shadow-2xs" />
                <span className="text-slate-700 font-semibold group-hover:text-[#714B67] transition-colors">
                  Collected Cash (Realized)
                </span>
              </div>
              <div
                onClick={() => setActiveSegment(activeSegment === "pending" ? "all" : "pending")}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-3.5 h-3.5 rounded-md bg-amber-400 group-hover:scale-110 transition-transform shadow-2xs" />
                <span className="text-slate-700 font-semibold group-hover:text-amber-700 transition-colors">
                  Pending Receivables (Accrued)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              Scale Baseline: ₹3,00,000 / month Max Capacity
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
