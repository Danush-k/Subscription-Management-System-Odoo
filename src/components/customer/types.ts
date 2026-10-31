export interface CustomerProfile {
  id: string;
  customerNumber: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  taxId: string | null;
  billingAddress: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status: "ACTIVE" | "INACTIVE";
  registrationDate: string;
}

export interface MetricSummary {
  activeSubscriptions: number;
  pausedSubscriptions: number;
  totalSubscriptions: number;
  upcomingRenewal: {
    date: string;
    subscriptionNumber: string;
    planName: string;
    autoRenew: boolean;
  } | null;
  mrr: number;
  arr: number;
  outstandingBalance: number;
  totalPaid: number;
  overdueInvoices: number;
}

export interface SubscriptionProduct {
  id: string;
  productCode: string;
  name: string;
  productType: string;
  description: string | null;
}

export interface SubscriptionVariant {
  id: string;
  variantName: string;
  sku: string;
  additionalPrice: string | number;
}

export interface SubscriptionLineItem {
  id: string;
  quantity: number;
  unitPrice: string | number;
  taxRate: string | number;
  discountAmount: string | number;
  subtotal: string | number;
  total: string | number;
  product?: SubscriptionProduct | null;
  variant?: SubscriptionVariant | null;
}

export interface SubscriptionPlanItem {
  id: string;
  planCode: string;
  name: string;
  description: string | null;
  subscriptionPrice: string | number;
  billingFrequency: string;
  pauseAllowed: boolean;
  earlyClosureAllowed: boolean;
  renewalAllowed: boolean;
  autoCloseEnabled: boolean;
}

export interface SubscriptionHistoryItem {
  id: string;
  previousStatus: string;
  newStatus: string;
  action: string;
  note: string | null;
  createdAt: string;
}

export interface SubscriptionItem {
  id: string;
  subscriptionNumber: string;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED";
  billingFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  paymentTerms: string;
  startDate: string;
  nextBillingDate: string;
  expiryDate: string | null;
  lastBilledDate: string | null;
  autoRenew: boolean;
  pausedAt: string | null;
  closedAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  plan: SubscriptionPlanItem;
  lines: SubscriptionLineItem[];
  histories: SubscriptionHistoryItem[];
  invoices: InvoiceItem[];
}

export interface InvoiceLineItem {
  id: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: string | number;
  taxRate: string | number;
  taxAmount: string | number;
  discountAmount: string | number;
  subtotal: string | number;
  total: string | number;
}

export interface InvoicePaymentItem {
  id: string;
  paymentNumber: string;
  paymentMethod: string;
  amount: string | number;
  paymentDate: string;
  transactionRef: string | null;
  status: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: string | number;
  taxAmount: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  paidAmount: string | number;
  outstandingAmount: string | number;
  status: "DRAFT" | "CONFIRMED" | "PAID" | "CANCELLED" | "OVERDUE";
  customerSnapshot: {
    name?: string;
    companyName?: string;
    taxId?: string;
    billingAddress?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  subscription?: {
    id: string;
    subscriptionNumber: string;
    plan?: { name: string };
  } | null;
  lines: InvoiceLineItem[];
  payments: InvoicePaymentItem[];
}

export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "OTHER";
  amount: string | number;
  paymentDate: string;
  transactionRef: string | null;
  notes: string | null;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: string | number;
    status: string;
  };
}

export interface ActivityItem {
  id: string;
  date: string;
  type: "SUBSCRIPTION" | "INVOICE" | "PAYMENT";
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: string;
  referenceId?: string;
}

export interface NotificationItem {
  id: string;
  level: "warning" | "info" | "neutral";
  title: string;
  message: string;
  actionLabel: string;
  actionTab: "subscriptions" | "invoices" | "payments" | "billing" | "activity";
}

export interface PortalData {
  customer: CustomerProfile;
  metrics: MetricSummary;
  subscriptions: SubscriptionItem[];
  invoices: InvoiceItem[];
  payments: PaymentRecord[];
  timeline: ActivityItem[];
  notifications: NotificationItem[];
}

