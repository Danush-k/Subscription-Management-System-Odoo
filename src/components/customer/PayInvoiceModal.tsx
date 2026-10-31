"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Building2,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceItem } from "./types";

interface PayInvoiceModalProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayInvoiceModal({
  invoice,
  onClose,
  onSuccess,
}: PayInvoiceModalProps) {
  useEffect(() => {
    if (!invoice) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [invoice, onClose]);

  const outstanding = invoice ? Number(invoice.outstandingAmount) : 0;
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "BANK_TRANSFER" | "CREDIT_CARD">("UPI");
  const [amount, setAmount] = useState(outstanding.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!invoice) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/customer/invoices/${invoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          amount: Number(amount),
          transactionRef:
            paymentMethod === "UPI"
              ? `UPI/REF-${Math.floor(100000000000 + Math.random() * 900000000000)}`
              : paymentMethod === "CREDIT_CARD"
              ? `CARD-TXN-${Math.floor(100000 + Math.random() * 900000)}`
              : `UTR${Date.now()}`,
          notes: `Customer online settlement via ${paymentMethod}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Payment submission failed");
      setIsSubmitting(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose(e);
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden cursor-default relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Direct Payment Settlement
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Invoice #{invoice.invoiceNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close pay modal"
            className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-200/80 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handlePayment} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Amount Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Outstanding Balance
              </span>
              <div className="text-xl font-black text-slate-900">
                ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <Badge variant="overdue" className="text-xs">
              Due Now
            </Badge>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Select Settlement Channel:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === "UPI"
                    ? "border-[#714B67] bg-[#714B67]/5 text-[#714B67] font-bold shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-[11px]">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-[#714B67] bg-[#714B67]/5 text-[#714B67] font-bold shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-[11px]">NEFT / RTGS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === "CREDIT_CARD"
                    ? "border-[#714B67] bg-[#714B67]/5 text-[#714B67] font-bold shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[11px]">Cards</span>
              </button>
            </div>
          </div>

          {/* Method Details */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white text-xs space-y-2">
            {paymentMethod === "UPI" && (
              <div className="space-y-1">
                <div className="font-semibold text-slate-800">
                  Instant UPI Virtual Payment Address (VPA)
                </div>
                <div className="font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span>brightloop.billing@hdfcbank</span>
                  <Badge variant="outline" className="text-[10px]">Verified VPA</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports Google Pay, PhonePe, Paytm, and BHIM UPI.
                </p>
              </div>
            )}

            {paymentMethod === "BANK_TRANSFER" && (
              <div className="space-y-1 leading-relaxed text-slate-600">
                <div className="font-semibold text-slate-800">Direct Beneficiary Account</div>
                <div>Bank: <strong>HDFC Bank Ltd., Chennai</strong></div>
                <div>A/C: <strong className="font-mono">50200088921470</strong></div>
                <div>IFSC: <strong className="font-mono">HDFC0000124</strong></div>
              </div>
            )}

            {paymentMethod === "CREDIT_CARD" && (
              <div className="space-y-2">
                <div className="font-semibold text-slate-800">Corporate Card Settlement</div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  PCI-DSS Level 1 Secure Sandbox Channel Active
                </div>
              </div>
            )}
          </div>

          {/* Amount to Pay */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Payment Amount (INR):
            </label>
            <input
              type="number"
              step="0.01"
              max={outstanding}
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 text-sm font-black font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm cursor-pointer"
            >
              {isSubmitting ? "Settling..." : `Confirm Settlement (₹${Number(amount || 0).toLocaleString("en-IN")})`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
