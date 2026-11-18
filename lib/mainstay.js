// @ts-check

/**
 * Mainstay Contact & Lead Capture Client
 * Integrates with Mainstay API Gateway: POST /api/v1/contacts
 */

export const MAINSTAY_API_URL =
  process.env.NEXT_PUBLIC_MAINSTAY_API_URL || 'https://dunytgqgpv9fu.cloudfront.net/api/v1';

export const MAINSTAY_TENANT_SLUG =
  process.env.NEXT_PUBLIC_MAINSTAY_TENANT_SLUG || 'u-element-nexus';

export const SCANNER_API_URL =
  process.env.NEXT_PUBLIC_SCANNER_API_URL ||
  'https://pqc-scanner-445288556278.asia-south1.run.app';

/**
 * Submits a contact inquiry or lead to the Mainstay Contact Form API.
 * Uses high-reliability CORS-enabled backend gateway with direct fallback.
 *
 * @param {Object} payload
 * @param {string} [payload.name] - Full name (split into firstName / lastName if not provided)
 * @param {string} [payload.firstName] - Given name
 * @param {string} [payload.lastName] - Family / surname
 * @param {string} payload.email - Corporate or contact email address (required)
 * @param {string} [payload.phone] - Phone number
 * @param {string} [payload.company] - Company or organisation name
 * @param {string} [payload.position] - Job title / role
 * @param {string} [payload.role] - Alias for position
 * @param {string} [payload.title] - Alias for position
 * @param {string} [payload.message] - Main message body
 * @param {string} [payload.notes] - Supplementary notes / context
 * @param {string} [payload.subject] - Subject of the inquiry
 * @param {string} [payload.status] - 'lead' | 'active' | 'inactive' | 'customer' (default: 'lead')
 * @param {Record<string, any>} [payload.extra_field] - Key-value metadata stored as JSONB
 * @returns {Promise<{ success: boolean; data?: any; error?: string }>}
 */
export async function submitContactInquiry(payload) {
  if (!payload || !payload.email) {
    return { success: false, error: 'Email is required' };
  }

  const scannerUrl = (
    process.env.NEXT_PUBLIC_SCANNER_API_URL ||
    SCANNER_API_URL
  ).replace(/\/+$/, '');

  const apiUrl = (
    process.env.NEXT_PUBLIC_MAINSTAY_API_URL ||
    MAINSTAY_API_URL
  ).replace(/\/+$/, '');

  const tenantSlug =
    process.env.NEXT_PUBLIC_MAINSTAY_TENANT_SLUG ||
    MAINSTAY_TENANT_SLUG;

  // Derive firstName and lastName
  let firstName = payload.firstName;
  let lastName = payload.lastName;

  if (!firstName) {
    const rawName = (payload.name || '').trim();
    if (rawName) {
      const parts = rawName.split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || '—';
    } else {
      firstName = 'Website';
      lastName = 'Visitor';
    }
  }
  if (!lastName) {
    lastName = '—';
  }

  const messageText = payload.message || payload.notes || '';
  const notesText =
    payload.notes ||
    payload.message ||
    (payload.subject ? `Subject: ${payload.subject}` : '');

  const body = {
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    name: payload.name || `${firstName} ${lastName}`.trim(),
    email: String(payload.email).trim().toLowerCase(),
    phone: payload.phone ? String(payload.phone).trim() : null,
    company: payload.company ? String(payload.company).trim() : null,
    position:
      payload.position || payload.role || payload.title
        ? String(payload.position || payload.role || payload.title).trim()
        : null,
    message: messageText ? String(messageText).trim() : null,
    notes: notesText ? String(notesText).trim() : null,
    subject: payload.subject || null,
    status: payload.status || 'lead',
    extra_field: payload.extra_field || {},
  };

  // Primary Route: Backend Proxy Gateway (CORS-enabled, Mainstay record + direct Resend email)
  try {
    const proxyRes = await fetch(`${scannerUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json().catch(() => ({}));
      if (data.success) {
        return { success: true, data };
      }
    }
  } catch (proxyErr) {
    console.warn('[Mainstay Proxy] Primary gateway notice, testing direct fallback:', proxyErr);
  }

  // Fallback Route: Direct Mainstay CloudFront Gateway
  try {
    const res = await fetch(`${apiUrl}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-slug': tenantSlug,
      },
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        position: body.position,
        message: body.message,
        notes: body.notes,
        status: body.status,
        extra_field: body.extra_field,
      }),
    });

    if (res.status === 201 || res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: true, data };
    }

    const errText = await res.text().catch(() => 'Unknown error');
    console.warn(`[Mainstay] Contact submission returned ${res.status}:`, errText);
    return { success: false, error: `HTTP ${res.status}: ${errText}` };
  } catch (err) {
    console.warn('[Mainstay] Contact submission network notice:', err?.message || err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
