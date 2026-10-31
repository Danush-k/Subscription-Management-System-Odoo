import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
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
          include: {
            payments: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reason, paymentMethod = "UPI", amount, transactionRef, notes } = body;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        customer: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const policy = {
      pauseAllowed: subscription.plan.pauseAllowed,
      earlyClosureAllowed: subscription.plan.earlyClosureAllowed,
      renewalAllowed: subscription.plan.renewalAllowed,
      autoCloseEnabled: subscription.plan.autoCloseEnabled,
    };

    if (action === "pause") {
      const check = SubscriptionService.validateTransition(
        subscription.status as any,
        "PAUSED",
        policy
      );
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason || "Pause not allowed" }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            status: "PAUSED",
            pausedAt: new Date(),
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: "PAUSED",
            action: "Paused by Customer",
            note: reason || "Customer self-service requested pause",
          },
        });

        return sub;
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === "resume") {
      const check = SubscriptionService.validateTransition(
        subscription.status as any,
        "ACTIVE",
        policy
      );
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason || "Resume not allowed" }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            status: "ACTIVE",
            pausedAt: null,
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: "ACTIVE",
            action: "Resumed by Customer",
            note: "Customer self-service reactivated subscription",
          },
        });

        return sub;
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === "cancel") {
      const check = SubscriptionService.validateTransition(
        subscription.status as any,
        "CLOSED",
        policy
      );
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason || "Cancellation not allowed" }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            status: "CLOSED",
            closedAt: new Date(),
            cancellationReason: reason || "Customer requested early termination",
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: "CLOSED",
            action: "Cancelled by Customer",
            note: reason || "Customer initiated subscription termination",
          },
        });

        return sub;
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === "renew") {
      // Calculate renewal next billing date
      const baseDate = new Date();
      const newNext = new Date(baseDate);
      if (subscription.billingFrequency === "YEARLY") {
        newNext.setFullYear(newNext.getFullYear() + 1);
      } else if (subscription.billingFrequency === "WEEKLY") {
        newNext.setDate(newNext.getDate() + 7);
      } else if (subscription.billingFrequency === "DAILY") {
        newNext.setDate(newNext.getDate() + 1);
      } else {
        newNext.setMonth(newNext.getMonth() + 1);
      }

      // Calculate totals from subscription lines
      const subtotal =
        subscription.lines.reduce((sum, l) => sum + Number(l.subtotal || 0), 0) ||
        Number(subscription.plan.subscriptionPrice);
      const taxAmount =
        subscription.lines.reduce((sum, l) => sum + (Number(l.total || 0) - Number(l.subtotal || 0)), 0) || 0;
      const totalAmount = amount ? Number(amount) : subtotal + taxAmount;

      const result = await prisma.$transaction(async (tx) => {
        // 1. Reactivate subscription to ACTIVE and advance nextBillingDate
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            status: "ACTIVE",
            pausedAt: null,
            closedAt: null,
            cancellationReason: null,
            nextBillingDate: newNext,
            lastBilledDate: new Date(),
          },
        });

        // 2. Generate Renewal Invoice
        const invCount = await tx.invoice.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, "0")}`;
        const customerSnapshot = {
          name: subscription.customer.name,
          companyName: subscription.customer.companyName,
          email: subscription.customer.email,
          taxId: subscription.customer.taxId,
          billingAddress: subscription.customer.billingAddress,
        };

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            customerId: subscription.customerId,
            subscriptionId: subscription.id,
            billingPeriodStart: new Date(),
            billingPeriodEnd: newNext,
            dueDate: new Date(),
            subtotal,
            taxAmount,
            discountAmount: 0,
            totalAmount,
            paidAmount: totalAmount,
            outstandingAmount: 0,
            status: "PAID",
            customerSnapshot: customerSnapshot as any,
            lines: {
              create: subscription.lines.map((line) => ({
                productId: line.productId,
                variantId: line.variantId,
                productName: line.product?.name || subscription.plan.name,
                variantName: line.variant?.variantName || null,
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

        // 3. Generate Settled Payment Record
        const payCount = await tx.payment.count();
        const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(4, "0")}`;

        let validMethod = "UPI";
        if (["UPI", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "CASH"].includes(paymentMethod)) {
          validMethod = paymentMethod;
        }

        const payment = await tx.payment.create({
          data: {
            paymentNumber,
            invoiceId: invoice.id,
            customerId: subscription.customerId,
            paymentMethod: validMethod as any,
            amount: totalAmount,
            paymentDate: new Date(),
            transactionRef: transactionRef || `PAY_RENEW_${Date.now()}`,
            notes: notes || `Customer subscription renewal settlement via ${validMethod}`,
            status: "SUCCESS",
          },
        });

        // 4. Create History
        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: "ACTIVE",
            action: "RENEWED_WITH_PAYMENT",
            note: `Renewed and paid ₹${totalAmount.toLocaleString("en-IN")} via ${validMethod} (Ref: ${payment.transactionRef}). Active until ${newNext.toLocaleDateString("en-IN")}`,
          },
        });

        return { sub, invoice, payment };
      });

      return NextResponse.json({
        success: true,
        message: `Subscription ${result.sub.subscriptionNumber} renewed and settled successfully!`,
        subscription: result.sub,
        invoice: result.invoice,
        payment: result.payment,
      });
    }

    if (action === "toggleAutoRenew") {
      const newAuto = !subscription.autoRenew;
      const updated = await prisma.subscription.update({
        where: { id },
        data: { autoRenew: newAuto },
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

