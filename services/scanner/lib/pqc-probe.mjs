// @ts-check
/**
 * lib/pqc-probe.mjs - network measurement primitives for the PQC scan pipeline.
 */
import tls from 'node:tls';
import https from 'node:https';
import { isIPv6 } from 'node:net';
import { execFile } from 'node:child_process';
import { Resolver } from 'node:dns/promises';

/** @typedef {import('../shared/types.ts').DnsRecord} DnsRecord */

/**
 * @typedef {(url: string, init?: any) => Promise<{ ok: boolean, status: number, json: () => Promise<any> }>} FetchLike
 * @typedef {{ stdout: string, stderr: string, error?: string }} ExecResult
 * @typedef {(file: string, args: string[], opts: { timeoutMs: number }) => Promise<ExecResult>} ExecFileFn
 * @typedef {(options: any, cb?: () => void) => any} TlsConnectFn
 * @typedef {(options: any, cb: (res: any) => void) => any} HttpsRequestFn
 * @typedef {{
 *   resolve4: (h: string) => Promise<string[]>,
 *   resolve6: (h: string) => Promise<string[]>,
 *   resolveMx: (h: string) => Promise<Array<{ exchange: string, priority: number }>>,
 *   resolveTxt: (h: string) => Promise<string[][]>,
 *   resolveCaa: (h: string) => Promise<Array<Record<string, any>>>,
 *   resolveNs: (h: string) => Promise<string[]>,
 * }} DnsImpl
 */

export function defaultExecFile(file, args, { timeoutMs }) {
  return new Promise((resolve) => {
    let child;
    try {
      child = execFile(file, args, { timeout: timeoutMs, maxBuffer: 512 * 1024, windowsHide: true }, (err, stdout, stderr) => {
        resolve({
          stdout: stdout ? String(stdout) : '',
          stderr: stderr ? String(stderr) : '',
          error: err ? String(err.message || err) : undefined,
        });
      });
    } catch (e) {
      resolve({ stdout: '', stderr: '', error: String(/** @type {Error} */ (e).message || e) });
      return;
    }
    child.stdin?.end();
  });
}

export function defaultDnsImpl() {
  const r = new Resolver({ timeout: 3000, tries: 1 });
  return /** @type {DnsImpl} */ (/** @type {unknown} */ (r));
}

function hostPort(ip, port) {
  return isIPv6(ip) ? `[${ip}]:${port}` : `${ip}:${port}`;
}

function errMsg(e) {
  return String((e && /** @type {Error} */ (e).message) || e);
}

export const DNS_NAME_RE = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export async function queryCertificateTransparency(baseDomain, { fetchImpl, timeoutMs = 15000 }) {
  const url = `https://crt.sh/?q=${encodeURIComponent(`%.${baseDomain}`)}&output=json`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ac.signal, headers: { 'User-Agent': 'vyuh-pqc-scan/0.1' } });
    if (!res.ok) return { ok: false, error: `crt.sh HTTP ${res.status}` };
    const rows = await res.json();
    if (!Array.isArray(rows)) return { ok: false, error: 'crt.sh returned a non-array body' };
    /** @type {Set<string>} */
    const names = new Set();
    for (const row of rows) {
      const nv = row && typeof row.name_value === 'string' ? row.name_value : '';
      for (let name of nv.split('\n')) {
        name = name.trim().toLowerCase().replace(/\.$/, '');
        if (name.startsWith('*.')) name = name.slice(2);
        if (!name || name.includes('*')) continue;
        if (name !== baseDomain && !name.endsWith(`.${baseDomain}`)) continue;
        if (!DNS_NAME_RE.test(name)) continue;
        names.add(name);
      }
    }
    return { ok: true, entries: rows.length, hostnames: [...names] };
  } catch (e) {
    return { ok: false, error: ac.signal.aborted ? `timed out after ${timeoutMs} ms` : errMsg(e) };
  } finally {
    clearTimeout(timer);
  }
}

