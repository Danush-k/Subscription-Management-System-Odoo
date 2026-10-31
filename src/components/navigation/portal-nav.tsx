"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrightLoopBrandMark } from "@/components/ui/logo";
import {
  LogOut,
  ChevronDown,
  Grid,
  Plus,
} from "lucide-react";

interface PortalNavProps {
  portalType?: "customer" | "staff";
  portalTitle?: string;
  userName?: string;
  userRole?: string;
  companyName?: string;
  quotationsBadge?: number;
  invoicesBadge?: number;
}

export function PortalNav({
  portalType = "staff",
  portalTitle = "Staff Operations Portal",
  userName = "Sarah Jenkins",
  userRole = "Staff Operations",
  companyName = "Brightloop Enterprise Ops",
  quotationsBadge,
  invoicesBadge,
}: PortalNavProps) {
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      href: "/staff/dashboard",
      emoji: "📊",
    },
    {
      id: "subscriptions",
      label: "Subscriptions",
      href: "/staff/subscriptions",
      emoji: "🔄",
    },
    {
      id: "invoices",
      label: "Invoices & Payments",
      href: "/staff/invoices",
      emoji: "🧾",
      badge: invoicesBadge,
    },
    {
      id: "quotations",
      label: "Quotations & Proposals",
      href: "/staff/quotations",
      emoji: "📝",
      badge: quotationsBadge,
    },
    {
      id: "customers",
      label: "Customers",
      href: "/staff/customers",
      emoji: "👥",
    },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.href === "/staff/dashboard") {
      return pathname === "/staff/dashboard";
    }
    return pathname.startsWith(item.href);
  };

  const userInitials = (userName || "SJ")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-2xs select-none">
      {/* Tier 1: Executive Top Bar (Identical to AdminNav Layout) */}
      <div className="border-b border-slate-100 bg-white">
        <div className="dashboard-container py-2.5 flex items-center justify-between text-xs">
          {/* Left: Brand Logo + Status Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/staff/dashboard"
              className="flex items-center hover:opacity-90 transition-opacity"
              title="Brightloop Staff Operations"
            >
              <BrightLoopBrandMark size="sm" />
            </Link>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center gap-2 bg-[#714B67]/10 px-2.5 py-0.5 rounded-full text-[#714B67] text-[11px] font-bold border border-[#714B67]/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Staff Operations Desk</span>
            </div>
          </div>

          {/* Right: Launchpad, Quick Action, Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* App Hub Launchpad Shortcut */}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-[#714B67] transition-colors text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100"
              title="Launchpad Hub"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>App Hub</span>
            </Link>

            {/* Quick Action: New Quotation */}
            <Link
              href="/staff/quotations/new"
              className="hidden md:flex items-center gap-1.5 bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>New Quotation</span>
            </Link>

            {/* Staff User Profile Dropdown (Admin Pattern) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl text-slate-800 text-xs font-bold transition-all border border-slate-200/80 shadow-2xs cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-[#714B67] text-white flex items-center justify-center font-black text-[10px]">
                  {userInitials}
                </div>
                <span className="max-w-[130px] sm:max-w-[160px] truncate">
                  {userName}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Signed in as Staff Specialist
                    </p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {userRole}
                    </p>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      href="/staff/quotations/new"
                      className="flex items-center gap-2.5 px-4 py-2 font-semibold text-slate-700 hover:bg-[#714B67]/10 hover:text-[#714B67] transition-colors"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      <Plus className="w-4 h-4 text-[#714B67]" />
                      <span>Create New Quotation</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1 px-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Dedicated Horizontal Module Navigation Bar (Admin UI Pattern with Suitable Emojis) */}
      <div className="bg-white">
        <div className="dashboard-container overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5">
            {navItems.map((item) => {
              const active = isItemActive(item);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    active
                      ? "bg-[#714B67] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-sm select-none leading-none">{item.emoji}</span>
                  <span>{item.label}</span>
                  {Boolean(item.badge && item.badge > 0) && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                        active
                          ? "bg-amber-400 text-slate-900"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Backwards-compatible alias
export const StaffNav = PortalNav;
