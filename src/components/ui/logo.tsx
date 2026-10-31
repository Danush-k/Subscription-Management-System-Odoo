"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "colored" | "odoo";
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function BrightloopLogo({
  size = "md",
  variant = "colored",
  showText = true,
  showBadge = false,
  className = "",
}: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const isLight = variant === "light";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem - Interlocking Subscription Recurrence Loops */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="blLoopGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#714B67" />
              <stop offset="60%" stopColor="#8A4E7A" />
              <stop offset="100%" stopColor="#54304D" />
            </linearGradient>
            <linearGradient id="blLoopGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
          </defs>

          {/* Rounded Squircle Container */}
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="12"
            fill={isLight ? "rgba(255, 255, 255, 0.14)" : "url(#blLoopGrad1)"}
            stroke={isLight ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)"}
            strokeWidth="1.2"
          />

          {/* Dynamic Interlocking Infinity Loop */}
          <path
            d="M15 17C12.8 17 11 18.8 11 21C11 23.2 12.8 25 15 25C17.5 25 20.5 21 23 19C25.5 17 28.5 17 30.5 18.5C32.5 20 33 22 33 23C33 25.2 31.2 27 29 27C26.5 27 23.5 23 21 21"
            stroke="url(#blLoopGrad2)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Accent Rings */}
          <circle cx="16" cy="21" r="2.2" fill="#FFFFFF" opacity="0.95" />
          <circle cx="28" cy="23" r="2" fill="#FBBF24" />
        </svg>
      </div>

      {/* Brand Wordmark with Capital 'B', Capital 'L', and Distinct 'oo' Color */}
      {showText && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline tracking-tight font-extrabold">
            <span
              className={`tracking-tight ${textSizes[size]} ${
                isLight ? "text-white" : "text-slate-900"
              }`}
            >
              Bright
            </span>
            <span
              className={`tracking-tight ${textSizes[size]} ${
                isLight ? "text-white/90" : "text-slate-800"
              }`}
            >
              L
            </span>
            {/* Signature 'oo' color differentiation inspired by Odoo */}
            <span
              className={`tracking-tight ${textSizes[size]} ${
                isLight ? "text-[#FCD34D]" : "text-[#714B67]"
              }`}
            >
              oo
            </span>
            <span
              className={`tracking-tight ${textSizes[size]} ${
                isLight ? "text-white/90" : "text-slate-800"
              }`}
            >
              p
            </span>
          </div>

          {showBadge && (
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLight
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-amber-100/80 text-amber-900 border-amber-300"
              }`}
            >
              SaaS
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pure Odoo-inspired Wordmark:
 * Capital B ('Bright'), Capital L, with geometric circular 'oo' color differentiation
 */
export function BrightLoopBrandMark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const fontSizes = {
    sm: "text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
  };

  const loopSizes = {
    sm: "w-6 h-4",
    md: "w-8 h-5",
    lg: "w-10 h-6",
    xl: "w-12 h-7",
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Brand Lettering: Capital 'B' Bright, Capital 'L', with Odoo-style circular 'oo' color loops */}
      <span className={`font-black ${fontSizes[size]} tracking-tight flex items-center`}>
        <span className="text-[#714B67]">Bright</span>
        <span className="text-slate-800 ml-0.5 inline-flex items-center">
          L
          {/* Overlapping double-o loop with signature Odoo plum + amber colors */}
          <span className="relative inline-flex items-center mx-[-1px]">
            <svg
              viewBox="0 0 34 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`${loopSizes[size]} inline-block align-middle`}
            >
              {/* First 'o' in signature Odoo Plum */}
              <circle
                cx="10"
                cy="10"
                r="7"
                stroke="#714B67"
                strokeWidth="3.4"
                fill="none"
              />
              {/* Second 'o' in vibrant Golden Amber */}
              <circle
                cx="24"
                cy="10"
                r="7"
                stroke="#F59E0B"
                strokeWidth="3.4"
                fill="none"
              />
            </svg>
          </span>
          p
        </span>
      </span>
    </div>
  );
}

// Backwards-compatible alias for existing imports
export const OdooStyleBrandMark = BrightLoopBrandMark;
