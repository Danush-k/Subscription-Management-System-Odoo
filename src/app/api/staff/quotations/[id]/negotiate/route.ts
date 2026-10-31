import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action = "REPLY", message, approvedDiscount, approvedDiscountPercent } = body;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!quotation) {
      return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
    }

    let discountAmountToApply = 0;
    if (approvedDiscountPercent !== undefined && Number(approvedDiscountPercent) > 0) {
      discountAmountToApply = (Number(quotation.subtotal) * Number(approvedDiscountPercent)) / 100;
    } else if (approvedDiscount !== undefined && Number(approvedDiscount) > 0) {
      discountAmountToApply = Number(approvedDiscount);
    }

    let defaultMsg = message;
    if (action === "APPROVE") {
      const subtotal = Number(quotation.subtotal);
      const taxRate = subtotal > 0 ? (Number(quotation.taxAmount) / subtotal) : 0.18;
      const taxableAfterDiscount = Math.max(0, subtotal - discountAmountToApply);
      const taxAmount = taxableAfterDiscount * taxRate;
      const totalAmount = taxableAfterDiscount + taxAmount;

      await prisma.quotation.update({
        where: { id: quotation.id },
        data: {
          discountAmount: discountAmountToApply,
          taxAmount,
          totalAmount,
        },
      });

      defaultMsg = message || `Sales team approved ${approvedDiscountPercent || ""}% discount (Savings: ₹${discountAmountToApply.toLocaleString("en-IN")}). Revised payable total is ₹${totalAmount.toLocaleString("en-IN")}.`;
    } else if (action === "REJECT") {
      defaultMsg = message || "Sales team declined the counter-offer. The standard commercial pricing on file remains valid.";
    }

    if (!defaultMsg || !defaultMsg.trim()) {
      return NextResponse.json({ success: false, error: "Response message or action is required" }, { status: 400 });
    }

    const sender = session.name || "Brightloop Account Executive";
    const log = await prisma.auditLog.create({
      data: {
        entityType: "QUOTATION",
        entityId: quotation.id,
        userId: session.userId,
        action: action === "APPROVE" ? "STAFF_DISCOUNT_APPROVED" : action === "REJECT" ? "STAFF_DISCOUNT_REJECTED" : "STAFF_NEGOTIATION_RESPONSE",
        newValues: {
          action,
          message: defaultMsg.trim(),
          approvedDiscount: discountAmountToApply > 0 ? discountAmountToApply : undefined,
          approvedDiscountPercent: approvedDiscountPercent !== undefined ? Number(approvedDiscountPercent) : undefined,
          sender,
          role: "STAFF",
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: action === "APPROVE" ? "Counter-offer approved and proposal price updated!" : action === "REJECT" ? "Counter-offer declined." : "Response sent to client.",
      entry: {
        id: log.id,
        action: log.action,
        senderName: sender,
        senderRole: "STAFF",
        message: defaultMsg.trim(),
        approvedDiscount: discountAmountToApply > 0 ? discountAmountToApply : undefined,
        createdAt: log.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Staff Quotation Negotiate Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit staff negotiation response" },
      { status: 500 }
    );
  }
}
