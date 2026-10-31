"use client";

import React, { useState } from "react";
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
}

const INITIAL_QUOTATIONS: QuotationItem[] = [
  {
    id: "quot-1",
    quotationNumber: "QUO-2026-0012",
    customerName: "Vertex Media Works",
    customerEmail: "procure@vertexmedia.in",
    planName: "Enterprise Cloud Suite",
    variantName: "Odoo Enterprise Edition",
    totalAmount: 141600,
    validUntil: "2026-11-20",
    status: "CONFIRMED",
  },
  {
    id: "quot-2",
    quotationNumber: "QUO-2026-0011",
    customerName: "Omega Healthcare Systems",
    customerEmail: "it@omegahealth.com",
    planName: "Growth Monthly Tier",
    variantName: "Standard Cloud Tier",
    totalAmount: 9912,
    validUntil: "2026-11-15",
    status: "SENT",
  },
  {
    id: "quot-3",
    quotationNumber: "QUO-2026-0010",
    customerName: "Nexus Global Exports",
    customerEmail: "finance@nexusglobal.com",
    planName: "Odoo Business Suite",
    variantName: "SAP Migration Edition",
    totalAmount: 32450,
    validUntil: "2026-11-08",
    status: "DRAFT",
  },
];

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationItem[]>(INITIAL_QUOTATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSendQuotation = (id: string) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "SENT" as const } : q))
    );
    setAlertMessage("Quotation marked as SENT and dispatched via email.");
  };

  const handleConvertToSubscription = (quot: QuotationItem) => {
    setQuotations((prev) => prev.filter((q) => q.id !== quot.id));
    setAlertMessage(
      `Quotation ${quot.quotationNumber} successfully converted into active Subscription agreement for ${quot.customerName}!`
    );
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

      <main className="dashboard-container pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Quotation Proposals & Conversion Pipeline
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Draft proposals, send client estimates, and convert directly into recurring subscriptions.
            </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((quot) => (
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
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    Send to Client
                  </Button>
                )}

                {quot.status === "CONFIRMED" && (
                  <Button
                    onClick={() => handleConvertToSubscription(quot)}
                    className="w-full bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Convert to Subscription
                  </Button>
                )}

                {quot.status === "SENT" && (
                  <Button
                    onClick={() => {
                      setQuotations((prev) =>
                        prev.map((q) =>
                          q.id === quot.id ? { ...q, status: "CONFIRMED" as const } : q
                        )
                      );
                      setAlertMessage(`Client accepted quotation ${quot.quotationNumber}!`);
                    }}
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs font-bold gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Client Accepted
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
