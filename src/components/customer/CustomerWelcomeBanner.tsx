"use client";

import React from "react";
import {
  Calendar,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomerProfile, MetricSummary } from "./types";

interface CustomerWelcomeBannerProps {
  customer: CustomerProfile;
  metrics: MetricSummary;
  onEditProfile?: () => void;
  onPayBalance?: () => void;
  onSelectTab?: (tab: "subscriptions" | "invoices" | "payments" | "billing") => void;
}

export function CustomerWelcomeBanner({
  customer,
}: CustomerWelcomeBannerProps) {
  const todayFormatted = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const locationText = [
    customer.billingAddress?.city,
    customer.billingAddress?.state,
    customer.billingAddress?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
      {/* Pure Greeting Content (Clean, calm, zero button clutter) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="active" className="gap-1.5 py-1 px-3 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#714B67] animate-pulse"></span>
            {customer.status} Account
          </Badge>

          <span className="text-slate-300">•</span>

          <span className="font-mono text-xs font-bold text-slate-500">
            Account Ref: <strong className="text-slate-800">{customer.customerNumber}</strong>
          </span>

          {customer.taxId && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#714B67]" />
                Tax ID: <strong className="font-mono text-slate-700">{customer.taxId}</strong>
              </span>
            </>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {customer.companyName || customer.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#714B67]" />
              <span>{todayFormatted}</span>
            </span>
            {locationText && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-4 h-4 text-[#714B67]" />
                <span>{locationText}</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
