import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession();
    const queryEmail = searchParams.get("email");
    const queryCustomerId = searchParams.get("customerId");

    let customerWhere: { id?: string; email?: string } | undefined;
    if (session?.customerId) {
      customerWhere = { id: session.customerId };
    } else if (session?.email && session.role === "CUSTOMER") {
      customerWhere = { email: session.email };
    } else if (queryCustomerId) {
      customerWhere = { id: queryCustomerId };
    } else if (queryEmail) {
      customerWhere = { email: queryEmail };
    }

    // 1. Fetch Customer
    const customer = await prisma.customer.findFirst({
      where: customerWhere,
      include: {
        subscriptions: {
          where: {
            status: { in: ["ACTIVE", "PAUSED", "CLOSED", "EXPIRED", "CONFIRMED"] },
          },
          include: {
            plan: true,
            lines: {
              include: {
                product: true,
                variant: true,
              },
            },
            histories: {
              orderBy: { createdAt: "desc" },
            },
            invoices: {
              orderBy: { invoiceDate: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          include: {
            lines: true,
            payments: {
              orderBy: { paymentDate: "desc" },
            },
            subscription: {
              select: {
                id: true,
                subscriptionNumber: true,
                plan: { select: { name: true } },
              },
            },
          },
          orderBy: { invoiceDate: "desc" },
        },
        payments: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                totalAmount: true,
                status: true,
              },
            },
          },
          orderBy: { paymentDate: "desc" },
        },
        quotations: {
          include: {
            plan: true,
            lines: {
              include: {
                product: true,
                variant: true,
              },
            },
            convertedSubscription: {
              select: {
                id: true,
                subscriptionNumber: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 2. Compute Metrics
    const now = new Date();
    const activeSubs = customer.subscriptions.filter((s) => s.status === "ACTIVE");
    const pausedSubs = customer.subscriptions.filter((s) => s.status === "PAUSED");

    // Upcoming Renewal
    const upcomingRenewals = activeSubs
      .filter((s) => s.nextBillingDate && new Date(s.nextBillingDate) >= now)
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

    const nextRenewal = upcomingRenewals[0] || null;

    // Calculate MRR & ARR from active subscriptions
    let totalMRR = new Decimal(0);
    for (const sub of activeSubs) {
      let subMonthlyTotal = new Decimal(0);
      for (const line of sub.lines) {
        subMonthlyTotal = subMonthlyTotal.plus(line.total.toString());
      }
      if (subMonthlyTotal.isZero() && sub.plan?.subscriptionPrice) {
        subMonthlyTotal = new Decimal(sub.plan.subscriptionPrice.toString());
      }

      if (sub.billingFrequency === "YEARLY") {
        totalMRR = totalMRR.plus(subMonthlyTotal.dividedBy(12));
      } else if (sub.billingFrequency === "DAILY") {
        totalMRR = totalMRR.plus(subMonthlyTotal.times(30));
      } else if (sub.billingFrequency === "WEEKLY") {
        totalMRR = totalMRR.plus(subMonthlyTotal.times(4.33));
      } else {
        totalMRR = totalMRR.plus(subMonthlyTotal);
      }
    }
    const totalARR = totalMRR.times(12);

    // Outstanding Balance & Overdue
    let totalOutstanding = new Decimal(0);
    let totalPaid = new Decimal(0);
    let overdueCount = 0;

    for (const inv of customer.invoices) {
      const outstanding = new Decimal(inv.outstandingAmount.toString());
      const paid = new Decimal(inv.paidAmount.toString());
      totalOutstanding = totalOutstanding.plus(outstanding);
      totalPaid = totalPaid.plus(paid);

      const isOverdue =
        inv.status === "OVERDUE" ||
        (outstanding.greaterThan(0) && new Date(inv.dueDate) < now);

      if (isOverdue) {
        overdueCount++;
      }
    }

    // 3. Compile Unified Activity Timeline
    type ActivityItem = {
      id: string;
      date: string;
      type: "SUBSCRIPTION" | "INVOICE" | "PAYMENT";
      title: string;
      description: string;
      badge?: string;
      badgeVariant?: string;
      referenceId?: string;
    };

    const timeline: ActivityItem[] = [];

    // Sub history
    for (const sub of customer.subscriptions) {
      for (const h of sub.histories) {
        timeline.push({
          id: `sub-hist-${h.id}`,
          date: h.createdAt.toISOString(),
          type: "SUBSCRIPTION",
          title: h.action,
          description: `${sub.subscriptionNumber}: ${h.previousStatus} → ${h.newStatus}${h.note ? ` (${h.note})` : ""}`,
          badge: h.newStatus,
          badgeVariant: h.newStatus.toLowerCase(),
          referenceId: sub.subscriptionNumber,
        });
      }
    }

    // Invoices
    for (const inv of customer.invoices) {
      timeline.push({
        id: `inv-${inv.id}`,
        date: inv.invoiceDate.toISOString(),
        type: "INVOICE",
        title: `Invoice ${inv.invoiceNumber} Generated`,
        description: `Billed ₹${Number(inv.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} for ${inv.lines[0]?.productName || "Subscription"}`,
        badge: inv.status,
        badgeVariant: inv.status.toLowerCase(),
        referenceId: inv.invoiceNumber,
      });
    }

    // Payments
    for (const pay of customer.payments) {
      timeline.push({
        id: `pay-${pay.id}`,
        date: pay.paymentDate.toISOString(),
        type: "PAYMENT",
        title: `Payment Received (${pay.paymentMethod.replace("_", " ")})`,
        description: `Amount ₹${Number(pay.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} recorded for ${pay.invoice?.invoiceNumber || "Invoice"}${pay.transactionRef ? ` • Ref: ${pay.transactionRef}` : ""}`,
        badge: pay.status,
        badgeVariant: "paid",
        referenceId: pay.paymentNumber,
      });
    }

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 4. Contextual Notifications
    const notifications = [];
    if (overdueCount > 0) {
      notifications.push({
        id: "notif-overdue",
        level: "warning",
        title: "Action Required: Overdue Invoices",
        message: `You have ${overdueCount} overdue invoice${overdueCount > 1 ? "s" : ""} requiring settlement to maintain uninterrupted service.`,
        actionLabel: "View Invoices",
        actionTab: "invoices",
      });
    }

    if (nextRenewal) {
      const daysUntil = Math.ceil((new Date(nextRenewal.nextBillingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: "notif-renewal",
        level: "info",
        title: "Upcoming Subscription Renewal",
        message: `${nextRenewal.plan?.name || nextRenewal.subscriptionNumber} renews in ${daysUntil} day${daysUntil === 1 ? "" : "s"} (${new Date(nextRenewal.nextBillingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}).`,
        actionLabel: "Manage Subscription",
        actionTab: "subscriptions",
      });
    }

    if (pausedSubs.length > 0) {
      notifications.push({
        id: "notif-paused",
        level: "neutral",
        title: "Paused Subscription",
        message: `${pausedSubs[0].subscriptionNumber} is currently paused. Resume anytime to reactivate billing and features.`,
        actionLabel: "Resume",
        actionTab: "subscriptions",
      });
    }

    // 4b. Quotations & Live Negotiation Thread
    const quotationIds = ((customer as any).quotations || []).map((q: any) => q.id);
    const negotiationLogs = quotationIds.length > 0
      ? await prisma.auditLog.findMany({
          where: {
            entityType: "QUOTATION",
            entityId: { in: quotationIds },
          },
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true,
              },
            },
          },
        })
      : [];

    const formattedQuotations = (((customer as any).quotations) || []).map((q: any) => {
      const logs = negotiationLogs
        .filter((l) => l.entityId === q.id)
        .map((l) => ({
          id: l.id,
          action: l.action,
          senderName: (l.newValues as any)?.sender || l.user?.name || "Customer",
          senderRole: (l.newValues as any)?.role || l.user?.role || "CUSTOMER",
          message: (l.newValues as any)?.message || l.action,
          proposedDiscount: (l.newValues as any)?.proposedDiscount,
          requestedPaymentTerms: (l.newValues as any)?.requestedPaymentTerms,
          createdAt: l.createdAt.toISOString(),
        }));

      return {
        id: q.id,
        quotationNumber: q.quotationNumber,
        status: q.status,
        subtotal: Number(q.subtotal),
        taxAmount: Number(q.taxAmount),
        discountAmount: Number(q.discountAmount),
        totalAmount: Number(q.totalAmount),
        paymentTerms: q.paymentTerms,
        expiryDate: q.expiryDate ? q.expiryDate.toISOString() : null,
        confirmedAt: q.confirmedAt ? q.confirmedAt.toISOString() : null,
        convertedSubscriptionId: q.convertedSubscriptionId,
        createdAt: q.createdAt.toISOString(),
        plan: q.plan,
        convertedSubscription: q.convertedSubscription,
        lines: q.lines.map((l: any) => ({
          id: l.id,
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity,
          unitPrice: Number(l.unitPrice),
          taxRate: Number(l.taxRate),
          taxAmount: Number(l.taxAmount),
          discountAmount: Number(l.discountAmount),
          subtotal: Number(l.subtotal),
          total: Number(l.total),
          product: l.product,
          variant: l.variant,
        })),
        negotiations: logs,
      };
    });

    const pendingQuots = formattedQuotations.filter((q: any) => q.status === "QUOTATION");
    if (pendingQuots.length > 0) {
      notifications.unshift({
        id: "notif-quotation",
        level: "info",
        title: "New Quotation Proposal Received",
        message: `Proposal ${pendingQuots[0].quotationNumber} is ready for review and negotiation.`,
        actionLabel: "Review Proposal",
        actionTab: "quotations",
      });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        customerNumber: customer.customerNumber,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        companyName: customer.companyName,
        taxId: customer.taxId,
        billingAddress: customer.billingAddress,
        status: customer.status,
        registrationDate: customer.registrationDate,
      },
      metrics: {
        activeSubscriptions: activeSubs.length,
        pausedSubscriptions: pausedSubs.length,
        totalSubscriptions: customer.subscriptions.length,
        upcomingRenewal: nextRenewal
          ? {
              date: nextRenewal.nextBillingDate,
              subscriptionNumber: nextRenewal.subscriptionNumber,
              planName: nextRenewal.plan?.name || "Subscription Plan",
              autoRenew: nextRenewal.autoRenew,
            }
          : null,
        mrr: totalMRR.toNumber(),
        arr: totalARR.toNumber(),
        outstandingBalance: totalOutstanding.toNumber(),
        totalPaid: totalPaid.toNumber(),
        overdueInvoices: overdueCount,
      },
      subscriptions: customer.subscriptions,
      invoices: customer.invoices,
      payments: customer.payments,
      quotations: formattedQuotations,
      timeline,
      notifications,
    });
  } catch (error) {
    console.error("Portal API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
