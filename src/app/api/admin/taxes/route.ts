import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const taxes = await prisma.tax.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = taxes.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.taxCode,
      rate: Number(t.percentage),
      type: t.taxType,
      jurisdiction: t.taxCode.startsWith("EXP") ? "International (LUT Bond)" : "India (Intra/Interstate)",
      status: t.status,
    }));

    return NextResponse.json({ taxes: formatted });
  } catch (error) {
    console.error("[API Admin Taxes Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load taxes" }, { status: 500 });
  }
}
