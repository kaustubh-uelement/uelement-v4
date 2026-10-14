// @ts-check
import { jsPDF } from 'jspdf';

/**
 * Palette matching UElement / Vyuh enterprise theme
 */
const PALETTE = {
  navy: [7, 23, 57],          // #071739
  navyDark: [4, 14, 38],      // #040e26
  navyLight: [14, 38, 84],    // #0e2654
  gold: [200, 138, 62],       // #c88a3e
  goldLight: [245, 235, 218], // #f5ebda
  darkText: [15, 23, 42],     // #0f172a
  bodyText: [51, 65, 85],     // #334155
  mutedText: [100, 116, 139], // #64748b
  lightBg: [248, 250, 252],   // #f8fafc
  rowAltBg: [243, 246, 251],  // #f3f6fb
  borderColor: [226, 232, 240], // #e2e8f0
  borderDark: [203, 213, 225],  // #cbd5e1
  critical: [220, 38, 38],    // #dc2626
  criticalBg: [254, 242, 242],
  high: [234, 88, 12],        // #ea580c
  highBg: [255, 247, 237],
  medium: [202, 138, 4],      // #ca8a04
  mediumBg: [254, 252, 232],
  safe: [22, 163, 74],        // #16a34a
  safeBg: [240, 253, 244],
};

/**
 * @typedef {Object} CbomItem
 * @property {string} asset
 * @property {string} primitive
 * @property {string} purpose
 * @property {'broken'|'weak'|'safe'|string} verdict
 * @property {string} replacement
 */

/**
 * @typedef {Object} FindingItem
 * @property {string} id
 * @property {string} title
 * @property {'critical'|'high'|'medium'|'low'|string} sev
 * @property {string} detail
 * @property {string} fix
 * @property {string} std
 */

/**
 * @typedef {Object} PlanPhase
 * @property {string} phase
 * @property {string} title
 * @property {string} desc
 */

/**
 * @typedef {Object} ScanReportData
 * @property {string} target
 * @property {'url'|'repo'|string} [type]
 * @property {number} score
 * @property {string} band
 * @property {number} [retention]
 * @property {{ total: number, broken: number, weak: number, safe: number }} [stats]
 * @property {CbomItem[]} [cbom]
 * @property {FindingItem[]} [findings]
 * @property {PlanPhase[]} [plan]
 * @property {Date|string|number} [when]
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} [name]
 * @property {string} [company]
 * @property {string} [role]
 * @property {string} [title]
 * @property {string} [email]
 * @property {string} [purpose]
 */

/**
 * Generates an executive, board-level Post-Quantum Cryptographic Assessment PDF.
 * @param {Object} params
 * @param {ScanReportData} params.results
 * @param {UserProfile} [params.profile]
 * @returns {Buffer} PDF binary buffer
 */
