import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "CUSTOMER" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { message, proposedDiscount, requestedPaymentTerms } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Negotiation note or message is required" }, { status: 400 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
    }

    if (session.role === "CUSTOMER" && session.customerId && quotation.customerId !== session.customerId) {
      return NextResponse.json({ success: false, error: "Unauthorized access to this quotation" }, { status: 403 });
    }

    if (quotation.status === "CONFIRMED") {
      return NextResponse.json({ success: false, error: "Cannot negotiate an already confirmed agreement" }, { status: 400 });
    }

    // Record the negotiation note in AuditLog
    const sender = quotation.customer.companyName || quotation.customer.name;
    const log = await prisma.auditLog.create({
      data: {
        entityType: "QUOTATION",
        entityId: quotation.id,
        userId: session.userId,
        action: "CUSTOMER_NEGOTIATION",
        newValues: {
          message: message.trim(),
          proposedDiscount: proposedDiscount ? Number(proposedDiscount) : undefined,
          requestedPaymentTerms: requestedPaymentTerms ? String(requestedPaymentTerms) : undefined,
          sender,
          role: "CUSTOMER",
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Negotiation feedback submitted. Staff account executive has been notified.",
      entry: {
        id: log.id,
        action: log.action,
        senderName: sender,
        senderRole: "CUSTOMER",
        message: message.trim(),
        proposedDiscount: proposedDiscount ? Number(proposedDiscount) : undefined,
        requestedPaymentTerms: requestedPaymentTerms ? String(requestedPaymentTerms) : undefined,
        createdAt: log.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Customer Quotation Negotiate Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit negotiation" },
      { status: 500 }
    );
  }
}

