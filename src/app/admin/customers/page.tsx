"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

      <main className="dashboard-container pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Customer Accounts &amp; B2B Profiles
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Live client directories, GSTIN registration data, subscription counts, and lifetime revenue from PostgreSQL.
            </p>
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
                  <th className="py-3.5 px-6">Company &amp; Tax ID</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Subscriptions</th>
                  <th className="py-3.5 px-6">Lifetime Value</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#714B67]" />
                      <p className="mt-2 text-xs">Loading customer directory from PostgreSQL...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No customer accounts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
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
                        ₹{c.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={c.status === "ACTIVE" ? "success" : "outline"}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
