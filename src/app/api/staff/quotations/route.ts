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
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(quotation.totalAmount));

    const formattedExpiry = quotation.expiryDate
      ? new Date(quotation.expiryDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Within 30 Days";

    const emailResult = await dispatchEmail({
      to: quotation.customer.email,
      toName: quotation.customer.name,
      subject: `Official Quotation ${quotation.quotationNumber} - Brightloop Enterprise`,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #714B67; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Brightloop Enterprise</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">New Subscription Proposal & Commercial Quotation</p>
          </div>
          
          <div style="padding: 28px 24px;">
            <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px;">Dear <strong>${quotation.customer.name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
              Our commercial team has prepared and generated your official subscription quotation <strong>${quotation.quotationNumber}</strong>. Please review the proposal details below or in your customer self-service portal.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Quotation Reference:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; padding: 6px 0;">${quotation.quotationNumber}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Quoted Total Amount:</td>
                  <td style="color: #714B67; font-weight: 700; font-size: 16px; text-align: right; padding: 6px 0;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Payment Terms:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; padding: 6px 0;">${quotation.paymentTerms || "NET_15"}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">Offer Valid Until:</td>
                  <td style="color: #0f172a; font-weight: 600; text-align: right; padding: 6px 0;">${formattedExpiry}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 24px;">
              You can review the complete line-item breakdown, negotiate counter-offers, or digitally confirm this proposal directly in your Customer Portal.
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="http://localhost:3000/customer/dashboard?tab=quotations" 
                 style="background-color: #017E84; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; display: inline-block;">
                Review & Confirm Quotation &rarr;
              </a>
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              Brightloop Technologies Pvt. Ltd. &bull; Enterprise Billing &bull; An official PDF copy is attached.
            </p>
          </div>
        </div>
      `,
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

export async function GET() {
  const session = await getServerSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }

  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        plan: true,
        convertedSubscription: {
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
          },
        },
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    const quotationIds = quotations.map((q) => q.id);
    const negotiationLogs = quotationIds.length > 0
      ? await prisma.auditLog.findMany({
          where: {
            entityType: "QUOTATION",
            entityId: { in: quotationIds },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const formatted = quotations.map((q) => {
      const line = q.lines[0];
      const variantName = line?.variant?.variantName || line?.product?.name || "Standard";

      // Check negotiation thread for pending customer counter-offer
      const qLogs = negotiationLogs.filter((l) => l.entityId === q.id);
      const latestCustomerLog = qLogs.find((l) => (l.newValues as any)?.role === "CUSTOMER" && (l.newValues as any)?.proposedDiscount);
      const latestStaffResponse = qLogs.find((l) => (l.newValues as any)?.role === "STAFF");
      
      const hasPendingDiscount = Boolean(
        latestCustomerLog &&
        (!latestStaffResponse || new Date(latestCustomerLog.createdAt) > new Date(latestStaffResponse.createdAt)) &&
        q.status !== "CONFIRMED"
      );

      const proposedDiscount = hasPendingDiscount ? Number((latestCustomerLog?.newValues as any)?.proposedDiscount) : null;
      const latestCustomerMessage = hasPendingDiscount ? String((latestCustomerLog?.newValues as any)?.message) : null;

      // Status mapping
      let displayStatus: "DRAFT" | "SENT" | "COUNTER_OFFER" | "SUBSCRIBED" | "EXPIRED" = "SENT";
      if (q.convertedSubscriptionId || q.status === "CONFIRMED") {
        displayStatus = "SUBSCRIBED";
      } else if (hasPendingDiscount) {
        displayStatus = "COUNTER_OFFER";
      } else if (q.status === "DRAFT") {
        displayStatus = "DRAFT";
      } else if (q.status === "EXPIRED" || (q.expiryDate && q.expiryDate < new Date())) {
        displayStatus = "EXPIRED";
      } else {
        displayStatus = "SENT";
      }

      return {
        id: q.id,
        quotationNumber: q.quotationNumber,
        customerName: q.customer.companyName || q.customer.name,
        customerEmail: q.customer.email,
        planName: q.plan.name,
        variantName,
        subtotal: Number(q.subtotal),
        taxAmount: Number(q.taxAmount),
        discountAmount: Number(q.discountAmount),
        totalAmount: Number(q.totalAmount),
        validUntil: q.expiryDate.toISOString().split("T")[0],
        status: displayStatus,
        rawStatus: q.status,
        paymentTerms: q.paymentTerms,
        convertedSubscriptionId: q.convertedSubscriptionId || q.convertedSubscription?.id || null,
        subscriptionNumber: q.convertedSubscription?.subscriptionNumber || null,
        pendingDiscount: proposedDiscount,
        latestCustomerMessage,
        negotiationsCount: qLogs.length,
      };
    });

    return NextResponse.json({ success: true, quotations: formatted, data: formatted });
  } catch (error: any) {
    console.error("[Staff Quotations GET Error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load quotations" }, { status: 500 });
  }
}
