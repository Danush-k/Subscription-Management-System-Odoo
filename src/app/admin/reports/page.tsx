"use client";

import React from "react";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import {
  BarChart3,
  TrendingUp,
  Percent,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { downloadFinancialReportPdf } from "@/lib/reports/generateReportPdf";

interface FinancialMetrics {
  invoicedRevenue: number;
  collectedRevenue: number;
  outstandingReceivables: number;
  mrr: number;
  arr: number;
  collectionRate: number;
  activeSubscribers: number;
  churnRate: number;
  cgstLiability: number;
  sgstLiability: number;
}

interface MonthlyTrendItem {
  month: string;
  invoiced: number;
  collected: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [financialMetrics, setFinancialMetrics] = React.useState<FinancialMetrics | null>(null);
  const [monthlyTrend, setMonthlyTrend] = React.useState<MonthlyTrendItem[]>([]);
  const [hoveredMonthIndex, setHoveredMonthIndex] = React.useState<number | null>(null);
  const [monthFilter, setMonthFilter] = React.useState<"active" | "all">("active");

  const fetchReports = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/reports");
      if (!res.ok) {
        throw new Error(`Failed to fetch report metrics (${res.status})`);
      }
      const data = await res.json();
      setFinancialMetrics(data.financialMetrics || null);
      setMonthlyTrend(data.monthlyTrend || []);
    } catch (err: unknown) {
      console.error("[Reports Fetch Error]", err);
      setError(err instanceof Error ? err.message : "Unable to load financial reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Derived calculations
  const totalPeriodInvoiced = React.useMemo(() => {
    return monthlyTrend.reduce((acc, m) => acc + m.invoiced, 0);
  }, [monthlyTrend]);

  const totalPeriodCollected = React.useMemo(() => {
    return monthlyTrend.reduce((acc, m) => acc + m.collected, 0);
  }, [monthlyTrend]);

  const totalPeriodPending = React.useMemo(() => {
    return Math.max(0, totalPeriodInvoiced - totalPeriodCollected);
  }, [totalPeriodInvoiced, totalPeriodCollected]);

  const overallRealizationRate = React.useMemo(() => {
    return totalPeriodInvoiced > 0
      ? ((totalPeriodCollected / totalPeriodInvoiced) * 100).toFixed(1)
      : "100.0";
  }, [totalPeriodInvoiced, totalPeriodCollected]);

  // Filtered display list for the horizontal bar chart
  const activeMonths = React.useMemo(() => {
    return monthlyTrend.filter((m) => m.invoiced > 0 || m.collected > 0);
  }, [monthlyTrend]);

  const displayMonths = React.useMemo(() => {
    if (monthFilter === "all") {
      return monthlyTrend;
    }
    return activeMonths.length > 0 ? activeMonths : monthlyTrend.slice(-6);
  }, [monthFilter, activeMonths, monthlyTrend]);

  const maxScale = React.useMemo(() => {
    const highest = Math.max(...displayMonths.map((m) => m.invoiced), 1);
    return highest;
  }, [displayMonths]);

  const peakMonth = React.useMemo(() => {
    const valid = monthlyTrend.filter((m) => m.invoiced > 0);
    if (valid.length === 0) return null;
    return valid.reduce((prev, curr) => {
      const prevRate = (prev.collected / prev.invoiced) * 100;
      const currRate = (curr.collected / curr.invoiced) * 100;
      return currRate > prevRate ? curr : prev;
    });
  }, [monthlyTrend]);

  const handleDownloadPdf = () => {
    if (!financialMetrics) return;
    downloadFinancialReportPdf({
      financialMetrics,
      monthlyTrend: displayMonths,
      generatedAt: new Date(),
      generatedBy: "Danush Kalyan (Administrator)",
      periodLabel: `Calendar Year ${new Date().getFullYear()}`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        {/* Top Header & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
              className="text-xs border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 h-9 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={handleDownloadPdf}
              disabled={loading || !financialMetrics}
              className="bg-[#714B67] hover:bg-[#5D3D55] text-white text-xs font-semibold flex items-center gap-2 h-9 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Report (PDF)</span>
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              className="text-xs border-red-200 hover:bg-red-100 text-red-800"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !financialMetrics ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 h-24 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-6 bg-slate-100 rounded w-1/2" />
                  <div className="h-2 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-64" />
            <div className="bg-white p-6 rounded-2xl border border-slate-200 h-40" />
          </div>
        ) : financialMetrics ? (
          <>
            {/* 6 Key Revenue Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Monthly RR (MRR)</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-1">
                  ₹{(financialMetrics.mrr / 1000).toFixed(0)}k
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Live contracted
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Annual RR (ARR)</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-1">
                  ₹{(financialMetrics.arr / 100000).toFixed(2)}L
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
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Active Subscribers</p>
                <p className="text-xl font-black text-slate-900 font-mono mt-1">
                  {financialMetrics.activeSubscribers}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">
                  Churn: {financialMetrics.churnRate}%
                </p>
              </div>
            </div>

            {/* Compact & Executive Monthly Invoiced vs. Collected Cash Flow */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              {/* Header, Filter Pills & Legend */}
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

                <div className="flex flex-wrap items-center gap-3">
                  {/* Active vs All Months Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-medium text-slate-600">
                    <button
                      type="button"
                      onClick={() => setMonthFilter("active")}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        monthFilter === "active"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Active Months ({activeMonths.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonthFilter("all")}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        monthFilter === "all"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Full Year (12M)
                    </button>
                  </div>

                  {/* Compact Legend */}
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#714B67]" />
                      <span>Collected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Monthly Cash Flow Bars */}
              <div className="space-y-1.5">
                {displayMonths.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No billing activity recorded for the selected filter.
                  </div>
                ) : (
                  displayMonths.map((m, idx) => {
                    const pending = Math.max(0, m.invoiced - m.collected);
                    const rate = m.invoiced > 0 ? ((m.collected / m.invoiced) * 100).toFixed(1) : "100.0";
                    const barTotalPct = (m.invoiced / maxScale) * 100;
                    const collectedPct = m.invoiced > 0 ? (m.collected / m.invoiced) * 100 : 100;
                    const pendingPct = m.invoiced > 0 ? (pending / m.invoiced) * 100 : 0;
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
                            style={{ width: `${Math.max(barTotalPct, m.invoiced > 0 ? 3 : 0)}%` }}
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
                          {isHovered && pending > 0 && (
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
                              Number(rate) >= 90
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : Number(rate) >= 50
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {rate}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
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
                {peakMonth ? (
                  <div className="text-slate-400">
                    Peak Realization:{" "}
                    <strong className="text-slate-700">
                      {peakMonth.month} ({((peakMonth.collected / peakMonth.invoiced) * 100).toFixed(1)}%)
                    </strong>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Tax Compliance & GST Filing Ledger */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#714B67]" />
                  GST Tax Compliance Ledger (GSTR-1 Summary)
                </h2>
                <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 text-[11px]">
                  Intrastate Supply (Tamil Nadu 33)
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Intrastate CGST (9%)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Central Tax</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-900">
                    ₹{financialMetrics.cgstLiability.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-slate-500">Credited to Central Tax Electronic Ledger</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Intrastate SGST (9%)</span>
                    <span className="text-[10px] text-slate-500 font-normal">State Tax (TN)</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-900">
                    ₹{financialMetrics.sgstLiability.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-slate-500">Credited to State Tax (Tamil Nadu) Ledger</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
