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
  onToggleAutoRenew: (sub: SubscriptionItem) => void;
  loadingActionId: string | null;
}

export function SubscriptionCard({
  subscription,
  onViewDetails,
  onPauseResume,
  onCancel,
  onRenew,
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
        subscription.status === "ACTIVE"
          ? "border-slate-200/90"
          : subscription.status === "PAUSED"
          ? "border-amber-200/90 bg-amber-50/10"
          : "border-slate-200/60 opacity-90"
      }`}
    >
      <div className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
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
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
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

        {/* Right Column: Pricing & Quick Actions */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end justify-between gap-4 shrink-0 border-t xl:border-t-0 pt-4 xl:pt-0">
          <div className="text-left xl:text-right">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              <span className="text-xs font-semibold text-slate-400 ml-1">
                /{subscription.billingFrequency.toLowerCase()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {taxRate > 0 ? `Includes ₹${(total - unitPrice).toLocaleString("en-IN")} (${taxRate}% GST)` : "Zero-rated tax"}
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => onViewDetails(subscription)}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-slate-700 hover:text-[#714B67] hover:border-[#714B67]/40 gap-1"
            >
              <Sliders className="w-3.5 h-3.5 text-[#714B67]" />
              View Details
            </Button>

            {subscription.status === "ACTIVE" && subscription.plan.pauseAllowed && (
              <Button
                onClick={() => onPauseResume(subscription)}
                disabled={isActionLoading}
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-amber-700 hover:bg-amber-50 hover:border-amber-300 gap-1.5"
              >
                <PauseCircle className="w-3.5 h-3.5" />
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
                <PlayCircle className="w-3.5 h-3.5" />
                Resume
              </Button>
            )}

            {subscription.status !== "CLOSED" && subscription.plan.earlyClosureAllowed && (
              <Button
                onClick={() => onCancel(subscription)}
                disabled={isActionLoading}
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
