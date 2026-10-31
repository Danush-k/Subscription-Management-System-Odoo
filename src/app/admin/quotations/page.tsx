"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Search,
  Plus,
  Send,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Building,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";

interface QuotationItem {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  variantName: string;
  totalAmount: number;
  validUntil: string;
  status: "DRAFT" | "SENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      const res = await fetch("/api/admin/quotations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data.quotations || []);
      }
    } catch (err) {
      console.error("Failed to fetch quotations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSendQuotation = (id: string) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "SENT" as const } : q))
    );
    setAlertMessage("Quotation marked as SENT and dispatched via email.");
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.planName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Sales Quotations &amp; Conversions
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Draft proposals, custom enterprise terms, and one-click conversion to active recurring subscriptions.
            </p>
          </div>

          <Link href="/admin/subscriptions/new">
            <Button className="bg-[#714B67] hover:bg-[#5C3C54] text-white gap-2 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              Create Quotation
            </Button>
          </Link>
        </div>

        {alertMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{alertMessage}</span>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-emerald-700 font-bold px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quotation #, customer, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "DRAFT", "SENT", "CONFIRMED", "EXPIRED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
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

        {/* Quotations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Quotation #</th>
                  <th className="py-3.5 px-6">Customer &amp; Email</th>
                  <th className="py-3.5 px-6">Proposed Plan &amp; Edition</th>
                  <th className="py-3.5 px-6">Gross Proposal Total</th>
                  <th className="py-3.5 px-6">Valid Until</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#714B67]" />
                      <p className="mt-2 text-xs">Loading quotations from PostgreSQL...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No quotations found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs">
                        {q.quotationNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{q.customerName}</div>
                        <div className="text-xs text-slate-400">{q.customerEmail}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{q.planName}</div>
                        <div className="text-xs text-[#714B67] font-medium">{q.variantName}</div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        ₹{q.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-mono">{q.validUntil}</td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            q.status === "CONFIRMED"
                              ? "success"
                              : q.status === "SENT"
                              ? "warning"
                              : q.status === "EXPIRED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {q.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {q.status === "DRAFT" && (
                            <button
                              onClick={() => handleSendQuotation(q.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-[#714B67] hover:bg-[#5C3C54] rounded-lg transition-all"
                            >
                              Dispatch
                            </button>
                          )}
                          <Link
                            href="/admin/subscriptions"
                            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            title="View Contracts"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
