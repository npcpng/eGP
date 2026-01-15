/**
 * PDF Report Generator
 * Generates PDF reports for bid openings, contracts, and other procurement documents
 */

export interface BidOpeningReportData {
  session: {
    id: string;
    tenderRef: string;
    tenderTitle: string;
    openingDate: Date;
    completedAt?: Date;
    venue?: string;
  };
  committee: Array<{
    name: string;
    role: string;
    signature?: string;
    attended: boolean;
  }>;
  bids: Array<{
    rank: number;
    supplierName: string;
    bidAmount: number;
    currency: string;
    submittedAt: Date;
    documents: string[];
    status: string;
  }>;
  summary: {
    totalBids: number;
    validBids: number;
    disqualifiedBids: number;
    lowestBid: number;
    highestBid: number;
    averageBid: number;
  };
}

export interface ContractReportData {
  contract: {
    id: string;
    referenceNumber: string;
    title: string;
    value: number;
    currency: string;
    startDate: Date;
    endDate: Date;
    status: string;
  };
  buyer: {
    name: string;
    address: string;
    contact: string;
  };
  supplier: {
    name: string;
    address: string;
    contact: string;
    registrationNumber: string;
  };
  milestones: Array<{
    title: string;
    dueDate: Date;
    value: number;
    status: string;
  }>;
}

/**
 * Generate PDF content as HTML (for client-side PDF generation)
 * In production, this would use a library like jsPDF, pdfmake, or a server-side solution
 */
export function generateBidOpeningReportHTML(data: BidOpeningReportData): string {
  const formatCurrency = (amount: number) => `K ${amount.toLocaleString()}`;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-PG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bid Opening Report - ${data.session.tenderRef}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #dc2626;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #dc2626;
      font-size: 18pt;
      margin: 0;
    }
    .header h2 {
      color: #666;
      font-size: 12pt;
      margin: 5px 0 0 0;
      font-weight: normal;
    }
    .logo {
      width: 80px;
      height: auto;
      margin-bottom: 10px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      background: #f4f4f5;
      padding: 8px 12px;
      font-weight: bold;
      border-left: 4px solid #dc2626;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f8f8f8;
      font-weight: bold;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .info-item {
      padding: 5px 0;
    }
    .info-label {
      color: #666;
      font-size: 10pt;
    }
    .info-value {
      font-weight: bold;
    }
    .summary-box {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 15px;
      border-radius: 5px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      text-align: center;
    }
    .summary-item {
      background: white;
      padding: 10px;
      border-radius: 4px;
    }
    .summary-value {
      font-size: 18pt;
      font-weight: bold;
      color: #dc2626;
    }
    .summary-label {
      font-size: 9pt;
      color: #666;
    }
    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-top: 50px;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 50px;
      padding-top: 5px;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9pt;
      color: #666;
      padding: 10px;
      border-top: 1px solid #ddd;
    }
    .highlight {
      background: #dcfce7;
    }
    .status-valid {
      color: #16a34a;
      font-weight: bold;
    }
    .status-disqualified {
      color: #dc2626;
      font-weight: bold;
    }
    @media print {
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BID OPENING REPORT</h1>
    <h2>National Procurement Commission - Papua New Guinea</h2>
  </div>

  <div class="section">
    <div class="section-title">TENDER INFORMATION</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Reference Number</div>
        <div class="info-value">${data.session.tenderRef}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Opening Date</div>
        <div class="info-value">${formatDate(data.session.openingDate)}</div>
      </div>
      <div class="info-item" style="grid-column: span 2;">
        <div class="info-label">Tender Title</div>
        <div class="info-value">${data.session.tenderTitle}</div>
      </div>
      ${data.session.venue ? `
      <div class="info-item">
        <div class="info-label">Venue</div>
        <div class="info-value">${data.session.venue}</div>
      </div>
      ` : ''}
      ${data.session.completedAt ? `
      <div class="info-item">
        <div class="info-label">Completed At</div>
        <div class="info-value">${formatDate(data.session.completedAt)}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">OPENING COMMITTEE</div>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 35%;">Name</th>
          <th style="width: 30%;">Role</th>
          <th style="width: 15%;">Attendance</th>
          <th style="width: 15%;">Signature</th>
        </tr>
      </thead>
      <tbody>
        ${data.committee.map((member, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${member.name}</td>
          <td>${member.role}</td>
          <td>${member.attended ? '✓ Present' : '✗ Absent'}</td>
          <td>${member.signature || ''}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">BIDS RECEIVED</div>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">Rank</th>
          <th style="width: 30%;">Bidder Name</th>
          <th style="width: 20%;">Bid Amount</th>
          <th style="width: 20%;">Submitted At</th>
          <th style="width: 10%;">Documents</th>
          <th style="width: 15%;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.bids.map((bid) => `
        <tr class="${bid.rank === 1 ? 'highlight' : ''}">
          <td><strong>${bid.rank}</strong></td>
          <td>${bid.supplierName}</td>
          <td><strong>${formatCurrency(bid.bidAmount)}</strong></td>
          <td>${formatDate(bid.submittedAt)}</td>
          <td>${bid.documents.length} files</td>
          <td class="${bid.status === 'VALID' ? 'status-valid' : 'status-disqualified'}">${bid.status}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">SUMMARY</div>
    <div class="summary-box">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-value">${data.summary.totalBids}</div>
          <div class="summary-label">Total Bids Received</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.summary.validBids}</div>
          <div class="summary-label">Valid Bids</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.summary.disqualifiedBids}</div>
          <div class="summary-label">Disqualified</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(data.summary.lowestBid)}</div>
          <div class="summary-label">Lowest Bid</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(data.summary.highestBid)}</div>
          <div class="summary-label">Highest Bid</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(data.summary.averageBid)}</div>
          <div class="summary-label">Average Bid</div>
        </div>
      </div>
    </div>
  </div>

  <div class="signature-section">
    <div class="section-title">CERTIFICATION</div>
    <p>We, the undersigned members of the Bid Opening Committee, hereby certify that:</p>
    <ol>
      <li>All sealed bids were opened in the presence of the committee members listed above.</li>
      <li>The bid amounts recorded above are accurate as read from the submitted documents.</li>
      <li>No bids were received after the official closing time.</li>
      <li>This report is a true and accurate record of the bid opening proceedings.</li>
    </ol>

    <div class="signature-grid">
      ${data.committee.filter(m => m.attended).slice(0, 3).map((member) => `
      <div class="signature-box">
        <div class="signature-line">
          <strong>${member.name}</strong><br>
          <span style="font-size: 9pt;">${member.role}</span>
        </div>
      </div>
      `).join('')}
    </div>
  </div>

  <div class="footer">
    <p>Generated by PNG eGP System on ${formatDate(new Date())} | Document ID: ${data.session.id}</p>
    <p>This is an official document of the National Procurement Commission, Papua New Guinea</p>
  </div>
