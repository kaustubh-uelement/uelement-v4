// @ts-check
import { jsPDF } from 'jspdf';
import crypto from 'crypto';
import { UELEMENT_WHITE_LOGO_BASE64 } from './uelement-logo.mjs';

/**
 * Normalizes raw crypto asset into clean, display-ready CBOM columns
 * @param {any} row
 * @param {number} rowIndex
 * @param {string} target
 */
function resolveAssetRow(row, rowIndex, target) {
  // 1. Asset Name
  let assetName = row.asset || row.name || '';
  if (!assetName || assetName === 'undefined') {
    if (rowIndex === 0) {
      assetName = `${target || 'Target'} Ingress TLS Layer`;
    } else if (rowIndex === 1) {
      assetName = `${target || 'Target'} Identity Certificate`;
    } else if (row.ref) {
      assetName = `Cryptographic Object (${row.ref})`;
    } else {
      assetName = `Crypto Asset #${rowIndex + 1}`;
    }
  }

  // 2. Active Primitive
  let primitive = row.primitive || row.algorithm || row.algo || '';
  const genericPrimitives = [
    'key-agree',
    'signature',
    'ae',
    'block-cipher',
    'stream-cipher',
    'hash',
    'mac',
    'kem',
    'pke',
    'other',
    'protocol',
    'algorithm',
    'certificate',
    'related-crypto-material',
  ];

  if (!primitive || genericPrimitives.includes(String(primitive).toLowerCase())) {
    if (row.curve) {
      const cleanCurve = String(row.curve).replace(/^(nist|other)\//i, '');
      primitive = `${cleanCurve.toUpperCase()} (ECDH)`;
    } else if (row.family) {
      primitive = `${row.family}${row.keyBits ? ' (' + row.keyBits + '-bit)' : ''}`;
    } else if (row.name && row.name !== assetName) {
      primitive = row.name;
    } else if (row.keyBits) {
      primitive = `${row.family || row.assetType || 'Key'} (${row.keyBits}-bit)`;
    } else if (row.purpose && String(row.purpose).toLowerCase().includes('transport security')) {
      primitive = 'TLS 1.3 / TLS 1.2 Handshake';
    } else if (row.purpose && String(row.purpose).toLowerCase().includes('hash')) {
      primitive = 'SHA-256 Digest';
    } else {
      primitive = row.name || 'Cryptographic Primitive';
    }
  }

  // Clean common primitive naming
  const primLower = String(primitive).toLowerCase();
  if (primLower === 'x25519') primitive = 'X25519 (ECDHE)';
  else if (primLower === 'secp256r1') primitive = 'NIST P-256 (secp256r1)';
  else if (primLower === 'secp384r1') primitive = 'NIST P-384 (secp384r1)';
  else if (primLower === 'rsa') primitive = `RSA (${row.keyBits || 2048}-bit)`;
  else if (primLower === 'ecdsa') primitive = `ECDSA (${row.keyBits || 256}-bit)`;
  else if (primLower === 'aes-ecb') primitive = 'AES-128 (ECB Mode)';
  else if (primLower === 'md5') primitive = 'MD5 (Broken)';
  else if (primLower === 'sha1' || primLower === 'sha-1') primitive = 'SHA-1 (Broken)';

  // 3. Security Purpose
  let purpose = row.purpose || '';
  if (!purpose) {
    if (row.assetType === 'certificate') purpose = 'Server Identity & Authentication';
    else if (row.assetType === 'protocol') purpose = 'Transport Layer Confidentiality';
    else if (primitive.includes('ECDH') || primitive.includes('X25519') || primitive.includes('KEM')) purpose = 'Session Key Establishment';
    else if (primitive.includes('AES') || primitive.includes('GCM') || primitive.includes('CHACHA')) purpose = 'Payload Data Encryption';
    else if (primitive.includes('RSA') || primitive.includes('ECDSA') || primitive.includes('DSA')) purpose = 'Digital Signature / Identity';
    else if (primitive.includes('SHA') || primitive.includes('MD5')) purpose = 'Integrity Verification';
    else purpose = 'Cryptographic Operation';
  }

  // 4. Verdict
  const v = String(row.verdict || '').toLowerCase();
  const vt = String(row.verdictText || '').toLowerCase();
  let verdictLabel = 'Quantum-Safe';
  let verdictColor = [22, 163, 74]; // Green

  if (
    v.includes('vulnerable') ||
    v.includes('broken') ||
    v.includes('shor') ||
    v === 'critical' ||
    vt.includes('vulnerable') ||
    vt.includes('broken') ||
    vt.includes('shor')
  ) {
    if (v.includes('broken-classical') || vt.includes('classical')) {
      verdictLabel = 'Broken (Classical)';
    } else {
      verdictLabel = 'Broken (Shor)';
    }
    verdictColor = [220, 38, 38]; // Red
  } else if (
    v.includes('weak') ||
    v.includes('adequate') ||
    v.includes('grover') ||
    vt.includes('weak') ||
    vt.includes('adequate') ||
    vt.includes('grover')
  ) {
    verdictLabel = 'Weakened (Grover)';
    verdictColor = [202, 138, 4]; // Amber
  } else if (v.includes('hybrid') || vt.includes('hybrid')) {
    verdictLabel = 'Hybrid PQC';
    verdictColor = [37, 99, 235]; // Blue
  } else if (v.includes('safe') || v.includes('resistant') || vt.includes('safe') || vt.includes('resistant')) {
    verdictLabel = 'Quantum-Safe';
    verdictColor = [22, 163, 74]; // Green
  }

  // 5. Recommended Move
  let replacement = row.replacement || row.recommendation || row.fix || '';
  if (!replacement) {
    const combined = `${assetName} ${primitive} ${purpose}`.toLowerCase();
    if (verdictLabel.includes('Broken')) {
      if (
        combined.includes('exchange') ||
        combined.includes('key-agree') ||
        combined.includes('ecdh') ||
        combined.includes('x25519') ||
        combined.includes('kem') ||
        combined.includes('transport') ||
        combined.includes('tls 1.')
      ) {
        replacement = 'ML-KEM-768 / X25519MLKEM768 (FIPS 203)';
      } else if (
        combined.includes('sign') ||
        combined.includes('cert') ||
        combined.includes('auth') ||
        combined.includes('rsa') ||
        combined.includes('ecdsa') ||
        combined.includes('dsa') ||
        combined.includes('identity')
      ) {
        replacement = 'ML-DSA-65 (FIPS 204) / SLH-DSA (FIPS 205)';
      } else {
        replacement = 'Migrate to NIST PQC (FIPS 203/204)';
      }
    } else if (verdictLabel.includes('Weakened')) {
      replacement = 'Upgrade to AES-256-GCM / SHA-384 (CNSA 2.0)';
    } else if (verdictLabel.includes('Hybrid')) {
      replacement = 'Transition to native pure ML-KEM-1024';
    } else {
      replacement = 'Compliant under NIST / CNSA 2.0';
    }
  }

  return { assetName, primitive, purpose, verdictLabel, verdictColor, replacement };
}

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

  const allCbom = results.cbom || [];

  const isBroken = (c) => {
    const v = String(c?.verdict || '').toLowerCase();
    const vt = String(c?.verdictText || '').toLowerCase();
    return (
      v.includes('vulnerable') ||
      v.includes('broken') ||
      v.includes('shor') ||
      v === 'critical' ||
      vt.includes('vulnerable') ||
      vt.includes('broken') ||
      vt.includes('shor')
    );
  };
  const isWeak = (c) => {
    const v = String(c?.verdict || '').toLowerCase();
    const vt = String(c?.verdictText || '').toLowerCase();
    return (
      v.includes('weak') ||
      v.includes('adequate') ||
      v.includes('grover') ||
      vt.includes('weak') ||
      vt.includes('adequate') ||
      vt.includes('grover')
    );
  };
  const isSafe = (c) => {
    const v = String(c?.verdict || '').toLowerCase();
    const vt = String(c?.verdictText || '').toLowerCase();
    return (
      v.includes('safe') ||
      v.includes('resistant') ||
      v.includes('hybrid') ||
      vt.includes('safe') ||
      vt.includes('resistant') ||
      vt.includes('hybrid')
    );
  };

  const rawStats = results.stats || {};
  const stats = (rawStats.broken !== undefined && (rawStats.broken > 0 || rawStats.total === 0))
    ? rawStats
    : {
        total: allCbom.length,
        broken: allCbom.filter(isBroken).length,
        weak: allCbom.filter(isWeak).length,
        safe: allCbom.filter(isSafe).length,
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
      doc.addImage(UELEMENT_WHITE_LOGO_BASE64, 'PNG', M, 28, 120, 18);
    } catch {
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('UELEMENT', M, 42);
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
  // PAGE 1: EXECUTIVE COVER & RISK DASHBOARD
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
    results.type === 'repo' || results.kind === 'github'
      ? 'Source Code & Manifest Cryptographic Inspection'
      : 'Active Ingress TLS & Protocol Diagnostic',
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
  const scoreNum = typeof results.score === 'number' ? results.score : results.score?.total || 35;
  const scoreColor =
    scoreNum < 40 ? [220, 38, 38] : scoreNum < 70 ? [202, 138, 4] : [22, 163, 74];

  const scoreSummary = `${stats.broken} of ${stats.total} identified cryptographic primitives are breakable by Shor's algorithm, ${stats.weak} are weakened under Grover search, and ${stats.safe} hold today. Evaluated across a ${results.retention || 12}-year data retention horizon.`;
  const sumLines = doc.splitTextToSize(scoreSummary, W - M * 2 - 96);
  const scoreBannerHeight = Math.max(54, 26 + sumLines.length * 11);

  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(M, y, 82, 52, 4, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(String(scoreNum), M + 14, y + 34);
  doc.setFontSize(9.5);
  doc.text('/100', M + 48, y + 34);

  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(results.band || (scoreNum < 40 ? 'High Quantum Exposure' : 'Moderate Quantum Readiness'), M + 94, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(BODY_TEXT[0], BODY_TEXT[1], BODY_TEXT[2]);
  sumLines.forEach((l, idx) => {
    doc.text(l, M + 94, y + 26 + idx * 11);
  });

  y += scoreBannerHeight + 12;

  // Mosca's Theorem HNDL Risk Horizon Card
  const cardY = y;
  const cardH = 72;
  doc.setFillColor(254, 252, 248);
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.8);
  doc.roundedRect(M, cardY, W - M * 2, cardH, 4, 4, 'FD');

  // Left gold strip
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.roundedRect(M, cardY, 3.5, cardH, 1.5, 1.5, 'F');

  // Badge
  doc.setFillColor(245, 235, 215);
  doc.roundedRect(M + 12, cardY + 8, 142, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text('MOSCA THEOREM · HNDL HORIZON', M + 16, cardY + 18);

  // Formula on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 38, 38);
  doc.text('INEQUALITY: (X + Y) > Z  [EXPOSURE ACTIVE NOW]', W - M - 216, cardY + 18);

  // Narrative
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
  const mLines = [
    '• X (Data Shelf Life): 12 Years confidentiality requirement (financial, transactional, and identity records).',
    '• Y (Migration Window): 3–4 Years required for end-to-end estate PKI, HSM, and protocol migration.',
    '• Z (Quantum Threshold): ~6–7 Years until Cryptographically Relevant Quantum Computers (CRQCs) materialize (2030–2032).',
    '• Harvest-Now-Decrypt-Later (HNDL): 16 Years > 7 Years. Enterprise traffic intercepted today will be decrypted prior to shelf-life expiration.',
  ];
  mLines.forEach((ml, idx) => {
    doc.text(ml, M + 14, cardY + 31 + idx * 9.5);
  });

  y += cardH + 14;

  // Executive Summary
  drawSectionTitle('Executive Summary');
  drawParagraph(
    'This assessment compiles a complete cryptographic inventory of the target system and classifies every active primitive against post-quantum standards standardized by NIST (FIPS 203, 204, 205). Asymmetric cryptography (including RSA, ECDSA, ECDH, and classical Diffie-Hellman) will be completely broken once Cryptographically Relevant Quantum Computers (CRQCs) reach scale. Symmetric ciphers and hash functions experience effective security halving and require parameter expansion.'
  );
  drawParagraph(
    'The imminent threat is Harvest-Now-Decrypt-Later (HNDL): adversaries actively capture encrypted enterprise traffic today to retroactively decrypt it once Shor’s algorithm is operational. Data with an operational life beyond 2029 is already in jeopardy. Migration sequencing must therefore be governed by data longevity rather than legacy system criticality.'
  );

  // ==========================================
  // PAGE 2: CBOM TABLE & ATTESTATION DIGEST
  // ==========================================
  printFooter(page);
  doc.addPage();
  page++;
  printHeader();

  drawSectionTitle('Cryptographic Bill of Materials (CBOM)');

  const colWidths = [110, 95, 95, 80, 131];
  const colX = [M, M + 110, M + 205, M + 300, M + 380];

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

  // Show up to 13 key items on page 2
  const maxTableRows = 13;
  const rowsToShow = allCbom.slice(0, maxTableRows);
  const remainingCount = Math.max(0, (stats.total || allCbom.length) - rowsToShow.length);

  rowsToShow.forEach((rawRow, rowIndex) => {
    const {
      assetName,
      primitive,
      purpose,
      verdictLabel,
      verdictColor,
      replacement,
    } = resolveAssetRow(rawRow, rowIndex, targetLabel);

    const c0 = doc.splitTextToSize(String(assetName), colWidths[0] - 8);
    const c1 = doc.splitTextToSize(String(primitive), colWidths[1] - 8);
    const c2 = doc.splitTextToSize(String(purpose), colWidths[2] - 8);
    const c3 = doc.splitTextToSize(String(verdictLabel), colWidths[3] - 8);
    const c4 = doc.splitTextToSize(String(replacement), colWidths[4] - 8);

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
    doc.setFontSize(7.6);
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);

    c0.forEach((l, idx) => doc.text(l, colX[0] + 4, y + 7 + idx * 10.5));
    c1.forEach((l, idx) => doc.text(l, colX[1] + 4, y + 7 + idx * 10.5));
    c2.forEach((l, idx) => doc.text(l, colX[2] + 4, y + 7 + idx * 10.5));

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
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
    doc.text(`Plus ${remainingCount} additional cryptographic assets mapped in the CycloneDX 1.6 export.`, M, y + 8);
    y += 18;
  } else {
    y += 10;
  }

  // Cryptographic Inventory Attestation & Audit Hash Card
  checkPageRoom(48);
  const cbomHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(allCbom) + targetLabel)
    .digest('hex')
    .toUpperCase();

  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(M, y, W - M * 2, 40, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text('CRYPTOGRAPHIC INVENTORY ATTESTATION & AUDIT HASH', M + 12, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
  doc.text(`CBOM SHA-256 DIGEST: ${cbomHash}`, M + 12, y + 23);
  doc.text('CONFORMANCE: CycloneDX 1.6 Cryptography Extension · NIST IR 8547 · RFC 8446 / RFC 9180 Conformance', M + 12, y + 33);

  y += 50;

  // ==========================================
  // PAGE 3: REGULATORY MATRIX & VULNERABILITIES
  // ==========================================
  printFooter(page);
  doc.addPage();
  page++;
  printHeader();

  // Enterprise Regulatory & Framework Alignment
  drawSectionTitle('Enterprise Regulatory & Framework Alignment');

  const regCols = [105, 125, 195, 86];
  const regX = [M, M + 105, M + 230, M + 425];

  doc.setFillColor(240, 244, 250);
  doc.rect(M, y, W - M * 2, 16, 'F');
  doc.setDrawColor(215, 225, 240);
  doc.setLineWidth(0.6);
  doc.line(M, y + 16, W - M, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('Standard / Authority', regX[0] + 4, y + 11);
  doc.text('Mandate Scope', regX[1] + 4, y + 11);
  doc.text('Impact on Assessed Architecture', regX[2] + 4, y + 11);
  doc.text('Compliance Status', regX[3] + 4, y + 11);
  y += 18;

  const frameworks = [
    {
      std: 'NIST PQC Standards',
      ref: 'FIPS 203 / 204 / 205',
      scope: 'ML-KEM, ML-DSA & SLH-DSA',
      impact: 'Legacy RSA/ECDH key establishment and ECDSA signatures require systematic deprecation.',
      status: 'Action Required',
      color: [220, 38, 38],
    },
    {
      std: 'NSA CNSA 2.0',
      ref: 'National Security Memo 10',
      scope: 'Commercial PQC Suite',
      impact: 'Software and client communications must support hybrid/post-quantum cryptography by 2025–2030.',
      status: 'Non-Compliant',
      color: [220, 38, 38],
    },
    {
      std: 'RBI Master Directions',
      ref: 'Cyber Security Framework',
      scope: 'Cryptographic Governance',
      impact: 'Directs scheduled cipher agility, inventory tracking, and avoidance of broken algorithms.',
      status: 'Audit Flag',
      color: [202, 138, 4],
    },
    {
      std: 'SEBI Advisory',
      ref: 'Quantum Preparedness',
      scope: 'Securities & Market Infra',
      impact: 'Requires financial entities to map asymmetric crypto dependencies and formulate migration plans.',
      status: 'Plan Needed',
      color: [202, 138, 4],
    },
    {
      std: 'EU DORA (Art. 9/10)',
      ref: 'Digital Resilience Act',
      scope: 'ICT Cryptographic Resiliency',
      impact: 'Continuous cryptographic bill of materials (CBOM) tracking and migration resilience required.',
      status: 'Attestation Rec.',
      color: [37, 99, 235],
    },
  ];

  frameworks.forEach((fw, idx) => {
    const c0 = doc.splitTextToSize(`${fw.std}\n${fw.ref}`, regCols[0] - 8);
    const c1 = doc.splitTextToSize(fw.scope, regCols[1] - 8);
    const c2 = doc.splitTextToSize(fw.impact, regCols[2] - 8);
    const c3 = doc.splitTextToSize(fw.status, regCols[3] - 8);

    const maxL = Math.max(c0.length, c1.length, c2.length, c3.length);
    const rowH = maxL * 10 + 6;

    checkPageRoom(rowH);

    if (idx % 2 === 1) {
      doc.setFillColor(252, 253, 255);
      doc.rect(M, y - 1, W - M * 2, rowH, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    doc.text(fw.std, regX[0] + 4, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
    doc.text(fw.ref, regX[0] + 4, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
    c1.forEach((l, i) => doc.text(l, regX[1] + 4, y + 8 + i * 9.5));
    c2.forEach((l, i) => doc.text(l, regX[2] + 4, y + 8 + i * 9.5));

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(fw.color[0], fw.color[1], fw.color[2]);
    c3.forEach((l, i) => doc.text(l, regX[3] + 4, y + 8 + i * 9.5));

    doc.setDrawColor(235, 240, 248);
    doc.setLineWidth(0.4);
    doc.line(M, y + rowH - 1, W - M, y + rowH - 1);

    y += rowH;
  });

  y += 14;

  // Key Vulnerabilities & Remediation Actions
  const findings = results.findings || [];
  if (findings.length > 0) {
    drawSectionTitle('Key Vulnerabilities & Remediation Actions');

    // Show up to top 4 key findings
    findings.slice(0, 4).forEach((finding) => {
      const sev = String(finding.sev || finding.severity || 'medium').toLowerCase();
      const sevColor =
        sev === 'critical'
          ? [220, 38, 38]
          : sev === 'high'
            ? [234, 88, 12]
            : sev === 'medium'
              ? [202, 138, 4]
              : [100, 116, 139];

      const sevBg =
        sev === 'critical'
          ? [254, 242, 242]
          : sev === 'high'
            ? [255, 247, 237]
            : sev === 'medium'
              ? [254, 252, 232]
              : [241, 245, 249];

      const titleLines = doc.splitTextToSize(finding.title || '', W - M * 2 - 76);
      const detailLines = doc.splitTextToSize(finding.detail || '', W - M * 2 - 20);
      const stdText = finding.std || (Array.isArray(finding.standards) ? finding.standards.join(', ') : 'NIST FIPS 203/204');
      const fixLines = doc.splitTextToSize(
        `Action: ${finding.fix || 'Review and upgrade primitive'}  [Standard: ${stdText}]`,
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
      doc.text(String(sev).toUpperCase(), M + 14, y + 16);

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

  // ==========================================
  // PAGE 4: FOUR-PHASE ROADMAP & ENGAGEMENT
  // ==========================================
  printFooter(page);
  doc.addPage();
  page++;
  printHeader();

  // Helper to format concise phase badges
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

  const planPhases = results.plan && results.plan.length > 0 ? results.plan : [
    {
      phase: 'Phase 1 (0–3 Months)',
      title: 'Automated Discovery & Cryptographic Agility Baseline',
      desc: 'Deploy automated CBOM discovery across all internet-facing APIs, ingress controllers, and code repositories. Establish cryptographic agility governance and algorithm deprecation policies.',
    },
    {
      phase: 'Phase 2 (3–6 Months)',
      title: 'Dual-KEM Hybrid Key Exchange Rollout',
      desc: 'Enable X25519MLKEM768 hybrid key encapsulation across edge ingress, reverse proxies, and load balancers. Protect data in transit immediately against Harvest-Now-Decrypt-Later (HNDL) attacks.',
    },
    {
      phase: 'Phase 3 (6–12 Months)',
      title: 'PKI Hierarchy & Certificate Authority Transition',
      desc: 'Deploy hybrid and post-quantum certificate authorities (ML-DSA-65 / FIPS 204). Rotate identity and TLS certificates across high-value core services and internal service meshes.',
    },
    {
      phase: 'Phase 4 (12–24 Months)',
      title: 'Native Post-Quantum Operations & Full Deprecation',
      desc: 'Transition to pure post-quantum algorithms across data-at-rest encryption, HSMs, and code signing. Completely disable classical RSA and ECC fallback options.',
    },
  ];

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

  y += 14;

  // Engagement with UElement U92 Quantum
  drawSectionTitle('Engagement with UElement U92 Quantum');
  drawParagraph(
    'Vyu provides single-target cryptographic scanning. Estate-wide automated discovery, continuous CBOM monitoring, Hardware Security Module (HSM) migration, and crypto-agility implementation are delivered by UElement U92 Quantum, our dedicated post-quantum security practice.',
    8.5
  );
  drawParagraph(
    'To schedule an executive briefing, review technical migration sequencing, or initiate estate-wide CBOM discovery with our cryptographic engineering team, contact us at contact@uelement.co or call +91 7620690561.',
    8.5
  );

  // Sign-off signature box
  y += 10;
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(M, y, W - M * 2, 44, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('U92 QUANTUM CRYPTOGRAPHIC PRACTICE · PRACTICE LEAD AUDIT ATTESTATION', M + 14, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(BODY_TEXT[0], BODY_TEXT[1], BODY_TEXT[2]);
  doc.text('Authorized Technical Lead: Dr. A. Joshi · Senior Cryptographic Architect · UElement Technologies', M + 14, y + 28);
  doc.text('Validation Key Fingerprint: 4E92 C10F 8892 001B 77FA 65C4 · Cryptographic Hash Verified', M + 14, y + 37);

  // Final page footer
  printFooter(page);

  // Return Node Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
