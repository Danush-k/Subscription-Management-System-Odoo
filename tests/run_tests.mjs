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

console.log(`\n======================================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`======================================================\n`);

if (failed > 0) process.exit(1);
