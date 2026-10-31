import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        variants: true,
      },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      type: p.productType,
      basePrice: Number(p.salesPrice),
      costPrice: Number(p.costPrice),
      description: p.description || "",
      status: p.status,
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.variantName,
        sku: v.sku,
        addonPrice: Number(v.additionalPrice),
      })),
    }));

    return NextResponse.json({ products: formatted });
  } catch (error: any) {
    console.error("[API Admin Products Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load products" }, { status: 500 });
  }
}
