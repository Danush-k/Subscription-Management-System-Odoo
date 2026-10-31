import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export class InvoiceService {
  /**
   * Retrieves an invoice by ID with all relations
   */
  public static async getInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        subscription: true,
        lines: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });
  }

  /**
   * Confirms a DRAFT invoice, making it finalized and open for payments
   */
  public static async confirmInvoice(id: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status !== "DRAFT") {
      throw new Error(`Cannot confirm invoice in status ${invoice.status}`);
    }

    return prisma.invoice.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });
  }

  /**
   * Cancels an invoice if it has no confirmed payments
   */
  public static async cancelInvoice(id: string, reason?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!invoice) throw new Error("Invoice not found");

    const paidTotal = new Decimal(invoice.paidAmount.toString());
    if (paidTotal.greaterThan(0)) {
      throw new Error("Cannot cancel an invoice with existing recorded payments");
    }

    if (invoice.status === "PAID") {
      throw new Error("Cannot cancel a paid invoice");
    }

    return prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  /**
   * Updates invoice payment amounts and transitions status to PAID if fully settled
   */
  public static async applyPaymentToInvoice(
    invoiceId: string,
    paymentAmount: number | string | Decimal
  ) {
    const payment = new Decimal(paymentAmount);
    if (payment.isNegative() || payment.isZero()) {
      throw new Error("Payment amount must be greater than zero");
    }

    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new Error("Invoice not found");

      if (invoice.status === "CANCELLED") {
        throw new Error("Cannot apply payment to a cancelled invoice");
      }
      if (invoice.status === "PAID") {
        throw new Error("Invoice is already fully paid");
      }

      const total = new Decimal(invoice.totalAmount.toString());
      const currentPaid = new Decimal(invoice.paidAmount.toString());
      const currentOutstanding = new Decimal(invoice.outstandingAmount.toString());

      if (payment.greaterThan(currentOutstanding)) {
        throw new Error(
          `Payment of ₹${payment.toFixed(2)} exceeds current outstanding balance of ₹${currentOutstanding.toFixed(2)}`
        );
      }

      const newPaid = currentPaid.plus(payment).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const newOutstanding = total.minus(newPaid).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      const isFullyPaid = newOutstanding.isZero();
      const newStatus = isFullyPaid ? "PAID" : "CONFIRMED";

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaid.toNumber(),
          outstandingAmount: newOutstanding.toNumber(),
          status: newStatus,
        },
      });
    });
  }
}
