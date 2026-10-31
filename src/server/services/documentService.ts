type PdfRow = {
  label: string;
  value: string;
};

type PdfDocument = {
  title: string;
  numberLabel: string;
  number: string;
  customerName: string;
  dateLabel: string;
  date: string;
  rows: PdfRow[];
  totalLabel: string;
  total: string;
  note: string;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PURPLE = "0.443 0.294 0.404";
const DARK = "0.11 0.10 0.14";
const MUTED = "0.38 0.38 0.43";
const LIGHT = "0.95 0.94 0.96";

function escapePdfText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function text(value: string, x: number, y: number, size: number, color = DARK, font = "F1"): string {
  return `${color} rg /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj -${x} 0 Td`;
}

function line(x1: number, y1: number, x2: number, y2: number, color = "0.85 0.84 0.87", width = 1): string {
  return `${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function createPdfDocument(document: PdfDocument): Buffer {
  const content: string[] = [
    "q",
    `${PURPLE} rg 0 720 ${PAGE_WIDTH} 72 re f`,
    `${PURPLE} rg 48 742 32 32 re f`,
    "1 1 1 rg /F2 18 Tf 57 750 Td (B) Tj",
    "BT",
    text("BrightLoop", 96, 752, 22, "1 1 1", "F2"),
    text("Subscription Management", 96, 733, 9, "0.92 0.89 0.93"),
    "ET",
    "BT",
    text(document.title.toUpperCase(), 48, 678, 20, PURPLE, "F2"),
    text(`${document.numberLabel}: ${document.number}`, 48, 650, 10, MUTED),
    text(`${document.dateLabel}: ${document.date}`, 48, 632, 10, MUTED),
    "ET",
    `${LIGHT} rg 48 548 516 52 re f`,
    "BT",
    text("BILL TO", 64, 580, 8, PURPLE, "F2"),
    text(document.customerName, 64, 561, 12, DARK, "F2"),
    "ET",
    line(48, 520, 564, 520),
    "BT",
    text("DESCRIPTION", 64, 498, 8, MUTED, "F2"),
    text("DETAIL", 380, 498, 8, MUTED, "F2"),
    "ET",
  ];

  let y = 474;
  for (const row of document.rows) {
    content.push("BT", text(row.label, 64, y, 10, DARK), text(row.value, 380, y, 10, DARK), "ET");
    content.push(line(64, y - 14, 548, y - 14, "0.91 0.90 0.92", 0.6));
    y -= 34;
  }

  content.push(
    `${LIGHT} rg 350 ${Math.max(y - 12, 300)} 198 58 re f`,
    "BT",
    text(document.totalLabel.toUpperCase(), 368, Math.max(y + 20, 332), 8, PURPLE, "F2"),
    text(`INR ${document.total}`, 368, Math.max(y - 2, 310), 16, DARK, "F2"),
    "ET",
    "BT",
    text(document.note, 64, 260, 9, MUTED),
    text("Thank you for choosing BrightLoop.", 64, 232, 10, PURPLE, "F2"),
    "ET",
    line(48, 92, 564, 92),
    "BT",
    text("BrightLoop Enterprise Subscription Engine", 48, 70, 8, MUTED),
    text("Generated electronically - no signature required", 360, 70, 8, MUTED),
    "ET",
    "Q",
  );

  const stream = content.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export function createQuotationPdf(quotation: {
  quotationNumber: string;
  customerName: string;
  totalAmount: string;
  expiryDate: Date;
}): Buffer {
  return createPdfDocument({
    title: "Quotation",
    numberLabel: "Quotation number",
    number: quotation.quotationNumber,
    customerName: quotation.customerName,
    dateLabel: "Valid until",
    date: quotation.expiryDate.toLocaleDateString("en-IN"),
    rows: [
      { label: "Subscription proposal", value: "Recurring service" },
      { label: "Proposal validity", value: quotation.expiryDate.toLocaleDateString("en-IN") },
    ],
    totalLabel: "Quoted total",
    total: quotation.totalAmount,
    note: "This quotation is subject to the plan and payment terms selected.",
  });
}

export function createInvoicePdf(invoice: {
  invoiceNumber: string;
  customerName: string;
  totalAmount: string;
  dueDate: Date;
}): Buffer {
  return createPdfDocument({
    title: "Invoice",
    numberLabel: "Invoice number",
    number: invoice.invoiceNumber,
    customerName: invoice.customerName,
    dateLabel: "Due date",
    date: invoice.dueDate.toLocaleDateString("en-IN"),
    rows: [
      { label: "Subscription billing", value: "Recurring service" },
      { label: "Payment due", value: invoice.dueDate.toLocaleDateString("en-IN") },
    ],
    totalLabel: "Amount due",
    total: invoice.totalAmount,
    note: "Please retain this invoice for your financial records.",
  });
}

export function createPaymentReceiptPdf(payment: {
  paymentNumber: string;
  invoiceNumber: string;
  customerName: string;
  amount: string;
  paymentDate: Date;
  transactionRef: string | null;
}): Buffer {
  return createPdfDocument({
    title: "Payment receipt",
    numberLabel: "Receipt number",
    number: payment.paymentNumber,
    customerName: payment.customerName,
    dateLabel: "Payment date",
    date: payment.paymentDate.toLocaleDateString("en-IN"),
    rows: [
      { label: "Invoice", value: payment.invoiceNumber },
      { label: "Transaction reference", value: payment.transactionRef ?? "Not provided" },
    ],
    totalLabel: "Amount received",
    total: payment.amount,
    note: "This receipt confirms that the payment was recorded successfully.",
  });
}
