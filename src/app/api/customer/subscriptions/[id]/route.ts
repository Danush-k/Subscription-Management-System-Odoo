import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "@/server/services/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
        histories: {
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          orderBy: { invoiceDate: "desc" },
          include: {
            payments: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const policy = {
      pauseAllowed: subscription.plan.pauseAllowed,
      earlyClosureAllowed: subscription.plan.earlyClosureAllowed,
      renewalAllowed: subscription.plan.renewalAllowed,
      autoCloseEnabled: subscription.plan.autoCloseEnabled,
    };

    if (action === "pause") {
      const check = SubscriptionService.validateTransition(
        subscription.status as any,
        "PAUSED",
        policy
      );
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason || "Pause not allowed" }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            status: "PAUSED",
            pausedAt: new Date(),
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: "PAUSED",
            action: "Paused by Customer",
            note: reason || "Customer self-service requested pause",
          },
        });

        return sub;
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === "resume") {
      const check = SubscriptionService.validateTransition(
        subscription.status as any,
        "ACTIVE",
        policy
      );
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason || "Resume not allowed" }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            status: "ACTIVE",
            pausedAt: null,
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: "ACTIVE",
            action: "Resumed by Customer",
            note: "Customer self-service reactivated subscription",
          },
        });

        return sub;
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === "cancel") {
      const check = SubscriptionService.validateTransition(
        subscription.status as any,
        "CLOSED",
        policy
      );
      if (!check.allowed) {
        return NextResponse.json({ error: check.reason || "Cancellation not allowed" }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            status: "CLOSED",
            closedAt: new Date(),
            cancellationReason: reason || "Customer requested early termination",
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: "CLOSED",
            action: "Cancelled by Customer",
            note: reason || "Customer initiated subscription termination",
          },
        });

        return sub;
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === "renew") {
      // Advance nextBillingDate by billingFrequency
      const currentNext = new Date(subscription.nextBillingDate);
      const newNext = new Date(currentNext);
      if (subscription.billingFrequency === "YEARLY") {
        newNext.setFullYear(newNext.getFullYear() + 1);
      } else {
        newNext.setMonth(newNext.getMonth() + 1);
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.subscription.update({
          where: { id },
          data: {
            nextBillingDate: newNext,
            lastBilledDate: new Date(),
          },
        });

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: id,
            previousStatus: subscription.status,
            newStatus: subscription.status,
            action: "Manual Early Renewal",
            note: `Renewed early. Next billing cycle advanced to ${newNext.toLocaleDateString("en-IN")}`,
          },
        });

        return sub;
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    if (action === "toggleAutoRenew") {
      const newAuto = !subscription.autoRenew;
      const updated = await prisma.subscription.update({
        where: { id },
        data: { autoRenew: newAuto },
      });

      return NextResponse.json({ success: true, subscription: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error("Subscription update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

