"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  FileText,
  Download,
  CreditCard,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceItem } from "./types";

interface InvoicesTableProps {
  invoices: InvoiceItem[];
  onViewInvoice: (inv: InvoiceItem) => void;
  onPayInvoice: (inv: InvoiceItem) => void;
}

export function InvoicesTable({
  invoices,
  onViewInvoice,
  onPayInvoice,
}: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID" | "PARTIAL" | "OVERDUE">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatDate = (isoStr: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoStr));
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.subscription?.subscriptionNumber || "").toLowerCase().includes(q) ||
        (inv.lines[0]?.productName || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const outstanding = Number(inv.outstandingAmount);
      const paid = Number(inv.paidAmount);
      const total = Number(inv.totalAmount);
      const isOverdue = inv.status === "OVERDUE" || (outstanding > 0 && new Date(inv.dueDate) < new Date());

      if (statusFilter === "ALL") return true;
      if (statusFilter === "PAID") return inv.status === "PAID";
      if (statusFilter === "OVERDUE") return isOverdue;
      if (statusFilter === "PARTIAL") return paid > 0 && outstanding > 0;
      if (statusFilter === "UNPAID") return inv.status !== "PAID" && !isOverdue;

      return true;
    });
  }, [invoices, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
      {/* Table Controls: Search & Filter Chips */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#714B67] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, subscription ref, or item..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-800"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(
            [
              { id: "ALL", label: "All Invoices" },
              { id: "PAID", label: "Paid" },
              { id: "UNPAID", label: "Unpaid" },
              { id: "PARTIAL", label: "Partially Paid" },
              { id: "OVERDUE", label: "Overdue" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#714B67] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-6">Invoice #</th>
              <th className="py-3.5 px-6">Date &amp; Due</th>
              <th className="py-3.5 px-6">Subscription Reference</th>
              <th className="py-3.5 px-6">Billed Amount</th>
              <th className="py-3.5 px-6">Paid / Outstanding</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No invoices matched the selected filters.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => {
                const total = Number(inv.totalAmount);
                const paid = Number(inv.paidAmount);
                const outstanding = Number(inv.outstandingAmount);
                const isOverdue =
                  inv.status === "OVERDUE" || (outstanding > 0 && new Date(inv.dueDate) < new Date());

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Invoice # */}
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {formatDate(inv.invoiceDate)}
                      </div>
                      <div className={`text-[11px] ${isOverdue ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                        Due: {formatDate(inv.dueDate)}
                      </div>
                    </td>

                    {/* Subscription Ref */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">
                        {inv.lines[0]?.productName || "Subscription Service"}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {inv.subscription?.subscriptionNumber || "Standalone"}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-6 font-black text-slate-900">
                      ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Paid vs Outstanding */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-emerald-700">
                        Paid: ₹{paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      {outstanding > 0 ? (
                        <div className="font-bold text-amber-700 text-[11px]">
                          Due: ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">Settled</div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          isOverdue
                            ? "overdue"
                            : inv.status === "PAID"
                            ? "paid"
                            : "confirmed"
                        }
                        className="font-semibold text-[10px]"
                      >
                        {isOverdue ? "OVERDUE" : inv.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => onViewInvoice(inv)}
                          variant="outline"
                          size="sm"
                          className="text-[11px] font-bold text-slate-700 hover:text-[#714B67] hover:border-[#714B67]/40 gap-1 px-2.5 py-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#714B67]" /> View
                        </Button>

                        {outstanding > 0 && (
                          <Button
                            onClick={() => onPayInvoice(inv)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] gap-1 px-2.5 py-1 shadow-2xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {paginatedInvoices.length} of {filteredInvoices.length} invoices
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="text-xs h-8 px-2"
          >
            <ChevronLeft className="w-4 h-4 text-[#714B67]" />
          </Button>

          <span className="font-mono text-xs font-semibold px-2">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="text-xs h-8 px-2"
          >
            <ChevronRight className="w-4 h-4 text-[#714B67]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
