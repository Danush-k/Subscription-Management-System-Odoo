import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        plan: true,
        convertedSubscription: {
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
          },
        },
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    const quotationIds = quotations.map((q) => q.id);
    const negotiationLogs = quotationIds.length > 0
      ? await prisma.auditLog.findMany({
          where: {
            entityType: "QUOTATION",
            entityId: { in: quotationIds },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const formatted = quotations.map((q) => {
      const line = q.lines[0];
      const variantName = line?.variant?.variantName || line?.product?.name || "Standard";

      // Check negotiation thread for pending customer counter-offer
      const qLogs = negotiationLogs.filter((l) => l.entityId === q.id);
      const latestCustomerLog = qLogs.find((l) => (l.newValues as any)?.role === "CUSTOMER" && (l.newValues as any)?.proposedDiscount);
      const latestStaffResponse = qLogs.find((l) => (l.newValues as any)?.role === "STAFF");
      
      const hasPendingDiscount = Boolean(
        latestCustomerLog &&
        (!latestStaffResponse || new Date(latestCustomerLog.createdAt) > new Date(latestStaffResponse.createdAt)) &&
        q.status !== "CONFIRMED"
      );

      const proposedDiscount = hasPendingDiscount ? Number((latestCustomerLog?.newValues as any)?.proposedDiscount) : null;
      const latestCustomerMessage = hasPendingDiscount ? String((latestCustomerLog?.newValues as any)?.message) : null;

      // Status mapping: if already has subscription or confirmed, status is SUBSCRIBED
      let displayStatus: "DRAFT" | "SENT" | "COUNTER_OFFER" | "SUBSCRIBED" | "EXPIRED" = "SENT";
      if (q.convertedSubscriptionId || q.status === "CONFIRMED") {
        displayStatus = "SUBSCRIBED";
      } else if (hasPendingDiscount) {
        displayStatus = "COUNTER_OFFER";
      } else if (q.status === "DRAFT") {
        displayStatus = "DRAFT";
      } else if (q.status === "EXPIRED" || (q.expiryDate && q.expiryDate < new Date())) {
        displayStatus = "EXPIRED";
      } else {
        displayStatus = "SENT";
      }

      return {
        id: q.id,
        quotationNumber: q.quotationNumber,
        customerName: q.customer.companyName || q.customer.name,
        customerEmail: q.customer.email,
        planName: q.plan.name,
        variantName,
        subtotal: Number(q.subtotal),
        taxAmount: Number(q.taxAmount),
        discountAmount: Number(q.discountAmount),
        totalAmount: Number(q.totalAmount),
        validUntil: q.expiryDate.toISOString().split("T")[0],
        status: displayStatus,
        rawStatus: q.status,
        paymentTerms: q.paymentTerms,
        convertedSubscriptionId: q.convertedSubscriptionId || q.convertedSubscription?.id || null,
        subscriptionNumber: q.convertedSubscription?.subscriptionNumber || null,
        pendingDiscount: proposedDiscount,
        latestCustomerMessage,
        negotiationsCount: qLogs.length,
      };
    });

    return NextResponse.json({ quotations: formatted });
  } catch (error: any) {
    console.error("[API Admin Quotations Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load quotations" }, { status: 500 });
  }
}
