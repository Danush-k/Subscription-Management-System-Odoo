"use client";

import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Calendar,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerProfile } from "./types";

interface BillingProfileSectionProps {
  customer: CustomerProfile;
  onProfileUpdated: () => void;
}

export function BillingProfileSection({
  customer,
  onProfileUpdated,
}: BillingProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState(customer.companyName || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [taxId, setTaxId] = useState(customer.taxId || "");
  const [street, setStreet] = useState(customer.billingAddress?.street || "");
  const [city, setCity] = useState(customer.billingAddress?.city || "");
  const [state, setState] = useState(customer.billingAddress?.state || "");
  const [postalCode, setPostalCode] = useState(customer.billingAddress?.postalCode || "");
  const [country, setCountry] = useState(customer.billingAddress?.country || "India");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customer.email,
          companyName,
          phone,
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

      setSuccessMsg("Billing profile successfully updated!");
      setIsEditing(false);
      onProfileUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (isoStr: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(isoStr));
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {errorMsg}
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Customer Account &amp; Billing Profile
              </h2>
              <Badge variant="active" className="text-[10px]">
                {customer.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official company registration, tax credentials, and designated billing dispatch destination.
            </p>
          </div>

          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="text-xs font-bold text-slate-700 hover:text-[#714B67] hover:border-[#714B67]/40 gap-1.5 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(false)}
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 gap-1.5 self-start sm:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Company Name / Entity</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Registered Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={customer.email}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Billing Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 00000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">GSTIN / Corporate Tax ID</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                  placeholder="GSTIN33..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                Registered Billing Address
              </h4>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Suite, Building, Street..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-[#714B67] hover:bg-[#5a3b52] text-white font-bold text-xs gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Account Credentials Card */}
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Enterprise Entity Details
              </h4>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-[#714B67] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Organization:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {customer.companyName || customer.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#714B67] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Billing Email:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {customer.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#714B67] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Phone:</span>
                    <span className="font-semibold text-slate-800">
                      {customer.phone || "Not specified"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#714B67] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tax Identification (GSTIN):</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {customer.taxId || "Not Registered"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#714B67] mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Since:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(customer.registrationDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Registered Billing Address
              </h4>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#714B67] mt-0.5 shrink-0" />
                <div className="space-y-1.5 text-slate-700">
                  <p className="font-bold text-slate-900 text-sm">
                    {customer.companyName}
                  </p>
                  <p className="leading-relaxed">
                    {customer.billingAddress?.street || "No street address recorded"}<br />
                    {customer.billingAddress?.city}, {customer.billingAddress?.state} - {customer.billingAddress?.postalCode}<br />
                    {customer.billingAddress?.country}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Dispatch Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

