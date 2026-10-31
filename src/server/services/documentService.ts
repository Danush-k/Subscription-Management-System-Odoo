type PdfDocument = {
  title: string;
  lines: string[];
};

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function createPdfDocument({ title, lines }: PdfDocument): Buffer {
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 780 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 10 Tf",
    ...lines.flatMap((line) => [`0 -22 Td`, `(${escapePdfText(line)}) Tj`]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
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
    title: "BrightLoop Quotation",
    lines: [
      `Quotation: ${quotation.quotationNumber}`,
      `Customer: ${quotation.customerName}`,
      `Total: INR ${quotation.totalAmount}`,
      `Valid until: ${quotation.expiryDate.toLocaleDateString("en-IN")}`,
    ],
  });
}

export function createInvoicePdf(invoice: {
  invoiceNumber: string;
  customerName: string;
  totalAmount: string;
  dueDate: Date;
}): Buffer {
  return createPdfDocument({
    title: "BrightLoop Invoice",
    lines: [
      `Invoice: ${invoice.invoiceNumber}`,
      `Customer: ${invoice.customerName}`,
      `Total: INR ${invoice.totalAmount}`,
      `Due date: ${invoice.dueDate.toLocaleDateString("en-IN")}`,
    ],
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
    title: "BrightLoop Payment Receipt",
    lines: [
      `Receipt: ${payment.paymentNumber}`,
      `Invoice: ${payment.invoiceNumber}`,
      `Customer: ${payment.customerName}`,
      `Amount: INR ${payment.amount}`,
      `Payment date: ${payment.paymentDate.toLocaleDateString("en-IN")}`,
      `Transaction reference: ${payment.transactionRef ?? "Not provided"}`,
    ],
  });
}
