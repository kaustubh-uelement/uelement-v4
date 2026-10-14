// @ts-check
import { jsPDF } from 'jspdf';
import { UELEMENT_WHITE_LOGO_BASE64 } from './uelement-logo.mjs';

/**
 * Generates an authentic, board-level Post-Quantum Cryptographic Assessment PDF
 * matching the UElement / Vyu enterprise brand design.
 * 
 * @param {Object} params
 * @param {any} params.results
 * @param {any} [params.profile]
 * @returns {Buffer}
 */
export function generateAssessmentPdf({ results, profile = {} }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const W = 595.28;
  const H = 841.89;
  const M = 42;
  let y = 0;
  let page = 1;

  const NAVY = [7, 23, 57];
  const GOLD = [200, 138, 62];
  const DARK_TEXT = [25, 30, 42];
  const BODY_TEXT = [65, 72, 84];
  const MUTED_TEXT = [115, 125, 138];
  const LIGHT_BG = [248, 250, 253];
  const BORDER_COLOR = [224, 230, 238];

  const clientName = profile?.name || 'Enterprise Executive';
  const clientCompany = profile?.company || '';
  const clientRole = profile?.role || profile?.title || '';
  const assessedFor = clientCompany
    ? `${clientName} · ${clientCompany}`
    : clientRole
      ? `${clientName} · ${clientRole}`
      : clientName;

  const targetLabel = results.target || 'Enterprise Asset';

  const stats = results.stats || {
    total: results.cbom?.length || 0,
    broken: results.cbom?.filter((c) => c.verdict === 'broken').length || 0,
    weak: results.cbom?.filter((c) => c.verdict === 'weak').length || 0,
    safe: results.cbom?.filter((c) => c.verdict === 'safe').length || 0,
  };

  const printHeader = () => {
    // Deep navy top banner
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.rect(0, 0, W, 74, 'F');

    // Top gold accent rule
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.rect(0, 0, W, 2.5, 'F');

    // Official UElement white brand logo
    try {
      doc.addImage(UELEMENT_WHITE_LOGO_BASE64, 'PNG', M, 20, 115, 35);
    } catch {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(M, 20, 35, 35, 4, 4, 'F');
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('92', M + 9, 42);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('UELEMENT', M + 44, 42);
    }

    // Vertical divider line in header
    doc.setDrawColor(40, 60, 100);
    doc.setLineWidth(0.7);
    doc.line(M + 125, 16, M + 125, 60);

    // Header metadata & title
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('U92 QUANTUM SECURITY PRACTICE', M + 135, 27);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Vyu · Cryptographic Assessment Report', M + 135, 43);

    doc.setTextColor(190, 205, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('NIST FIPS 203/204/205 & HNDL Risk Evaluation', M + 135, 56);

    // Confidential Audit pill badge
    doc.setFillColor(20, 40, 80);
    doc.roundedRect(W - M - 96, 25, 96, 24, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(220, 232, 248);
    doc.text('CONFIDENTIAL AUDIT', W - M - 88, 40);

    y = 96;
  };

  const printFooter = (currPage) => {
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.setLineWidth(0.6);
    doc.line(M, H - 42, W - M, H - 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
    doc.text(
      'UElement Technologies Private Limited · Wakad, Pune, Maharashtra 411057, India · www.uelement.co · contact@uelement.co',
      M,
      H - 30
    );
    doc.text(
      'Vyu is an enterprise cryptographic evaluation platform from UElement U92 Quantum. Non-invasive technical diagnostic.',
      M,
      H - 20
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(BODY_TEXT[0], BODY_TEXT[1], BODY_TEXT[2]);
    doc.text(`Page ${currPage}`, W - M - 30, H - 20);
  };

  const checkPageRoom = (needed) => {
    if (y + needed > H - 56) {
      printFooter(page);
      doc.addPage();
      page++;
      printHeader();
    }
  };

  const drawSectionTitle = (title) => {
    checkPageRoom(38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(title, M, y + 4);
    y += 8;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(1.6);
    doc.line(M, y, M + 36, y);
    y += 14;
  };

  const drawParagraph = (text, size = 9) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(BODY_TEXT[0], BODY_TEXT[1], BODY_TEXT[2]);
    const lines = doc.splitTextToSize(text, W - M * 2);
    const needed = lines.length * 12 + 6;
    checkPageRoom(needed);
    lines.forEach((l, idx) => {
      doc.text(l, M, y + idx * 11.5);
    });
    y += lines.length * 11.5 + 8;
  };

  // ==========================================
  // PAGE 1: COVER & DASHBOARD
  // ==========================================
  printHeader();

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.text('Cryptographic Bill of Materials (CBOM)', M, y + 4);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text('Automated NIST FIPS 203/204/205 Quantum Risk & Migration Roadmap', M, y);
  y += 14;

  // Metadata Card
  const targetLines = doc.splitTextToSize(targetLabel, 235);
  const row1Height = Math.max(22, targetLines.length * 10.5 + 4);
  const row2Y = y + 16 + row1Height + 8;
  const cardHeight = row2Y - y + 24;

  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(M, y, W - M * 2, cardHeight, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text('TARGET ASSET', M + 14, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  targetLines.forEach((tl, idx) => {
    doc.text(tl, M + 14, y + 26 + idx * 10.5);
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text('SCAN CLASSIFICATION', M + 265, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.text(
    results.type === 'repo'
      ? 'Source Code & Manifest Inspection'
      : 'Endpoint & Protocol Handshake',
    M + 265,
    y + 26
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text('ASSESSED FOR', M + 14, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  doc.text(assessedFor, M + 14, row2Y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text('EVALUATION DATE', M + 265, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  const scanDate = results.when ? new Date(results.when) : new Date();
  const dateFormatted = scanDate.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  doc.text(dateFormatted, M + 265, row2Y + 11);

  y += cardHeight + 14;

  // Quantum Readiness Score & HNDL Risk Banner
  drawSectionTitle('Quantum Readiness Score & HNDL Risk');
  const scoreColor =
    results.score < 40 ? [220, 38, 38] : results.score < 70 ? [202, 138, 4] : [22, 163, 74];

  const scoreSummary = `${stats.broken} of ${stats.total} identified cryptographic primitives are breakable by Shor's algorithm, ${stats.weak} are weakened under Grover search, and ${stats.safe} hold today. Evaluated across a ${results.retention || 12}-year data retention horizon.`;
  const sumLines = doc.splitTextToSize(scoreSummary, W - M * 2 - 96);
  const scoreBannerHeight = Math.max(54, 26 + sumLines.length * 11);

  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(M, y, 82, 52, 4, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(String(results.score), M + 14, y + 34);
  doc.setFontSize(9.5);
  doc.text('/100', M + 48, y + 34);

  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(results.band || (results.score < 40 ? 'High Quantum Exposure' : 'Moderate Quantum Readiness'), M + 94, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(BODY_TEXT[0], BODY_TEXT[1], BODY_TEXT[2]);
  sumLines.forEach((l, idx) => {
    doc.text(l, M + 94, y + 26 + idx * 11);
  });

  y += scoreBannerHeight + 14;

  // Executive Summary
  drawSectionTitle('Executive Summary');
  drawParagraph(
    'This assessment compiles a complete cryptographic inventory of the target system and classifies every active primitive against post-quantum standards standardized by NIST (FIPS 203, 204, 205). Asymmetric cryptography (including RSA, ECDSA, ECDH, and classical Diffie-Hellman) will be completely broken once Cryptographically Relevant Quantum Computers (CRQCs) reach scale. Symmetric ciphers and hash functions experience effective security halving and require parameter expansion.'
  );
  drawParagraph(
    'The imminent threat is Harvest-Now-Decrypt-Later (HNDL): adversaries actively capture encrypted enterprise traffic today to retroactively decrypt it once Shor’s algorithm is operational. Data with an operational life beyond 2029 is already in jeopardy. Migration sequencing must therefore be governed by data longevity rather than legacy system criticality.'
  );

  // Cryptographic Bill of Materials (CBOM) Table
  drawSectionTitle('Cryptographic Bill of Materials (CBOM)');
  const colWidths = [112, 88, 96, 85, 130];
  const colX = [M, M + 112, M + 200, M + 296, M + 381];

  const renderTableHeader = () => {
    doc.setFillColor(240, 244, 250);
    doc.rect(M, y, W - M * 2, 18, 'F');
    doc.setDrawColor(215, 225, 240);
    doc.setLineWidth(0.6);
    doc.line(M, y + 18, W - M, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);

    const headers = [
      'Asset Name',
      'Active Primitive',
      'Security Purpose',
      'Verdict',
      'Recommended Move',
    ];
    headers.forEach((h, i) => {
      doc.text(h, colX[i] + 4, y + 12);
    });
    y += 22;
  };

  renderTableHeader();

  const allCbom = results.cbom || [];
  // Show up to 11 key items on page 1 for spacious, uncrowded layout matching brand guidelines
  const maxTableRows = 11;
  const rowsToShow = allCbom.slice(0, maxTableRows);
  const remainingCount = Math.max(0, (stats.total || allCbom.length) - rowsToShow.length);

  rowsToShow.forEach((row, rowIndex) => {
    const verdictLabel =
      row.verdict === 'broken'
        ? 'Broken (Shor)'
        : row.verdict === 'weak'
          ? 'Weakened (Grover)'
          : 'Quantum-Safe';

    const c0 = doc.splitTextToSize(String(row.asset || ''), colWidths[0] - 8);
    const c1 = doc.splitTextToSize(String(row.primitive || ''), colWidths[1] - 8);
    const c2 = doc.splitTextToSize(String(row.purpose || ''), colWidths[2] - 8);
    const c3 = doc.splitTextToSize(String(verdictLabel), colWidths[3] - 8);
    const c4 = doc.splitTextToSize(String(row.replacement || ''), colWidths[4] - 8);

    const maxLines = Math.max(c0.length, c1.length, c2.length, c3.length, c4.length);
    const rowHeight = maxLines * 10.5 + 8;

    if (y + rowHeight > H - 56) {
      printFooter(page);
      doc.addPage();
      page++;
      printHeader();
      renderTableHeader();
    }

    if (rowIndex % 2 === 1) {
      doc.setFillColor(252, 253, 255);
      doc.rect(M, y - 2, W - M * 2, rowHeight, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);

    c0.forEach((l, idx) => doc.text(l, colX[0] + 4, y + 7 + idx * 10.5));
    c1.forEach((l, idx) => doc.text(l, colX[1] + 4, y + 7 + idx * 10.5));
    c2.forEach((l, idx) => doc.text(l, colX[2] + 4, y + 7 + idx * 10.5));

    const verdictColor =
      row.verdict === 'broken'
        ? [220, 38, 38]
        : row.verdict === 'weak'
          ? [202, 138, 4]
          : [22, 163, 74];
    doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
    doc.setFont('helvetica', 'bold');
    c3.forEach((l, idx) => doc.text(l, colX[3] + 4, y + 7 + idx * 10.5));

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    c4.forEach((l, idx) => doc.text(l, colX[4] + 4, y + 7 + idx * 10.5));

    doc.setDrawColor(235, 240, 248);
    doc.setLineWidth(0.4);
    doc.line(M, y + rowHeight - 2, W - M, y + rowHeight - 2);

    y += rowHeight;
  });

  if (remainingCount > 0) {
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
    doc.text(`Plus ${remainingCount} additional cryptographic assets mapped in the CycloneDX 1.6 export.`, M, y + 8);
    y += 16;
  } else {
    y += 10;
  }

  // ==========================================
  // PAGE 2: KEY VULNERABILITIES & REMEDIATION
  // ==========================================
  const findings = results.findings || [];
  if (findings.length > 0) {
    // If not enough room to show title + first finding card, push cleanly to page 2
    if (y + 120 > H - 56) {
      printFooter(page);
      doc.addPage();
      page++;
      printHeader();
    }

    drawSectionTitle('Key Vulnerabilities & Remediation Actions');

    findings.forEach((finding) => {
      const sevColor =
        finding.sev === 'critical'
          ? [220, 38, 38]
          : finding.sev === 'high'
            ? [234, 88, 12]
            : finding.sev === 'medium'
              ? [202, 138, 4]
              : [100, 116, 139];

      const sevBg =
        finding.sev === 'critical'
          ? [254, 242, 242]
          : finding.sev === 'high'
            ? [255, 247, 237]
            : finding.sev === 'medium'
              ? [254, 252, 232]
              : [241, 245, 249];

      const titleLines = doc.splitTextToSize(finding.title || '', W - M * 2 - 76);
      const detailLines = doc.splitTextToSize(finding.detail || '', W - M * 2 - 20);
      const fixLines = doc.splitTextToSize(
        `Action: ${finding.fix || 'Review and upgrade primitive'}  [Standard: ${finding.std || 'NIST FIPS'}]`,
        W - M * 2 - 20
      );

      const cardHeaderHeight = Math.max(16, titleLines.length * 11 + 2);
      const cardBodyHeight = detailLines.length * 10.5 + fixLines.length * 10.5 + 14;
      const totalCardHeight = cardHeaderHeight + cardBodyHeight + 14;

      checkPageRoom(totalCardHeight + 8);

      doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
      doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
      doc.setLineWidth(0.6);
      doc.roundedRect(M, y, W - M * 2, totalCardHeight, 3, 3, 'FD');

      // Left severity accent strip
      doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.roundedRect(M, y, 3.5, totalCardHeight, 1.5, 1.5, 'F');

      // Severity badge
      doc.setFillColor(sevBg[0], sevBg[1], sevBg[2]);
      doc.roundedRect(M + 10, y + 6, 52, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.text(String(finding.sev || 'MED').toUpperCase(), M + 14, y + 16);

      // Title next to badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      titleLines.forEach((l, idx) => {
        doc.text(l, M + 68, y + 16 + idx * 11);
      });

      // Detail description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(BODY_TEXT[0], BODY_TEXT[1], BODY_TEXT[2]);
      const detailStartY = y + 8 + cardHeaderHeight;
      detailLines.forEach((l, idx) => {
        doc.text(l, M + 10, detailStartY + idx * 10.5);
      });

      // Remediation action
      const fixStartY = detailStartY + detailLines.length * 10.5 + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
      fixLines.forEach((l, idx) => {
        doc.text(l, M + 10, fixStartY + idx * 10.5);
      });

      y += totalCardHeight + 8;
    });

    y += 10;
  }

  // Helper to format concise phase badges (e.g. "Phase 1: ... (0–3 Months)" -> "PHASE 1 · 0–3 MONTHS")
  const formatPhaseBadge = (rawPhase, idx) => {
    const fallback = `PHASE ${idx + 1}`;
    if (!rawPhase || typeof rawPhase !== 'string') return fallback;
    const numMatch = rawPhase.match(/Phase\s*(\d+)/i);
    const phaseNum = numMatch ? `PHASE ${numMatch[1]}` : fallback;
    const durationMatch = rawPhase.match(/\(([^)]+)\)/) || rawPhase.match(/·\s*([^·\n]+)$/);
    if (durationMatch && durationMatch[1]) {
      const duration = durationMatch[1].trim().toUpperCase();
      return `${phaseNum} · ${duration}`;
    }
    if (rawPhase.length <= 22) {
      return rawPhase.toUpperCase();
    }
    return phaseNum;
  };

  // ==========================================
  // FOUR-PHASE PQC MIGRATION ROADMAP
  // ==========================================
  const planPhases = results.plan || [];
  if (planPhases.length > 0) {
    if (y + 100 > H - 56) {
      printFooter(page);
      doc.addPage();
      page++;
      printHeader();
    }

    drawSectionTitle('Four-Phase PQC Migration Roadmap');

    planPhases.forEach((phase, idx) => {
      const badgeText = formatPhaseBadge(phase.phase, idx);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      const textW = doc.getTextWidth(badgeText);
      const badgeW = Math.max(95, Math.ceil(textW + 16));
      const badgeH = 18;
      const titleX = M + badgeW + 12;
      const titleW = W - M - titleX;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      const titleLines = doc.splitTextToSize(phase.title || '', titleW);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const descLines = doc.splitTextToSize(phase.desc || '', titleW);

      const contentHeight = titleLines.length * 11 + descLines.length * 10.5 + 6;
      const phaseHeight = Math.max(badgeH + 8, contentHeight + 8);

      checkPageRoom(phaseHeight + 8);

      // Phase pill badge
      doc.setFillColor(245, 240, 230);
      doc.roundedRect(M, y, badgeW, badgeH, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.text(badgeText, M + 8, y + 12);

      // Phase title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      titleLines.forEach((l, i) => {
        doc.text(l, titleX, y + 12 + i * 11);
      });

      // Phase description
      const descStartY = y + 14 + titleLines.length * 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(BODY_TEXT[0], BODY_TEXT[1], BODY_TEXT[2]);
      descLines.forEach((l, i) => {
        doc.text(l, titleX, descStartY + i * 10.5);
      });

      y += phaseHeight + 10;
    });

    y += 10;
  }

  // ==========================================
  // ENGAGEMENT WITH UELEMENT U92 QUANTUM
  // ==========================================
  if (y + 80 > H - 56) {
    printFooter(page);
    doc.addPage();
    page++;
    printHeader();
  }

  drawSectionTitle('Engagement with UElement U92 Quantum');
  drawParagraph(
    'Vyu provides single-target scanning. Estate-wide discovery, continuous automated CBOM monitoring, hardware security module (HSM) migration, and crypto-agility implementation are delivered by UElement U92 Quantum, our dedicated quantum security practice. Contact our cryptographic engineering team at contact@uelement.co or call +91 7620690561 to review your assessment.',
    8.5
  );

  // Final page footer
  printFooter(page);

  // Return Node Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
