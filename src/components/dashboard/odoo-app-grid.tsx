"use client";

import React from "react";
import Link from "next/link";
import {
  RotateCcw,
  FileText,
  CreditCard,
  Percent,
  Layers,
  BarChart3,
  Users,
  ShieldCheck,
  Package,
  Wrench,
  Receipt,
  UserCheck,
} from "lucide-react";

export interface AppItem {
  id: string;
  name: string;
  href: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  badge?: string;
  description: string;
}

export const APPS: AppItem[] = [
  {
    id: "subscriptions",
    name: "Subscriptions",
    href: "/admin/subscriptions",
    iconBg: "bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-orange-200",
    iconColor: "text-white",
    icon: <RotateCcw className="w-8 h-8" />,
    badge: "Core",
    description: "Manage plans, lifecycles, pause & auto-renewals",
  },
  {
    id: "invoices",
    name: "Invoices & Billing",
    href: "/admin/invoices",
    iconBg: "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-200",
    iconColor: "text-white",
    icon: <FileText className="w-8 h-8" />,
    description: "Automated recurring cycles & PDF generation",
  },
  {
    id: "quotations",
    name: "Quotations",
    href: "/admin/quotations",
    iconBg: "bg-gradient-to-tr from-teal-500 to-emerald-400 text-white shadow-teal-200",
    iconColor: "text-white",
    icon: <Receipt className="w-8 h-8" />,
    description: "Proposals, templates, and one-click conversions",
  },
  {
    id: "payments",
    name: "Payments",
    href: "/admin/payments",
    iconBg: "bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-purple-200",
    iconColor: "text-white",
    icon: <CreditCard className="w-8 h-8" />,
    description: "UPI, Cards, Bank Transfers & partial reconciliations",
  },
  {
    id: "products",
    name: "Products & Variants",
    href: "/admin/products",
    iconBg: "bg-gradient-to-tr from-indigo-500 to-blue-400 text-white shadow-indigo-200",
    iconColor: "text-white",
    icon: <Package className="w-8 h-8" />,
    description: "Tiered variants (Odoo, SAP, Standard) and pricing",
  },
  {
    id: "plans",
    name: "Subscription Plans",
    href: "/admin/plans",
    iconBg: "bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-cyan-200",
    iconColor: "text-white",
    icon: <Layers className="w-8 h-8" />,
    description: "Daily, Weekly, Monthly, and Yearly cadence models",
  },
  {
    id: "taxes",
    name: "Taxes & Rules",
    href: "/admin/taxes",
    iconBg: "bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-yellow-200",
    iconColor: "text-white",
    icon: <Percent className="w-8 h-8" />,
    description: "Inclusive/exclusive tax rates with audit preservation",
  },
  {
    id: "discounts",
    name: "Discounts & Promos",
    href: "/admin/discounts",
    iconBg: "bg-gradient-to-tr from-rose-500 to-red-400 text-white shadow-rose-200",
    iconColor: "text-white",
    icon: <Percent className="w-8 h-8" />,
    description: "Usage-capped promotions and automated deductions",
  },
  {
    id: "customers",
    name: "Customers",
    href: "/admin/customers",
    iconBg: "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-200",
    iconColor: "text-white",
    icon: <Users className="w-8 h-8" />,
    description: "Client directory, contact info, and transaction records",
  },
  {
    id: "analytics",
    name: "Revenue Analytics",
    href: "/admin/analytics",
    iconBg: "bg-gradient-to-tr from-violet-600 to-purple-400 text-white shadow-violet-200",
    iconColor: "text-white",
    icon: <BarChart3 className="w-8 h-8" />,
    description: "MRR, ARR, invoiced vs collected revenue, and cohorts",
  },
  {
    id: "portal",
    name: "Customer Portal",
    href: "/customer/dashboard",
    iconBg: "bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-sky-200",
    iconColor: "text-white",
    icon: <UserCheck className="w-8 h-8" />,
    badge: "Client",
    description: "Customer self-service, renewals, and invoice downloads",
  },
  {
    id: "staff",
    name: "Staff & RBAC",
    href: "/admin/users",
    iconBg: "bg-gradient-to-tr from-slate-700 to-slate-500 text-white shadow-slate-200",
    iconColor: "text-white",
    icon: <ShieldCheck className="w-8 h-8" />,
    description: "Admin & Staff permission boundaries",
  },
];

export function OdooAppGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 py-6">
      {APPS.map((app) => (
        <Link
          key={app.id}
          href={app.href}
          className="group relative flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100/80 shadow-sm hover:shadow-md hover:border-odoo-200 hover:-translate-y-1 transition-all duration-200"
        >
          {app.badge && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-odoo-100 text-odoo-900 border border-odoo-200">
              {app.badge}
            </span>
          )}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105 ${app.iconBg}`}
          >
            {app.icon}
          </div>
          <span className="mt-3 text-sm font-semibold text-slate-800 group-hover:text-odoo-700 text-center line-clamp-1">
            {app.name}
          </span>
          <span className="mt-1 text-[11px] text-slate-500 text-center line-clamp-2">
            {app.description}
          </span>
        </Link>
      ))}
    </div>
  );
}
