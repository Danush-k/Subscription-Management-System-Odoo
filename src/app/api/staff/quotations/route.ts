import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuotationCreateSchema } from "@/lib/validations";
import { createQuotationPdf } from "@/server/services/documentService";
import { dispatchEmail } from "@/server/services/emailDispatchService";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const input = QuotationCreateSchema.parse(body);
    if (input.expiryDate <= new Date()) throw new Error("Quotation expiry must be in the future");

    const quotation = await prisma.$transaction(async (tx) => {
      const [customer, plan] = await Promise.all([
        tx.customer.findFirst({ where: { id: input.customerId, status: "ACTIVE" } }),
        tx.subscriptionPlan.findFirst({ where: { id: input.planId, status: "ACTIVE" } }),
      ]);
      if (!customer) throw new Error("Active customer not found");
      if (!plan) throw new Error("Active subscription plan not found");

      const products = await tx.planProduct.findMany({
        where: { planId: plan.id },
        include: { product: { include: { productTaxes: { include: { tax: true } } } } },
      });
      const sourceLines = input.lines.length
        ? input.lines
        : products.map(({ product, defaultQuantity }) => ({
            productId: product.id,
            variantId: null,
            quantity: defaultQuantity,
            unitPrice: Number(product.salesPrice),
            taxRate: 0,
            discountAmount: 0,
          }));
      if (!sourceLines.length) throw new Error("The selected plan has no billable products");

      const selectedProducts = await tx.product.findMany({
        where: { id: { in: sourceLines.map((line) => line.productId) }, status: "ACTIVE" },
        include: { productTaxes: { include: { tax: true } } },
      });
      const productsById = new Map(selectedProducts.map((product) => [product.id, product]));
      const lines = sourceLines.map((line) => {
        const product = productsById.get(line.productId);
        if (!product) throw new Error("One or more selected products are unavailable");
        const taxRate = product.productTaxes
          .filter(({ tax }) => tax.status === "ACTIVE")
          .reduce((sum, { tax }) => sum + Number(tax.percentage), 0);
        const subtotal = line.unitPrice * line.quantity;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount - line.discountAmount;
        if (total < 0) throw new Error("Line total cannot be negative");
        return { ...line, taxRate, subtotal, taxAmount, total };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
      const taxAmount = lines.reduce((sum, line) => sum + line.taxAmount, 0);
      const discountAmount = lines.reduce((sum, line) => sum + line.discountAmount, 0);
      const totalAmount = subtotal + taxAmount - discountAmount;
      const count = await tx.quotation.count();
      const quotationNumber = `QUO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

      return tx.quotation.create({
        data: {
          quotationNumber,
          customerId: customer.id,
          planId: plan.id,
          status: "QUOTATION",
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paymentTerms: input.paymentTerms,
          expiryDate: input.expiryDate,
          lines: { create: lines },
        },
        include: { customer: true },
      });
    });

    let emailSent = false;
    const emailResult = await dispatchEmail({
        to: quotation.customer.email,
        toName: quotation.customer.name,
        subject: `Quotation ${quotation.quotationNumber} from Brightloop`,
        htmlContent: `<p>Hello ${quotation.customer.name},</p><p>Your quotation <strong>${quotation.quotationNumber}</strong> totals ₹${quotation.totalAmount.toString()} and is valid until ${quotation.expiryDate.toLocaleDateString("en-IN")}.</p>`,
        entityType: "Quotation",
        entityId: quotation.id,
        attachment: {
          name: `${quotation.quotationNumber}.pdf`,
          content: createQuotationPdf({
            quotationNumber: quotation.quotationNumber,
            customerName: quotation.customer.name,
            totalAmount: quotation.totalAmount.toString(),
            expiryDate: quotation.expiryDate,
          }),
        },
      });
    emailSent = emailResult.sent;

    return NextResponse.json({ success: true, data: { quotation, emailSent, emailError: emailResult.error } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to create quotation" },
      { status: 400 }
    );
  }
}
