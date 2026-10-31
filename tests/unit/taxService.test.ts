import { describe, it, expect } from "vitest";
import { TaxCalculationService } from "@/server/services/taxService";
import Decimal from "decimal.js";

describe("TaxCalculationService", () => {
  it("calculates 18% GST exclusively on ₹1,000 correctly", () => {
    const result = TaxCalculationService.calculateExclusive(1000, 18);
    expect(result.baseAmount.toString()).toBe("1000");
    expect(result.taxRate.toString()).toBe("18");
    expect(result.taxAmount.toString()).toBe("180");
    expect(result.totalAmount.toString()).toBe("1180");
  });

  it("calculates 18% GST inclusively on ₹1,180 correctly", () => {
    const result = TaxCalculationService.calculateInclusive(1180, 18);
    expect(result.baseAmount.toString()).toBe("1000");
    expect(result.taxAmount.toString()).toBe("180");
    expect(result.totalAmount.toString()).toBe("1180");
  });

  it("calculates line totals with quantity, tax and discount", () => {
    // 2 units @ ₹500, with ₹100 total discount and 18% GST
    // Subtotal = (2 * 500) - 100 = 900
    // Tax = 900 * 0.18 = 162
    // Total = 1062
    const result = TaxCalculationService.calculateLineTotals(2, 500, 18, 100);
    expect(result.subtotal.toString()).toBe("900");
    expect(result.taxAmount.toString()).toBe("162");
    expect(result.total.toString()).toBe("1062");
  });

  it("throws error for negative inputs", () => {
    expect(() => TaxCalculationService.calculateExclusive(-100, 18)).toThrow();
    expect(() => TaxCalculationService.calculateExclusive(100, -5)).toThrow();
  });
});
