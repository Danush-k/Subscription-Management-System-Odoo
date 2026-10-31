import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paymentMethod = "UPI", amount, transactionRef, notes } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already fully paid" }, { status: 400 });
    }

    const outstanding = new Decimal(invoice.outstandingAmount.toString());
    const payAmt = amount ? new Decimal(amount) : outstanding;

    if (payAmt.greaterThan(outstanding)) {
      return NextResponse.json(
        { error: `Payment amount of ₹${payAmt} exceeds outstanding balance of ₹${outstanding}` },
        { status: 400 }
      );
    }

    // Generate payment number
    const count = await prisma.payment.count();
    const payNum = `PAY-2026-${String(count + 1).padStart(4, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber: payNum,
          invoiceId: id,
          customerId: invoice.customerId,
          paymentMethod: paymentMethod as any,
          amount: payAmt.toNumber(),
          paymentDate: new Date(),
          transactionRef: transactionRef || `TXN_${Date.now()}`,
          notes: notes || "Customer portal self-service settlement",
          status: "SUCCESS",
        },
      });

      const currentPaid = new Decimal(invoice.paidAmount.toString());
      const newPaid = currentPaid.plus(payAmt);
      const newOutstanding = outstanding.minus(payAmt);
      const isSettled = newOutstanding.isZero();

      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaid.toNumber(),
          outstandingAmount: newOutstanding.toNumber(),
          status: isSettled ? "PAID" : invoice.status,
        },
      });

      return { payment, invoice: updatedInvoice };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Invoice payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

