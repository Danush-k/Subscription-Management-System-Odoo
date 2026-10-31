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

      {/* Brand Wordmark & Tag */}
      {showText && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`font-black tracking-tight ${textSizes[size]} ${
                isLight ? "text-white" : "text-slate-900"
              }`}
            >
              bright
            </span>
            <span
              className={`font-black tracking-tight ${textSizes[size]} ${
                isLight ? "text-[#FCD34D]" : "text-[#714B67]"
              }`}
            >
              loop
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
 * Pure Odoo-style vector wordmark with geometric rounded typography and interlocking loops
 */
export function OdooStyleBrandMark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const heights = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
    xl: "h-14",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Modern Odoo-inspired lowercase branding */}
      <span className="font-extrabold text-2xl sm:text-3xl text-[#714B67] tracking-tight flex items-center">
        bright
        <span className="text-[#8A4E7A] inline-flex items-center">
          l
          {/* Overlapping double-o loop */}
          <span className="relative inline-flex items-center mx-[-1px]">
            <svg
              viewBox="0 0 34 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-5 inline-block"
            >
              <circle
                cx="10"
                cy="10"
                r="7"
                stroke="#714B67"
                strokeWidth="3.2"
                fill="none"
              />
              <circle
                cx="24"
                cy="10"
                r="7"
                stroke="#F59E0B"
                strokeWidth="3.2"
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
