"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PortalNav } from "@/components/navigation/portal-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Building,
  User,
  Sparkles,
  Loader2,
  Eye,
  Send,
  MessageSquare,
  ShieldAlert,
  FileCheck2,
  X,
  AlertCircle,
} from "lucide-react";

interface QuotationRow {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  validUntil: string | null;
  createdAt: string;
  paymentTerms: string;
  linesCount: number;
}

export default function StaffQuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Negotiation Modal State
  const [negotiatingQuotation, setNegotiatingQuotation] = useState<QuotationRow | null>(null);
  const [negotiationReplyMessage, setNegotiationReplyMessage] = useState("");
  const [approvedDiscountAmount, setApprovedDiscountAmount] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Consent Conversion Modal State (for verified offline consent only)
  const [consentModalQuotation, setConsentModalQuotation] = useState<QuotationRow | null>(null);
  const [hasVerifiedConsent, setHasVerifiedConsent] = useState(false);
  const [consentReference, setConsentReference] = useState("");
  const [isConvertingId, setIsConvertingId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      const res = await fetch("/api/staff/quotations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load quotations");
      }
      setQuotations(data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load quotations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSendNegotiationReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiatingQuotation || !negotiationReplyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/staff/quotations/${negotiatingQuotation.id}/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: negotiationReplyMessage.trim(),
          approvedDiscount: approvedDiscountAmount ? Number(approvedDiscountAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send response");
      }
      setNotice(`Negotiation response & revised terms dispatched to ${negotiatingQuotation.customerName}.`);
      setNegotiatingQuotation(null);
      setNegotiationReplyMessage("");
      setApprovedDiscountAmount("");
      await fetchQuotations();
    } catch (err: any) {
      setError(err.message || "Unable to send negotiation response");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleExecuteConsentConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentModalQuotation) return;
    if (!hasVerifiedConsent || !consentReference.trim()) {
      setError("Explicit customer permission verification and reference are required.");
      return;
    }

    setIsConvertingId(consentModalQuotation.id);
    try {
      const res = await fetch(`/api/staff/quotations/${consentModalQuotation.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerConsentConfirmed: true,
          consentReference: consentReference.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to convert quotation");
      }
      setNotice(`Quotation confirmed into active subscription for ${consentModalQuotation.customerName} based on verified customer consent.`);
      setConsentModalQuotation(null);
      setHasVerifiedConsent(false);
      setConsentReference("");
      await fetchQuotations();
    } catch (err: any) {
      setError(err.message || "Unable to convert quotation");
    } finally {
      setIsConvertingId(null);
    }
  };

  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.customerName.toLowerCase().includes(search.toLowerCase()) ||
        q.planName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const pendingCount = quotations.filter((q) => q.status === "QUOTATION").length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 select-none">
      {/* 2-Tier Header Layout */}
      <PortalNav
        portalType="staff"
        quotationsBadge={pendingCount}
      />

      {/* Page Title & Actions Bar */}
      <div className="bg-white border-b border-slate-200/80 py-5">
        <div className="dashboard-container flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                Commercial Pipeline
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                Client Proposals &amp; Sales Negotiations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-3">
              <span>Quotations &amp; Proposals</span>
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#714B67]" />}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/staff/quotations/new">
              <Button
                size="sm"
                className="gap-2 font-bold text-xs bg-[#714B67] hover:bg-[#5C3C54] text-white rounded-xl shadow-xs transition-all active:scale-95 px-4 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quotation</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        {/* Notice Banners */}
        {notice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-700 hover:text-rose-950 font-bold px-2 py-1 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quotation number, client or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: `All (${quotations.length})` },
              { id: "QUOTATION", label: `Pending Client Approval (${pendingCount})` },
              { id: "CONFIRMED", label: `Confirmed (${quotations.filter((q) => q.status === "CONFIRMED").length})` },
              { id: "EXPIRED", label: `Expired (${quotations.filter((q) => q.status === "EXPIRED").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#714B67] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No commercial proposals match the specified filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-5 text-left">Quotation Ref</th>
                    <th className="py-3 px-5 text-left">Customer</th>
                    <th className="py-3 px-5 text-left">Plan / Terms</th>
                    <th className="py-3 px-5 text-left">Validity</th>
                    <th className="py-3 px-5 text-right">Amount</th>
                    <th className="py-3 px-5 text-center">Status &amp; Approval</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((quo) => {
                    const isPending = quo.status === "QUOTATION";
                    const isConfirmed = quo.status === "CONFIRMED";

                    return (
                      <tr key={quo.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                          {quo.quotationNumber}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900">{quo.customerName}</div>
                          <div className="text-[11px] text-slate-400">{quo.customerEmail}</div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-800">{quo.planName}</div>
                          <div className="text-[11px] text-slate-400">
                            Terms: {quo.paymentTerms || "NET_30"} &bull; {quo.linesCount} item(s)
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500">
                          {quo.validUntil ? (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(quo.validUntil).toLocaleDateString("en-IN")}</span>
                            </div>
                          ) : (
                            <span>No expiry set</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(quo.totalAmount)}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          {isPending && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px] px-2.5 py-0.5">
                              ⏳ Awaiting Customer Approval
                            </Badge>
                          )}
                          {isConfirmed && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px] px-2.5 py-0.5">
                              ✓ Customer Confirmed
                            </Badge>
                          )}
                          {quo.status === "EXPIRED" && (
                            <Badge className="bg-slate-100 text-slate-600 border-slate-300 font-bold text-[10px]">
                              Expired
                            </Badge>
                          )}
                          {quo.status === "DRAFT" && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-[10px]">
                              Draft
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              {/* 1. Primary Action: Reply & Negotiate with Client */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setNegotiatingQuotation(quo);
                                  setNegotiationReplyMessage("");
                                  setApprovedDiscountAmount(quo.discountAmount > 0 ? String(quo.discountAmount) : "");
                                }}
                                className="border-[#714B67]/40 text-[#714B67] hover:bg-[#714B67]/10 text-xs font-bold px-3 py-1 rounded-xl shadow-2xs gap-1.5 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Negotiate / Reply</span>
                              </Button>

                              {/* 2. Secondary Action: Record Verified Written Authorization */}
                              <button
                                onClick={() => {
                                  setConsentModalQuotation(quo);
                                  setHasVerifiedConsent(false);
                                  setConsentReference("");
                                }}
                                title="Record verified offline customer authorization (Signed PO / Written email)"
                                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline px-1 py-1 cursor-pointer"
                              >
                                Record Written Consent
                              </button>
                            </div>
                          ) : isConfirmed ? (
                            <div className="flex items-center justify-end gap-1.5 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Subscribed &amp; Active</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Archived</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: Negotiate & Reply to Client */}
      {negotiatingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#714B67]" />
                <h3 className="text-sm font-black text-slate-900">
                  Sales Communication &amp; Negotiation ({negotiatingQuotation.quotationNumber})
                </h3>
              </div>
              <button
                onClick={() => setNegotiatingQuotation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNegotiationReply} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Customer:</span>
                  <span className="font-bold text-slate-900">{negotiatingQuotation.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Current Proposed Total:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(negotiatingQuotation.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Plan:</span>
                  <span className="font-semibold text-slate-800">{negotiatingQuotation.planName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Revise Approved Discount (₹) (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5000"
                  value={approvedDiscountAmount}
                  onChange={(e) => setApprovedDiscountAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message / Response to Customer <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide adjusted pricing details, contract duration terms, or respond to the customer's counter-offer..."
                  value={negotiationReplyMessage}
                  onChange={(e) => setNegotiationReplyMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNegotiatingQuotation(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingReply || !negotiationReplyMessage.trim()}
                  className="bg-[#714B67] hover:bg-[#5a3b52] text-white text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingReply ? "Dispatching..." : "Send to Customer Portal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Verified Customer Consent (Offline Signed PO / Written Email) */}
      {consentModalQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Customer Permission Verification ({consentModalQuotation.quotationNumber})
                </h3>
              </div>
              <button
                onClick={() => setConsentModalQuotation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteConsentConversion} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  Customer Authorization Required
                </p>
                <p className="leading-relaxed text-[11px]">
                  Staff cannot unilaterally convert quotations without customer consent. If the client cannot access their portal, you must certify that the customer provided verified offline authorization (signed PO, contract, or written email confirmation).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Authorization Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signed PO #PO-2026-9042 or Client Email Approval 31/10"
                  value={consentReference}
                  onChange={(e) => setConsentReference(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={hasVerifiedConsent}
                    onChange={(e) => setHasVerifiedConsent(e.target.checked)}
                    className="mt-0.5 rounded text-[#714B67] focus:ring-[#714B67] cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                    I solemnly verify that <strong>{consentModalQuotation.customerName}</strong> gave explicit, verified consent to activate this subscription agreement.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConsentModalQuotation(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConvertingId === consentModalQuotation.id || !hasVerifiedConsent || !consentReference.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  {isConvertingId === consentModalQuotation.id ? "Activating..." : "Confirm & Activate Subscription"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
