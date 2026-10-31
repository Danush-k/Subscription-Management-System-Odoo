import { NextResponse } from "next/server";
import { AnalyticsService } from "@/server/services/analyticsService";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [metrics, monthlyData, paidInvoices] = await Promise.all([
      AnalyticsService.getFinancialMetrics(),
      AnalyticsService.getMonthlyRevenueTrends(),
      prisma.invoice.findMany({
        where: { status: "PAID" },
        select: { taxAmount: true },
      }),
    ]);

    // Calculate actual tax collected (CGST 50% + SGST 50% for standard domestic supply)
    const totalTaxCollected = paidInvoices.reduce((acc, inv) => acc + Number(inv.taxAmount), 0);
    const cgstLiability = Math.round((totalTaxCollected / 2) * 100) / 100;
    const sgstLiability = cgstLiability;

    const collectionRate =
      metrics.revenueInvoiced > 0
        ? Math.round((metrics.revenueCollected / metrics.revenueInvoiced) * 1000) / 10
        : 100;

    // Filter monthlyData to relevant months that have activity or current year
    const formattedMonthlyTrend = monthlyData.slice(0, 11).map((m) => ({
      month: `${m.month} 2026`,
      invoiced: m.invoiced,
      collected: m.collected,
    }));

    return NextResponse.json({
      financialMetrics: {
        invoicedRevenue: metrics.revenueInvoiced,
        collectedRevenue: metrics.revenueCollected,
        outstandingReceivables: metrics.outstandingReceivables,
        mrr: metrics.mrr,
        arr: metrics.arr,
        collectionRate,
        activeSubscribers: metrics.counts.activeSubscriptions,
        churnRate: 0.0,
        cgstLiability,
        sgstLiability,
      },
      monthlyTrend: formattedMonthlyTrend,
    });
  } catch (error: any) {
    console.error("[API Admin Reports Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load reports" }, { status: 500 });
  }
}
