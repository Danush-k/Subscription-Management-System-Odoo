import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface RecordPaymentParams {
  invoiceId: string;
  amount: number | string | Decimal;
  paymentMethod: PaymentMethod;
  paymentDate?: Date;
  transactionRef?: string | null;
  notes?: string | null;
  recordedByUserId?: string | null;
}

export class PaymentService {
  private static validateTransactionReference(
    paymentMethod: PaymentMethod,
    transactionRef?: string | null
  ): string | null {
    const reference = transactionRef?.trim() || null;
    if (paymentMethod !== "CASH" && paymentMethod !== "OTHER" && !reference) {
      throw new Error("Transaction reference is required for this payment method");
    }
    return reference;
  }

  /**
   * Records a payment against an invoice inside a strict database transaction
   */
  public static async recordPayment({
    invoiceId,
    amount,
    paymentMethod,
    paymentDate = new Date(),
    transactionRef,
    notes,
    recordedByUserId,
  }: RecordPaymentParams) {
    const paymentDecimal = new Decimal(amount);

    if (paymentDecimal.isNegative() || paymentDecimal.isZero()) {
      throw new Error("Payment amount must be greater than zero");
    }
    const reference = this.validateTransactionReference(paymentMethod, transactionRef);

    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true },
      });

      if (!invoice) throw new Error("Invoice not found");
      if (invoice.status === "CANCELLED") throw new Error("Cannot pay a cancelled invoice");
      if (invoice.status === "PAID") throw new Error("Invoice is already fully paid");

      const total = new Decimal(invoice.totalAmount.toString());
      const currentPaid = new Decimal(invoice.paidAmount.toString());
      const currentOutstanding = new Decimal(invoice.outstandingAmount.toString());

      if (paymentDecimal.greaterThan(currentOutstanding)) {
        throw new Error(
          `Payment amount of ₹${paymentDecimal.toFixed(2)} exceeds outstanding balance of ₹${currentOutstanding.toFixed(2)}`
        );
      }
      if (reference) {
        const duplicate = await tx.payment.findFirst({
          where: { transactionRef: reference, status: { not: "REFUNDED" } },
        });
        if (duplicate) throw new Error("This transaction reference has already been recorded");
      }

      // Generate sequential payment number
      const paymentCount = await tx.payment.count();
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(5, "0")}`;

      // Create Payment record
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          paymentMethod,
          amount: paymentDecimal.toNumber(),
          paymentDate,
          transactionRef: reference,
          notes: notes || null,
          status: "SUCCESS",
          recordedByUserId: recordedByUserId || null,
        },
      });

      // Recalculate invoice balance
      const newPaid = currentPaid.plus(paymentDecimal).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const newOutstanding = total.minus(newPaid).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const isFullyPaid = newOutstanding.isZero();

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaid.toNumber(),
          outstandingAmount: newOutstanding.toNumber(),
          status: isFullyPaid ? "PAID" : "CONFIRMED",
        },
      });
      await tx.auditLog.create({
        data: {
          userId: recordedByUserId || null,
          action: "PAYMENT_RECORDED",
          entityType: "Payment",
          entityId: payment.id,
          oldValues: { invoiceStatus: invoice.status, paidAmount: currentPaid.toString() },
          newValues: { invoiceStatus: updatedInvoice.status, paidAmount: newPaid.toString() },
        },
      });

      return {
        payment,
        invoice: updatedInvoice,
        remainingBalance: newOutstanding.toNumber(),
        isFullyPaid,
      };
    });
  }

  public static async reversePayment(
    paymentId: string,
    recordedByUserId: string,
    reason: string
  ) {
    const trimmedReason = reason.trim();
    if (!trimmedReason) throw new Error("A reversal reason is required");

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { invoice: true },
      });
      if (!payment) throw new Error("Payment not found");
      if (payment.status !== "SUCCESS") {
        throw new Error("Only successful payments can be reversed");
      }

      const paid = new Decimal(payment.invoice.paidAmount.toString())
        .minus(payment.amount.toString())
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const outstanding = new Decimal(payment.invoice.totalAmount.toString())
        .minus(paid)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const invoiceStatus =
        outstanding.isZero()
          ? "PAID"
          : payment.invoice.dueDate < new Date()
            ? "OVERDUE"
            : "CONFIRMED";

      const reversed = await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED", notes: `${payment.notes ? `${payment.notes}; ` : ""}Reversed: ${trimmedReason}` },
      });
      const invoice = await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: paid.toNumber(),
          outstandingAmount: outstanding.toNumber(),
          status: invoiceStatus,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: recordedByUserId,
          action: "PAYMENT_REVERSED",
          entityType: "Payment",
          entityId: payment.id,
          oldValues: { status: "SUCCESS", paidAmount: payment.invoice.paidAmount.toString() },
          newValues: { status: "REFUNDED", paidAmount: paid.toString(), reason: trimmedReason },
        },
      });

      return { payment: reversed, invoice };
    });
  }
}
