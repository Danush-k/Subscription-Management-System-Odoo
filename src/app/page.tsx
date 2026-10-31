"use client";

import React from "react";
import Link from "next/link";
import { OdooAppIconGrid } from "@/components/home/odoo-app-icons";
import { OdooStyleBrandMark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Navigation Bar - Exact Odoo Style from Image 2 */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between border-b border-slate-200/50">
        <div className="flex items-center gap-10">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            {/* Odoo style lowercase wordmark */}
            <OdooStyleBrandMark size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <a href="#apps" className="hover:text-[#714B67] transition-colors">
              Apps
            </a>
            <Link href="/admin/dashboard" className="hover:text-[#714B67] transition-colors">
              Industries
            </Link>
            <Link href="/customer/dashboard" className="hover:text-[#714B67] transition-colors">
              Community
            </Link>
            <Link href="/admin/plans" className="hover:text-[#714B67] transition-colors">
              Pricing
            </Link>
            <Link href="/docs/architecture" className="hover:text-[#714B67] transition-colors">
              Help
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-bold text-slate-800 hover:text-[#714B67] transition-colors"
          >
            Sign in
          </Link>

          <Link href="/register">
            <Button
              size="sm"
              className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95"
            >
              Try it free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with Exact Odoo Headline, Yellow Highlight, and Blue Underline */}
      <main className="flex-1">
        <section className="relative pt-14 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.12]">
            <span className="italic font-serif">All your business on </span>
            <span className="relative inline-block mx-1">
              <span className="relative z-10 px-3 py-1 font-extrabold text-slate-950">
                one platform.
              </span>
              <span className="absolute inset-0 bg-[#F59E0B] rounded-xl -rotate-1 shadow-xs -z-0 transform scale-105" />
            </span>
            <br />
            <span className="italic font-serif">Simple, efficient, yet </span>
            <span className="relative inline-block font-extrabold text-slate-900 underline decoration-[#38BDF8] decoration-[6px] sm:decoration-[8px] underline-offset-8">
              affordable!
            </span>
          </h1>

          {/* Action Buttons & Hand-drawn Pricing Doodle matching Image 2 */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 relative max-w-lg mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                Start now - It&apos;s free
              </Button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-7 py-3.5 bg-white/90 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl shadow-2xs"
              >
                Meet an advisor
              </Button>
            </Link>

            {/* Handwritten Doodle Arrow & Callout exactly as in Image 2 */}
            <div className="hidden lg:flex items-start gap-1 absolute left-[102%] -top-4 text-left whitespace-nowrap">
              {/* Curved SVG Doodle Arrow */}
              <svg
                width="64"
                height="54"
                viewBox="0 0 64 54"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#714B67] transform -rotate-12 shrink-0 mt-3"
              >
                <path
                  d="M10 10C25 15 45 25 50 42M50 42L42 38M50 42L53 32"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="font-handwriting text-2xl font-bold text-[#714B67] leading-tight">
                580.00 Rs / month
                <br />
                <span className="text-xl text-slate-600">for ALL apps</span>
              </div>
            </div>
          </div>
        </section>

        {/* Convex Curved White Wave Divider matching Image 2 */}
        <div className="relative w-full">
          {/* Smooth upward arching SVG curve */}
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-14 sm:h-20 md:h-24 text-white block -mb-[1px]"
          >
            <path
              d="M0,100 C480,15 960,15 1440,100 L1440,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>

          {/* 12-App Odoo Icon Grid on pure white background */}
          <div className="w-full bg-white pt-6 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
            <div id="apps" className="max-w-6xl mx-auto">
              <OdooAppIconGrid />
            </div>
          </div>
        </div>
      </main>

      {/* Minimalist Professional Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#714B67] text-sm">brightloop</span>
            <span>&bull; Enterprise Subscription &amp; Invoicing Platform</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/login" className="hover:text-[#714B67]">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-[#714B67]">
              Create Account
            </Link>
            <Link href="/admin/dashboard" className="hover:text-[#714B67]">
              Admin Workspace
            </Link>
            <Link href="/staff/dashboard" className="hover:text-[#714B67]">
              Staff Operations
            </Link>
            <Link href="/customer/dashboard" className="hover:text-[#714B67]">
              Customer Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
