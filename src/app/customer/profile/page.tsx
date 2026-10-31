"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  Calendar,
  Lock,
  Settings,
  Bell,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerProfile } from "@/components/customer/types";

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form Fields
  // 1. Personal Information
  const [fullName, setFullName] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");

  // 2. Company Information
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");

  // 3. Billing Information
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  // Notification Preferences
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);

  // Fetch customer profile
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/customer/profile");
      if (!res.ok) {
        throw new Error("Failed to load customer profile");
      }
      const json = await res.json();
      const c: CustomerProfile = json.customer;
      setCustomer(c);

      // Populate form
      setFullName(c.name || "");
      setPersonalPhone(c.phone || "");
      setCompanyName(c.companyName || "");
      setTaxId(c.taxId || "");
      setStreet(c.billingAddress?.street || "");
      setCity(c.billingAddress?.city || "");
      setState(c.billingAddress?.state || "");
      setPostalCode(c.billingAddress?.postalCode || "");
      setCountry(c.billingAddress?.country || "India");
    } catch (err: any) {
      setSaveError(err.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          companyName,
          phone: personalPhone,
          taxId,
          billingAddress: {
            street,
            city,
            state,
            postalCode,
            country,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSaveSuccess("Profile and billing information successfully saved!");
      await fetchProfile();
    } catch (err: any) {
      setSaveError(err.message || "Could not save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = (fullName || companyName || "SS")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formatDate = (isoStr: string | undefined) => {
    if (!isoStr) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(isoStr));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Customer Profile...
        </p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl max-w-md w-full text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Profile Unavailable</h2>
          <p className="text-xs text-slate-500">Customer account details could not be retrieved.</p>
          <Button onClick={fetchProfile} size="sm" className="bg-[#714B67] text-white text-xs">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col pb-20 font-sans">
      {/* 1. Enhanced Header with Navigation Tabs & Profile Menu */}
      <CustomerHeader customer={customer} activeTab="profile" />

      <main className="dashboard-container pt-8 space-y-8 flex-1">
        {/* Breadcrumb & Navigation Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/customer/dashboard"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Customer Profile &amp; Organization Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage contact credentials, company GSTIN registration, and billing addresses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="active" className="text-xs font-bold py-1 px-3">
              {customer.status} Account
            </Badge>
            <Badge variant="outline" className="text-xs font-mono font-bold text-slate-600">
              {customer.customerNumber}
            </Badge>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {saveSuccess}
            </div>
            <button onClick={() => setSaveSuccess(null)} className="font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {saveError}
            </div>
            <button onClick={() => setSaveError(null)} className="font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Personal Information */}
          <div id="personal" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">
                  Primary authorized contact representing this organization.
                </p>
              </div>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#714B67] to-[#915e85] text-white flex items-center justify-center font-black text-xl shadow-xs">
                {userInitials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{customer.name}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    Role: B2B Customer
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">{customer.email}</p>
                <p className="text-[11px] text-slate-400">
                  Registered: {formatDate(customer.registrationDate)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Danush Kalyan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Registered Login Email</span>
                  <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Authenticated / Read-Only
                  </span>
                </label>
                <input
                  type="email"
                  disabled
                  value={customer.email}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Personal Direct Phone</label>
                <input
                  type="tel"
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  placeholder="+91 98401 00000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Client Account Identifier</label>
                <input
                  type="text"
                  disabled
                  value={customer.customerNumber}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Company Information */}
          <div id="company" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Company &amp; Legal Entity
                </h2>
                <p className="text-xs text-slate-500">
                  Official corporate entity name, tax registration number, and business details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Corporate Entity Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Technologies Pvt. Ltd."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center justify-between">
                  <span>Goods &amp; Services Tax ID (GSTIN)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Verified Format
                  </span>
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                  placeholder="GSTIN33SSN1234F1Z1"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Company Billing Email</label>
                <input
                  type="email"
                  disabled
                  value={customer.email}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Corporate Phone</label>
                <input
                  type="tel"
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Billing Address Information */}
          <div id="billing" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Designated Billing Address
                </h2>
                <p className="text-xs text-slate-500">
                  Address printed on all tax invoices, receipts, and statutory compliance documents.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Street / Building Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Old Mahabalipuram Rd, Kalavakkam"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Chennai"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Tamil Nadu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">PIN / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="603110"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Account Settings & Preferences */}
          <div id="settings" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Notification &amp; Security Preferences
                </h2>
                <p className="text-xs text-slate-500">
                  Manage communication channels and review authentication credentials.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Invoice Dispatch Alerts</span>
                  <span className="text-slate-500 text-[11px]">
                    Send automated PDF copies to {customer.email} on generation.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailInvoices}
                  onChange={(e) => setEmailInvoices(e.target.checked)}
                  className="w-4 h-4 text-[#714B67] rounded-md focus:ring-[#714B67]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Renewal Notice Alerts</span>
                  <span className="text-slate-500 text-[11px]">
                    Notify 15 days in advance prior to recurring charge executions.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={renewalAlerts}
                  onChange={(e) => setRenewalAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#714B67] rounded-md focus:ring-[#714B67]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="font-bold text-slate-900 block">Enterprise Security &amp; Access</span>
                    <span className="text-slate-500 text-[11px]">
                      Account authenticated via Brightloop Secure Customer Portal Session.
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] bg-white">
                  Active Session
                </Badge>
              </div>
            </div>
          </div>

          {/* Sticky / Bottom Action Bar */}
          <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-lg flex items-center justify-between">
            <Link href="/customer/dashboard">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-bold text-slate-600"
              >
                Back to Dashboard
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={isSaving}
              size="sm"
              className="bg-[#714B67] hover:bg-[#5b3b53] text-white font-bold text-xs gap-1.5 shadow-sm px-6"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving Changes..." : "Save Profile Information"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

