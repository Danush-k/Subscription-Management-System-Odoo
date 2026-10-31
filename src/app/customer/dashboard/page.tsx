"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
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
import { RazorpayCheckoutModal, CheckoutPaymentDetails } from "@/components/customer/RazorpayCheckoutModal";
import { PaymentHistoryTable } from "@/components/customer/PaymentHistoryTable";
import { BillingProfileSection } from "@/components/customer/BillingProfileSection";
import { ActivityTimeline } from "@/components/customer/ActivityTimeline";
import { QuotationsSection } from "@/components/customer/QuotationsSection";
type CustomerTab = "overview" | "quotations" | "subscriptions" | "invoices" | "payments" | "billing" | "activity";

// Types
import {
  PortalData,
  SubscriptionItem,
  InvoiceItem,
} from "@/components/customer/types";

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab: CustomerTab = ["overview", "quotations", "subscriptions", "invoices", "payments", "billing", "activity"].includes(requestedTab ?? "")
    ? requestedTab as CustomerTab
    : "overview";

  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active navigation tab
  const [invoiceSubView, setInvoiceSubView] = useState<"invoices" | "payments">(
    initialTab === "payments" ? "payments" : "invoices"
  );
  const [activeTab, setActiveTabState] = useState<
    "overview" | "quotations" | "subscriptions" | "invoices" | "payments" | "billing" | "activity"
  >(initialTab);

  const setActiveTab = (tab: string) => {
    if (!["overview", "quotations", "subscriptions", "invoices", "payments", "billing", "activity"].includes(tab)) return;
    const selectedTab = tab as CustomerTab;
    setActiveTabState(selectedTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url.toString());
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "payments") { setInvoiceSubView("payments"); }
    if (tabParam === "invoices") { setInvoiceSubView("invoices"); }
    if (tabParam && tabParam !== activeTab) {
      if (["overview", "quotations", "subscriptions", "invoices", "payments", "billing", "activity"].includes(tabParam)) {
        setActiveTabState(tabParam as CustomerTab);
      }
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
  const [renewingSubscription, setRenewingSubscription] = useState<SubscriptionItem | null>(null);
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceItem | null>(null);
  const [isAcceptingQuotation, setIsAcceptingQuotation] = useState(false);

  const handleAcceptQuotation = async (
    quotationId: string,
    paymentDetails?: CheckoutPaymentDetails
  ) => {
    setIsAcceptingQuotation(true);
    try {
      const res = await fetch(`/api/customer/quotations/${quotationId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentDetails || {}),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to accept quotation");
      setActionMessage({
        type: "success",
        text: `Proposal accepted & payment verified! Active subscription ${result.subscription?.subscriptionNumber || ""} is now live.`,
      });
      await fetchPortalData();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to accept proposal",
      });
    } finally {
      setIsAcceptingQuotation(false);
    }
  };

  const handleSendNegotiation = async (
    quotationId: string,
    message: string,
    proposedDiscount?: number
  ) => {
    const res = await fetch(`/api/customer/quotations/${quotationId}/negotiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        proposedDiscount,
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to submit negotiation feedback");
    setActionMessage({
      type: "success",
      text: "Your counter-offer & negotiation notes have been dispatched to the sales team in real time!",
    });
    await fetchPortalData();
  };

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

  // Subscriptions tab status filter
  const [subStatusFilter, setSubStatusFilter] = useState<"ALL" | "ACTIVE" | "PAUSED" | "CLOSED">("ALL");

  const filteredSubscriptions = useMemo(() => {
    if (!data) return [];
    if (subStatusFilter === "ALL") return data.subscriptions;
    return data.subscriptions.filter((s) => s.status === subStatusFilter);
  }, [data, subStatusFilter]);

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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.message || "Cancellation failed",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Subscription Actions: Early / Ended Renewal (Triggers simulated Razorpay Checkout)
  const handleRenew = (sub: SubscriptionItem) => {
    setRenewingSubscription(sub);
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
    } catch (err) {
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
        pendingQuotationsCount={data.quotations?.filter((q) => q.status === "QUOTATION").length || 0}
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
              className="font-bold hover:underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW PAGE ONLY (Welcome Banner, 6 Summary Cards, Snapshots)    */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Welcome & Account Overview Banner */}
            <CustomerWelcomeBanner
              customer={data.customer}
              metrics={data.metrics}
              onEditProfile={() => router.push("/customer/profile")}
              onPayBalance={handlePayBalance}
              onSelectTab={(tab) => setActiveTab(tab)}
            />

            {/* 2. Subscription & Financial Summary Cards (6 Compact Metrics) */}
            <CustomerOverviewCards
              metrics={data.metrics}
              onSelectTab={(tab) => setActiveTab(tab)}
              onPayBalance={handlePayBalance}
            />

            {/* 3. Overview Split Column: SaaS Subscriptions & Invoices Snapshot */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* Left Column: Subscriptions Snapshot */}
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Contracted SaaS Subscriptions
                    </h3>
                    <Badge variant="outline" className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border-slate-200">
                      {data.subscriptions.length}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setActiveTab("subscriptions")}
                    className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1 cursor-pointer"
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

              {/* Right Column: Recent Invoices & Organization Quick Summary */}
              <div className="space-y-4">
                {/* Right Column Header (aligned with left subscriptions header) */}
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Recent Invoices
                    </h3>
                    <Badge variant="outline" className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border-slate-200">
                      {data.invoices.length}
                    </Badge>
                  </div>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>

                {/* Recent Invoices Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">

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
                            className="text-[11px] font-bold h-7 px-2 cursor-pointer"
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

            
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY SUBSCRIPTIONS (Subscriptions Only + Status Filters)             */}
        {/* ========================================================================= */}
        {/* Quotations & Real-time Proposals */}
        {activeTab === "quotations" && (
          <QuotationsSection
            quotations={data.quotations || []}
            customerName={data.customer?.companyName || data.customer?.name}
            customerEmail={data.customer?.email}
            onAcceptQuotation={handleAcceptQuotation}
            onSendNegotiation={handleSendNegotiation}
            onViewSubscription={(subId) => {
              setActiveTab("subscriptions");
              setSelectedSubId(subId);
            }}
            isAccepting={isAcceptingQuotation}
          />
        )}

        {activeTab === "subscriptions" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Contracted Subscriptions &amp; Active SaaS Licenses
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage deployment tiers, pause schedules, and auto-renewal policies.
                </p>
              </div>

              {/* Status Filter Chips: ALL, ACTIVE, PAUSED, CLOSED */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {(
                  [
                    { id: "ALL", label: `All (${data.subscriptions.length})` },
                    { id: "ACTIVE", label: `Active (${data.subscriptions.filter((s) => s.status === "ACTIVE").length})` },
                    { id: "PAUSED", label: `Paused (${data.subscriptions.filter((s) => s.status === "PAUSED").length})` },
                    { id: "CLOSED", label: `Cancelled (${data.subscriptions.filter((s) => s.status === "CLOSED").length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSubStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      subStatusFilter === tab.id
                        ? "bg-[#714B67] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredSubscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                No subscriptions matched the selected filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSubscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onViewDetails={(s) => setSelectedSubId(s.id)}
                    onPauseResume={handlePauseResume}
                    onCancel={(s) => setCancellingSubscription(s)}
                    onRenew={handleRenew}
                    onPayAndRenew={(s) => setRenewingSubscription(s)}
                    onToggleAutoRenew={handleToggleAutoRenew}
                    loadingActionId={loadingActionId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INVOICES & RECEIPTS (Consolidated with Payment History)            */}
        {/* ========================================================================= */}
        {(activeTab === "invoices" || activeTab === "payments") && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Invoices, Receipts &amp; Remittances
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download verified tax invoices, review line-item GST calculations, and audit payment receipts.
                </p>
              </div>

              {/* Sub-view Segmented Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
                <button
                  onClick={() => setInvoiceSubView("invoices")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    invoiceSubView === "invoices"
                      ? "bg-white text-[#714B67] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Invoices &amp; Receipts ({data.invoices.length})</span>
                </button>
                <button
                  onClick={() => setInvoiceSubView("payments")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    invoiceSubView === "payments"
                      ? "bg-white text-[#714B67] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Payment History ({data.payments.length})</span>
                </button>
              </div>
            </div>

            {invoiceSubView === "invoices" ? (
              <InvoicesTable
                invoices={data.invoices}
                onViewInvoice={(inv) => setSelectedInvId(inv.id)}
                onPayInvoice={(inv) => setPayingInvoice(inv)}
              />
            ) : (
              <PaymentHistoryTable
                payments={data.payments}
                invoices={data.invoices}
                subscriptions={data.subscriptions}
                onViewInvoice={(inv) => setSelectedInvId(inv.id)}
                onPayAndRenew={(s) => setRenewingSubscription(s)}
              />
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BILLING PROFILE & GSTIN                                            */}
        {/* ========================================================================= */}
        {activeTab === "billing" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <BillingProfileSection
              customer={data.customer}
              onProfileUpdated={fetchPortalData}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ACTIVITY TIMELINE                                                 */}
        {/* ========================================================================= */}
        {activeTab === "activity" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <ActivityTimeline timeline={data.timeline} />
          </div>
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

      {/* 4. Pay Invoice Settlement Modal with Razorpay Checkout */}
      {payingInvoice && (
        <RazorpayCheckoutModal
          isOpen={Boolean(payingInvoice)}
          onClose={() => setPayingInvoice(null)}
          title={`Invoice ${payingInvoice.invoiceNumber}`}
          subtitle={`Payment settlement for ${payingInvoice.subscription?.subscriptionNumber || "Brightloop Subscription"}`}
          amount={Number(payingInvoice.outstandingAmount)}
          customerName={data.customer?.name}
          customerEmail={data.customer?.email}
          onPaymentSuccess={async (details) => {
            const res = await fetch(`/api/customer/invoices/${payingInvoice.id}/pay`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentMethod: details.paymentMethod,
                amount: details.amount,
                transactionRef: details.transactionRef,
                notes: details.notes,
              }),
            });
            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.error || "Payment failed");
            setActionMessage({
              type: "success",
              text: `Payment of ₹${Number(details.amount).toLocaleString("en-IN")} settled successfully for Invoice ${payingInvoice.invoiceNumber}!`,
            });
            await fetchPortalData();
          }}
          successButtonText="Done & Return to Invoices"
        />
      )}

      {/* 5. Subscription Renewal Settlement Modal with Razorpay Checkout */}
      {renewingSubscription && (
        <RazorpayCheckoutModal
          isOpen={Boolean(renewingSubscription)}
          onClose={() => setRenewingSubscription(null)}
          title={`Renew Subscription: ${renewingSubscription.subscriptionNumber}`}
          subtitle={`Renewal payment for ${
            renewingSubscription.lines[0]?.product?.name ||
            renewingSubscription.plan?.name ||
            "Brightloop SaaS Subscription"
          }`}
          amount={Number(
            renewingSubscription.lines.reduce((s, l) => s + Number(l.total || l.subtotal || 0), 0) ||
            renewingSubscription.plan?.subscriptionPrice ||
            0
          )}
          customerName={data.customer?.name}
          customerEmail={data.customer?.email}
          onPaymentSuccess={async (details) => {
            const res = await fetch(`/api/customer/subscriptions/${renewingSubscription.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "renew",
                paymentMethod: details.paymentMethod,
                amount: details.amount,
                transactionRef: details.transactionRef,
                notes: details.notes,
              }),
            });
            const resJson = await res.json();
            if (!res.ok) throw new Error(resJson.error || "Renewal payment failed");
            setActionMessage({
              type: "success",
              text: `Payment of ₹${Number(details.amount).toLocaleString("en-IN")} settled! Subscription ${renewingSubscription.subscriptionNumber} is reactivated and active for the next cycle.`,
            });
            setRenewingSubscription(null);
            await fetchPortalData();
          }}
          successButtonText="Done & Return to Subscriptions"
        />
      )}
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
