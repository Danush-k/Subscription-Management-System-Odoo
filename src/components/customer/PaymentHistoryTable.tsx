"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Building2,
  QrCode,
  Search,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentRecord, InvoiceItem, SubscriptionItem } from "./types";

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
  invoices: InvoiceItem[];
  subscriptions?: SubscriptionItem[];
  onViewInvoice: (inv: InvoiceItem) => void;
  onPayAndRenew?: (sub: SubscriptionItem) => void;
}

export function PaymentHistoryTable({
  payments,
  invoices,
  subscriptions = [],
  onViewInvoice,
  onPayAndRenew,
}: PaymentHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (isoStr: string) => {
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

  // Identify ended, closed, expired, or due subscriptions
  const endedOrDueSubs = subscriptions.filter(
    (s) =>
      s.status === "CLOSED" ||
      s.status === "EXPIRED" ||
      (s.nextBillingDate && new Date(s.nextBillingDate) <= new Date())
  );

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.paymentNumber.toLowerCase().includes(q) ||
      (p.transactionRef || "").toLowerCase().includes(q) ||
      (p.invoice?.invoiceNumber || "").toLowerCase().includes(q) ||
      p.paymentMethod.toLowerCase().includes(q)
    );
  });

  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "UPI":
        return <QrCode className="w-3.5 h-3.5 text-[#714B67]" />;
      case "BANK_TRANSFER":
        return <Building2 className="w-3.5 h-3.5 text-[#714B67]" />;
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Dedicated Ended Subscriptions & Pending Renewal Payments Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              endedOrDueSubs.length > 0
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}>
              {endedOrDueSubs.length > 0 ? (
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Subscription Renewals &amp; End-of-Term Re-activations
                </h3>
                {endedOrDueSubs.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    {endedOrDueSubs.length} Action Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {endedOrDueSubs.length > 0
                  ? "Contracts that have ended, expired, or are pending cycle renewal. Settle payment to restore or continue access."
                  : "All subscription agreements are in good standing with zero overdue renewal payments."}
              </p>
            </div>
          </div>
        </div>

        {endedOrDueSubs.length > 0 ? (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {endedOrDueSubs.map((sub) => {
              const primaryLine = sub.lines[0];
              const productName = primaryLine?.product?.name || sub.plan?.name || "Subscription Service";
              const totalAmount =
                sub.lines.reduce((acc, l) => acc + Number(l.total || l.subtotal || 0), 0) ||
                Number(sub.plan?.subscriptionPrice || 0);
              const isEnded = sub.status === "CLOSED" || sub.status === "EXPIRED";

              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    isEnded
                      ? "bg-rose-50/30 border-rose-200"
                      : "bg-amber-50/30 border-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {sub.subscriptionNumber}
                        </span>
                        <Badge
                          variant={isEnded ? "closed" : "paused"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {sub.status === "CLOSED"
                            ? "ENDED / CANCELLED"
                            : sub.status === "EXPIRED"
                            ? "EXPIRED"
                            : "RENEWAL DUE"}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">
                        {productName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {isEnded ? "Ended On: " : "Cycle Due: "}
                          <strong className="text-slate-700">
                            {formatShortDate(sub.expiryDate || sub.nextBillingDate)}
                          </strong>
                        </span>
                        <span>&bull;</span>
                        <span>{sub.billingFrequency}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Payable</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#714B67]" />
                      <span>Instant reactivation via Razorpay</span>
                    </span>

                    <Button
                      size="sm"
                      onClick={() => onPayAndRenew && onPayAndRenew(sub)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay &amp; Renew</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 sm:p-5 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No expired or overdue subscription renewals. All services active.</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {subscriptions.filter((s) => s.status === "ACTIVE").length} active subscriptions
            </span>
          </div>
        )}
      </div>

      {/* Payment Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Lifetime Remittances
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            ₹{totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Across {payments.length} successful transactions
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Settled Invoices
          </span>
          <div className="text-xl font-black text-[#714B67] mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-[#714B67]" />
            {invoices.filter((i) => i.status === "PAID").length} Invoices
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            100% bank reconciled
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Latest Remittance Date
          </span>
          <div className="text-base font-black text-slate-800 mt-1 font-mono">
            {payments[0] ? formatDate(payments[0].paymentDate) : "No transactions"}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Automatic receipt generation
          </span>
        </div>
      </div>

      {/* Search & Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#714B67] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by receipt #, UTR, invoice #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-800"
            />
          </div>

          <Badge variant="outline" className="text-xs">
            {filteredPayments.length} records
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Receipt #</th>
                <th className="py-3.5 px-6">Invoice Ref</th>
                <th className="py-3.5 px-6">Channel / Method</th>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Transaction / UTR Ref</th>
                <th className="py-3.5 px-6 text-right">Amount Paid</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const relatedInvoice = invoices.find(
                    (i) => i.id === p.invoiceId || i.invoiceNumber === p.invoice?.invoiceNumber
                  );

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {p.paymentNumber}
                      </td>

                      <td className="py-4 px-6">
                        {relatedInvoice ? (
                          <button
                            onClick={() => onViewInvoice(relatedInvoice)}
                            className="font-mono font-semibold text-[#714B67] hover:underline flex items-center gap-1"
                          >
                            {relatedInvoice.invoiceNumber}
                            <ArrowUpRight className="w-3 h-3 text-[#714B67]" />
                          </button>
                        ) : (
                          <span className="font-mono text-slate-600">
                            {p.invoice?.invoiceNumber || "General Account"}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          {getMethodIcon(p.paymentMethod)}
                          {p.paymentMethod.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-500 font-mono">
                        {formatDate(p.paymentDate)}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-600 text-[11px]">
                        {p.transactionRef || "N/A"}
                      </td>

                      <td className="py-4 px-6 text-right font-black text-emerald-700">
                        ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Badge variant="paid" className="text-[10px]">
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
