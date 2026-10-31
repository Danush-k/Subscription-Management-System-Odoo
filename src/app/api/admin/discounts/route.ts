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
