import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================================");
  console.log("  BRIGHTLOOP ENTERPRISE DATABASE SEEDER (ODOO & ZOHO ALIGNED)");
  console.log("=================================================================\n");

  // 1. Password Hashes (Production-grade bcrypt)
  console.log("1. Generating secure bcrypt password hashes...");
  const adminPassword = await bcrypt.hash("BrightloopAdmin#2026", 10);
  const staffPassword = await bcrypt.hash("BrightloopStaff#2026", 10);
  const clientPassword = await bcrypt.hash("BrightloopClient#2026", 10);

  // 2. Users (Admin, Staff, Customer)
  console.log("2. Upserting Role-Based Access Users...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@brightloopsoftware.com" },
    update: { passwordHash: adminPassword },
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
    update: { passwordHash: staffPassword },
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
    update: { passwordHash: clientPassword },
    create: {
      email: "billing@ssntechlabs.com",
      name: "SSN Technology Labs Accounts",
      passwordHash: clientPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  // 3. Customers (B2B Directory)
  console.log("3. Upserting B2B Customer Profiles...");
  const cust1 = await prisma.customer.upsert({
    where: { customerNumber: "CUST-2026-0001" },
    update: { userId: clientUser.id },
    create: {
      customerNumber: "CUST-2026-0001",
      userId: clientUser.id,
      name: "Danush Kalyan",
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

  const cust2 = await prisma.customer.upsert({
    where: { customerNumber: "CUST-2026-0002" },
    update: {},
    create: {
      customerNumber: "CUST-2026-0002",
      name: "Rajesh Kalyan",
      email: "finance@kalyanretail.in",
      phone: "+91 98840 55667",
      companyName: "Kalyan Retailers LLP",
      taxId: "GSTIN33KLY7788P1Z4",
      billingAddress: {
        street: "Avinashi Road",
        city: "Coimbatore",
        state: "Tamil Nadu",
        postalCode: "641018",
        country: "India",
      },
      status: "ACTIVE",
    },
  });

  const cust3 = await prisma.customer.upsert({
    where: { customerNumber: "CUST-2026-0003" },
    update: {},
    create: {
      customerNumber: "CUST-2026-0003",
      name: "Anand Sundaram",
      email: "procure@aerodynamics.com",
      phone: "+91 80234 99881",
      companyName: "AeroDynamics Corp",
      taxId: "GSTIN29AER5544K1Z3",
      billingAddress: {
        street: "Whitefield Main Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560066",
        country: "India",
      },
      status: "ACTIVE",
    },
  });

  const cust4 = await prisma.customer.upsert({
    where: { customerNumber: "CUST-2026-0004" },
    update: {},
    create: {
      customerNumber: "CUST-2026-0004",
      name: "Siddharth Mehta",
      email: "accounts@zenithfin.co",
      phone: "+91 22409 11223",
      companyName: "Zenith Financials Ltd.",
      taxId: "GSTIN27ZEN9900J1Z5",
      billingAddress: {
        street: "Nariman Point",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400021",
        country: "India",
      },
      status: "INACTIVE",
    },
  });

  const cust5 = await prisma.customer.upsert({
    where: { customerNumber: "CUST-2026-0005" },
    update: {},
    create: {
      customerNumber: "CUST-2026-0005",
      name: "Vikramaditya Rao",
      email: "procure@vertexmedia.in",
      phone: "+91 40231 88776",
      companyName: "Vertex Media Works",
      taxId: "GSTIN36VTX1122D1Z8",
      billingAddress: {
        street: "HITEC City Road, Madhapur",
        city: "Hyderabad",
        state: "Telangana",
        postalCode: "500081",
        country: "India",
      },
      status: "ACTIVE",
    },
  });

  // 4. Products & Multi-Tier Editions
  console.log("4. Upserting Products & Multi-Tier Editions...");
  const erpProduct = await prisma.product.upsert({
    where: { productCode: "PROD-ERP-CORE" },
    update: {},
    create: {
      productCode: "PROD-ERP-CORE",
      name: "Brightloop ERP Core Engine",
      productType: "SOFTWARE_LICENSE",
      salesPrice: 10000.0,
      costPrice: 2000.0,
      description: "Cloud ERP software core with subscription billing, inventory, and accounting.",
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
            additionalPrice: 5000.0,
            status: "ACTIVE",
          },
          {
            variantName: "SAP Integration Tier",
            sku: "SKU-ERP-SAP",
            additionalPrice: 12000.0,
            status: "ACTIVE",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const autoBillProduct = await prisma.product.upsert({
    where: { productCode: "PROD-AUTO-BILL" },
    update: {},
    create: {
      productCode: "PROD-AUTO-BILL",
      name: "Automated Recurring Invoicing Add-on",
      productType: "ADDON",
      salesPrice: 3500.0,
      costPrice: 500.0,
      description: "BullMQ and Redis persistent queue automated recurring billing engine",
      status: "ACTIVE",
      variants: {
        create: [
          {
            variantName: "Standard Automation",
            sku: "SKU-BILL-STD",
            additionalPrice: 0.0,
            status: "ACTIVE",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const supportProduct = await prisma.product.upsert({
    where: { productCode: "PROD-SUPPORT-247" },
    update: {},
    create: {
      productCode: "PROD-SUPPORT-247",
      name: "Enterprise 24/7 SLA Support",
      productType: "SERVICE",
      salesPrice: 4500.0,
      costPrice: 1200.0,
      description: "Priority incident handling, dedicated technical account manager, and phone support.",
      status: "ACTIVE",
      variants: {
        create: [
          {
            variantName: "24/7 Dedicated Support",
            sku: "SKU-SUP-247",
            additionalPrice: 0.0,
            status: "ACTIVE",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const cloudStorageProduct = await prisma.product.upsert({
    where: { productCode: "PROD-CLOUD-STORAGE" },
    update: {},
    create: {
      productCode: "PROD-CLOUD-STORAGE",
      name: "High-IOPS Cloud Storage 500GB",
      productType: "ADDON",
      salesPrice: 2400.0,
      costPrice: 600.0,
      description: "Encrypted enterprise NVMe cloud volume with daily snapshot backups.",
      status: "ACTIVE",
      variants: {
        create: [
          {
            variantName: "500GB SSD Volume",
            sku: "SKU-STG-500",
            additionalPrice: 0.0,
            status: "ACTIVE",
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Fetch updated variants
  const erpVariants = await prisma.productVariant.findMany({ where: { productId: erpProduct.id } });
  const odooVariant = erpVariants.find((v) => v.sku === "SKU-ERP-ODOO") || erpVariants[0];
  const stdVariant = erpVariants.find((v) => v.sku === "SKU-ERP-STD") || erpVariants[0];
  const sapVariant = erpVariants.find((v) => v.sku === "SKU-ERP-SAP") || erpVariants[0];

  // 5. Tax Configurations (GST Compliance)
  console.log("5. Upserting Tax Rules (GST 18% Exclusive, Inclusive, Reduced & Export)...");
  const gst18Excl = await prisma.tax.upsert({
    where: { taxCode: "GST-18-EXCL" },
    update: {},
    create: {
      taxCode: "GST-18-EXCL",
      name: "Standard Goods & Services Tax (18% Exclusive)",
      percentage: 18.0,
      taxType: "EXCLUSIVE",
      startDate: new Date("2026-01-01"),
      status: "ACTIVE",
    },
  });

  const gst18Incl = await prisma.tax.upsert({
    where: { taxCode: "GST-18-INCL" },
    update: {},
    create: {
      taxCode: "GST-18-INCL",
      name: "Consumption SaaS Tax (18% Inclusive)",
      percentage: 18.0,
      taxType: "INCLUSIVE",
      startDate: new Date("2026-01-01"),
      status: "ACTIVE",
    },
  });

  const gst12Red = await prisma.tax.upsert({
    where: { taxCode: "GST-12-RED" },
    update: {},
    create: {
      taxCode: "GST-12-RED",
      name: "Reduced IT Hardware Rate (12% Exclusive)",
      percentage: 12.0,
      taxType: "EXCLUSIVE",
      startDate: new Date("2026-01-01"),
      status: "ACTIVE",
    },
  });

  const expZero = await prisma.tax.upsert({
    where: { taxCode: "EXP-0-RATED" },
    update: {},
    create: {
      taxCode: "EXP-0-RATED",
      name: "Zero-Rated Software Export (LUT Bond)",
      percentage: 0.0,
      taxType: "EXCLUSIVE",
      startDate: new Date("2026-01-01"),
      status: "ACTIVE",
    },
  });

  // Link taxes
  await prisma.productTax.upsert({
    where: {
      productId_taxId: {
        productId: erpProduct.id,
        taxId: gst18Excl.id,
      },
    },
    update: {},
    create: {
      productId: erpProduct.id,
      taxId: gst18Excl.id,
    },
  });

  // 6. Subscription Recurring Plans
  console.log("6. Upserting Recurring Subscription Plans...");
  const annualPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-ENT-ANNUAL" },
    update: {},
    create: {
      planCode: "PLAN-ENT-ANNUAL",
      name: "Enterprise Cloud Suite",
      description: "Annual subscription for ERP Core + Odoo sync with 18% GST",
      subscriptionPrice: 120000.0,
      billingFrequency: "YEARLY",
      minQuantity: 1,
      pauseAllowed: true,
      earlyClosureAllowed: true,
      renewalAllowed: true,
      autoCloseEnabled: true,
      status: "ACTIVE",
    },
  });

  const monthlyPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-ODOO-MONTH" },
    update: {},
    create: {
      planCode: "PLAN-ODOO-MONTH",
      name: "Odoo Business Suite",
      description: "Monthly recurring license with multi-tier variant sync",
      subscriptionPrice: 18500.0,
      billingFrequency: "MONTHLY",
      minQuantity: 1,
      pauseAllowed: true,
      earlyClosureAllowed: false,
      renewalAllowed: true,
      autoCloseEnabled: true,
      status: "ACTIVE",
    },
  });

  const growthPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-GROWTH-MONTH" },
    update: {},
    create: {
      planCode: "PLAN-GROWTH-MONTH",
      name: "Growth Monthly Tier",
      description: "Fast-growing SaaS startup tier",
      subscriptionPrice: 8400.0,
      billingFrequency: "MONTHLY",
      minQuantity: 1,
      pauseAllowed: true,
      earlyClosureAllowed: true,
      renewalAllowed: true,
      autoCloseEnabled: false,
      status: "ACTIVE",
    },
  });

  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-STARTER-MONTH" },
    update: {},
    create: {
      planCode: "PLAN-STARTER-MONTH",
      name: "Starter Cloud Tier",
      description: "Lightweight cloud ERP for small businesses",
      subscriptionPrice: 3500.0,
      billingFrequency: "MONTHLY",
      minQuantity: 1,
      pauseAllowed: true,
      earlyClosureAllowed: true,
      renewalAllowed: true,
      autoCloseEnabled: false,
      status: "ACTIVE",
    },
  });

  // 7. Discounts & Promo Codes
  console.log("7. Upserting Promotional Coupons & Rules...");
  const discount1 = await prisma.discount.upsert({
    where: { discountCode: "BRIGHT20" },
    update: {},
    create: {
      discountCode: "BRIGHT20",
      name: "Brightloop Launch Promo (20% Off)",
      discountType: "PERCENTAGE",
      discountValue: 20.0,
      minPurchaseAmount: 10000.0,
      minQuantity: 1,
      maxUsageCount: 100,
      currentUsageCount: 38,
      status: "ACTIVE",
    },
  });

  const discount2 = await prisma.discount.upsert({
    where: { discountCode: "ENTERPRISE5000" },
    update: {},
    create: {
      discountCode: "ENTERPRISE5000",
      name: "Enterprise Annual Voucher (₹5,000 Off)",
      discountType: "FIXED_AMOUNT",
      discountValue: 5000.0,
      minPurchaseAmount: 50000.0,
      minQuantity: 1,
      maxUsageCount: 50,
      currentUsageCount: 22,
      status: "ACTIVE",
    },
  });

  const discount3 = await prisma.discount.upsert({
    where: { discountCode: "STARTUP10" },
    update: {},
    create: {
      discountCode: "STARTUP10",
      name: "Startup Boost Tier (10% Off)",
      discountType: "PERCENTAGE",
      discountValue: 10.0,
      minPurchaseAmount: 5000.0,
      minQuantity: 1,
      maxUsageCount: 200,
      currentUsageCount: 142,
      status: "ACTIVE",
    },
  });

  // 8. Active Subscriptions & Subscription Lines
  console.log("8. Upserting Live Subscriptions with Line Items...");
  const sub1 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0042" },
    update: {},
    create: {
      subscriptionNumber: "SUB-2026-0042",
      customerId: cust1.id,
      planId: annualPlan.id,
      status: "ACTIVE",
      billingFrequency: "YEARLY",
      paymentTerms: "NET_30",
      startDate: new Date("2026-01-15"),
      nextBillingDate: new Date("2027-01-15"),
      lastBilledDate: new Date("2026-01-15"),
      autoRenew: true,
    },
  });

  // Ensure subscription lines exist for sub1
  await prisma.subscriptionLine.deleteMany({ where: { subscriptionId: sub1.id } });
  await prisma.subscriptionLine.create({
    data: {
      subscriptionId: sub1.id,
      productId: erpProduct.id,
      variantId: odooVariant.id,
      quantity: 1,
      unitPrice: 120000.0,
      taxRate: 18.0,
      discountAmount: 0.0,
      subtotal: 101694.92,
      total: 120000.0,
    },
  });

  const sub2 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0041" },
    update: {},
    create: {
      subscriptionNumber: "SUB-2026-0041",
      customerId: cust2.id,
      planId: monthlyPlan.id,
      status: "ACTIVE",
      billingFrequency: "MONTHLY",
      paymentTerms: "NET_15",
      startDate: new Date("2026-06-01"),
      nextBillingDate: new Date("2026-11-01"),
      lastBilledDate: new Date("2026-10-01"),
      autoRenew: true,
    },
  });

  await prisma.subscriptionLine.deleteMany({ where: { subscriptionId: sub2.id } });
  await prisma.subscriptionLine.create({
    data: {
      subscriptionId: sub2.id,
      productId: erpProduct.id,
      variantId: stdVariant.id,
      quantity: 1,
      unitPrice: 18500.0,
      taxRate: 18.0,
      discountAmount: 0.0,
      subtotal: 15677.97,
      total: 18500.0,
    },
  });

  const sub3 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0040" },
    update: {},
    create: {
      subscriptionNumber: "SUB-2026-0040",
      customerId: cust3.id,
      planId: growthPlan.id,
      status: "PAUSED",
      billingFrequency: "MONTHLY",
      paymentTerms: "NET_15",
      startDate: new Date("2026-03-10"),
      nextBillingDate: new Date("2026-11-10"),
      pausedAt: new Date("2026-10-15"),
      autoRenew: false,
    },
  });

  await prisma.subscriptionLine.deleteMany({ where: { subscriptionId: sub3.id } });
  await prisma.subscriptionLine.create({
    data: {
      subscriptionId: sub3.id,
      productId: erpProduct.id,
      variantId: sapVariant.id,
      quantity: 1,
      unitPrice: 8400.0,
      taxRate: 18.0,
      discountAmount: 0.0,
      subtotal: 7118.64,
      total: 8400.0,
    },
  });

  const sub4 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0039" },
    update: {},
    create: {
      subscriptionNumber: "SUB-2026-0039",
      customerId: cust4.id,
      planId: starterPlan.id,
      status: "CLOSED",
      billingFrequency: "MONTHLY",
      paymentTerms: "IMMEDIATE",
      startDate: new Date("2026-01-01"),
      nextBillingDate: new Date("2026-07-01"),
      closedAt: new Date("2026-06-30"),
      cancellationReason: "Migrated to custom internal ERP solution",
      autoRenew: false,
    },
  });

  const sub5 = await prisma.subscription.upsert({
    where: { subscriptionNumber: "SUB-2026-0043" },
    update: {},
    create: {
      subscriptionNumber: "SUB-2026-0043",
      customerId: cust5.id,
      planId: monthlyPlan.id,
      status: "ACTIVE",
      billingFrequency: "MONTHLY",
      paymentTerms: "NET_30",
      startDate: new Date("2026-08-01"),
      nextBillingDate: new Date("2026-11-01"),
      lastBilledDate: new Date("2026-10-01"),
      autoRenew: true,
    },
  });

  await prisma.subscriptionLine.deleteMany({ where: { subscriptionId: sub5.id } });
  await prisma.subscriptionLine.create({
    data: {
      subscriptionId: sub5.id,
      productId: erpProduct.id,
      variantId: odooVariant.id,
      quantity: 1,
      unitPrice: 18500.0,
      taxRate: 18.0,
      discountAmount: 0.0,
      subtotal: 15677.97,
      total: 18500.0,
    },
  });

  // 9. Quotations & Quotation Lines
  console.log("9. Upserting Quotations & Lifecycle Lines...");
  const q1 = await prisma.quotation.upsert({
    where: { quotationNumber: "QUO-2026-0012" },
    update: {},
    create: {
      quotationNumber: "QUO-2026-0012",
      customerId: cust5.id,
      planId: annualPlan.id,
      status: "CONFIRMED",
      subtotal: 120000.0,
      taxAmount: 21600.0,
      discountAmount: 0.0,
      totalAmount: 141600.0,
      paymentTerms: "NET_30",
      expiryDate: new Date("2026-11-20"),
      confirmedAt: new Date("2026-10-25"),
    },
  });

  await prisma.quotationLine.deleteMany({ where: { quotationId: q1.id } });
  await prisma.quotationLine.create({
    data: {
      quotationId: q1.id,
      productId: erpProduct.id,
      variantId: odooVariant.id,
      quantity: 1,
      unitPrice: 120000.0,
      taxRate: 18.0,
      taxAmount: 21600.0,
      subtotal: 120000.0,
      total: 141600.0,
    },
  });

  const q2 = await prisma.quotation.upsert({
    where: { quotationNumber: "QUO-2026-0011" },
    update: {},
    create: {
      quotationNumber: "QUO-2026-0011",
      customerId: cust3.id,
      planId: growthPlan.id,
      status: "QUOTATION",
      subtotal: 8400.0,
      taxAmount: 1512.0,
      discountAmount: 0.0,
      totalAmount: 9912.0,
      paymentTerms: "NET_15",
      expiryDate: new Date("2026-11-15"),
    },
  });

  await prisma.quotationLine.deleteMany({ where: { quotationId: q2.id } });
  await prisma.quotationLine.create({
    data: {
      quotationId: q2.id,
      productId: erpProduct.id,
      variantId: stdVariant.id,
      quantity: 1,
      unitPrice: 8400.0,
      taxRate: 18.0,
      taxAmount: 1512.0,
      subtotal: 8400.0,
      total: 9912.0,
    },
  });

  const q3 = await prisma.quotation.upsert({
    where: { quotationNumber: "QUO-2026-0010" },
    update: {},
    create: {
      quotationNumber: "QUO-2026-0010",
      customerId: cust2.id,
      planId: monthlyPlan.id,
      status: "DRAFT",
      subtotal: 18500.0,
      taxAmount: 3330.0,
      discountAmount: 0.0,
      totalAmount: 21830.0,
      paymentTerms: "NET_15",
      expiryDate: new Date("2026-11-30"),
    },
  });

  await prisma.quotationLine.deleteMany({ where: { quotationId: q3.id } });
  await prisma.quotationLine.create({
    data: {
      quotationId: q3.id,
      productId: erpProduct.id,
      variantId: odooVariant.id,
      quantity: 1,
      unitPrice: 18500.0,
      taxRate: 18.0,
      taxAmount: 3330.0,
      subtotal: 18500.0,
      total: 21830.0,
    },
  });

  const q4 = await prisma.quotation.upsert({
    where: { quotationNumber: "QUO-2026-0009" },
    update: {},
    create: {
      quotationNumber: "QUO-2026-0009",
      customerId: cust1.id,
      planId: starterPlan.id,
      status: "EXPIRED",
      subtotal: 3500.0,
      taxAmount: 630.0,
      discountAmount: 0.0,
      totalAmount: 4130.0,
      paymentTerms: "IMMEDIATE",
      expiryDate: new Date("2026-09-30"),
    },
  });

  // 10. Invoices & Billing Records
  console.log("10. Upserting Tax Invoices & Immutable Snapshots...");
  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0086" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0086",
      customerId: cust1.id,
      subscriptionId: sub1.id,
      billingPeriodStart: new Date("2026-01-15"),
      billingPeriodEnd: new Date("2027-01-14"),
      invoiceDate: new Date("2026-10-31"),
      dueDate: new Date("2026-11-15"),
      subtotal: 101694.92,
      taxAmount: 18305.08,
      totalAmount: 120000.0,
      paidAmount: 120000.0,
      outstandingAmount: 0.0,
      status: "PAID",
      customerSnapshot: {
        companyName: cust1.companyName,
        taxId: cust1.taxId,
        billingAddress: cust1.billingAddress,
      },
    },
  });

  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0085" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0085",
      customerId: cust2.id,
      subscriptionId: sub2.id,
      billingPeriodStart: new Date("2026-10-01"),
      billingPeriodEnd: new Date("2026-10-31"),
      invoiceDate: new Date("2026-10-30"),
      dueDate: new Date("2026-11-14"),
      subtotal: 15677.97,
      taxAmount: 2822.03,
      totalAmount: 18500.0,
      paidAmount: 0.0,
      outstandingAmount: 18500.0,
      status: "CONFIRMED",
      customerSnapshot: {
        companyName: cust2.companyName,
        taxId: cust2.taxId,
        billingAddress: cust2.billingAddress,
      },
    },
  });

  const inv3 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0084" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0084",
      customerId: cust3.id,
      billingPeriodStart: new Date("2026-09-01"),
      billingPeriodEnd: new Date("2026-09-30"),
      invoiceDate: new Date("2026-10-15"),
      dueDate: new Date("2026-10-25"),
      subtotal: 30084.75,
      taxAmount: 5415.25,
      totalAmount: 35500.0,
      paidAmount: 0.0,
      outstandingAmount: 35500.0,
      status: "OVERDUE",
      customerSnapshot: {
        companyName: cust3.companyName,
        taxId: cust3.taxId,
        billingAddress: cust3.billingAddress,
      },
    },
  });

  const inv4 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0083" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0083",
      customerId: cust5.id,
      subscriptionId: sub5.id,
      billingPeriodStart: new Date("2026-09-01"),
      billingPeriodEnd: new Date("2026-09-30"),
      invoiceDate: new Date("2026-09-28"),
      dueDate: new Date("2026-10-12"),
      subtotal: 12033.90,
      taxAmount: 2166.10,
      totalAmount: 14200.0,
      paidAmount: 14200.0,
      outstandingAmount: 0.0,
      status: "PAID",
      customerSnapshot: {
        companyName: cust5.companyName,
        taxId: cust5.taxId,
        billingAddress: cust5.billingAddress,
      },
    },
  });

  const inv5 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0082" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0082",
      customerId: cust2.id,
      subscriptionId: sub2.id,
      billingPeriodStart: new Date("2026-08-01"),
      billingPeriodEnd: new Date("2026-08-31"),
      invoiceDate: new Date("2026-08-20"),
      dueDate: new Date("2026-09-05"),
      subtotal: 21186.44,
      taxAmount: 3813.56,
      totalAmount: 25000.0,
      paidAmount: 25000.0,
      outstandingAmount: 0.0,
      status: "PAID",
      customerSnapshot: {
        companyName: cust2.companyName,
        taxId: cust2.taxId,
        billingAddress: cust2.billingAddress,
      },
    },
  });

  const inv6 = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-0081" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0081",
      customerId: cust1.id,
      billingPeriodStart: new Date("2026-07-01"),
      billingPeriodEnd: new Date("2026-07-31"),
      invoiceDate: new Date("2026-07-15"),
      dueDate: new Date("2026-07-30"),
      subtotal: 15677.97,
      taxAmount: 2822.03,
      totalAmount: 18500.0,
      paidAmount: 18500.0,
      outstandingAmount: 0.0,
      status: "PAID",
      customerSnapshot: {
        companyName: cust1.companyName,
        taxId: cust1.taxId,
        billingAddress: cust1.billingAddress,
      },
    },
  });

  // 11. Payments & Settlements
  console.log("11. Upserting Settlement Payment Transactions...");
  await prisma.payment.upsert({
    where: { paymentNumber: "PAY-2026-0001" },
    update: {},
    create: {
      paymentNumber: "PAY-2026-0001",
      invoiceId: inv1.id,
      customerId: cust1.id,
      amount: 120000.0,
      paymentMethod: "BANK_TRANSFER",
      transactionRef: "TXN-2026-9901",
      notes: "Full settlement for Annual Enterprise Cloud Suite",
      status: "SUCCESS",
    },
  });

  await prisma.payment.upsert({
    where: { paymentNumber: "PAY-2026-0002" },
    update: {},
    create: {
      paymentNumber: "PAY-2026-0002",
      invoiceId: inv4.id,
      customerId: cust5.id,
      amount: 14200.0,
      paymentMethod: "UPI",
      transactionRef: "TXN-2026-9900",
      notes: "UPI payment via HDFC Merchant gateway",
      status: "SUCCESS",
    },
  });

  await prisma.payment.upsert({
    where: { paymentNumber: "PAY-2026-0003" },
    update: {},
    create: {
      paymentNumber: "PAY-2026-0003",
      invoiceId: inv5.id,
      customerId: cust2.id,
      amount: 25000.0,
      paymentMethod: "CREDIT_CARD",
      transactionRef: "TXN-2026-9899",
      notes: "Corporate credit card settlement",
      status: "SUCCESS",
    },
  });

  await prisma.payment.upsert({
    where: { paymentNumber: "PAY-2026-0004" },
    update: {},
    create: {
      paymentNumber: "PAY-2026-0004",
      invoiceId: inv6.id,
      customerId: cust1.id,
      amount: 18500.0,
      paymentMethod: "BANK_TRANSFER",
      transactionRef: "TXN-2026-9898",
      notes: "NEFT transaction settlement",
      status: "SUCCESS",
    },
  });

  console.log("\n=================================================================");
  console.log("  SEEDING COMPLETE! ALL 26 ENTITIES SYNCHRONIZED AND READY");
  console.log("=================================================================");
  console.log("Demo Credentials:");
  console.log("  • Admin:    admin@brightloopsoftware.com / BrightloopAdmin#2026");
  console.log("  • Staff:    staff@brightloopsoftware.com / BrightloopStaff#2026");
  console.log("  • Customer: billing@ssntechlabs.com      / BrightloopClient#2026");
  console.log("=================================================================\n");
}

main()
  .catch((e) => {
    console.error("Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
