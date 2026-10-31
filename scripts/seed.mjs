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
    update: {},
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
  const annualPlan = await prisma.subscriptionPlan.upsert({
    where: { planCode: "PLAN-ANNUAL-ENT" },
    update: {},
    create: {
      planCode: "PLAN-ANNUAL-ENT",
      name: "Enterprise Annual Subscription",
      description: "Annual subscription for ERP Core + Odoo sync with 18% GST",
      subscriptionPrice: 15600.0,
      billingFrequency: "MONTHLY",
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

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
