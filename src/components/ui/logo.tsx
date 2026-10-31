import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "colored";
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function BrightloopLogo({
  size = "md",
  variant = "colored",
  showText = true,
  showBadge = true,
  className = "",
}: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const isLight = variant === "light";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Emblem */}
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
              <stop offset="50%" stopColor="#8A4E7A" />
              <stop offset="100%" stopColor="#54304D" />
            </linearGradient>
            <linearGradient id="blLoopGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
            <filter id="blShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Rounded Squircle Container */}
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="11"
            fill={isLight ? "rgba(255, 255, 255, 0.12)" : "url(#blLoopGrad1)"}
            stroke={isLight ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.15)"}
            strokeWidth="1.2"
          />

          {/* Dynamic Interlocking Infinity Loop */}
          {/* Loop Left Path */}
          <path
            d="M15 17C12.7909 17 11 18.7909 11 21C11 23.2091 12.7909 25 15 25C17.5 25 20.5 21 23 19C25.5 17 28.5 17 30.5 18.5C32.5 20 33 22 33 23C33 25.2091 31.2091 27 29 27C26.5 27 23.5 23 21 21"
            stroke="url(#blLoopGrad2)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Accent Ring */}
          <circle cx="16" cy="21" r="2.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="28" cy="23" r="2" fill="#FBBF24" />
        </svg>
      </div>

      {/* Brand Wordmark & Tag */}
      {showText && (
        <div className="flex items-center gap-2">
          <div className="flex items-baseline">
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
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLight
                  ? "bg-white/10 text-white/90 border-white/20"
                  : "bg-amber-50 text-amber-900 border-amber-200/80"
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
