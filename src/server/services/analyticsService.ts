import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export class AnalyticsService {
  /**
   * Computes executive financial KPIs strictly from database records
   */
  public static async getFinancialMetrics() {
    // 1. Total Invoiced Revenue
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { not: "CANCELLED" },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        outstandingAmount: true,
        status: true,
        dueDate: true,
      },
    });

    let totalInvoiced = new Decimal(0);
    let totalCollected = new Decimal(0);
    let totalOutstanding = new Decimal(0);
    let totalOverdue = new Decimal(0);
    let overdueCount = 0;

    const now = new Date();

    for (const inv of invoices) {
      const invTotal = new Decimal(inv.totalAmount.toString());
      const invPaid = new Decimal(inv.paidAmount.toString());
      const invOutstanding = new Decimal(inv.outstandingAmount.toString());

      totalInvoiced = totalInvoiced.plus(invTotal);
      totalCollected = totalCollected.plus(invPaid);
      totalOutstanding = totalOutstanding.plus(invOutstanding);

      if (inv.status !== "PAID" && inv.dueDate < now) {
        totalOverdue = totalOverdue.plus(invOutstanding);
        overdueCount += 1;
      }
    }

    // 2. Active Subscriptions & MRR / ARR calculation
    const activeSubs = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: {
        plan: true,
        lines: true,
      },
    });

    let mrr = new Decimal(0);

    for (const sub of activeSubs) {
      let subMonthlyValue = new Decimal(0);

      // Base plan price or line item aggregation
      const planPrice = new Decimal(sub.plan.subscriptionPrice.toString());
      let linesSum = new Decimal(0);
      for (const line of sub.lines) {
        linesSum = linesSum.plus(new Decimal(line.total.toString()));
      }

      const rawValue = linesSum.greaterThan(0) ? linesSum : planPrice;

      switch (sub.billingFrequency) {
        case "DAILY":
          subMonthlyValue = rawValue.times(30);
          break;
        case "WEEKLY":
          subMonthlyValue = rawValue.times(52).dividedBy(12);
          break;
        case "MONTHLY":
          subMonthlyValue = rawValue;
          break;
        case "YEARLY":
          subMonthlyValue = rawValue.dividedBy(12);
          break;
      }

      mrr = mrr.plus(subMonthlyValue);
    }

    const arr = mrr.times(12).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const mrrFormatted = mrr.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // 3. Counts
    const [totalCustomers, totalProducts, totalPlans, totalSubscriptions] = await Promise.all([
      prisma.customer.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.subscriptionPlan.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count(),
    ]);

    const activeSubCount = activeSubs.length;
    const pausedSubCount = await prisma.subscription.count({ where: { status: "PAUSED" } });
    const closedSubCount = await prisma.subscription.count({ where: { status: "CLOSED" } });

    return {
      revenueInvoiced: totalInvoiced.toNumber(),
      revenueCollected: totalCollected.toNumber(),
      outstandingReceivables: totalOutstanding.toNumber(),
      overdueAmount: totalOverdue.toNumber(),
      overdueCount,
      mrr: mrrFormatted.toNumber(),
      arr: arr.toNumber(),
      counts: {
        customers: totalCustomers,
        products: totalProducts,
        plans: totalPlans,
        subscriptions: totalSubscriptions,
        activeSubscriptions: activeSubCount,
        pausedSubscriptions: pausedSubCount,
        closedSubscriptions: closedSubCount,
        invoices: invoices.length,
      },
    };
  }

  /**
   * Monthly revenue aggregation for chart visualization
   */
  public static async getMonthlyRevenueTrends(year: number = new Date().getFullYear()) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: { gte: startOfYear, lte: endOfYear },
        status: { not: "CANCELLED" },
      },
      select: {
        invoiceDate: true,
        totalAmount: true,
        paidAmount: true,
      },
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = monthNames.map((name, index) => ({
      month: name,
      monthIndex: index,
      invoiced: 0,
      collected: 0,
    }));

    for (const inv of invoices) {
      const month = inv.invoiceDate.getMonth();
      monthlyData[month].invoiced += Number(inv.totalAmount);
      monthlyData[month].collected += Number(inv.paidAmount);
    }

    return monthlyData;
  }
}
