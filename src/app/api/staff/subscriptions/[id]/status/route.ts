import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionService, SubscriptionState } from "@/server/services/subscriptionService";

const actions = {
  ACTIVATE: "ACTIVE",
  PAUSE: "PAUSED",
  RESUME: "ACTIVE",
  CLOSE: "CLOSED",
} as const;

type Action = keyof typeof actions;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = body?.action as Action;
    if (!(action in actions)) {
      return NextResponse.json({ success: false, error: "Invalid subscription action" }, { status: 400 });
    }

    const { id } = await params;
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!subscription) {
      return NextResponse.json({ success: false, error: "Subscription not found" }, { status: 404 });
    }

    const targetStatus = actions[action] as SubscriptionState;
    const validation = SubscriptionService.validateTransition(
      subscription.status as SubscriptionState,
      targetStatus,
      {
        pauseAllowed: subscription.plan.pauseAllowed,
        earlyClosureAllowed: subscription.plan.earlyClosureAllowed,
        renewalAllowed: subscription.plan.renewalAllowed,
        autoCloseEnabled: subscription.plan.autoCloseEnabled,
      }
    );
    if (!validation.allowed) {
      return NextResponse.json({ success: false, error: validation.reason }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const data: {
        status: SubscriptionState;
        pausedAt?: Date | null;
        closedAt?: Date | null;
      } = { status: targetStatus };

      if (targetStatus === "PAUSED") data.pausedAt = new Date();
      if (targetStatus === "ACTIVE") data.pausedAt = null;
      if (targetStatus === "CLOSED") data.closedAt = new Date();

      const result = await tx.subscription.update({ where: { id }, data });
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: id,
          previousStatus: subscription.status,
          newStatus: targetStatus,
          action: `STAFF_${action}`,
          performedByUserId: session.userId,
          note: typeof body.note === "string" ? body.note : null,
        },
      });
      return result;
    });

    return NextResponse.json({ success: true, data: { subscription: updated } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to update subscription" },
      { status: 400 }
    );
  }
}
