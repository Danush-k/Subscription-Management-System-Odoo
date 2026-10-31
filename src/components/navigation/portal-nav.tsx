"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrightloopLogo } from "@/components/ui/logo";
import {
  LogOut,
  ChevronDown,
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
    <header className="sticky top-0 z-50 bg-[#714B67] text-white select-none shadow-md">
      {/* Top Professional Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center hover:opacity-95 transition-opacity"
            title="Return to Launchpad"
          >
            <BrightloopLogo size="sm" variant="light" showBadge={false} />
          </Link>

          <span className="text-white/30 hidden sm:inline">/</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide">
              {portalTitle}
            </span>
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isCustomer
                  ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                  : "bg-blue-500/20 text-blue-200 border-blue-400/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isCustomer ? "bg-emerald-400" : "bg-blue-400"
                }`}
              />
              {isCustomer ? "Active Subscriber" : "Operations Agent"}
            </span>
          </div>
        </div>

        {/* Right: Actions, Persona Switcher, Sign Out */}
        <div className="flex items-center gap-3">
          {/* Quick Workspace Switcher for Pair-Programming & Demo Testing */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all border border-white/15 active:scale-95"
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-slate-900 shadow-xs ${
                  isCustomer ? "bg-emerald-300" : "bg-[#FBBF24]"
                }`}
              >
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold leading-none text-white">
                  {companyName}
                </div>
                <div className="text-[9px] text-white/70 leading-none mt-1">
                  {userRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/70 ml-0.5" />
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
