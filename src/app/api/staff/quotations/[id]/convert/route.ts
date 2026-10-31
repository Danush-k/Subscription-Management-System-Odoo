import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dispatchEmail } from "@/server/services/emailDispatchService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const { customerConsentConfirmed, consentReference } = body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true, plan: true, lines: true },
    });

    if (!quotation) throw new Error("Quotation not found");
    if (!["DRAFT", "QUOTATION"].includes(quotation.status)) {
      throw new Error(`Quotation cannot be converted from status ${quotation.status}`);
    }
    if (quotation.expiryDate < new Date()) throw new Error("Quotation has expired");

    // Verify Customer Permission / Confirmation
    // Check if customer accepted directly in customer portal
    const customerAcceptedLog = await prisma.auditLog.findFirst({
      where: {
        entityType: "QUOTATION",
        entityId: id,
        action: { in: ["CUSTOMER_CONFIRMED", "QUOTATION_ACCEPTED", "CUSTOMER_NEGOTIATION"] },
      },
    });

    const hasExplicitPortalAcceptance = customerAcceptedLog && customerAcceptedLog.action === "QUOTATION_ACCEPTED";
    const hasVerifiedStaffAuthorization = customerConsentConfirmed === true && Boolean(consentReference && consentReference.trim().length >= 3);

    if (!hasExplicitPortalAcceptance && !hasVerifiedStaffAuthorization) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer permission required: The customer has not yet confirmed or approved this proposal. The customer must accept it in their portal, or staff must record verified customer authorization.",
          requiresCustomerApproval: true,
        },
        { status: 403 }
      );
    }

    const subscription = await prisma.$transaction(async (tx) => {
      const count = await tx.subscription.count();
      const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      const created = await tx.subscription.create({
        data: {
          subscriptionNumber,
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

      // Generate invoice for subscription
      const invCount = await tx.invoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, "0")}`;
      const customerSnapshot = {
        name: quotation.customer.name,
        companyName: quotation.customer.companyName,
        email: quotation.customer.email,
        taxId: quotation.customer.taxId,
        billingAddress: quotation.customer.billingAddress,
      };

      await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: quotation.customerId,
          subscriptionId: created.id,
          billingPeriodStart: new Date(),
          billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + (quotation.paymentTerms === "NET_15" ? 15 : quotation.paymentTerms === "NET_30" ? 30 : 0) * 24 * 60 * 60 * 1000),
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          discountAmount: quotation.discountAmount,
          totalAmount: quotation.totalAmount,
          paidAmount: 0,
          outstandingAmount: quotation.totalAmount,
          status: "CONFIRMED",
          customerSnapshot: customerSnapshot as any,
          lines: {
            create: quotation.lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              productName: quotation.plan.name,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
              taxAmount: Number(line.total) - Number(line.subtotal),
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
          note: hasVerifiedStaffAuthorization
            ? `Customer authorization verified by staff: ${consentReference}`
            : "Confirmed per customer portal approval.",
        },
      });

      // Audit Log the conversion with confirmation source
      await tx.auditLog.create({
        data: {
          entityType: "QUOTATION",
          entityId: quotation.id,
          userId: session.userId,
          action: "QUOTATION_CONVERTED_WITH_CONSENT",
          newValues: {
            subscriptionId: created.id,
            subscriptionNumber,
            consentType: hasExplicitPortalAcceptance ? "CUSTOMER_PORTAL_ACCEPTED" : "VERIFIED_CUSTOMER_AUTHORIZATION",
            consentReference: consentReference || "Customer Portal Approval",
            operator: session.name || "Staff",
            timestamp: new Date().toISOString(),
          },
        },
      });

      return created;
    });

    const customer = await prisma.customer.findUnique({ where: { id: subscription.customerId } });
    const emailResult = customer
      ? await dispatchEmail({
          to: customer.email,
          toName: customer.name,
          subject: `Subscription ${subscription.subscriptionNumber} confirmed`,
          htmlContent: `<p>Hello ${customer.name},</p><p>Your subscription <strong>${subscription.subscriptionNumber}</strong> has been confirmed and is ready for activation.</p>`,
          entityType: "Subscription",
          entityId: subscription.id,
        })
      : { sent: false, error: "Customer not found" };

    return NextResponse.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} confirmed! Active subscription ${subscription.subscriptionNumber} generated.`,
      data: { subscription, emailSent: emailResult.sent, emailError: emailResult.error },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to convert quotation" },
      { status: 400 }
    );
  }
}
