"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Layers, ShieldCheck, Database, Server, Cpu, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrightLoopBrandMark } from "@/components/ui/logo";

export default function ArchitectureDocPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 pb-20 select-none">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <BrightLoopBrandMark size="sm" />
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-600 text-xs font-bold hidden sm:inline">System Architecture &amp; Specification</span>
        </div>

        <Link href="/login">
          <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs">
            Launch Portal
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10 space-y-8">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
              Technical Documentation &amp; Architecture
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              BrightLoop Enterprise Subscription Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Multi-tier SaaS architecture designed for automated recurring billing, atomic financial transactions, immutable audit freezes, and strict RBAC isolation.
            </p>
          </div>

          {/* 4 Architectural Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Database className="w-4 h-4 text-[#714B67]" />
                <span>PostgreSQL &amp; Decimal Precision</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero float rounding drift. Monetary calculations use 2-decimal exact representation compliant with GAAP and Indian GST regulations.
              </p>
            </div>

            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Schedulers</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated recurring invoice generation handles end-of-month calendar clamping, leap years, and active state verification.
              </p>
            </div>

            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Role-Based Access Control</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-persona isolation dividing Administrator controls, Staff operational billing queues, and Customer self-service.
              </p>
            </div>

            <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>GSTR-1 Tax Engine</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dual CGST (9%) + SGST (9%) or IGST (18%) calculation engine with immutable audit snapshots on invoice finalization.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
