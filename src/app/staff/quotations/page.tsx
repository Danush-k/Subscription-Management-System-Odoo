"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PortalNav } from "@/components/navigation/portal-nav";
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
  Clock,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Percent,
  Check,
  X,
  Building,
  FileCheck2,
  LayoutGrid,
  List,
} from "lucide-react";

interface StaffQuotationItem {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  variantName: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: string;
  status: "DRAFT" | "SENT" | "COUNTER_OFFER" | "SUBSCRIBED" | "EXPIRED";
  rawStatus: string;
  paymentTerms: string;
  convertedSubscriptionId?: string | null;
  subscriptionNumber?: string | null;
  pendingDiscount?: number | null;
  latestCustomerMessage?: string | null;
  negotiationsCount: number;
}

export default function StaffQuotationsPage() {
  const [quotations, setQuotations] = useState<StaffQuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Counter-offer review modal state
  const [reviewQuotation, setReviewQuotation] = useState<StaffQuotationItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff/quotations", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.quotations) {
        setQuotations(data.quotations);
      }
    } catch (err) {
      console.error("Failed to load staff quotations:", err);
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
        setAlertMessage({ type: "success", text: data.message || "Quotation dispatched to client via email & portal." });
        await fetchQuotations();
      } else {
        setAlertMessage({ type: "error", text: data.error || "Failed to dispatch quotation" });
      }
    } catch (err: any) {
      setAlertMessage({ type: "error", text: err.message || "Failed to dispatch quotation" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleOfflineConvert = async (quot: StaffQuotationItem) => {
    if (!confirm(`Convert ${quot.quotationNumber} via Enterprise Offline PO / Net Terms? This creates the subscription and generates an initial invoice.`)) {
      return;
    }
    setProcessingId(quot.id);
    try {
      const res = await fetch(`/api/staff/quotations/${quot.id}/convert`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({
          type: "success",
          text: `Quotation ${quot.quotationNumber} converted to Subscription ${data.data?.subscription?.subscriptionNumber || ""} via Enterprise terms!`,
        });
        await fetchQuotations();
      } else {
        setAlertMessage({ type: "error", text: data.error || "Failed to convert quotation" });
      }
    } catch (err: any) {
      setAlertMessage({ type: "error", text: err.message || "Failed to convert quotation" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCounterOfferAction = async (action: "APPROVE" | "REJECT") => {
    if (!reviewQuotation) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/staff/quotations/${reviewQuotation.id}/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          approvedDiscountPercent: action === "APPROVE" ? reviewQuotation.pendingDiscount || 10 : undefined,
          message: reviewNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({
          type: "success",
          text: action === "APPROVE"
            ? `Discount counter-offer approved! Quotation ${reviewQuotation.quotationNumber} updated and ready for client payment.`
            : `Discount counter-offer declined for ${reviewQuotation.quotationNumber}. Standard pricing retained.`,
        });
        setReviewQuotation(null);
        setReviewNote("");
        await fetchQuotations();
      } else {
        setAlertMessage({ type: "error", text: data.error || "Failed to process counter-offer" });
      }
    } catch (err: any) {
      setAlertMessage({ type: "error", text: err.message || "Failed to process counter-offer" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.planName.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "SUBSCRIBED") return matchesSearch && q.status === "SUBSCRIBED";
    if (statusFilter === "COUNTER_OFFER") return matchesSearch && q.status === "COUNTER_OFFER";
    if (statusFilter === "SENT") return matchesSearch && q.status === "SENT";
    if (statusFilter === "DRAFT") return matchesSearch && q.status === "DRAFT";
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20 select-none">
      {/* Top Staff Navigation */}
      <PortalNav
        portalType="staff"
        portalTitle="Staff Quotation Pipeline"
        userName="Staff Operations"
        userRole="Sales & Billing Desk"
        companyName="Brightloop Enterprise Ops"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Top Header matching user screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 flex items-center justify-center text-[#714B67] shrink-0 border border-[#714B67]/20">
              <Receipt className="w-5 h-5 text-[#714B67]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Quotation Proposals &amp; Conversion Pipeline
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Draft proposals, review client negotiations, approve discounts, and convert directly into recurring subscriptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "cards" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Card Grid Pipeline"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link href="/staff/dashboard">
              <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl">
                &larr; Operations Queue
              </Button>
            </Link>
            <Link href="/staff/quotations/new">
              <Button
                size="sm"
                className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold gap-2 px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quotation</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alertMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fadeIn ${
              alertMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{alertMessage.text}</span>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar & Filter Chips (Exact Screenshot Layout) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quotation #, customer, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-800 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "ALL" },
              { id: "COUNTER_OFFER", label: "COUNTER-OFFER" },
              { id: "SENT", label: "SENT" },
              { id: "SUBSCRIBED", label: "SUBSCRIBED" },
              { id: "DRAFT", label: "DRAFT" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotations Presentation */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-24" />
                <div className="h-5 bg-slate-200 rounded w-48" />
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Quotations Found</h3>
            <p className="text-xs text-slate-500 mt-1">No proposals match your current filters.</p>
          </div>
        ) : viewMode === "cards" ? (
          /* ========================================================================= */
          /* 3-COLUMN CARD GRID PIPELINE (EXACT TEMPLATE REQUESTED IN SCREENSHOT)      */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((quot) => {
              const isProcessing = processingId === quot.id;
              const isSubscribed = quot.status === "SUBSCRIBED" || Boolean(quot.convertedSubscriptionId);
              const isCounterOffer = quot.status === "COUNTER_OFFER" || Boolean(quot.pendingDiscount);

              return (
                <div
                  key={quot.id}
                  className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
                    isCounterOffer
                      ? "border-amber-300 ring-2 ring-amber-100"
                      : isSubscribed
                      ? "border-emerald-200 bg-emerald-50/10"
                      : "border-slate-200"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Pill & Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                        {quot.quotationNumber}
                      </span>

                      {isSubscribed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          SUBSCRIBED
                        </span>
                      )}

                      {isCounterOffer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          COUNTER-OFFER
                        </span>
                      )}

                      {!isSubscribed && !isCounterOffer && quot.status === "SENT" && (
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          SENT
                        </span>
                      )}

                      {!isSubscribed && !isCounterOffer && quot.status === "DRAFT" && (
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          DRAFT
                        </span>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h3 className="font-black text-slate-900 text-base line-clamp-1">{quot.customerName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{quot.customerEmail}</p>
                    </div>

                    {/* Pending Counter-Offer Callout if active */}
                    {isCounterOffer && quot.pendingDiscount && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5 text-amber-950">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span className="flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5 text-amber-700" />
                            Client Requested {quot.pendingDiscount}% Discount
                          </span>
                          <span className="font-mono text-xs">
                            -₹{((quot.subtotal * quot.pendingDiscount) / 100).toLocaleString("en-IN")}
                          </span>
                        </div>
                        {quot.latestCustomerMessage && (
                          <p className="text-[11px] text-amber-800 italic line-clamp-2">
                            &quot;{quot.latestCustomerMessage}&quot;
                          </p>
                        )}
                        <div className="pt-1 flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => setReviewQuotation(quot)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] h-7 px-3 rounded-lg cursor-pointer"
                          >
                            Review &amp; Approve
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Metadata Card Box */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Plan:</span>
                        <span className="font-bold text-slate-800">{quot.planName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Variant:</span>
                        <span className="text-slate-700">{quot.variantName}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Valid Until:</span>
                        <span className="text-slate-700 font-mono">{quot.validUntil}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                        <span>Proposal Value:</span>
                        <span className="text-[#714B67] font-mono text-base">
                          ₹{quot.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                    {/* CASE 1: ALREADY SUBSCRIBED */}
                    {isSubscribed ? (
                      <Link
                        href="/staff/subscriptions"
                        className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active Agreement ({quot.subscriptionNumber || "SUB-2026"}) &rarr;</span>
                      </Link>
                    ) : isCounterOffer ? (
                      /* CASE 2: COUNTER-OFFER REVIEW */
                      <Button
                        onClick={() => setReviewQuotation(quot)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Review Counter-Offer</span>
                      </Button>
                    ) : quot.status === "DRAFT" ? (
                      /* CASE 3: DRAFT PROPOSAL */
                      <Button
                        onClick={() => handleSendQuotation(quot.id)}
                        disabled={isProcessing}
                        className="w-full bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold py-2.5 rounded-xl gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isProcessing ? "Sending..." : "Send to Client"}</span>
                      </Button>
                    ) : (
                      /* CASE 4: SENT / AWAITING PAYMENT (Allows Offline PO conversion) */
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>Awaiting Client Checkout</span>
                        </span>
                        <Button
                          onClick={() => handleOfflineConvert(quot)}
                          disabled={isProcessing}
                          variant="outline"
                          size="sm"
                          className="text-[11px] font-bold text-[#714B67] border-[#714B67]/30 hover:bg-[#714B67]/10 rounded-xl cursor-pointer"
                        >
                          Convert (Offline PO)
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* TABLE VIEW                                                                */
          /* ========================================================================= */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-5 text-left">Quotation Ref</th>
                    <th className="py-3 px-5 text-left">Customer</th>
                    <th className="py-3 px-5 text-left">Plan / Variant</th>
                    <th className="py-3 px-5 text-left">Valid Until</th>
                    <th className="py-3 px-5 text-right">Amount</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((quo) => {
                    const isSubscribed = quo.status === "SUBSCRIBED" || Boolean(quo.convertedSubscriptionId);
                    const isCounter = quo.status === "COUNTER_OFFER" || Boolean(quo.pendingDiscount);

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
                          <div className="text-[11px] text-slate-400">{quo.variantName}</div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-mono">
                          {quo.validUntil}
                        </td>
                        <td className="py-3.5 px-5 text-right font-black font-mono text-slate-900">
                          ₹{quo.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          {isSubscribed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                              SUBSCRIBED
                            </span>
                          ) : isCounter ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                              COUNTER-OFFER
                            </span>
                          ) : quo.status === "SENT" ? (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              SENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              DRAFT
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {isSubscribed ? (
                            <Link href="/staff/subscriptions" className="text-emerald-700 font-bold hover:underline">
                              Active Sub &rarr;
                            </Link>
                          ) : isCounter ? (
                            <Button
                              size="sm"
                              onClick={() => setReviewQuotation(quo)}
                              className="bg-amber-600 text-white text-[11px] font-bold h-7 px-2.5 rounded-lg"
                            >
                              Review Offer
                            </Button>
                          ) : quo.status === "DRAFT" ? (
                            <Button
                              size="sm"
                              onClick={() => handleSendQuotation(quo.id)}
                              className="bg-[#714B67] text-white text-[11px] font-bold h-7 px-2.5 rounded-lg"
                            >
                              Send
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOfflineConvert(quo)}
                              className="text-[11px] font-bold text-[#714B67] h-7 px-2.5 rounded-lg"
                            >
                              Convert
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Counter-Offer Approval / Rejection Modal */}
      {reviewQuotation && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setReviewQuotation(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Percent className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Review Client Counter-Offer
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {reviewQuotation.quotationNumber} &bull; {reviewQuotation.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewQuotation(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Comparison Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Original Proposal Total:</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹{reviewQuotation.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-amber-900 font-bold bg-amber-50 p-2 rounded-xl border border-amber-200">
                <span>Client Requested Discount:</span>
                <span>{reviewQuotation.pendingDiscount || 10}%</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                <span>Payable Total If Approved:</span>
                <span className="font-mono text-emerald-700 text-base">
                  ₹{Math.round(reviewQuotation.totalAmount * (1 - (reviewQuotation.pendingDiscount || 10) / 100)).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Client Negotiation Note */}
            {reviewQuotation.latestCustomerMessage && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Client Note:</span>
                <p className="text-slate-600 italic">&quot;{reviewQuotation.latestCustomerMessage}&quot;</p>
              </div>
            )}

            {/* Optional Staff Note Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Staff Response Note (Optional):</label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="e.g. Approved 10% discount for annual commitment. Please complete payment."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#714B67] bg-slate-50 text-slate-800"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCounterOfferAction("REJECT")}
                disabled={isSubmittingReview}
                className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <X className="w-3.5 h-3.5" />
                <span>Decline Counter-Offer</span>
              </Button>

              <Button
                size="sm"
                onClick={() => handleCounterOfferAction("APPROVE")}
                disabled={isSubmittingReview}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve {reviewQuotation.pendingDiscount || 10}% Discount</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
