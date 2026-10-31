import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import { getServerSession } from "@/lib/auth";
import { PaymentService } from "@/server/services/paymentService";
import { SubscriptionService } from "@/server/services/subscriptionService";
import { createPaymentReceiptPdf } from "@/server/services/documentService";
import { dispatchEmail } from "@/server/services/emailDispatchService";
import { prisma } from "@/lib/prisma";

const paymentMethods: Record<string, PaymentMethod> = {
  "UPI / Instant Transfer": "UPI",
  "Bank Transfer (NEFT / RTGS)": "BANK_TRANSFER",
  "Cheque Deposit": "OTHER",
  "Cash at Counter": "CASH",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || !SubscriptionService.isStaffRole(session.role)) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const amount = body?.amount;
  const paymentMethod = paymentMethods[body?.paymentMethod];
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || !paymentMethod) {
    return NextResponse.json({ success: false, error: "Valid amount and payment method are required" }, { status: 400 });
  }

  try {
    const { id } = await params;
    const result = await PaymentService.recordPayment({
      invoiceId: id,
      amount,
      paymentMethod,
      transactionRef: typeof body.transactionRef === "string" ? body.transactionRef : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      recordedByUserId: session.userId,
    });
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true },
    });
    const emailResult = invoice
      ? await dispatchEmail({
          to: invoice.customer.email,
          toName: invoice.customer.name,
          subject: `Payment receipt ${result.payment.paymentNumber}`,
          htmlContent: `<p>Hello ${invoice.customer.name},</p><p>Payment <strong>${result.payment.paymentNumber}</strong> of ₹${amount.toFixed(2)} was recorded against invoice ${invoice.invoiceNumber}.</p>`,
          entityType: "Payment",
          entityId: result.payment.id,
          attachment: {
            name: `${result.payment.paymentNumber}.pdf`,
            content: createPaymentReceiptPdf({
              paymentNumber: result.payment.paymentNumber,
              invoiceNumber: invoice.invoiceNumber,
              customerName: invoice.customer.name,
              amount: amount.toFixed(2),
              paymentDate: result.payment.paymentDate,
              transactionRef: result.payment.transactionRef,
            }),
          },
        })
      : { sent: false, error: "Invoice customer not found" };
    return NextResponse.json({
      success: true,
      data: { ...result, emailSent: emailResult.sent, emailError: emailResult.error },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to record payment" },
      { status: 400 }
    );
  }
}
