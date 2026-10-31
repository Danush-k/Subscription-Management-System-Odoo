import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionService, BillingFrequencyType } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    const formatted = subscriptions.map((sub) => {
      const line = sub.lines[0];
      const variantName = line?.variant?.variantName || line?.product?.name || "Standard";
      const totalAmount = line ? Number(line.total) : Number(sub.plan.subscriptionPrice);

      return {
        id: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerName: sub.customer.companyName || sub.customer.name,
        customerEmail: sub.customer.email,
        planName: sub.plan.name,
        variantName,
        amount: totalAmount,
        currency: "INR",
        billingFrequency: sub.billingFrequency,
        status: sub.status,
        startDate: sub.startDate.toISOString().split("T")[0],
        nextBillingDate: sub.nextBillingDate ? sub.nextBillingDate.toISOString().split("T")[0] : "—",
        pauseAllowed: sub.plan.pauseAllowed,
        earlyClosureAllowed: sub.plan.earlyClosureAllowed,
      };
    });

    return NextResponse.json({ subscriptions: formatted });
  } catch (error) {
    console.error("[API Admin Subscriptions Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load subscriptions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, planId, variantId, taxId, billingFrequency = "MONTHLY", paymentTerms = "NET_30", status = "ACTIVE" } = body;

    const [customer, plan] = await Promise.all([
      prisma.customer.findFirst({
        where: { OR: [{ id: customerId }, { customerNumber: customerId }] },
      }),
      prisma.subscriptionPlan.findFirst({
        where: { OR: [{ id: planId }, { planCode: planId }] },
      }),
    ]);

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    let taxRate = 18.0;
    let taxType = "EXCLUSIVE";
    if (taxId) {
      const taxObj = await prisma.tax.findFirst({
        where: { OR: [{ id: taxId }, { taxCode: taxId }] },
      });
      if (taxObj) {
        taxRate = Number(taxObj.percentage);
        taxType = taxObj.taxType;
      }
    }

    const subCount = await prisma.subscription.count();
    const subNumber = `SUB-${new Date().getFullYear()}-${String(subCount + 1).padStart(4, "0")}`;

    const startDate = new Date();
    const nextBillingDate = SubscriptionService.calculateNextBillingDate(
      startDate,
      (billingFrequency || plan.billingFrequency) as BillingFrequencyType
    );

    const subscription = await prisma.$transaction(async (tx) => {
      const newSub = await tx.subscription.create({
        data: {
          subscriptionNumber: subNumber,
          customerId: customer.id,
          planId: plan.id,
          status: status || "ACTIVE",
          billingFrequency: (billingFrequency || plan.billingFrequency) as any,
          paymentTerms: paymentTerms || "NET_30",
          startDate,
          nextBillingDate,
          autoRenew: true,
        },
      });

      // Find product for line
      const product = await tx.product.findFirst();
      if (product) {
        const unitPrice = Number(plan.subscriptionPrice);
        let lineTax = 0;
        let lineTotal = unitPrice;

        if (taxType === "EXCLUSIVE") {
          lineTax = Math.round(((unitPrice * taxRate) / 100) * 100) / 100;
          lineTotal = unitPrice + lineTax;
        }

        await tx.subscriptionLine.create({
          data: {
            subscriptionId: newSub.id,
            productId: product.id,
            variantId: variantId || null,
            quantity: 1,
            unitPrice: plan.subscriptionPrice,
            taxRate: taxRate,
            subtotal: plan.subscriptionPrice,
            total: lineTotal,
          },
        });
      }

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: newSub.id,
          previousStatus: "DRAFT",
          newStatus: status || "ACTIVE",
          action: "SUBSCRIPTION_CREATED",
          note: `New subscription provisioned via Admin Console for ${customer.name}`,
        },
      });

      return newSub;
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("[API Create Subscription Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
