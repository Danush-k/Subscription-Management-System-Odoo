import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { invoiceDate: "desc" },
      include: {
        customer: true,
        subscription: true,
        lines: true,
        payments: true,
      },
    });

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      subscriptionNumber: inv.subscription?.subscriptionNumber || "—",
      customerName: inv.customer.companyName || inv.customer.name,
      customerGstin: inv.customer.taxId || "—",
      date: inv.invoiceDate.toISOString().split("T")[0],
      dueDate: inv.dueDate.toISOString().split("T")[0],
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.taxAmount),
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      outstandingAmount: Number(inv.outstandingAmount),
      status: inv.status,
    }));

    return NextResponse.json({ invoices: formatted });
  } catch (error) {
    console.error("[API Admin Invoices Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load invoices" }, { status: 500 });
  }
}
