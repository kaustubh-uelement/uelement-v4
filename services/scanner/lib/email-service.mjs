// @ts-check
import { generateAssessmentPdf } from './pdf-report.mjs';

/**
 * Builds the enterprise HTML template for the Vyuh OTP email.
 * @param {string} code
 * @param {string} [name]
 */
function buildOtpEmailHtml(code, name) {
  const greeting = name ? `Dear ${name},` : 'Hello,';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vyuh Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #071739; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #071739; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0b1e47; border: 1px solid #1e3a8a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
          <tr>
            <td style="padding: 32px 36px 20px; border-bottom: 1px solid rgba(200, 138, 62, 0.2);">
              <div style="font-size: 20px; font-weight: 700; letter-spacing: 0.5px; color: #ffffff;">
                <span style="color: #c88a3e;">VYUH</span> · Cryptographic Intelligence
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
                Quantum Readiness & CBOM Discovery
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                ${greeting}
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                You have initiated a diagnostic cryptographic assessment on <strong style="color: #ffffff;">Vyuh</strong>. Please use the one-time verification code below to authorize your session:
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <div style="display: inline-block; padding: 16px 36px; background-color: #06132f; border: 2px solid #c88a3e; border-radius: 12px; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #c88a3e; box-shadow: 0 0 20px rgba(200, 138, 62, 0.2);">
                  ${code}
                </div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 12px;">
                  ⏳ This code expires in <strong style="color: #e2e8f0;">5 minutes</strong>.
                </div>
              </div>
              <div style="background-color: rgba(200, 138, 62, 0.08); border-left: 3px solid #c88a3e; padding: 12px 16px; border-radius: 4px; margin: 24px 0 0;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #cbd5e1;">
                  <strong>Security Note:</strong> Vyuh will never ask you for your verification code outside the direct diagnostic interface. If you did not request this assessment, please ignore this email.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #071739; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © ${new Date().getFullYear()} UElement Technologies Private Limited · All Rights Reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a 6-digit OTP verification email to the user.
 * Dispatches via Resend API if RESEND_API_KEY is configured;
 * otherwise logs to server console in dev mode.
 *
 * @param {string} recipientEmail
 * @param {string} code
 * @param {string} [name]
 * @returns {Promise<{ ok: true, provider: string } | { ok: false, error: string }>}
 */
export async function sendOtpEmail(recipientEmail, code, name) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || 'Vyuh Security <contact@uelement.co>').trim();

  // If no API key configured, operate in resilient Dev Mode
  if (!apiKey) {
    console.log(`[VYUH-EMAIL-DEV] Verification code for ${recipientEmail}: ${code}`);
    return { ok: true, provider: 'dev-console' };
  }

  try {
    const html = buildOtpEmailHtml(code, name);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: `Your Vyuh Verification Code: ${code}`,
        html,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('[Resend API Error]', res.status, errData);
      return {
        ok: false,
        error: errData.message || `Email service failed with status ${res.status}`,
      };
    }

    const data = await res.json();
    console.log(`[Vyuh] OTP email sent successfully to ${recipientEmail} (ID: ${data.id})`);
    return { ok: true, provider: 'resend' };
  } catch (err) {
    console.error('[sendOtpEmail Network Error]:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Sends the comprehensive Cryptographic Bill of Materials (CBOM) Assessment Report
 * to the verified user email, with the stamped PDF audit attached.
 *
 * @param {Object} params
 * @param {string} params.recipientEmail
 * @param {string} [params.name]
 * @param {string} [params.company]
 * @param {string} [params.role]
 * @param {string} [params.target]
 * @param {number} [params.score]
 * @param {string} [params.band]
 * @param {Object} [params.stats]
 * @param {string} [params.pdfBase64]
 * @param {string} [params.filename]
 * @param {Array} [params.cbomSummary]
 * @param {Array} [params.cbom]
 * @param {Array} [params.findings]
 * @param {Array} [params.plan]
 * @param {Date|string|number} [params.when]
 * @returns {Promise<{ ok: true, provider: string, id?: string } | { ok: false, error: string }>}
 */
export async function sendAssessmentReportEmail({
  recipientEmail,
  name,
  company,
  role,
  target,
  score,
  band,
  stats,
  pdfBase64,
  filename,
  cbomSummary = [],
  cbom = [],
  findings = [],
  plan = [],
  when,
}) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || 'Vyuh Security <contact@uelement.in>').trim();

  if (!apiKey) {
    console.log(`[VYUH-EMAIL-DEV] Assessment report generated for ${recipientEmail} (${target})`);
    return { ok: true, provider: 'dev-console' };
  }

  const greeting = name ? `Dear ${name},` : 'Hello,';
  const targetLabel = target || 'Your Assessed Target';
  const scoreNum = typeof score === 'number' ? score : (score || 'N/A');
  const riskBand = band || 'Evaluated';
  const orgName = company || 'Enterprise';

  const cbomRowsHtml = (Array.isArray(cbomSummary) ? cbomSummary.slice(0, 8) : [])
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 8px 12px; color: #ffffff; font-weight: 600; font-size: 12px;">${item.asset || item.name || ''}</td>
          <td style="padding: 8px 12px; color: #cbd5e1; font-family: monospace; font-size: 11px;">${item.primitive || item.algo || ''}</td>
          <td style="padding: 8px 12px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${
            item.verdict === 'broken' ? '#fca5a5' : item.verdict === 'weak' ? '#fcd34d' : '#86efac'
          };">${item.verdict || 'evaluated'}</td>
          <td style="padding: 8px 12px; color: #c88a3e; font-size: 11px; font-weight: 500;">${item.replacement || 'NIST FIPS Migration'}</td>
        </tr>
      `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vyuh CBOM Assessment Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #071739; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #071739; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0b1e47; border: 1px solid #1e3a8a; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 20px; border-bottom: 1px solid rgba(200, 138, 62, 0.25);">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">
                <span style="color: #c88a3e;">VYUH</span> · Cryptographic Intelligence
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.2px;">
                Official Cryptographic Bill of Materials (CBOM) & Post-Quantum Audit
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                ${greeting}
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Here is your requested Post-Quantum Cryptographic Assessment and Cryptographic Bill of Materials (CBOM) for <strong style="color: #ffffff;">${targetLabel}</strong>, prepared for <strong style="color: #ffffff;">${orgName}</strong>.
              </p>

              <!-- KPI Metrics -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #06132f; border: 1px solid rgba(200, 138, 62, 0.35); border-radius: 12px; padding: 18px 20px;">
                <tr>
                  <td width="33%" style="text-align: center; border-right: 1px solid rgba(255,255,255,0.08); padding: 6px 10px;">
                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px;">Readiness Score</div>
                    <div style="font-size: 26px; font-weight: 800; color: #c88a3e; margin-top: 4px;">${scoreNum}<span style="font-size: 14px; font-weight: 500; color: #94a3b8;">/100</span></div>
                  </td>
                  <td width="33%" style="text-align: center; border-right: 1px solid rgba(255,255,255,0.08); padding: 6px 10px;">
                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px;">Risk Band</div>
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 8px;">${riskBand}</div>
                  </td>
                  <td width="34%" style="text-align: center; padding: 6px 10px;">
                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px;">Total Assets</div>
                    <div style="font-size: 26px; font-weight: 800; color: #e2e8f0; margin-top: 4px;">${stats?.total || 19}</div>
                  </td>
                </tr>
              </table>

              <!-- Shor / Grover Breakdown -->
              <div style="background-color: rgba(11, 30, 71, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 12px; line-height: 1.6; color: #cbd5e1;">
                <span style="color: #fca5a5; font-weight: 700;">● ${stats?.broken ?? 0} Shor-Vulnerable</span> (Asymmetric / RSA / ECDSA) &nbsp;|&nbsp;
                <span style="color: #fcd34d; font-weight: 700;">● ${stats?.weak ?? 0} Grover-Weakened</span> (128-bit symmetric) &nbsp;|&nbsp;
                <span style="color: #86efac; font-weight: 700;">● ${stats?.safe ?? 0} Quantum-Safe</span>
              </div>

              <!-- Notice about PDF Attachment -->
              <div style="background-color: rgba(200, 138, 62, 0.12); border-left: 3px solid #c88a3e; padding: 14px 18px; border-radius: 4px; margin: 24px 0 20px;">
                <div style="font-weight: 700; color: #ffffff; font-size: 13px; margin-bottom: 4px;">
                  📎 Official Stamped Executive PDF Attached
                </div>
                <div style="font-size: 12px; line-height: 1.5; color: #cbd5e1;">
                  Your complete board-ready assessment document (including unredacted cryptographic asset inventory, Harvest Now Decrypt Later risk modeling, and NIST FIPS 203/204/205 migration steps) is attached to this email.
                </div>
              </div>

              ${
                cbomRowsHtml
                  ? `
                <div style="margin-top: 24px;">
                  <div style="font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                    Preview: Detected Cryptographic Assets
                  </div>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #06132f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <th style="padding: 8px 12px; text-align: left; font-size: 11px; color: #94a3b8;">Asset</th>
                        <th style="padding: 8px 12px; text-align: left; font-size: 11px; color: #94a3b8;">Primitive</th>
                        <th style="padding: 8px 12px; text-align: left; font-size: 11px; color: #94a3b8;">Status</th>
                        <th style="padding: 8px 12px; text-align: left; font-size: 11px; color: #94a3b8;">Replacement</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${cbomRowsHtml}
                    </tbody>
                  </table>
                </div>
              `
                  : ''
              }

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #94a3b8; line-height: 1.6;">
                Need assistance planning estate-wide cryptographic discovery, HSM transition, or automated migration? Connect with UElement's Post-Quantum Cryptography team at <a href="mailto:contact@uelement.co" style="color: #c88a3e; text-decoration: none;">contact@uelement.co</a>.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #071739; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                © ${new Date().getFullYear()} UElement Technologies Private Limited · All Rights Reserved
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  /** @type {any} */
  const payload = {
    from: fromEmail,
    to: [recipientEmail],
    subject: `Your Vyuh Cryptographic CBOM & Quantum Readiness Report — ${targetLabel}`,
    html,
  };

  // Verify PDF attachment integrity or generate an authentic board-level PDF
  let finalPdfBase64 = pdfBase64;
  let isPdfValid = false;

  if (finalPdfBase64 && typeof finalPdfBase64 === 'string') {
    try {
      const rawHeader = Buffer.from(finalPdfBase64.slice(0, 40), 'base64').toString('utf8');
      const rawTrailer = Buffer.from(finalPdfBase64.slice(-80), 'base64').toString('utf8');
      if (rawHeader.startsWith('%PDF-') && rawTrailer.includes('%%EOF') && finalPdfBase64.length > 800) {
        isPdfValid = true;
      }
    } catch {
      isPdfValid = false;
    }
  }

  // If client-provided PDF is missing, fake, or corrupted, generate authentic server-side PDF
  if (!isPdfValid) {
    try {
      const generatedBuf = generateAssessmentPdf({
        results: {
          target: target || 'Enterprise Target',
          score: typeof score === 'number' ? score : 40,
          band: band || 'Risk Assessment Complete',
          stats: stats || {},
          cbom: cbom && cbom.length ? cbom : cbomSummary || [],
          findings: findings || [],
          plan: plan || [],
          when: when || new Date(),
        },
        profile: { name, company, role, email: recipientEmail },
      });
      finalPdfBase64 = generatedBuf.toString('base64');
      isPdfValid = true;
    } catch (pdfErr) {
      console.error('[email-service] Error generating server-side PDF:', pdfErr);
    }
  }

  if (isPdfValid && finalPdfBase64) {
    const cleanFilename = (filename || `Vyuh_CBOM_Assessment_${(target || 'report').replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`)
      .replace(/\s+/g, '_');
    payload.attachments = [
      {
        filename: cleanFilename,
        content: finalPdfBase64,
      },
    ];
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('[Resend Report Dispatch Error]', res.status, errData);
      return {
        ok: false,
        error: errData.message || `Failed to dispatch report email (${res.status})`,
      };
    }

    const data = await res.json();
    console.log(`[Vyuh] Full assessment report successfully emailed to ${recipientEmail} (ID: ${data.id})`);
    return { ok: true, provider: 'resend', id: data.id };
  } catch (err) {
    console.error('[sendAssessmentReportEmail Error]:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
