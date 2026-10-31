"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Loader2, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalNav } from "@/components/navigation/portal-nav";

type Customer = {
  id: string;
  customerNumber: string;
  name: string;
  companyName: string;
  email: string;
  phone: string | null;
  taxId: string | null;
  city: string | null;
  state: string | null;
  status: "ACTIVE" | "INACTIVE";
  activeSubscriptions: number;
  totalSpent: number;
  counts: { quotations: number; subscriptions: number; invoices: number; payments: number };
};

type CustomerDetails = Customer & {
  billingAddress: unknown;
  subscriptions: Array<{ subscriptionNumber: string; status: string; plan: { name: string }; nextBillingDate: string; histories: Array<{ action: string; newStatus: string }> }>;
  quotations: Array<{ quotationNumber: string; status: string; totalAmount: number; plan: { name: string } }>;
  invoices: Array<{ invoiceNumber: string; status: string; totalAmount: number; paidAmount: number; outstandingAmount: number; payments: Array<{ paymentNumber: string; amount: number; status: string }> }>;
  payments: Array<{ paymentNumber: string; amount: number; status: string; invoice: { invoiceNumber: string } }>;
};

const money = (value: number) => `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      const response = await fetch(`/api/staff/customers?${params}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Unable to load customers");
      setCustomers(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCustomers(), 250);
    return () => window.clearTimeout(timer);
  }, [search, status]);

  async function openDetails(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/staff/customers/${id}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Unable to load customer");
      setDetails(payload.data);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Unable to load customer");
    }
  }

  const activeCount = useMemo(() => customers.filter((customer) => customer.status === "ACTIVE").length, [customers]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20">
      <PortalNav portalType="staff" portalTitle="Staff Operations Portal" userName="Staff User" userRole="Customer Operations" companyName="Brightloop Enterprise Ops" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <Link href="/staff/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-[#714B67] mb-3"><ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard</Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Customer &amp; Account Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Read-only customer records, account history, and financial activity.</p>
        </div>
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Customers shown</p><p className="text-2xl font-black">{customers.length}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Active accounts</p><p className="text-2xl font-black text-emerald-700">{activeCount}</p></div>
          <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Inactive history</p><p className="text-2xl font-black text-slate-700">{customers.length - activeCount}</p></div>
          <div className="flex items-center justify-end rounded-2xl border bg-white p-4"><Button variant="outline" onClick={() => void loadCustomers()}><RotateCcw className="w-4 h-4 mr-2" /> Refresh</Button></div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, company, GSTIN, or email" className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border bg-white px-4 py-2.5 text-sm"><option value="ALL">All customers</option><option value="ACTIVE">Active only</option><option value="INACTIVE">Inactive only</option></select>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {loading ? <div className="flex justify-center gap-2 p-12 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading customers...</div> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Subscriptions</th><th className="px-5 py-4">History</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{customers.map((customer) => <tr key={customer.id}><td className="px-5 py-4"><p className="font-bold">{customer.companyName}</p><p className="text-xs text-slate-500">{customer.customerNumber} · {customer.name}</p></td><td className="px-5 py-4"><p>{customer.email}</p><p className="text-xs text-slate-500">{customer.city ?? "—"}, {customer.state ?? "—"}</p></td><td className="px-5 py-4 font-semibold">{customer.activeSubscriptions} active / {customer.counts.subscriptions} total</td><td className="px-5 py-4 text-xs text-slate-600">{customer.counts.quotations} quotations · {customer.counts.invoices} invoices · {customer.counts.payments} payments</td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${customer.status === "ACTIVE" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}>{customer.status}</span></td><td className="px-5 py-4"><Button size="sm" variant="outline" onClick={() => void openDetails(customer.id)}>View details <ChevronDown className="ml-1 h-3.5 w-3.5" /></Button></td></tr>)}</tbody></table></div>}
        </div>
        {details && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 p-4"><div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase text-slate-400">{details.status}</p><h2 className="text-2xl font-black">{details.companyName}</h2><p className="text-sm text-slate-500">{details.email} · {details.phone ?? "No phone"}</p></div><Button variant="outline" onClick={() => setDetails(null)}>Close</Button></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Subscriptions</p><p className="text-xl font-bold">{details.subscriptions.length}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Quotations</p><p className="text-xl font-bold">{details.quotations.length}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Invoices</p><p className="text-xl font-bold">{details.invoices.length}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Payments</p><p className="text-xl font-bold">{details.payments.length}</p></div></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><section><h3 className="mb-2 font-bold">Subscriptions</h3><div className="space-y-2 text-sm">{details.subscriptions.map((item) => <div key={item.subscriptionNumber} className="rounded-lg border p-3"><strong>{item.subscriptionNumber}</strong> · {item.plan.name} · {item.status}</div>)}</div></section><section><h3 className="mb-2 font-bold">Quotations</h3><div className="space-y-2 text-sm">{details.quotations.map((item) => <div key={item.quotationNumber} className="rounded-lg border p-3"><strong>{item.quotationNumber}</strong> · {item.plan.name} · {item.status} · {money(Number(item.totalAmount))}</div>)}</div></section><section><h3 className="mb-2 font-bold">Invoices</h3><div className="space-y-2 text-sm">{details.invoices.map((item) => <div key={item.invoiceNumber} className="rounded-lg border p-3"><strong>{item.invoiceNumber}</strong> · {item.status} · Paid {money(item.paidAmount)} / {money(item.totalAmount)}</div>)}</div></section><section><h3 className="mb-2 font-bold">Payments</h3><div className="space-y-2 text-sm">{details.payments.map((item) => <div key={item.paymentNumber} className="rounded-lg border p-3"><strong>{item.paymentNumber}</strong> · {money(item.amount)} · {item.status} · {item.invoice.invoiceNumber}</div>)}</div></section></div></div></div>}
      </main>
    </div>
  );
}
