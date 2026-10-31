import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ success: false, error: "Access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        status: "QUOTATION",
      },
      include: { customer: true },
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${updated.quotationNumber} dispatched to ${updated.customer.name}!`,
      quotation: updated,
    });
  } catch (error: any) {
    console.error("[Admin Quotation Send Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch quotation" },
      { status: 400 }
    );
  }
}
