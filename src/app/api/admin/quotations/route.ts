import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    const formatted = quotations.map((q) => {
      const line = q.lines[0];
      const variantName = line?.variant?.variantName || line?.product?.name || "Standard";

      return {
        id: q.id,
        quotationNumber: q.quotationNumber,
        customerName: q.customer.companyName || q.customer.name,
        customerEmail: q.customer.email,
        planName: q.plan.name,
        variantName,
        totalAmount: Number(q.totalAmount),
        validUntil: q.expiryDate.toISOString().split("T")[0],
        status: q.status === "QUOTATION" ? "SENT" : q.status,
      };
    });

    return NextResponse.json({ quotations: formatted });
  } catch (error: any) {
    console.error("[API Admin Quotations Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load quotations" }, { status: 500 });
  }
}
