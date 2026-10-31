import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "CUSTOMER" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id },
        include: {
          plan: true,
          lines: true,
          customer: true,
        },
      });

      if (!quotation) {
        throw new Error("Quotation proposal not found");
      }

      // Check customer ownership
      if (session.role === "CUSTOMER" && session.customerId && quotation.customerId !== session.customerId) {
        throw new Error("Unauthorized access to this quotation");
      }

      if (quotation.status === "CONFIRMED") {
        throw new Error("This quotation has already been accepted and confirmed");
      }

      if (quotation.status === "EXPIRED" || quotation.status === "CANCELLED") {
        throw new Error(`Quotation is ${quotation.status.toLowerCase()} and cannot be accepted`);
      }

      // Count subscriptions for reference number
      const count = await tx.subscription.count();
      const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      // Create new confirmed recurring subscription
      const subscription = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: quotation.customerId,
          planId: quotation.planId,
          quotationId: quotation.id,
          status: "CONFIRMED",
          billingFrequency: quotation.plan.billingFrequency,
          paymentTerms: quotation.paymentTerms || "NET_15",
          startDate: new Date(),
          nextBillingDate: new Date(),
          autoRenew: true,
          lines: {
            create: quotation.lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
              discountAmount: line.discountAmount,
              subtotal: line.subtotal,
              total: line.total,
            })),
          },
        },
      });

      // Update Quotation state
      await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          convertedSubscriptionId: subscription.id,
        },
      });

      // Create Subscription History
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          previousStatus: "DRAFT",
          newStatus: "CONFIRMED",
          action: "QUOTATION_ACCEPTED_BY_CUSTOMER",
          performedByUserId: session.userId,
          note: `Customer accepted proposal ${quotation.quotationNumber}. Recurring agreement activated.`,
        },
      });

      // Create Audit Log of confirmation
      await tx.auditLog.create({
        data: {
          entityType: "QUOTATION",
          entityId: quotation.id,
          userId: session.userId,
          action: "QUOTATION_ACCEPTED",
          newValues: {
            message: `Proposal accepted by client. Activated as Subscription ${subscriptionNumber}.`,
            sender: quotation.customer.companyName || quotation.customer.name,
            role: "CUSTOMER",
            subscriptionId: subscription.id,
            subscriptionNumber,
          },
        },
      });

      return { quotation, subscription };
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${result.quotation.quotationNumber} confirmed! Active subscription ${result.subscription.subscriptionNumber} generated.`,
      subscription: result.subscription,
    });
  } catch (error: any) {
    console.error("[Customer Quotation Accept Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to accept quotation" },
      { status: 400 }
    );
  }
}

