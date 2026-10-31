import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatAmount(value: { toString(): string }): string {
  return `₹${Number(value.toString()).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function GET() {
  const session = await getServerSession();

  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json(
      { success: false, error: "Staff access required" },
      { status: 403 }
    );
  }

  const now = new Date();
  const [customers, activeSubscriptions, pendingQuotations, openInvoices, recentPayments] =
    await Promise.all([
      prisma.customer.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.quotation.findMany({
        where: { status: { in: ["DRAFT", "QUOTATION"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { customer: true, plan: true },
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ["CONFIRMED", "OVERDUE"] },
          outstandingAmount: { gt: 0 },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        include: { customer: true },
      }),
      prisma.payment.count({
        where: { status: "SUCCESS" },
      }),
    ]);

  const overdueInvoices = openInvoices.filter((invoice) => invoice.dueDate < now);

  const quotationIds = pendingQuotations.map((q) => q.id);
  const negotiationLogs = quotationIds.length > 0
    ? await prisma.auditLog.findMany({
        where: {
          entityType: "QUOTATION",
          entityId: { in: quotationIds },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        customers,
        activeSubscriptions,
        pendingQuotations: pendingQuotations.length,
        pendingInvoices: openInvoices.length,
        recentPayments,
        overdueInvoices: overdueInvoices.length,
      },
      currentUser: {
        name: session.name,
        email: session.email,
        role: session.role,
      },
      quotations: pendingQuotations.map((quotation) => {
        const lastLog = negotiationLogs.find((l) => l.entityId === quotation.id);
        const lastMsg = lastLog ? (lastLog.newValues as any)?.message : null;
        const lastSender = lastLog ? (lastLog.newValues as any)?.sender : null;
        const proposedDiscount = lastLog ? (lastLog.newValues as any)?.proposedDiscount : null;

        return {
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          customer: quotation.customer.companyName ?? quotation.customer.name,
          plan: quotation.plan.name,
          amount: formatAmount(quotation.totalAmount),
          status: quotation.status,
          validUntil: quotation.expiryDate.toISOString(),
          lastMessage: lastMsg,
          lastSender: lastSender,
          proposedDiscount: proposedDiscount,
        };
      }),
      invoices: openInvoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer.companyName ?? invoice.customer.name,
        amount: formatAmount(invoice.outstandingAmount),
        dueDate: invoice.dueDate.toISOString(),
        status: invoice.dueDate < now ? "OVERDUE" : invoice.status,
      })),
      generatedAt: now.toISOString(),
    },
  });
}
