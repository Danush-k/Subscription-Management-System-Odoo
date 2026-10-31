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
      quotations: pendingQuotations.map((quotation) => ({
        id: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customer: quotation.customer.companyName ?? quotation.customer.name,
        plan: quotation.plan.name,
        amount: formatAmount(quotation.totalAmount),
        status: quotation.status,
        validUntil: quotation.expiryDate.toISOString(),
      })),
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
