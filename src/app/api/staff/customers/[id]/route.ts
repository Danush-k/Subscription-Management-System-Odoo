import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || !SubscriptionService.isStaffRole(session.role)) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          include: { plan: { select: { name: true } }, histories: { orderBy: { createdAt: "desc" } } },
        },
        quotations: {
          orderBy: { createdAt: "desc" },
          include: { plan: { select: { name: true } } },
        },
        invoices: {
          orderBy: { invoiceDate: "desc" },
          include: { payments: { orderBy: { paymentDate: "desc" } }, subscription: { select: { subscriptionNumber: true } } },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
          include: { invoice: { select: { invoiceNumber: true } }, recordedByUser: { select: { name: true } } },
        },
      },
    });
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        subscriptions: customer.subscriptions.map((subscription) => ({
          ...subscription,
          histories: subscription.histories,
        })),
        quotations: customer.quotations,
        invoices: customer.invoices.map((invoice) => ({
          ...invoice,
          subtotal: Number(invoice.subtotal),
          taxAmount: Number(invoice.taxAmount),
          totalAmount: Number(invoice.totalAmount),
          paidAmount: Number(invoice.paidAmount),
          outstandingAmount: Number(invoice.outstandingAmount),
          payments: invoice.payments.map((payment) => ({ ...payment, amount: Number(payment.amount) })),
        })),
        payments: customer.payments.map((payment) => ({ ...payment, amount: Number(payment.amount) })),
      },
    });
  } catch (error) {
    console.error("[API Staff Customer Detail Error]", error);
    return NextResponse.json({ success: false, error: "Unable to load customer details" }, { status: 500 });
  }
}
