"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrightLoopBrandMark } from "@/components/ui/logo";
import {
  Shield,
  Users,
  Sparkles,
  LogOut,
  ChevronDown,
  Building,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  FileText,
  RotateCcw,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortalNavProps {
  portalType: "customer" | "staff";
  portalTitle: string;
  userName: string;
  userRole: string;
  companyName?: string;
}

export function PortalNav({
  portalType,
  portalTitle,
  userName,
  userRole,
  companyName = "SSN Technology Labs",
}: PortalNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isCustomer = portalType === "customer";

  return (
    <header className="sticky top-0 z-50 bg-white text-slate-900 select-none border-b border-slate-200/80 shadow-2xs">
      {/* Top Professional Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity"
            title="Return to Launchpad"
          >
            <BrightLoopBrandMark size="sm" />
          </Link>

          <span className="text-slate-300 hidden sm:inline">/</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-wide">
              {portalTitle}
            </span>
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isCustomer
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isCustomer ? "bg-emerald-500" : "bg-blue-500"
                }`}
              />
              {isCustomer ? "Active Subscriber" : "Operations Agent"}
            </span>
          </div>
        </div>

        {/* Right: Actions, Persona Switcher, Sign Out */}
        <div className="flex items-center gap-3">
          {/* Quick Hub link */}
          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 text-slate-600 hover:text-[#714B67] transition-colors text-xs font-semibold px-2.5 py-1.5 rounded-xl hover:bg-slate-100"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>App Hub</span>
          </Link>

          {/* Quick Workspace Switcher for Pair-Programming & Demo Testing */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl text-slate-800 text-xs font-semibold transition-all border border-slate-200/80 shadow-2xs active:scale-95"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shadow-xs ${
                  isCustomer ? "bg-emerald-600" : "bg-[#714B67]"
                }`}
              >
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold leading-none text-slate-900">
                  {companyName}
                </div>
                <div className="text-[9px] text-slate-500 leading-none mt-1">
                  {userRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Workspace
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {companyName}
                  </p>
                  <p className="text-[11px] text-slate-500">{userName}</p>
                </div>

                <div className="py-1">
                  <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Workspace Role
                  </div>

                  <Link
                    href="/customer/dashboard"
                    className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${
                      isCustomer
                        ? "bg-[#714B67]/10 text-[#714B67] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="flex-1">
                      <div>Customer Portal</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Self-Service &amp; Invoices
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/staff/dashboard"
                    className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${
                      !isCustomer
                        ? "bg-[#714B67]/10 text-[#714B67] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="flex-1">
                      <div>Staff Operations</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Quotations &amp; Manual Payments
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#714B67] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4 text-[#714B67] shrink-0" />
                    <div className="flex-1">
                      <div>Administrator Workspace</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Full Enterprise Control
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <Link
                    href="/login"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
