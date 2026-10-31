"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import {
  Layers,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  Shield,
  X,
  Info,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  planCode: string;
  description: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  price: number;
  trialDays: number;
  monthEndBilling: boolean;
  pauseAllowed: boolean;
  earlyClosureAllowed: boolean;
  autoClose: boolean;
  status: "ACTIVE" | "ARCHIVED";
}

const INITIAL_PLANS: PlanItem[] = [
  {
    id: "plan-1",
    name: "Enterprise Cloud Suite",
    planCode: "PLAN-ENT-ANNUAL",
    description: "Complete ERP subscription with unlimited users, automated billing, and priority SLA.",
    frequency: "YEARLY",
    price: 120000,
    trialDays: 30,
    monthEndBilling: true,
    pauseAllowed: true,
    earlyClosureAllowed: true,
    autoClose: true,
    status: "ACTIVE",
  },
  {
    id: "plan-2",
    name: "Odoo Business Suite",
    planCode: "PLAN-BIZ-MTH",
    description: "Core accounting, CRM, and inventory modules with standard business hours support.",
    frequency: "MONTHLY",
    price: 18500,
    trialDays: 14,
    monthEndBilling: true,
    pauseAllowed: true,
    earlyClosureAllowed: false,
    autoClose: true,
    status: "ACTIVE",
  },
  {
    id: "plan-3",
    name: "Growth Monthly Tier",
    planCode: "PLAN-GROWTH-MTH",
    description: "SaaS starter pack designed for scaling operations with basic quotation management.",
    frequency: "MONTHLY",
    price: 8400,
    trialDays: 7,
    monthEndBilling: false,
    pauseAllowed: false,
    earlyClosureAllowed: true,
    autoClose: false,
    status: "ACTIVE",
  },
  {
    id: "plan-4",
    name: "Standard Core License",
    planCode: "PLAN-CORE-MTH",
    description: "Base recurring software license with self-serve billing portal access.",
    frequency: "MONTHLY",
    price: 24000,
    trialDays: 0,
    monthEndBilling: true,
    pauseAllowed: true,
    earlyClosureAllowed: true,
    autoClose: true,
    status: "ACTIVE",
  },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>(INITIAL_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New plan form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formFrequency, setFormFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");
  const [formPrice, setFormPrice] = useState("15000");
  const [formTrialDays, setFormTrialDays] = useState("14");
  const [formDescription, setFormDescription] = useState("");
  const [formPauseAllowed, setFormPauseAllowed] = useState(true);
  const [formEarlyClosureAllowed, setFormEarlyClosureAllowed] = useState(true);
  const [formAutoClose, setFormAutoClose] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) {
        const data = await res.json();
        if (data.plans && data.plans.length > 0) {
          setPlans(data.plans);
        }
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: formCode,
          name: formName,
          description: formDescription,
          frequency: formFrequency,
          price: Number(formPrice),
          trialDays: Number(formTrialDays) || 0,
          pauseAllowed: formPauseAllowed,
          earlyClosureAllowed: formEarlyClosureAllowed,
          autoClose: formAutoClose,
          renewalAllowed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create plan");
      }

      setNotification(`Plan "${formName}" created successfully!`);
      setTimeout(() => setNotification(null), 4000);
      setIsModalOpen(false);

      // Reset form
      setFormName("");
      setFormCode("");
      setFormPrice("15000");
      setFormDescription("");

      await fetchPlans();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="plans" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Subscription Recurring Plans
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Define billing frequencies, trial policies, leap-year rollover, and automated closure triggers. Click any card to inspect full terms.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Plan</span>
          </Button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Plans Grid with Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p)}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-[#714B67]/40 cursor-pointer transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded group-hover:text-[#714B67] transition-colors">
                    {p.planCode}
                  </span>
                  <Badge variant="active">{p.status}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#714B67] transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {p.frequency.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Trial Period:</span>
                    <span className="font-bold text-slate-900">
                      {p.trialDays > 0 ? `${p.trialDays} Days Free` : "No Trial"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Month-End Leap Rollover:</span>
                    <span className="font-semibold text-emerald-600">
                      {p.monthEndBilling ? "Enabled (28/29/30/31)" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Customer Pause Allowed:</span>
                    <span
                      className={`font-semibold ${
                        p.pauseAllowed ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {p.pauseAllowed ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-Close on Failed Billing:</span>
                    <span className="font-semibold text-slate-800">
                      {p.autoClose ? "Yes (after 3 retries)" : "Manual Review"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-[#714B67] font-bold">
                <span>View Plan Terms &amp; Policies</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Plan Detailed View Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg">{selectedPlan.name}</h3>
                    <Badge variant="active">{selectedPlan.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{selectedPlan.planCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Description */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                {selectedPlan.description || "Configured BrightLoop enterprise subscription recurring plan with automated payment gateway synchronization."}
              </div>

              {/* Price & Cadence Details */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                  Billing &amp; Rate Structure
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Base Subscription Price</span>
                    <span className="font-mono font-black text-slate-900 text-base">
                      ₹{selectedPlan.price.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cadence Frequency</span>
                    <span className="font-bold text-[#714B67] uppercase">{selectedPlan.frequency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Free Trial Days</span>
                    <span className="font-bold text-slate-900">
                      {selectedPlan.trialDays > 0 ? `${selectedPlan.trialDays} Days Complimentary` : "No Free Trial"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Month-End Leap Calculation</span>
                    <span className="font-semibold text-emerald-700">
                      {selectedPlan.monthEndBilling ? "Active (28/29/30/31 Rollover)" : "Fixed 30-Day Span"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lifecycle Policies */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5">
                  Customer &amp; Invoicing Lifecycle Policies
                </div>
                <div className="space-y-2 pt-1 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Self-Service Customer Pause Allowed:</span>
                    <span className={`font-bold ${selectedPlan.pauseAllowed ? "text-emerald-700" : "text-rose-600"}`}>
                      {selectedPlan.pauseAllowed ? "Permitted" : "Prohibited"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Early Contract Termination / Closure:</span>
                    <span className={`font-bold ${selectedPlan.earlyClosureAllowed ? "text-emerald-700" : "text-rose-600"}`}>
                      {selectedPlan.earlyClosureAllowed ? "Permitted without penalty" : "Manual Review Required"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-Close on Failed Billing:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedPlan.autoClose ? "Auto-Closes after 3 failed webhook retries" : "Remains active in Dunning queue"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPlan(null)}
              >
                Close
              </Button>
              <Link href="/admin/subscriptions/new">
                <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs">
                  Create Subscription With Plan &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Create New Subscription Plan</h3>
                  <p className="text-xs text-slate-400">Configure recurring billing cycles and lifecycle policies</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud Annual"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Code / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PLAN-ENT-ANNUAL"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Frequency *</label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="DAILY">DAILY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recurring Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trial Period (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={formTrialDays}
                    onChange={(e) => setFormTrialDays(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of modules and SLA included..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block">Lifecycle Rules:</span>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPauseAllowed}
                    onChange={(e) => setFormPauseAllowed(e.target.checked)}
                    className="rounded text-[#714B67] focus:ring-[#714B67]"
                  />
                  <span>Allow customer to pause subscription self-service</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formEarlyClosureAllowed}
                    onChange={(e) => setFormEarlyClosureAllowed(e.target.checked)}
                    className="rounded text-[#714B67] focus:ring-[#714B67]"
                  />
                  <span>Allow early termination / cancellation before cycle end</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAutoClose}
                    onChange={(e) => setFormAutoClose(e.target.checked)}
                    className="rounded text-[#714B67] focus:ring-[#714B67]"
                  />
                  <span>Auto-close subscription after repeated payment failures</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold"
                >
                  {isSubmitting ? "Saving..." : "Create Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
