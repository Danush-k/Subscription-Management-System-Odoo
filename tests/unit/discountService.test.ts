import { describe, it, expect } from "vitest";
import { DiscountService, DiscountRuleInput } from "@/server/services/discountService";
import Decimal from "decimal.js";

describe("DiscountService", () => {
  const baseRule: DiscountRuleInput = {
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
    currentUsageCount: 5,
    status: "ACTIVE",
  };

  it("applies 10% percentage discount when eligible", () => {
    const result = DiscountService.evaluateDiscount(
      baseRule,
      1000,
      1,
      [],
      new Date("2026-06-01")
    );
    expect(result.isEligible).toBe(true);
    expect(result.discountAmount.toString()).toBe("100");
    expect(result.discountedTotal.toString()).toBe("900");
  });

  it("applies fixed amount discount capped at total", () => {
    const fixedRule: DiscountRuleInput = {
      ...baseRule,
      discountCode: "FLAT200",
      discountType: "FIXED_AMOUNT",
      discountValue: 200,
      minPurchaseAmount: 100,
    };

    const result = DiscountService.evaluateDiscount(
      fixedRule,
      500,
      1,
      [],
      new Date("2026-06-01")
    );
    expect(result.isEligible).toBe(true);
    expect(result.discountAmount.toString()).toBe("200");
    expect(result.discountedTotal.toString()).toBe("300");
  });

  it("rejects when purchase is below minimum purchase threshold", () => {
    const result = DiscountService.evaluateDiscount(
      baseRule,
      400, // min is 500
      1,
      [],
      new Date("2026-06-01")
    );
    expect(result.isEligible).toBe(false);
    expect(result.ineligibilityReason).toContain("Minimum purchase amount");
    expect(result.discountAmount.toString()).toBe("0");
  });

  it("rejects when usage limit is reached", () => {
    const maxedRule: DiscountRuleInput = {
      ...baseRule,
      maxUsageCount: 10,
      currentUsageCount: 10,
    };
    const result = DiscountService.evaluateDiscount(
      maxedRule,
      1000,
      1,
      [],
      new Date("2026-06-01")
    );
    expect(result.isEligible).toBe(false);
    expect(result.ineligibilityReason).toContain("maximum redemption cap");
  });

  it("rejects when discount has expired", () => {
    const expiredRule: DiscountRuleInput = {
      ...baseRule,
      endDate: new Date("2026-05-01"),
    };
    const result = DiscountService.evaluateDiscount(
      expiredRule,
      1000,
      1,
      [],
      new Date("2026-06-01")
    );
    expect(result.isEligible).toBe(false);
    expect(result.ineligibilityReason).toContain("has expired");
  });
});
