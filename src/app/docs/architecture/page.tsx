"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Layers, ShieldCheck, Database, Server, Cpu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArchitectureDocPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Brightloop</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 text-sm">System Architecture & Engineering Specification</span>
          </div>
        </div>

        <Link href="/login">
          <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold">
            Launch Portal
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10 space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
              Technical Documentation
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-1">
              Brightloop Enterprise Subscription Architecture
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Multi-tier SaaS architecture designed for automated recurring billing, atomic financial transactions, immutable audit freezes, and strict RBAC isolation.
            </p>
          </div>

          {/* 4 Architectural Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Database className="w-4 h-4 text-[#714B67]" />
                <span>PostgreSQL & Decimal Precision</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                26 normalized database entities utilizing PostgreSQL <code className="bg-slate-200 px-1 rounded">NUMERIC(14,2)</code> and <code className="bg-slate-200 px-1 rounded">decimal.js</code> arithmetic to completely prevent floating point rounding errors.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict multi-tenant security partitioning between <strong>ADMIN</strong> (Danush Kalyan), <strong>STAFF</strong> (Operations), and <strong>CUSTOMER</strong> (SSN Technology Labs).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Idempotent Billing Engine</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated recurring invoice generation enforced by composite DB unique indexes (<code className="bg-slate-200 px-1 rounded">subscriptionId + billingPeriodStart</code>) preventing duplicate billing charges.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>State Machine Engine</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict lifecycle transitions: <code className="bg-slate-200 px-1 rounded">DRAFT</code> &rarr; <code className="bg-slate-200 px-1 rounded">CONFIRMED</code> &rarr; <code className="bg-slate-200 px-1 rounded">ACTIVE</code> &harr; <code className="bg-slate-200 px-1 rounded">PAUSED</code> &rarr; <code className="bg-slate-200 px-1 rounded">CLOSED</code> with leap-year month-end clamping.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
