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
              <stop offset="0%" stopColor="#71717A" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>

          {/* Rounded Squircle Container */}
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="12"
            fill={isLight ? "rgba(255, 255, 255, 0.16)" : "url(#blLoopGrad1)"}
            stroke={isLight ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.2)"}
            strokeWidth="1.2"
          />

          {/* Dynamic Interlocking Infinity Loop with Grey Secondary */}
          <path
            d="M15 17C12.8 17 11 18.8 11 21C11 23.2 12.8 25 15 25C17.5 25 20.5 21 23 19C25.5 17 28.5 17 30.5 18.5C32.5 20 33 22 33 23C33 25.2 31.2 27 29 27C26.5 27 23.5 23 21 21"
            stroke="url(#blLoopGrad2)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Accent Rings */}
          <circle cx="16" cy="21" r="2.2" fill="#FFFFFF" opacity="0.95" />
          <circle cx="28" cy="23" r="2" fill="#94A3B8" />
        </svg>
      </div>

      {/* Brand Wordmark: Capital 'B', Capital 'L', with 'oo' styled as an INFINITY loop in GREY, and 'p' in Purple */}
      {showText && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline tracking-tight font-black" aria-label="BrightLoop">
            {/* 'BrightL' in Purple (or White on dark headers) */}
            <span
              className={`tracking-tight ${textSizes[size]} ${
                isLight ? "text-white" : "text-[#714B67]"
              }`}
            >
              BrightL
            </span>

            {/* 'oo' rendered as stylized INFINITY symbol in GREY */}
            <span
              className={`tracking-tight inline-flex items-baseline ${textSizes[size]} ${
                isLight ? "text-slate-300 font-extrabold" : "text-[#71717A]"
              }`}
              title="BrightLoop"
            >
              <InfinityLoopGlyph />
            </span>

            {/* 'p' in Purple (or White on dark headers) */}
            <span
              className={`tracking-tight ${textSizes[size]} ${
                isLight ? "text-white" : "text-[#714B67]"
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
                  : "bg-purple-50 text-[#714B67] border-purple-200"
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
 * Stylized Infinity Loop Vector Glyph replacing 'oo' in the brand wordmark.
 * Uses currentColor to inherit the signature grey (#71717A / text-slate-300).
 */
export function InfinityLoopGlyph({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center align-baseline mx-[0.05em] select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 28 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[1.18em] h-[0.58em] overflow-visible translate-y-[-0.04em]"
      >
        <path
          d="M7 2.4C4.1 2.4 2 4.4 2 7C2 9.6 4.1 11.6 7 11.6C10.2 11.6 12.5 7 14 7C15.5 7 17.8 11.6 21 11.6C23.9 11.6 26 9.6 26 7C26 4.4 23.9 2.4 21 2.4C17.8 2.4 15.5 7 14 7C12.5 7 10.2 2.4 7 2.4Z"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * Pure Odoo-inspired Wordmark:
 * Capital 'B', Capital 'L', with 'oo' in GREY (#71717A) styled as an infinity loop, and the rest in PURPLE (#714B67)
 */
export function BrightLoopBrandMark({
  size = "md",
  variant = "dark",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "dark" | "light";
  className?: string;
}) {
  const fontSizes = {
    xs: "text-lg",
    sm: "text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
  };

  const isLight = variant === "light";

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* 'BrightL' in PURPLE, 'oo' as INFINITY in GREY, 'p' in PURPLE */}
      <span
        className={`font-black ${fontSizes[size]} tracking-tight flex items-baseline`}
        aria-label="BrightLoop"
      >
        <span className={isLight ? "text-white" : "text-[#714B67]"}>BrightL</span>
        <span
          className={`inline-flex items-baseline ${
            isLight ? "text-slate-300 font-extrabold" : "text-[#71717A]"
          }`}
          title="BrightLoop"
        >
          <InfinityLoopGlyph />
        </span>
        <span className={isLight ? "text-white" : "text-[#714B67]"}>p</span>
      </span>
    </div>
  );
}

// Backwards-compatible alias for existing imports
export const OdooStyleBrandMark = BrightLoopBrandMark;

