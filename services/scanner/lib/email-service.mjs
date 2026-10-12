// @ts-check

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
