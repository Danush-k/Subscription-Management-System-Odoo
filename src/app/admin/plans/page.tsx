"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import {
  Layers,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Shield,
  HelpCircle,
} from "lucide-react";

interface PlanItem {
  id: string;
  planCode: string;
  name: string;
  frequency: "MONTHLY" | "YEARLY" | "QUARTERLY" | "WEEKLY";
  price: number;
  trialDays: number;
  pauseAllowed: boolean;
  earlyClosureAllowed: boolean;
  autoClose: boolean;
  monthEndBilling: boolean;
  status: "ACTIVE" | "ARCHIVED";
}

const INITIAL_PLANS: PlanItem[] = [
  {
    id: "p-1",
    planCode: "PLAN-ENT-ANNUAL",
    name: "Enterprise Cloud Suite",
    frequency: "YEARLY",
    price: 120000,
    trialDays: 14,
    pauseAllowed: true,
    earlyClosureAllowed: true,
    autoClose: true,
    monthEndBilling: true,
    status: "ACTIVE",
  },
  {
    id: "p-2",
    planCode: "PLAN-ODOO-MONTH",
    name: "Odoo Business Suite",
    frequency: "MONTHLY",
    price: 18500,
    trialDays: 7,
    pauseAllowed: true,
    earlyClosureAllowed: false,
    autoClose: true,
    monthEndBilling: true,
    status: "ACTIVE",
  },
  {
    id: "p-3",
    planCode: "PLAN-GROWTH-MONTH",
    name: "Growth Monthly Tier",
    frequency: "MONTHLY",
    price: 8400,
    trialDays: 0,
    pauseAllowed: true,
    earlyClosureAllowed: true,
    autoClose: false,
    monthEndBilling: false,
    status: "ACTIVE",
  },
  {
    id: "p-4",
    planCode: "PLAN-STARTER-QUARTER",
    name: "Starter Quarterly License",
    frequency: "QUARTERLY",
    price: 22000,
    trialDays: 0,
    pauseAllowed: false,
    earlyClosureAllowed: false,
    autoClose: true,
    monthEndBilling: true,
    status: "ACTIVE",
  },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>(INITIAL_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New plan form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formPrice, setFormPrice] = useState("15000");
  const [formFrequency, setFormFrequency] = useState<"MONTHLY" | "YEARLY" | "QUARTERLY" | "WEEKLY">("MONTHLY");
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

  React.useEffect(() => {
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
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="plans" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Subscription Recurring Plans &amp; Policies
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Recurrence schedules, month-end leap-year rollover rules, pause permissions, and trial periods.
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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {p.planCode}
                  </span>
                  <Badge variant="active">{p.status}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
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
            </div>
          ))}
        </div>
      </main>

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
                  placeholder="e.g. Enterprise Cloud Suite"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Code / SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. PLAN-ENT-ANNUAL"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
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
                    <option value="MONTHLY">MONTHLY (Every Month)</option>
                    <option value="YEARLY">YEARLY (Annual Recurring)</option>
                    <option value="QUARTERLY">QUARTERLY (Every 3 Months)</option>
                    <option value="WEEKLY">WEEKLY (Every 7 Days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recurring Price (₹ INR) *</label>
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
                <label className="block font-bold text-slate-700 mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  placeholder="Outline feature inclusions, user seats, and service terms..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                  Lifecycle Policies &amp; Permissions
                </span>

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
