"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Filter,
  Download,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Building,
  Printer,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  subscriptionNumber: string;
  customerName: string;
  customerGstin: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: "DRAFT" | "CONFIRMED" | "PAID" | "OVERDUE" | "CANCELLED";
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-0086",
    subscriptionNumber: "SUB-2026-0042",
    customerName: "SSN Technology Labs Pvt. Ltd.",
    customerGstin: "GSTIN33SSN1234F1Z1",
    date: "2026-10-31",
    dueDate: "2026-11-15",
    subtotal: 101694.92,
    taxAmount: 18305.08,
    totalAmount: 120000,
    paidAmount: 120000,
    status: "PAID",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-0085",
    subscriptionNumber: "SUB-2026-0041",
    customerName: "Kalyan Retailers LLP",
    customerGstin: "GSTIN33KLY7788P1Z4",
    date: "2026-10-30",
    dueDate: "2026-11-14",
    subtotal: 15677.97,
    taxAmount: 2822.03,
    totalAmount: 18500,
    paidAmount: 0,
    status: "CONFIRMED",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-0084",
    subscriptionNumber: "SUB-2026-0036",
    customerName: "Apex Logistics & Supply",
    customerGstin: "GSTIN29APX9922Q1Z9",
    date: "2026-10-15",
    dueDate: "2026-10-25",
    subtotal: 30084.75,
    taxAmount: 5415.25,
    totalAmount: 35500,
    paidAmount: 0,
    status: "OVERDUE",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-0083",
    subscriptionNumber: "SUB-2026-0037",
    customerName: "Digital Dynamics Corp",
    customerGstin: "GSTIN33DIG4411M1Z2",
    date: "2026-10-28",
    dueDate: "2026-11-12",
    subtotal: 12033.9,
    taxAmount: 2166.1,
    totalAmount: 14200,
    paidAmount: 14200,
    status: "PAID",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2026-0082",
    subscriptionNumber: "SUB-2026-0038",
    customerName: "BlueHorizon Logistics",
    customerGstin: "GSTIN33BLU8822N1Z8",
    date: "2026-10-20",
    dueDate: "2026-11-04",
    subtotal: 38135.59,
    taxAmount: 6864.41,
    totalAmount: 45000,
    paidAmount: 25000,
    status: "CONFIRMED",
  },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleRegisterPayment = (inv: InvoiceItem) => {
    const outstanding = inv.totalAmount - inv.paidAmount;
    setInvoices((prev) =>
      prev.map((item) => {
        if (item.id === inv.id) {
          return {
            ...item,
            paidAmount: item.totalAmount,
            status: "PAID" as const,
          };
        }
        return item;
      })
    );
    if (selectedInvoice?.id === inv.id) {
      setSelectedInvoice({
        ...inv,
        paidAmount: inv.totalAmount,
        status: "PAID",
      });
    }
    setAlertMessage(`Payment of ₹${outstanding.toLocaleString("en-IN")} recorded for ${inv.invoiceNumber}. Invoice marked as PAID.`);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = totalInvoiced - totalCollected;
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Invoices & Tax Audits
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Immutable financial billing snapshots, tax breakdowns, and settlement reconciliation.
            </p>
          </div>
        </div>

        {alertMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{alertMessage}</span>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase">Invoiced Revenue</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalInvoiced.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Collected Revenue</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              ₹{totalCollected.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-xs">
            <p className="text-xs font-semibold text-amber-600 uppercase">Outstanding Receivables</p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-xs">
            <p className="text-xs font-semibold text-rose-600 uppercase">Overdue Invoices</p>
            <p className="text-2xl font-black text-rose-700 mt-1">{overdueCount}</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice #, subscription #, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "PAID", "CONFIRMED", "OVERDUE"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === status
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Customer & GSTIN</th>
                  <th className="py-3.5 px-6">Date / Due</th>
                  <th className="py-3.5 px-6">Subtotal</th>
                  <th className="py-3.5 px-6">Tax (18%)</th>
                  <th className="py-3.5 px-6">Total / Paid</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const balanceDue = inv.totalAmount - inv.paidAmount;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs">
                        {inv.invoiceNumber}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {inv.subscriptionNumber}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{inv.customerName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{inv.customerGstin}</div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <div>{inv.date}</div>
                        <div className="text-slate-400">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600 text-xs">
                        ₹{inv.subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600 text-xs">
                        ₹{inv.taxAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          ₹{inv.totalAmount.toLocaleString("en-IN")}
                        </div>
                        {balanceDue > 0 ? (
                          <div className="text-[11px] font-medium text-amber-600">
                            Due: ₹{balanceDue.toLocaleString("en-IN")}
                          </div>
                        ) : (
                          <div className="text-[11px] font-medium text-emerald-600">Paid in Full</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            inv.status === "PAID"
                              ? "success"
                              : inv.status === "OVERDUE"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Invoice Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {balanceDue > 0 && (
                            <button
                              onClick={() => handleRegisterPayment(inv)}
                              className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                              title="Register Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Detail Modal Drawer */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#714B67] text-white flex items-center justify-center font-bold text-sm">
                    B
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {selectedInvoice.invoiceNumber}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Brightloop Software Pvt. Ltd. • Tax Invoice
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* B2B Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-400 uppercase">Billed To:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedInvoice.customerName}
                  </p>
                  <p className="text-slate-600 mt-1 font-mono">
                    GSTIN: {selectedInvoice.customerGstin}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-400 uppercase">Invoice Date:</p>
                  <p className="font-medium text-slate-800">{selectedInvoice.date}</p>
                  <p className="font-semibold text-slate-400 uppercase mt-2">Due Date:</p>
                  <p className="font-medium text-slate-800">{selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-center">HSN/SAC</th>
                    <th className="py-2 text-right">Taxable Amt</th>
                    <th className="py-2 text-right">GST Rate</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">
                        Brightloop ERP SaaS Subscription
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Ref: {selectedInvoice.subscriptionNumber}
                      </div>
                    </td>
                    <td className="py-3 text-center font-mono">998314</td>
                    <td className="py-3 text-right font-mono">
                      ₹{selectedInvoice.subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right">18%</td>
                    <td className="py-3 text-right font-bold text-slate-900 font-mono">
                      ₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation breakdown */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    ₹{selectedInvoice.subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span className="font-mono">
                    ₹{(selectedInvoice.taxAmount / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span className="font-mono">
                    ₹{(selectedInvoice.taxAmount / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                  <span>Total Due:</span>
                  <span className="text-[#714B67] font-mono">
                    ₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Amount Paid:</span>
                  <span className="font-mono">
                    ₹{selectedInvoice.paidAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-2 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Tax Invoice
                </Button>

                {selectedInvoice.totalAmount > selectedInvoice.paidAmount && (
                  <Button
                    onClick={() => handleRegisterPayment(selectedInvoice)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Record Full Settlement
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
