"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionItem } from "./types";

interface CancelSubscriptionModalProps {
  subscription: SubscriptionItem | null;
  onClose: () => void;
  onConfirm: (sub: SubscriptionItem, reason: string) => void;
  isLoading: boolean;
}

export function CancelSubscriptionModal({
  subscription,
  onClose,
  onConfirm,
  isLoading,
}: CancelSubscriptionModalProps) {
  useEffect(() => {
    if (!subscription) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [subscription, onClose, isLoading]);

  const [reason, setReason] = useState("Downsizing infrastructure / Cost optimization");
  const [customReason, setCustomReason] = useState("");

  if (!subscription) return null;

  const presetReasons = [
    "Downsizing infrastructure / Cost optimization",
    "Switching to alternative internal tooling",
    "Project completed / No longer needed",
    "Temporary pause preferred instead of cancellation",
    "Other (please specify below)",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason.includes("Other") ? customReason || "Customer cancelled without note" : reason;
    onConfirm(subscription, finalReason);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose(e);
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full overflow-hidden cursor-default relative"
      >
        {/* Header */}
        <div className="p-6 bg-rose-50/50 border-b border-rose-100 flex items-start gap-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Confirm Subscription Cancellation
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              You are requesting termination of <strong className="font-mono text-slate-900">{subscription.subscriptionNumber}</strong> ({subscription.plan?.name}).
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close cancellation dialog"
            className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-200/80 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800 space-y-1">
            <p className="font-bold">Important Notice:</p>
            <p>
              Per terms of service, cancellation will terminate recurring billing and revoke access to this module upon the end of the current billing cycle ({new Date(subscription.nextBillingDate).toLocaleDateString("en-IN")}).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Please let us know your primary reason:
            </label>
            <div className="space-y-1.5">
              {presetReasons.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-[#714B67] focus:ring-[#714B67]"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {reason.includes("Other") && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">
                Additional Feedback:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Share any comments or requirements..."
                rows={2}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="text-xs font-semibold cursor-pointer"
            >
              Keep Subscription
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              {isLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
