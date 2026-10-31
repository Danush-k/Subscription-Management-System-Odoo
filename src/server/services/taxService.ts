import Decimal from "decimal.js";

// Ensure high precision for all financial operations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface TaxCalculationResult {
  baseAmount: Decimal;
  taxRate: Decimal;
  taxAmount: Decimal;
  totalAmount: Decimal;
}

export class TaxCalculationService {
  /**
   * Calculates tax for an exclusive tax rate (Tax is added on top of base price)
   * Formula:
   * Tax Amount = Base Amount * (Tax Rate / 100)
   * Total = Base Amount + Tax Amount
   */
  public static calculateExclusive(
    baseAmount: number | string | Decimal,
    taxRatePercent: number | string | Decimal
  ): TaxCalculationResult {
    const base = new Decimal(baseAmount);
    const rate = new Decimal(taxRatePercent);

    if (base.isNegative() || rate.isNegative()) {
      throw new Error("Base amount and tax rate must be non-negative");
    }

    const taxAmount = base.times(rate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const totalAmount = base.plus(taxAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      baseAmount: base.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      taxRate: rate.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      taxAmount,
      totalAmount,
    };
  }

  /**
   * Calculates tax for an inclusive tax rate (Price already includes tax)
   * Formula:
   * Base Amount = Total / (1 + Tax Rate / 100)
   * Tax Amount = Total - Base Amount
   */
  public static calculateInclusive(
    grossAmount: number | string | Decimal,
    taxRatePercent: number | string | Decimal
  ): TaxCalculationResult {
    const gross = new Decimal(grossAmount);
    const rate = new Decimal(taxRatePercent);

    if (gross.isNegative() || rate.isNegative()) {
      throw new Error("Gross amount and tax rate must be non-negative");
    }

    const divisor = new Decimal(1).plus(rate.dividedBy(100));
    const baseAmount = gross.dividedBy(divisor).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const taxAmount = gross.minus(baseAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      baseAmount,
      taxRate: rate.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      taxAmount,
      totalAmount: gross.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
    };
  }

  /**
   * Aggregates multiple line items with individual tax rates
   */
  public static calculateLineTotals(
    quantity: number,
    unitPrice: number | string | Decimal,
    taxRatePercent: number | string | Decimal = 0,
    discountAmount: number | string | Decimal = 0
  ) {
    const qty = new Decimal(quantity);
    const price = new Decimal(unitPrice);
    const discount = new Decimal(discountAmount);
    const taxRate = new Decimal(taxRatePercent);

    if (qty.isNegative() || qty.isZero()) throw new Error("Quantity must be greater than zero");
    if (price.isNegative()) throw new Error("Unit price cannot be negative");

    // Subtotal = Quantity * UnitPrice - Discount
    const lineSubtotalRaw = qty.times(price).minus(discount);
    const lineSubtotal = Decimal.max(lineSubtotalRaw, new Decimal(0)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const taxAmount = lineSubtotal.times(taxRate).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const lineTotal = lineSubtotal.plus(taxAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      quantity: qty.toNumber(),
      unitPrice: price.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      discountAmount: discount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      subtotal: lineSubtotal,
      taxRate: taxRate.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      taxAmount,
      total: lineTotal,
    };
  }
}
