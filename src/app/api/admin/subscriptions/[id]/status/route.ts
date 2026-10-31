import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionService, SubscriptionState } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json(); // "PAUSE" | "RESUME" | "CLOSE"

    const sub = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    let targetStatus: SubscriptionState;
    if (action === "PAUSE") targetStatus = "PAUSED";
    else if (action === "RESUME") targetStatus = "ACTIVE";
    else if (action === "CLOSE") targetStatus = "CLOSED";
    else {
      return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
    }

    const validation = SubscriptionService.validateTransition(
      sub.status as SubscriptionState,
      targetStatus,
      {
        pauseAllowed: sub.plan.pauseAllowed,
        earlyClosureAllowed: sub.plan.earlyClosureAllowed,
        renewalAllowed: sub.plan.renewalAllowed,
        autoCloseEnabled: sub.plan.autoCloseEnabled,
      }
    );

    if (!validation.allowed) {
      return NextResponse.json({ error: validation.reason || "Transition not allowed by plan policy" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = { status: targetStatus };
      if (targetStatus === "PAUSED") updateData.pausedAt = new Date();
      if (targetStatus === "CLOSED") updateData.closedAt = new Date();

      const result = await tx.subscription.update({
        where: { id },
        data: updateData,
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          previousStatus: sub.status,
          newStatus: targetStatus,
          action: `STATUS_CHANGED_TO_${targetStatus}`,
          note: `Subscription status updated via Admin Portal`,
        },
      });

      return result;
    });

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error: any) {
    console.error("[API Admin Subscription Status Error]", error);
    return NextResponse.json({ error: error.message || "Failed to update subscription status" }, { status: 500 });
  }
}
