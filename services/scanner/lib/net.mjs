/**
 * lib/net.mjs - shared network helpers (SSRF-safe host resolution).
 *
 * Single source of truth for:
 *   - HOST_REGEX      : validates a host token before any DNS lookup
 *   - isBlockedIP     : RFC1918 / loopback / link-local / ULA / CGNAT /
 *                       multicast / reserved guard
 *   - resolveHost     : DNS resolve + optional private-IP block
 */
import { isIPv4, isIPv6 } from 'node:net';
import { lookup } from 'node:dns/promises';

export const HOST_REGEX = /^[a-zA-Z0-9.:\[\]-]+$/;

export function isBlockedIP(ip) {
  if (!ip) return true;
  let cleanIp = ip.trim();
  if (cleanIp.startsWith('[') && cleanIp.endsWith(']')) {
    cleanIp = cleanIp.slice(1, -1);
  }

  if (isIPv4(cleanIp)) {
    const parts = cleanIp.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;
    const [a, b] = parts;
    if (a === 0 || a === 127 || a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;   // 100.64.0.0/10 CGNAT
    if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 benchmarking
    if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0.0/24 IETF protocol
    if (a >= 224) return true;                            // multicast, reserved, broadcast
    return false;
  }

  if (isIPv6(cleanIp)) {
    try {
      const canonical = new URL(`http://[${cleanIp}]`).hostname.slice(1, -1);
      if (canonical === '::1' || canonical === '::') return true;
      if (canonical.startsWith('fc') || canonical.startsWith('fd')) return true;
      if (/^fe[89ab]/i.test(canonical)) return true;
      if (canonical.startsWith('::ffff:')) {
        const parts = canonical.split(':');
        const h1 = parts[parts.length - 2] || '0';
        const h2 = parts[parts.length - 1] || '0';
        const n1 = parseInt(h1, 16) || 0;
        const n2 = parseInt(h2, 16) || 0;
        const v4 = `${n1 >> 8}.${n1 & 0xff}.${n2 >> 8}.${n2 & 0xff}`;
        return isBlockedIP(v4);
      }
      return false;
    } catch {
      return true;
    }
  }

  return true;
}

const BUILT_IN_ALLOWED_HOSTS = new Set([
  'crt.sh',
  'archive.org',
  'api.securitytrails.com',
]);

export function isAllowedHost(hostname, extra) {
  if (!hostname || typeof hostname !== 'string') return false;
  const h = hostname.toLowerCase();
  if (BUILT_IN_ALLOWED_HOSTS.has(h)) return true;
  if (extra) {
    if (Array.isArray(extra)) return extra.some(e => e.toLowerCase() === h);
    if (extra instanceof Set) return extra.has(h);
  }
  return false;
}

export function createSsrfSafeFetch(fetchImpl, { allowedHosts = [], resolveFn } = {}) {
  const resolve = resolveFn ?? ((host, opts) => resolveHost(host, opts));
  const extraAllowed = allowedHosts.length > 0 ? new Set(allowedHosts) : null;

  return async function safeFetch(url, init) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error(`SSRF blocked: malformed URL "${url}"`);
    }

    const hostname = parsed.hostname.toLowerCase();

    if (!isAllowedHost(hostname, extraAllowed)) {
      const ip = await resolve(hostname, { blockPrivate: true });
      if (!ip) {
        throw new Error(
          `SSRF blocked: hostname "${hostname}" resolved to a private / blocked IP`,
        );
      }
    }

    return fetchImpl(url, init);
  };
}

export async function resolveHost(host, { blockPrivate = false } = {}) {
  if (!host || typeof host !== 'string') return null;
  const cleanHost = host.trim();
  if (!HOST_REGEX.test(cleanHost)) return null;

  let lookupTarget = cleanHost;
  if (lookupTarget.startsWith('[') && lookupTarget.endsWith(']')) {
    lookupTarget = lookupTarget.slice(1, -1);
  }

  try {
    const res = await lookup(lookupTarget, { family: 0 });
    const ip = res.address;
    if (blockPrivate && isBlockedIP(ip)) return null;
    return ip;
  } catch {
    return null;
  }
}
