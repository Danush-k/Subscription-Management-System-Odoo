import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  if (!session || !SubscriptionService.isStaffRole(session.role)) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  try {
    const now = new Date();
    await prisma.invoice.updateMany({
      where: {
        status: { in: ["CONFIRMED", "OVERDUE"] },
        dueDate: { lt: now },
        outstandingAmount: { gt: 0 },
      },
      data: { status: "OVERDUE" },
    });
    const invoices = await prisma.invoice.findMany({
      orderBy: { invoiceDate: "desc" },
      include: {
        customer: { select: { name: true, companyName: true, email: true } },
        payments: {
          orderBy: { paymentDate: "desc" },
          include: { recordedByUser: { select: { name: true, email: true } } },
        },
        subscription: { select: { subscriptionNumber: true } },
      },
    });
    return NextResponse.json({
      success: true,
      data: invoices.map((invoice) => ({
        ...invoice,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        totalAmount: Number(invoice.totalAmount),
        paidAmount: Number(invoice.paidAmount),
        outstandingAmount: Number(invoice.outstandingAmount),
        invoiceDate: invoice.invoiceDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        customer: invoice.customer.companyName || invoice.customer.name,
        customerEmail: invoice.customer.email,
        subscriptionNumber: invoice.subscription?.subscriptionNumber ?? null,
        payments: invoice.payments.map((payment) => ({
          ...payment,
          amount: Number(payment.amount),
          paymentDate: payment.paymentDate.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error("[API Staff Invoices Error]", error);
    return NextResponse.json({ success: false, error: "Unable to load invoice history" }, { status: 500 });
  }
}
