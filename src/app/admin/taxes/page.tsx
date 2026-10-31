"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import {
  Percent,
  Calculator,
  CheckCircle2,
  ShieldCheck,
  Building,
  Plus,
  X,
  Info,
  ArrowRight,
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
  const [selectedTaxRule, setSelectedTaxRule] = useState<TaxRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New tax form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formRate, setFormRate] = useState("5.0");
  const [formType, setFormType] = useState<"EXCLUSIVE" | "INCLUSIVE">("EXCLUSIVE");
  const [formJurisdiction, setFormJurisdiction] = useState("India (Intra/Interstate)");

  const fetchTaxes = async () => {
    try {
      const res = await fetch("/api/admin/taxes");
      if (res.ok) {
        const data = await res.json();
        if (data.taxes && data.taxes.length > 0) {
          setTaxes(data.taxes);
          if (!selectedTax || !data.taxes.some((t: any) => t.id === selectedTax)) {
            setSelectedTax(data.taxes[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch taxes", err);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          code: formCode,
          rate: Number(formRate),
          type: formType,
          jurisdiction: formJurisdiction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tax rule");
      }

      setNotification(`Tax rule "${formName}" created successfully!`);
      setTimeout(() => setNotification(null), 4000);
      setIsModalOpen(false);

      // Reset form
      setFormName("");
      setFormCode("");
      setFormRate("5.0");

      await fetchTaxes();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create tax rule");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      taxableBase = calcAmount / (1 + activeTax.rate / 100);
      computedTax = calcAmount - taxableBase;
      finalGross = calcAmount;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="taxes" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Tax Engine &amp; Compliance Rules
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Inclusive/exclusive tax calculations, CGST/SGST/IGST breakdowns, and immutable audit freezes. Click any row for details.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Percent className="w-4 h-4" />
            <span>Add Tax Rule</span>
          </Button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Live Tax Simulator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Calculator className="w-4 h-4 text-[#714B67]" />
            <span>Interactive Decimal Precision Tax Simulator</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Base Line Subtotal (₹)
              </label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Applied Tax Schedule
              </label>
              <select
                value={selectedTax}
                onChange={(e) => setSelectedTax(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                {taxes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.rate}% - {t.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Resulting Gross Total
              </span>
              <span className="text-xl font-black text-slate-900 font-mono">
                ₹{finalGross.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {activeTax && (
            <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Calculated Tax Amount:</span>
                <span className="font-mono font-bold text-[#714B67] text-sm">
                  ₹{computedTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-slate-400">({activeTax.rate}% {activeTax.type})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600">Jurisdiction:</span>
                <span className="font-bold text-slate-800">{activeTax.jurisdiction}</span>
              </div>
            </div>
          )}
        </div>

        {/* Taxes Table with Clickable Rows */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Tax Code</th>
                  <th className="py-3.5 px-6">Rule Description</th>
                  <th className="py-3.5 px-6">Rate %</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Jurisdiction</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxes.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTaxRule(t)}
                    className="hover:bg-purple-50/20 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs group-hover:text-[#714B67] transition-colors">
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

      {/* Tax Rule Detailed View Modal */}
      {selectedTaxRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg">{selectedTaxRule.name}</h3>
                    <Badge variant="active">{selectedTaxRule.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{selectedTaxRule.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaxRule(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                  Tax Calculation Parameters
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Applied Percentage</span>
                    <span className="font-mono font-black text-slate-900 text-lg">
                      {selectedTaxRule.rate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Calculation Logic</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs inline-block ${
                      selectedTaxRule.type === "EXCLUSIVE" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}>
                      {selectedTaxRule.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tax Jurisdiction</span>
                    <span className="font-semibold text-slate-900">{selectedTaxRule.jurisdiction}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Compliance Lock</span>
                    <span className="font-semibold text-emerald-700">Audit-Safe Freeze Active</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Execution Rule:</span>
                {selectedTaxRule.type === "EXCLUSIVE"
                  ? `Subtotal line items are taxed at ${selectedTaxRule.rate}%, and the resulting tax is added onto the invoice total.`
                  : `Line item rates are inclusive of ${selectedTaxRule.rate}% tax. Base amounts are back-calculated as (Price / ${(1 + selectedTaxRule.rate/100).toFixed(4)}).`}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTaxRule(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedTax(selectedTaxRule.id);
                  setSelectedTaxRule(null);
                }}
                className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs"
              >
                Test in Simulator &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tax Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Create Tax Compliance Rule</h3>
                  <p className="text-xs text-slate-400">Configure GST rates, inclusive/exclusive modes, and jurisdictions</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateTax} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tax Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reduced GST (5% IT Hardware)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Code / Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. GST-5-EXCL"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Rate Percentage (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Calculation Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  >
                    <option value="EXCLUSIVE">EXCLUSIVE (Added on top)</option>
                    <option value="INCLUSIVE">INCLUSIVE (Embedded in price)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Jurisdiction</label>
                  <input
                    type="text"
                    placeholder="e.g. India (Intra/Interstate)"
                    value={formJurisdiction}
                    onChange={(e) => setFormJurisdiction(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">Rule Logic Preview:</span>
                <p className="mt-1">
                  {formType === "EXCLUSIVE"
                    ? `A ${formRate}% tax will be computed and added to line subtotals.`
                    : `Base prices will be back-calculated as (Price / ${(1 + Number(formRate || 0)/100).toFixed(4)}), with ${formRate}% embedded tax.`}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold"
                >
                  {isSubmitting ? "Saving..." : "Create Tax Rule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
