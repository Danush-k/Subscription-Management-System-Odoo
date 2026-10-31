"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  FileText,
  CreditCard,
  Percent,
  Layers,
  BarChart3,
  Users,
  ShieldCheck,
  Package,
  Receipt,
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "STAFF" | "CUSTOMER">("ADMIN");

  const apps = [
    {
      id: "subscriptions",
      name: "Subscriptions",
      href: "/admin/subscriptions",
      gradient: "from-amber-500 to-orange-500",
      icon: <RotateCcw className="w-8 h-8 text-white" />,
      tag: "Automated",
      desc: "Daily, Monthly, Yearly Recurrence",
    },
    {
      id: "invoices",
      name: "Invoices",
      href: "/admin/invoices",
      gradient: "from-blue-600 to-cyan-500",
      icon: <FileText className="w-8 h-8 text-white" />,
      tag: "Idempotent",
      desc: "Instant Billing & Tax Auditing",
    },
    {
      id: "quotations",
      name: "Quotations",
      href: "/admin/quotations",
      gradient: "from-teal-500 to-emerald-400",
      icon: <Receipt className="w-8 h-8 text-white" />,
      tag: "Proposals",
      desc: "Draft to Confirmed Conversion",
    },
    {
      id: "payments",
      name: "Payments",
      href: "/admin/payments",
      gradient: "from-purple-600 to-pink-500",
      icon: <CreditCard className="w-8 h-8 text-white" />,
      tag: "Partial Reconcile",
      desc: "UPI, Cards, Bank Transfers",
    },
    {
      id: "products",
      name: "Products & Tiers",
      href: "/admin/products",
      gradient: "from-indigo-600 to-blue-500",
      icon: <Package className="w-8 h-8 text-white" />,
      tag: "Variants",
      desc: "Odoo, SAP, Standard Editions",
    },
    {
      id: "plans",
      name: "Subscription Plans",
      href: "/admin/plans",
      gradient: "from-cyan-600 to-blue-600",
      icon: <Layers className="w-8 h-8 text-white" />,
      tag: "Rules",
      desc: "Month-End Billing & Auto-close",
    },
    {
      id: "taxes",
      name: "Tax Engine",
      href: "/admin/taxes",
      gradient: "from-amber-600 to-yellow-500",
      icon: <Percent className="w-8 h-8 text-white" />,
      tag: "GST/VAT",
      desc: "Inclusive/Exclusive Precision",
    },
    {
      id: "discounts",
      name: "Discount Rules",
      href: "/admin/discounts",
      gradient: "from-rose-500 to-red-400",
      icon: <Percent className="w-8 h-8 text-white" />,
      tag: "Auto-apply",
      desc: "Capped Redemptions & Tiers",
    },
    {
      id: "customers",
      name: "Customer CRM",
      href: "/admin/customers",
      gradient: "from-emerald-600 to-teal-500",
      icon: <Users className="w-8 h-8 text-white" />,
      tag: "Directory",
      desc: "Accounts, History & Profiles",
    },
    {
      id: "analytics",
      name: "Revenue Analytics",
      href: "/admin/analytics",
      gradient: "from-violet-600 to-purple-400",
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      tag: "MRR / ARR",
      desc: "Invoiced vs Collected Trends",
    },
    {
      id: "portal",
      name: "Customer Portal",
      href: "/customer/dashboard",
      gradient: "from-sky-600 to-blue-500",
      icon: <UserCheck className="w-8 h-8 text-white" />,
      tag: "Self-Service",
      desc: "Invoices, Renewal, Pause",
    },
    {
      id: "staff",
      name: "Team & RBAC",
      href: "/admin/users",
      gradient: "from-slate-700 to-slate-500",
      icon: <ShieldCheck className="w-8 h-8 text-white" />,
      tag: "Security",
      desc: "Admin & Staff Permissions",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans">
      {/* Top Odoo-style Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-odoo-700">brightloop</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-odoo-100 text-odoo-900 border border-odoo-200">
                SaaS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/admin/dashboard" className="hover:text-odoo-700 transition-colors">
                Apps
              </Link>
              <Link href="/admin/subscriptions" className="hover:text-odoo-700 transition-colors">
                Subscriptions
              </Link>
              <Link href="/admin/invoices" className="hover:text-odoo-700 transition-colors">
                Invoicing
              </Link>
              <Link href="/admin/analytics" className="hover:text-odoo-700 transition-colors">
                Analytics
              </Link>
              <Link href="/docs/architecture" className="hover:text-odoo-700 transition-colors">
                Documentation
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="pill" size="sm" className="font-semibold">
                Try it free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section inspired by attached Odoo visual */}
      <main className="flex-1">
        <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Subscription Engine &bull; Zero Spreadsheets
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            All your business on{" "}
            <span className="relative inline-block">
              <span className="relative z-10 font-black">one platform</span>
              <span className="absolute left-0 right-0 bottom-1.5 h-4 bg-amber-300/80 -rotate-1 rounded-sm -z-0"></span>
            </span>
            .<br />
            Simple, efficient, yet{" "}
            <span className="relative inline-block text-slate-900 underline decoration-sky-400 decoration-[4px] underline-offset-8">
              affordable!
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Automate recurring billing, lifecycle state machines, quotation conversions, and financial reconciliation with PostgreSQL decimal precision.
          </p>

          {/* Action Buttons & Handwritten Style Annotation */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <Link href="/admin/dashboard">
              <Button variant="pill" size="lg" className="w-full sm:w-auto text-base">
                Start now - It's free
              </Button>
            </Link>
            <Link href="/customer/dashboard">
              <Button variant="pillOutline" size="lg" className="w-full sm:w-auto text-base">
                Customer Portal Demo
              </Button>
            </Link>

            {/* Odoo price doodle callout */}
            <div className="mt-4 sm:mt-0 sm:absolute sm:left-[72%] sm:top-[-10px] flex items-center gap-2 text-odoo-800 font-serif italic text-sm">
              <span className="text-2xl text-odoo-700">&ldca;</span>
              <span className="bg-odoo-50 px-3 py-1 rounded-xl border border-odoo-200/80 shadow-xs font-semibold text-odoo-900">
                580.00 Rs / month <span className="not-italic font-normal text-xs text-slate-500">for ALL apps</span>
              </span>
            </div>
          </div>

          {/* Role Mode Quick Selector */}
          <div className="mt-12 max-w-md mx-auto p-1.5 bg-slate-200/60 rounded-full flex items-center justify-between text-xs font-bold text-slate-600">
            <button
              onClick={() => setSelectedRole("ADMIN")}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                selectedRole === "ADMIN" ? "bg-white text-odoo-800 shadow-xs font-extrabold" : "hover:text-slate-900"
              }`}
            >
              ADMIN WORKSPACE
            </button>
            <button
              onClick={() => setSelectedRole("STAFF")}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                selectedRole === "STAFF" ? "bg-white text-odoo-800 shadow-xs font-extrabold" : "hover:text-slate-900"
              }`}
            >
              STAFF OPERATIONS
            </button>
            <button
              onClick={() => setSelectedRole("CUSTOMER")}
              className={`flex-1 py-1.5 rounded-full transition-all ${
                selectedRole === "CUSTOMER" ? "bg-white text-odoo-800 shadow-xs font-extrabold" : "hover:text-slate-900"
              }`}
            >
              CUSTOMER PORTAL
            </button>
          </div>
        </section>

        {/* The Signature Odoo Apps Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Brightloop Applications</h2>
              <p className="text-xs text-slate-500">Integrated suite for end-to-end subscription lifecycle operations</p>
            </div>
            <Link href="/admin/dashboard" className="text-xs font-bold text-odoo-700 hover:text-odoo-800 flex items-center gap-1">
              Launch Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {apps.map((app) => (
              <Link
                key={app.id}
                href={
                  selectedRole === "CUSTOMER"
                    ? "/customer/dashboard"
                    : selectedRole === "STAFF"
                    ? app.href.replace("/admin/", "/staff/")
                    : app.href
                }
                className="group relative flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-odoo-300 hover:-translate-y-1 transition-all duration-200"
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${app.gradient} shadow-md group-hover:scale-105 transition-transform duration-200`}
                >
                  {app.icon}
                </div>
                <span className="mt-3 text-sm font-bold text-slate-800 group-hover:text-odoo-700 text-center line-clamp-1">
                  {app.name}
                </span>
                <span className="mt-1 text-[11px] text-slate-500 text-center line-clamp-2">
                  {app.desc}
                </span>
                <span className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-odoo-50 group-hover:text-odoo-800">
                  {app.tag}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Live Operational Metrics Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-odoo-700 uppercase tracking-wider">Enterprise Financial Health</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Real-Time Invoiced &amp; Recurring Metrics</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-500">PostgreSQL Live Sync</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-500">Monthly Recurring Revenue (MRR)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹4,28,500.00</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.2% from last month
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-500">Total Invoiced (YTD)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹51,42,000.00</div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  100% Decimal precision
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-500">Revenue Collected</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">₹48,90,500.00</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 95.1% collection rate
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-semibold text-slate-500">Outstanding Receivables</span>
                <div className="text-2xl font-black text-amber-600 mt-1">₹2,51,500.00</div>
                <div className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Overdue tracking active
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Brightloop Software Technologies Pvt. Ltd. All rights reserved.</p>
        <p className="mt-1">Built with Next.js App Router, PostgreSQL, Prisma, Redis, and BullMQ.</p>
      </footer>
    </div>
  );
}
