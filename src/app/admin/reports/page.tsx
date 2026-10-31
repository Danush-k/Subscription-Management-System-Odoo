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
  Layers,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Sparkles,
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
    { month: "Jun 2026", shortMonth: "Jun", invoiced: 180000, collected: 175000, growth: "+12.4%" },
    { month: "Jul 2026", shortMonth: "Jul", invoiced: 210000, collected: 205000, growth: "+16.7%" },
    { month: "Aug 2026", shortMonth: "Aug", invoiced: 235000, collected: 220000, growth: "+11.9%" },
    { month: "Sep 2026", shortMonth: "Sep", invoiced: 245000, collected: 240000, growth: "+4.3%" },
    { month: "Oct 2026", shortMonth: "Oct", invoiced: 268000, collected: 252000, growth: "+9.4%" },
  ];

  const [hoveredMonthIndex, setHoveredMonthIndex] = React.useState<number | null>(4);
  const [activeSegment, setActiveSegment] = React.useState<"all" | "collected" | "invoiced" | "pending">("all");
  const [chartView, setChartView] = React.useState<"grouped" | "stacked" | "trend">("grouped");

  const activeMonth = hoveredMonthIndex !== null ? monthlyTrend[hoveredMonthIndex] : monthlyTrend[monthlyTrend.length - 1];
  const activeRate = ((activeMonth.collected / activeMonth.invoiced) * 100).toFixed(1);
  const activePending = activeMonth.invoiced - activeMonth.collected;

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

        {/* State-of-the-Art Executive Financial Analytics Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          {/* Header & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#714B67] to-[#8E5D82] text-white flex items-center justify-center shadow-xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight text-slate-900">
                      Monthly Invoiced vs. Collected Cash Flow
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {overallRealizationRate}% Realized
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Accrual billings vs. liquid cash collected across continuous SaaS subscription cycles.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Switcher: Grouped vs Stacked vs Trend */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setChartView("grouped")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    chartView === "grouped"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#714B67]" />
                  Dual Columns
                </button>
                <button
                  type="button"
                  onClick={() => setChartView("stacked")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    chartView === "stacked"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Stacked
                </button>
                <button
                  type="button"
                  onClick={() => setChartView("trend")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    chartView === "trend"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Trend Curve
                </button>
              </div>

              {/* Stream Filter Toggle */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveSegment("all")}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSegment === "all"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSegment("invoiced")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSegment === "invoiced"
                      ? "bg-[#714B67] text-white shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E5D82]" />
                  Invoiced
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSegment("collected")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSegment === "collected"
                      ? "bg-emerald-600 text-white shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  Collected
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSegment("pending")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSegment === "pending"
                      ? "bg-amber-500 text-white shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                  Receivables
                </button>
              </div>
            </div>
          </div>

          {/* Inspection Spotlight Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 via-slate-50/50 to-purple-50/20 border border-slate-200/80 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Selected Month
              </div>
              <p className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{activeMonth.month}</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  {activeMonth.growth} MoM
                </span>
              </p>
              <p className="text-[11px] text-slate-500">FY 2026-27 SaaS Billing Cycle</p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#714B67] uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#714B67]" />
                Invoiced (Accrual)
              </div>
              <p className="text-xl font-black font-mono text-slate-900">
                ₹{activeMonth.invoiced.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500">Gross contractual value</p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Collected Cash ({activeRate}%)
              </div>
              <p className="text-xl font-black font-mono text-emerald-600">
                ₹{activeMonth.collected.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Bank settled
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pending Receivables
              </div>
              <p className="text-xl font-black font-mono text-amber-700">
                ₹{activePending.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-amber-700/80 font-medium">
                {((activePending / activeMonth.invoiced) * 100).toFixed(1)}% uncollected
              </p>
            </div>
          </div>

          {/* MAIN GRAPH CANVAS */}
          <div className="pt-2">
            <div className="flex h-80 w-full">
              {/* Y-Axis Value Labels */}
              <div className="w-16 sm:w-20 pr-3 sm:pr-4 flex flex-col justify-between text-[11px] font-mono font-semibold text-slate-400 select-none pb-9 pt-2 text-right">
                <span>₹300k</span>
                <span>₹225k</span>
                <span>₹150k</span>
                <span>₹75k</span>
                <span>₹0</span>
              </div>

              {/* Chart Plot Area */}
              <div className="flex-1 flex flex-col relative">
                {/* Horizontal Dashed Coordinate Gridlines */}
                <div className="absolute inset-0 pb-9 pt-2 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-b border-dashed border-slate-200/80" />
                  <div className="w-full border-b border-dashed border-slate-200/80" />
                  <div className="w-full border-b border-dashed border-slate-200/80" />
                  <div className="w-full border-b border-dashed border-slate-200/80" />
                  <div className="w-full border-b border-slate-300" />
                </div>

                {/* VIEW 1 & 2: Vertical Columns (Grouped or Stacked) */}
                {chartView !== "trend" && (
                  <div className="relative z-10 grid grid-cols-5 h-full pb-9 pt-2">
                    {monthlyTrend.map((m, idx) => {
                      const isHovered = hoveredMonthIndex === idx;
                      const pending = m.invoiced - m.collected;
                      const rate = ((m.collected / m.invoiced) * 100).toFixed(1);
                      const maxScale = 300000;
                      const invoicedPct = Math.min(100, (m.invoiced / maxScale) * 100);
                      const collectedPct = Math.min(100, (m.collected / maxScale) * 100);

                      return (
                        <div
                          key={m.month}
                          onMouseEnter={() => setHoveredMonthIndex(idx)}
                          className="relative flex flex-col justify-end items-center h-full group cursor-pointer px-1 sm:px-2"
                        >
                          {/* Spotlight Column Backdrop */}
                          <div
                            className={`absolute inset-x-1 sm:inset-x-2 inset-y-0 rounded-2xl transition-all duration-200 pointer-events-none ${
                              isHovered
                                ? "bg-slate-100/80 ring-1 ring-slate-300/80 shadow-2xs"
                                : "group-hover:bg-slate-50/60"
                            }`}
                          />

                          {/* Hover Floating Pill on Top of Column */}
                          {isHovered && (
                            <div className="absolute -top-7 z-30 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold shadow-md animate-fadeIn whitespace-nowrap">
                              ₹{(m.invoiced / 1000).toFixed(0)}k • {rate}%
                            </div>
                          )}

                          {chartView === "grouped" ? (
                            /* GROUPED DUAL COLUMNS: Invoiced (Plum) vs Collected (Emerald) */
                            <div className="relative z-10 w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-0.5">
                              {/* Invoiced Bar */}
                              <div
                                style={{ height: `${invoicedPct}%` }}
                                className={`w-3.5 sm:w-6 rounded-t-md transition-all duration-300 relative group/bar ${
                                  activeSegment === "collected" || activeSegment === "pending"
                                    ? "opacity-20"
                                    : isHovered
                                    ? "bg-gradient-to-t from-[#5C3C54] to-[#8E5D82] shadow-sm scale-102"
                                    : "bg-gradient-to-t from-[#714B67] to-[#8E5D82]"
                                }`}
                              >
                                {isHovered && (
                                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[#714B67] hidden sm:block">
                                    ₹{(m.invoiced / 1000).toFixed(0)}k
                                  </div>
                                )}
                              </div>

                              {/* Collected Bar */}
                              <div
                                style={{ height: `${collectedPct}%` }}
                                className={`w-3.5 sm:w-6 rounded-t-md transition-all duration-300 relative group/bar ${
                                  activeSegment === "invoiced"
                                    ? "opacity-20"
                                    : isHovered
                                    ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm scale-102"
                                    : "bg-gradient-to-t from-emerald-600 to-emerald-500"
                                }`}
                              >
                                {isHovered && (
                                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-emerald-600 hidden sm:block">
                                    ₹{(m.collected / 1000).toFixed(0)}k
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* STACKED WATERFALL COLUMN: Collected (bottom) + Pending (top) */
                            <div className="relative z-10 w-full flex items-end justify-center h-full pb-0.5">
                              <div
                                style={{ height: `${invoicedPct}%` }}
                                className={`w-6 sm:w-11 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 shadow-2xs ${
                                  isHovered ? "ring-2 ring-slate-900/10 scale-102" : ""
                                }`}
                              >
                                {/* Pending Segment (Top Cap) */}
                                <div
                                  style={{ height: `${(pending / m.invoiced) * 100}%` }}
                                  className={`w-full transition-all duration-300 ${
                                    activeSegment === "collected"
                                      ? "opacity-25"
                                      : isHovered
                                      ? "bg-gradient-to-t from-amber-400 to-amber-300"
                                      : "bg-amber-400"
                                  }`}
                                  title={`Pending: ₹${pending.toLocaleString("en-IN")}`}
                                />

                                {/* Collected Segment (Base) */}
                                <div
                                  style={{ height: `${(m.collected / m.invoiced) * 100}%` }}
                                  className={`w-full transition-all duration-300 flex items-center justify-center text-[10px] font-mono font-bold text-white ${
                                    activeSegment === "pending"
                                      ? "opacity-25"
                                      : isHovered
                                      ? "bg-gradient-to-t from-[#5C3C54] to-[#714B67]"
                                      : "bg-[#714B67]"
                                  }`}
                                  title={`Collected: ₹${m.collected.toLocaleString("en-IN")}`}
                                >
                                  {invoicedPct > 30 && (
                                    <span className="hidden sm:inline">
                                      ₹{(m.collected / 1000).toFixed(0)}k
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* VIEW 3: Smooth Spline Trend Velocity Curves */}
                {chartView === "trend" && (
                  <div className="relative z-10 w-full h-full pb-9 pt-2">
                    <svg
                      viewBox="0 0 500 220"
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="invoicedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#714B67" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#714B67" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Invoiced Area & Line */}
                      {activeSegment !== "collected" && activeSegment !== "pending" && (
                        <>
                          <path
                            d="M 50 100 Q 150 82, 250 68 T 450 42 L 450 220 L 50 220 Z"
                            fill="url(#invoicedGradient)"
                          />
                          <path
                            d="M 50 100 Q 150 82, 250 68 T 450 42"
                            fill="none"
                            stroke="#714B67"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </>
                      )}

                      {/* Collected Area & Line */}
                      {activeSegment !== "invoiced" && activeSegment !== "pending" && (
                        <>
                          <path
                            d="M 50 104 Q 150 85, 250 78 T 450 54 L 450 220 L 50 220 Z"
                            fill="url(#collectedGradient)"
                          />
                          <path
                            d="M 50 104 Q 150 85, 250 78 T 450 54"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </>
                      )}

                      {/* Data Point Nodes */}
                      {[
                        { x: 50, invY: 100, colY: 104, idx: 0 },
                        { x: 150, invY: 82, colY: 85, idx: 1 },
                        { x: 250, invY: 68, colY: 78, idx: 2 },
                        { x: 350, invY: 58, colY: 65, idx: 3 },
                        { x: 450, invY: 42, colY: 54, idx: 4 },
                      ].map((pt) => {
                        const isHovered = hoveredMonthIndex === pt.idx;
                        return (
                          <g
                            key={pt.idx}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredMonthIndex(pt.idx)}
                          >
                            {/* Hover Vertical Guide Line */}
                            {isHovered && (
                              <line
                                x1={pt.x}
                                y1="0"
                                x2={pt.x}
                                y2="220"
                                stroke="#94A3B8"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                              />
                            )}
                            {/* Invoiced Node */}
                            <circle
                              cx={pt.x}
                              cy={pt.invY}
                              r={isHovered ? "6" : "4"}
                              fill="#FFFFFF"
                              stroke="#714B67"
                              strokeWidth="3"
                              className="transition-all"
                            />
                            {/* Collected Node */}
                            <circle
                              cx={pt.x}
                              cy={pt.colY}
                              r={isHovered ? "6.5" : "4.5"}
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="2.5"
                              className="transition-all shadow-sm"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}

                {/* X-Axis Month Markers */}
                <div className="grid grid-cols-5 border-t border-slate-200 pt-2.5">
                  {monthlyTrend.map((m, idx) => {
                    const isHovered = hoveredMonthIndex === idx;
                    const rate = ((m.collected / m.invoiced) * 100).toFixed(1);
                    return (
                      <div
                        key={m.month}
                        onClick={() => setHoveredMonthIndex(idx)}
                        onMouseEnter={() => setHoveredMonthIndex(idx)}
                        className={`text-center cursor-pointer transition-all ${
                          isHovered ? "scale-105" : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        <p
                          className={`text-xs font-black transition-colors ${
                            isHovered ? "text-[#714B67]" : "text-slate-800"
                          }`}
                        >
                          {m.shortMonth}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold hidden sm:block">
                          2026
                        </p>
                        <span
                          className={`inline-block text-[9.5px] font-black px-1.5 py-0.2 rounded-full mt-0.5 border ${
                            Number(rate) >= 97
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {rate}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Legend & Strategic Benchmark Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => setActiveSegment(activeSegment === "invoiced" ? "all" : "invoiced")}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-[#714B67] to-[#8E5D82] group-hover:scale-110 transition-transform shadow-2xs" />
                <span className="text-slate-700 font-semibold group-hover:text-[#714B67] transition-colors">
                  Invoiced Billing (Gross Accrual)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment(activeSegment === "collected" ? "all" : "collected")}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-3.5 h-3.5 rounded-md bg-gradient-to-br from-emerald-600 to-emerald-400 group-hover:scale-110 transition-transform shadow-2xs" />
                <span className="text-slate-700 font-semibold group-hover:text-emerald-700 transition-colors">
                  Collected Cash (Liquid Realized)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment(activeSegment === "pending" ? "all" : "pending")}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-3.5 h-3.5 rounded-md bg-amber-400 group-hover:scale-110 transition-transform shadow-2xs" />
                <span className="text-slate-700 font-semibold group-hover:text-amber-700 transition-colors">
                  Pending Receivables (Accrued)
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Peak Realization: <strong className="text-slate-900">98.0% (Sep 2026)</strong> • 5-Mo Realized:{" "}
                <strong className="text-emerald-700">₹{(totalPeriodCollected / 100000).toFixed(2)}L</strong>
              </span>
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
