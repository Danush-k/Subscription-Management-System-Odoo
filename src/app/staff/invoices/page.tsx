"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalNav } from "@/components/navigation/portal-nav";

type Payment = {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionRef: string | null;
  status: string;
  recordedByUser: { name: string; email: string } | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerEmail: string;
  subscriptionNumber: string | null;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  payments: Payment[];
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export default function StaffInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/staff/invoices", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Unable to load invoices");
      setInvoices(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load invoices");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function reversePayment(payment: Payment) {
    const reason = window.prompt(`Reason for reversing ${payment.paymentNumber}:`);
    if (!reason?.trim()) return;
    setBusy(payment.id);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/staff/invoices/${invoices.find((invoice) => invoice.payments.some((item) => item.id === payment.id))?.id}/reverse-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Unable to reverse payment");
      setMessage(`${payment.paymentNumber} was reversed and the invoice balance was reconciled.`);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to reverse payment");
    } finally {
      setBusy(null);
    }
  }

  const filtered = useMemo(() => invoices.filter((invoice) => {
    const query = search.toLowerCase();
    return (!query || invoice.invoiceNumber.toLowerCase().includes(query) || invoice.customer.toLowerCase().includes(query) || invoice.customerEmail.toLowerCase().includes(query))
      && (filter === "ALL" || invoice.status === filter);
  }), [filter, invoices, search]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20">
      <PortalNav portalType="staff" portalTitle="Staff Operations Portal" userName="Staff User" userRole="Invoice Operations" companyName="Brightloop Enterprise Ops" />
      <main className="dashboard-container pt-8 space-y-6">
        <div>
          <Link href="/staff/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-[#714B67] mb-3"><ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard</Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Invoice &amp; Payment Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Complete customer invoice history, partial payments, reconciliation, and receipts.</p>
        </div>
        {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice or customer" className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm" />
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
            <option value="ALL">All statuses</option><option value="CONFIRMED">Confirmed</option><option value="OVERDUE">Overdue</option><option value="PAID">Paid</option><option value="CANCELLED">Cancelled</option>
          </select>
          <Button variant="outline" onClick={() => void load()}><RotateCcw className="w-4 h-4 mr-2" /> Refresh</Button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filtered.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No invoices found.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Invoice</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Paid</th><th className="px-5 py-4">Outstanding</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((invoice) => (
                    <tr key={invoice.id} className="align-top">
                      <td className="px-5 py-4"><p className="font-bold">{invoice.invoiceNumber}</p><p className="text-xs text-slate-500">Due {date(invoice.dueDate)}</p></td>
                      <td className="px-5 py-4"><p className="font-semibold">{invoice.customer}</p><p className="text-xs text-slate-500">{invoice.customerEmail}</p></td>
                      <td className="px-5 py-4 font-semibold">{money(invoice.totalAmount)}</td><td className="px-5 py-4 text-emerald-700 font-semibold">{money(invoice.paidAmount)}</td><td className="px-5 py-4 text-rose-700 font-semibold">{money(invoice.outstandingAmount)}</td>
                      <td className="px-5 py-4"><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold">{invoice.status}</span></td>
                      <td className="px-5 py-4"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setExpanded(expanded === invoice.id ? null : invoice.id)}>{expanded === invoice.id ? "Hide" : "Payments"} ({invoice.payments.length})</Button><a href={`/api/staff/invoices/${invoice.id}/receipt`} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-semibold"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Receipt</a></div>
                        {expanded === invoice.id && <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-xs">{invoice.payments.length === 0 ? <p className="text-slate-500">No payments recorded.</p> : invoice.payments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3"><span><strong>{payment.paymentNumber}</strong> · {money(payment.amount)} · {payment.paymentMethod} · {payment.status}{payment.transactionRef ? ` · ${payment.transactionRef}` : ""}</span>{payment.status === "SUCCESS" && <button className="text-rose-700 font-bold" disabled={busy === payment.id} onClick={() => void reversePayment(payment)}>{busy === payment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Reverse"}</button>}</div>)}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
