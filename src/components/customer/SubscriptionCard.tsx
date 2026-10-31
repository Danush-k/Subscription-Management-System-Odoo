"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Layers,
  PauseCircle,
  PlayCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Shield,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sliders,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubscriptionItem } from "./types";

interface SubscriptionCardProps {
  subscription: SubscriptionItem;
  onViewDetails: (sub: SubscriptionItem) => void;
  onPauseResume: (sub: SubscriptionItem) => void;
  onCancel: (sub: SubscriptionItem) => void;
  onRenew: (sub: SubscriptionItem) => void;
  onPayAndRenew?: (sub: SubscriptionItem) => void;
  onToggleAutoRenew: (sub: SubscriptionItem) => void;
  loadingActionId: string | null;
}

export function SubscriptionCard({
  subscription,
  onViewDetails,
  onPauseResume,
  onCancel,
  onRenew,
  onPayAndRenew,
  onToggleAutoRenew,
  loadingActionId,
}: SubscriptionCardProps) {
  const isActionLoading = loadingActionId === subscription.id;

  // Format dates
  const formatDate = (isoStr: string | null | undefined) => {
    if (!isoStr) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoStr));
  };

  // Determine line details
  const primaryLine = subscription.lines[0];
  const productName = primaryLine?.product?.name || subscription.plan?.name || "Subscription Service";
  const variantName = primaryLine?.variant?.variantName || null;
  const quantity = primaryLine?.quantity || 1;
  const unitPrice = Number(primaryLine?.unitPrice || subscription.plan?.subscriptionPrice || 0);
  const taxRate = Number(primaryLine?.taxRate || 0);
  const total = Number(primaryLine?.total || unitPrice);

  const isEnded = subscription.status === "CLOSED" || subscription.status === "EXPIRED";
  const isDue = Boolean(
    subscription.nextBillingDate &&
    new Date(subscription.nextBillingDate) <= new Date()
  );

  const statusVariantMap: Record<string, "active" | "paused" | "closed" | "expired" | "draft"> = {
    ACTIVE: "active",
    PAUSED: "paused",
    CLOSED: "closed",
    EXPIRED: "expired",
    DRAFT: "draft",
    QUOTATION: "draft",
    CONFIRMED: "active",
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md ${
        isEnded
          ? "border-rose-200/90 bg-rose-50/20"
          : subscription.status === "ACTIVE"
          ? "border-slate-200/90"
          : subscription.status === "PAUSED"
          ? "border-amber-200/90 bg-amber-50/10"
          : "border-slate-200/60 opacity-90"
      }`}
    >
      {/* Informative Renewal Alert Banner for Ended or Due Subscriptions */}
      {isEnded && (
        <div className="bg-rose-50 border-b border-rose-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Subscription Ended:</strong> This SaaS license agreement has terminated. Pay renewal to restore access immediately.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => (onPayAndRenew ? onPayAndRenew(subscription) : onRenew(subscription))}
            disabled={isActionLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Pay &amp; Renew Now
          </Button>
        </div>
      )}

      {!isEnded && isDue && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Renewal Billing Due:</strong> Payment required for next cycle ({formatDate(subscription.nextBillingDate)}).
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => (onPayAndRenew ? onPayAndRenew(subscription) : onRenew(subscription))}
            disabled={isActionLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Pay Renewal
          </Button>
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6">
        {/* Left Column: Product & Plan Meta */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={statusVariantMap[subscription.status] || "draft"}
              className="text-xs font-bold py-0.5 px-2.5 uppercase tracking-wide"
            >
              {subscription.status}
            </Badge>

            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {subscription.subscriptionNumber}
            </span>

            <Badge variant="outline" className="text-xs text-slate-600 font-semibold">
              {subscription.billingFrequency} Cadence
            </Badge>

            {subscription.autoRenew ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-[#714B67]" /> Auto-Renew Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Auto-Renew Off
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              {productName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Plan: <strong className="text-slate-700 font-semibold">{subscription.plan?.name}</strong></span>
              {variantName && (
                <>
                  <span>•</span>
                  <span>Edition/Tier: <strong className="text-slate-700 font-semibold">{variantName}</strong></span>
                </>
              )}
              <span>•</span>
              <span>Units/Seats: <strong className="text-slate-700 font-semibold">{quantity}</strong></span>
              <span>•</span>
              <span>Terms: <strong className="text-slate-700 font-semibold">{subscription.paymentTerms}</strong></span>
            </p>
          </div>

          {/* Grid of Key Lifecycle Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-600">
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Started On
              </span>
              <span className="font-semibold text-slate-800">{formatDate(subscription.startDate)}</span>
            </div>

            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Next Billing Date
              </span>
              <span className="font-semibold text-[#714B67] font-mono">
                {formatDate(subscription.nextBillingDate)}
              </span>
            </div>

            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Contract Expiry
              </span>
              <span className="font-semibold text-slate-700">
                {subscription.expiryDate ? formatDate(subscription.expiryDate) : "Continuous Renewal"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Quick Actions (Refined Digits Size & Clean Alignment) */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:self-stretch gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
          <div className="text-left lg:text-right">
            <div className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-400 ml-1">
                /{subscription.billingFrequency.toLowerCase()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {taxRate > 0 ? `Includes ₹${(total - unitPrice).toLocaleString("en-IN")} (${taxRate}% GST)` : "Zero-rated tax"}
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2">
            <Button
              onClick={() => onViewDetails(subscription)}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-slate-700 hover:text-[#714B67] hover:border-[#714B67]/40 gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-[#714B67]" />
              View Details
            </Button>

            {isEnded && (
              <Button
                onClick={() => (onPayAndRenew ? onPayAndRenew(subscription) : onRenew(subscription))}
                disabled={isActionLoading}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay &amp; Renew
              </Button>
            )}

            {subscription.status === "ACTIVE" && (
              <Button
                onClick={() => (onPayAndRenew ? onPayAndRenew(subscription) : onRenew(subscription))}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-300 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Pay &amp; Renew
              </Button>
            )}

            {subscription.status === "ACTIVE" && subscription.plan.pauseAllowed && (
              <Button
                onClick={() => onPauseResume(subscription)}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-amber-700 hover:bg-amber-50 hover:border-amber-300 gap-1.5"
              >
                <PauseCircle className="w-3.5 h-3.5 text-[#714B67]" />
                Pause
              </Button>
            )}

            {subscription.status === "PAUSED" && (
              <Button
                onClick={() => onPauseResume(subscription)}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#714B67]" />
                Resume
              </Button>
            )}

            {subscription.status !== "CLOSED" && subscription.plan.earlyClosureAllowed && (
              <Button
                onClick={() => onCancel(subscription)}
                disabled={isActionLoading}
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
