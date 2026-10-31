import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = plans.map((p) => ({
      id: p.id,
      planCode: p.planCode,
      name: p.name,
      description: p.description || "",
      frequency: p.billingFrequency,
      price: Number(p.subscriptionPrice),
      trialDays: 14,
      pauseAllowed: p.pauseAllowed,
      earlyClosureAllowed: p.earlyClosureAllowed,
      autoClose: p.autoCloseEnabled,
      monthEndBilling: true,
      status: p.status,
    }));

    return NextResponse.json({ plans: formatted });
  } catch (error: any) {
    console.error("[API Admin Plans Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load plans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      planCode,
      name,
      description,
      frequency = "MONTHLY",
      price,
      pauseAllowed = true,
      earlyClosureAllowed = true,
      autoClose = true,
      renewalAllowed = true,
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Plan name and subscription price are required" }, { status: 400 });
    }

    const code = planCode
      ? planCode.toUpperCase().trim()
      : `PLAN-${name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, "P")}-${String(Date.now()).slice(-4)}`;

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        planCode: code,
        name: name.trim(),
        description: description || "",
        subscriptionPrice: Number(price),
        billingFrequency: frequency,
        pauseAllowed: Boolean(pauseAllowed),
        earlyClosureAllowed: Boolean(earlyClosureAllowed),
        autoCloseEnabled: Boolean(autoClose),
        renewalAllowed: Boolean(renewalAllowed),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error: any) {
    console.error("[API Create Plan Error]", error);
    return NextResponse.json({ error: error.message || "Failed to create plan" }, { status: 500 });
  }
}
