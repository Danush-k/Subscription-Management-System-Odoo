import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "CUSTOMER" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  let paymentData: {
    paymentMethod?: string;
    amount?: number;
    transactionRef?: string;
    notes?: string;
  } | null = null;

  try {
    const body = await request.json();
    if (body && typeof body === "object") {
      paymentData = body;
    }
  } catch {
    // Body is optional
  }

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

      const hasPayment = Boolean(paymentData && paymentData.paymentMethod);

      // Count subscriptions for reference number
      const subCount = await tx.subscription.count();
      const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(subCount + 1).padStart(5, "0")}`;

      // Create new recurring subscription (ACTIVE if paid, CONFIRMED if awaiting terms)
      const subscription = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: quotation.customerId,
          planId: quotation.planId,
          quotationId: quotation.id,
          status: hasPayment ? "ACTIVE" : "CONFIRMED",
          billingFrequency: quotation.plan.billingFrequency,
          paymentTerms: quotation.paymentTerms || "IMMEDIATE",
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

      let invoice = null;
      let payment = null;

      // If paid via checkout gateway, create paid Tax Invoice and Payment record
      if (hasPayment) {
        const invCount = await tx.invoice.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, "0")}`;

        const periodStart = new Date();
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const customerSnapshot = {
          name: quotation.customer.name,
          companyName: quotation.customer.companyName,
          email: quotation.customer.email,
          taxId: quotation.customer.taxId,
          billingAddress: quotation.customer.billingAddress,
        };

        invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            customerId: quotation.customerId,
            subscriptionId: subscription.id,
            billingPeriodStart: periodStart,
            billingPeriodEnd: periodEnd,
            dueDate: new Date(),
            subtotal: quotation.subtotal,
            taxAmount: quotation.taxAmount,
            discountAmount: quotation.discountAmount,
            totalAmount: quotation.totalAmount,
            paidAmount: quotation.totalAmount,
            outstandingAmount: 0,
            status: "PAID",
            customerSnapshot: customerSnapshot as any,
            lines: {
              create: quotation.lines.map((line) => ({
                productId: line.productId,
                variantId: line.variantId,
                productName: line.product?.name || "Subscription Service",
                variantName: line.variant?.variantName || null,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                taxRate: line.taxRate,
                taxAmount: line.taxAmount,
                discountAmount: line.discountAmount,
                subtotal: line.subtotal,
                total: line.total,
              })),
            },
          },
        });

        const payCount = await tx.payment.count();
        const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(4, "0")}`;

        let validMethod = "UPI";
        if (["UPI", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "CASH"].includes(paymentData?.paymentMethod || "")) {
          validMethod = paymentData!.paymentMethod!;
        }

        payment = await tx.payment.create({
          data: {
            paymentNumber,
            invoiceId: invoice.id,
            customerId: quotation.customerId,
            paymentMethod: validMethod as any,
            amount: quotation.totalAmount,
            paymentDate: new Date(),
            transactionRef: paymentData?.transactionRef || `RZP_${Date.now()}`,
            notes: paymentData?.notes || `Customer Razorpay Gateway settlement for proposal ${quotation.quotationNumber}`,
            status: "SUCCESS",
            recordedByUserId: session.userId,
          },
        });
      }

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
          newStatus: hasPayment ? "ACTIVE" : "CONFIRMED",
          action: hasPayment ? "QUOTATION_PAID_AND_ACTIVATED" : "QUOTATION_ACCEPTED_BY_CUSTOMER",
          performedByUserId: session.userId,
          note: hasPayment
            ? `Customer paid ₹${Number(quotation.totalAmount).toLocaleString("en-IN")} via ${paymentData?.paymentMethod} (${paymentData?.transactionRef}). Subscription activated immediately.`
            : `Customer accepted proposal ${quotation.quotationNumber}. Recurring agreement activated.`,
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
            invoiceNumber: invoice?.invoiceNumber,
            paymentNumber: payment?.paymentNumber,
          },
        },
      });

      return { quotation, subscription, invoice, payment };
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${result.quotation.quotationNumber} confirmed! Active subscription ${result.subscription.subscriptionNumber} generated.`,
      subscription: result.subscription,
      invoice: result.invoice,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error("[Customer Quotation Accept Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to accept quotation" },
      { status: 400 }
    );
  }
}

