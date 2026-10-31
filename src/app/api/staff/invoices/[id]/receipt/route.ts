import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionService } from "@/server/services/subscriptionService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || !SubscriptionService.isStaffRole(session.role)) {
    return NextResponse.json({ success: false, error: "Staff access required" }, { status: 403 });
  }
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, payments: { where: { status: "SUCCESS" }, orderBy: { paymentDate: "asc" } } },
  });
  if (!invoice) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
  const money = (value: unknown) => Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${invoice.invoiceNumber}</title></head><body style="font-family:Arial;max-width:760px;margin:40px auto;color:#172033"><h1>BrightLoop</h1><h2>Payment Receipt</h2><p>Invoice: <strong>${invoice.invoiceNumber}</strong></p><p>Customer: ${invoice.customer.companyName || invoice.customer.name}</p><p>Total: ₹${money(invoice.totalAmount)}<br>Paid: ₹${money(invoice.paidAmount)}<br>Outstanding: ₹${money(invoice.outstandingAmount)}</p><h3>Payments</h3><ul>${invoice.payments.map((payment) => `<li>${payment.paymentNumber} — ₹${money(payment.amount)} — ${payment.paymentDate.toLocaleDateString("en-IN")}${payment.transactionRef ? ` — ${payment.transactionRef}` : ""}</li>`).join("")}</ul></body></html>`;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="receipt-${invoice.invoiceNumber}.html"`,
    },
  });
}
