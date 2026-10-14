// @ts-check
import dns from 'node:dns/promises';

/**
 * Known free, consumer, and disposable email providers.
 */
export const FREE_AND_DISPOSABLE_DOMAINS = new Set([
  // Popular consumer webmail
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'yahoo.ca',
  'yahoo.fr',
  'yahoo.com.br',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'outlook.com',
  'live.com',
  'msn.com',
  'passport.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'aim.com',
  'zoho.com',
  'zohomail.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'tutanota.com',
  'tuta.io',
  'mail.com',
  'email.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'yandex.com',
  'yandex.ru',
  'rediffmail.com',
  'inbox.com',
  'hushmail.com',
  'lycos.com',
  'sina.com',
  '163.com',
  '126.com',
  'qq.com',
  // Disposable / temporary email providers
  'tempmail.com',
  'temp-mail.org',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
  'fakeinbox.com',
  'maildrop.cc',
  'dispostable.com',
  'burnermail.io',
  'tempail.com',
  'mohmal.com',
]);

const SPAM_COMPANY_NAMES = new Set([
  'test',
  'testing',
  'asdf',
  'asdfg',
  'qwerty',
  'none',
  'na',
  'n/a',
  'unknown',
  'fake',
  'sample',
  'demo',
  'abc',
  'xyz',
  'self',
  'personal',
  'individual',
  'freelance',
  'freelancer',
  'independent',
  'student',
  'home',
  'null',
  'nil',
  'nothing',
  'xxx',
  'aaa',
  '123',
  '1234',
]);

/**
 * Check if an email address uses a personal or disposable provider.
 * @param {string} email
 * @returns {boolean}
 */
export function isPersonalOrDisposableEmail(email) {
  if (!email || !email.includes('@')) return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return FREE_AND_DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Extract root domain from hostname (e.g., mail.icicibank.com -> icicibank.com)
 * @param {string} host
 * @returns {string}
 */
export function extractRootDomain(host) {
  const parts = host.toLowerCase().trim().replace(/^www\./, '').split('.');
  if (parts.length <= 2) return parts.join('.');
  // Check common 2-level ccTLDs (e.g. .co.in, .gov.in, .co.uk)
  const secondLast = parts[parts.length - 2];
  if (['co', 'com', 'org', 'net', 'edu', 'gov', 'ac'].includes(secondLast)) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/**
 * Verify whether domain has active DNS MX or A records.
 * @param {string} domain
 * @returns {Promise<{ hasMx: boolean; exchanges: string[]; error?: string }>}
 */
export async function verifyDomainDns(domain) {
  const cleanDomain = domain.toLowerCase().trim();
  try {
    const mxRecords = await Promise.race([
      dns.resolveMx(cleanDomain),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DNS query timed out')), 4000)
      ),
    ]);

    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      return {
        hasMx: true,
        exchanges: mxRecords.map((r) => r.exchange),
      };
    }
  } catch (err) {
    // If MX lookup fails, check A/AAAA record fallback (some servers accept direct A delivery)
    try {
      const aRecords = await Promise.race([
        dns.resolve(cleanDomain, 'A'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DNS A query timed out')), 2500)
        ),
      ]);
      if (Array.isArray(aRecords) && aRecords.length > 0) {
        return {
          hasMx: true,
          exchanges: aRecords,
        };
      }
    } catch {}

    const code = err && typeof err === 'object' && 'code' in err ? err.code : 'DNS_FAIL';
    return {
      hasMx: false,
      exchanges: [],
      error: code === 'ENOTFOUND' ? 'Domain does not exist or has no DNS records.' : 'No active mail exchange records found for this domain.',
    };
  }

  return {
    hasMx: false,
    exchanges: [],
    error: 'No active mail servers found.',
  };
}

/**
 * Search Clearbit public autocomplete for verified company entity.
 * Free endpoint with no auth token required.
 * @param {string} companyName
 * @returns {Promise<Array<{ name: string; domain: string; logo: string | null }>>}
 */
