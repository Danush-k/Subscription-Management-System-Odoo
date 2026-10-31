import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  if (!session || !SubscriptionService.isStaffRole(session.role)) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, companyName: true, email: true } },
        plan: {
          select: {
            name: true,
            billingFrequency: true,
            pauseAllowed: true,
            earlyClosureAllowed: true,
            renewalAllowed: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: subscriptions.map((subscription) => ({
        id: subscription.id,
        subscriptionNumber: subscription.subscriptionNumber,
        customer: subscription.customer.companyName || subscription.customer.name,
        customerEmail: subscription.customer.email,
        plan: subscription.plan.name,
        status: subscription.status,
        billingFrequency: subscription.billingFrequency,
        startDate: subscription.startDate.toISOString(),
        nextBillingDate: subscription.nextBillingDate.toISOString(),
        pausedAt: subscription.pausedAt?.toISOString() ?? null,
        closedAt: subscription.closedAt?.toISOString() ?? null,
        policies: {
          pauseAllowed: subscription.plan.pauseAllowed,
          earlyClosureAllowed: subscription.plan.earlyClosureAllowed,
          renewalAllowed: subscription.plan.renewalAllowed,
        },
      })),
    });
  } catch (error) {
    console.error("[API Staff Subscriptions Error]", error);
    return NextResponse.json(
      { success: false, error: "Unable to load subscriptions" },
      { status: 500 }
    );
  }
}
