"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Users,
  Building,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrightLoopBrandMark } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@brightloopsoftware.com");
  const [password, setPassword] = useState("BrightloopAdmin#2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "STAFF" | "CUSTOMER">("ADMIN");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-configured seeded personas for instant 1-click verification
  const personas = [
    {
      id: "ADMIN" as const,
      name: "Danush Kalyan",
      role: "Administrator",
      email: "admin@brightloopsoftware.com",
      password: "BrightloopAdmin#2026",
      redirect: "/admin/dashboard",
      icon: Shield,
    },
    {
      id: "STAFF" as const,
      name: "Operations Staff",
      role: "Staff Operations",
      email: "staff@brightloopsoftware.com",
      password: "BrightloopStaff#2026",
      redirect: "/staff/dashboard",
      icon: Users,
    },
    {
      id: "CUSTOMER" as const,
      name: "SSN Technology Labs",
      role: "Customer Portal",
      email: "billing@ssntechlabs.com",
      password: "BrightloopClient#2026",
      redirect: "/customer/dashboard",
      icon: Building,
    },
  ];

  const submitLogin = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setErrorMsg(payload.error ?? "Unable to sign in");
        return;
      }

      const roleRedirects = {
        ADMIN: "/admin/dashboard",
        STAFF: "/staff/dashboard",
        CUSTOMER: "/customer/dashboard",
      } as const;
      router.push(roleRedirects[payload.data.user.role as keyof typeof roleRedirects]);
    } catch {
      setErrorMsg("Unable to reach the authentication service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (persona: typeof personas[0]) => {
    setSelectedRole(persona.id);
    setEmail(persona.email);
    setPassword(persona.password);
    void submitLogin(persona.email, persona.password);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#EFEAF4] flex flex-col justify-between text-slate-900 font-sans select-none relative overflow-x-hidden">
      {/* Upper Shaded Canvas: Soft lavender with clear, vibrant color contrast */}
      <div className="absolute top-0 left-0 right-0 h-[52vh] bg-[#ECE5F2] -z-0" />

      {/* Middle Curvy Wave Separator: Positioned at middle screen height */}
      <div className="absolute top-[44vh] left-0 right-0 w-full overflow-hidden leading-none -z-0">
        <svg
          viewBox="0 0 1440 160"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-36 sm:h-44 text-white block"
        >
          <path
            d="M0,80 C360,160 1080,0 1440,80 L1440,160 L0,160 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Lower Canvas: Pure Crisp White */}
      <div className="absolute top-[56vh] bottom-0 left-0 right-0 bg-white -z-0" />

      {/* Top Brand Header */}
      <header className="pt-8 sm:pt-10 pb-4 text-center px-4 relative z-10">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          {/* BrightLoop: Capital 'B', Capital 'L', 'oo' in GREY, others in PURPLE */}
          <BrightLoopBrandMark size="xl" />
        </Link>

        {/* Subscription Slogans (NO HR references) */}
        <div className="mt-3 text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
          <span>Subscriptions </span>
          <span className="relative inline-block mx-1">
            <span className="relative z-10 px-2.5 py-0.5 text-[#714B67] font-black text-sm sm:text-base">
              made simple
            </span>
            <span className="absolute inset-0 bg-[#E9D5FF] rounded-md -rotate-1 shadow-2xs -z-0 transform scale-105" />
          </span>
          <span> for modern businesses.</span>
          <br />
          <span className="font-handwriting text-xl text-[#714B67] font-bold">
            ONE PLATFORM &bull; ALL SUBSCRIPTIONS
          </span>
        </div>
      </header>

      {/* Main Centered Floating Card positioned right over the middle curve */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 relative z-10">
        <div className="max-w-[420px] w-full bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/90 space-y-5 relative">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Sign in with your enterprise credentials to access your subscription workspace.
            </p>
          </div>

          {/* 1-Click Demo Persona Chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              1-Click Demo Persona
            </div>
            <div className="grid grid-cols-3 gap-2">
              {personas.map((p) => {
                const isSelected = selectedRole === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-[#714B67] bg-[#714B67]/5 ring-2 ring-[#714B67]/20 font-bold"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/70 text-slate-600"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-900 truncate">
                      {p.role}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign In Form matching Image 1 with uppercase labels and red asterisks */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                LOGIN ID / EMAIL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your enterprise email"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                PASSWORD <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#714B67] focus:ring-[#714B67]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Password reset link dispatched to " + email)}
                className="text-xs font-semibold text-slate-700 hover:text-[#714B67] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <span>Signing In...</span> : <span>Sign In</span>}
            </Button>

            <div className="pt-2 text-center text-xs text-slate-600">
              Registering an enterprise?{" "}
              <Link href="/register" className="font-bold text-slate-900 hover:underline">
                Create an account
              </Link>
            </div>
          </form>

          {/* Bottom Right Handwritten Annotation with Curved Arrow: ONE PLATFORM ALL SUBSCRIPTIONS */}
          <div className="hidden sm:flex items-center gap-1.5 absolute -right-28 -bottom-9 whitespace-nowrap">
            <svg
              width="45"
              height="35"
              viewBox="0 0 45 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#714B67] transform rotate-12 shrink-0"
            >
              <path
                d="M5 25C15 28 30 25 35 10M35 10L27 12M35 10L36 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-handwriting text-xl font-bold text-[#714B67]">
              ONE PLATFORM, ALL SUBSCRIPTIONS!
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 relative z-10">
        &copy; 2026 BrightLoop Software. Enterprise Subscription Management Platform.
      </footer>
    </div>
  );
}