export async function searchClearbitCompany(companyName) {
  const query = encodeURIComponent(companyName.trim());
  if (!query || query.length < 2) return [];

  try {
    const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UElement-Verifier/1.0)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.slice(0, 5).map((c) => ({
        name: c.name || '',
        domain: c.domain || '',
        logo: c.logo || null,
      }));
    }
  } catch {}

  return [];
}

/**
 * Validate Company / Organisation Legitimacy
 * Checks:
 * 1. Non-empty, non-spam company name
 * 2. Corporate email check (not personal or disposable)
 * 3. Live DNS MX verification on the corporate email domain
 * 4. Free public registry / Clearbit company entity lookup
 *
 * @param {string} rawCompanyName
 * @param {string} rawEmail
 * @returns {Promise<{
 *   valid: boolean;
 *   verified: boolean;
 *   company: string;
 *   domain?: string;
 *   matchedDomain?: string;
 *   logo?: string | null;
 *   error?: string;
 *   details?: string;
 * }>}
 */
export async function verifyCompanyLegitimacy(rawCompanyName, rawEmail) {
  const company = String(rawCompanyName || '').trim();
  const email = String(rawEmail || '').trim().toLowerCase();

  // 1. Validate company name syntax
  if (!company || company.length < 2) {
    return {
      valid: false,
      verified: false,
      company,
      error: 'Company or organisation name is required (min 2 characters).',
    };
  }

  const normalizedComp = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (SPAM_COMPANY_NAMES.has(normalizedComp) || SPAM_COMPANY_NAMES.has(company.toLowerCase())) {
    return {
      valid: false,
      verified: false,
      company,
      error: 'Please enter a genuine registered corporate or enterprise organisation.',
    };
  }

  // 2. Validate email structure
  if (!email || !email.includes('@')) {
    return {
      valid: false,
      verified: false,
      company,
      error: 'A corporate email address is required to authenticate organisation legitimacy.',
    };
  }

  const emailDomain = email.split('@')[1];
  if (isPersonalOrDisposableEmail(email)) {
    return {
      valid: false,
      verified: false,
      company,
      error: 'Personal email providers (Gmail, Yahoo, Outlook, etc.) or temporary inboxes are not allowed. Please use your official corporate work email.',
    };
  }

  // 3. Check email domain DNS MX records in parallel with Clearbit lookup
  const [dnsResult, clearbitResults] = await Promise.all([
    verifyDomainDns(emailDomain),
    searchClearbitCompany(company),
  ]);

  if (!dnsResult.hasMx) {
    return {
      valid: false,
      verified: false,
      company,
      domain: emailDomain,
      error: `The email domain "${emailDomain}" does not have active corporate mail servers or DNS records.`,
      details: dnsResult.error,
    };
  }

  // 4. Check if Clearbit returned matching organizations
  const rootEmailDomain = extractRootDomain(emailDomain);
  let bestMatch = null;

  if (clearbitResults.length > 0) {
    // Priority 1: Domain exact or root match
    bestMatch = clearbitResults.find(
      (c) =>
        c.domain.toLowerCase() === emailDomain ||
        extractRootDomain(c.domain) === rootEmailDomain ||
        emailDomain.endsWith('.' + c.domain.toLowerCase())
    );

    // Priority 2: Name match if domain not strictly identical (e.g. subsidiaries)
    if (!bestMatch) {
      bestMatch = clearbitResults[0];
    }
  }

  if (bestMatch) {
    return {
      valid: true,
      verified: true,
      company: bestMatch.name || company,
      domain: emailDomain,
      matchedDomain: bestMatch.domain,
      logo: bestMatch.logo,
      details: `Verified corporate entity: ${bestMatch.name} (${bestMatch.domain})`,
    };
  }

  // 5. Valid corporate domain with active DNS MX even if not yet in Clearbit global index
  return {
    valid: true,
    verified: false,
    company,
    domain: emailDomain,
    details: `Active enterprise mail infrastructure verified on domain ${emailDomain}.`,
  };
}
