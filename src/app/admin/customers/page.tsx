"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  X,
  CreditCard,
  ArrowRight,
  User,
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
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.customers) {
          setCustomers(data.customers);
        }
      }
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="customers" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Customer Accounts &amp; B2B Profiles
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Client directories, GSTIN registration data, subscription counts, and lifetime revenue. Click any row for details.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, customer #, GSTIN, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all"
            />
          </div>
        </div>

        {/* Customer Directory Table with Clickable Rows */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-600 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
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
                      <p className="mt-2 text-xs">Loading customer accounts from database...</p>
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
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-purple-50/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">
                        {c.customerNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-xs">{c.companyName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{c.taxId}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div>{c.email}</div>
                        <div className="text-slate-400 text-[11px]">{c.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div>{c.city}</div>
                        <div className="text-slate-400 text-[11px]">{c.state}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <RotateCcw className="w-3.5 h-3.5 text-[#714B67]" />
                          <span>{c.activeSubscriptions} active</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 text-sm">
                        ₹{c.totalSpent.toLocaleString("en-IN")}.00
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={c.status === "ACTIVE" ? "active" : "outline"}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filtered.length} of {customers.length} customer records
            </span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Database Live Synchronized
            </span>
          </div>
        </div>
      </main>

      {/* Customer Detailed View Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg">{selectedCustomer.companyName}</h3>
                    <Badge variant={selectedCustomer.status === "ACTIVE" ? "active" : "outline"}>
                      {selectedCustomer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomer.customerNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Account Details */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Authorized Representative &amp; Contact</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Name</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedCustomer.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-mono text-slate-800">{selectedCustomer.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone / Mobile</span>
                    <span className="font-mono text-slate-800">{selectedCustomer.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">GSTIN / Tax ID</span>
                    <span className="font-mono font-bold text-[#714B67]">{selectedCustomer.taxId}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Billing Jurisdiction &amp; Address</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">City / Municipality</span>
                    <span className="font-semibold text-slate-900">{selectedCustomer.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">State / Province</span>
                    <span className="font-semibold text-slate-900">{selectedCustomer.state}</span>
                  </div>
                </div>
              </div>

              {/* Lifetime Financial Metrics */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Commercial &amp; Subscription Activity</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Active Subscriptions</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedCustomer.activeSubscriptions} Recurring Contracts
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lifetime Collected Revenue</span>
                    <span className="font-mono font-black text-emerald-700 text-base">
                      ₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Link href={`/admin/invoices?search=${encodeURIComponent(selectedCustomer.name)}`}>
                  <Button variant="outline" size="sm" className="font-bold text-xs">
                    View Invoices
                  </Button>
                </Link>
                <Link href={`/admin/subscriptions/new?customer=${selectedCustomer.id}`}>
                  <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs">
                    New Subscription &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
