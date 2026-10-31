import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "billing@ssntechlabs.com";

    const customer = await prisma.customer.findFirst({
      where: { email },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, companyName, phone, taxId, billingAddress } = body;

    const targetEmail = email || "billing@ssntechlabs.com";

    const customer = await prisma.customer.findFirst({
      where: { email: targetEmail },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Update customer and associated user name if provided
    const updated = await prisma.$transaction(async (tx) => {
      if (name && customer.userId) {
        await tx.user.update({
          where: { id: customer.userId },
          data: { name },
        });
      }

      return tx.customer.update({
        where: { id: customer.id },
        data: {
          ...(name && { name }),
          ...(companyName && { companyName }),
          ...(phone && { phone }),
          ...(taxId && { taxId }),
          ...(billingAddress && { billingAddress }),
        },
      });
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
