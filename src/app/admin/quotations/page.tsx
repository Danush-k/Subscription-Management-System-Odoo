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
  AlertTriangle,
  Percent,
  MessageSquare,
  Check,
  X,
} from "lucide-react";

interface QuotationItem {
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

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Counter-offer modal
  const [reviewQuotation, setReviewQuotation] = useState<QuotationItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
        setAlertMessage({ type: "success", text: data.message || "Quotation marked as SENT and dispatched via email." });
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

  const handleConvertToSubscription = async (quot: QuotationItem) => {
    if (!confirm(`Convert quotation ${quot.quotationNumber} via Enterprise Offline PO / Net Terms? This creates the subscription and generates an initial invoice.`)) {
      return;
    }
    setProcessingId(quot.id);
    try {
      const res = await fetch(`/api/admin/quotations/${quot.id}/convert`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({
          type: "success",
          text: `Quotation ${quot.quotationNumber} successfully converted into active Subscription agreement!`,
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
    <div className="min-h-screen bg-[#F8F9FA] pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 flex items-center justify-center text-[#714B67] shrink-0 border border-[#714B67]/20">
              <BrightLoopModuleIcon appId="quotations" className="w-6 h-6" />
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

          <div className="flex items-center gap-2">
            <Link href="/staff/quotations/new">
              <Button
                size="sm"
                className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold gap-1.5 px-4 rounded-xl cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Quotation</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Toast Alert */}
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

        {/* Filter & Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by quotation #, customer, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-800"
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
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotation Cards Grid (3 Columns Desktop) */}
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
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              No quotations match the active status or search query.
            </p>
          </div>
        ) : (
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

                    <div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{quot.customerName}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{quot.customerEmail}</p>
                    </div>

                    {/* Pending Counter-Offer Highlight */}
                    {isCounterOffer && quot.pendingDiscount && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1 text-amber-950">
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
                      </div>
                    )}

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
                        <span className="text-slate-700 font-mono">{quot.validUntil}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-sm">
                        <span>Proposal Value:</span>
                        <span className="text-[#714B67] font-mono text-base">
                          ₹{quot.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                    {/* CASE 1: SUBSCRIBED */}
                    {isSubscribed ? (
                      <Link
                        href="/admin/subscriptions"
                        className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active Subscription ({quot.subscriptionNumber || "View"}) &rarr;</span>
                      </Link>
                    ) : isCounterOffer ? (
                      /* CASE 2: COUNTER-OFFER REVIEW */
                      <Button
                        onClick={() => setReviewQuotation(quot)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Review Counter-Offer</span>
                      </Button>
                    ) : quot.status === "DRAFT" ? (
                      /* CASE 3: DRAFT PROPOSAL */
                      <Button
                        onClick={() => handleSendQuotation(quot.id)}
                        disabled={isProcessing}
                        className="w-full bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold py-2 rounded-xl gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isProcessing ? "Sending..." : "Send to Client"}</span>
                      </Button>
                    ) : (
                      /* CASE 4: SENT / AWAITING PAYMENT (Allows Offline PO conversion) */
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>Awaiting Client Payment</span>
                        </span>
                        <Button
                          onClick={() => handleConvertToSubscription(quot)}
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
              <label className="text-xs font-bold text-slate-700">Admin Response Note (Optional):</label>
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
