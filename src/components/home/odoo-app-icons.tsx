"use client";

import React from "react";
import Link from "next/link";

export interface BrightLoopAppItem {
  id: string;
  name: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  iconSvg: React.ReactNode;
}

export const BRIGHTLOOP_APPS: BrightLoopAppItem[] = [
  // 1. Subscriptions
  {
    id: "subscriptions",
    name: "Subscriptions",
    href: "/admin/subscriptions",
    badge: "Core",
    badgeColor: "bg-purple-100 text-[#714B67] border-purple-200",
    description: "Manage plans, lifecycles, pause & auto-renewals",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Dual circulating arrows in Odoo's vibrant orange & emerald */}
        <path
          d="M13 27C13 19.268 19.268 13 27 13C31.5 13 35.5 15.1 38 18.5"
          stroke="#10B981"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M41 27C41 34.732 34.732 41 27 41C22.5 41 18.5 38.9 16 35.5"
          stroke="#F97316"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="39" cy="19" r="4" fill="#10B981" />
        <circle cx="15" cy="35" r="4" fill="#F97316" />
        <circle cx="27" cy="27" r="3.5" fill="#714B67" />
      </svg>
    ),
  },

  // 2. Invoices & Billing
  {
    id: "invoices",
    name: "Invoices & Billing",
    href: "/admin/invoices",
    description: "Automated recurring cycles & PDF generation",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Layered invoice document */}
        <rect x="12" y="10" width="28" height="34" rx="4" fill="#0284C7" />
        <path d="M18 18H34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 24H34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 30H28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        {/* Rupee Badge */}
        <circle cx="36" cy="36" r="8" fill="#F59E0B" />
        <text x="36" y="40" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">₹</text>
      </svg>
    ),
  },

  // 3. Quotations
  {
    id: "quotations",
    name: "Quotations",
    href: "/admin/quotations",
    description: "Proposals, templates, and one-click conversions",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Contract sheet */}
        <rect x="11" y="11" width="26" height="32" rx="4" fill="#0D9488" />
        <path d="M17 19H31M17 25H27" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        {/* Feather Quill / Signature stroke */}
        <path
          d="M26 38C30 36 34 31 38 23C40 19 43 14 45 11C41 13 36 17 33 21C30 25 28 30 26 38Z"
          fill="#F59E0B"
        />
        <circle cx="21" cy="33" r="3" fill="#FFFFFF" />
      </svg>
    ),
  },

  // 4. Payments
  {
    id: "payments",
    name: "Payments",
    href: "/admin/payments",
    description: "UPI, Cards, Bank Transfers & partial reconciliations",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Payment Card & Contactless Waves */}
        <rect x="9" y="14" width="36" height="26" rx="5" fill="#9333EA" />
        <path d="M9 22H45" stroke="#C084FC" strokeWidth="3" />
        <rect x="15" y="29" width="9" height="6" rx="1.5" fill="#FBBF24" />
        <path d="M35 28C37 30 37 33 35 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 26C41 29 41 35 38 38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },

  // 5. Products & Variants
  {
    id: "products",
    name: "Products & Variants",
    href: "/admin/products",
    description: "Tiered variants (Odoo, SAP, Standard) and pricing",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* 3D Isometric Software Cube */}
        <path d="M27 9L43 18V36L27 45L11 36V18L27 9Z" fill="#4F46E5" />
        <path d="M27 9L43 18L27 27L11 18L27 9Z" fill="#818CF8" />
        <path d="M27 27V45L43 36V18L27 27Z" fill="#3730A3" />
      </svg>
    ),
  },

  // 6. Plans
  {
    id: "plans",
    name: "Plans",
    href: "/admin/plans",
    description: "Daily, Weekly, Monthly, and Yearly cadence models",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Stacked Cadence Discs */}
        <ellipse cx="27" cy="16" rx="17" ry="6.5" fill="#0284C7" />
        <ellipse cx="27" cy="26" rx="17" ry="6.5" fill="#38BDF8" />
        <ellipse cx="27" cy="36" rx="17" ry="6.5" fill="#0369A1" />
        <circle cx="27" cy="16" r="3" fill="#FFFFFF" />
      </svg>
    ),
  },

  // 7. Taxes & Rules
  {
    id: "taxes",
    name: "Taxes & Rules",
    href: "/admin/taxes",
    description: "Inclusive/exclusive tax rates with audit preservation",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Tax Percentage Stamp */}
        <rect x="11" y="11" width="32" height="32" rx="7" fill="#EA580C" />
        <circle cx="21" cy="21" r="3.5" fill="#FFFFFF" />
        <circle cx="33" cy="33" r="3.5" fill="#FFFFFF" />
        <path d="M34 20L20 34" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    ),
  },

  // 8. Discounts & Promos
  {
    id: "discounts",
    name: "Discounts & Promos",
    href: "/admin/discounts",
    description: "Usage-capped promotions and automated deductions",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Discount Voucher Ticket */}
        <path
          d="M11 16C11 14.3 12.3 13 14 13H40C41.7 13 43 14.3 43 16V23C40.8 23 39 24.8 39 27C39 29.2 40.8 31 43 31V38C43 39.7 41.7 41 40 41H14C12.3 41 11 39.7 11 38V31C13.2 31 15 29.2 15 27C15 24.8 13.2 23 11 23V16Z"
          fill="#E11D48"
        />
        <path d="M22 21H32M27 21V33M20 31L34 23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },

  // 9. Customers
  {
    id: "customers",
    name: "Customers",
    href: "/admin/customers",
    description: "Client directory, contact info, and transaction records",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Client Network & Avatar */}
        <rect x="11" y="11" width="32" height="32" rx="7" fill="#059669" />
        <circle cx="27" cy="22" r="5.5" fill="#FFFFFF" />
        <path
          d="M17 36C17 31 21.5 28 27 28C32.5 28 37 31 37 36"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },

  // 10. Revenue Analytics
  {
    id: "analytics",
    name: "Revenue Analytics",
    href: "/admin/analytics",
    description: "MRR, ARR, invoiced vs collected revenue, and cohorts",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Growth Bar Chart */}
        <rect x="11" y="11" width="32" height="32" rx="7" fill="#7C3AED" />
        <rect x="17" y="27" width="4" height="11" rx="1.5" fill="#FFFFFF" />
        <rect x="25" y="20" width="4" height="18" rx="1.5" fill="#FFFFFF" />
        <rect x="33" y="15" width="4" height="23" rx="1.5" fill="#FBBF24" />
      </svg>
    ),
  },

  // 11. Customer Portal
  {
    id: "portal",
    name: "Customer Portal",
    href: "/customer/dashboard",
    badge: "Client",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Customer self-service, renewals, and invoice downloads",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* User Account Portal */}
        <rect x="11" y="11" width="32" height="32" rx="7" fill="#2563EB" />
        <circle cx="27" cy="21" r="5" fill="#93C5FD" />
        <path
          d="M18 35C18 30.5 22 28 27 28C32 28 36 30.5 36 35"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },

  // 12. Staff & RBAC
  {
    id: "staff",
    name: "Staff & RBAC",
    href: "/staff/dashboard",
    description: "Admin & Staff permission boundaries",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Role Security Shield */}
        <rect x="11" y="11" width="32" height="32" rx="7" fill="#714B67" />
        <path
          d="M27 16L36 20V26C36 32 32 37 27 38.5C22 37 18 32 18 26V20L27 16Z"
          stroke="#FBBF24"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="27" cy="26" r="3" fill="#FFFFFF" />
      </svg>
    ),
  },
];

