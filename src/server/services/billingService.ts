import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { SubscriptionService, BillingFrequencyType } from "./subscriptionService";
import { createInvoicePdf } from "./documentService";
import { dispatchEmail } from "./emailDispatchService";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface ProcessSubscriptionBillingParams {
  subscriptionId: string;
  executionDate?: Date;
}

export class BillingEngineService {
  /**
   * Identifies all active subscriptions eligible for recurring billing
   */
  public static async findDueSubscriptions(asOfDate: Date = new Date()) {
    return prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextBillingDate: {
          lte: asOfDate,
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  /**
   * Executes atomic, idempotent billing run for a single subscription
   */
  public static async processSubscriptionBilling({
    subscriptionId,
    executionDate = new Date(),
  }: ProcessSubscriptionBillingParams) {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!sub) {
      throw new Error(`Subscription with ID ${subscriptionId} not found`);
    }

    if (sub.status !== "ACTIVE") {
      throw new Error(`Subscription ${sub.subscriptionNumber} is not active (Status: ${sub.status})`);
    }

    const billingPeriodStart = new Date(sub.nextBillingDate);
    const billingPeriodEnd = SubscriptionService.calculateNextBillingDate(
      billingPeriodStart,
      sub.billingFrequency as BillingFrequencyType
    );

    // 1. Idempotency Check: Verify if this billing period has already been processed
    const existingRun = await prisma.billingHistory.findUnique({
      where: {
        subscriptionId_billingPeriodStart: {
          subscriptionId: sub.id,
          billingPeriodStart,
        },
      },
    });

    if (existingRun && existingRun.status === "SUCCESS") {
      return {
        success: false,
        skipped: true,
        reason: `Billing period starting ${billingPeriodStart.toISOString().split("T")[0]} has already been invoiced`,
        invoiceId: existingRun.invoiceId,
      };
    }

    // 2. Line Item Totals & Tax Computations
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalDiscount = new Decimal(0);

    const invoiceLinesData = sub.lines.map((line) => {
      const qty = new Decimal(line.quantity);
      const unitPrice = new Decimal(line.unitPrice.toString());
      const discount = new Decimal(line.discountAmount.toString());
      const taxRate = new Decimal(line.taxRate.toString());

      const lineSubtotal = Decimal.max(qty.times(unitPrice).minus(discount), new Decimal(0));
      const lineTax = lineSubtotal.times(taxRate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const lineTotal = lineSubtotal.plus(lineTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      subtotal = subtotal.plus(lineSubtotal);
      totalTax = totalTax.plus(lineTax);
      totalDiscount = totalDiscount.plus(discount);

      return {
        productId: line.productId,
        variantId: line.variantId,
        productName: line.product.name,
        variantName: line.variant ? line.variant.variantName : null,
        quantity: line.quantity,
        unitPrice: unitPrice.toNumber(),
        taxRate: taxRate.toNumber(),
        taxAmount: lineTax.toNumber(),
        discountAmount: discount.toNumber(),
        subtotal: lineSubtotal.toNumber(),
        total: lineTotal.toNumber(),
      };
    });

    const totalAmount = subtotal.plus(totalTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // Calculate Due Date based on payment terms
    const dueDate = new Date(executionDate);
    if (sub.paymentTerms === "NET_15") dueDate.setDate(dueDate.getDate() + 15);
    else if (sub.paymentTerms === "NET_30") dueDate.setDate(dueDate.getDate() + 30);
    else if (sub.paymentTerms === "NET_60") dueDate.setDate(dueDate.getDate() + 60);

    // Generate unique sequential invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

    // 3. Customer Snapshot for historical audit immutability
    const customerSnapshot = {
      name: sub.customer.name,
      email: sub.customer.email,
      companyName: sub.customer.companyName,
      billingAddress: sub.customer.billingAddress,
      taxId: sub.customer.taxId,
      customerNumber: sub.customer.customerNumber,
    };

    // 4. Atomic PostgreSQL Transaction: Create invoice, lines, billing history, and update next billing date
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          billingPeriodStart,
          billingPeriodEnd,
          invoiceDate: executionDate,
          dueDate,
          subtotal: subtotal.toNumber(),
          taxAmount: totalTax.toNumber(),
          discountAmount: totalDiscount.toNumber(),
          totalAmount: totalAmount.toNumber(),
          paidAmount: 0.0,
          outstandingAmount: totalAmount.toNumber(),
          status: "CONFIRMED",
          customerSnapshot,
          lines: {
            create: invoiceLinesData,
          },
        },
      });

      // Advance subscription billing dates
      const nextNextBillingDate = SubscriptionService.calculateNextBillingDate(
        billingPeriodEnd,
        sub.billingFrequency as BillingFrequencyType
      );

      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          lastBilledDate: executionDate,
          nextBillingDate: billingPeriodEnd,
        },
      });

      // Record idempotent billing history
      const history = await tx.billingHistory.create({
        data: {
          subscriptionId: sub.id,
          invoiceId: invoice.id,
          billingPeriodStart,
          billingPeriodEnd,
          scheduledDate: sub.nextBillingDate,
          executedDate: executionDate,
          status: "SUCCESS",
          attemptCount: 1,
        },
      });

      // Add subscription audit log entry
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: sub.id,
          previousStatus: sub.status,
          newStatus: sub.status,
          action: "RECURRING_BILLING_GENERATED",
          note: `Automated recurring invoice ${invoiceNumber} created for ₹${totalAmount.toFixed(2)}`,
        },
      });

      return { invoice, history };
    });

    const emailResult = await dispatchEmail({
      to: sub.customer.email,
      toName: sub.customer.name,
      subject: `Invoice ${result.invoice.invoiceNumber} from Brightloop`,
      htmlContent: `<p>Hello ${sub.customer.name},</p><p>Your invoice <strong>${result.invoice.invoiceNumber}</strong> totals ₹${totalAmount.toFixed(2)} and is due on ${dueDate.toLocaleDateString("en-IN")}.</p>`,
      entityType: "Invoice",
      entityId: result.invoice.id,
      attachment: {
        name: `${result.invoice.invoiceNumber}.pdf`,
        content: createInvoicePdf({
          invoiceNumber: result.invoice.invoiceNumber,
          customerName: sub.customer.name,
          totalAmount: totalAmount.toFixed(2),
          dueDate,
        }),
      },
    });

    return {
      success: true,
      invoice: result.invoice,
      billingHistory: result.history,
      emailSent: emailResult.sent,
      emailError: emailResult.error,
    };
  }
}
