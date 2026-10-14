// @ts-check

/**
 * Extracts the registered base root domain (eTLD+1) from a hostname or URL.
 * Handles subdomains and common multi-part TLDs (.co.in, .co.uk, .com.au, etc.)
 * @param {string} rawHost
 * @returns {string}
 */
export function extractRootDomain(rawHost) {
  if (!rawHost) return '';
  let host = String(rawHost).trim().toLowerCase();
  host = host.replace(/^https?:\/\//i, '').replace(/^git@[^:]+:/i, '');
  host = host.split('/')[0].split(':')[0];
  const parts = host.split('.').filter(Boolean);
  if (parts.length <= 2) return parts.join('.');
  const secondLast = parts[parts.length - 2];
  const multiPartTlds = ['co', 'com', 'org', 'net', 'gov', 'ac', 'edu'];
  if (parts.length >= 3 && multiPartTlds.includes(secondLast) && parts[parts.length - 1].length === 2) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/**
 * Extracts target domain or GitHub organization identity from target string.
 * @param {string} target
 * @returns {{ type: 'repo', org: string } | { type: 'url', domain: string }}
 */
export function extractTargetIdentity(target) {
  if (!target) return { type: 'url', domain: '' };
  const t = String(target).trim().toLowerCase();
  const ghMatch = t.match(/(?:github\.com\/|^)([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  if (ghMatch) {
    return { type: 'repo', org: ghMatch[1] };
  }
  return { type: 'url', domain: extractRootDomain(t) };
}

/**
 * Validates perimeter authorization and domain isolation.
 * Prevents employees of company A (e.g. HDFC) from obtaining CBOM reports for company B (e.g. ICICI).
 * Exemption: uelement.co / uelement.in staff can evaluate any target without restriction.
 *
 * @param {string} email
 * @param {string} target
 * @returns {{ authorized: boolean, reason: string, targetDomain?: string, emailDomain?: string, expected?: string }}
 */
export function isDomainAuthorized(email, target) {
  if (!email || !target) {
    return { authorized: false, reason: 'missing_input' };
  }

  const emailNorm = String(email).trim().toLowerCase();
  const emailDomain = emailNorm.split('@')[1] || '';
  if (!emailDomain) {
    return { authorized: false, reason: 'invalid_email' };
  }

  // EXEMPTION: U-Element personnel can evaluate any target perimeter
  if (
    emailDomain === 'uelement.co' ||
    emailDomain.endsWith('.uelement.co') ||
    emailDomain === 'uelement.in' ||
    emailDomain.endsWith('.uelement.in')
  ) {
    return { authorized: true, reason: 'uelement_internal_exemption' };
  }

  const targetInfo = extractTargetIdentity(target);
  const emailRoot = extractRootDomain(emailDomain);
  const emailPrefix = emailRoot.split('.')[0];

  if (targetInfo.type === 'repo') {
    const org = targetInfo.org.toLowerCase();
    if (org === emailPrefix || org.includes(emailPrefix) || emailPrefix.includes(org)) {
      return { authorized: true, reason: 'repo_org_match' };
    }
    return {
      authorized: false,
      reason: 'repo_org_mismatch',
      expected: org,
      emailDomain,
    };
  }

  const targetRoot = targetInfo.domain;
  if (!targetRoot) {
    return { authorized: false, reason: 'invalid_target' };
  }

  // Exact root domain match (e.g., hdfcbank.com === hdfcbank.com)
  if (emailRoot === targetRoot) {
    return { authorized: true, reason: 'domain_exact_match' };
  }

  // Brand core token match for subsidiaries / regional domains (min 4 chars)
  const targetPrefix = targetRoot.split('.')[0];
  if (emailPrefix.length >= 4 && targetPrefix.length >= 4) {
    if (emailPrefix.includes(targetPrefix) || targetPrefix.includes(emailPrefix)) {
      return { authorized: true, reason: 'brand_token_match' };
    }
  }

  return {
    authorized: false,
    reason: 'domain_mismatch',
    targetDomain: targetRoot,
    emailDomain,
  };
}
