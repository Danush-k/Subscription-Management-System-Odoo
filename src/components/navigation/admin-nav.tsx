"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrightloopLogo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  RotateCcw,
  FileText,
  Receipt,
  Package,
  Users,
  Layers,
  Percent,
  Tag,
  CreditCard,
  BarChart3,
  Grid,
  Shield,
  ChevronDown,
  Sparkles,
  LogOut,
  Play,
  CheckCircle2,
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [billingRunning, setBillingRunning] = useState(false);
  const [billingToast, setBillingToast] = useState<string | null>(null);

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: RotateCcw },
    { label: "Invoices", href: "/admin/invoices", icon: FileText },
    { label: "Quotations", href: "/admin/quotations", icon: Receipt },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Plans", href: "/admin/plans", icon: Layers },
    { label: "Taxes", href: "/admin/taxes", icon: Percent },
    { label: "Discounts", href: "/admin/discounts", icon: Tag },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  ];

  const handleQuickBilling = () => {
    setBillingRunning(true);
    setBillingToast(null);
    setTimeout(() => {
      setBillingRunning(false);
      setBillingToast("Recurring billing run complete: 3 subscriptions billed, 3 invoices posted.");
      setTimeout(() => setBillingToast(null), 4000);
    }, 1000);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs select-none">
        {/* Top Enterprise Deep Plum Bar */}
        <div className="bg-[#714B67] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center hover:opacity-95 transition-opacity"
            >
              <BrightloopLogo size="sm" variant="light" showBadge={false} />
            </Link>

            <span className="text-white/30 hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-full text-white/90 text-[11px] font-semibold border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Enterprise Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Recurring Billing Trigger */}
            <button
              onClick={handleQuickBilling}
              disabled={billingRunning}
              className="hidden md:flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-1 rounded-lg text-xs shadow-xs transition-all active:scale-95 disabled:opacity-70"
            >
              <Play className="w-3 h-3 fill-slate-900" />
              <span>{billingRunning ? "Processing..." : "Run Billing"}</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded-md hover:bg-white/10"
              title="Launchpad Hub"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">App Hub</span>
            </Link>

            <span className="text-white/30 hidden sm:inline">•</span>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all border border-white/10"
              >
                <div className="w-5 h-5 rounded-md bg-[#FBBF24] text-[#714B67] flex items-center justify-center font-black text-[10px]">
                  DK
                </div>
                <span>Danush Kalyan</span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Signed in as Admin
                    </p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                      admin@brightloopsoftware.com
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#714B67]/10 hover:text-[#714B67] transition-colors"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4 text-[#714B67]" />
                      <span>Admin Workspace</span>
                    </Link>

                    <Link
                      href="/staff/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Staff Operations</span>
                    </Link>

                    <Link
                      href="/customer/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Customer Self-Service</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <Link
                      href="/login"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out / Switch User</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar (11 Operational Modules) */}
        <div className="px-4 sm:px-6 overflow-x-auto no-scrollbar bg-white">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin/dashboard"
                  ? pathname === "/admin/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#714B67] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#FBBF24]" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Floating Toast when Quick Billing runs */}
      {billingToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-700 text-xs font-bold flex items-center gap-3 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{billingToast}</span>
        </div>
      )}
    </>
  );
}
