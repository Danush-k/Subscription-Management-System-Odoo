"use client";

import React, { useState } from "react";
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

const INITIAL_TAXES: TaxRule[] = [
  {
    id: "tax-1",
    name: "Standard GST (Goods & Services Tax)",
    code: "GST-18-EXCL",
    rate: 18.0,
    type: "EXCLUSIVE",
    jurisdiction: "India (Intra/Interstate)",
    status: "ACTIVE",
  },
  {
    id: "tax-2",
    name: "Inclusive SaaS Consumption GST",
    code: "GST-18-INCL",
    rate: 18.0,
    type: "INCLUSIVE",
    jurisdiction: "India (B2C Standard)",
    status: "ACTIVE",
  },
  {
    id: "tax-3",
    name: "Export of Software Services (Zero-Rated)",
    code: "EXP-0-RATED",
    rate: 0.0,
    type: "EXCLUSIVE",
    jurisdiction: "International (LUT Bond)",
    status: "ACTIVE",
  },
  {
    id: "tax-4",
    name: "Special Reduced IT Rate",
    code: "GST-12-RED",
    rate: 12.0,
    type: "EXCLUSIVE",
    jurisdiction: "India",
    status: "ACTIVE",
  },
];

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<TaxRule[]>(INITIAL_TAXES);
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [selectedTax, setSelectedTax] = useState<string>("tax-1");

  const activeTax = taxes.find((t) => t.id === selectedTax) || taxes[0];

  let taxableBase = 0;
  let computedTax = 0;
  let finalGross = 0;

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Percent className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Tax Engine & Compliance Rules
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Inclusive/exclusive tax calculations, CGST/SGST/IGST breakdowns, and immutable audit freezes.
            </p>
          </div>
        </div>

        {/* Live Tax Simulator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Calculator className="w-4 h-4 text-[#714B67]" />
            <span>Interactive Decimal Precision Tax Simulator</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Input Amount (₹ INR)
              </label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Select Tax Rule
              </label>
              <select
                value={selectedTax}
                onChange={(e) => setSelectedTax(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67]"
              >
                {taxes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.rate}% - {t.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Taxable Base:</span>
                <span className="font-mono font-bold">
                  ₹{taxableBase.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[#714B67]">
                <span>Tax Amount ({activeTax.rate}%):</span>
                <span className="font-mono font-bold">
                  ₹{computedTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between font-black text-slate-900 text-sm">
                <span>Gross Invoice Total:</span>
                <span className="font-mono">
                  ₹{finalGross.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Taxes Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Tax Code</th>
                  <th className="py-3.5 px-6">Tax Rule Name</th>
                  <th className="py-3.5 px-6">Rate</th>
                  <th className="py-3.5 px-6">Calculation Type</th>
                  <th className="py-3.5 px-6">Jurisdiction</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs">
                      {t.code}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{t.name}</td>
                    <td className="py-4 px-6 font-bold text-[#714B67] font-mono text-sm">
                      {t.rate}%
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          t.type === "EXCLUSIVE"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">{t.jurisdiction}</td>
                    <td className="py-4 px-6">
                      <Badge variant="active">{t.status}</Badge>
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
