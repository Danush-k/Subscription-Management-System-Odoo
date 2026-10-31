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
  });
});
