"use client";

import React from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Financial Analytics & Revenue Intelligence
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Separation of Invoiced vs Collected revenue, recurring run rates, and GST compliance liability.
          </p>
        </div>

        {/* 6 Key Revenue Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Monthly RR (MRR)</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              ₹{(financialMetrics.mrr / 1000).toFixed(0)}k
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2% MoM
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Annual RR (ARR)</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              ₹{(financialMetrics.arr / 100000).toFixed(1)}L
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Projected run-rate</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Invoiced (Accrual)</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              ₹{(financialMetrics.invoicedRevenue / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Gross billing total</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase">Collected (Cash)</p>
            <p className="text-xl font-black text-emerald-700 mt-1">
              ₹{(financialMetrics.collectedRevenue / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              {financialMetrics.collectionRate}% efficiency
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-xs">
            <p className="text-[11px] font-semibold text-amber-600 uppercase">Receivables</p>
            <p className="text-xl font-black text-amber-700 mt-1">
              ₹{(financialMetrics.outstandingReceivables / 100000).toFixed(2)}L
            </p>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Pending collection</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase">Net Churn</p>
            <p className="text-xl font-black text-slate-900 mt-1">{financialMetrics.churnRate}%</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-1">Industry benchmark &lt;3%</p>
          </div>
        </div>

        {/* Monthly Trend Visual Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Monthly Invoiced vs. Collected Cash Flow
          </h2>

          <div className="space-y-3 pt-2">
            {monthlyTrend.map((m) => (
              <div key={m.month} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{m.month}</span>
                  <span className="font-mono text-slate-500">
                    Invoiced: ₹{m.invoiced.toLocaleString("en-IN")} | Collected: ₹
                    {m.collected.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#714B67] h-full"
                    style={{ width: `${(m.collected / 300000) * 100}%` }}
                    title={`Collected: ₹${m.collected}`}
                  />
                  <div
                    className="bg-amber-400/70 h-full"
                    style={{ width: `${((m.invoiced - m.collected) / 300000) * 100}%` }}
                    title={`Pending: ₹${m.invoiced - m.collected}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-[#714B67]" />
              <span className="text-slate-600">Collected Cash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-amber-400/70" />
              <span className="text-slate-600">Pending Receivables</span>
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
