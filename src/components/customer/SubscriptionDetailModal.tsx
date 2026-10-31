"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Layers,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Download,
  ShieldCheck,
  Tag,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscriptionItem, InvoiceItem } from "./types";

interface SubscriptionDetailModalProps {
  subscription: SubscriptionItem | null;
  onClose: () => void;
  onPauseResume: (sub: SubscriptionItem) => void;
  onCancel: (sub: SubscriptionItem) => void;
  onRenew: (sub: SubscriptionItem) => void;
  onToggleAutoRenew: (sub: SubscriptionItem) => void;
  onViewInvoice: (inv: InvoiceItem) => void;
  isActionLoading: boolean;
}

export function SubscriptionDetailModal({
  subscription,
  onClose,
  onPauseResume,
  onCancel,
  onRenew,
  onToggleAutoRenew,
  onViewInvoice,
  isActionLoading,
}: SubscriptionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "invoices">("overview");

  // Keyboard Escape listener to close
  useEffect(() => {
    if (!subscription) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [subscription, onClose]);

  if (!subscription) return null;

  const formatDate = (isoStr: string | null | undefined) => {
    if (!isoStr) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoStr));
  };

  const formatShortDate = (isoStr: string | null | undefined) => {
    if (!isoStr) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoStr));
  };

  const primaryLine = subscription.lines[0];
  const productName = primaryLine?.product?.name || subscription.plan?.name;
  const unitPrice = Number(primaryLine?.unitPrice || subscription.plan?.subscriptionPrice || 0);
  const taxRate = Number(primaryLine?.taxRate || 0);
  const discount = Number(primaryLine?.discountAmount || 0);
  const subtotal = Number(primaryLine?.subtotal || unitPrice);
  const total = Number(primaryLine?.total || subtotal);
  const taxAmount = total - subtotal + discount;

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden cursor-default relative"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {subscription.subscriptionNumber}
                </span>
                <Badge
                  variant={
                    subscription.status === "ACTIVE"
                      ? "active"
                      : subscription.status === "PAUSED"
                      ? "paused"
                      : "closed"
                  }
                  className="text-[11px] font-bold"
                >
                  {subscription.status}
                </Badge>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                {productName}
              </h2>
            </div>
          </div>

          {/* Top-Right Close 'X' Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 active:bg-slate-300 rounded-full transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-6 text-xs font-bold bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Subscription Overview &amp; Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "invoices"
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Invoices &amp; Billing History ({subscription.invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Lifecycle Activity Log ({subscription.histories.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Top Key Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Cadence
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block">
                    {subscription.billingFrequency}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Next Billing Date
                  </span>
                  <span className="text-sm font-bold text-odoo-800 mt-1 block font-mono">
                    {formatShortDate(subscription.nextBillingDate)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Payment Terms
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block">
                    {subscription.paymentTerms}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Auto-Renewal
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-800">
                      {subscription.autoRenew ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleAutoRenew(subscription)}
                      disabled={isActionLoading}
                      className="text-[10px] font-bold text-[#714B67] hover:underline cursor-pointer"
                    >
                      (Toggle)
                    </button>
                  </div>
                </div>
              </div>

              {/* Product and Plan Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Plan &amp; Product Specification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Plan Code &amp; Name:</span>
                    <span className="font-semibold text-slate-800">
                      {subscription.plan?.planCode} • {subscription.plan?.name}
                    </span>
                    {subscription.plan?.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {subscription.plan.description}
                      </p>
                    )}
                  </div>

                  {primaryLine?.variant && (
                    <div>
                      <span className="text-slate-400 block">Assigned Variant:</span>
                      <span className="font-semibold text-slate-800">
                        {primaryLine.variant.variantName} (SKU: {primaryLine.variant.sku})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial & Pricing Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recurring Financial Breakdown
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-600">Base Unit Subscription Price</span>
                    <span className="font-semibold text-slate-900">
                      ₹{unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="py-2.5 flex justify-between text-emerald-700">
                      <span>Early Bird SaaS Discount</span>
                      <span className="font-semibold">
                        -₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {taxRate > 0 && (
                    <div className="py-2.5 flex justify-between text-slate-600">
                      <span>GST Tax ({taxRate}%)</span>
                      <span className="font-semibold text-slate-900">
                        +₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="py-3 flex justify-between text-sm font-black text-slate-900 bg-slate-50/60 px-3 rounded-xl mt-2">
                    <span>Total Recurring Per {subscription.billingFrequency}</span>
                    <span className="text-[#714B67] text-base">
                      ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-4">
              {subscription.invoices.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No invoices generated yet for this subscription.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {subscription.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">
                            {inv.invoiceNumber}
                          </span>
                          <Badge variant={inv.status.toLowerCase() as any}>
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          Issued: {formatShortDate(inv.invoiceDate)} • Due: {formatShortDate(inv.dueDate)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-black text-slate-900">
                            ₹{Number(inv.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Paid: ₹{Number(inv.paidAmount).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-bold cursor-pointer"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {subscription.histories.map((h) => (
                  <div key={h.id} className="relative group text-xs">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-[#714B67] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#714B67]" />
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{h.action}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDate(h.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Transition: <Badge variant="outline" className="text-[10px]">{h.previousStatus}</Badge> &rarr; <Badge variant="active" className="text-[10px]">{h.newStatus}</Badge>
                      </p>
                      {h.note && (
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-100">
                          {h.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {subscription.status === "ACTIVE" && subscription.plan.pauseAllowed && (
              <Button
                type="button"
                onClick={() => onPauseResume(subscription)}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-amber-700 hover:bg-amber-50 border-amber-200 gap-1.5 cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" /> Pause Subscription
              </Button>
            )}

            {subscription.status === "PAUSED" && (
              <Button
                type="button"
                onClick={() => onPauseResume(subscription)}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 gap-1.5 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" /> Resume Subscription
              </Button>
            )}

            {(subscription.status === "CLOSED" || subscription.status === "EXPIRED") && (
              <Button
                type="button"
                onClick={() => onRenew(subscription)}
                disabled={isActionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <CreditCard className="w-4 h-4" /> Pay &amp; Renew Subscription
              </Button>
            )}

            {subscription.status === "ACTIVE" && Boolean((subscription.plan as any)?.renewalAllowed) && (
              <Button
                type="button"
                onClick={() => onRenew(subscription)}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Pay &amp; Renew Subscription
              </Button>
            )}

            {subscription.status !== "CLOSED" && subscription.plan.earlyClosureAllowed && (
              <Button
                type="button"
                onClick={() => onCancel(subscription)}
                disabled={isActionLoading}
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
              >
                Cancel Subscription
              </Button>
            )}
          </div>

          {/* Bottom-Right Close Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
