import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AnalyticsService } from "@/server/services/analyticsService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [metrics, rawSubscriptions, rawInvoices] = await Promise.all([
      AnalyticsService.getFinancialMetrics(),
      prisma.subscription.findMany({
        take: 5,
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
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { invoiceDate: "desc" },
        include: {
          customer: true,
        },
      }),
    ]);

    const recentSubscriptions = rawSubscriptions.map((sub) => {
      const line = sub.lines[0];
      const variantName = line?.variant?.variantName || line?.product?.name || "Standard";
      const totalAmount = line ? Number(line.total) : Number(sub.plan.subscriptionPrice);

      const cadence =
        sub.billingFrequency === "YEARLY"
          ? "Annual"
          : sub.billingFrequency === "MONTHLY"
          ? "Monthly"
          : sub.billingFrequency === "WEEKLY"
          ? "Weekly"
          : "Daily";

      const nextBilling = sub.nextBillingDate
        ? new Date(sub.nextBillingDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";

      return {
        id: sub.subscriptionNumber,
        dbId: sub.id,
        customer: sub.customer.name,
        companyName: sub.customer.companyName,
        plan: sub.plan.name,
        variant: variantName,
        amount: `₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawAmount: totalAmount,
        cadence,
        nextBilling,
        status: sub.status,
      };
    });

    const recentInvoices = rawInvoices.map((inv) => ({
      id: inv.invoiceNumber,
      dbId: inv.id,
      customer: inv.customer.companyName || inv.customer.name,
      date: new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      dueDate: new Date(inv.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      amount: `₹${Number(inv.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      paid: `₹${Number(inv.paidAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: inv.status,
    }));

    return NextResponse.json({
      metrics: {
        totalCustomers: metrics.counts.customers,
        totalProducts: metrics.counts.products,
        totalPlans: metrics.counts.plans,
        totalSubscriptions: metrics.counts.subscriptions,
        activeSubscriptions: metrics.counts.activeSubscriptions,
        pausedSubscriptions: metrics.counts.pausedSubscriptions,
        closedSubscriptions: metrics.counts.closedSubscriptions,
        totalInvoices: metrics.counts.invoices,
        revenueCollected: metrics.revenueCollected,
        outstandingAmount: metrics.outstandingReceivables,
        overdueInvoices: metrics.overdueCount,
        overdueAmount: metrics.overdueAmount,
        mrr: metrics.mrr,
        arr: metrics.arr,
      },
      recentSubscriptions,
      recentInvoices,
    });
  } catch (error: any) {
    console.error("[API Admin Dashboard Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load admin dashboard metrics" }, { status: 500 });
  }
}
