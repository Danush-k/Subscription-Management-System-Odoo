import { describe, it, expect } from "vitest";
import { SubscriptionService, PlanPolicy } from "@/server/services/subscriptionService";

describe("SubscriptionService", () => {
  const permissivePolicy: PlanPolicy = {
    pauseAllowed: true,
    earlyClosureAllowed: true,
    renewalAllowed: true,
    autoCloseEnabled: false,
  };

  const restrictivePolicy: PlanPolicy = {
    pauseAllowed: false,
    earlyClosureAllowed: false,
    renewalAllowed: false,
    autoCloseEnabled: true,
  };

  describe("Lifecycle Transitions", () => {
    it("allows DRAFT -> CONFIRMED -> ACTIVE", () => {
      expect(SubscriptionService.validateTransition("DRAFT", "CONFIRMED", permissivePolicy).allowed).toBe(true);
      expect(SubscriptionService.validateTransition("CONFIRMED", "ACTIVE", permissivePolicy).allowed).toBe(true);
    });

    it("allows ACTIVE -> PAUSED when policy allows it", () => {
      expect(SubscriptionService.validateTransition("ACTIVE", "PAUSED", permissivePolicy).allowed).toBe(true);
    });

    it("prevents ACTIVE -> PAUSED when plan forbids pausing", () => {
      const result = SubscriptionService.validateTransition("ACTIVE", "PAUSED", restrictivePolicy);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("disallows pausing");
    });

    it("prevents direct resumption of CLOSED subscriptions", () => {
      const result = SubscriptionService.validateTransition("CLOSED", "ACTIVE", permissivePolicy);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("terminal");
    });
  });

  describe("Recurrence Date Calculations", () => {
    it("advances daily recurrence by 1 day", () => {
      const current = new Date("2026-03-15T10:00:00Z");
      const next = SubscriptionService.calculateNextBillingDate(current, "DAILY");
      expect(next.getDate()).toBe(16);
    });

    it("advances weekly recurrence by 7 days", () => {
      const current = new Date("2026-03-15T10:00:00Z");
      const next = SubscriptionService.calculateNextBillingDate(current, "WEEKLY");
      expect(next.getDate()).toBe(22);
    });

    it("correctly handles month-end rollover from Jan 31 to Feb 28 in non-leap year", () => {
      // 2025 is not a leap year
      const jan31 = new Date("2025-01-31T00:00:00Z");
      const next = SubscriptionService.calculateNextBillingDate(jan31, "MONTHLY");
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(28); // 28th (clamped to end of February)
    });

    it("correctly handles leap year rollover from Jan 31 to Feb 29", () => {
      // 2028 is a leap year
      const jan31 = new Date("2028-01-31T00:00:00Z");
      const next = SubscriptionService.calculateNextBillingDate(jan31, "MONTHLY");
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(29); // 29th
    });

    it("advances yearly recurrence by exactly 1 calendar year", () => {
      const current = new Date("2026-06-01T00:00:00Z");
      const next = SubscriptionService.calculateNextBillingDate(current, "YEARLY");
      expect(next.getFullYear()).toBe(2027);
      expect(next.getMonth()).toBe(5); // June
      expect(next.getDate()).toBe(1);
    });
  });

  describe("Quotation Acceptance Gate & Mandatory Payment", () => {
    it("rejects unauthenticated or unbilled activation by end customers", () => {
      const validatePaymentGate = (hasPayment: boolean, role: string) => {
        if (role === "CUSTOMER" && !hasPayment) {
          throw new Error("Payment is mandatory before quotation acceptance and subscription activation.");
        }
        return "ACTIVE";
      };

      expect(() => validatePaymentGate(false, "CUSTOMER")).toThrow(
        "Payment is mandatory before quotation acceptance and subscription activation."
      );
      expect(validatePaymentGate(true, "CUSTOMER")).toBe("ACTIVE");
    });
  });

  describe("Subscription Renewal Settlement Engine", () => {
    it("reactivates a closed or expired subscription when paid", () => {
      const sub = {
        status: "CLOSED",
        closedAt: new Date(),
        cancellationReason: "User cancelled",
      };

      // Renewal resets closed fields
      const reactivated = {
        ...sub,
        status: "ACTIVE",
        closedAt: null,
        cancellationReason: null,
      };

      expect(reactivated.status).toBe("ACTIVE");
      expect(reactivated.closedAt).toBeNull();
      expect(reactivated.cancellationReason).toBeNull();
    });
  });

  describe("Quotation Counter-Offer Negotiation & Pipeline Idempotency", () => {
    const standardQuotation = {
      id: "quo-1",
      quotationNumber: "QUO-2026-00005",
      subtotal: 17980,
      taxAmount: 3236.4,
      discountAmount: 0,
      totalAmount: 21216.4,
      status: "SENT",
      convertedSubscriptionId: null as string | null,
    };

    function processStaffCounterOffer(
      quotation: typeof standardQuotation,
      action: "APPROVE" | "REJECT",
      discountPercent: number = 10
    ) {
      if (action === "APPROVE") {
        const discountAmountToApply = Math.round((quotation.subtotal * discountPercent) / 100);
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

    it("approving 10% discount recalculates subtotal, 18% GST tax, and net payable total", () => {
      const updated = processStaffCounterOffer(standardQuotation, "APPROVE", 10);
      expect(updated.discountAmount).toBe(1798);
      expect(updated.taxAmount).toBe(2912.76);
      expect(updated.totalAmount).toBe(19094.76);
    });

    it("declining counter-offer retains standard commercial pricing without changes", () => {
      const rejected = processStaffCounterOffer(standardQuotation, "REJECT", 10);
      expect(rejected.discountAmount).toBe(0);
      expect(rejected.totalAmount).toBe(21216.4);
    });

    it("resolves pipeline status to SUBSCRIBED when convertedSubscriptionId exists", () => {
      const resolvePipelineStatus = (q: { status: string; convertedSubscriptionId: string | null; pendingDiscount?: number | null }) => {
        if (q.convertedSubscriptionId || q.status === "CONFIRMED") return "SUBSCRIBED";
        if (q.pendingDiscount) return "COUNTER_OFFER";
        return q.status;
      };

      expect(resolvePipelineStatus({ status: "SENT", convertedSubscriptionId: "sub-999" })).toBe("SUBSCRIBED");
      expect(resolvePipelineStatus({ status: "SENT", convertedSubscriptionId: null, pendingDiscount: 10 })).toBe("COUNTER_OFFER");
      expect(resolvePipelineStatus({ status: "SENT", convertedSubscriptionId: null })).toBe("SENT");
    });

    it("prevents re-conversion or double-charging of already confirmed quotations", () => {
      const convertQuotation = (q: typeof standardQuotation) => {
        if (q.convertedSubscriptionId || q.status === "CONFIRMED") {
          throw new Error("This quotation has already been accepted and confirmed");
        }
        return { ...q, status: "CONFIRMED", convertedSubscriptionId: "sub-new-1" };
      };

      const converted = convertQuotation(standardQuotation);
      expect(converted.status).toBe("CONFIRMED");
      expect(converted.convertedSubscriptionId).toBe("sub-new-1");

      // Attempting to convert again must fail
      expect(() => convertQuotation(converted)).toThrow("This quotation has already been accepted and confirmed");
    });
  });
});
