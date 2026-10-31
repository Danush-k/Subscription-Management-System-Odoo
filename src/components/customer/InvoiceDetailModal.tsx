"use client";

import React, { useEffect, useMemo } from "react";
import {
  X,
  Printer,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { BrightloopLogo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceItem } from "./types";
import {
  downloadInvoicePdf,
  printInvoiceDocument,
  InvoicePdfData,
  BRIGHTLOOP_COMPANY,
} from "@/lib/invoice/generateInvoicePdf";

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

  const pdfData = useMemo<InvoicePdfData | null>(() => {
    if (!invoice) return null;
    const total = Number(invoice.totalAmount);
    const paid = Number(invoice.paidAmount);
    const outstanding = Number(invoice.outstandingAmount);
    const subtotal = Number(invoice.subtotal);
    const tax = Number(invoice.taxAmount);
    const discount = Number(invoice.discountAmount || 0);

    return {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      billingPeriodStart: invoice.billingPeriodStart,
      billingPeriodEnd: invoice.billingPeriodEnd,
      subscriptionNumber: invoice.subscription?.subscriptionNumber,
      planName: invoice.subscription?.plan?.name || "Brightloop Cloud Subscription",
      status: invoice.status,
      customer: {
        name: invoice.customerSnapshot?.name || "Subscriber",
        companyName: invoice.customerSnapshot?.companyName,
        taxId: invoice.customerSnapshot?.taxId,
        billingAddress: invoice.customerSnapshot?.billingAddress,
      },
      lines: invoice.lines.map((l) => ({
        description: l.productName + (l.variantName ? ` - ${l.variantName}` : ""),
        hsnSac: "998314",
        quantity: l.quantity,
        unitPrice: Number(l.unitPrice),
        taxRate: Number(l.taxRate),
        taxAmount: Number(l.taxAmount),
        discountAmount: Number(l.discountAmount || 0),
        subtotal: Number(l.subtotal),
        total: Number(l.total),
      })),
      subtotal,
      taxAmount: tax,
      discountAmount: discount,
      totalAmount: total,
      paidAmount: paid,
      outstandingAmount: outstanding,
      payments: invoice.payments?.map((p) => ({
        paymentNumber: p.paymentNumber,
        paymentMethod: p.paymentMethod,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        transactionRef: p.transactionRef,
      })),
    };
  }, [invoice]);

  if (!invoice || !pdfData) return null;

  const formatDate = (isoStr: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoStr));
  };

  const handleDownloadPdf = () => {
    downloadInvoicePdf(pdfData);
  };

  const handlePrintInvoice = () => {
    printInvoiceDocument(pdfData);
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
  const discount = Number(invoice.discountAmount || 0);

  const isIntraState =
    !invoice.customerSnapshot?.taxId ||
    invoice.customerSnapshot.taxId.trim().startsWith("33") ||
    (invoice.customerSnapshot?.billingAddress?.state &&
      invoice.customerSnapshot.billingAddress.state.toLowerCase().includes("tamil nadu"));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden cursor-default relative my-6 sm:my-10"
      >
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-30 p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
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
              onClick={handleDownloadPdf}
              size="sm"
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white font-bold text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </Button>

            <Button
              type="button"
              onClick={handlePrintInvoice}
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer text-slate-700 hover:text-[#714B67]"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice
            </Button>

            {outstanding > 0 && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onPayInvoice(invoice);
                }}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-2xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Button>
            )}

            {/* High-visibility Close / Exit Button */}
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 gap-1.5 cursor-pointer px-3 py-1.5 shadow-2xs ml-1"
              aria-label="Exit and close invoice modal"
            >
              <X className="w-4 h-4 text-rose-600" />
              <span>Exit</span>
            </Button>
          </div>
        </div>

        {/* Printable Formal Invoice Document */}
        <div className="p-8 sm:p-12 space-y-8 bg-white">
          {/* Top Brand & Invoice Metadata (Fixed Overlapping Bug) */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2.5">
                <BrightloopLogo size="md" showText={false} />
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
                  bright<span className="text-[#714B67]">loop</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                {BRIGHTLOOP_COMPANY.name}<br />
                {BRIGHTLOOP_COMPANY.addressLine1}, {BRIGHTLOOP_COMPANY.addressLine2}<br />
                GSTIN: {BRIGHTLOOP_COMPANY.gstin} • CIN: {BRIGHTLOOP_COMPANY.cin}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#714B67] block">
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
              {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
                <p className="text-xs text-slate-500 font-mono">
                  Period: {formatDate(invoice.billingPeriodStart)} - {formatDate(invoice.billingPeriodEnd)}
                </p>
              )}
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
                  GSTIN: {invoice.customerSnapshot.taxId}
                </div>
              )}
              {invoice.customerSnapshot?.billingAddress && (
                <div className="text-slate-500 leading-relaxed mt-1">
                  {[
                    invoice.customerSnapshot.billingAddress.street,
                    invoice.customerSnapshot.billingAddress.city,
                    invoice.customerSnapshot.billingAddress.state,
                    invoice.customerSnapshot.billingAddress.postalCode,
                    invoice.customerSnapshot.billingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
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
              <thead className="bg-[#714B67] text-white font-bold uppercase text-[10px] border-b border-[#714B67]">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-3 text-center">HSN/SAC</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-center">GST Rate</th>
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
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                      998314
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-700">{l.quantity}</td>
                    <td className="py-3.5 px-4 text-right text-slate-700 font-mono">
                      ₹{Number(l.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-600 font-bold">
                      {Number(l.taxRate)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{Number(l.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & Tax Split Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#714B67] block">
                Bank &amp; Statutory Remittance Details
              </span>
              <div className="space-y-1 text-slate-600 leading-relaxed text-[11px]">
                <p><strong>Bank:</strong> {BRIGHTLOOP_COMPANY.bankDetails.bankName}</p>
                <p><strong>Account Name:</strong> {BRIGHTLOOP_COMPANY.bankDetails.accountName}</p>
                <p><strong>A/C No:</strong> <span className="font-mono">{BRIGHTLOOP_COMPANY.bankDetails.accountNumber}</span></p>
                <p><strong>IFSC:</strong> <span className="font-mono">{BRIGHTLOOP_COMPANY.bankDetails.ifscCode}</span> &bull; <strong>Branch:</strong> {BRIGHTLOOP_COMPANY.bankDetails.branch}</p>
                <p><strong>UPI ID:</strong> <span className="font-mono">{BRIGHTLOOP_COMPANY.bankDetails.upiId}</span></p>
                <p className="text-[10px] text-slate-400 mt-2">
                  Please quote <strong>{invoice.invoiceNumber}</strong> in NEFT/RTGS transaction remarks.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Trade Discount:</span>
                  <span className="font-mono font-bold">
                    - ₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {isIntraState ? (
                <>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Central GST (CGST 9%):</span>
                    <span className="font-mono">
                      ₹{(tax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>State GST (SGST 9%):</span>
                    <span className="font-mono">
                      ₹{(tax / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Integrated GST (IGST 18%):</span>
                  <span className="font-mono">
                    ₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
                <span>Total Gross Amount:</span>
                <span className="font-mono text-[#714B67]">
                  ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                <span>Amount Settled:</span>
                <span className="font-mono">
                  ₹{paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-1 text-rose-600 font-bold border-t border-slate-100 pt-2">
                <span>Outstanding Balance:</span>
                <span className="font-mono">
                  ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Log */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Recorded Settlement Transactions ({invoice.payments.length})
              </span>
              <div className="divide-y divide-slate-100 text-xs bg-slate-50 rounded-2xl border border-slate-100 p-4">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-slate-900">
                        {p.paymentNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(p.paymentDate)} • Method: {p.paymentMethod.replace("_", " ")}
                        {p.transactionRef && ` • Ref: ${p.transactionRef}`}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-emerald-700">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400 leading-relaxed">
            This is an authenticated computer-generated statutory Tax Invoice issued under Section 31 of CGST Act, 2017. Verified under the Information Technology Act. Questions? Contact billing@brightloopsoftware.com
          </div>
        </div>

        {/* Sticky Bottom Exit Bar */}
        <div className="sticky bottom-0 z-30 p-4 sm:p-5 bg-slate-50/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Viewing invoice <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-slate-700 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 gap-1.5 cursor-pointer px-4 shadow-2xs"
            >
              <X className="w-4 h-4 text-rose-500" />
              Exit / Close Receipt
            </Button>

            {outstanding > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  onPayInvoice(invoice);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer px-4 shadow-2xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
