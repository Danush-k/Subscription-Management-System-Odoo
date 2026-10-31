import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Brightloop database with comprehensive enterprise dataset...");

  // 1. Password Hashes
  const adminPassword = await bcrypt.hash("BrightloopAdmin#2026", 10);
  const staffPassword = await bcrypt.hash("BrightloopStaff#2026", 10);
  const clientPassword = await bcrypt.hash("BrightloopClient#2026", 10);

  // 2. Users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@brightloopsoftware.com" },
    update: {},
    create: {
      email: "admin@brightloopsoftware.com",
      name: "Danush Kalyan (Admin)",
      passwordHash: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@brightloopsoftware.com" },
    update: {},
    create: {
      email: "staff@brightloopsoftware.com",
      name: "Operations Staff",
      passwordHash: staffPassword,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "billing@ssntechlabs.com" },
    update: {},
    create: {
      email: "billing@ssntechlabs.com",
      name: "SSN Technology Labs Accounts",
      passwordHash: clientPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  console.log("Created Users: Admin, Staff, Customer");

  // 3. Customer Profile
  const customer = await prisma.customer.upsert({
    where: { customerNumber: "CUST-2026-0001" },
    update: {
      userId: clientUser.id,
      name: "SSN Technology Labs",
      email: "billing@ssntechlabs.com",
      companyName: "SSN Technology Labs Pvt. Ltd.",
      phone: "+91 98401 24700",
      taxId: "GSTIN33SSN1234F1Z1",
      billingAddress: {
        street: "Old Mahabalipuram Rd, Kalavakkam",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "603110",
        country: "India",
      },
      status: "ACTIVE",
    },
    create: {
      customerNumber: "CUST-2026-0001",
      userId: clientUser.id,
      name: "SSN Technology Labs",
      email: "billing@ssntechlabs.com",
      phone: "+91 98401 24700",
      companyName: "SSN Technology Labs Pvt. Ltd.",
      taxId: "GSTIN33SSN1234F1Z1",
      billingAddress: {
        street: "Old Mahabalipuram Rd, Kalavakkam",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "603110",
        country: "India",
      },
      status: "ACTIVE",
    },
  });

  console.log("Created Customer: CUST-2026-0001");

  // 4. Products & Variants
  const erpProduct = await prisma.product.upsert({
    where: { productCode: "PROD-ERP-CORE" },
    update: {},
    create: {
      productCode: "PROD-ERP-CORE",
      name: "Brightloop ERP Core Engine",
      productType: "SOFTWARE_LICENSE",
      salesPrice: 10000.0,
      costPrice: 2000.0,
      description: "Cloud ERP software core with subscription billing",
      status: "ACTIVE",
      variants: {
        create: [
          {
            variantName: "Standard Cloud Tier",
            sku: "SKU-ERP-STD",
            additionalPrice: 0.0,
            status: "ACTIVE",
          },
          {
            variantName: "Odoo Enterprise Edition",
            sku: "SKU-ERP-ODOO",
            additionalPrice: 5600.0,
            status: "ACTIVE",
          },
          {
            variantName: "SAP Integration Tier",
            sku: "SKU-ERP-SAP",
            additionalPrice: 10000.0,
            status: "ACTIVE",
          },
        ],
      },
    },
  });

  const recurringModule = await prisma.product.upsert({
    where: { productCode: "PROD-AUTO-BILL" },
    update: {},
    create: {
      productCode: "PROD-AUTO-BILL",
      name: "Automated Recurring Invoicing Add-on",
      productType: "ADDON",
      salesPrice: 3500.0,
      costPrice: 500.0,
      description: "BullMQ and Redis persistent queue automated billing worker",
      status: "ACTIVE",
    },
  });

  const cloudInstanceProduct = await prisma.product.upsert({
    where: { productCode: "PROD-CLOUD-INFRA" },
    update: {},
    create: {
      productCode: "PROD-CLOUD-INFRA",
      name: "Dedicated Enterprise Cloud Instance",
      productType: "HARDWARE",
      salesPrice: 120000.0,
      costPrice: 40000.0,
      description: "High-availability dedicated private cloud infrastructure with SLA guarantee",
      status: "ACTIVE",
    },
  });

  console.log("Created Products and Product Variants");

  // 5. Taxes
  const gst18 = await prisma.tax.upsert({
    where: { taxCode: "GST-18" },
    update: {},
    create: {
      taxCode: "GST-18",
      name: "Goods and Services Tax 18%",
      percentage: 18.0,
      taxType: "EXCLUSIVE",
      startDate: new Date("2026-01-01"),
      status: "ACTIVE",
    },
  });

  // Link tax to products
  await prisma.productTax.upsert({
    where: {
      productId_taxId: {
        productId: erpProduct.id,
        taxId: gst18.id,
      },
    },
    update: {},
    create: {
      productId: erpProduct.id,
      taxId: gst18.id,
    },
  });

  // 6. Subscription Plans
  const monthlyEntPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-MONTHLY-ENT" },
    update: {},
    create: {
      planCode: "PLAN-MONTHLY-ENT",
      name: "Enterprise Monthly Subscription",
      description: "Monthly subscription for ERP Core + Odoo sync with 18% GST",
      subscriptionPrice: 15600.0,
      billingFrequency: "MONTHLY",
      minQuantity: 1,
      pauseAllowed: true,
      earlyClosureAllowed: true,
      renewalAllowed: true,
      status: "ACTIVE",
    },
  });

  const addonMonthlyPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-ADDON-BILL" },
    update: {},
    create: {
      planCode: "PLAN-ADDON-BILL",
      name: "Automated Billing Monthly Add-on",
      description: "Monthly add-on for Redis persistent billing engine",
      subscriptionPrice: 3500.0,
      billingFrequency: "MONTHLY",
      minQuantity: 1,
      pauseAllowed: true,
      earlyClosureAllowed: true,
      renewalAllowed: true,
      status: "ACTIVE",
    },
  });

  const annualDedicatedPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-ANNUAL-INFRA" },
    update: {},
    create: {
      planCode: "PLAN-ANNUAL-INFRA",
      name: "Dedicated Infrastructure Annual Plan",
      description: "Annual dedicated instance deployment with 24/7 priority SLA",
      subscriptionPrice: 120000.0,
      billingFrequency: "YEARLY",
      minQuantity: 1,
      pauseAllowed: true,
      earlyClosureAllowed: true,
      renewalAllowed: true,
      status: "ACTIVE",
    },
  });

  // 7. Discounts
  await prisma.discount.upsert({
    where: { discountCode: "SAASSTART10" },
    update: {},
    create: {
      discountCode: "SAASSTART10",
      name: "10% Early Bird SaaS Discount",
      discountType: "PERCENTAGE",
      discountValue: 10.0,
      minPurchaseAmount: 5000.0,
      minQuantity: 1,
      maxUsageCount: 100,
      currentUsageCount: 1,
      status: "ACTIVE",
    },
  });

  // 8. Find or fetch product variants
  const odooVariant = await prisma.productVariant.findFirst({
    where: { sku: "SKU-ERP-ODOO" },
  });

  // 9. Upsert Subscriptions
  // Subscription 1: Active Monthly ERP Core
  const sub1 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0001" },
    update: {
      customerId: customer.id,
      planId: monthlyEntPlan.id,
      status: "ACTIVE",
      billingFrequency: "MONTHLY",
      startDate: new Date("2026-01-15T00:00:00.000Z"),
      nextBillingDate: new Date("2026-11-15T00:00:00.000Z"),
      autoRenew: true,
    },
    create: {
      subscriptionNumber: "SUB-2026-0001",
      customerId: customer.id,
      planId: monthlyEntPlan.id,
      status: "ACTIVE",
      billingFrequency: "MONTHLY",
      paymentTerms: "NET_15",
      startDate: new Date("2026-01-15T00:00:00.000Z"),
      nextBillingDate: new Date("2026-11-15T00:00:00.000Z"),
      autoRenew: true,
      lines: {
        create: [
          {
            productId: erpProduct.id,
            variantId: odooVariant?.id,
            quantity: 1,
            unitPrice: 15600.0,
            taxRate: 18.0,
            discountAmount: 0.0,
            subtotal: 15600.0,
            total: 18408.0,
          },
        ],
      },
      histories: {
        create: [
          {
            previousStatus: "DRAFT",
            newStatus: "ACTIVE",
            action: "Subscription Initialized & Activated",
            note: "Standard enterprise onboarding complete",
            createdAt: new Date("2026-01-15T09:30:00.000Z"),
          },
          {
            previousStatus: "ACTIVE",
            newStatus: "ACTIVE",
            action: "Monthly Recurring Invoiced",
            note: "Recurring billing cycle ran successfully",
            createdAt: new Date("2026-10-15T00:00:00.000Z"),
          },
        ],
      },
    },
  });

  // Subscription 2: Paused Addon
  const sub2 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0002" },
    update: {
      customerId: customer.id,
      planId: addonMonthlyPlan.id,
      status: "PAUSED",
      pausedAt: new Date("2026-10-15T10:00:00.000Z"),
      billingFrequency: "MONTHLY",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-11-01T00:00:00.000Z"),
      autoRenew: true,
    },
    create: {
      subscriptionNumber: "SUB-2026-0002",
      customerId: customer.id,
      planId: addonMonthlyPlan.id,
      status: "PAUSED",
      pausedAt: new Date("2026-10-15T10:00:00.000Z"),
      billingFrequency: "MONTHLY",
      paymentTerms: "IMMEDIATE",
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-11-01T00:00:00.000Z"),
      autoRenew: true,
      lines: {
        create: [
          {
            productId: recurringModule.id,
            quantity: 1,
            unitPrice: 3500.0,
            taxRate: 0.0,
            discountAmount: 0.0,
            subtotal: 3500.0,
            total: 3500.0,
          },
        ],
      },
      histories: {
        create: [
          {
            previousStatus: "DRAFT",
            newStatus: "ACTIVE",
            action: "Addon Subscription Activated",
            createdAt: new Date("2026-03-01T10:00:00.000Z"),
          },
          {
            previousStatus: "ACTIVE",
            newStatus: "PAUSED",
            action: "Customer Requested Temporary Pause",
            note: "Customer paused automated queue worker temporarily",
            createdAt: new Date("2026-10-15T10:00:00.000Z"),
          },
        ],
      },
    },
  });

  // Subscription 3: Active Annual Dedicated Cloud
  const sub3 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0003" },
    update: {
      customerId: customer.id,
      planId: annualDedicatedPlan.id,
      status: "ACTIVE",
      billingFrequency: "YEARLY",
      startDate: new Date("2025-11-15T00:00:00.000Z"),
      nextBillingDate: new Date("2026-11-15T00:00:00.000Z"),
      autoRenew: true,
    },
    create: {
      subscriptionNumber: "SUB-2026-0003",
      customerId: customer.id,
      planId: annualDedicatedPlan.id,
      status: "ACTIVE",
      billingFrequency: "YEARLY",
      paymentTerms: "NET_30",
      startDate: new Date("2025-11-15T00:00:00.000Z"),
      nextBillingDate: new Date("2026-11-15T00:00:00.000Z"),
      autoRenew: true,
      lines: {
        create: [
          {
            productId: cloudInstanceProduct.id,
            quantity: 1,
            unitPrice: 120000.0,
            taxRate: 0.0,
            discountAmount: 0.0,
            subtotal: 120000.0,
            total: 120000.0,
          },
        ],
      },
      histories: {
        create: [
          {
            previousStatus: "DRAFT",
            newStatus: "ACTIVE",
            action: "Annual Cloud Instance Provisioned",
            note: "Dedicated VPS cluster spun up with SSL & SLA",
            createdAt: new Date("2025-11-15T12:00:00.000Z"),
          },
        ],
      },
    },
  });

  console.log("Created 3 Subscriptions with Lines and Lifecycle Histories");

  // 10. Seed Invoices
  // Invoice 1: PAID (Annual Plan)
  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2025-0086" },
    update: {},
    create: {
      invoiceNumber: "INV-2025-0086",
      customerId: customer.id,
      subscriptionId: sub3.id,
      billingPeriodStart: new Date("2025-11-15T00:00:00.000Z"),
      billingPeriodEnd: new Date("2026-11-14T23:59:59.000Z"),
      invoiceDate: new Date("2025-11-15T00:00:00.000Z"),
      dueDate: new Date("2025-11-30T00:00:00.000Z"),
      subtotal: 120000.0,
      taxAmount: 0.0,
      discountAmount: 0.0,
      totalAmount: 120000.0,
      paidAmount: 120000.0,
      outstandingAmount: 0.0,
      status: "PAID",
      customerSnapshot: {
        name: customer.name,
        companyName: customer.companyName,
        taxId: customer.taxId,
        billingAddress: customer.billingAddress,
      },
      lines: {
        create: [
          {
            productName: "Dedicated Enterprise Cloud Instance",
            quantity: 1,
            unitPrice: 120000.0,
            taxRate: 0.0,
            taxAmount: 0.0,
            discountAmount: 0.0,
            subtotal: 120000.0,
            total: 120000.0,
          },
        ],
      },
    },
  });

  // Invoice 2: PAID (Monthly Oct)
  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0104" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0104",
      customerId: customer.id,
      subscriptionId: sub1.id,
      billingPeriodStart: new Date("2026-09-15T00:00:00.000Z"),
      billingPeriodEnd: new Date("2026-10-14T23:59:59.000Z"),
      invoiceDate: new Date("2026-09-15T00:00:00.000Z"),
      dueDate: new Date("2026-09-30T00:00:00.000Z"),
      subtotal: 15600.0,
      taxAmount: 2808.0,
      discountAmount: 0.0,
      totalAmount: 18408.0,
      paidAmount: 18408.0,
      outstandingAmount: 0.0,
      status: "PAID",
      customerSnapshot: {
        name: customer.name,
        companyName: customer.companyName,
        taxId: customer.taxId,
        billingAddress: customer.billingAddress,
      },
      lines: {
        create: [
          {
            productName: "Brightloop ERP Core Engine (Odoo Edition)",
            quantity: 1,
            unitPrice: 15600.0,
            taxRate: 18.0,
            taxAmount: 2808.0,
            discountAmount: 0.0,
            subtotal: 15600.0,
            total: 18408.0,
          },
        ],
      },
    },
  });

  // Invoice 3: CONFIRMED / Partially Paid (Current Billing Cycle)
  const inv3 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0128" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0128",
      customerId: customer.id,
      subscriptionId: sub1.id,
      billingPeriodStart: new Date("2026-10-15T00:00:00.000Z"),
      billingPeriodEnd: new Date("2026-11-14T23:59:59.000Z"),
      invoiceDate: new Date("2026-10-15T00:00:00.000Z"),
      dueDate: new Date("2026-11-10T00:00:00.000Z"),
      subtotal: 15600.0,
      taxAmount: 2808.0,
      discountAmount: 0.0,
      totalAmount: 18408.0,
      paidAmount: 10000.0,
      outstandingAmount: 8408.0,
      status: "CONFIRMED",
      customerSnapshot: {
        name: customer.name,
        companyName: customer.companyName,
        taxId: customer.taxId,
        billingAddress: customer.billingAddress,
      },
      lines: {
        create: [
          {
            productName: "Brightloop ERP Core Engine (Odoo Edition)",
            quantity: 1,
            unitPrice: 15600.0,
            taxRate: 18.0,
            taxAmount: 2808.0,
            discountAmount: 0.0,
            subtotal: 15600.0,
            total: 18408.0,
          },
        ],
      },
    },
  });

  // Invoice 4: OVERDUE (Unpaid Addon Invoice)
  const inv4 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0072" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0072",
      customerId: customer.id,
      subscriptionId: sub2.id,
      billingPeriodStart: new Date("2026-08-01T00:00:00.000Z"),
      billingPeriodEnd: new Date("2026-08-31T23:59:59.000Z"),
      invoiceDate: new Date("2026-08-01T00:00:00.000Z"),
      dueDate: new Date("2026-08-20T00:00:00.000Z"),
      subtotal: 3500.0,
      taxAmount: 0.0,
      discountAmount: 0.0,
      totalAmount: 3500.0,
      paidAmount: 0.0,
      outstandingAmount: 3500.0,
      status: "OVERDUE",
      customerSnapshot: {
        name: customer.name,
        companyName: customer.companyName,
        taxId: customer.taxId,
        billingAddress: customer.billingAddress,
      },
      lines: {
        create: [
          {
            productName: "Automated Recurring Invoicing Add-on",
            quantity: 1,
            unitPrice: 3500.0,
            taxRate: 0.0,
            taxAmount: 0.0,
            discountAmount: 0.0,
            subtotal: 3500.0,
            total: 3500.0,
          },
        ],
      },
    },
  });

  console.log("Created 4 Invoices across all statuses (PAID, CONFIRMED/PARTIALLY_PAID, OVERDUE)");

  // 11. Seed Payments
  await prisma.payment.upsert({
    where: { paymentNumber: "PAY-2025-0012" },
    update: {},
    create: {
      paymentNumber: "PAY-2025-0012",
      invoiceId: inv1.id,
      customerId: customer.id,
      paymentMethod: "BANK_TRANSFER",
      amount: 120000.0,
      paymentDate: new Date("2025-11-15T15:20:00.000Z"),
      transactionRef: "UTR247003099182",
      notes: "Corporate NEFT transfer verified and reconciled",
      status: "SUCCESS",
    },
  });

  await prisma.payment.upsert({
    where: { paymentNumber: "PAY-2026-0088" },
    update: {},
    create: {
      paymentNumber: "PAY-2026-0088",
      invoiceId: inv2.id,
      customerId: customer.id,
      paymentMethod: "UPI",
      amount: 18408.0,
      paymentDate: new Date("2026-09-16T11:45:00.000Z"),
      transactionRef: "UPI/409281729019",
      notes: "Google Pay Instant Settlement",
      status: "SUCCESS",
    },
  });

  await prisma.payment.upsert({
    where: { paymentNumber: "PAY-2026-0099" },
    update: {},
    create: {
      paymentNumber: "PAY-2026-0099",
      invoiceId: inv3.id,
      customerId: customer.id,
      paymentMethod: "CREDIT_CARD",
      amount: 10000.0,
      paymentDate: new Date("2026-10-18T16:10:00.000Z"),
      transactionRef: "TXN_CC_982144",
      notes: "Corporate Visa Card partial tranche payment",
      status: "SUCCESS",
    },
  });

  console.log("Created 3 Payment Records reconciled with invoices");

  console.log("Database seeded successfully with complete enterprise SaaS records!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
