import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoicePdfData {
  invoiceNumber: string;
  invoiceDate: string | Date;
  dueDate: string | Date;
  billingPeriodStart?: string | Date | null;
  billingPeriodEnd?: string | Date | null;
  subscriptionNumber?: string | null;
  planName?: string | null;
  status: "DRAFT" | "CONFIRMED" | "PAID" | "OVERDUE" | "CANCELLED";
  customer: {
    name: string;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    taxId?: string | null; // Customer GSTIN
    billingAddress?: {
      street?: string | null;
      city?: string | null;
      state?: string | null;
      postalCode?: string | null;
      country?: string | null;
    } | null;
  };
  lines: Array<{
    description: string;
    hsnSac?: string | null;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discountAmount?: number;
    subtotal: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  payments?: Array<{
    paymentNumber: string;
    paymentMethod: string;
    amount: number;
    paymentDate: string | Date;
    transactionRef?: string | null;
  }>;
}

export const BRIGHTLOOP_COMPANY = {
  name: "Brightloop Software Technologies Pvt. Ltd.",
  tradeName: "BrightLoop Cloud Ecosystem",
  addressLine1: "Module 802, Alpha Block, Tidel Park",
  addressLine2: "Tharamani, Chennai, Tamil Nadu - 600113, India",
  gstin: "33AABCB1234F1Z9",
  cin: "U72900TN2024PTC123456",
  pan: "AABCB1234F",
  state: "Tamil Nadu",
  stateCode: "33",
  email: "billing@brightloopsoftware.com",
  phone: "+91 (044) 4920-8800",
  website: "www.brightloop.io",
  bankDetails: {
    bankName: "HDFC Bank Ltd.",
    accountName: "Brightloop Software Technologies Pvt. Ltd.",
    accountNumber: "50200088921432",
    ifscCode: "HDFC0001224",
    branch: "Tidel Park Tech Branch, Chennai",
    upiId: "brightloop@hdfcbank",
  },
};

function formatCurrency(amount: number): string {
  return "INR " + Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

/**
 * Determine if intra-state (CGST + SGST) or inter-state (IGST)
 */
function isIntraStateGst(customerGstin?: string | null, customerState?: string | null): boolean {
  if (customerGstin && customerGstin.trim().startsWith("33")) {
    return true;
  }
  if (customerState && customerState.toLowerCase().includes("tamil nadu")) {
    return true;
  }
  // Default to intra-state if both in Tamil Nadu or unstated
  return !customerGstin || customerGstin.trim().startsWith("33");
}

/**
 * Generates and downloads a clean, professional A4 Tax Invoice PDF using jsPDF
 */
export function downloadInvoicePdf(data: InvoicePdfData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Primary brand palette (Brightloop plum purple and professional slates)
  const primaryPlum = [113, 75, 103] as const; // #714B67
  const darkSlate = [30, 41, 59] as const; // #1E293B
  const textGray = [100, 116, 139] as const; // #64748B
  const borderGray = [226, 232, 240] as const; // #E2E8F0
  const lightBg = [248, 250, 252] as const; // #F8FAFC

  let currentY = margin;

  // 1. TOP HEADER SECTION
  // Top brand banner accent bar
  doc.setFillColor(...primaryPlum);
  doc.rect(margin, currentY, contentWidth, 3, "F");
  currentY += 8;

  // Left: Company Logo & Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...primaryPlum);
  doc.text("BrightLoop", margin, currentY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkSlate);
  doc.text(BRIGHTLOOP_COMPANY.name, margin, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  doc.text(BRIGHTLOOP_COMPANY.addressLine1, margin, currentY + 9);
  doc.text(BRIGHTLOOP_COMPANY.addressLine2, margin, currentY + 13);
  doc.text(`GSTIN: ${BRIGHTLOOP_COMPANY.gstin}  |  CIN: ${BRIGHTLOOP_COMPANY.cin}`, margin, currentY + 17);
  doc.text(`Email: ${BRIGHTLOOP_COMPANY.email}  |  Ph: ${BRIGHTLOOP_COMPANY.phone}`, margin, currentY + 21);

  // Right: TAX INVOICE title & Meta Box
  const rightBoxX = 135;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...primaryPlum);
  doc.text("TAX INVOICE", pageWidth - margin, currentY, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkSlate);
  doc.text(data.invoiceNumber, pageWidth - margin, currentY + 5, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  doc.text(`Invoice Date: ${formatDate(data.invoiceDate)}`, pageWidth - margin, currentY + 10, { align: "right" });
  doc.text(`Payment Due: ${formatDate(data.dueDate)}`, pageWidth - margin, currentY + 14, { align: "right" });
  if (data.subscriptionNumber) {
    doc.text(`Sub Ref: ${data.subscriptionNumber}`, pageWidth - margin, currentY + 18, { align: "right" });
  }

  // Status Badge
  const statusColor = data.status === "PAID" ? [16, 185, 129] : data.status === "OVERDUE" ? [225, 29, 72] : [79, 70, 229];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - margin - 22, currentY + 21, 22, 5, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(data.status, pageWidth - margin - 11, currentY + 24.5, { align: "center" });

  currentY += 28;

  // Thin separator rule
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // 2. BILLED TO (CUSTOMER DETAILS) & PLACE OF SUPPLY BOXES
  const colWidth = (contentWidth - 6) / 2;

  // Left Billed To Box
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, currentY, colWidth, 30, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryPlum);
  doc.text("BILLED TO / CUSTOMER INFORMATION", margin + 3, currentY + 5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkSlate);
  const custName = data.customer.companyName || data.customer.name;
  doc.text(custName.substring(0, 38), margin + 3, currentY + 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  const addr = data.customer.billingAddress;
  const addrLine = [addr?.street, addr?.city].filter(Boolean).join(", ") || "Corporate Billing Address";
  const stateLine = [addr?.state, addr?.postalCode, addr?.country].filter(Boolean).join(" - ") || "Tamil Nadu, India";
  doc.text(addrLine.substring(0, 42), margin + 3, currentY + 14.5);
  doc.text(stateLine.substring(0, 42), margin + 3, currentY + 18.5);
  doc.text(`GSTIN: ${data.customer.taxId || "Unregistered / Consumer"}`, margin + 3, currentY + 22.5);
  doc.text(`Email: ${data.customer.email || "—"}`, margin + 3, currentY + 26.5);

  // Right Billing / Place of Supply Box
  const rightBoxStart = margin + colWidth + 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(rightBoxStart, currentY, colWidth, 30, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryPlum);
  doc.text("SUPPLY & SUBSCRIPTION DETAILS", rightBoxStart + 3, currentY + 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkSlate);
  const isIntra = isIntraStateGst(data.customer.taxId, addr?.state);
  doc.text(`Place of Supply: ${addr?.state || "Tamil Nadu (33)"}`, rightBoxStart + 3, currentY + 10);
  doc.text(`GST Category: ${isIntra ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}`, rightBoxStart + 3, currentY + 14.5);
  doc.text(`Billing Cadence: ${data.planName || "Monthly / Recurring"}`, rightBoxStart + 3, currentY + 18.5);
  if (data.billingPeriodStart && data.billingPeriodEnd) {
    doc.text(`Service Period: ${formatDate(data.billingPeriodStart)} - ${formatDate(data.billingPeriodEnd)}`, rightBoxStart + 3, currentY + 22.5);
  } else {
    doc.text(`Terms: NET_15 Continuous SaaS Service`, rightBoxStart + 3, currentY + 22.5);
  }
  doc.text(`Reverse Charge Applicable: No`, rightBoxStart + 3, currentY + 26.5);

  currentY += 34;

  // 3. INVOICE ITEMS TABLE (Using jspdf-autotable with professional A4 formatting)
  const isIntraState = isIntraStateGst(data.customer.taxId, addr?.state);

  const tableHead = [
    [
      { content: "#", styles: { halign: "center" as const, cellWidth: 8 } },
      { content: "Description of Services", styles: { halign: "left" as const, cellWidth: "auto" as const } },
      { content: "HSN/SAC", styles: { halign: "center" as const, cellWidth: 18 } },
      { content: "Qty", styles: { halign: "center" as const, cellWidth: 12 } },
      { content: "Unit Price", styles: { halign: "right" as const, cellWidth: 24 } },
      { content: "Taxable Amt", styles: { halign: "right" as const, cellWidth: 26 } },
      { content: "GST Rate", styles: { halign: "center" as const, cellWidth: 18 } },
      { content: "Total", styles: { halign: "right" as const, cellWidth: 28 } },
    ],
  ];

  const tableBody = (data.lines && data.lines.length > 0
    ? data.lines
    : [
        {
          description: data.planName || "Brightloop SaaS Subscription Service",
          hsnSac: "998314",
          quantity: 1,
          unitPrice: data.subtotal,
          taxRate: 18,
          taxAmount: data.taxAmount,
          subtotal: data.subtotal,
          total: data.totalAmount,
        },
      ]
  ).map((line, idx) => [
    String(idx + 1),
    line.description,
    line.hsnSac || "998314",
    String(line.quantity || 1),
    formatCurrency(line.unitPrice),
    formatCurrency(line.subtotal),
    `${line.taxRate || 18}%`,
    formatCurrency(line.total),
  ]);

  (autoTable as any)(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: tableHead,
    body: tableBody,
    theme: "plain",
    tableWidth: contentWidth,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.5,
      textColor: darkSlate,
      lineWidth: 0.1,
      lineColor: borderGray,
      valign: "middle",
    },
    headStyles: {
      fillColor: primaryPlum,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { halign: "center" },
      1: { halign: "left" },
      2: { halign: "center", font: "courier" },
      3: { halign: "center" },
      4: { halign: "right", font: "courier" },
      5: { halign: "right", font: "courier" },
      6: { halign: "center", fontStyle: "bold" },
      7: { halign: "right", font: "courier", fontStyle: "bold" },
    },
    didDrawPage: (hookData: any) => {
      // Header for continued pages
      if (hookData.pageNumber > 1) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textGray);
        doc.text(`Tax Invoice ${data.invoiceNumber} (Continued)`, margin, margin);
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 4. TAX SUMMARY & TOTALS SECTION
  // Check if we need to advance to next page if near bottom
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = margin + 10;
  }

  const totalsBoxWidth = 85;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;

  // Left Box: Bank Account & Payment Instructions
  const bankBoxWidth = contentWidth - totalsBoxWidth - 6;
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, currentY, bankBoxWidth, 44, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryPlum);
  doc.text("BANK & STATUTORY SETTLEMENT DETAILS", margin + 3, currentY + 5);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkSlate);
  doc.text(`Bank Name: ${BRIGHTLOOP_COMPANY.bankDetails.bankName}`, margin + 3, currentY + 10);
  doc.text(`A/C Name: ${BRIGHTLOOP_COMPANY.bankDetails.accountName}`, margin + 3, currentY + 14);
  doc.text(`A/C Number: ${BRIGHTLOOP_COMPANY.bankDetails.accountNumber}`, margin + 3, currentY + 18);
  doc.text(`IFSC Code: ${BRIGHTLOOP_COMPANY.bankDetails.ifscCode}`, margin + 3, currentY + 22);
  doc.text(`UPI Virtual VPA: ${BRIGHTLOOP_COMPANY.bankDetails.upiId}`, margin + 3, currentY + 26);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...textGray);
  doc.text("Please quote the invoice number when making electronic NEFT/RTGS transfers.", margin + 3, currentY + 31);
  doc.text("All subscriptions are continuous SaaS licenses subject to Brightloop Master Terms.", margin + 3, currentY + 35);
  doc.text("Payment due within 15 days of invoice date.", margin + 3, currentY + 39);

  // Right Box: Accurate Tax Breakdown & Final Totals
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(totalsBoxX, currentY, totalsBoxWidth, 44, 2, 2, "FD");

  let ty = currentY + 5;
  const rightValX = pageWidth - margin - 3;

  // Subtotal
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  doc.text("Taxable Subtotal:", totalsBoxX + 3, ty);
  doc.setFont("courier", "normal");
  doc.setTextColor(...darkSlate);
  doc.text(formatCurrency(data.subtotal), rightValX, ty, { align: "right" });
  ty += 4.5;

  // Discount if any
  if (data.discountAmount && Number(data.discountAmount) > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129);
    doc.text("Trade Discount:", totalsBoxX + 3, ty);
    doc.setFont("courier", "normal");
    doc.text(`- ${formatCurrency(data.discountAmount)}`, rightValX, ty, { align: "right" });
    ty += 4.5;
  }

  // Tax breakdown: CGST + SGST or IGST
  if (isIntraState) {
    const halfTax = data.taxAmount / 2;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text("Central GST (CGST 9%):", totalsBoxX + 3, ty);
    doc.setFont("courier", "normal");
    doc.setTextColor(...darkSlate);
    doc.text(formatCurrency(halfTax), rightValX, ty, { align: "right" });
    ty += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text("State GST (SGST 9%):", totalsBoxX + 3, ty);
    doc.setFont("courier", "normal");
    doc.setTextColor(...darkSlate);
    doc.text(formatCurrency(halfTax), rightValX, ty, { align: "right" });
    ty += 4.5;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text("Integrated GST (IGST 18%):", totalsBoxX + 3, ty);
    doc.setFont("courier", "normal");
    doc.setTextColor(...darkSlate);
    doc.text(formatCurrency(data.taxAmount), rightValX, ty, { align: "right" });
    ty += 4.5;
  }

  // Divider
  doc.setDrawColor(...borderGray);
  doc.line(totalsBoxX + 2, ty - 1, rightValX, ty - 1);
  ty += 2;

  // Total Gross Invoice
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryPlum);
  doc.text("Total Gross Amount:", totalsBoxX + 3, ty);
  doc.setFont("courier", "bold");
  doc.text(formatCurrency(data.totalAmount), rightValX, ty, { align: "right" });
  ty += 5;

  // Amount Settled
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(16, 185, 129);
  doc.text("Amount Settled:", totalsBoxX + 3, ty);
  doc.setFont("courier", "bold");
  doc.text(formatCurrency(data.paidAmount), rightValX, ty, { align: "right" });
  ty += 4.5;

  // Outstanding Due
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const outColor = Number(data.outstandingAmount) > 0 ? [225, 29, 72] : [16, 185, 129];
  doc.setTextColor(outColor[0], outColor[1], outColor[2]);
  doc.text("Outstanding Due:", totalsBoxX + 3, ty);
  doc.setFont("courier", "bold");
  doc.text(formatCurrency(data.outstandingAmount), rightValX, ty, { align: "right" });

  currentY += 48;

  // 5. SIGNATORY & FOOTER SECTION
  // Check if page fits footer
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = margin + 10;
  }

  // Authorized Signatory
  const sigY = currentY + 2;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkSlate);
  doc.text(`For ${BRIGHTLOOP_COMPANY.name}`, pageWidth - margin, sigY, { align: "right" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...textGray);
  doc.text("Authorized Corporate Signatory", pageWidth - margin, sigY + 12, { align: "right" });

  // Computer generated declaration
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("This is an authenticated computer-generated statutory Tax Invoice issued under Section 31 of CGST Act, 2017. No physical signature required.", margin, sigY + 12);

  // 6. ADD PAGE NUMBERS TO ALL PAGES
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    doc.text(
      `Page ${i} of ${totalPages}  •  Brightloop Enterprise Billing System`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  // Save the PDF file
  const filename = `Brightloop_${data.invoiceNumber || "INV"}.pdf`;
  doc.save(filename);
}

/**
 * Generates an isolated, print-only HTML document and triggers native browser printing
 * WITHOUT printing any application navigation, sidebar, or dashboard elements.
 */
export function printInvoiceDocument(data: InvoicePdfData) {
  const isIntra = isIntraStateGst(data.customer.taxId, data.customer.billingAddress?.state);
  const custName = data.customer.companyName || data.customer.name;
  const addr = data.customer.billingAddress;
  const addrLine = [addr?.street, addr?.city].filter(Boolean).join(", ") || "Corporate Billing Address";
  const stateLine = [addr?.state, addr?.postalCode, addr?.country].filter(Boolean).join(" - ") || "Tamil Nadu, India";

  const lines = data.lines && data.lines.length > 0 ? data.lines : [
    {
      description: data.planName || "Brightloop SaaS Subscription Service",
      hsnSac: "998314",
      quantity: 1,
      unitPrice: data.subtotal,
      taxRate: 18,
      taxAmount: data.taxAmount,
      subtotal: data.subtotal,
      total: data.totalAmount,
    }
  ];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${data.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      color: #1E293B;
      background: #FFFFFF;
      line-height: 1.4;
      padding: 0;
    }
    .invoice-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
    }
    .top-bar {
      height: 4px;
      background: #714B67;
      margin-bottom: 16px;
      border-radius: 2px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #E2E8F0;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #714B67;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .company-name {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .company-meta {
      font-size: 9.5px;
      color: #64748B;
      line-height: 1.35;
    }
    .invoice-title {
      font-size: 18px;
      font-weight: 900;
      color: #714B67;
      text-align: right;
      letter-spacing: 0.5px;
    }
    .invoice-num {
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-weight: 800;
      color: #0F172A;
      text-align: right;
      margin: 2px 0 6px 0;
    }
    .meta-line {
      font-size: 9.5px;
      color: #64748B;
      text-align: right;
      margin-bottom: 2px;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
      float: right;
    }
    .status-paid { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
    .status-overdue { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }
    .status-confirmed { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }

    .info-boxes {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-box {
      flex: 1;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 14px;
    }
    .box-heading {
      font-size: 9px;
      font-weight: 800;
      color: #714B67;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 3px;
    }
    .box-name {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .box-meta {
      font-size: 9.5px;
      color: #475569;
      line-height: 1.4;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    table.items-table th {
      background: #714B67;
      color: #FFFFFF;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      border: 1px solid #714B67;
    }
    table.items-table td {
      padding: 8px 10px;
      font-size: 10px;
      border: 1px solid #E2E8F0;
      color: #1E293B;
    }
    table.items-table tr:nth-child(even) td {
      background: #FAFAFA;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }

    .bottom-section {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .bank-box {
      flex: 1.2;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 9.5px;
      color: #334155;
    }
    .totals-box {
      flex: 1;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 10px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      color: #64748B;
    }
    .totals-row.grand {
      font-size: 12px;
      font-weight: 900;
      color: #714B67;
      border-top: 1px solid #CBD5E1;
      padding-top: 6px;
      margin-top: 6px;
    }
    .totals-row.settled {
      color: #047857;
      font-weight: 700;
    }
    .totals-row.due {
      color: ${Number(data.outstandingAmount) > 0 ? "#BE123C" : "#047857"};
      font-weight: 900;
      font-size: 11px;
      border-top: 1px dashed #E2E8F0;
      padding-top: 4px;
      margin-top: 4px;
    }

    .footer-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      font-size: 8.5px;
      color: #94A3B8;
      page-break-inside: avoid;
    }
    .signatory {
      text-align: right;
      color: #0F172A;
    }
    .sign-title {
      font-weight: 800;
      font-size: 9px;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="top-bar"></div>

    <div class="header-row">
      <div>
        <div class="brand-title">BrightLoop</div>
        <div class="company-name">${BRIGHTLOOP_COMPANY.name}</div>
        <div class="company-meta">
          ${BRIGHTLOOP_COMPANY.addressLine1}<br>
          ${BRIGHTLOOP_COMPANY.addressLine2}<br>
          <strong>GSTIN:</strong> ${BRIGHTLOOP_COMPANY.gstin} &bull; <strong>CIN:</strong> ${BRIGHTLOOP_COMPANY.cin}<br>
          <strong>Email:</strong> ${BRIGHTLOOP_COMPANY.email} &bull; <strong>Phone:</strong> ${BRIGHTLOOP_COMPANY.phone}
        </div>
      </div>

      <div>
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-num">${data.invoiceNumber}</div>
        <div class="meta-line"><strong>Invoice Date:</strong> ${formatDate(data.invoiceDate)}</div>
        <div class="meta-line"><strong>Payment Due:</strong> ${formatDate(data.dueDate)}</div>
        ${data.subscriptionNumber ? `<div class="meta-line"><strong>Sub Ref:</strong> ${data.subscriptionNumber}</div>` : ""}
        <div class="status-badge status-${data.status.toLowerCase()}">${data.status}</div>
      </div>
    </div>

    <div class="info-boxes">
      <div class="info-box">
        <div class="box-heading">Billed To (Customer Details)</div>
        <div class="box-name">${custName}</div>
        <div class="box-meta">
          ${addrLine}<br>
          ${stateLine}<br>
          <strong>GSTIN:</strong> ${data.customer.taxId || "Unregistered / Consumer"}<br>
          <strong>Email:</strong> ${data.customer.email || "—"}
        </div>
      </div>

      <div class="info-box">
        <div class="box-heading">Supply & Compliance Information</div>
        <div class="box-meta">
          <strong>Place of Supply:</strong> ${addr?.state || "Tamil Nadu (33)"}<br>
          <strong>GST Type:</strong> ${isIntra ? "Intra-State (CGST + SGST)" : "Inter-State (IGST)"}<br>
          <strong>Billing Cadence:</strong> ${data.planName || "Monthly / Recurring"}<br>
          <strong>Service Period:</strong> ${data.billingPeriodStart && data.billingPeriodEnd ? `${formatDate(data.billingPeriodStart)} - ${formatDate(data.billingPeriodEnd)}` : "Continuous SaaS Services"}<br>
          <strong>Reverse Charge:</strong> Not Applicable
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Description of Services</th>
          <th style="width: 80px;" class="text-center">HSN/SAC</th>
          <th style="width: 50px;" class="text-center">Qty</th>
          <th style="width: 90px;" class="text-right">Unit Price</th>
          <th style="width: 100px;" class="text-right">Taxable Amt</th>
          <th style="width: 70px;" class="text-center">GST Rate</th>
          <th style="width: 110px;" class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lines
          .map(
            (line, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${line.description}</strong></td>
            <td class="text-center mono">${line.hsnSac || "998314"}</td>
            <td class="text-center">${line.quantity || 1}</td>
            <td class="text-right mono">₹${Number(line.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td class="text-right mono">₹${Number(line.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td class="text-center font-bold">${line.taxRate || 18}%</td>
            <td class="text-right mono font-bold">₹${Number(line.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="bottom-section">
      <div class="bank-box">
        <div class="box-heading">Payment &amp; Bank Details</div>
        <div><strong>Bank Name:</strong> ${BRIGHTLOOP_COMPANY.bankDetails.bankName}</div>
        <div><strong>Account Name:</strong> ${BRIGHTLOOP_COMPANY.bankDetails.accountName}</div>
        <div><strong>Account No:</strong> <span class="mono">${BRIGHTLOOP_COMPANY.bankDetails.accountNumber}</span></div>
        <div><strong>IFSC Code:</strong> <span class="mono">${BRIGHTLOOP_COMPANY.bankDetails.ifscCode}</span> &bull; <strong>Branch:</strong> ${BRIGHTLOOP_COMPANY.bankDetails.branch}</div>
        <div><strong>UPI Virtual VPA:</strong> <span class="mono">${BRIGHTLOOP_COMPANY.bankDetails.upiId}</span></div>
        <div style="margin-top: 8px; font-size: 8.5px; color: #64748B;">
          Please mention invoice number <strong>${data.invoiceNumber}</strong> in transaction remarks.
        </div>
      </div>

      <div class="totals-box">
        <div class="totals-row">
          <span>Taxable Subtotal:</span>
          <span class="mono">₹${Number(data.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        ${
          data.discountAmount && Number(data.discountAmount) > 0
            ? `
        <div class="totals-row" style="color: #047857;">
          <span>Trade Discount:</span>
          <span class="mono">- ₹${Number(data.discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>`
            : ""
        }
        ${
          isIntra
            ? `
        <div class="totals-row">
          <span>Central GST (CGST 9%):</span>
          <span class="mono">₹${Number(data.taxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row">
          <span>State GST (SGST 9%):</span>
          <span class="mono">₹${Number(data.taxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        `
            : `
        <div class="totals-row">
          <span>Integrated GST (IGST 18%):</span>
          <span class="mono">₹${Number(data.taxAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        `
        }
        <div class="totals-row grand">
          <span>Total Gross Invoice:</span>
          <span class="mono">₹${Number(data.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row settled">
          <span>Amount Settled:</span>
          <span class="mono">₹${Number(data.paidAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row due">
          <span>Outstanding Balance:</span>
          <span class="mono">₹${Number(data.outstandingAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>

    <div class="footer-section">
      <div>
        This is an authenticated computer-generated statutory Tax Invoice issued under Section 31 of CGST Act, 2017.<br>
        Brightloop Cloud Ecosystem &bull; All rights reserved.
      </div>
      <div class="signatory">
        <div class="sign-title">For ${BRIGHTLOOP_COMPANY.name}</div>
        <div style="font-size: 8.5px; color: #64748B;">Authorized Corporate Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print the Tax Invoice.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

