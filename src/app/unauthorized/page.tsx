"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, ArrowRight, UserCheck, Shield, Building, Users } from "lucide-react";
import { BrightloopLogo } from "@/components/ui/logo";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-6 py-16 flex flex-col items-center justify-center text-slate-900 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="flex justify-center pb-2 border-b border-slate-100">
          <BrightloopLogo size="md" />
        </div>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current logged-in role does not have authorization to view this workspace.
          </p>
        </div>

        {/* Quick Portal Switcher */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
            Navigate to your authorized workspace:
          </span>

          <Link
            href="/admin/dashboard"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/70 font-semibold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#714B67]" />
              <span>Admin Workspace (Requires Admin)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/customer/dashboard"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/70 font-semibold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#714B67]" />
              <span>Customer Self-Service Portal</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/staff/dashboard"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/70 font-semibold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#714B67]" />
              <span>Staff Operations Portal</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-[#714B67] hover:bg-[#5e3d55] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Switch Account / Sign In
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
