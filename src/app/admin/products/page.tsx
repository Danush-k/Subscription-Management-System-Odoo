"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
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

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#714B67]/10 rounded-lg text-[#714B67]">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Product Catalog &amp; Multi-Tier Variants
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Base licenses, add-ons, and edition variants configured in PostgreSQL with dynamic SKU mapping.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, code, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#714B67]" />
            <p className="mt-3 text-sm">Loading product catalog from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No products found matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {prod.productCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{prod.name}</h3>
                    </div>
                    <Badge variant={prod.status === "ACTIVE" ? "success" : "outline"}>
                      {prod.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{prod.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Base Price</span>
                      <p className="font-mono font-bold text-slate-900 text-sm">
                        ₹{prod.basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Product Type</span>
                      <p className="text-xs font-semibold text-slate-700">{prod.type}</p>
                    </div>
                  </div>

                  {/* Multi-tier Variants */}
                  {prod.variants.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#714B67]" /> Available Editions &amp; Variants
                      </span>
                      <div className="space-y-1.5">
                        {prod.variants.map((v) => (
                          <div
                            key={v.id}
                            className="p-2 bg-slate-50/70 rounded-lg flex items-center justify-between text-xs border border-slate-100"
                          >
                            <div>
                              <span className="font-medium text-slate-800">{v.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 ml-1.5">{v.sku}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-700">
                              {v.addonPrice > 0 ? `+₹${v.addonPrice.toLocaleString("en-IN")}` : "Included"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
