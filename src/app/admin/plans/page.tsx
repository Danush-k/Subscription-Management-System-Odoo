"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Layers className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Subscription Recurring Plans & Policies
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Recurrence schedules, month-end leap-year rollover rules, pause permissions, and trial periods.
            </p>
          </div>
        </div>

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
                  <Badge variant="success">{p.status}</Badge>
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
    </div>
  );
}