export function OdooAppIconGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 py-4">
      {BRIGHTLOOP_APPS.map((app) => (
        <Link
          key={app.id}
          href={app.href}
          className="group relative flex flex-col items-center p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#714B67]/30 hover:-translate-y-1.5 transition-all duration-200 text-center"
        >
          {app.badge && (
            <span
              className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[9px] font-black rounded-full border shadow-2xs ${
                app.badgeColor || "bg-purple-100 text-[#714B67] border-purple-200"
              }`}
            >
              {app.badge}
            </span>
          )}

          {/* Odoo style authentic squircle card */}
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-center justify-center p-2.5 group-hover:scale-105 transition-transform duration-200">
            {app.iconSvg}
          </div>

          <span className="mt-3 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#714B67] transition-colors line-clamp-1">
            {app.name}
          </span>
          <span className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {app.description}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function getBrightLoopApp(id: string): BrightLoopAppItem | undefined {
  return BRIGHTLOOP_APPS.find((a) => a.id === id);
}

export function BrightLoopModuleIcon({
  appId,
  className = "w-10 h-10",
}: {
  appId: string;
  className?: string;
}) {
  const app = getBrightLoopApp(appId);
  if (!app) return null;

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1.5 shrink-0 transition-transform hover:scale-105 duration-200 ${className}`}
      title={app.name}
    >
      <div className="w-full h-full flex items-center justify-center">
        {app.iconSvg}
      </div>
    </div>
  );
}
