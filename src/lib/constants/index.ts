export const APP_CONFIG = {
  name: "Brightloop Software",
  tagline: "Subscription Management & Recurring Invoicing Platform",
  company: {
    legalName: "Brightloop Software Technologies Pvt. Ltd.",
    address: "Tech Park, Cyber Corridor, Chennai, TN 600096, India",
    email: "billing@brightloopsoftware.com",
    supportEmail: "support@brightloopsoftware.com",
    phone: "+91 (044) 4800-2470",
    taxId: "GSTIN33AABCB1234F1Z5",
  },
  currency: {
    symbol: "₹",
    code: "INR",
  },
};

export const ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export const SUBSCRIPTION_STATUSES = {
  DRAFT: "DRAFT",
  QUOTATION: "QUOTATION",
  CONFIRMED: "CONFIRMED",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CLOSED: "CLOSED",
  EXPIRED: "EXPIRED",
} as const;

export const INVOICE_STATUSES = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  OVERDUE: "OVERDUE",
} as const;

export const BILLING_FREQUENCIES = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const;

export const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI (Google Pay / PhonePe)" },
  { value: "BANK_TRANSFER", label: "Bank Transfer (NEFT / RTGS / IMPS)" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "CASH", label: "Cash" },
  { value: "OTHER", label: "Other" },
] as const;
