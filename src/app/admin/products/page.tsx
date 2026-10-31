"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  CreditCard,
  ArrowRight,
  Info,
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
  status: "ACTIVE" | "ARCHIVED" | string;
  variants: ProductVariant[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddVariantRow = () => {
    setFormVariants((prev) => [
      ...prev,
      { name: `Tier ${prev.length + 1}`, sku: `SKU-TIER-${prev.length + 1}`, addonPrice: 2000 },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          productCode: formCode.trim().toUpperCase(),
          type: formType,
          basePrice: parseFloat(formBasePrice) || 0,
          costPrice: parseFloat(formCostPrice) || 0,
          description: formDescription.trim() || "Configured BrightLoop enterprise subscription product.",
          variants: formVariants,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setIsModalOpen(false);
      setNotification(`Product "${formName}" created successfully!`);
      setTimeout(() => setNotification(null), 5000);

      // Reset form
      setFormName("");
      setFormCode("");
      setFormDescription("");

      await fetchProducts();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-16 font-sans">
      <AdminNav />

      <main className="dashboard-container pt-8 space-y-6 animate-fadeIn">
        {/* Sub-header with Add Product CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrightLoopModuleIcon appId="products" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Products &amp; Recurring Subscriptions
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage SaaS software licenses, services, add-ons, and multi-tier pricing variants. Click any card for details.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#714B67] hover:bg-[#5C3C54] text-white gap-2 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs animate-slideDown">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title, SKU, or module tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67] transition-all"
            />
          </div>
        </div>

        {/* Products Grid with Clickable Cards */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/90 shadow-2xs text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#714B67]" />
            <p className="mt-3 text-xs font-medium">Loading products from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/90 shadow-2xs text-center text-slate-400 font-medium">
            No products match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-lg hover:border-[#714B67]/40 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded group-hover:text-[#714B67] transition-colors">
                      {prod.productCode}
                    </span>
                    <Badge variant={prod.status === "ACTIVE" ? "active" : "outline"}>
                      {prod.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-[#714B67] transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {prod.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{prod.basePrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400">base starting rate</span>
                  </div>

                  {/* Multi-tier Variants Summary */}
                  {prod.variants && prod.variants.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#714B67]" />
                        <span>{prod.variants.length} Pricing Editions:</span>
                      </div>
                      <div className="space-y-1">
                        {prod.variants.slice(0, 3).map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50"
                          >
                            <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                              {v.name}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {v.addonPrice > 0
                                ? `+₹${v.addonPrice.toLocaleString("en-IN")}`
                                : "Base"}
                            </span>
                          </div>
                        ))}
                        {prod.variants.length > 3 && (
                          <p className="text-[10px] text-slate-400 text-center">
                            +{prod.variants.length - 3} more tiers
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-[#714B67] font-bold">
                  <span>View Product Specifications</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detailed View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-lg">{selectedProduct.name}</h3>
                    <Badge variant={selectedProduct.status === "ACTIVE" ? "active" : "outline"}>
                      {selectedProduct.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{selectedProduct.productCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                {selectedProduct.description || "Configured BrightLoop enterprise subscription recurring software or services product."}
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>Commercial &amp; Profitability Terms</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Base Selling Price</span>
                    <span className="font-mono font-black text-slate-900 text-base">
                      ₹{selectedProduct.basePrice.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cost Basis Price</span>
                    <span className="font-mono font-semibold text-slate-700">
                      ₹{selectedProduct.costPrice.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Product Classification</span>
                    <span className="font-bold text-[#714B67] uppercase">{selectedProduct.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gross Margin</span>
                    <span className="font-bold text-emerald-700">
                      {selectedProduct.basePrice > 0
                        ? `${(((selectedProduct.basePrice - selectedProduct.costPrice) / selectedProduct.basePrice) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Variants */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="text-slate-900 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#714B67]" />
                    <span>Configured Pricing Variants ({selectedProduct.variants.length})</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    {selectedProduct.variants.map((v) => (
                      <div
                        key={v.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{v.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{v.sku}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-slate-900 block">
                            ₹{(selectedProduct.basePrice + v.addonPrice).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {v.addonPrice > 0 ? `(+₹${v.addonPrice.toLocaleString("en-IN")})` : "Base Tier"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </Button>
              <Link href="/admin/subscriptions/new">
                <Button size="sm" className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold text-xs">
                  Create Subscription With Product &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="font-black text-slate-900 text-base">Add Subscription Product</h3>
                  <p className="text-xs text-slate-400">Configure base recurring SKU and edition add-on variants</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud ERP Suite"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Code / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROD-ERP-CORE"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  >
                    <option value="SOFTWARE_LICENSE">SOFTWARE_LICENSE</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="ADDON">ADDON</option>
                    <option value="HARDWARE">HARDWARE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Sales Price (₹) *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed breakdown of features and scope..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              {/* Variants Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-700 block">Pricing Tiers / Variants</label>
                    <p className="text-[11px] text-slate-400">Configure add-on tiers with custom surcharges</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVariantRow}
                    className="text-xs font-bold gap-1 h-7 text-[#714B67] border-[#714B67]/30"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tier</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {formVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Edition Name"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...formVariants];
                            updated[idx].name = e.target.value;
                            setFormVariants(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="text"
                          placeholder="SKU"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...formVariants];
                            updated[idx].sku = e.target.value.toUpperCase();
                            setFormVariants(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px] uppercase"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="+₹ Price"
                          value={v.addonPrice}
                          onChange={(e) => {
                            const updated = [...formVariants];
                            updated[idx].addonPrice = Number(e.target.value) || 0;
                            setFormVariants(updated);
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                      {formVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
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
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#714B67] hover:bg-[#5C3C54] text-white font-bold"
                >
                  {isSubmitting ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
