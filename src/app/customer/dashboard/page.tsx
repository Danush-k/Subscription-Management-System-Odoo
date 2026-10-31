"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  RotateCcw,
  FileText,
  CreditCard,
  Building2,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  LayoutDashboard,
  ArrowRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Modular Customer Portal Components
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerWelcomeBanner } from "@/components/customer/CustomerWelcomeBanner";
import { CustomerOverviewCards } from "@/components/customer/CustomerOverviewCards";
import { SubscriptionCard } from "@/components/customer/SubscriptionCard";
import { SubscriptionDetailModal } from "@/components/customer/SubscriptionDetailModal";
import { CancelSubscriptionModal } from "@/components/customer/CancelSubscriptionModal";
import { InvoicesTable } from "@/components/customer/InvoicesTable";
import { InvoiceDetailModal } from "@/components/customer/InvoiceDetailModal";
import { PayInvoiceModal } from "@/components/customer/PayInvoiceModal";
import { PaymentHistoryTable } from "@/components/customer/PaymentHistoryTable";
import { BillingProfileSection } from "@/components/customer/BillingProfileSection";
import { ActivityTimeline } from "@/components/customer/ActivityTimeline";

// Types
import {
  PortalData,
  SubscriptionItem,
  InvoiceItem,
} from "@/components/customer/types";

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "overview";

  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTabState] = useState<
    "overview" | "subscriptions" | "invoices" | "payments" | "billing" | "activity"
  >(initialTab);

  const setActiveTab = (tab: any) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url.toString());
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTabState(tabParam as any);
    }
  }, [searchParams]);

  // Global action message banner
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal ID states (prevents object reference churn and infinite fetch loops)
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState<SubscriptionItem | null>(null);
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceItem | null>(null);

  // Derive current open items from loaded data
  const selectedSubscription = useMemo(() => {
    if (!selectedSubId || !data) return null;
    return data.subscriptions.find((s) => s.id === selectedSubId) || null;
  }, [selectedSubId, data]);

  const selectedInvoice = useMemo(() => {
    if (!selectedInvId || !data) return null;
    return data.invoices.find((i) => i.id === selectedInvId) || null;
  }, [selectedInvId, data]);

  // Action loading state
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Fetch real portal data from API (zero dependencies to avoid infinite re-render loop)
  const fetchPortalData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/customer/portal", { cache: "no-store" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Failed to load portal data`);
      }
      const json: PortalData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Portal load error:", err);
      setError(err.message || "Failed to load portal data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  // Subscription Actions: Pause / Resume
  const handlePauseResume = async (sub: SubscriptionItem) => {
    setLoadingActionId(sub.id);
    setIsSubmittingAction(true);
    const action = sub.status === "PAUSED" ? "resume" : "pause";

    try {
      const res = await fetch(`/api/customer/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || `Failed to ${action} subscription`);
      }

      setActionMessage({
        type: "success",
        text: `Subscription ${sub.subscriptionNumber} successfully ${
          action === "pause" ? "paused" : "resumed"
        }.`,
      });

      await fetchPortalData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || `Could not ${action} subscription`,
      });
    } finally {
      setLoadingActionId(null);
      setIsSubmittingAction(false);
    }
  };

  // Subscription Actions: Confirm Cancellation
  const handleConfirmCancel = async (sub: SubscriptionItem, reason: string) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/customer/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || "Failed to cancel subscription");
      }

      setActionMessage({
        type: "success",
        text: `Subscription ${sub.subscriptionNumber} has been successfully closed.`,
      });

      setCancellingSubscription(null);
      setSelectedSubId(null);
      await fetchPortalData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Cancellation failed",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Subscription Actions: Early Renewal
  const handleRenew = async (sub: SubscriptionItem) => {
    setLoadingActionId(sub.id);
    setIsSubmittingAction(true);

    try {
      const res = await fetch(`/api/customer/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renew" }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || "Failed to renew subscription");
      }

      setActionMessage({
        type: "success",
        text: `Subscription ${sub.subscriptionNumber} has been renewed early for the next billing cycle.`,
      });

      await fetchPortalData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Renewal failed",
      });
    } finally {
      setLoadingActionId(null);
      setIsSubmittingAction(false);
    }
  };

  // Toggle Auto-Renew
  const handleToggleAutoRenew = async (sub: SubscriptionItem) => {
    setLoadingActionId(sub.id);
    setIsSubmittingAction(true);

    try {
      const res = await fetch(`/api/customer/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleAutoRenew" }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || "Failed to toggle auto-renewal");
      }

      await fetchPortalData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to toggle auto-renew",
      });
    } finally {
      setLoadingActionId(null);
      setIsSubmittingAction(false);
    }
  };

  // Quick Pay Balance
  const handlePayBalance = () => {
    if (!data) return;
    const firstUnpaid = data.invoices.find((i) => Number(i.outstandingAmount) > 0);
    if (firstUnpaid) {
      setPayingInvoice(firstUnpaid);
    } else {
      setActiveTab("invoices");
    }
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Customer Self-Service Portal...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-3xl max-w-md w-full space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">
            Failed to connect to Customer Portal
          </h2>
          <p className="text-xs text-slate-500">{error || "Customer record not found"}</p>
          <Button
            onClick={() => {
              setIsLoading(true);
              fetchPortalData();
            }}
            size="sm"
            className="bg-[#714B67] text-white text-xs font-bold w-full"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col pb-20 font-sans">
      {/* 1. Header with Horizontal Tabs & Customer Profile */}
      <CustomerHeader
        customer={data.customer}
        notifications={data.notifications}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <main className="dashboard-container pt-6 space-y-6 flex-1">
        {/* Global Toast Alert Banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150 ${
              actionMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              {actionMessage.text}
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. Welcome & Account Overview Banner */}
        <CustomerWelcomeBanner
          customer={data.customer}
          metrics={data.metrics}
          onEditProfile={() => router.push("/customer/profile")}
          onPayBalance={handlePayBalance}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* 3. Subscription & Financial Summary Cards (6 Compact Metrics) */}
        <CustomerOverviewCards
          metrics={data.metrics}
          onSelectTab={(tab) => setActiveTab(tab)}
          onPayBalance={handlePayBalance}
        />

        {/* 4. Tab Content Sections */}

        {/* Tab 1: OVERVIEW COMPREHENSIVE VIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column: Subscriptions Snapshot */}
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#714B67]" />
                    Contracted SaaS Subscriptions ({data.subscriptions.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab("subscriptions")}
                    className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {data.subscriptions.slice(0, 2).map((sub) => (
                    <SubscriptionCard
                      key={sub.id}
                      subscription={sub}
                      onViewDetails={(s) => setSelectedSubId(s.id)}
                      onPauseResume={handlePauseResume}
                      onCancel={(s) => setCancellingSubscription(s)}
                      onRenew={handleRenew}
                      onToggleAutoRenew={handleToggleAutoRenew}
                      loadingActionId={loadingActionId}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Pending Invoices & Profile Quick Summary */}
              <div className="space-y-6">
                {/* Recent Invoices Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#714B67]" />
                      Recent Invoices
                    </h3>
                    <button
                      onClick={() => setActiveTab("invoices")}
                      className="text-xs font-bold text-[#714B67] hover:underline"
                    >
                      All ({data.invoices.length}) &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {data.invoices.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-slate-900">
                            {inv.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Due: {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <div>
                            <div className="font-bold text-slate-900">
                              ₹{Number(inv.totalAmount).toLocaleString("en-IN")}
                            </div>
                            <Badge variant={inv.status === "PAID" ? "paid" : "overdue"} className="text-[9px]">
                              {inv.status}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => setSelectedInvId(inv.id)}
                            variant="ghost"
                            size="sm"
                            className="text-[11px] font-bold h-7 px-2"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Entity Quick Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#714B67]" />
                      Client Organization
                    </h3>
                    <Link
                      href="/customer/profile"
                      className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1"
                    >
                      Edit Profile &rarr;
                    </Link>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {data.customer.companyName || data.customer.name}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      GSTIN: {data.customer.taxId || "Not Registered"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {data.customer.billingAddress?.city}, {data.customer.billingAddress?.state}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Timeline Section in Overview */}
            <div className="pt-2">
              <ActivityTimeline timeline={data.timeline.slice(0, 5)} />
            </div>
          </div>
        )}

        {/* Tab 2: Subscriptions Management */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Contracted Subscriptions &amp; Active SaaS Licenses
                </h2>
                <p className="text-xs text-slate-500">
                  Manage deployment tiers, pause schedules, and auto-renewal policies.
                </p>
              </div>

              <Badge variant="outline" className="text-xs font-semibold">
                {data.subscriptions.filter((s) => s.status === "ACTIVE").length} active services
              </Badge>
            </div>

            {data.subscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                No active or historical subscriptions found for this account.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.subscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onViewDetails={(s) => setSelectedSubId(s.id)}
                    onPauseResume={handlePauseResume}
                    onCancel={(s) => setCancellingSubscription(s)}
                    onRenew={handleRenew}
                    onToggleAutoRenew={handleToggleAutoRenew}
                    loadingActionId={loadingActionId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Invoices & Receipts Management */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Invoices, Statements &amp; Tax Receipts
              </h2>
              <p className="text-xs text-slate-500">
                Download verified tax invoices, review line-item GST calculations, and settle outstanding balances.
              </p>
            </div>

            <InvoicesTable
              invoices={data.invoices}
              onViewInvoice={(inv) => setSelectedInvId(inv.id)}
              onPayInvoice={(inv) => setPayingInvoice(inv)}
            />
          </div>
        )}

        {/* Tab 4: Payment History */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Payment History &amp; Bank Reconciliation
              </h2>
              <p className="text-xs text-slate-500">
                Audited ledger of all received wire transfers, UPI remittances, and card charges.
              </p>
            </div>

            <PaymentHistoryTable
              payments={data.payments}
              invoices={data.invoices}
              onViewInvoice={(inv) => setSelectedInvId(inv.id)}
            />
          </div>
        )}

        {/* Tab 5: Billing & Account Profile */}
        {activeTab === "billing" && (
          <BillingProfileSection
            customer={data.customer}
            onProfileUpdated={fetchPortalData}
          />
        )}

        {/* Tab 6: Subscription Activity & Timeline */}
        {activeTab === "activity" && (
          <ActivityTimeline timeline={data.timeline} />
        )}
      </main>

      {/* MODALS */}

      {/* 1. Subscription Details Modal */}
      <SubscriptionDetailModal
        subscription={selectedSubscription}
        onClose={() => setSelectedSubId(null)}
        onPauseResume={handlePauseResume}
        onCancel={(s) => setCancellingSubscription(s)}
        onRenew={handleRenew}
        onToggleAutoRenew={handleToggleAutoRenew}
        onViewInvoice={(inv) => setSelectedInvId(inv.id)}
        isActionLoading={isSubmittingAction}
      />

      {/* 2. Cancel Subscription Confirmation Dialog */}
      <CancelSubscriptionModal
        subscription={cancellingSubscription}
        onClose={() => setCancellingSubscription(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isSubmittingAction}
      />

      {/* 3. Invoice Detail & Printable View Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvId(null)}
        onPayInvoice={(inv) => setPayingInvoice(inv)}
      />

      {/* 4. Pay Invoice Settlement Modal */}
      <PayInvoiceModal
        invoice={payingInvoice}
        onClose={() => setPayingInvoice(null)}
        onSuccess={() => {
          setActionMessage({
            type: "success",
            text: "Invoice settlement recorded successfully!",
          });
          fetchPortalData();
        }}
      />
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-10 h-10 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Loading Customer Portal...
          </p>
        </div>
      }
    >
      <CustomerDashboardContent />
    </Suspense>
  );
}
