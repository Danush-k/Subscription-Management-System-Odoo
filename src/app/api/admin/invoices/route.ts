import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { invoiceDate: "desc" },
      include: {
        customer: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        lines: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      subscriptionNumber: inv.subscription?.subscriptionNumber || "—",
      planName: inv.subscription?.plan?.name || "Cloud Subscription Plan",
      customerName: inv.customer.companyName || inv.customer.name,
      customerGstin: inv.customer.taxId || "—",
      date: inv.invoiceDate.toISOString().split("T")[0],
      dueDate: inv.dueDate.toISOString().split("T")[0],
      billingPeriodStart: inv.billingPeriodStart ? inv.billingPeriodStart.toISOString() : null,
      billingPeriodEnd: inv.billingPeriodEnd ? inv.billingPeriodEnd.toISOString() : null,
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.taxAmount),
      discountAmount: Number(inv.discountAmount || 0),
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      outstandingAmount: Number(inv.outstandingAmount),
      status: inv.status,
      customer: {
        id: inv.customer.id,
        name: inv.customer.name,
        companyName: inv.customer.companyName,
        email: inv.customer.email,
        phone: inv.customer.phone,
        taxId: inv.customer.taxId,
        billingAddress: inv.customer.billingAddress as any,
      },
      lines: inv.lines.map((l) => ({
        id: l.id,
        description: l.productName + (l.variantName ? ` - ${l.variantName}` : ""),
        productName: l.productName,
        variantName: l.variantName,
        hsnSac: "998314",
        quantity: l.quantity,
        unitPrice: Number(l.unitPrice),
        taxRate: Number(l.taxRate),
        taxAmount: Number(l.taxAmount),
        discountAmount: Number(l.discountAmount || 0),
        subtotal: Number(l.subtotal),
        total: Number(l.total),
      })),
      payments: inv.payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        paymentMethod: p.paymentMethod,
        amount: Number(p.amount),
        paymentDate: p.paymentDate.toISOString(),
        transactionRef: p.transactionRef,
        status: p.status,
      })),
    }));

    return NextResponse.json({ invoices: formatted });
  } catch (error: any) {
    console.error("[API Admin Invoices Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load invoices" }, { status: 500 });
  }
}
