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
  } catch (error: any) {
    console.error("[API Admin Taxes Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load taxes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, rate, type = "EXCLUSIVE", jurisdiction } = body;

    if (!name || rate === undefined || rate === null) {
      return NextResponse.json({ error: "Tax rule name and percentage rate are required" }, { status: 400 });
    }

    const taxCode = code
      ? code.toUpperCase().trim()
      : `GST-${Math.round(Number(rate))}-${type === "INCLUSIVE" ? "INCL" : "EXCL"}`;

    const newTax = await prisma.tax.create({
      data: {
        taxCode,
        name: name.trim(),
        percentage: Number(rate),
        taxType: type as any,
        startDate: new Date(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, tax: newTax });
  } catch (error: any) {
    console.error("[API Create Tax Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create tax" }, { status: 500 });
  }
}
