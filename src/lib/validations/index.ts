import { z } from "zod";

// -------------------------------------------------------------
// AUTHENTICATION SCHEMAS
// -------------------------------------------------------------

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Full Name must contain at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(9, "Password must contain more than 8 characters")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(9, "Password must contain more than 8 characters")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// -------------------------------------------------------------
// CUSTOMER SCHEMAS
// -------------------------------------------------------------

export const BillingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("India"),
});

export const CustomerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  billingAddress: BillingAddressSchema,
  taxId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// -------------------------------------------------------------
// PRODUCT & VARIANT SCHEMAS
// -------------------------------------------------------------

export const ProductSchema = z.object({
  productCode: z.string().min(2, "Product code is required"),
  name: z.string().min(2, "Product name is required"),
  productType: z.enum(["SERVICE", "SOFTWARE_LICENSE", "ADDON", "HARDWARE"]).default("SERVICE"),
  salesPrice: z.number().min(0, "Sales price cannot be negative"),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const ProductVariantSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variantName: z.string().min(1, "Variant name is required"),
  additionalPrice: z.number().min(0, "Additional price cannot be negative").default(0),
  sku: z.string().min(2, "SKU is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// -------------------------------------------------------------
// TAX SCHEMAS
// -------------------------------------------------------------

export const TaxSchema = z.object({
  taxCode: z.string().min(2, "Tax code is required"),
  name: z.string().min(2, "Tax name is required"),
  percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
  taxType: z.enum(["INCLUSIVE", "EXCLUSIVE"]).default("EXCLUSIVE"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// -------------------------------------------------------------
// SUBSCRIPTION PLAN SCHEMAS
// -------------------------------------------------------------

export const SubscriptionPlanSchema = z.object({
  planCode: z.string().min(2, "Plan code is required"),
  name: z.string().min(2, "Plan name is required"),
  description: z.string().optional().nullable(),
  subscriptionPrice: z.number().min(0, "Price must be positive"),
  billingFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).default("MONTHLY"),
  minQuantity: z.number().int().min(1).default(1),
  availableFrom: z.coerce.date().default(() => new Date()),
  availableUntil: z.coerce.date().optional().nullable(),
  autoCloseEnabled: z.boolean().default(false),
  earlyClosureAllowed: z.boolean().default(true),
  pauseAllowed: z.boolean().default(true),
  renewalAllowed: z.boolean().default(true),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  productIds: z.array(z.string()).default([]),
});

// -------------------------------------------------------------
// QUOTATION & SUBSCRIPTION SCHEMAS
// -------------------------------------------------------------

export const LineItemInputSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
});

export const QuotationCreateSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  templateId: z.string().uuid().optional().nullable(),
  paymentTerms: z.string().default("IMMEDIATE"),
  expiryDate: z.coerce.date(),
  lines: z.array(LineItemInputSchema).min(1, "At least one line item is required"),
});

export const SubscriptionCreateSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  quotationId: z.string().uuid().optional().nullable(),
  billingFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).default("MONTHLY"),
  paymentTerms: z.string().default("IMMEDIATE"),
  startDate: z.coerce.date().default(() => new Date()),
  autoRenew: z.boolean().default(true),
  lines: z.array(LineItemInputSchema).min(1, "At least one line item is required"),
});

// -------------------------------------------------------------
// DISCOUNT SCHEMAS
// -------------------------------------------------------------

export const DiscountSchema = z.object({
  discountCode: z.string().min(2, "Discount code is required"),
  name: z.string().min(2, "Discount name is required"),
  discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]).default("PERCENTAGE"),
  discountValue: z.number().min(0),
  minPurchaseAmount: z.number().min(0).default(0),
  minQuantity: z.number().int().min(1).default(1),
  startDate: z.coerce.date().default(() => new Date()),
  endDate: z.coerce.date().optional().nullable(),
  maxUsageCount: z.number().int().min(1).optional().nullable(),
  status: z.enum(["ACTIVE", "EXPIRED", "DISABLED"]).default("ACTIVE"),
  applicableProductIds: z.array(z.string()).default([]),
});

// -------------------------------------------------------------
// PAYMENT SCHEMAS
// -------------------------------------------------------------

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().min(0.01, "Payment amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CREDIT_CARD", "DEBIT_CARD", "OTHER"]),
  paymentDate: z.coerce.date().default(() => new Date()),
  transactionRef: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
