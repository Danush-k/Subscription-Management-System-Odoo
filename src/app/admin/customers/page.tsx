"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import {
  Users,
  Search,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface CustomerItem {
  id: string;
  customerNumber: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  taxId: string;
  city: string;
  state: string;
  activeSubscriptions: number;
  totalSpent: number;
  status: "ACTIVE" | "INACTIVE";
}

const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: "c-1",
    customerNumber: "CUST-2026-0001",
    name: "Danush Kalyan",
    companyName: "SSN Technology Labs Pvt. Ltd.",
    email: "billing@ssntechlabs.com",
    phone: "+91 98401 24700",
    taxId: "GSTIN33SSN1234F1Z1",
    city: "Chennai",
    state: "Tamil Nadu",
    activeSubscriptions: 2,
    totalSpent: 360000,
    status: "ACTIVE",
  },
  {
    id: "c-2",
    customerNumber: "CUST-2026-0002",
    name: "Rajesh Kalyan",
    companyName: "Kalyan Retailers LLP",
    email: "finance@kalyanretail.in",
    phone: "+91 98840 55667",
    taxId: "GSTIN33KLY7788P1Z4",
    city: "Coimbatore",
    state: "Tamil Nadu",
    activeSubscriptions: 1,
    totalSpent: 92500,
    status: "ACTIVE",
  },
  {
    id: "c-3",
    customerNumber: "CUST-2026-0003",
    name: "Anand Sundaram",
    companyName: "AeroDynamics Corp",
    email: "procure@aerodynamics.com",
    phone: "+91 80234 99881",
    taxId: "GSTIN29AER5544K1Z3",
    city: "Bengaluru",
    state: "Karnataka",
    activeSubscriptions: 1,
    totalSpent: 67200,
    status: "ACTIVE",
  },
  {
    id: "c-4",
    customerNumber: "CUST-2026-0004",
    name: "Siddharth Mehta",
    companyName: "Zenith Financials Ltd.",
    email: "accounts@zenithfin.co",
    phone: "+91 22409 11223",
    taxId: "GSTIN27ZEN9900J1Z5",
    city: "Mumbai",
    state: "Maharashtra",
    activeSubscriptions: 0,
    totalSpent: 288000,
    status: "INACTIVE",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrightLoopModuleIcon appId="customers" className="w-12 h-12" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Customer Accounts &amp; B2B Profiles
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client directories, GSTIN registration data, subscription counts, and lifetime revenue.
                </p>
              </div>
            </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, customer #, GSTIN, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Customer #</th>
                  <th className="py-3.5 px-6">Company & Tax ID</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Subscriptions</th>
                  <th className="py-3.5 px-6">Lifetime Value</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 text-xs">
                      {c.customerNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{c.companyName}</div>
                      <div className="text-xs font-mono text-slate-400">{c.taxId}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div>{c.email}</div>
                      <div className="text-slate-400">{c.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div>{c.city}</div>
                      <div className="text-slate-400">{c.state}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <RotateCcw className="w-3.5 h-3.5 text-[#714B67]" />
                        <span>{c.activeSubscriptions} active</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      ₹{c.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={c.status === "ACTIVE" ? "active" : "outline"}>
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
