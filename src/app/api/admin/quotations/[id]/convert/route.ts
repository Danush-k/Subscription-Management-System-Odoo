import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id },
        include: {
          plan: true,
          lines: {
            include: {
              product: true,
              variant: true,
            },
          },
          customer: true,
        },
      });

      if (!quotation) {
        throw new Error("Quotation not found");
      }

      if (quotation.convertedSubscriptionId) {
        throw new Error("Quotation is already converted to an active subscription");
      }

      const count = await tx.subscription.count();
      const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      const created = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: quotation.customerId,
          planId: quotation.planId,
          quotationId: quotation.id,
          status: "ACTIVE",
          billingFrequency: quotation.plan.billingFrequency,
          paymentTerms: quotation.paymentTerms || "NET_15",
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

      await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          convertedSubscriptionId: created.id,
        },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: created.id,
          previousStatus: "DRAFT",
          newStatus: "ACTIVE",
          action: "CONVERTED_FROM_QUOTATION",
          performedByUserId: session.userId,
          note: `Converted by Administrator from ${quotation.quotationNumber}.`,
        },
      });

      return { quotation, subscription: created };
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${result.quotation.quotationNumber} successfully converted to active Subscription ${result.subscription.subscriptionNumber}!`,
      subscription: result.subscription,
    });
  } catch (error: any) {
    console.error("[Admin Quotation Convert Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to convert quotation" },
      { status: 400 }
    );
  }
}
