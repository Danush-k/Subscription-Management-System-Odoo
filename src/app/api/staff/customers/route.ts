import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session || !SubscriptionService.isStaffRole(session.role)) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const status = url.searchParams.get("status");
    const customers = await prisma.customer.findMany({
      where: {
        ...(status === "ACTIVE" || status === "INACTIVE" ? { status } : {}),
        ...(search
          ? {
              OR: [
                { customerNumber: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { taxId: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        subscriptions: { select: { status: true } },
        invoices: { select: { paidAmount: true } },
        _count: { select: { quotations: true, subscriptions: true, invoices: true, payments: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: customers.map((customer) => {
        const address =
          customer.billingAddress &&
          typeof customer.billingAddress === "object" &&
          !Array.isArray(customer.billingAddress)
            ? customer.billingAddress as { city?: string; state?: string }
            : {};
        return {
          id: customer.id,
          customerNumber: customer.customerNumber,
          name: customer.name,
          companyName: customer.companyName || customer.name,
          email: customer.email,
          phone: customer.phone,
          taxId: customer.taxId,
          city: address.city ?? null,
          state: address.state ?? null,
          status: customer.status,
          activeSubscriptions: customer.subscriptions.filter((subscription) => subscription.status === "ACTIVE").length,
          totalSpent: customer.invoices.reduce((total, invoice) => total + Number(invoice.paidAmount), 0),
          counts: customer._count,
        };
      }),
    });
  } catch (error) {
    console.error("[API Staff Customers Error]", error);
    return NextResponse.json({ success: false, error: "Unable to load customers" }, { status: 500 });
  }
}
