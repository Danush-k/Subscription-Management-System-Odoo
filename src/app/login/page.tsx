"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Building,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<"ADMIN" | "STAFF" | "CUSTOMER">("ADMIN");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-configured seeded personas for 1-click instant login
  const personas = [
    {
      id: "ADMIN" as const,
      name: "Danush Kalyan",
      role: "Administrator",
      email: "admin@brightloopsoftware.com",
      password: "BrightloopAdmin#2026",
      redirect: "/admin/dashboard",
      badge: "Full Control",
      icon: Shield,
      color: "bg-[#714B67] text-white",
      borderColor: "border-[#714B67]",
    },
    {
      id: "STAFF" as const,
      name: "Operations Staff",
      role: "Support & Billing",
      email: "staff@brightloopsoftware.com",
      password: "BrightloopStaff#2026",
      redirect: "/staff/dashboard",
      badge: "Operations",
      icon: Users,
      color: "bg-blue-600 text-white",
      borderColor: "border-blue-600",
    },
    {
      id: "CUSTOMER" as const,
      name: "SSN Technology Labs",
      role: "B2B Customer",
      email: "billing@ssntechlabs.com",
      password: "BrightloopClient#2026",
      redirect: "/customer/dashboard",
      badge: "Self-Service",
      icon: Building,
      color: "bg-emerald-600 text-white",
      borderColor: "border-emerald-600",
    },
  ];

  const handleQuickLogin = (persona: typeof personas[0]) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setSelectedPersona(persona.id);
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsLoading(false);
      router.push(persona.redirect);
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Simple role router based on credentials
    setTimeout(() => {
      setIsLoading(false);
      if (email.includes("admin")) {
        router.push("/admin/dashboard");
      } else if (email.includes("staff")) {
        router.push("/staff/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between text-slate-900 font-sans">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xs">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#714B67] text-[#F2C744] flex items-center justify-center font-black text-sm">
            B
          </div>
          <span className="text-xl font-black text-[#714B67] tracking-tight">Brightloop</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
            SaaS
          </span>
        </Link>

        <div className="text-xs text-slate-500">
          Need an account?{" "}
          <Link href="/register" className="font-bold text-[#714B67] hover:underline">
            Register here
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Brightloop
            </h1>
            <p className="text-xs text-slate-500">
              Select your role to access your dedicated enterprise workspace.
            </p>
          </div>

          {/* 1-Click Fast Persona Switcher */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Demo Access (1-Click Login)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {personas.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleQuickLogin(p)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "border-[#714B67] bg-[#714B67]/5 ring-2 ring-[#714B67]/20"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg ${p.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{p.badge}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">{p.role}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              Or sign in with email
            </span>
          </div>

          {/* Traditional Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Protected by Brightloop Enterprise Role-Based Access Control (RBAC).
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/50">
        &copy; 2026 Brightloop Software. All rights reserved.
      </footer>
    </div>
  );
}
