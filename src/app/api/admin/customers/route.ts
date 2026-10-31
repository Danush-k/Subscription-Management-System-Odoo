import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
        },
        invoices: {
          select: {
            paidAmount: true,
          },
        },
      },
    });

    const formatted = customers.map((c) => {
      const address = c.billingAddress as any;
      const totalSpent = c.invoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);

      return {
        id: c.id,
        customerNumber: c.customerNumber,
        name: c.name,
        companyName: c.companyName || c.name,
        email: c.email,
        phone: c.phone || "—",
        taxId: c.taxId || "—",
        city: address?.city || "—",
        state: address?.state || "—",
        activeSubscriptions: c.subscriptions.length,
        totalSpent,
        status: c.status,
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error: any) {
    console.error("[API Admin Customers Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load customers" }, { status: 500 });
  }
}
