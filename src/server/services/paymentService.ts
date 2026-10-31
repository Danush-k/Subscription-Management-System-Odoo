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
          transactionRef: transactionRef || null,
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

      return {
        payment,
        invoice: updatedInvoice,
        remainingBalance: newOutstanding.toNumber(),
        isFullyPaid,
      };
    });
  }
}
