"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Pause, Play, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalNav } from "@/components/navigation/portal-nav";

type SubscriptionStatus =
  | "DRAFT"
  | "QUOTATION"
  | "CONFIRMED"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "EXPIRED";

type StaffSubscription = {
  id: string;
  subscriptionNumber: string;
  customer: string;
  customerEmail: string;
  plan: string;
  status: SubscriptionStatus;
  billingFrequency: string;
  startDate: string;
  nextBillingDate: string;
  policies: {
    pauseAllowed: boolean;
    earlyClosureAllowed: boolean;
    renewalAllowed: boolean;
  };
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function statusClass(status: SubscriptionStatus) {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "PAUSED") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "CLOSED" || status === "EXPIRED") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export default function StaffSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<StaffSubscription[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadSubscriptions() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/staff/subscriptions", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Unable to load subscriptions");
      }
      setSubscriptions(payload.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load subscriptions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSubscriptions();
  }, []);

  async function runAction(subscription: StaffSubscription, action: "ACTIVATE" | "PAUSE" | "RESUME" | "CLOSE") {
    setBusyId(subscription.id);
    setNotice(null);
    setError(null);
    try {
      const response = await fetch(`/api/staff/subscriptions/${subscription.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Unable to update subscription");
      }
      setNotice(`${subscription.subscriptionNumber} updated successfully.`);
      await loadSubscriptions();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update subscription");
    } finally {
      setBusyId(null);
    }
  }

  const filteredSubscriptions = useMemo(
    () =>
      subscriptions.filter((subscription) => {
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          subscription.subscriptionNumber.toLowerCase().includes(query) ||
          subscription.customer.toLowerCase().includes(query) ||
          subscription.customerEmail.toLowerCase().includes(query) ||
          subscription.plan.toLowerCase().includes(query);
        return matchesSearch && (statusFilter === "ALL" || subscription.status === statusFilter);
      }),
    [search, statusFilter, subscriptions]
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-20">
      <PortalNav
        portalType="staff"
        portalTitle="Staff Operations Portal"
        userName="Staff User"
        userRole="Subscription Management"
        companyName="Brightloop Enterprise Ops"
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link href="/staff/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-[#714B67] mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Subscription Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review customer subscriptions and apply policy-validated lifecycle actions.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadSubscriptions()} disabled={loading}>
            <RotateCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {notice && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> {notice}
          </div>
        )}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, plan, or subscription number"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#714B67]"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
          >
            <option value="ALL">All statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="CLOSED">Closed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading subscriptions...
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">No subscriptions match the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Subscription</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Plan</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Next billing</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscriptions.map((subscription) => {
                    const busy = busyId === subscription.id;
                    return (
                      <tr key={subscription.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{subscription.subscriptionNumber}</p>
                          <p className="text-xs text-slate-500">{subscription.billingFrequency}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{subscription.customer}</p>
                          <p className="text-xs text-slate-500">{subscription.customerEmail}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{subscription.plan}</p>
                          <p className="text-xs text-slate-500">Started {formatDate(subscription.startDate)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(subscription.status)}`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium">{subscription.status === "CLOSED" ? "—" : formatDate(subscription.nextBillingDate)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {subscription.status === "CONFIRMED" && (
                              <Button size="sm" onClick={() => void runAction(subscription, "ACTIVATE")} disabled={busy}>
                                <Play className="w-3.5 h-3.5 mr-1" /> Activate
                              </Button>
                            )}
                            {subscription.status === "ACTIVE" && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => void runAction(subscription, "PAUSE")} disabled={busy || !subscription.policies.pauseAllowed}>
                                  <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => void runAction(subscription, "CLOSE")} disabled={busy || !subscription.policies.earlyClosureAllowed}>
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Close
                                </Button>
                              </>
                            )}
                            {subscription.status === "PAUSED" && (
                              <>
                                <Button size="sm" onClick={() => void runAction(subscription, "RESUME")} disabled={busy}>
                                  <Play className="w-3.5 h-3.5 mr-1" /> Resume
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => void runAction(subscription, "CLOSE")} disabled={busy || !subscription.policies.earlyClosureAllowed}>
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Close
                                </Button>
                              </>
                            )}
                            {busy && <Loader2 className="w-4 h-4 animate-spin self-center text-slate-400" />}
                          </div>
                          <p className="mt-2 text-[11px] text-slate-400">
                            Pause: {subscription.policies.pauseAllowed ? "allowed" : "blocked"} · Early close: {subscription.policies.earlyClosureAllowed ? "allowed" : "blocked"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
