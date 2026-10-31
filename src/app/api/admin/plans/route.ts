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
  } catch (error) {
    console.error("[API Admin Plans Error]", error);
    return NextResponse.json({ error: error.message || "Failed to load plans" }, { status: 500 });
  }
}
