"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import { CreditCard, Search, CheckCircle2, ShieldCheck, Building } from "lucide-react";

interface PaymentItem {
  id: string;
  transactionRef: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: "UPI" | "CARD" | "BANK_TRANSFER" | "CASH";
  paidAt: string;
  status: "SETTLED" | "PENDING";
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: "pay-1",
    transactionRef: "TXN-2026-9901",
    invoiceNumber: "INV-2026-0086",
    customerName: "SSN Technology Labs Pvt. Ltd.",
    amount: 120000,
    paymentMethod: "BANK_TRANSFER",
    paidAt: "2026-10-31 09:14 AM",
    status: "SETTLED",
  },
  {
    id: "pay-2",
    transactionRef: "TXN-2026-9900",
    invoiceNumber: "INV-2026-0083",
    customerName: "Digital Dynamics Corp",
    amount: 14200,
    paymentMethod: "UPI",
    paidAt: "2026-10-28 02:45 PM",
    status: "SETTLED",
  },
  {
    id: "pay-3",
    transactionRef: "TXN-2026-9899",
    invoiceNumber: "INV-2026-0082",
    customerName: "BlueHorizon Logistics",
    amount: 25000,
    paymentMethod: "CARD",
    paidAt: "2026-10-21 11:20 AM",
    status: "SETTLED",
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = payments.filter(
    (p) =>
      p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrightLoopModuleIcon appId="payments" className="w-12 h-12" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Payment Transactions &amp; Settlements
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-channel payments (UPI, Cards, Bank Transfer) with partial settlement logs.
                </p>
              </div>
            </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Transaction Ref</th>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Settled Amount</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs">
                      {p.transactionRef}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[#714B67] font-semibold">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{p.customerName}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">{p.paidAt}</td>
                    <td className="py-4 px-6">
                      <Badge variant="active">{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
