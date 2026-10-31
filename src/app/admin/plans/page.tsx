"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

interface PlanItem {
  id: string;
  planCode: string;
  name: string;
  description: string;
  frequency: "MONTHLY" | "YEARLY" | "QUARTERLY" | "WEEKLY" | "DAILY";
  price: number;
  trialDays: number;
  pauseAllowed: boolean;
  earlyClosureAllowed: boolean;
  autoClose: boolean;
  monthEndBilling: boolean;
  status: "ACTIVE" | "ARCHIVED";
}

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Layers className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Subscription Recurring Plans
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Billing frequencies, cancellation and pause policies, and price rules loaded directly from PostgreSQL.
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#714B67]" />
            <p className="mt-3 text-sm">Loading recurring plans from database...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No plans found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {p.planCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{p.name}</h3>
                    </div>
                    <Badge variant={p.status === "ACTIVE" ? "success" : "outline"}>
                      {p.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 min-h-[32px]">{p.description}</p>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-2xl font-black font-mono text-slate-900">
                      ₹{p.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-slate-500">per {p.frequency.toLowerCase()}</span>
                  </div>

                  {/* Policy Features */}
                  <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Pause Permitted:</span>
                      <span className={p.pauseAllowed ? "text-emerald-700 font-bold" : "text-rose-500 font-bold"}>
                        {p.pauseAllowed ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Early Cancellation:</span>
                      <span className={p.earlyClosureAllowed ? "text-emerald-700 font-bold" : "text-rose-500 font-bold"}>
                        {p.earlyClosureAllowed ? "Permitted" : "Restricted"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auto-Close on Expiry:</span>
                      <span className="font-bold text-slate-800">
                        {p.autoClose ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Month-End Billing Align:</span>
                      <span className="font-bold text-emerald-700">Enforced</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
