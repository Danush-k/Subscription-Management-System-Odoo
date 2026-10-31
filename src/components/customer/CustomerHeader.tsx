"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BrightLoopBrandMark } from "@/components/ui/logo";
import {
  LayoutDashboard,
  RotateCcw,
  FileText,
  FileCheck,
  Building2,
  ChevronDown,
  Bell,
  Grid,
  Shield,
  Users,
  Sparkles,
  LogOut,
  MapPin,
  Settings,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomerProfile, NotificationItem } from "./types";

interface CustomerHeaderProps {
  customer: CustomerProfile;
  notifications?: NotificationItem[];
  pendingQuotationsCount?: number;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function CustomerHeader({
  customer,
  notifications = [],
  pendingQuotationsCount = 0,
  activeTab,
  onSelectTab,
}: CustomerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      href: "/customer/dashboard?tab=overview",
      tabKey: "overview",
    },
    {
      id: "quotations",
      label: "Quotations & Proposals",
      icon: FileCheck,
      href: "/customer/dashboard?tab=quotations",
      tabKey: "quotations",
      badge: pendingQuotationsCount,
    },
    {
      id: "subscriptions",
      label: "My Subscriptions",
      icon: RotateCcw,
      href: "/customer/dashboard?tab=subscriptions",
      tabKey: "subscriptions",
    },
    {
      id: "invoices",
      label: "Invoices & Receipts",
      icon: FileText,
      href: "/customer/dashboard?tab=invoices",
      tabKey: "invoices",
    },
    {
      id: "profile",
      label: "Billing Profile & GSTIN",
      icon: Building2,
      href: "/customer/profile",
      tabKey: "profile",
    },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.id === "profile") {
      return pathname.startsWith("/customer/profile") || activeTab === "profile" || activeTab === "billing";
    }
    if (pathname.startsWith("/customer/profile")) {
      return false;
    }
    const currentTab = activeTab || searchParams.get("tab") || "overview";
    if (item.id === "invoices" && currentTab === "payments") {
      return true;
    }
    return currentTab === item.tabKey;
  };

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (pathname.startsWith("/customer/profile")) {
      if (item.id === "profile") {
        e.preventDefault();
        return;
      }
      return;
    }

    if (pathname.startsWith("/customer/dashboard")) {
      if (item.id === "profile") {
        return;
      }
      e.preventDefault();
      if (onSelectTab) {
        onSelectTab(item.tabKey);
      }
      router.push(item.href, { scroll: false });
    }
  };

  const userInitials = (customer?.name || customer?.companyName || "SS")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-2xs select-none">
      {/* Tier 1: Executive Top Bar (Aligned with Admin UI) */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs border-b border-slate-100 bg-white">
        {/* Left: Brand + Status Pill + Account Ref */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/customer/dashboard"
            className="flex items-center hover:opacity-90 transition-opacity"
            title="Customer Portal Dashboard"
          >
            <BrightLoopBrandMark size="sm" />
          </Link>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-2 bg-[#714B67]/10 px-2.5 py-0.5 rounded-full text-[#714B67] text-[11px] font-bold border border-[#714B67]/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Customer Self-Service</span>
          </div>
        </div>

        {/* Right: Actions, Notifications, Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* App Hub Launchpad */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-slate-600 hover:text-[#714B67] transition-colors text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100"
            title="Launchpad Hub"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>App Hub</span>
          </Link>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setRoleMenuOpen(false);
              }}
              className="relative p-1.5 text-slate-600 hover:text-[#714B67] hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#714B67]" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#714B67] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#714B67]"></span>
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    System Notifications
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {notifications.length} alerts
                  </Badge>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No pending notifications. All services operating normally.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3"
                      >
                        <div
                          className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                            notif.level === "warning"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20"
                          }`}
                        >
                          {notif.level === "warning" ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="text-slate-200 hidden sm:inline">•</span>

          {/* Customer Profile Dropdown (Identical pattern to AdminNav) */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl text-slate-800 text-xs font-bold transition-all border border-slate-200/80 shadow-2xs"
            >
              <div className="w-5 h-5 rounded-md bg-[#714B67] text-white flex items-center justify-center font-black text-[10px]">
                {userInitials}
              </div>
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {customer?.companyName || customer?.name || "Client"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Signed in as Subscriber
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                    {customer?.name || "Danush Kalyan"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {customer?.email || "billing@ssntechlabs.com"}
                  </p>
                </div>

                <div className="py-1 text-xs">
                  <Link
                    href="/customer/profile"
                    className="flex items-center gap-2.5 px-4 py-2 font-semibold text-slate-700 hover:bg-[#714B67]/10 hover:text-[#714B67] transition-colors"
                    onClick={() => setRoleMenuOpen(false)}
                  >
                    <Building2 className="w-4 h-4 text-[#714B67]" />
                    <span>Company Profile &amp; GSTIN</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <Link
                    href="/login"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    onClick={() => setRoleMenuOpen(false)}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Switch Account</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Dedicated Horizontal Module Navigation Bar (Admin UI Pattern) */}
      <div className="px-4 sm:px-6 overflow-x-auto no-scrollbar bg-white">
        <nav className="flex space-x-1 sm:space-x-2 py-1.5">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  active
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    active ? "text-[#FBBF24]" : "text-slate-500"
                  }`}
                />
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
    </header>
  );
}
