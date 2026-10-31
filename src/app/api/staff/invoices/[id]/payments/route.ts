import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import { getServerSession } from "@/lib/auth";
import { PaymentService } from "@/server/services/paymentService";

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
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
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
      recordedByUserId: session.userId,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to record payment" },
      { status: 400 }
    );
  }
}
