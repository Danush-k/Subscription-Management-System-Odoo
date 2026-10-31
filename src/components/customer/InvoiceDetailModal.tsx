"use client";

import React, { useEffect } from "react";
import {
  X,
  Printer,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { BrightloopLogo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceItem } from "./types";

interface InvoiceDetailModalProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
  onPayInvoice: (inv: InvoiceItem) => void;
}

export function InvoiceDetailModal({
  invoice,
  onClose,
  onPayInvoice,
}: InvoiceDetailModalProps) {
  useEffect(() => {
    if (!invoice) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [invoice, onClose]);

  if (!invoice) return null;

  const formatDate = (isoStr: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoStr));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const total = Number(invoice.totalAmount);
  const paid = Number(invoice.paidAmount);
  const outstanding = Number(invoice.outstandingAmount);
  const subtotal = Number(invoice.subtotal);
  const tax = Number(invoice.taxAmount);
  const discount = Number(invoice.discountAmount);

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
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden print:max-w-none print:shadow-none print:border-none print:rounded-none cursor-default relative"
      >
        {/* Modal Controls Bar (hidden during print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tax Invoice Document
            </span>
            <Badge variant={invoice.status === "PAID" ? "paid" : "overdue"}>
              {invoice.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>

            {outstanding > 0 && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onPayInvoice(invoice);
                }}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Button>
            )}

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close invoice dialog"
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 active:bg-slate-300 rounded-full transition-all cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Invoice Document */}
        <div className="p-8 sm:p-12 space-y-8 bg-white print:p-0">
          {/* Top Brand & Invoice Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2">
                <BrightloopLogo className="w-8 h-8" />
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
                  brightloop
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                Brightloop Software Technologies Pvt. Ltd.<br />
                Tidel Park, Tharamani, Chennai, TN - 600113<br />
                GSTIN: 33AABCB1234F1Z9 • CIN: U72900TN2024PTC123456
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                TAX INVOICE
              </span>
              <div className="font-mono text-xl font-black text-slate-900">
                {invoice.invoiceNumber}
              </div>
              <p className="text-xs text-slate-600">
                Invoice Date: <strong className="text-slate-900">{formatDate(invoice.invoiceDate)}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Payment Due Date: <strong className="text-slate-900">{formatDate(invoice.dueDate)}</strong>
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Period: {formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}
              </p>
            </div>
          </div>

          {/* Billed To Customer Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Billed To (Customer)
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {invoice.customerSnapshot?.companyName || invoice.customerSnapshot?.name}
              </div>
              {invoice.customerSnapshot?.taxId && (
                <div className="text-slate-600 font-mono">
                  GSTIN / Tax ID: {invoice.customerSnapshot.taxId}
                </div>
              )}
              {invoice.customerSnapshot?.billingAddress && (
                <div className="text-slate-500 leading-relaxed mt-1">
                  {invoice.customerSnapshot.billingAddress.street}, {invoice.customerSnapshot.billingAddress.city}, {invoice.customerSnapshot.billingAddress.state} - {invoice.customerSnapshot.billingAddress.postalCode}, {invoice.customerSnapshot.billingAddress.country}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Invoice Payment Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={invoice.status === "PAID" ? "paid" : "overdue"}
                  className="text-xs font-bold"
                >
                  {invoice.status}
                </Badge>
                {invoice.subscription && (
                  <span className="text-slate-500 text-xs font-mono">
                    Sub: {invoice.subscription.subscriptionNumber}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[11px] mt-2">
                Settled: ₹{paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })} • Outstanding: ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Tax Rate</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {l.productName}
                      {l.variantName && (
                        <span className="block text-[11px] font-normal text-slate-500">
                          Edition: {l.variantName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700">{l.quantity}</td>
                    <td className="py-3.5 px-4 text-right text-slate-700">
                      ₹{Number(l.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {Number(l.taxRate)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{Number(l.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end text-xs">
            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discounts Applied</span>
                  <span>-₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              {tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST Taxes (18% IGST/CGST)</span>
                  <span className="font-semibold text-slate-900">
                    +₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Due</span>
                <span className="text-[#714B67] text-base">
                  ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-xs text-emerald-700 font-semibold pt-1">
                <span>Paid Amount</span>
                <span>₹{paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              {outstanding > 0 && (
                <div className="flex justify-between text-xs text-amber-800 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <span>Remaining Balance</span>
                  <span>₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment History Attached to this Invoice */}
          {invoice.payments.length > 0 && (
            <div className="border-t border-slate-100 pt-6 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recorded Payments for this Invoice
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="font-mono font-bold text-slate-800">{p.paymentNumber}</span>
                      <span className="text-slate-500 text-[11px] ml-2">
                        {p.paymentMethod.replace("_", " ")} • {formatDate(p.paymentDate)}
                        {p.transactionRef && ` • Ref: ${p.transactionRef}`}
                      </span>
                    </div>
                    <span className="font-black text-emerald-700">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400 leading-relaxed">
            This is a computer-generated invoice verified under the Information Technology Act. Questions? Contact billing@brightloopsoftware.com
          </div>
        </div>
      </div>
    </div>
  );
}
