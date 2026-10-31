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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuotationItem, QuotationLineItem } from "./types";

interface QuotationsSectionProps {
  quotations: QuotationItem[];
  onAcceptQuotation: (quotationId: string) => Promise<void>;
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
  onAcceptQuotation,
  onSendNegotiation,
  onViewSubscription,
  isAccepting = false,
}: QuotationsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "CONFIRMED">("ALL");
  const [negotiatingQuotation, setNegotiatingQuotation] = useState<QuotationItem | null>(null);
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [proposedDiscount, setProposedDiscount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingCount = quotations.filter((q) => q.status === "QUOTATION").length;
  const confirmedCount = quotations.filter((q) => q.status === "CONFIRMED").length;

  const filteredQuotations = quotations.filter((q) => {
    if (activeFilter === "PENDING") return q.status === "QUOTATION";
    if (activeFilter === "CONFIRMED") return q.status === "CONFIRMED";
    return true;
  });

  const handleOpenNegotiation = (q: QuotationItem) => {
    setNegotiatingQuotation(q);
    setNegotiationMessage("");
    setProposedDiscount("");
  };

  const handleSubmitNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiatingQuotation || !negotiationMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await onSendNegotiation(
        negotiatingQuotation.id,
        negotiationMessage.trim(),
        proposedDiscount ? Number(proposedDiscount) : undefined
      );
      setNegotiatingQuotation(null);
      setNegotiationMessage("");
      setProposedDiscount("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
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
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Quotations &amp; Commercial Proposals
                </h2>
                {pendingCount > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px]">
                    {pendingCount} Pending Action
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review proposals dispatched by your Brightloop account team, negotiate custom terms, and confirm into active subscriptions.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({quotations.length})
            </button>
            <button
              onClick={() => setActiveFilter("PENDING")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeFilter === "PENDING"
                  ? "bg-white text-amber-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter("CONFIRMED")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
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

      {/* Quotations List */}
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
        <div className="space-y-6">
          {filteredQuotations.map((quotation) => {
            const isPending = quotation.status === "QUOTATION";
            const isConfirmed = quotation.status === "CONFIRMED";
            const negotiations = quotation.negotiations || [];

            return (
              <div
                key={quotation.id}
                className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                  isPending
                    ? "border-amber-200 ring-2 ring-amber-100/60"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {/* Quotation Header Bar */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-black text-slate-900">
                        {quotation.quotationNumber}
                      </span>
                      {isPending && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[11px] px-2.5 py-0.5">
                          Pending Client Action
                        </Badge>
                      )}
                      {isConfirmed && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[11px] px-2.5 py-0.5">
                          ✓ Confirmed &amp; Subscribed
                        </Badge>
                      )}
                      {quotation.status === "EXPIRED" && (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-300 font-bold text-[11px]">
                          Expired
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                      <span>Created: {new Date(quotation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>•</span>
                      {quotation.expiryDate && (
                        <span className="flex items-center gap-1 font-medium text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          Valid Until: {new Date(quotation.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      <span>•</span>
                      <span>Terms: <strong className="text-slate-700">{quotation.paymentTerms || "NET_30"}</strong></span>
                    </div>
                  </div>

                  {/* Right Header Status / Total */}
                  <div className="flex items-center gap-4 self-start lg:self-center">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Net Proposal Value
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900">
                        {formatCurrency(quotation.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plan & Line Items */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Plan Card Banner */}
                  {quotation.plan && (
                    <div className="p-4 rounded-xl bg-[#714B67]/5 border border-[#714B67]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#714B67] uppercase tracking-wider">
                          Proposed SaaS Subscription Plan
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                          {quotation.plan.name}
                        </h4>
                        {quotation.plan.description && (
                          <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                            {quotation.plan.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold text-[#714B67] border-[#714B67]/30 bg-white">
                          {quotation.plan.billingFrequency || "MONTHLY"} Billing
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Line Items Table */}
                  <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <tr>
                          <th className="py-2.5 px-4 text-left">Description / Component</th>
                          <th className="py-2.5 px-4 text-center w-20">Qty</th>
                          <th className="py-2.5 px-4 text-right w-28">Unit Price</th>
                          <th className="py-2.5 px-4 text-right w-24">Tax (GST)</th>
                          <th className="py-2.5 px-4 text-right w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quotation.lines.map((line, idx) => (
                          <tr key={line.id || idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {line.product?.name || quotation.plan?.name || "Enterprise SaaS License"}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-slate-700">
                              {line.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-700">
                              {formatCurrency(line.unitPrice)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-500">
                              {line.taxRate}% ({formatCurrency(line.taxAmount)})
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(line.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Breakdown & Totals */}
                  <div className="flex flex-col sm:flex-row justify-end">
                    <div className="w-full sm:w-72 bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-200/60 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Taxable Subtotal:</span>
                        <span className="font-mono font-semibold">{formatCurrency(quotation.subtotal)}</span>
                      </div>
                      {Number(quotation.discountAmount) > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Special Discount:</span>
                          <span className="font-mono">-{formatCurrency(quotation.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>GST Amount (18%):</span>
                        <span className="font-mono font-semibold">{formatCurrency(quotation.taxAmount)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-black text-sm">
                        <span>Gross Proposal Amount:</span>
                        <span className="font-mono text-[#714B67]">{formatCurrency(quotation.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Sales Negotiation & Messaging Thread */}
                  <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#714B67]" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Sales Negotiation &amp; Real-time Feedback
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {negotiations.length} message{negotiations.length === 1 ? "" : "s"} exchanged
                      </span>
                    </div>

                    {negotiations.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No negotiation notes yet. Click &quot;Negotiate / Request Revision&quot; below if you would like to request altered terms or pricing from our staff.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {negotiations.map((msg, index) => {
                          const isStaff = msg.senderRole === "STAFF" || msg.senderRole === "ADMIN";
                          return (
                            <div
                              key={msg.id || index}
                              className={`flex items-start gap-2.5 text-xs ${
                                isStaff ? "justify-start" : "justify-end"
                              }`}
                            >
                              {isStaff && (
                                <div className="w-6 h-6 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  <Headphones className="w-3 h-3" />
                                </div>
                              )}
                              <div
                                className={`rounded-xl p-3 max-w-lg border ${
                                  isStaff
                                    ? "bg-purple-50/80 border-[#714B67]/20 text-slate-800"
                                    : "bg-white border-slate-200 text-slate-900 shadow-2xs"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-4 mb-1">
                                  <span className="font-bold text-[11px] text-[#714B67]">
                                    {msg.senderName}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed text-slate-700">
                                  {msg.message}
                                </p>
                                {msg.proposedDiscount !== undefined && msg.proposedDiscount !== null && (
                                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/50 flex items-center gap-1.5">
                                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                                      Target Discount Requested: {msg.proposedDiscount}%
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {!isStaff && (
                                <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  <User className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {isPending ? (
                      <>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Accepting will immediately create your active recurring subscription.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleOpenNegotiation(quotation)}
                            className="border-[#714B67]/40 text-[#714B67] hover:bg-[#714B67]/10 text-xs font-bold gap-2 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Negotiate / Request Revision
                          </Button>
                          <Button
                            onClick={() => onAcceptQuotation(quotation.id)}
                            disabled={isAccepting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {isAccepting ? "Confirming..." : "Accept & Confirm Subscription"}
                          </Button>
                        </div>
                      </>
                    ) : isConfirmed ? (
                      <div className="w-full flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Subscription confirmed!{" "}
                            {quotation.convertedSubscription?.subscriptionNumber && (
                              <strong className="font-mono text-emerald-950 font-black">
                                ({quotation.convertedSubscription.subscriptionNumber})
                              </strong>
                            )}
                          </span>
                        </div>
                        {quotation.convertedSubscription?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewSubscription(quotation.convertedSubscription!.id)}
                            className="text-emerald-800 border-emerald-300 hover:bg-emerald-100 text-xs font-bold gap-1 cursor-pointer"
                          >
                            <span>View in My Subscriptions</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Negotiation Modal Dialog */}
      {negotiatingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#714B67]" />
                <h3 className="text-sm font-black text-slate-900">
                  Negotiate Proposal ({negotiatingQuotation.quotationNumber})
                </h3>
              </div>
              <button
                onClick={() => setNegotiatingQuotation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNegotiation} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Current Proposed Total:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(negotiatingQuotation.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Plan:</span>
                  <span className="font-semibold text-slate-800">{negotiatingQuotation.plan?.name || "Enterprise Tier"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Discount (%) or Custom Pricing Request
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="e.g. 10 for 10% off"
                  value={proposedDiscount}
                  onChange={(e) => setProposedDiscount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message to Brightloop Sales Team <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell our sales executive about your preferred payment cadence, seat requirements, or contract adjustments..."
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProposedDiscount("10");
                    setNegotiationMessage("We would like to confirm this subscription if you can provide a 10% annual billing discount.");
                  }}
                  className="text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 text-[#714B67] px-2.5 py-1 rounded-lg border border-purple-200 cursor-pointer"
                >
                  + Request 10% Discount
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNegotiationMessage("We request NET_60 payment terms instead of NET_30 to align with our procurement cycle.");
                  }}
                  className="text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 text-[#714B67] px-2.5 py-1 rounded-lg border border-purple-200 cursor-pointer"
                >
                  + Request NET_60 Terms
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNegotiatingQuotation(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !negotiationMessage.trim()}
                  className="bg-[#714B67] hover:bg-[#5a3b52] text-white text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Sending..." : "Send to Sales Staff"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

