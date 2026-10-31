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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, productCode, type = "SOFTWARE_LICENSE", basePrice, costPrice = 0, description = "", variants = [] } = body;

    if (!name || !productCode || basePrice === undefined) {
      return NextResponse.json({ error: "Product name, code, and base price are required" }, { status: 400 });
    }

    const createdProduct = await prisma.product.create({
      data: {
        productCode: productCode.trim().toUpperCase(),
        name: name.trim(),
        productType: type as any,
        salesPrice: Number(basePrice),
        costPrice: Number(costPrice) || 0,
        description: description.trim(),
        status: "ACTIVE",
        variants: {
          create: (variants && variants.length > 0 ? variants : [{ name: "Standard Tier", sku: `${productCode.trim().toUpperCase()}-STD`, addonPrice: 0 }]).map((v: any, index: number) => ({
            variantName: v.name || `Tier ${index + 1}`,
            sku: (v.sku || `${productCode.trim().toUpperCase()}-V${index + 1}`).toUpperCase(),
            additionalPrice: Number(v.addonPrice) || 0,
            status: "ACTIVE",
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (error: any) {
    console.error("[API Create Product Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
