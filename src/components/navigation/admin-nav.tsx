"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

interface AdminNavProps {
  currentTab?: string;
}

export function AdminNav({ currentTab }: AdminNavProps) {
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-[#714B67] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity font-bold text-sm tracking-tight"
          >
            <div className="w-6 h-6 rounded-md bg-[#F2C744] text-[#714B67] flex items-center justify-center font-black text-xs">
              B
            </div>
            <span>Brightloop</span>
          </Link>
          <span className="text-white/40">|</span>
          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>App Launcher</span>
          </Link>
          <span className="text-white/40">•</span>
          
          {/* Switch Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md text-white transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#F2C744]" />
              <span>Admin: Danush Kalyan</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-48 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-400 font-semibold uppercase">
                  Switch Portal
                </div>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <Shield className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Admin Workspace</span>
                </Link>
                <Link
                  href="/staff/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Staff Workspace</span>
                </Link>
                <Link
                  href="/customer/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Customer Self-Service</span>
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <span>Sign Out / Switch User</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 sm:px-6 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 sm:space-x-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#714B67]/10 text-[#714B67] border-b-2 border-[#714B67]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#714B67]" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
