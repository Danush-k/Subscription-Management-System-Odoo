"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Search,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2,
} from "lucide-react";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  addonPrice: number;
}

interface ProductItem {
  id: string;
  productCode: string;
  name: string;
  type: string;
  basePrice: number;
  costPrice: number;
  description: string;
  status: "ACTIVE" | "ARCHIVED";
  variants: ProductVariant[];
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    productCode: "PROD-ERP-CORE",
    name: "Brightloop ERP Core Engine",
    type: "SOFTWARE_LICENSE",
    basePrice: 10000,
    costPrice: 2000,
    description: "Cloud ERP software core with subscription billing, inventory, and accounting.",
    status: "ACTIVE",
    variants: [
      { id: "v1", name: "Standard Cloud Tier", sku: "SKU-ERP-STD", addonPrice: 0 },
      { id: "v2", name: "Odoo Enterprise Edition", sku: "SKU-ERP-ODOO", addonPrice: 5000 },
      { id: "v3", name: "SAP Migration Edition", sku: "SKU-ERP-SAP", addonPrice: 12000 },
    ],
  },
  {
    id: "prod-2",
    productCode: "PROD-SUPPORT-247",
    name: "Enterprise 24/7 SLA Support",
    type: "SERVICE",
    basePrice: 4500,
    costPrice: 1200,
    description: "Priority incident handling, dedicated technical account manager, and phone support.",
    status: "ACTIVE",
    variants: [
      { id: "v4", name: "Standard SLA (8hr response)", sku: "SKU-SUP-STD", addonPrice: 0 },
      { id: "v5", name: "Mission Critical (15min response)", sku: "SKU-SUP-CRIT", addonPrice: 4000 },
    ],
  },
  {
    id: "prod-3",
    productCode: "PROD-API-GATEWAY",
    name: "Brightloop High-Throughput API Gateway",
    type: "SOFTWARE_LICENSE",
    basePrice: 6000,
    costPrice: 1500,
    description: "Multi-tenant REST & GraphQL endpoints with rate-limiting and audit log streaming.",
    status: "ACTIVE",
    variants: [
      { id: "v6", name: "50,000 req/mo Tier", sku: "SKU-API-50K", addonPrice: 0 },
      { id: "v7", name: "Unlimited Enterprise Tier", sku: "SKU-API-UNLTD", addonPrice: 8000 },
    ],
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Product Catalog & Multi-Tier Variants
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Base products, add-on edition tiers (Standard, Odoo, SAP), and cost-margin configurations.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or SKU codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>
        </div>

        {/* Product Cards */}
        <div className="space-y-6">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {prod.productCode}
                    </span>
                    <Badge variant="active">{prod.status}</Badge>
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      {prod.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mt-1">{prod.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{prod.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Base Price</div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{prod.basePrice.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-slate-400">
                    Cost: ₹{prod.costPrice.toLocaleString("en-IN")} (Margin:{" "}
                    {Math.round(((prod.basePrice - prod.costPrice) / prod.basePrice) * 100)}%)
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#714B67]" />
                  Configured Product Variants & Tier Pricing
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {prod.variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{v.name}</div>
                        <div className="font-mono text-slate-400 text-[11px]">{v.sku}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-900">
                        {v.addonPrice > 0 ? `+₹${v.addonPrice.toLocaleString("en-IN")}` : "Included"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
