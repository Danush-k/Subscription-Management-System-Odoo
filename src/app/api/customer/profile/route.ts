import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession();
    const queryEmail = searchParams.get("email");
    const queryCustomerId = searchParams.get("customerId");

    let customerWhere: { id?: string; email?: string } | undefined;
    if (session?.customerId) {
      customerWhere = { id: session.customerId };
    } else if (session?.email && session.role === "CUSTOMER") {
      customerWhere = { email: session.email };
    } else if (queryCustomerId) {
      customerWhere = { id: queryCustomerId };
    } else if (queryEmail) {
      customerWhere = { email: queryEmail };
    }

    const customer = await prisma.customer.findFirst({
      where: customerWhere,
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
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, companyName, phone, taxId, billingAddress, customerId } = body;
    const session = await getServerSession();

    let targetWhere: { id?: string; userId?: string; email?: string } | undefined;
    if (customerId) {
      targetWhere = { id: customerId };
    } else if (session?.customerId) {
      targetWhere = { id: session.customerId };
    } else if (email) {
      targetWhere = { email };
    } else if (session?.email) {
      targetWhere = { email: session.email };
    }

    const customer = await prisma.customer.findFirst({
      where: targetWhere,
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
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
