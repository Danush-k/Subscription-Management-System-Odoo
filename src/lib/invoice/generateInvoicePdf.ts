
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
 * Generates and downloads a clean, professional A4 Tax Invoice document.
 * Triggers the browser's native print-to-PDF dialog with full vector typography,
 * statutory GST compliance, and Brightloop branding.
 */
export function downloadInvoicePdf(data: InvoicePdfData) {
  printInvoiceDocument(data);
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

