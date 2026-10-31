import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const subscription = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id },
        include: { plan: true, lines: true },
      });

      if (!quotation) throw new Error("Quotation not found");
      if (!["DRAFT", "QUOTATION"].includes(quotation.status)) {
        throw new Error(`Quotation cannot be converted from status ${quotation.status}`);
      }
      if (quotation.expiryDate < new Date()) throw new Error("Quotation has expired");

      const count = await tx.subscription.count();
      const created = await tx.subscription.create({
        data: {
          subscriptionNumber: `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
          customerId: quotation.customerId,
          planId: quotation.planId,
          quotationId: quotation.id,
          status: "CONFIRMED",
          billingFrequency: quotation.plan.billingFrequency,
          paymentTerms: quotation.paymentTerms,
          nextBillingDate: new Date(),
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
        data: { status: "CONFIRMED", confirmedAt: new Date(), convertedSubscriptionId: created.id },
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: created.id,
          previousStatus: "DRAFT",
          newStatus: "CONFIRMED",
          action: "QUOTATION_CONVERTED",
          performedByUserId: session.userId,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, data: { subscription } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to convert quotation" },
      { status: 400 }
    );
  }
}
