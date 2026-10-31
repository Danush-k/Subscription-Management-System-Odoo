import { BRIGHTLOOP_COMPANY } from "@/lib/invoice/generateInvoicePdf";

export interface FinancialReportData {
  generatedAt?: Date | string;
  generatedBy?: string;
  periodLabel?: string;
  financialMetrics: {
    invoicedRevenue: number;
    collectedRevenue: number;
    outstandingReceivables: number;
    mrr: number;
    arr: number;
    collectionRate: number;
    activeSubscribers: number;
    churnRate: number;
    cgstLiability: number;
    sgstLiability: number;
  };
  monthlyTrend: Array<{
    month: string;
    invoiced: number;
    collected: number;
  }>;
}

function formatInr(val: number): string {
  return "₹" + Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompactInr(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)} k`;
  return `₹${val.toFixed(0)}`;
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

/**
 * Generates an executive financial analytics PDF report.
 * Uses an isolated vector-styled print window configured for native A4 PDF export.
 */
export function downloadFinancialReportPdf(data: FinancialReportData) {
  const generatedDate = formatDate(data.generatedAt || new Date());
  const metrics = data.financialMetrics;
  const trend = data.monthlyTrend || [];

  const totalInvoiced = trend.reduce((sum, m) => sum + m.invoiced, 0);
  const totalCollected = trend.reduce((sum, m) => sum + m.collected, 0);
  const totalPending = Math.max(0, totalInvoiced - totalCollected);
  const overallRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(1) : "100.0";
  const totalGst = metrics.cgstLiability + metrics.sgstLiability;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Financial &amp; Revenue Intelligence Report - BrightLoop</title>
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
      font-size: 10.5px;
      color: #1E293B;
      background: #FFFFFF;
      line-height: 1.45;
      padding: 0;
    }
    .report-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
    }
    .top-accent-bar {
      height: 4px;
      background: #714B67;
      margin-bottom: 14px;
      border-radius: 2px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 1.5px solid #E2E8F0;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #714B67;
      letter-spacing: -0.5px;
      margin-bottom: 2px;
    }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 4px;
    }
    .company-meta {
      font-size: 9px;
      color: #64748B;
      line-height: 1.35;
    }
    .report-title-box {
      text-align: right;
    }
    .report-title {
      font-size: 15px;
      font-weight: 900;
      color: #714B67;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .report-subtitle {
      font-size: 10px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 2px;
    }
    .report-meta {
      font-size: 9px;
      color: #64748B;
      margin-top: 4px;
      line-height: 1.4;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-top: 4px;
    }
    .badge-primary {
      background: #F5EEF3;
      color: #714B67;
      border: 1px solid #E4D5E0;
    }

    .section-title {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 16px 0 8px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 3px;
      height: 12px;
      background: #714B67;
      border-radius: 2px;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .kpi-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .kpi-label {
      font-size: 8px;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .kpi-value {
      font-size: 14px;
      font-weight: 900;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #0F172A;
      margin: 3px 0 1px 0;
    }
    .kpi-sub {
      font-size: 8px;
      color: #64748B;
      font-weight: 600;
    }
    .kpi-card.highlight {
      background: #F0FDF4;
      border-color: #BBF7D0;
    }
    .kpi-card.highlight .kpi-label { color: #15803D; }
    .kpi-card.highlight .kpi-value { color: #166534; }
    .kpi-card.highlight .kpi-sub { color: #15803D; }

    .kpi-card.warning {
      background: #FEFCE8;
      border-color: #FEF08A;
    }
    .kpi-card.warning .kpi-label { color: #A16207; }
    .kpi-card.warning .kpi-value { color: #854D0E; }
    .kpi-card.warning .kpi-sub { color: #A16207; }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.data-table th {
      background: #714B67;
      color: #FFFFFF;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 7px 9px;
      border: 1px solid #714B67;
    }
    table.data-table td {
      padding: 6px 9px;
      font-size: 9.5px;
      border: 1px solid #E2E8F0;
      color: #1E293B;
    }
    table.data-table tr:nth-child(even) td {
      background: #FAFAFA;
    }
    table.data-table tr.total-row td {
      background: #F1F5F9;
      font-weight: 800;
      border-top: 1.5px solid #CBD5E1;
      color: #0F172A;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }

    /* Dual columns for GST and Summary */
    .summary-cols {
      display: flex;
      gap: 14px;
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    .summary-box {
      flex: 1;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .summary-box-title {
      font-size: 9px;
      font-weight: 800;
      color: #714B67;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 4px;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 9.5px;
      color: #475569;
    }
    .summary-item.total {
      font-weight: 800;
      color: #0F172A;
      border-top: 1px solid #CBD5E1;
      padding-top: 5px;
      margin-top: 5px;
    }

    /* Footer */
    .report-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 14px;
      border-top: 1.5px solid #E2E8F0;
      font-size: 8px;
      color: #94A3B8;
      page-break-inside: avoid;
    }
    .signatory {
      text-align: right;
      color: #0F172A;
    }
    .sign-title {
      font-weight: 800;
      font-size: 8.5px;
      margin-bottom: 22px;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="top-accent-bar"></div>

    <div class="header-row">
      <div>
        <div class="brand-title">BrightLoop</div>
        <div class="brand-subtitle">${BRIGHTLOOP_COMPANY.name}</div>
        <div class="company-meta">
          ${BRIGHTLOOP_COMPANY.addressLine1}, ${BRIGHTLOOP_COMPANY.addressLine2}<br>
          <strong>GSTIN:</strong> ${BRIGHTLOOP_COMPANY.gstin} &bull; <strong>CIN:</strong> ${BRIGHTLOOP_COMPANY.cin}<br>
          <strong>Email:</strong> ${BRIGHTLOOP_COMPANY.email} &bull; <strong>Phone:</strong> ${BRIGHTLOOP_COMPANY.phone}
        </div>
      </div>

      <div class="report-title-box">
        <div class="report-title">Financial Analytics Report</div>
        <div class="report-subtitle">Revenue Intelligence &amp; Cash Realization</div>
        <div class="report-meta">
          <strong>Generated:</strong> ${generatedDate}<br>
          <strong>Generated By:</strong> ${data.generatedBy || "Danush Kalyan (Administrator)"}<br>
          <strong>Fiscal Cycle:</strong> ${data.periodLabel || "FY 2026-27 (YTD)"}
        </div>
        <div class="badge badge-primary">Statutory &bull; Executive Copy</div>
      </div>
    </div>

    <!-- Executive KPI Summary Cards -->
    <div class="section-title">1. Executive KPI Summary &amp; Recurring Run-Rate</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Monthly RR (MRR)</div>
        <div class="kpi-value">${formatCompactInr(metrics.mrr)}</div>
        <div class="kpi-sub">₹${Number(metrics.mrr).toLocaleString("en-IN")}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Annual RR (ARR)</div>
        <div class="kpi-value">${formatCompactInr(metrics.arr)}</div>
        <div class="kpi-sub">12x MRR Run-rate</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Invoiced (Accrual)</div>
        <div class="kpi-value">${formatCompactInr(metrics.invoicedRevenue)}</div>
        <div class="kpi-sub">Gross Billed YTD</div>
      </div>

      <div class="kpi-card highlight">
        <div class="kpi-label">Collected (Cash)</div>
        <div class="kpi-value">${formatCompactInr(metrics.collectedRevenue)}</div>
        <div class="kpi-sub">${metrics.collectionRate}% Realization</div>
      </div>

      <div class="kpi-card warning">
        <div class="kpi-label">Receivables (AR)</div>
        <div class="kpi-value">${formatCompactInr(metrics.outstandingReceivables)}</div>
        <div class="kpi-sub">Pending Collection</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Active Subscribers</div>
        <div class="kpi-value">${metrics.activeSubscribers}</div>
        <div class="kpi-sub">Churn: ${metrics.churnRate}%</div>
      </div>
    </div>

    <!-- Monthly Cash Flow Table -->
    <div class="section-title">2. Monthly Invoiced vs. Collected Cash Flow Ledger</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 32px;" class="text-center">#</th>
          <th>Month / Period</th>
          <th class="text-right" style="width: 140px;">Gross Invoiced (₹)</th>
          <th class="text-right" style="width: 140px;">Liquid Collected (₹)</th>
          <th class="text-right" style="width: 140px;">Pending Balance (₹)</th>
          <th class="text-center" style="width: 100px;">Realization Rate</th>
        </tr>
      </thead>
      <tbody>
        ${
          trend.length === 0
            ? `<tr><td colspan="6" class="text-center" style="padding: 12px; color: #94A3B8;">No billing records found for the period.</td></tr>`
            : trend
                .map((m, idx) => {
                  const pending = Math.max(0, m.invoiced - m.collected);
                  const rate = m.invoiced > 0 ? ((m.collected / m.invoiced) * 100).toFixed(1) : "100.0";
                  return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><strong>${m.month}</strong></td>
              <td class="text-right mono">${formatInr(m.invoiced)}</td>
              <td class="text-right mono" style="color: #166534; font-weight: 600;">${formatInr(m.collected)}</td>
              <td class="text-right mono" style="color: ${pending > 0 ? "#854D0E" : "#64748B"}; font-weight: 600;">${formatInr(pending)}</td>
              <td class="text-center mono font-bold" style="color: ${Number(rate) >= 90 ? "#166534" : "#854D0E"};">${rate}%</td>
            </tr>
          `;
                })
                .join("")
        }
        <tr class="total-row">
          <td colspan="2">TOTAL YTD PERIOD CONSOLIDATION</td>
          <td class="text-right mono font-bold">${formatInr(totalInvoiced)}</td>
          <td class="text-right mono font-bold" style="color: #166534;">${formatInr(totalCollected)}</td>
          <td class="text-right mono font-bold" style="color: #854D0E;">${formatInr(totalPending)}</td>
          <td class="text-center mono font-bold" style="color: #166534;">${overallRate}%</td>
        </tr>
      </tbody>
    </table>

    <!-- Dual Summary: GST Compliance & Collections Health -->
    <div class="summary-cols">
      <div class="summary-box">
        <div class="summary-box-title">Statutory GST Tax Compliance Ledger (GSTR-1)</div>
        <div class="summary-item">
          <span>Intrastate CGST (9.00%):</span>
          <span class="mono font-bold">${formatInr(metrics.cgstLiability)}</span>
        </div>
        <div class="summary-item">
          <span>Intrastate SGST (9.00%):</span>
          <span class="mono font-bold">${formatInr(metrics.sgstLiability)}</span>
        </div>
        <div class="summary-item">
          <span>Integrated IGST (Interstate):</span>
          <span class="mono font-bold">₹0.00</span>
        </div>
        <div class="summary-item total">
          <span>Total Tax Remittance Liability:</span>
          <span class="mono font-bold">${formatInr(totalGst)}</span>
        </div>
        <p style="font-size: 8px; color: #64748B; margin-top: 6px;">
          * Reconciled from settled tax invoices in accordance with Section 31 of CGST Act 2017.
        </p>
      </div>

      <div class="summary-box">
        <div class="summary-box-title">Liquidity &amp; Realization Metrics</div>
        <div class="summary-item">
          <span>Total Accrued Revenue:</span>
          <span class="mono font-bold">${formatInr(metrics.invoicedRevenue)}</span>
        </div>
        <div class="summary-item">
          <span>Liquid Realized Cash:</span>
          <span class="mono font-bold" style="color: #166534;">${formatInr(metrics.collectedRevenue)}</span>
        </div>
        <div class="summary-item">
          <span>Outstanding Receivables:</span>
          <span class="mono font-bold" style="color: #854D0E;">${formatInr(metrics.outstandingReceivables)}</span>
        </div>
        <div class="summary-item total">
          <span>Collection Efficiency Index:</span>
          <span class="mono font-bold" style="color: #166534;">${metrics.collectionRate}%</span>
        </div>
        <p style="font-size: 8px; color: #64748B; margin-top: 6px;">
          * Realization rate of &gt;85% indicates robust subscriber billing conversion.
        </p>
      </div>
    </div>

    <!-- Signatory & Footer -->
    <div class="report-footer">
      <div>
        This is an authenticated, executive financial analytics report generated by BrightLoop Cloud Ecosystem.<br>
        <strong>CIN:</strong> ${BRIGHTLOOP_COMPANY.cin} &bull; <strong>GSTIN:</strong> ${BRIGHTLOOP_COMPANY.gstin} &bull; Module: Financial Intelligence Engine
      </div>
      <div class="signatory">
        <div class="sign-title">For ${BRIGHTLOOP_COMPANY.name}</div>
        <div style="font-size: 8px; color: #64748B;">Chief Financial Officer / Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download/print the Financial Report.");
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
