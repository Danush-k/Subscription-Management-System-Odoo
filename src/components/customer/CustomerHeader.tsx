"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  RotateCcw,
  FileText,
  CreditCard,
  User,
  Clock,
  Building2,
  MapPin,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";
import { BrightloopLogo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { CustomerProfile, NotificationItem } from "./types";

interface CustomerHeaderProps {
  customer: CustomerProfile;
  notifications?: NotificationItem[];
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function CustomerHeader({
  customer,
  notifications = [],
  activeTab,
  onSelectTab,
}: CustomerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
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
      id: "activity",
      label: "Activity Timeline",
      icon: Clock,
      href: "/customer/dashboard?tab=activity",
      tabKey: "activity",
    },
    {
      id: "profile",
      label: "Billing Profile & GSTIN",
      icon: User,
      href: "/customer/profile",
      tabKey: "profile",
    },
  ];

  // Helper to determine active state
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
    setShowMobileNav(false);
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

  const userInitials = (customer.name || customer.companyName || "SS")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="dashboard-container">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* 1. Left: Brand & Portal Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/customer/dashboard" className="flex items-center gap-2.5 group">
              <BrightloopLogo
                size="sm"
                showText={false}
                showBadge={false}
                className="shrink-0 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-lg text-slate-900 tracking-tight">
                    bright<span className="text-[#714B67]">loop</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                    SaaS
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#714B67] mt-0.5">
                  Customer Portal
                </span>
              </div>
            </Link>

            <span className="hidden xl:inline-block text-slate-300">/</span>

            <div className="hidden xl:flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[11px] font-bold text-slate-700 bg-slate-50 border-slate-200">
                {customer?.customerNumber}
              </Badge>
            </div>
          </div>

          {/* 2. Middle: Horizontal Navigation Tabs (Displayed on screens >= 1160px with zero overlapping) */}
          <nav className="hidden min-[1160px]:flex items-center gap-1.5 shrink-0 py-1">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap group ${
                    active
                      ? "bg-[#714B67]/10 text-[#714B67] shadow-2xs border border-[#714B67]/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#714B67]" : "text-[#714B67]/60 group-hover:text-[#714B67]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Notifications & Customer Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-[#714B67] hover:text-[#714B67] hover:bg-[#714B67]/10 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#714B67]" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
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
                                : notif.level === "info"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
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

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Profile Dropdown Menu Trigger */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 p-1.5 sm:px-2.5 rounded-2xl border transition-all text-left ${
                  showProfileMenu
                    ? "border-[#714B67] bg-[#714B67]/5 shadow-xs"
                    : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {/* Avatar with Status indicator */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#714B67] to-[#8d5e81] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    {userInitials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>

                {/* Name, Company & Badge (Displayed on screens >= 1340px) */}
                <div className="hidden min-[1340px]:flex flex-col min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                      {customer.name}
                    </span>
                    <Badge variant="active" className="text-[9px] py-0 px-1 font-semibold uppercase">
                      {customer.status}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                    {customer.companyName || customer.email}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown User Header */}
                  <div className="px-5 py-3 border-b border-slate-100 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#714B67] text-white flex items-center justify-center font-black text-sm shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {customer.name}
                        </h4>
                        <Badge variant="active" className="text-[9px] py-0 px-1 font-semibold uppercase">
                          {customer.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {customer.companyName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Links */}
                  <div className="py-2 px-2 space-y-0.5 text-xs">
                    <Link
                      href="/customer/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#714B67] hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <User className="w-4 h-4 text-[#714B67]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/customer/profile#company"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#714B67] hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-[#714B67]" />
                      <span>Company Information</span>
                    </Link>

                    <Link
                      href="/customer/profile#billing"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#714B67] hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#714B67]" />
                      <span>Billing Address &amp; GSTIN</span>
                    </Link>

                    <Link
                      href="/customer/profile#settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#714B67] hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#714B67]" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 my-1 mx-3" />

                  {/* Sign Out */}
                  <div className="px-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Compact Navigation Toggle (Shown on screens < 1160px) */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="min-[1160px]:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle navigation"
            >
              {showMobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Navigation Drawer */}
      {showMobileNav && (
        <div className="min-[1160px]:hidden border-t border-slate-200 bg-white p-4 space-y-2 animate-in fade-in slide-in-from-top-1">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#714B67]" : "text-[#714B67]/70"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
