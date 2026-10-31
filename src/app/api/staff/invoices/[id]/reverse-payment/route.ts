import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { PaymentService } from "@/server/services/paymentService";
import { SubscriptionService } from "@/server/services/subscriptionService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || !SubscriptionService.isStaffRole(session.role)) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.reason !== "string" || !body.reason.trim()) {
    return NextResponse.json({ success: false, error: "A reversal reason is required" }, { status: 400 });
  }
  try {
    const { id } = await params;
    const result = await PaymentService.reversePayment(id, session.userId, body.reason);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to reverse payment" },
      { status: 400 }
    );
  }
}
