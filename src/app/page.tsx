"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Building,
  RotateCcw,
  FileText,
  CreditCard,
  Percent,
  Layers,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const portalCards = [
    {
      title: "Administrator Console",
      role: "Danush Kalyan (Admin)",
      desc: "Full business operations, automated recurring billing engine, revenue analytics (MRR/ARR), plan policies, and financial audit logs.",
      icon: Shield,
      href: "/login",
      color: "bg-[#714B67] text-white",
      badge: "Full Access",
      features: ["Recurring Billing Engine", "12 Real-Time KPI Cards", "Tax Engine & Discounts"],
    },
    {
      title: "Operations & Staff Workspace",
      role: "Operations Staff",
      desc: "Quotation pipeline, client proposal dispatching, overdue payment collection queues, and customer subscription conversions.",
      icon: Users,
      href: "/login",
      color: "bg-blue-600 text-white",
      badge: "Operations",
      features: ["Quotation Proposals", "Overdue Account Followups", "1-Click Subscription Setup"],
    },
    {
      title: "Customer Self-Service Portal",
      role: "SSN Technology Labs",
      desc: "Dedicated client workspace to review active subscription plans, pause/resume billing agreements, and download official GST tax invoices.",
      icon: Building,
      href: "/login",
      color: "bg-emerald-600 text-white",
      badge: "Client Portal",
      features: ["Pause / Resume Subscriptions", "GST Tax Invoices & Receipts", "B2B Profile Management"],
    },
  ];

  const features = [
    {
      title: "Automated Recurring Billing",
      desc: "Daily, monthly, quarterly, and annual billing runs with DB-level idempotency preventing duplicate charges.",
      icon: RotateCcw,
    },
    {
      title: "Decimal Precision & GST Audits",
      desc: "Full 18% GST (inclusive & exclusive) engine using decimal.js to eliminate rounding discrepancies.",
      icon: Percent,
    },
    {
      title: "Multi-Tier Product Variants",
      desc: "Base software catalogs with add-on editions (Standard Cloud, Odoo Enterprise, SAP Migration).",
      icon: Layers,
    },
    {
      title: "Atomic Payment Settlement",
      desc: "Multi-channel settlement across UPI, Cards, and Bank Transfers with partial payment reconciliation.",
      icon: CreditCard,
    },
    {
      title: "Proposal-to-Subscription Pipeline",
      desc: "Draft client quotes with custom discounts and convert to active agreements in a single click.",
      icon: FileText,
    },
    {
      title: "Revenue Intelligence (MRR/ARR)",
      desc: "Clear segregation between Invoiced Revenue (Accrual), Collected Cash, and Receivables.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#714B67] text-[#F2C744] flex items-center justify-center font-black text-sm">
                B
              </div>
              <span className="text-xl font-black tracking-tight text-[#714B67]">
                Brightloop
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                SaaS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
              <a href="#portals" className="hover:text-[#714B67] transition-colors">
                Workspaces
              </a>
              <a href="#features" className="hover:text-[#714B67] transition-colors">
                Engine Features
              </a>
              <Link href="/docs/architecture" className="hover:text-[#714B67] transition-colors">
                Architecture & RBAC
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="font-bold text-slate-700 hover:text-[#714B67]"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold rounded-xl shadow-xs"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F2C744]" />
            Enterprise Subscription & Invoicing Engine &bull; Zero Spreadsheets
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Simplify Subscription Billing.
            <br />
            <span className="text-[#714B67] underline decoration-[#F2C744] decoration-[6px] underline-offset-8">
              One Unified SaaS Engine.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Brightloop automates recurring billing cycles, financial ledger snapshots, multi-tier product variants, and customer self-service with PostgreSQL precision.
          </p>

          {/* Primary CTA Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#714B67] hover:bg-[#5C3C54] text-white font-black text-sm rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-[#F2C744]" />
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 border-slate-300 hover:bg-slate-100/80 text-slate-800 font-bold text-sm rounded-xl"
              >
                Register Customer Account
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Demo preloaded with Admin, Staff, and Customer accounts. 1-click quick login available.
          </p>
        </section>

        {/* 3 Workspaces Selection Grid */}
        <section id="portals" className="py-12 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
                Role-Based Access
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Select Your Dedicated Workspace
              </h2>
              <p className="text-xs text-slate-500">
                Sign in to experience tailored dashboards designed for each business stakeholder.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portalCards.map((portal) => {
                const Icon = portal.icon;
                return (
                  <div
                    key={portal.title}
                    className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#714B67]/40 hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-2xl ${portal.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {portal.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{portal.title}</h3>
                        <p className="text-xs font-semibold text-[#714B67] mt-0.5">{portal.role}</p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {portal.desc}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {portal.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link href="/login" className="block w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs font-bold justify-between group"
                      >
                        <span>Sign In to Access</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Architectural Features Grid */}
        <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
              System Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Enterprise Billing Engine
            </h2>
            <p className="text-xs text-slate-500">
              Built on PostgreSQL decimal precision, atomic transactions, and automated schedulers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-6 font-semibold">
          <Link href="/login" className="hover:text-[#714B67]">
            Sign In
          </Link>
          <Link href="/register" className="hover:text-[#714B67]">
            Register Account
          </Link>
          <Link href="/docs/architecture" className="hover:text-[#714B67]">
            Documentation
          </Link>
        </div>
        <p>&copy; 2026 Brightloop Software. Engineered for scalable subscription enterprises.</p>
      </footer>
    </div>
  );
}
