"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Percent,
  Calculator,
  CheckCircle2,
  ShieldCheck,
  Building,
  Loader2,
} from "lucide-react";

interface TaxRule {
  id: string;
  name: string;
  code: string;
  rate: number;
  type: "EXCLUSIVE" | "INCLUSIVE";
  jurisdiction: string;
  status: "ACTIVE" | "ARCHIVED";
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [selectedTax, setSelectedTax] = useState<string>("");

  const fetchTaxes = async () => {
    try {
      const res = await fetch("/api/admin/taxes", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTaxes(data.taxes || []);
        if (data.taxes?.length > 0) {
          setSelectedTax(data.taxes[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch taxes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const activeTax = taxes.find((t) => t.id === selectedTax) || taxes[0];

  let taxableBase = 0;
  let computedTax = 0;
  let finalGross = 0;

  if (activeTax) {
    if (activeTax.type === "EXCLUSIVE") {
      taxableBase = calcAmount;
      computedTax = (calcAmount * activeTax.rate) / 100;
      finalGross = taxableBase + computedTax;
    } else {
      // Inclusive: Tax = Gross - (Gross / (1 + Rate))
      taxableBase = calcAmount / (1 + activeTax.rate / 100);
      computedTax = calcAmount - taxableBase;
      finalGross = calcAmount;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Percent className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Tax Rules &amp; GST Compliance Engine
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Inclusive and exclusive tax algorithms loaded from PostgreSQL with CGST/SGST audit conformity.
            </p>
          </div>
        </div>

        {/* Live Tax Engine Simulator */}
        {activeTax && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-sm tracking-wide uppercase text-amber-400">
                Live Formula Simulator &amp; Mathematical Verification
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Enter Target Amount (₹)</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Active Tax Rule</label>
                <select
                  value={selectedTax}
                  onChange={(e) => setSelectedTax(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  {taxes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} ({t.rate}% {t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block text-[11px]">Net Taxable Base</span>
                <span className="text-base font-mono font-bold text-white">
                  ₹{taxableBase.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {activeTax.type === "INCLUSIVE" ? "Base stripped of tax" : "Base amount"}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block text-[11px]">Computed GST ({activeTax.rate}%)</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  ₹{computedTax.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  CGST: ₹{(computedTax / 2).toFixed(2)} | SGST: ₹{(computedTax / 2).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Taxes Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#714B67]" />
            <p className="mt-3 text-sm">Loading tax configurations from PostgreSQL...</p>
          </div>
        ) : taxes.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No tax configurations found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {taxes.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {t.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{t.name}</h3>
                    </div>
                    <Badge variant={t.status === "ACTIVE" ? "success" : "outline"}>
                      {t.status}
                    </Badge>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-3xl font-black font-mono text-slate-900">
                      {t.rate}%
                    </p>
                    <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
                      {t.type} Tax
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Jurisdiction:</span>
                      <span className="font-semibold text-slate-800">{t.jurisdiction}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Algorithm:</span>
                      <span className="font-mono text-[11px] text-slate-700">
                        {t.type === "EXCLUSIVE" ? "base * rate" : "gross - (gross / (1+rate))"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
