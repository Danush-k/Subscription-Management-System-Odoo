"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrightLoopBrandMark } from "@/components/ui/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [city, setCity] = useState("Chennai");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          companyName,
          email,
          phone,
          taxId,
          city,
          password,
          confirmPassword,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setErrorMsg(payload.error ?? "Unable to create the account");
        return;
      }

      setSuccess(true);
      router.push("/customer/dashboard");
    } catch {
      setErrorMsg("Unable to reach the registration service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEAF4] flex flex-col justify-between text-slate-900 font-sans relative overflow-x-hidden select-none">
      {/* Upper Shaded Canvas: Soft lavender with clear color contrast */}
      <div className="absolute top-0 left-0 right-0 h-[48vh] bg-[#ECE5F2] -z-0" />

      {/* Middle Curvy Wave Separator */}
      <div className="absolute top-[40vh] left-0 right-0 w-full overflow-hidden leading-none -z-0">
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
      <div className="absolute top-[52vh] bottom-0 left-0 right-0 bg-white -z-0" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-purple-200/60 bg-[#ECE5F2]/90 backdrop-blur-xs relative z-10">
        <Link href="/" className="hover:opacity-95 transition-opacity">
          <BrightLoopBrandMark size="md" />
        </Link>

        <div className="text-xs text-slate-600 font-semibold">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#714B67] hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-2xl space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#714B67]/10 text-[#714B67] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              Enterprise Subscriber Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Your BrightLoop Account
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Register your organization to access automated recurring billing, tax compliance, and self-service portals.
            </p>
          </div>

          {success ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900">
                Company Account Activated!
              </h3>
              <p className="text-xs text-emerald-700">
                Welcome to BrightLoop, {companyName || "Partner"}! Redirecting to your Customer Portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Company Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. SSN Technology Labs"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Authorized Signatory <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Danush Kalyan"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Billing Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="billing@company.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    GSTIN (Tax ID)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                      placeholder="33AAAAA0000A1Z5"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Billing State / Jurisdiction
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all font-semibold"
                  >
                    <option value="Chennai">Tamil Nadu (33)</option>
                    <option value="Bengaluru">Karnataka (29)</option>
                    <option value="Mumbai">Maharashtra (27)</option>
                    <option value="Delhi">Delhi NCR (07)</option>
                    <option value="Hyderabad">Telangana (36)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Set Portal Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Company Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                By registering, you agree to BrightLoop&apos;s B2B Terms of Service and SLA.
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 relative z-10">
        &copy; 2026 BrightLoop Software. All rights reserved.
      </footer>
    </div>
  );
}
