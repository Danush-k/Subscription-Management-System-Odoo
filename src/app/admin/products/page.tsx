"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/navigation/admin-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrightLoopModuleIcon } from "@/components/home/odoo-app-icons";
import {
  Package,
  Plus,
  Search,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2,
  X,
  AlertCircle,
  Trash2,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New product form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState("SOFTWARE_LICENSE");
  const [formBasePrice, setFormBasePrice] = useState("7500");
  const [formCostPrice, setFormCostPrice] = useState("1500");
  const [formDescription, setFormDescription] = useState("");
  const [formVariants, setFormVariants] = useState<Array<{ name: string; sku: string; addonPrice: number }>>([
    { name: "Standard Tier", sku: "SKU-STD", addonPrice: 0 },
    { name: "Enterprise Tier", sku: "SKU-ENT", addonPrice: 4500 },
  ]);

  const handleAddVariantRow = () => {
    setFormVariants((prev) => [
      ...prev,
      { name: `Tier ${prev.length + 1}`, sku: `SKU-TIER-${prev.length + 1}`, addonPrice: 2000 },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      name: formName.trim(),
      productCode: formCode.trim().toUpperCase(),
      type: formType,
      basePrice: parseFloat(formBasePrice) || 0,
      costPrice: parseFloat(formCostPrice) || 0,
      description: formDescription.trim() || "Configured BrightLoop enterprise subscription product.",
      status: "ACTIVE",
      variants: formVariants.map((v, i) => ({
        id: `v-${Date.now()}-${i}`,
        name: v.name,
        sku: v.sku.toUpperCase(),
        addonPrice: Number(v.addonPrice) || 0,
      })),
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsModalOpen(false);
    setNotification(`Product "${newProd.name}" (${newProd.productCode}) added successfully!`);
    setTimeout(() => setNotification(null), 5000);

    // Reset form
    setFormName("");
    setFormCode("");
    setFormDescription("");
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        {/* Sub-header with Odoo-style vector glyph and Add Product CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="products" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Product Catalog &amp; Multi-Tier Variants
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Base software licenses, support editions, and multi-tier variant pricing.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#714B67] hover:bg-[#5C3C54] text-white gap-2 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>

        {/* Dismissible Success Notification */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-slideDown">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar & Stats */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title or SKU code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{filtered.length} active products</span>
          </div>
        </div>

        {/* Product Cards */}
        <div className="space-y-5">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                      {prod.productCode}
                    </span>
                    <Badge variant="active">{prod.status}</Badge>
                    <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                      {prod.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-1">{prod.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{prod.description}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Base Price</div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{prod.basePrice.toLocaleString("en-IN")}.00
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Cost: ₹{prod.costPrice.toLocaleString("en-IN")} &bull; Margin:{" "}
                    {prod.basePrice > 0
                      ? Math.round(((prod.basePrice - prod.costPrice) / prod.basePrice) * 100)
                      : 0}
                    %
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Configured Product Variants &amp; Tier Pricing</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {prod.variants.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{v.name}</div>
                        <div className="font-mono text-slate-400 text-[10px]">{v.sku}</div>
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

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Add New Product</h3>
                  <p className="text-xs text-slate-400">Configure catalog software licenses and service tiers</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Odoo Integration Engine"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product SKU / Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROD-ODOO-SYNC"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classification Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  >
                    <option value="SOFTWARE_LICENSE">SOFTWARE_LICENSE</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="HARDWARE">HARDWARE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Comprehensive description for quotations and invoices..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              {/* Product Variants builder */}
              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Product Edition Variants ({formVariants.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-[#714B67] hover:underline font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {formVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Variant Name"
                        value={v.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                          );
                        }}
                        className="w-24 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="+₹"
                        value={v.addonPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, addonPrice: val } : item))
                          );
                        }}
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                      />
                      {formVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#714B67] hover:bg-[#5C3C54] text-white rounded-xl font-bold px-4 shadow-xs"
                >
                  Save Product &amp; Variants
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
