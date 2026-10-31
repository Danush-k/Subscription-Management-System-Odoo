import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = discounts.map((d) => ({
      id: d.id,
      code: d.discountCode,
      name: d.name,
      type: d.discountType,
      value: Number(d.discountValue),
      minPurchase: Number(d.minPurchaseAmount),
      maxUsage: d.maxUsageCount || 100,
      usedCount: d.currentUsageCount,
      status: d.status,
    }));

    return NextResponse.json({ discounts: formatted });
  } catch (error: any) {
    console.error("[API Admin Discounts Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load discounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, type = "PERCENTAGE", value, minPurchase = 0, maxUsage = 100 } = body;

    if (!code || !name || value === undefined || value === null) {
      return NextResponse.json({ error: "Coupon code, campaign name, and discount value are required" }, { status: 400 });
    }

    const newDiscount = await prisma.discount.create({
      data: {
        discountCode: code.toUpperCase().trim(),
        name: name.trim(),
        discountType: type as any,
        discountValue: Number(value),
        minPurchaseAmount: Number(minPurchase) || 0,
        minQuantity: 1,
        maxUsageCount: Number(maxUsage) || 100,
        currentUsageCount: 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, discount: newDiscount });
  } catch (error: any) {
    console.error("[API Create Discount Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create discount coupon" }, { status: 500 });
  }
}