export async function queryDnsRecords(hostname, { dnsImpl }) {
  /** @type {DnsRecord[]} */
  const records = [];
  const seen = new Set();
  const add = (type, value) => {
    const key = `${type}:${value}`;
    if (!seen.has(key)) { seen.add(key); records.push({ type, value }); }
  };
  const safe = async (fn) => { try { const r = await fn(); return Array.isArray(r) ? r : []; } catch { return []; } };

  const [a, aaaa, mx, txt, caa, ns] = await Promise.all([
    safe(() => dnsImpl.resolve4(hostname)),
    safe(() => dnsImpl.resolve6(hostname)),
    safe(() => dnsImpl.resolveMx(hostname)),
    safe(() => dnsImpl.resolveTxt(hostname)),
    safe(() => dnsImpl.resolveCaa(hostname)),
    safe(() => dnsImpl.resolveNs(hostname)),
  ]);
  a.forEach(ip => add('A', ip));
  aaaa.forEach(ip => add('AAAA', ip));
  mx.forEach(m => add('MX', `${m.exchange} (pri:${m.priority})`));
  txt.forEach(t => add('TXT', t.join('')));
  caa.forEach(c => {
    const tag = Object.keys(c).find(k => k !== 'critical');
    if (tag) add('CAA', `${c.critical ? 128 : 0} ${tag} "${c[tag]}"`);
  });
  ns.forEach(n => add('NS', n));
  return records;
}

