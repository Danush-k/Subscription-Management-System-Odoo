import { PrismaClient } from "@prisma/client";
import Decimal from "decimal.js";

const prisma = new PrismaClient();

function nextBillingDate(date, frequency) {
  const next = new Date(date);
  if (frequency === "DAILY") next.setDate(next.getDate() + 1);
  else if (frequency === "WEEKLY") next.setDate(next.getDate() + 7);
  else if (frequency === "YEARLY") next.setFullYear(next.getFullYear() + 1);
  else {
    const day = next.getDate();
    next.setMonth(next.getMonth() + 1);
    if (next.getDate() !== day) next.setDate(0);
  }
  return next;
}

async function processSubscription(subscription, now) {
  const periodStart = new Date(subscription.nextBillingDate);
  const periodEnd = nextBillingDate(periodStart, subscription.billingFrequency);
  const existing = await prisma.billingHistory.findUnique({
    where: { subscriptionId_billingPeriodStart: { subscriptionId: subscription.id, billingPeriodStart: periodStart } },
  });
  if (existing?.status === "SUCCESS") return { skipped: true };

  let subtotal = new Decimal(0);
  let taxAmount = new Decimal(0);
  let discountAmount = new Decimal(0);
  const lines = subscription.lines.map((line) => {
    const lineSubtotal = Decimal.max(
      new Decimal(line.quantity).times(line.unitPrice.toString()).minus(line.discountAmount.toString()),
      0
    );
    const lineTax = lineSubtotal.times(line.taxRate.toString()).dividedBy(100).toDecimalPlaces(2);
    subtotal = subtotal.plus(lineSubtotal);
    taxAmount = taxAmount.plus(lineTax);
    discountAmount = discountAmount.plus(line.discountAmount.toString());
    return {
      productId: line.productId,
      variantId: line.variantId,
      productName: line.product.name,
      variantName: line.variant?.variantName ?? null,
      quantity: line.quantity,
      unitPrice: Number(line.unitPrice),
      taxRate: Number(line.taxRate),
      taxAmount: lineTax.toNumber(),
      discountAmount: Number(line.discountAmount),
      subtotal: lineSubtotal.toNumber(),
      total: lineSubtotal.plus(lineTax).toNumber(),
    };
  });
  const total = subtotal.plus(taxAmount).toDecimalPlaces(2);
  const dueDate = new Date(now);
  if (subscription.paymentTerms === "NET_15") dueDate.setDate(dueDate.getDate() + 15);
  else if (subscription.paymentTerms === "NET_30") dueDate.setDate(dueDate.getDate() + 30);
  else if (subscription.paymentTerms === "NET_60") dueDate.setDate(dueDate.getDate() + 60);
  const invoiceNumber = `INV-${now.getFullYear()}-${String((await prisma.invoice.count()) + 1).padStart(5, "0")}`;

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: subscription.customerId,
        subscriptionId: subscription.id,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        invoiceDate: now,
        dueDate,
        subtotal: subtotal.toNumber(),
        taxAmount: taxAmount.toNumber(),
        discountAmount: discountAmount.toNumber(),
        totalAmount: total.toNumber(),
        outstandingAmount: total.toNumber(),
        customerSnapshot: {
          name: subscription.customer.name,
          email: subscription.customer.email,
          companyName: subscription.customer.companyName,
          billingAddress: subscription.customer.billingAddress,
          taxId: subscription.customer.taxId,
        },
        lines: { create: lines },
      },
    });
    await tx.subscription.update({
      where: { id: subscription.id },
      data: { lastBilledDate: now, nextBillingDate: periodEnd },
    });
    await tx.billingHistory.create({
      data: {
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        scheduledDate: periodStart,
        executedDate: now,
        status: "SUCCESS",
        attemptCount: 1,
      },
    });
  });
  return { invoiceNumber };
}

async function run() {
  const now = new Date();
  const overdue = await prisma.invoice.updateMany({
    where: { status: { in: ["CONFIRMED", "OVERDUE"] }, dueDate: { lt: now }, outstandingAmount: { gt: 0 } },
    data: { status: "OVERDUE" },
  });
  const due = await prisma.subscription.findMany({
    where: { status: "ACTIVE", nextBillingDate: { lte: now } },
    include: { customer: true, lines: { include: { product: true, variant: true } } },
  });
  const results = [];
  for (const subscription of due) {
    try {
      results.push({ subscription: subscription.subscriptionNumber, ...(await processSubscription(subscription, now)) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown billing failure";
      await prisma.billingHistory.create({
        data: {
          subscriptionId: subscription.id,
          billingPeriodStart: subscription.nextBillingDate,
          billingPeriodEnd: nextBillingDate(subscription.nextBillingDate, subscription.billingFrequency),
          scheduledDate: subscription.nextBillingDate,
          executedDate: now,
          status: "FAILED",
          attemptCount: 1,
          failureReason: message,
        },
      }).catch(() => undefined);
      results.push({ subscription: subscription.subscriptionNumber, failed: true, error: message });
    }
  }
  console.log(JSON.stringify({ executedAt: now.toISOString(), overdueMarked: overdue.count, dueProcessed: results.length, results }, null, 2));
}

run().catch((error) => {
  console.error("[billing-worker] fatal error", error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
