"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send,
  X,
  Building2,
  DollarSign,
  ShieldCheck,
  Calendar,
  ChevronRight,
  User,
  Headphones,
  Lock,
  ArrowRight,
  Receipt,
  Eye,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuotationItem, QuotationLineItem } from "./types";
import {
  RazorpayCheckoutModal,
  CheckoutPaymentDetails,
} from "./RazorpayCheckoutModal";

interface QuotationsSectionProps {
  quotations: QuotationItem[];
  customerName?: string;
  customerEmail?: string;
  onAcceptQuotation: (
    quotationId: string,
    paymentDetails?: CheckoutPaymentDetails
  ) => Promise<void>;
  onSendNegotiation: (
    quotationId: string,
    message: string,
    proposedDiscount?: number
  ) => Promise<void>;
  onViewSubscription: (subscriptionId: string) => void;
  isAccepting?: boolean;
}

export function QuotationsSection({
  quotations = [],
  customerName = "Customer",
  customerEmail = "billing@brightloop.io",
  onAcceptQuotation,
  onSendNegotiation,
  onViewSubscription,
  isAccepting = false,
}: QuotationsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "CONFIRMED">("ALL");

  // Selected quotation for itemized detail popup modal
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationItem | null>(null);

  // Negotiation thread state
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [proposedDiscount, setProposedDiscount] = useState("");
  const [isSubmittingNegotiation, setIsSubmittingNegotiation] = useState(false);

  // Active quotation in Razorpay Checkout modal
  const [checkoutQuotation, setCheckoutQuotation] = useState<QuotationItem | null>(null);

  const pendingCount = quotations.filter((q) => q.status === "QUOTATION").length;
  const confirmedCount = quotations.filter((q) => q.status === "CONFIRMED").length;

  const filteredQuotations = quotations.filter((q) => {
    if (activeFilter === "PENDING") return q.status === "QUOTATION";
    if (activeFilter === "CONFIRMED") return q.status === "CONFIRMED";
    return true;
  });

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleOpenDetailModal = (q: QuotationItem) => {
    setSelectedQuotation(q);
    setIsNegotiating(false);
    setNegotiationMessage("");
    setProposedDiscount("");
  };

  const handleSubmitNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation || !negotiationMessage.trim()) return;

    setIsSubmittingNegotiation(true);
    try {
      await onSendNegotiation(
        selectedQuotation.id,
        negotiationMessage.trim(),
        proposedDiscount ? Number(proposedDiscount) : undefined
      );
      setNegotiationMessage("");
      setProposedDiscount("");
      setIsNegotiating(false);
    } finally {
      setIsSubmittingNegotiation(false);
    }
  };

  const handleOpenCheckout = (q: QuotationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCheckoutQuotation(q);
  };

  const handlePaymentSuccess = async (details: CheckoutPaymentDetails) => {
    if (!checkoutQuotation) return;
    await onAcceptQuotation(checkoutQuotation.id, details);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#714B67]/10 flex items-center justify-center text-[#714B67] shrink-0 border border-[#714B67]/20">
              <FileCheck className="w-5 h-5 text-[#714B67]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Quotations &amp; Commercial Proposals
                </h2>
                {pendingCount > 0 && (
                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px] px-2 py-0.5">
                    {pendingCount} Pending Action
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review tailored proposals, negotiate terms in real-time, and securely activate subscriptions via Razorpay.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200/60">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({quotations.length})
            </button>
            <button
              onClick={() => setActiveFilter("PENDING")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "PENDING"
                  ? "bg-white text-amber-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter("CONFIRMED")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "CONFIRMED"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Confirmed ({confirmedCount})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPACT & EXECUTIVE PROPOSALS GRID                                        */}
      {/* ========================================================================= */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Proposals Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {activeFilter === "PENDING"
              ? "You do not have any pending quotations awaiting review or confirmation."
              : "No commercial proposals are currently on file for your account."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuotations.map((quotation) => {
            const isPending = quotation.status === "QUOTATION";
            const isConfirmed = quotation.status === "CONFIRMED";
            const isExpired = quotation.status === "EXPIRED";
            const negotiations = quotation.negotiations || [];

            return (
              <div
                key={quotation.id}
                onClick={() => handleOpenDetailModal(quotation)}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between group relative ${
                  isPending
                    ? "border-amber-300 ring-1 ring-amber-200/60 hover:border-amber-400"
                    : isConfirmed
                    ? "border-emerald-200/90 hover:border-emerald-300"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Quotation Number & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 group-hover:bg-[#714B67]/10 group-hover:text-[#714B67] px-2.5 py-1 rounded-lg transition-colors">
                      {quotation.quotationNumber}
                    </span>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pending Action
                      </span>
                    )}
                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Confirmed
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Expired
                      </span>
                    )}
                  </div>

                  {/* Plan Information */}
                  <div>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-[#714B67] transition-colors line-clamp-1">
                      {quotation.plan?.name || "Brightloop Enterprise Subscription"}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {quotation.plan?.billingFrequency || "MONTHLY"} Billing &bull; Terms: {quotation.paymentTerms || "IMMEDIATE"}
                    </p>
                  </div>

                  {/* Discount / Negotiation Callout */}
                  {Number(quotation.discountAmount) > 0 ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Approved Discount Applied: -{formatCurrency(quotation.discountAmount)}</span>
                    </div>
                  ) : (
                    quotation.status === "QUOTATION" && negotiations.length > 0 && (
                      (() => {
                        const latest = negotiations[negotiations.length - 1];
                        if (latest?.proposedDiscount) {
                          return (
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Discount Counter-Offer In Review ({latest.proposedDiscount}% Req.)</span>
                            </div>
                          );
                        }
                        return null;
                      })()
                    )
                  )}

                  {/* Proposal Value Callout */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Net Proposal Value
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {formatCurrency(quotation.totalAmount)}
                      </span>
                    </div>

                    {quotation.expiryDate && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Valid Until
                        </span>
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(quotation.expiryDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Negotiation Activity Badge */}
                  {negotiations.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#714B67] font-semibold">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{negotiations.length} message{negotiations.length > 1 ? "s" : ""} exchanged</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3.5 border-t border-slate-100 mt-3.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#714B67] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Breakdown</span>
                  </span>

                  {isPending && (
                    <Button
                      size="sm"
                      onClick={(e) => handleOpenCheckout(quotation, e)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 rounded-xl shadow-xs cursor-pointer active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Review &amp; Pay</span>
                    </Button>
                  )}

                  {isConfirmed && quotation.convertedSubscription?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewSubscription(quotation.convertedSubscription!.id);
                      }}
                      className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 text-xs font-bold rounded-xl"
                    >
                      <span>Active Sub &rarr;</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ITEMIZE QUOTATION DETAILS & NEGOTIATION POPUP                    */}
      {/* ========================================================================= */}
      {selectedQuotation && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setSelectedQuotation(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center font-black">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">
                      {selectedQuotation.quotationNumber}
                    </h3>
                    <Badge
                      className={
                        selectedQuotation.status === "QUOTATION"
                          ? "bg-amber-100 text-amber-800 border-amber-300 text-[10px]"
                          : selectedQuotation.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]"
                          : "bg-slate-100 text-slate-600 text-[10px]"
                      }
                    >
                      {selectedQuotation.status === "QUOTATION" ? "Pending Action" : selectedQuotation.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commercial Proposal &bull; Valid Until:{" "}
                    {new Date(selectedQuotation.expiryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedQuotation(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Info Banner */}
            {selectedQuotation.plan && (
              <div className="bg-[#714B67]/5 border border-[#714B67]/15 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold text-[#714B67] uppercase tracking-wider block">
                    Proposed SaaS Plan
                  </span>
                  <h4 className="font-black text-slate-900 text-sm mt-0.5">
                    {selectedQuotation.plan.name}
                  </h4>
                  {selectedQuotation.plan.description && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedQuotation.plan.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[#714B67]/30 text-[#714B67] font-bold text-xs">
                    {selectedQuotation.plan.billingFrequency} Billing
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">
                    Terms: {selectedQuotation.paymentTerms || "IMMEDIATE"}
                  </span>
                </div>
              </div>
            )}

            {/* Line Items Table */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Itemized Components &amp; Add-ons
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Tax (GST)</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {selectedQuotation.lines?.map((line, idx) => {
                      const prodName = line.product?.name || (line as any).productName || "Product License";
                      const varName = line.variant?.variantName || (line as any).variantName;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3">
                            <div className="font-bold">{prodName}</div>
                            {varName && (
                              <div className="text-[11px] text-slate-400">Edition: {varName}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">{line.quantity}</td>
                          <td className="py-3 px-3 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-500">{line.taxRate}%</td>
                          <td className="py-3 px-3 text-right font-black font-mono">{formatCurrency(line.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Taxable Subtotal:</span>
                <span className="font-mono">{formatCurrency(selectedQuotation.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax Breakdown (18%):</span>
                <span className="font-mono">{formatCurrency(selectedQuotation.taxAmount)}</span>
              </div>
              {Number(selectedQuotation.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Special Commercial Discount:</span>
                  <span className="font-mono">-{formatCurrency(selectedQuotation.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-900 text-sm">
                <span>Gross Payable Proposal:</span>
                <span className="font-mono text-[#714B67] text-base">
                  {formatCurrency(selectedQuotation.totalAmount)}
                </span>
              </div>
            </div>

            {/* Negotiation & Sales Feedback */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Sales Negotiation &amp; Real-Time Feedback</span>
                </span>
                {!isNegotiating && selectedQuotation.status === "QUOTATION" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsNegotiating(true)}
                    className="text-xs font-bold text-[#714B67] border-[#714B67]/30 hover:bg-[#714B67]/10"
                  >
                    Send Counter Offer
                  </Button>
                )}
              </div>

              {/* Chat Thread */}
              {selectedQuotation.negotiations && selectedQuotation.negotiations.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {selectedQuotation.negotiations.map((msg, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#714B67]">{msg.senderName}</span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate-700">{msg.message}</p>
                      {msg.proposedDiscount && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                          Target Discount: {msg.proposedDiscount}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Negotiation Input Form */}
              {isNegotiating && (
                <form onSubmit={handleSubmitNegotiation} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <textarea
                    rows={2}
                    value={negotiationMessage}
                    onChange={(e) => setNegotiationMessage(e.target.value)}
                    placeholder="Provide your feedback or counter-offer to the Brightloop sales team..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    required
                  />
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="number"
                      value={proposedDiscount}
                      onChange={(e) => setProposedDiscount(e.target.value)}
                      placeholder="Target discount %"
                      className="w-36 p-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsNegotiating(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmittingNegotiation}
                        className="bg-[#714B67] text-white text-xs font-bold"
                      >
                        {isSubmittingNegotiation ? "Sending..." : "Submit to Sales"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Bottom CTA Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuotation(null)}
                className="text-xs font-bold"
              >
                Close
              </Button>

              {selectedQuotation.status === "QUOTATION" && (
                <Button
                  onClick={() => {
                    const q = selectedQuotation;
                    setSelectedQuotation(null);
                    handleOpenCheckout(q);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 py-2.5 px-5 rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>Accept &amp; Pay {formatCurrency(selectedQuotation.totalAmount)} via Razorpay</span>
                </Button>
              )}

              {selectedQuotation.status === "CONFIRMED" && selectedQuotation.convertedSubscription?.id && (
                <Button
                  onClick={() => {
                    const subId = selectedQuotation.convertedSubscription!.id;
                    setSelectedQuotation(null);
                    onViewSubscription(subId);
                  }}
                  className="bg-[#714B67] text-white font-bold text-xs gap-1.5 rounded-xl"
                >
                  <span>Go to Active Subscription Agreement &rarr;</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RAZORPAY SECURE CHECKOUT GATEWAY WITH ANIMATIONS                 */}
      {/* ========================================================================= */}
      {checkoutQuotation && (
        <RazorpayCheckoutModal
          isOpen={Boolean(checkoutQuotation)}
          onClose={() => setCheckoutQuotation(null)}
          title={`Brightloop Software: ${checkoutQuotation.plan?.name || "Subscription Plan"}`}
          amount={Number(checkoutQuotation.totalAmount)}
          customerName={customerName}
          customerEmail={customerEmail}
          onPaymentSuccess={handlePaymentSuccess}
          successButtonText="View Active Subscription Agreement"
        />
      )}
    </div>
  );
}
