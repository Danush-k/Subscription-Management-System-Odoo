"use client";

import React from "react";
import Link from "next/link";

export interface OdooAppItem {
  id: string;
  name: string;
  href: string;
  iconSvg: React.ReactNode;
}

export const ODOO_APPS: OdooAppItem[] = [
  // 1. Accounting / Invoicing
  {
    id: "accounting",
    name: "Accounting",
    href: "/admin/invoices",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        <path
          d="M14 14L40 40M40 14L14 40"
          stroke="#0D9488"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="20" cy="16" r="4.5" fill="#F59E0B" />
        <circle cx="34" cy="38" r="4.5" fill="#714B67" />
        <path
          d="M16 38L38 16"
          stroke="#F43F5E"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  // 2. Knowledge
  {
    id: "knowledge",
    name: "Knowledge",
    href: "/docs/architecture",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Book cover */}
        <rect x="14" y="10" width="26" height="34" rx="4" fill="#0D9488" />
        {/* Bookmark ribbon */}
        <path
          d="M22 10V26L28 21L34 26V10H22Z"
          fill="#714B67"
        />
      </svg>
    ),
  },
  // 3. Sign
  {
    id: "sign",
    name: "Sign",
    href: "/admin/quotations",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        <path
          d="M13 38C17 38 19 28 23 20C25 16 27 15 28 17C29 20 28 28 27 34C26 39 33 34 38 31C41 29 43 29 44 32"
          stroke="#0284C7"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="39" cy="20" r="3" fill="#0284C7" />
      </svg>
    ),
  },
  // 4. CRM
  {
    id: "crm",
    name: "CRM",
    href: "/admin/customers",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Stylized Handshake */}
        <path
          d="M12 24L21 16L32 27L24 35L12 24Z"
          fill="#714B67"
        />
        <path
          d="M42 24L33 16L22 27L30 35L42 24Z"
          fill="#0D9488"
        />
        <rect
          x="23"
          y="23"
          width="8"
          height="8"
          rx="2"
          fill="#F59E0B"
        />
      </svg>
    ),
  },
  // 5. Studio
  {
    id: "studio",
    name: "Studio",
    href: "/admin/products",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Crossed Wrench & Ruler */}
        <path
          d="M15 15L39 39"
          stroke="#0284C7"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M39 15L15 39"
          stroke="#EC4899"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="27" cy="27" r="4" fill="#FFFFFF" />
      </svg>
    ),
  },
  // 6. Subscriptions (Exact Odoo Circular Arrows)
  {
    id: "subscriptions",
    name: "Subscriptions",
    href: "/admin/subscriptions",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Green top-left arc */}
        <path
          d="M13 27C13 19.268 19.268 13 27 13C31 13 34.5 14.7 37 17.5"
          stroke="#10B981"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Orange bottom-right arc */}
        <path
          d="M41 27C41 34.732 34.732 41 27 41C23 41 19.5 39.3 17 36.5"
          stroke="#F97316"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Arrowheads/accent circles */}
        <circle cx="38" cy="18" r="3.5" fill="#10B981" />
        <circle cx="16" cy="36" r="3.5" fill="#F97316" />
      </svg>
    ),
  },

  // ROW 2
  // 7. AI
  {
    id: "ai",
    name: "AI",
    href: "/admin/analytics",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        <path
          d="M15 39L23 15H31L39 39H32L30 32H24L22 39H15Z"
          fill="url(#aiGrad1)"
        />
        <circle cx="27" cy="23" r="3" fill="#FBBF24" />
        <circle cx="41" cy="20" r="3.5" fill="#714B67" />
        <defs>
          <linearGradient id="aiGrad1" x1="15" y1="15" x2="39" y2="39">
            <stop offset="0%" stopColor="#714B67" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  // 8. Point of Sale
  {
    id: "pos",
    name: "Point of Sale",
    href: "/customer/dashboard",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Shop awning */}
        <rect x="12" y="18" width="30" height="8" rx="2" fill="#F59E0B" />
        <path d="M12 26V34C12 36.2 13.8 38 16 38H38C40.2 38 42 36.2 42 34V26H12Z" fill="#714B67" />
        <path d="M18 26V36M24 26V36M30 26V36M36 26V36" stroke="#FFFFFF" strokeWidth="2" />
      </svg>
    ),
  },
  // 9. Discuss
  {
    id: "discuss",
    name: "Discuss",
    href: "/staff/dashboard",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Orange speech bubble */}
        <path
          d="M27 12C18.1634 12 11 18.268 11 26C11 30.5 13.5 34.5 17.5 37L15 44L23.5 40C24.6 40.2 25.8 40.3 27 40.3C35.8366 40.3 43 34.032 43 26C43 17.968 35.8366 12 27 12Z"
          fill="#F97316"
        />
        <circle cx="21" cy="25" r="2.5" fill="#FFFFFF" />
        <circle cx="27" cy="25" r="2.5" fill="#FFFFFF" />
        <circle cx="33" cy="25" r="2.5" fill="#FFFFFF" />
      </svg>
    ),
  },
  // 10. Documents
  {
    id: "documents",
    name: "Documents",
    href: "/admin/taxes",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Layered sheets */}
        <rect x="13" y="17" width="22" height="26" rx="3" fill="#0284C7" opacity="0.8" />
        <rect x="19" y="12" width="22" height="26" rx="3" fill="#F59E0B" />
        <path d="M23 18H33M23 23H37M23 28H33" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  // 11. Project
  {
    id: "project",
    name: "Project",
    href: "/admin/reports",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Dynamic checkmark badge */}
        <path
          d="M14 28L23 37L40 18"
          stroke="#0D9488"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 18L23 29L19 25"
          stroke="#1E3A8A"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  // 12. Timesheets
  {
    id: "timesheets",
    name: "Timesheets",
    href: "/admin/payments",
    iconSvg: (
      <svg viewBox="0 0 54 54" fill="none" className="w-12 h-12">
        {/* Clock timer gauge */}
        <circle cx="27" cy="27" r="16" fill="#0284C7" />
        <path
          d="M27 11A16 16 0 0 1 43 27L27 27Z"
          fill="#1E3A8A"
        />
        <circle cx="27" cy="27" r="3" fill="#FFFFFF" />
        <path d="M27 27L35 20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function OdooAppIconGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-10 gap-x-6 sm:gap-x-10 max-w-5xl mx-auto py-8">
      {ODOO_APPS.map((app) => (
        <Link
          key={app.id}
          href={app.href}
          className="group flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-2"
        >
          {/* Odoo style authentic squircle card */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-sm border border-slate-100/80 flex items-center justify-center p-3.5 group-hover:shadow-xl group-hover:border-slate-200/90 transition-all">
            {app.iconSvg}
          </div>
          <span className="mt-3 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#714B67] transition-colors leading-tight max-w-[96px]">
            {app.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