export function generateAssessmentPdf({ results, profile = {} }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const W = 595.28;
  const H = 841.89;
  const M = 36;
  const contentW = W - M * 2; // 523.28 pt

  let y = 0;
  let pageNumber = 1;

  const targetLabel = (results.target || 'Enterprise Target')
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  const clientName = profile.name || 'Enterprise Security Executive';
  const clientCompany = profile.company || 'Enterprise Organization';
  const clientRole = profile.role || profile.title || 'Security Leadership';
  const scanDate = results.when ? new Date(results.when) : new Date();
  const dateStr = scanDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const stats = results.stats || {
    total: results.cbom?.length || 0,
    broken: results.cbom?.filter((c) => c.verdict === 'broken').length || 0,
    weak: results.cbom?.filter((c) => c.verdict === 'weak').length || 0,
    safe: results.cbom?.filter((c) => c.verdict === 'safe').length || 0,
  };

  /**
   * Helper: Print footer on current page
   * @param {number} p
   */
  function drawFooter(p) {
    const footerY = H - 32;
    doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
    doc.setLineWidth(0.6);
    doc.line(M, footerY - 8, W - M, footerY - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
    doc.text(
      'UElement Technologies · U92 Quantum Security Practice · contact@uelement.co · www.uelement.in',
      M,
      footerY + 4
    );
    doc.text(
      'Confidential Executive Diagnostic — Non-Invasive Cryptographic Intelligence & NIST FIPS Roadmap',
      M,
      footerY + 14
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PALETTE.bodyText[0], PALETTE.bodyText[1], PALETTE.bodyText[2]);
    doc.text(`Page ${p}`, W - M - 36, footerY + 8);
  }

  /**
   * Helper: Print running header for pages 2+
   */
  function drawRunningHeader() {
    doc.setFillColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
    doc.rect(0, 0, W, 36, 'F');
    doc.setFillColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
    doc.rect(0, 0, W, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('VYUH · CRYPTOGRAPHIC AUDIT REPORT', M, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
    doc.text(`Target: ${targetLabel}`, M + 190, 22);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 205, 225);
    doc.text('CONFIDENTIAL', W - M - 60, 22);

    y = 52;
  }

  /**
   * Helper: Ensure room on current page or start new page
   * @param {number} needed
   */
  function ensureRoom(needed) {
    if (y + needed > H - 46) {
      drawFooter(pageNumber);
      doc.addPage();
      pageNumber++;
      drawRunningHeader();
    }
  }

  /**
   * Helper: Section Title
   * @param {string} title
   */
  function drawSectionTitle(title) {
    ensureRoom(42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
    doc.text(title, M, y + 4);
    y += 11;

    doc.setDrawColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
    doc.setLineWidth(1.6);
    doc.line(M, y, M + 42, y);

    doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
    doc.setLineWidth(0.5);
    doc.line(M + 44, y, W - M, y);

    y += 14;
  }

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE DASHBOARD
  // ==========================================

  // Primary Header Banner
  doc.setFillColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.rect(0, 0, W, 72, 'F');

  // Top gold accent bar
  doc.setFillColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
  doc.rect(0, 0, W, 3, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
  doc.text('VYUH', M, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('· CRYPTOGRAPHIC BOM ASSESSMENT', M + 50, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 198, 224);
  doc.text('U92 Quantum Security Practice · NIST FIPS 203/204/205 & CNSA 2.0 Evaluation', M, 46);
  doc.text('Automated Cryptographic Discovery & Post-Quantum Migration Diagnostic', M, 58);

  // Confidential badge (top right)
  doc.setFillColor(14, 38, 84);
  doc.roundedRect(W - M - 110, 22, 110, 26, 4, 4, 'F');
  doc.setDrawColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(W - M - 110, 22, 110, 26, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CONFIDENTIAL AUDIT', W - M - 100, 38);

  y = 86;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text('Executive Cryptographic Health & Migration Report', M, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
  doc.text(
    `Comprehensive cryptographic inventory, quantum readiness scoring, and mitigation sequencing for ${targetLabel}`,
    M,
    y
  );
  y += 14;

  // Metadata Card (2x2 Grid)
  const metaBoxY = y;
  const metaBoxH = 58;
  doc.setFillColor(PALETTE.lightBg[0], PALETTE.lightBg[1], PALETTE.lightBg[2]);
  doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(M, metaBoxY, contentW, metaBoxH, 4, 4, 'FD');

  const halfW = contentW / 2;

  // Col 1, Row 1: Target
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
  doc.text('ASSESSED TARGET', M + 12, metaBoxY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  const targetLines = doc.splitTextToSize(targetLabel, halfW - 24);
  doc.text(targetLines[0] || targetLabel, M + 12, metaBoxY + 26);

  // Col 1, Row 2: Scan Scope
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
  doc.text('ANALYSIS CLASSIFICATION', M + 12, metaBoxY + 39);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(PALETTE.bodyText[0], PALETTE.bodyText[1], PALETTE.bodyText[2]);
  doc.text(
    results.type === 'repo'
      ? 'Source Code & Cryptographic Dependencies Inspection'
      : 'Network Edge Handshake & Protocol Probing',
    M + 12,
    metaBoxY + 49
  );

  // Col 2, Row 1: Client
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
  doc.text('PREPARED FOR', M + halfW + 12, metaBoxY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  doc.text(`${clientName} · ${clientCompany}`, M + halfW + 12, metaBoxY + 26);

  // Col 2, Row 2: Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
  doc.text('ASSESSMENT TIMESTAMP', M + halfW + 12, metaBoxY + 39);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(PALETTE.bodyText[0], PALETTE.bodyText[1], PALETTE.bodyText[2]);
  doc.text(dateStr, M + halfW + 12, metaBoxY + 49);

  y = metaBoxY + metaBoxH + 14;

  // Quantum Readiness Score & Exposure Breakdown Banner
  drawSectionTitle('Quantum Readiness Score & Risk Exposure');

  const scoreBannerY = y;
  const scoreBannerH = 68;
  const scoreColor =
    results.score < 40 ? PALETTE.critical : results.score < 70 ? PALETTE.medium : PALETTE.safe;

  // Score Box (Left)
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(M, scoreBannerY, 84, scoreBannerH, 4, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(String(results.score), M + 12, scoreBannerY + 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('/ 100', M + 48, scoreBannerY + 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PQC READINESS', M + 10, scoreBannerY + 54);

  // Risk Band & Breakdown Details (Right)
  const detailBoxX = M + 92;
  const detailBoxW = contentW - 92;

  doc.setFillColor(PALETTE.lightBg[0], PALETTE.lightBg[1], PALETTE.lightBg[2]);
  doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(detailBoxX, scoreBannerY, detailBoxW, scoreBannerH, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(results.band || 'Evaluation Complete', detailBoxX + 12, scoreBannerY + 16);

  // 4 Micro Metrics Pill Boxes
  const statBoxY = scoreBannerY + 24;
  const statW = (detailBoxW - 24 - 18) / 4;
  const statItems = [
    { label: 'TOTAL ASSETS', val: String(stats.total), color: PALETTE.navy },
    { label: 'SHOR BROKEN', val: String(stats.broken), color: PALETTE.critical },
    { label: 'GROVER WEAK', val: String(stats.weak), color: PALETTE.medium },
    { label: 'PQC SAFE', val: String(stats.safe), color: PALETTE.safe },
  ];

  statItems.forEach((st, idx) => {
    const sx = detailBoxX + 12 + idx * (statW + 6);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(sx, statBoxY, statW, 36, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
    doc.text(st.label, sx + 4, statBoxY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.text(st.val, sx + 6, statBoxY + 28);
  });

  y = scoreBannerY + scoreBannerH + 16;

  // Executive Summary Narrative
  drawSectionTitle('Executive Summary & HNDL Risk Exposure');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(PALETTE.bodyText[0], PALETTE.bodyText[1], PALETTE.bodyText[2]);

  const p1 = `This diagnostic compiles an authoritative inventory of cryptographic assets supporting ${targetLabel} and benchmarks each primitive against NIST Post-Quantum Cryptography standards (FIPS 203 ML-KEM, FIPS 204 ML-DSA, and FIPS 205 SLH-DSA). Asymmetric cryptographic primitives (including RSA, ECDSA, ECDH, and classical Diffie-Hellman) will be entirely compromised once Cryptographically Relevant Quantum Computers (CRQCs) reach operational capacity. Symmetric ciphers and hashing algorithms experience security degradation under Grover's algorithm.`;
  const p1Lines = doc.splitTextToSize(p1, contentW);
  p1Lines.forEach((l) => {
    doc.text(l, M, y);
    y += 11.5;
  });
  y += 4;

  const p2 = `Immediate Threat Modeling: The primary threat facing this perimeter is Harvest-Now-Decrypt-Later (HNDL). Adversaries are actively exfiltrating and archiving encrypted enterprise payloads today to retroactively decrypt them once quantum decryption is viable. Any data asset with an operational, compliance, or regulatory longevity extending past 2029 is already compromised at rest or in transit unless protected by hybrid post-quantum encapsulation (X25519MLKEM768).`;
  const p2Lines = doc.splitTextToSize(p2, contentW);
  p2Lines.forEach((l) => {
    doc.text(l, M, y);
    y += 11.5;
  });

  y += 12;

  // ==========================================
  // PAGE 2+: CRYPTOGRAPHIC BOM (CBOM) TABLE
  // ==========================================
  ensureRoom(140);
  drawSectionTitle('Cryptographic Bill of Materials (CBOM)');

  // Table Column Definitions
  // Total contentW = 523.28 pt
  const colWidths = [115, 85, 95, 90, 138];
  const colX = [
    M,
    M + colWidths[0],
    M + colWidths[0] + colWidths[1],
    M + colWidths[0] + colWidths[1] + colWidths[2],
    M + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
  ];

  function drawTableHeader() {
    doc.setFillColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
    doc.rect(M, y, contentW, 18, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);

    const headers = [
      'ASSET IDENTIFIER',
      'ACTIVE PRIMITIVE',
      'SECURITY PURPOSE',
      'QUANTUM VERDICT',
      'NIST REPLACEMENT ROADMAP',
    ];

    headers.forEach((h, i) => {
      doc.text(h, colX[i] + 4, y + 12);
    });

    y += 18;
  }

  drawTableHeader();

  const cbomRows = results.cbom || [];
  cbomRows.forEach((row, rowIndex) => {
    const verdict = row.verdict === 'broken' ? 'Broken (Shor)' : row.verdict === 'weak' ? 'Weakened (Grover)' : 'Quantum-Safe';
    const c0 = doc.splitTextToSize(String(row.asset || 'Unnamed Asset'), colWidths[0] - 8);
    const c1 = doc.splitTextToSize(String(row.primitive || 'Unknown'), colWidths[1] - 8);
    const c2 = doc.splitTextToSize(String(row.purpose || 'General'), colWidths[2] - 8);
    const c3 = doc.splitTextToSize(verdict, colWidths[3] - 8);
    const c4 = doc.splitTextToSize(String(row.replacement || 'None required'), colWidths[4] - 8);

    const maxLines = Math.max(c0.length, c1.length, c2.length, c3.length, c4.length);
    const rowHeight = Math.max(18, maxLines * 10 + 6);

    // If row doesn't fit on current page, break cleanly
    if (y + rowHeight > H - 46) {
      drawFooter(pageNumber);
      doc.addPage();
      pageNumber++;
      drawRunningHeader();
      drawTableHeader();
    }

    // Alternating row background
    if (rowIndex % 2 === 1) {
      doc.setFillColor(PALETTE.rowAltBg[0], PALETTE.rowAltBg[1], PALETTE.rowAltBg[2]);
      doc.rect(M, y, contentW, rowHeight, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(PALETTE.darkText[0], PALETTE.darkText[1], PALETTE.darkText[2]);

    c0.forEach((l, i) => doc.text(l, colX[0] + 4, y + 10 + i * 9.5));
    c1.forEach((l, i) => doc.text(l, colX[1] + 4, y + 10 + i * 9.5));
    c2.forEach((l, i) => doc.text(l, colX[2] + 4, y + 10 + i * 9.5));

    // Verdict with color
    const vColor =
      row.verdict === 'broken'
        ? PALETTE.critical
        : row.verdict === 'weak'
          ? PALETTE.medium
          : PALETTE.safe;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(vColor[0], vColor[1], vColor[2]);
    c3.forEach((l, i) => doc.text(l, colX[3] + 4, y + 10 + i * 9.5));

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(PALETTE.darkText[0], PALETTE.darkText[1], PALETTE.darkText[2]);
    c4.forEach((l, i) => doc.text(l, colX[4] + 4, y + 10 + i * 9.5));

    // Cell bottom divider
    doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
    doc.setLineWidth(0.4);
    doc.line(M, y + rowHeight, W - M, y + rowHeight);

    y += rowHeight;
  });

  y += 16;

  // ==========================================
  // FINDINGS & KEY REMEDIATIONS
  // ==========================================
  const findings = results.findings || [];
  if (findings.length > 0) {
    ensureRoom(100);
    drawSectionTitle('Key Vulnerabilities & Remediation Actions');

    findings.forEach((finding) => {
      const sev = (finding.sev || 'medium').toLowerCase();
      const sevColor =
        sev === 'critical'
          ? PALETTE.critical
          : sev === 'high'
            ? PALETTE.high
            : sev === 'medium'
              ? PALETTE.medium
              : PALETTE.mutedText;

      const sevBg =
        sev === 'critical'
          ? PALETTE.criticalBg
          : sev === 'high'
            ? PALETTE.highBg
            : sev === 'medium'
              ? PALETTE.mediumBg
              : PALETTE.lightBg;

      const titleLines = doc.splitTextToSize(finding.title || 'Untitled Finding', contentW - 20);
      const detailLines = doc.splitTextToSize(finding.detail || '', contentW - 24);
      const fixLines = doc.splitTextToSize(
        `Action: ${finding.fix || 'Review and upgrade primitive'} · [Standard: ${finding.std || 'NIST FIPS'}]`,
        contentW - 28
      );

      const headerH = 18;
      const titleH = titleLines.length * 11;
      const detailH = detailLines.length * 10;
      const fixH = fixLines.length * 10 + 12;
      const cardHeight = headerH + titleH + detailH + fixH + 16;

      ensureRoom(cardHeight + 8);

      // Card Background & Border
      doc.setFillColor(PALETTE.lightBg[0], PALETTE.lightBg[1], PALETTE.lightBg[2]);
      doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
      doc.setLineWidth(0.6);
      doc.roundedRect(M, y, contentW, cardHeight, 3, 3, 'FD');

      // Left Accent Strip
      doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.roundedRect(M, y, 4, cardHeight, 1.5, 1.5, 'F');

      // Severity Pill Badge
      const badgeW = 54;
      doc.setFillColor(sevBg[0], sevBg[1], sevBg[2]);
      doc.roundedRect(M + 12, y + 6, badgeW, 13, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.text(sev.toUpperCase(), M + 16, y + 15);

      // Standard tag (right of badge)
      if (finding.std) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(PALETTE.mutedText[0], PALETTE.mutedText[1], PALETTE.mutedText[2]);
        doc.text(`Reference: ${finding.std}`, M + badgeW + 20, y + 15);
      }

      // Title on its own clear row
      let curY = y + headerH + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
      titleLines.forEach((l) => {
        doc.text(l, M + 12, curY);
        curY += 11;
      });

      // Detail description
      curY += 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(PALETTE.bodyText[0], PALETTE.bodyText[1], PALETTE.bodyText[2]);
      detailLines.forEach((l) => {
        doc.text(l, M + 12, curY);
        curY += 10;
      });

      // Action sub-box
      curY += 4;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(M + 10, curY, contentW - 20, fixH, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
      fixLines.forEach((l, idx) => {
        doc.text(l, M + 16, curY + 9 + idx * 9.5);
      });

      y += cardHeight + 8;
    });

    y += 8;
  }

  // ==========================================
  // FOUR-PHASE PQC MIGRATION ROADMAP
  // ==========================================
  const planPhases = results.plan || [];
  if (planPhases.length > 0) {
    ensureRoom(100);
    drawSectionTitle('Four-Phase Post-Quantum Migration Roadmap');

    planPhases.forEach((phase) => {
      const phaseTitleLines = doc.splitTextToSize(phase.title || '', contentW - 32);
      const descLines = doc.splitTextToSize(phase.desc || '', contentW - 32);

      const headerHeight = 18;
      const titleHeight = phaseTitleLines.length * 11;
      const descHeight = descLines.length * 10;
      const cardHeight = headerHeight + titleHeight + descHeight + 16;

      ensureRoom(cardHeight + 8);

      // Card Background
      doc.setFillColor(PALETTE.lightBg[0], PALETTE.lightBg[1], PALETTE.lightBg[2]);
      doc.setDrawColor(PALETTE.borderColor[0], PALETTE.borderColor[1], PALETTE.borderColor[2]);
      doc.setLineWidth(0.6);
      doc.roundedRect(M, y, contentW, cardHeight, 3, 3, 'FD');

      // Left Accent Strip (Gold)
      doc.setFillColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
      doc.roundedRect(M, y, 4, cardHeight, 1.5, 1.5, 'F');

      // Phase Header Tag (e.g. Phase 1: Immediate Ingress Protection (0–3 Months))
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
      doc.text(phase.phase.toUpperCase(), M + 14, y + 14);

      let curY = y + headerHeight + 4;

      // Phase Action Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
      phaseTitleLines.forEach((l) => {
        doc.text(l, M + 14, curY);
        curY += 11;
      });

      // Description
      curY += 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(PALETTE.bodyText[0], PALETTE.bodyText[1], PALETTE.bodyText[2]);
      descLines.forEach((l) => {
        doc.text(l, M + 14, curY);
        curY += 10;
      });

      y += cardHeight + 8;
    });

    y += 8;
  }

  // ==========================================
  // ENGAGEMENT & NEXT STEPS
  // ==========================================
  ensureRoom(90);
  drawSectionTitle('Engagement with UElement U92 Quantum Practice');

  doc.setFillColor(PALETTE.navy[0], PALETTE.navy[1], PALETTE.navy[2]);
  const engBoxH = 58;
  doc.roundedRect(M, y, contentW, engBoxH, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(PALETTE.gold[0], PALETTE.gold[1], PALETTE.gold[2]);
  doc.text('ESTATE-WIDE CRYPTOGRAPHIC DISCOVERY & AUTOMATED PQC MIGRATION', M + 16, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(230, 238, 248);
  const engText =
    'Vyuh delivers single-target cryptographic diagnostics. For continuous automated CBOM generation across CI/CD, Hardware Security Module (HSM) quantum transitions, and crypto-agility proxy deployment, contact the UElement U92 Quantum Engineering team:';
  const engLines = doc.splitTextToSize(engText, contentW - 32);
  engLines.forEach((l, i) => {
    doc.text(l, M + 16, y + 30 + i * 10);
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Direct Advisory: contact@uelement.co  |  Web: www.uelement.in', M + 16, y + 50);

  y += engBoxH + 12;

  // Print footer on the final page
  drawFooter(pageNumber);

  // Return Node Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