</body>
</html>
`;
}

/**
 * Download PDF using browser's print functionality
 */
export function downloadBidOpeningReport(data: BidOpeningReportData): void {
  const html = generateBidOpeningReportHTML(data);

  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

/**
 * Generate PDF blob for programmatic download
 * In production, this would use a proper PDF library
 */
export async function generatePDFBlob(html: string): Promise<Blob> {
  // For demo purposes, we'll return the HTML as a blob
  // In production, use libraries like html2pdf.js, jsPDF, or server-side rendering
  return new Blob([html], { type: 'text/html' });
}

/**
 * Generate contract summary report
 */
export function generateContractReportHTML(data: ContractReportData): string {
  const formatCurrency = (amount: number) => `K ${amount.toLocaleString()}`;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-PG', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contract Summary - ${data.contract.referenceNumber}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #dc2626;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #dc2626;
      font-size: 18pt;
      margin: 0;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      background: #f4f4f5;
      padding: 8px 12px;
      font-weight: bold;
      border-left: 4px solid #dc2626;
      margin-bottom: 15px;
    }
    .party-box {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #f8f8f8;
    }
    .value-highlight {
      font-size: 24pt;
      font-weight: bold;
      color: #dc2626;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRACT SUMMARY</h1>
    <h2>${data.contract.referenceNumber}</h2>
  </div>

  <div class="section">
    <div class="section-title">CONTRACT DETAILS</div>
    <p><strong>Title:</strong> ${data.contract.title}</p>
    <div class="value-highlight">
      ${formatCurrency(data.contract.value)}
    </div>
    <p><strong>Period:</strong> ${formatDate(data.contract.startDate)} to ${formatDate(data.contract.endDate)}</p>
    <p><strong>Status:</strong> ${data.contract.status}</p>
  </div>

  <div class="section">
    <div class="section-title">PARTIES</div>
    <div class="party-box">
      <strong>Buyer</strong><br>
      ${data.buyer.name}<br>
      ${data.buyer.address}<br>
      ${data.buyer.contact}
    </div>
    <div class="party-box">
      <strong>Supplier</strong><br>
      ${data.supplier.name} (${data.supplier.registrationNumber})<br>
      ${data.supplier.address}<br>
      ${data.supplier.contact}
    </div>
  </div>

  <div class="section">
    <div class="section-title">MILESTONES</div>
    <table>
      <thead>
        <tr>
          <th>Milestone</th>
          <th>Due Date</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.milestones.map((m) => `
        <tr>
          <td>${m.title}</td>
          <td>${formatDate(m.dueDate)}</td>
          <td>${formatCurrency(m.value)}</td>
          <td>${m.status}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
`;
}
