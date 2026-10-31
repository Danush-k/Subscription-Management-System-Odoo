import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/server/services/paymentService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: "desc" },
      include: {
        customer: true,
        invoice: true,
      },
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      transactionRef: p.transactionRef || p.paymentNumber,
      invoiceNumber: p.invoice?.invoiceNumber || "—",
      customerName: p.customer.companyName || p.customer.name,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      paidAt: p.paymentDate.toISOString().replace("T", " ").substring(0, 16),
      status: p.status === "SUCCESS" ? "SETTLED" : "PENDING",
      notes: p.notes,
    }));

    return NextResponse.json({ payments: formatted });
  } catch (error) {
    console.error("[API Admin Payments Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load payments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amount, paymentMethod = "BANK_TRANSFER", transactionRef, notes } = body;

    const result = await PaymentService.recordPayment({
      invoiceId,
      amount: Number(amount),
      paymentMethod,
      transactionRef,
      notes,
    });

    return NextResponse.json({ success: true, payment: result.payment, invoice: result.invoice });
  } catch (error) {
    console.error("[API Admin Record Payment Error]", error);
    return NextResponse.json({ error: error.message || "Failed to record payment" }, { status: 500 });
  }
}
