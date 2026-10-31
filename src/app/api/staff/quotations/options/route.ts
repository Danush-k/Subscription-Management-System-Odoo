import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  const [customers, plans, products] = await Promise.all([
    prisma.customer.findMany({
      where: { status: "ACTIVE" },
      orderBy: { companyName: "asc" },
      select: { id: true, name: true, companyName: true, email: true, taxId: true },
    }),
    prisma.subscriptionPlan.findMany({
      where: { status: "ACTIVE", OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true, subscriptionPrice: true, billingFrequency: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, salesPrice: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      customers,
      plans: plans.map((plan) => ({ ...plan, subscriptionPrice: plan.subscriptionPrice.toString() })),
      products: products.map((product) => ({ ...product, salesPrice: product.salesPrice.toString() })),
    },
  });
}
