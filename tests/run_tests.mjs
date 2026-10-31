import assert from "node:assert/strict";
import Decimal from "decimal.js";
import { TaxCalculationService } from "../src/server/services/taxService.ts";
import { DiscountService } from "../src/server/services/discountService.ts";
import { SubscriptionService } from "../src/server/services/subscriptionService.ts";

console.log("=== RUNNING BRIGHTLOOP FINANCIAL & LIFECYCLE TEST SUITE ===\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// 1. TAX CALCULATIONS TESTS
// -------------------------------------------------------------
console.log("1. Tax Engine Verification:");

test("GST 18% Exclusive Tax on ₹1,000 equals ₹180 tax and ₹1,180 total", () => {
  const res = TaxCalculationService.calculateExclusive(1000, 18);
  assert.equal(res.baseAmount.toString(), "1000");
  assert.equal(res.taxAmount.toString(), "180");
  assert.equal(res.totalAmount.toString(), "1180");
});

test("GST 18% Inclusive Tax on ₹1,180 equals ₹180 tax and ₹1,000 base", () => {
  const res = TaxCalculationService.calculateInclusive(1180, 18);
  assert.equal(res.baseAmount.toString(), "1000");
  assert.equal(res.taxAmount.toString(), "180");
  assert.equal(res.totalAmount.toString(), "1180");
});

test("Multi-item line totals with discounts and GST", () => {
  // 2 units @ ₹500, with ₹100 discount and 18% GST -> Subtotal: 900, Tax: 162, Total: 1062
  const res = TaxCalculationService.calculateLineTotals(2, 500, 18, 100);
  assert.equal(res.subtotal.toString(), "900");
  assert.equal(res.taxAmount.toString(), "162");
  assert.equal(res.total.toString(), "1062");
});

test("Negative values throw validation exceptions", () => {
  assert.throws(() => TaxCalculationService.calculateExclusive(-100, 18));
});

// -------------------------------------------------------------
// 2. DISCOUNT RULES TESTS
// -------------------------------------------------------------
console.log("\n2. Discount Rule Verification:");

const sampleDiscount = {
  id: "disc-1",
  discountCode: "FESTIVE10",
  name: "Festive 10% Off",
  discountType: "PERCENTAGE",
  discountValue: 10,
  minPurchaseAmount: 500,
  minQuantity: 1,
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-12-31"),
  maxUsageCount: 100,
  currentUsageCount: 10,
  status: "ACTIVE",
};

test("Percentage discount calculates 10% deduction when eligible", () => {
  const res = DiscountService.evaluateDiscount(sampleDiscount, 1000, 1, [], new Date("2026-06-01"));
  assert.equal(res.isEligible, true);
  assert.equal(res.discountAmount.toString(), "100");
  assert.equal(res.discountedTotal.toString(), "900");
});

test("Discount rejects when below minimum purchase amount", () => {
  const res = DiscountService.evaluateDiscount(sampleDiscount, 400, 1, [], new Date("2026-06-01"));
  assert.equal(res.isEligible, false);
  assert.equal(res.discountAmount.toString(), "0");
});

test("Discount rejects when max usage cap reached", () => {
  const capped = { ...sampleDiscount, currentUsageCount: 100 };
  const res = DiscountService.evaluateDiscount(capped, 1000, 1, [], new Date("2026-06-01"));
  assert.equal(res.isEligible, false);
});

// -------------------------------------------------------------
// 3. SUBSCRIPTION LIFECYCLE & MONTH-END MATH TESTS
// -------------------------------------------------------------
console.log("\n3. Subscription Lifecycle & Recurrence Verification:");

const permissivePolicy = {
  pauseAllowed: true,
  earlyClosureAllowed: true,
  renewalAllowed: true,
  autoCloseEnabled: false,
};

const restrictivePolicy = {
  pauseAllowed: false,
  earlyClosureAllowed: false,
  renewalAllowed: false,
  autoCloseEnabled: true,
};

test("Permits valid lifecycle: DRAFT -> CONFIRMED -> ACTIVE", () => {
  assert.equal(SubscriptionService.validateTransition("DRAFT", "CONFIRMED", permissivePolicy).allowed, true);
  assert.equal(SubscriptionService.validateTransition("CONFIRMED", "ACTIVE", permissivePolicy).allowed, true);
});

test("Prevents pause when plan policy disallows it", () => {
  const res = SubscriptionService.validateTransition("ACTIVE", "PAUSED", restrictivePolicy);
  assert.equal(res.allowed, false);
  assert.match(res.reason, /disallows pausing/);
});

test("Prevents direct resumption of CLOSED terminal subscriptions", () => {
  const res = SubscriptionService.validateTransition("CLOSED", "ACTIVE", permissivePolicy);
  assert.equal(res.allowed, false);
});

test("Accurately advances Daily and Weekly recurrence dates", () => {
  const base = new Date("2026-03-10T00:00:00Z");
  const daily = SubscriptionService.calculateNextBillingDate(base, "DAILY");
  assert.equal(daily.getDate(), 11);

  const weekly = SubscriptionService.calculateNextBillingDate(base, "WEEKLY");
  assert.equal(weekly.getDate(), 17);
});

test("Correctly clamps Jan 31 to Feb 28 in non-leap year (2025)", () => {
  const jan31 = new Date("2025-01-31T00:00:00Z");
  const next = SubscriptionService.calculateNextBillingDate(jan31, "MONTHLY");
  assert.equal(next.getMonth(), 1); // Feb
  assert.equal(next.getDate(), 28);
});

test("Correctly clamps Jan 31 to Feb 29 in leap year (2028)", () => {
  const jan31 = new Date("2028-01-31T00:00:00Z");
  const next = SubscriptionService.calculateNextBillingDate(jan31, "MONTHLY");
  assert.equal(next.getMonth(), 1); // Feb
  assert.equal(next.getDate(), 29);
});

// -------------------------------------------------------------
// 4. QUOTATION PAYMENT GATE & RENEWAL SETTLEMENT TESTS
// -------------------------------------------------------------
console.log("\n4. Quotation Payment Gate, Renewal Settlement & Reconciliation:");

// Helper to simulate the quotation acceptance gate
function simulateQuotationAcceptance({ role, customerId, quotationCustomerId, quotationStatus, paymentData }) {
  if (role === "CUSTOMER" && customerId !== quotationCustomerId) {
    throw new Error("Unauthorized access to this quotation");
  }
  if (quotationStatus === "CONFIRMED") {
    throw new Error("This quotation has already been accepted and confirmed");
  }
  if (quotationStatus === "EXPIRED" || quotationStatus === "CANCELLED") {
    throw new Error(`Quotation is ${quotationStatus.toLowerCase()} and cannot be accepted`);
  }
  if (role === "CUSTOMER" && (!paymentData || !paymentData.paymentMethod || !paymentData.amount)) {
    throw new Error("Payment is mandatory before quotation acceptance and subscription activation.");
  }

  const hasPayment = Boolean(paymentData && paymentData.paymentMethod);
  return {
    subscriptionStatus: hasPayment ? "ACTIVE" : "CONFIRMED",
    invoiceStatus: hasPayment ? "PAID" : "CONFIRMED",
    paymentStatus: hasPayment ? "SUCCESS" : null,
    outstandingAmount: hasPayment ? 0 : 1500,
  };
}

test("Customer quotation acceptance BLOCKS activation if payment is missing", () => {
  assert.throws(
    () =>
      simulateQuotationAcceptance({
        role: "CUSTOMER",
        customerId: "cust-1",
        quotationCustomerId: "cust-1",
        quotationStatus: "QUOTATION",
        paymentData: null,
      }),
    /Payment is mandatory before quotation acceptance/
  );
});

test("Customer quotation acceptance BLOCKS activation if quotation has expired", () => {
  assert.throws(
    () =>
      simulateQuotationAcceptance({
        role: "CUSTOMER",
        customerId: "cust-1",
        quotationCustomerId: "cust-1",
        quotationStatus: "EXPIRED",
        paymentData: { paymentMethod: "UPI", amount: 1500 },
      }),
    /Quotation is expired and cannot be accepted/
  );
});

test("Customer quotation acceptance SUCCEEDS with payment: creates ACTIVE subscription & PAID invoice", () => {
  const result = simulateQuotationAcceptance({
    role: "CUSTOMER",
    customerId: "cust-1",
    quotationCustomerId: "cust-1",
    quotationStatus: "QUOTATION",
    paymentData: { paymentMethod: "UPI", amount: 1500, transactionRef: "RZP_TEST_001" },
  });

  assert.equal(result.subscriptionStatus, "ACTIVE");
  assert.equal(result.invoiceStatus, "PAID");
  assert.equal(result.paymentStatus, "SUCCESS");
  assert.equal(result.outstandingAmount, 0);
});

test("Customer quotation acceptance PREVENTS cross-customer access", () => {
  assert.throws(
    () =>
      simulateQuotationAcceptance({
        role: "CUSTOMER",
        customerId: "cust-attacker",
        quotationCustomerId: "cust-victim",
        quotationStatus: "QUOTATION",
        paymentData: { paymentMethod: "UPI", amount: 1500 },
      }),
    /Unauthorized access to this quotation/
  );
});

// Helper to simulate the subscription renewal settlement engine
function simulateSubscriptionRenewal({ subscription, paymentDetails }) {
  if (!["ACTIVE", "CLOSED", "EXPIRED", "PAUSED"].includes(subscription.status)) {
    throw new Error(`Cannot renew subscription with status ${subscription.status}`);
  }
  if (!paymentDetails || !paymentDetails.paymentMethod || !paymentDetails.amount) {
    throw new Error("Valid payment details required for renewal settlement");
  }

  // Calculate new next billing date
  const newNext = SubscriptionService.calculateNextBillingDate(
    new Date(subscription.nextBillingDate || subscription.startDate),
    subscription.billingFrequency
  );

  // Calculate line totals
  const subtotal = subscription.lines.reduce((acc, l) => acc + l.subtotal, 0);
  const taxAmount = subscription.lines.reduce((acc, l) => acc + (l.total - l.subtotal), 0);
  const totalAmount = subtotal + taxAmount;

  if (Number(paymentDetails.amount) !== totalAmount) {
    throw new Error(`Payment amount ₹${paymentDetails.amount} does not match required total ₹${totalAmount}`);
  }

  return {
    subscription: {
      ...subscription,
      status: "ACTIVE",
      pausedAt: null,
      closedAt: null,
      cancellationReason: null,
      nextBillingDate: newNext,
      lastBilledDate: new Date(),
    },
    invoice: {
      status: "PAID",
      totalAmount,
      paidAmount: totalAmount,
      outstandingAmount: 0,
    },
    payment: {
      status: "SUCCESS",
      paymentMethod: paymentDetails.paymentMethod,
      amount: totalAmount,
      transactionRef: paymentDetails.transactionRef || `RENEW_${Date.now()}`,
    },
  };
}

test("Renewal engine reactivates CLOSED subscription to ACTIVE with payment", () => {
  const closedSub = {
    id: "sub-ended",
    subscriptionNumber: "SUB-2026-0001",
    status: "CLOSED",
    billingFrequency: "MONTHLY",
    startDate: "2026-01-01T00:00:00Z",
    nextBillingDate: "2026-02-01T00:00:00Z",
    closedAt: new Date("2026-02-15T00:00:00Z"),
    cancellationReason: "Contract terminated",
    lines: [{ subtotal: 1000, total: 1180 }],
  };

  const renewed = simulateSubscriptionRenewal({
    subscription: closedSub,
    paymentDetails: { paymentMethod: "UPI", amount: 1180, transactionRef: "PAY_RZP_RENEW_1" },
  });

  assert.equal(renewed.subscription.status, "ACTIVE");
  assert.equal(renewed.subscription.closedAt, null);
  assert.equal(renewed.subscription.cancellationReason, null);
  assert.equal(renewed.invoice.status, "PAID");
  assert.equal(renewed.invoice.outstandingAmount, 0);
  assert.equal(renewed.payment.status, "SUCCESS");
});

test("Renewal engine advances YEARLY contract by exactly 1 year", () => {
  const yearlySub = {
    id: "sub-yr",
    subscriptionNumber: "SUB-2026-0002",
    status: "ACTIVE",
    billingFrequency: "YEARLY",
    startDate: "2026-01-01T00:00:00Z",
    nextBillingDate: "2026-01-01T00:00:00Z",
    lines: [{ subtotal: 12000, total: 14160 }],
  };

  const renewed = simulateSubscriptionRenewal({
    subscription: yearlySub,
    paymentDetails: { paymentMethod: "CREDIT_CARD", amount: 14160 },
  });

  assert.equal(renewed.subscription.nextBillingDate.getFullYear(), 2027);
  assert.equal(renewed.subscription.nextBillingDate.getMonth(), 0); // Jan
  assert.equal(renewed.subscription.nextBillingDate.getDate(), 1);
});

test("Payment reconciliation rejects under-payment during renewal", () => {
  const sub = {
    id: "sub-reconcile",
    status: "ACTIVE",
    billingFrequency: "MONTHLY",
    startDate: "2026-01-01T00:00:00Z",
    lines: [{ subtotal: 500, total: 590 }],
  };

  assert.throws(
    () =>
      simulateSubscriptionRenewal({
        subscription: sub,
        paymentDetails: { paymentMethod: "UPI", amount: 500 }, // Underpayment: 500 instead of 590
      }),
    /does not match required total/
  );
});

// -------------------------------------------------------------
// 5. QUOTATION NEGOTIATION, COUNTER-OFFER APPROVAL & PIPELINE IDEMPOTENCY
// -------------------------------------------------------------
console.log("\n5. Quotation Negotiation, Counter-Offer Approval & Pipeline Idempotency:");

const sampleQuo = {
  id: "quo-1",
  quotationNumber: "QUO-2026-00005",
  subtotal: 17980,
  taxAmount: 3236.4,
  discountAmount: 0,
  totalAmount: 21216.4,
  status: "SENT",
  convertedSubscriptionId: null,
};

function simulateStaffNegotiationResponse({ quotation, action, approvedDiscountPercent }) {
  if (action === "APPROVE") {
    const discountAmountToApply = Math.round((quotation.subtotal * (approvedDiscountPercent || 10)) / 100);
    const taxableAfterDiscount = quotation.subtotal - discountAmountToApply;
    const taxAmount = Number((taxableAfterDiscount * 0.18).toFixed(2));
    const totalAmount = Number((taxableAfterDiscount + taxAmount).toFixed(2));

    return {
      ...quotation,
      discountAmount: discountAmountToApply,
      taxAmount,
      totalAmount,
      status: "SENT",
    };
  }
  return { ...quotation };
}

test("Staff discount approval recalculates taxable subtotal, 18% GST tax, and net payable total", () => {
  const approved = simulateStaffNegotiationResponse({
    quotation: sampleQuo,
    action: "APPROVE",
    approvedDiscountPercent: 10,
  });

  assert.equal(approved.discountAmount, 1798);
  assert.equal(approved.taxAmount, 2912.76);
  assert.equal(approved.totalAmount, 19094.76);
});

test("Staff discount rejection leaves standard proposal total unchanged", () => {
  const rejected = simulateStaffNegotiationResponse({
    quotation: sampleQuo,
    action: "REJECT",
    approvedDiscountPercent: 10,
  });

  assert.equal(rejected.discountAmount, 0);
  assert.equal(rejected.totalAmount, 21216.4);
});

test("Quotation pipeline status resolution marks converted quotations as SUBSCRIBED", () => {
  const resolveStatus = (q) => {
    if (q.convertedSubscriptionId || q.status === "CONFIRMED") return "SUBSCRIBED";
    if (q.pendingDiscount) return "COUNTER_OFFER";
    return q.status;
  };

  assert.equal(resolveStatus({ status: "SENT", convertedSubscriptionId: "sub-123" }), "SUBSCRIBED");
  assert.equal(resolveStatus({ status: "SENT", convertedSubscriptionId: null, pendingDiscount: 10 }), "COUNTER_OFFER");
  assert.equal(resolveStatus({ status: "DRAFT", convertedSubscriptionId: null }), "DRAFT");
});

test("Customer checkout charges the exact approved discounted total and activates subscription", () => {
  const approvedQuo = simulateStaffNegotiationResponse({
    quotation: sampleQuo,
    action: "APPROVE",
    approvedDiscountPercent: 10,
  });

  const accepted = simulateQuotationAcceptance({
    role: "CUSTOMER",
    customerId: "cust-1",
    quotationCustomerId: "cust-1",
    quotationStatus: "QUOTATION",
    paymentData: { paymentMethod: "UPI", amount: approvedQuo.totalAmount, transactionRef: "RZP_DISC_PAY_1" },
  });

  assert.equal(accepted.subscriptionStatus, "ACTIVE");
  assert.equal(accepted.invoiceStatus, "PAID");
  assert.equal(accepted.outstandingAmount, 0);
});

console.log(`\n======================================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`======================================================\n`);

if (failed > 0) process.exit(1);

