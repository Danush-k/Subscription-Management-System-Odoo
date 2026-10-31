"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
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
  status: "DRAFT" | "SENT" | "CONFIRMED" | "EXPIRED";
  convertedSubscriptionId?: string | null;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/quotations", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.quotations) {
        setQuotations(data.quotations);
      }
    } catch (err) {
      console.error("Failed to load admin quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSendQuotation = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/quotations/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage(data.message || "Quotation marked as SENT and dispatched via email.");
        await fetchQuotations();
      } else {
        setAlertMessage(data.error || "Failed to dispatch quotation");
      }
    } catch (err: any) {
      setAlertMessage(err.message || "Failed to dispatch quotation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConvertToSubscription = async (quot: QuotationItem) => {
    setProcessingId(quot.id);
    try {
      const res = await fetch(`/api/admin/quotations/${quot.id}/convert`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage(
          `Quotation ${quot.quotationNumber} successfully converted into active Subscription agreement!`
        );
        await fetchQuotations();
      } else {
        setAlertMessage(data.error || "Failed to convert quotation");
      }
    } catch (err: any) {
      setAlertMessage(err.message || "Failed to convert quotation");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrightLoopModuleIcon appId="quotations" className="w-12 h-12" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Quotation Proposals &amp; Conversion Pipeline
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Draft proposals, send client estimates, and convert directly into recurring subscriptions.
                </p>
              </div>
            </div>
        </div>

        {alertMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{alertMessage}</span>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quotation #, customer, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "DRAFT", "SENT", "CONFIRMED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
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

        {/* Quotations List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded-md w-28" />
                  <div className="h-5 bg-slate-200 rounded-full w-20" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-slate-200 rounded-md w-40" />
                  <div className="h-4 bg-slate-100 rounded-md w-32" />
                </div>
                <div className="h-24 bg-slate-100 rounded-xl" />
                <div className="h-9 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Quotations Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No quotations match the active status or search query. Quotations created by staff operations or sales reps will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((quot) => {
              const isProcessing = processingId === quot.id;
              return (
                <div
                  key={quot.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#714B67] bg-[#714B67]/10 px-2.5 py-1 rounded-md">
                        {quot.quotationNumber}
                      </span>
                      <Badge
                        variant={
                          quot.status === "CONFIRMED"
                            ? "confirmed"
                            : quot.status === "SENT"
                            ? "quotation"
                            : "outline"
                        }
                      >
                        {quot.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{quot.customerName}</h3>
                      <p className="text-xs text-slate-400">{quot.customerEmail}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span>Plan:</span>
                        <span className="font-semibold text-slate-800">{quot.planName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Variant:</span>
                        <span className="text-slate-700">{quot.variantName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Valid Until:</span>
                        <span className="text-slate-700">{quot.validUntil}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-sm">
                        <span>Proposal Value:</span>
                        <span className="text-[#714B67] font-mono">
                          ₹{quot.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                    {quot.status === "DRAFT" && (
                      <Button
                        onClick={() => handleSendQuotation(quot.id)}
                        disabled={isProcessing}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        {isProcessing ? "Sending..." : "Send to Client"}
                      </Button>
                    )}

                    {quot.status === "CONFIRMED" && !quot.convertedSubscriptionId && (
                      <Button
                        onClick={() => handleConvertToSubscription(quot)}
                        disabled={isProcessing}
                        className="w-full bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {isProcessing ? "Converting..." : "Convert to Subscription"}
                      </Button>
                    )}

                    {quot.status === "CONFIRMED" && quot.convertedSubscriptionId && (
                      <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-center text-xs font-bold text-emerald-700">
                        Already converted to subscription
                      </div>
                    )}

                    {quot.status === "SENT" && !quot.convertedSubscriptionId && (
                      <Button
                        onClick={() => handleConvertToSubscription(quot)}
                        disabled={isProcessing}
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {isProcessing ? "Processing..." : "Convert to Subscription"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
