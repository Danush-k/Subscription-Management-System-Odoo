import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface DiscountRuleInput {
  id: string;
  discountCode: string;
  name: string;
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";
  discountValue: Decimal | number | string;
  minPurchaseAmount: Decimal | number | string;
  minQuantity: number;
  startDate: Date;
  endDate?: Date | null;
  maxUsageCount?: number | null;
  currentUsageCount: number;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
  applicableProductIds?: string[];
}

export interface DiscountEvaluationResult {
  isEligible: boolean;
  ineligibilityReason?: string;
  discountAmount: Decimal;
  discountedTotal: Decimal;
}

export class DiscountService {
  /**
   * Validates discount eligibility against an order total and line items
   */
  public static evaluateDiscount(
    rule: DiscountRuleInput,
    purchaseAmount: Decimal | number | string,
    totalQuantity: number,
    productIdsInCart: string[] = [],
    evaluationDate: Date = new Date()
  ): DiscountEvaluationResult {
    const purchase = new Decimal(purchaseAmount);
    const minPurchase = new Decimal(rule.minPurchaseAmount);
    const val = new Decimal(rule.discountValue);

    // 1. Status Check
    if (rule.status !== "ACTIVE") {
      return {
        isEligible: false,
        ineligibilityReason: `Discount '${rule.discountCode}' is not active`,
        discountAmount: new Decimal(0),
        discountedTotal: purchase,
      };
    }

    // 2. Date Validity Check
    if (evaluationDate < rule.startDate) {
      return {
        isEligible: false,
        ineligibilityReason: `Discount '${rule.discountCode}' has not started yet`,
        discountAmount: new Decimal(0),
        discountedTotal: purchase,
      };
    }

    if (rule.endDate && evaluationDate > rule.endDate) {
      return {
        isEligible: false,
        ineligibilityReason: `Discount '${rule.discountCode}' has expired`,
        discountAmount: new Decimal(0),
        discountedTotal: purchase,
      };
    }

    // 3. Usage Limits
    if (rule.maxUsageCount !== null && rule.maxUsageCount !== undefined && rule.currentUsageCount >= rule.maxUsageCount) {
      return {
        isEligible: false,
        ineligibilityReason: `Discount '${rule.discountCode}' has reached its maximum redemption cap`,
        discountAmount: new Decimal(0),
        discountedTotal: purchase,
      };
    }

    // 4. Minimum Quantity
    if (totalQuantity < rule.minQuantity) {
      return {
        isEligible: false,
        ineligibilityReason: `Minimum item quantity of ${rule.minQuantity} required for this discount`,
        discountAmount: new Decimal(0),
        discountedTotal: purchase,
      };
    }

    // 5. Minimum Purchase Amount
    if (purchase.lessThan(minPurchase)) {
      return {
        isEligible: false,
        ineligibilityReason: `Minimum purchase amount of ₹${minPurchase.toFixed(2)} required for this discount`,
        discountAmount: new Decimal(0),
        discountedTotal: purchase,
      };
    }

    // 6. Product-specific restrictions
    if (rule.applicableProductIds && rule.applicableProductIds.length > 0) {
      const hasMatchingProduct = productIdsInCart.some((id) =>
        rule.applicableProductIds!.includes(id)
      );
      if (!hasMatchingProduct) {
        return {
          isEligible: false,
          ineligibilityReason: `Discount '${rule.discountCode}' is not applicable to selected products`,
          discountAmount: new Decimal(0),
          discountedTotal: purchase,
        };
      }
    }

    // Calculate Deduction
    let discountAmount = new Decimal(0);
    if (rule.discountType === "PERCENTAGE") {
      discountAmount = purchase.times(val).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    } else {
      discountAmount = Decimal.min(val, purchase).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    }

    const discountedTotal = Decimal.max(purchase.minus(discountAmount), new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      isEligible: true,
      discountAmount,
      discountedTotal,
    };
  }
}
