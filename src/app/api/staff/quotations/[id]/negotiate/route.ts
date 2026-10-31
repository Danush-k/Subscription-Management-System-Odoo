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
    const { message, approvedDiscount } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Response message is required" }, { status: 400 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!quotation) {
      return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
    }

    // If an approved discount was granted, adjust quotation subtotal/tax/total
    if (approvedDiscount !== undefined && Number(approvedDiscount) >= 0) {
      const disc = Number(approvedDiscount);
      const subtotal = Number(quotation.subtotal);
      const taxRate = subtotal > 0 ? (Number(quotation.taxAmount) / subtotal) : 0.18;
      const taxableAfterDiscount = Math.max(0, subtotal - disc);
      const taxAmount = taxableAfterDiscount * taxRate;
      const totalAmount = taxableAfterDiscount + taxAmount;

      await prisma.quotation.update({
        where: { id: quotation.id },
        data: {
          discountAmount: disc,
          taxAmount,
          totalAmount,
        },
      });
    }

    const sender = session.name || "Brightloop Account Executive";
    const log = await prisma.auditLog.create({
      data: {
        entityType: "QUOTATION",
        entityId: quotation.id,
        userId: session.userId,
        action: "STAFF_NEGOTIATION_RESPONSE",
        newValues: {
          message: message.trim(),
          approvedDiscount: approvedDiscount !== undefined ? Number(approvedDiscount) : undefined,
          sender,
          role: "STAFF",
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staff response sent to client.",
      entry: {
        id: log.id,
        action: log.action,
        senderName: sender,
        senderRole: "STAFF",
        message: message.trim(),
        approvedDiscount: approvedDiscount !== undefined ? Number(approvedDiscount) : undefined,
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