async function dohQuery(name, type, { fetchImpl, dohUrl = 'https://cloudflare-dns.com/dns-query' }) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 3000);
  try {
    const res = await fetchImpl(
      `${dohUrl}?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}&do=1`,
      { signal: ac.signal, headers: { accept: 'application/dns-json' } },
    );
    if (!res.ok) return null;
    const body = await res.json();
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkDnssecViaDoH(zone, deps) {
  const dnskey = await dohQuery(zone, 'DNSKEY', deps);
  if (dnskey === null) return { value: null, detail: 'DoH resolver unreachable or returned an error' };
  const hasDnskey = Array.isArray(dnskey.Answer) && dnskey.Answer.some(a => a && a.type === 48);
  if (dnskey.AD === true && hasDnskey) return { value: true, detail: 'DNSKEY answer with AD=1' };

  const ds = await dohQuery(zone, 'DS', deps);
  if (ds && ds.AD === true && Array.isArray(ds.Answer) && ds.Answer.some(a => a && a.type === 43)) {
    return { value: true, detail: 'DS answer with AD=1' };
  }
  if (dnskey.Status === 0 && dnskey.AD === false && !hasDnskey) {
    return { value: false, detail: 'NOERROR answer with AD=0 and no DNSKEY' };
  }
  return { value: null, detail: `ambiguous answer (Status=${dnskey.Status}, AD=${dnskey.AD})` };
}

export async function lookupIpRegistry(ip, { fetchImpl }) {
  if (!ip) return {};
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 6000);
  try {
    const res = await fetchImpl(`https://rdap.org/ip/${encodeURIComponent(ip)}`, {
      signal: ac.signal,
      redirect: 'follow',
      headers: { accept: 'application/rdap+json', 'user-agent': 'Mozilla/5.0 (compatible; VyuhPQC/0.1)' },
    });
    if (!res.ok) return {};
    const data = await res.json();
    if (!data || typeof data !== 'object') return {};
    /** @type {string | undefined} */
    let country = typeof data.country === 'string' ? data.country : undefined;
    /** @type {string | undefined} */
    let org = typeof data.name === 'string' ? data.name : undefined;
    for (const e of Array.isArray(data.entities) ? data.entities : []) {
      const vcard = e?.vcardArray?.[1];
      if (!Array.isArray(vcard)) continue;
      const field = (n) => vcard.find((f) => Array.isArray(f) && f[0] === n);
      const orgField = field('org');
      const fnField = field('fn');
      const isOrgKind = vcard.some((f) => Array.isArray(f) && f[0] === 'kind' && f[3] === 'org');
      const isRegistrant = (Array.isArray(e.roles) ? e.roles : []).includes('registrant');
      if (isRegistrant || orgField) {
        const label = orgField?.[3] || ((isOrgKind || isRegistrant) ? fnField?.[3] : undefined);
        if (label) org = String(label);
        const adrLabel = field('adr')?.[1]?.label;
        if (!country && typeof adrLabel === 'string') {
          const lines = adrLabel.split('\n').map((s) => s.trim()).filter(Boolean);
          if (lines.length) country = lines[lines.length - 1];
        }
        if (org) break;
      }
    }
    /** @type {string | undefined} */
    let asn;
    const originAs = data['arin_originas0_originautnums'];
    if (Array.isArray(originAs) && originAs.length) asn = `AS${originAs[0]}`;
    return { org, asn, country };
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}

export async function opensslPqcCapable({ execFileFn, opensslPath }) {
  const r = await execFileFn(opensslPath, ['version'], { timeoutMs: 3000 });
  const m = /OpenSSL\s+(\d+)\.(\d+)\.(\d+)/i.exec(r.stdout || '');
  if (!m) {
    return { capable: false, version: null, reason: r.error ? `could not run ${opensslPath}: ${r.error}` : `unrecognised output from ${opensslPath} version` };
  }
  const version = `${m[1]}.${m[2]}.${m[3]}`;
  const capable = +m[1] > 3 || (+m[1] === 3 && +m[2] >= 5);
  return { capable, version, reason: capable ? 'OpenSSL 3.5+' : `OpenSSL ${version} is older than 3.5` };
}

export function parseNegotiatedGroup(out) {
  const negotiated = /Negotiated TLS1\.3 group:\s*([A-Za-z0-9_+.-]+)/i.exec(out);
  if (negotiated) return negotiated[1];
  const tempKey = /(?:Peer|Server) Temp Key:\s*([A-Za-z0-9_+.-]+)(?:\s*,\s*([A-Za-z0-9_+.-]+))?/i.exec(out);
  if (tempKey) {
    const first = tempKey[1];
    return /^(ECDH|DH)$/i.test(first) && tempKey[2] ? tempKey[2] : first;
  }
  return null;
}

export async function probeNegotiatedGroup(hostname, ip, port, { execFileFn, opensslPath }) {
  const args = ['s_client', '-brief', '-connect', hostPort(ip, port), '-servername', hostname];
  const r = await execFileFn(opensslPath, args, { timeoutMs: 6000 });
  const group = parseNegotiatedGroup(`${r.stdout}\n${r.stderr}`);
  if (group) return { group, measured: true, argv: [opensslPath, ...args], detail: 'group reported by openssl' };
  return { group: null, measured: false, argv: [opensslPath, ...args], detail: r.error ? `openssl failed: ${r.error.split('\n')[0]}` : 'openssl printed no group line' };
}

const SIG_ALG_OIDS = {
  '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
  '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
  '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
  '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
  '1.2.840.113549.1.1.10': 'rsassaPss',
  '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
  '1.2.840.10045.4.3.3': 'ecdsa-with-SHA384',
  '1.2.840.10045.4.3.4': 'ecdsa-with-SHA512',
  '1.3.101.112': 'Ed25519',
  '1.3.101.113': 'Ed448',
  '2.16.840.1.101.3.4.3.17': 'ML-DSA-44',
  '2.16.840.1.101.3.4.3.18': 'ML-DSA-65',
  '2.16.840.1.101.3.4.3.19': 'ML-DSA-87',
};

function readDerLen(buf, off) {
  const first = buf[off];
  if ((first & 0x80) === 0) return { len: first, next: off + 1 };
  const n = first & 0x7f;
  let len = 0;
  for (let i = 0; i < n; i++) len = (len << 8) | buf[off + 1 + i];
  return { len, next: off + 1 + n };
}

function decodeOid(buf, start, end) {
  const parts = [Math.floor(buf[start] / 40), buf[start] % 40];
  let val = 0;
  for (let i = start + 1; i < end; i++) {
    val = (val << 7) | (buf[i] & 0x7f);
    if ((buf[i] & 0x80) === 0) { parts.push(val); val = 0; }
  }
  return parts.join('.');
}

export function readCertSignatureAlgorithm(raw) {
  try {
    if (raw[0] !== 0x30) return '';
    let p = readDerLen(raw, 1).next;
    if (raw[p] !== 0x30) return '';
    const tbs = readDerLen(raw, p + 1);
    p = tbs.next + tbs.len;
    if (raw[p] !== 0x30) return '';
    const sigAlg = readDerLen(raw, p + 1);
    const q = sigAlg.next;
    if (raw[q] !== 0x06) return '';
    const oid = readDerLen(raw, q + 1);
    const dotted = decodeOid(raw, oid.next, oid.next + oid.len);
    return SIG_ALG_OIDS[dotted] || dotted;
  } catch {
    return '';
  }
}

const NIST_CURVE_NAMES = {
  prime256v1: 'P-256', secp256r1: 'P-256', secp384r1: 'P-384', secp521r1: 'P-521', secp256k1: 'secp256k1',
};
const CURVE_BITS = { 'P-256': 256, 'P-384': 384, 'P-521': 521, secp256k1: 256 };

export function readKeyIdentity(x509, legacy) {
  const legacyBits = typeof legacy?.bits === 'number' ? legacy.bits : 0;
  try {
    const key = x509?.publicKey;
    const type = key?.asymmetricKeyType;
    const details = key?.asymmetricKeyDetails ?? {};
    if (type === 'rsa' || type === 'rsa-pss') {
      return { publicKeyAlgorithm: 'RSA', keySizeBits: details.modulusLength ?? legacyBits };
    }
    if (type === 'ec') {
      const curveRaw = details.namedCurve ?? legacy?.asn1Curve ?? legacy?.nistCurve ?? '';
      const nist = NIST_CURVE_NAMES[curveRaw] ?? curveRaw;
      return { publicKeyAlgorithm: nist ? `ECDSA (${nist})` : 'ECDSA', keySizeBits: CURVE_BITS[nist] ?? legacyBits };
    }
    if (type === 'ed25519') return { publicKeyAlgorithm: 'Ed25519', keySizeBits: 256 };
    if (type === 'ed448') return { publicKeyAlgorithm: 'Ed448', keySizeBits: 448 };
    if (type) return { publicKeyAlgorithm: String(type).toUpperCase(), keySizeBits: legacyBits };
  } catch { /* ignore */ }
  return { publicKeyAlgorithm: '', keySizeBits: legacyBits };
}

export function emptyCert() {
  return {
    subject: '', commonName: '', sanList: [], issuer: '', issuerOrg: '',
    validFrom: '', validTo: '', daysRemaining: 0, serialNumber: '',
    publicKeyAlgorithm: '', keySizeBits: 0, signatureAlgorithm: '',
    fingerprintSha256: '', pem: '',
  };
}

export function failedInspection(ip, error) {
  return {
    connected: false, error, ip, tlsVersion: '', cipherSuite: '', verified: false,
    ocspStapling: null, alpnProtocols: [], cert: emptyCert(),
  };
}

function joinName(v) {
  return Array.isArray(v) ? v.join(' ') : (typeof v === 'string' ? v : '');
}

export function inspectTlsSocket(socket, { ip, now, ocspStapling }) {
  const x509 = typeof socket.getPeerX509Certificate === 'function' ? socket.getPeerX509Certificate() : undefined;
  const legacy = (typeof socket.getPeerCertificate === 'function' ? socket.getPeerCertificate(false) : null) || {};
  const cipher = typeof socket.getCipher === 'function' ? socket.getCipher() : null;
  const protocol = (typeof socket.getProtocol === 'function' ? socket.getProtocol() : '') || '';
  const alpn = socket.alpnProtocol ? [String(socket.alpnProtocol)] : [];

  const { publicKeyAlgorithm, keySizeBits } = readKeyIdentity(x509, legacy);
  const signatureAlgorithm = x509?.raw ? readCertSignatureAlgorithm(x509.raw) : '';

  const validToStr = x509?.validTo || legacy.valid_to || '';
  const validFromStr = x509?.validFrom || legacy.valid_from || '';
  const validToDate = validToStr ? new Date(validToStr) : null;
  const validToOk = validToDate !== null && !Number.isNaN(validToDate.getTime());
  const validFromDate = validFromStr ? new Date(validFromStr) : null;
  const validFromOk = validFromDate !== null && !Number.isNaN(validFromDate.getTime());

  const sanSource = x509?.subjectAltName || legacy.subjectaltname || '';
  const sanList = String(sanSource).split(',').map(s => s.trim().replace(/^DNS:/i, '')).filter(Boolean);

  const cn = joinName(legacy.subject?.CN);
  const issuerOrg = joinName(legacy.issuer?.O);
  const issuerCn = joinName(legacy.issuer?.CN);
  const issuer = issuerOrg
    ? (issuerCn ? `${issuerOrg} (${issuerCn})` : issuerOrg)
    : (issuerCn || (x509?.issuer ? x509.issuer.split('\n')[0] : ''));

  const fingerprintSha256 = x509?.fingerprint256 || (typeof legacy.fingerprint256 === 'string' ? legacy.fingerprint256 : '');
  const pem = x509?.raw
    ? `-----BEGIN CERTIFICATE-----\n${x509.raw.toString('base64').replace(/(.{64})/g, '$1\n').trimEnd()}\n-----END CERTIFICATE-----`
    : '';
  const authErr = socket.authorizationError;

  return {
    connected: true,
    ip,
    tlsVersion: protocol,
    cipherSuite: cipher?.name || '',
    verified: socket.authorized === true,
    verifyError: socket.authorized === true ? undefined : (authErr ? errMsg(authErr) : undefined),
    ocspStapling,
    alpnProtocols: alpn,
    cert: {
      subject: x509?.subject ? x509.subject.split('\n').join(', ') : (cn ? `CN=${cn}` : ''),
      commonName: cn,
      sanList,
      issuer,
      issuerOrg,
      validFrom: validFromOk && validFromDate ? validFromDate.toISOString() : '',
      validTo: validToOk && validToDate ? validToDate.toISOString() : '',
      daysRemaining: validToOk && validToDate ? Math.round((validToDate.getTime() - now) / 86400000) : 0,
      serialNumber: x509?.serialNumber || legacy.serialNumber || '',
      publicKeyAlgorithm,
      keySizeBits,
      signatureAlgorithm,
      fingerprintSha256,
      pem,
    },
  };
}

export function connectAndInspect(hostname, ip, port, opts, { tlsConnectFn, now }) {
  return new Promise((resolve) => {
    let settled = false;
    let ocsp = opts.deepTlsInspection ? false : null;
    const done = (r) => { if (!settled) { settled = true; resolve(r); } };
    let socket;
    try {
      socket = tlsConnectFn({
        host: ip,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        requestOCSP: opts.deepTlsInspection,
        ALPNProtocols: ['h2', 'http/1.1'],
      }, () => {
        try {
          done(inspectTlsSocket(socket, { ip, now: now(), ocspStapling: ocsp }));
        } catch (e) {
          done(failedInspection(ip, `could not read handshake: ${errMsg(e)}`));
        }
        try { socket.end(); } catch { /* ignore */ }
      });
    } catch (e) {
      done(failedInspection(ip, errMsg(e)));
      return;
    }
    if (opts.deepTlsInspection) {
      socket.on('OCSPResponse', (resp) => { ocsp = !!(resp && resp.length > 0); });
    }
    socket.on('error', (e) => done(failedInspection(ip, errMsg(e))));
    if (typeof socket.setTimeout === 'function') {
      socket.setTimeout(opts.timeoutMs, () => {
        try { socket.destroy(); } catch { /* ignore */ }
        done(failedInspection(ip, `timed out after ${opts.timeoutMs} ms`));
      });
    }
  });
}

export async function probeSessionResumption(hostname, ip, port, timeoutMs, { tlsConnectFn }) {
  const session = await new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    let s;
    try {
      s = tlsConnectFn({ host: ip, port, servername: hostname, rejectUnauthorized: false }, () => {
        const immediate = typeof s.getSession === 'function' ? s.getSession() : null;
        if (immediate && s.getProtocol?.() !== 'TLSv1.3') { done(immediate); s.end(); return; }
        setTimeout(() => { done(null); try { s.end(); } catch { /* ignore */ } }, 1500);
      });
    } catch { done(null); return; }
    s.on('session', (sess) => { done(sess); try { s.end(); } catch { /* ignore */ } });
    s.on('error', () => done(null));
    if (typeof s.setTimeout === 'function') s.setTimeout(timeoutMs, () => { try { s.destroy(); } catch { /* ignore */ } done(null); });
  });
  if (!session) return null;
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    let s;
    try {
      s = tlsConnectFn({ host: ip, port, servername: hostname, rejectUnauthorized: false, session }, () => {
        done(typeof s.isSessionReused === 'function' ? s.isSessionReused() : null);
        try { s.end(); } catch { /* ignore */ }
      });
    } catch { done(null); return; }
    s.on('error', () => done(null));
    if (typeof s.setTimeout === 'function') s.setTimeout(timeoutMs, () => { try { s.destroy(); } catch { /* ignore */ } done(null); });
  });
}

export function probeHsts(hostname, ip, port, { httpsRequestFn }) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };
    let req;
    try {
      req = httpsRequestFn({
        host: ip,
        port,
        method: 'HEAD',
        path: '/',
        servername: hostname,
        headers: { Host: hostname, 'User-Agent': 'vyuh-pqc-scan/0.1' },
        rejectUnauthorized: false,
        agent: false,
        timeout: 2500,
      }, (res) => {
        const sts = res.headers ? res.headers['strict-transport-security'] : undefined;
        done(Boolean(Array.isArray(sts) ? sts.length : sts));
        try { res.resume(); } catch { /* ignore */ }
      });
    } catch { done(null); return; }
    req.on('error', () => done(null));
    req.on('timeout', () => { try { req.destroy(); } catch { /* ignore */ } done(null); });
    req.end();
  });
}

export const defaultProbeDeps = {
  tlsConnectFn: (options, cb) => tls.connect(options, cb),
  httpsRequestFn: (options, cb) => https.request(options, cb),
  execFileFn: defaultExecFile,
};
