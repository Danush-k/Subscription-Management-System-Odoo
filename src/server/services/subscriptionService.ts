export type SubscriptionState =
  | "DRAFT"
  | "QUOTATION"
  | "CONFIRMED"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "EXPIRED";

export type BillingFrequencyType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type StaffSubscriptionAction = "ACTIVATE" | "PAUSE" | "RESUME" | "CLOSE";

export interface PlanPolicy {
  pauseAllowed: boolean;
  earlyClosureAllowed: boolean;
  renewalAllowed: boolean;
  autoCloseEnabled: boolean;
}

export class SubscriptionService {
  public static isStaffRole(role: string): boolean {
    return role === "STAFF" || role === "ADMIN";
  }

  public static targetStatusForAction(
    action: StaffSubscriptionAction
  ): SubscriptionState {
    switch (action) {
      case "ACTIVATE":
      case "RESUME":
        return "ACTIVE";
      case "PAUSE":
        return "PAUSED";
      case "CLOSE":
        return "CLOSED";
    }
  }

  /**
   * Validates state machine transition according to Brightloop business rules:
   * DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE -> CLOSED
   * Optional states: PAUSED (from ACTIVE), EXPIRED (from ACTIVE/PAUSED)
   */
  public static validateTransition(
    currentStatus: SubscriptionState,
    targetStatus: SubscriptionState,
    policy: PlanPolicy
  ): { allowed: boolean; reason?: string } {
    if (currentStatus === targetStatus) {
      return { allowed: true };
    }

    switch (currentStatus) {
      case "DRAFT":
        if (targetStatus === "QUOTATION" || targetStatus === "CONFIRMED") {
          return { allowed: true };
        }
        return { allowed: false, reason: `Cannot transition directly from DRAFT to ${targetStatus}` };

      case "QUOTATION":
        if (targetStatus === "CONFIRMED" || targetStatus === "CLOSED") {
          return { allowed: true };
        }
        return { allowed: false, reason: `Cannot transition directly from QUOTATION to ${targetStatus}` };

      case "CONFIRMED":
        if (targetStatus === "ACTIVE" || targetStatus === "CLOSED") {
          return { allowed: true };
        }
        return { allowed: false, reason: `Cannot transition directly from CONFIRMED to ${targetStatus}` };

      case "ACTIVE":
        if (targetStatus === "PAUSED") {
          if (!policy.pauseAllowed) {
            return { allowed: false, reason: "Subscription plan disallows pausing" };
          }
          return { allowed: true };
        }
        if (targetStatus === "CLOSED") {
          if (!policy.earlyClosureAllowed) {
            return { allowed: false, reason: "Subscription plan disallows early cancellation/closure" };
          }
          return { allowed: true };
        }
        if (targetStatus === "EXPIRED") {
          return { allowed: true };
        }
        return { allowed: false, reason: `Invalid transition from ACTIVE to ${targetStatus}` };

      case "PAUSED":
        if (targetStatus === "ACTIVE") {
          return { allowed: true }; // Resuming
        }
        if (targetStatus === "CLOSED" || targetStatus === "EXPIRED") {
          return { allowed: true };
        }
        return { allowed: false, reason: `Invalid transition from PAUSED to ${targetStatus}` };

      case "CLOSED":
        // Closed subscriptions cannot be resumed without an explicit new agreement / renewal workflow
        return {
          allowed: false,
          reason: "Closed subscriptions are terminal and cannot be directly resumed or reopened",
        };

      case "EXPIRED":
        if (targetStatus === "ACTIVE" || targetStatus === "CONFIRMED") {
          if (!policy.renewalAllowed) {
            return { allowed: false, reason: "Subscription plan disallows renewals" };
          }
          return { allowed: true };
        }
        return { allowed: false, reason: "Expired subscriptions can only be renewed" };

      default:
        return { allowed: false, reason: "Unknown current subscription status" };
    }
  }

  /**
   * Calculates the next billing date based on recurrence frequency and handles month-end nuances.
   * Example: January 31 + 1 month -> February 28 (or 29 on leap years).
   */
  public static calculateNextBillingDate(
    currentDate: Date,
    frequency: BillingFrequencyType
  ): Date {
    const next = new Date(currentDate);

    switch (frequency) {
      case "DAILY":
        next.setDate(next.getDate() + 1);
        return next;

      case "WEEKLY":
        next.setDate(next.getDate() + 7);
        return next;

      case "MONTHLY": {
        const originalDay = currentDate.getDate();
        next.setMonth(next.getMonth() + 1);
        
        // Check if day rolled over to next month (e.g., Jan 31 -> Mar 3)
        // If so, clamp to last day of target month
        if (next.getDate() !== originalDay) {
          next.setDate(0); // Clamps to the last day of previous month
        }
        return next;
      }

      case "YEARLY": {
        const originalDay = currentDate.getDate();
        const originalMonth = currentDate.getMonth();
        next.setFullYear(next.getFullYear() + 1);

        // Leap year rollover case (Feb 29 on non-leap year -> Feb 28)
        if (originalMonth === 1 && originalDay === 29 && next.getMonth() !== 1) {
          next.setDate(0);
        }
        return next;
      }

      default:
        throw new Error(`Unsupported billing frequency: ${frequency}`);
    }
  }
}
