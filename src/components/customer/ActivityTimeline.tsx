"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityItem } from "./types";

interface ActivityTimelineProps {
  timeline: ActivityItem[];
}

export function ActivityTimeline({ timeline }: ActivityTimelineProps) {
  const [filterType, setFilterType] = useState<"ALL" | "SUBSCRIPTION" | "INVOICE" | "PAYMENT">("ALL");

  const formatDate = (isoStr: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoStr));
  };

  const filteredTimeline = timeline.filter((item) => {
    if (filterType === "ALL") return true;
    return item.type === filterType;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "SUBSCRIPTION":
        return <RotateCcw className="w-3.5 h-3.5 text-[#714B67]" />;
      case "INVOICE":
        return <FileText className="w-3.5 h-3.5 text-[#714B67]" />;
      case "PAYMENT":
        return <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#714B67]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Subscription Activity &amp; Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological timeline of service events, billing runs, and transaction receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(
            [
              { id: "ALL", label: "All Events" },
              { id: "SUBSCRIPTION", label: "Subscriptions" },
              { id: "INVOICE", label: "Invoices" },
              { id: "PAYMENT", label: "Payments" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                filterType === tab.id
                  ? "bg-[#714B67] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Feed */}
      {filteredTimeline.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          No activity logs recorded under this filter.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredTimeline.map((item) => (
            <div key={item.id} className="relative group text-xs">
              <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border-2 border-slate-300 group-hover:border-[#714B67] flex items-center justify-center transition-colors">
                {getEventIcon(item.type)}
              </div>

              <div className="bg-slate-50/70 hover:bg-slate-50 transition-colors p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.title}
                    </span>
                    {item.badge && (
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {item.badge}
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(item.date)}
                  </span>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">
                  {item.description}
                </p>

                {item.referenceId && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Audit Ref: {item.referenceId}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

