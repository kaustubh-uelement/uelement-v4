// @ts-check
/**
 * lib/pqc-scan.mjs - live PQC readiness scan for Vyuh.
 */
import { randomBytes, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { HOST_REGEX, isBlockedIP, resolveHost } from './net.mjs';
import {
  DNS_NAME_RE,
  queryCertificateTransparency,
  queryDnsRecords,
  checkDnssecViaDoH,
  lookupIpRegistry,
  opensslPqcCapable,
  probeNegotiatedGroup,
  connectAndInspect,
  failedInspection,
  probeSessionResumption,
  probeHsts,
  defaultDnsImpl,
  defaultProbeDeps,
} from './pqc-probe.mjs';
import { generateCycloneDxCbom } from './pqc-cbom.mjs';
import {
  calculateQuantumRisk,
  detectHybridKem,
} from '../shared/quantumRisk.ts';
import {
  PQC_ALGORITHMS_DB,
  CNSA_2_TIMELINE,
  INDIA_PQC_TIMELINE,
} from '../shared/pqcStandards.ts';

/** @typedef {import('../shared/types.ts').PqcScanResult} PqcScanResult */
/** @typedef {import('../shared/types.ts').ScanOptions} ScanOptions */
/** @typedef {import('../shared/types.ts').QuantumRiskLevel} QuantumRiskLevel */
/** @typedef {import('../shared/types.ts').DiscoveredEndpoint} DiscoveredEndpoint */
/** @typedef {import('./pqc-cbom.mjs').PqcEndpointOut} PqcEndpointOut */
/** @typedef {import('./pqc-probe.mjs').FetchLike} FetchLike */
/** @typedef {import('./pqc-probe.mjs').DnsImpl} DnsImpl */
/** @typedef {import('./pqc-probe.mjs').ExecFileFn} ExecFileFn */
/** @typedef {import('./pqc-probe.mjs').TlsConnectFn} TlsConnectFn */
/** @typedef {import('./pqc-probe.mjs').HttpsRequestFn} HttpsRequestFn */

/**
 * @typedef {Omit<PqcScanResult['summary'],
 *   'overallHndlScore' | 'avgQuantumVulnerabilityScore' | 'cnsa2TimelineCompliance' | 'nistComplianceRate'> & {
 *   overallHndlScore: number | null,
 *   avgQuantumVulnerabilityScore: number | null,
 *   cnsa2TimelineCompliance: number | null,
 *   nistComplianceRate: number | null,
 * }} PqcSummaryOut
 *
 * @typedef {ReturnType<typeof getStandardsComplianceSnapshot>} StandardsSnapshot
 *
 * @typedef {Omit<PqcScanResult, 'ctLogsCount' | 'summary' | 'endpoints'> & {
 *   ctLogsCount: number | null,
 *   summary: PqcSummaryOut,
 *   endpoints: PqcEndpointOut[],
 *   scanComplete: boolean,
 *   standardsCompliance: StandardsSnapshot,
 *   standardsSource: string,
 * }} PqcScanResultOut
 *
 * @typedef {{
 *   fetchImpl: FetchLike,
 *   resolveFn: (host: string) => Promise<string | null>,
 *   dnsImpl: DnsImpl,
 *   tlsConnectFn: TlsConnectFn,
 *   httpsRequestFn: HttpsRequestFn,
 *   execFileFn: ExecFileFn,
 *   opensslPath: string,
 *   now: () => number,
 *   uuid: () => string,
 *   randomHex: (bytes: number) => string,
 *   dohUrl?: string,
 * }} ScanDeps
 */

export const MAX_SUBDOMAIN_LIMIT = 15;
export const SUBDOMAIN_SCAN_CONCURRENCY = 5;
const PORT = 443;

export function normalizeDomain(input) {
  if (typeof input !== 'string' || !input.trim())
    return { ok: false, error: "Missing or invalid 'domain' parameter" };
  let d = input.trim().toLowerCase();
  d = d.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  d = d.replace(/[/?#].*$/, '');
  d = d.replace(/:\d+$/, '');
  d = d.replace(/\.$/, '');
  if (
    !d ||
    d.length > 253 ||
    !HOST_REGEX.test(d) ||
    isIP(d) ||
    !DNS_NAME_RE.test(d)
  ) {
    return {
      ok: false,
      error: "Invalid 'domain': expected a DNS name such as example.com",
    };
  }
  return { ok: true, domain: d };
}

function clampInt(v, min, max, dflt) {
  const n = Math.floor(Number(v));
  if (!v || !Number.isFinite(n)) return dflt;
  return Math.min(Math.max(min, n), max);
}

export function parseScanOptions(options) {
  const o = options && typeof options === 'object' ? options : {};
  return {
    enableCtLogs: o.enableCtLogs !== false,
    enableDnssec: o.enableDnssec !== false,
    enableHybridProbe: o.enableHybridProbe !== false,
    deepTlsInspection: o.deepTlsInspection === true,
    subdomainLimit: clampInt(o.subdomainLimit, 1, MAX_SUBDOMAIN_LIMIT, 8),
    timeoutMs: clampInt(o.timeoutMs, 2000, 15000, 8000),
  };
}

export function getStandardsComplianceSnapshot() {
  return {
    scope: 'reference-data',
    note: 'Describes the PQC standards reference database used for recommendations.',
    source: 'shared/pqcStandards.ts',
    nistFips: ['FIPS 203 ML-KEM', 'FIPS 204 ML-DSA', 'FIPS 205 SLH-DSA'],
    frameworks: ['NIST FIPS 203/204/205', 'CNSA 2.0 (2025-2033)', 'India NQM'],
    cnsaMilestones: CNSA_2_TIMELINE.length,
    indiaMilestones: INDIA_PQC_TIMELINE.length,
    algorithmsTracked: Object.keys(PQC_ALGORITHMS_DB).length,
  };
}

export function pqcStandardsKeyFor(ep) {
  if (ep.isHybridKem && ep.keyExchangeGroup) {
    const g = ep.keyExchangeGroup.toLowerCase();
    const hit = Object.keys(PQC_ALGORITHMS_DB).find(
      (k) => k.toLowerCase() === g
    );
    return hit || null;
  }
  const alg = ep.publicKeyAlg || '';
  if (/^ML-DSA-65/i.test(alg)) return 'ML-DSA-65';
  if (/^ML-DSA-87/i.test(alg)) return 'ML-DSA-87';
  if (alg.includes('RSA')) {
    if (ep.keySizeBits > 0 && ep.keySizeBits <= 2048) return 'RSA-2048';
    if (ep.keySizeBits >= 4096) return 'RSA-4096';
    return null;
  }
  if (alg === 'ECDSA (P-256)') return 'ECDSA-P256';
  if (alg === 'ECDSA (P-384)') return 'ECDSA-P384';
  return null;
}

export function calculateQuantumRiskWithStandards(input, kexUnmeasuredReason) {
  const canonical = calculateQuantumRisk(input);
  let replacement = canonical.replacement;
  if (kexUnmeasuredReason) {
    replacement = replacement.replace(
      '(OpenSSL 3.5+ unavailable)',
      `(${kexUnmeasuredReason})`
    );
  }
  const out = { ...canonical, replacement };
  if (canonical.risk === 'UNKNOWN' || canonical.risk === 'QUANTUM_SAFE')
    return out;

  const key = pqcStandardsKeyFor({
    isHybridKem: input.isHybridKem,
    keyExchangeGroup: input.keyExchangeGroup,
    publicKeyAlg: input.publicKeyAlg,
    keySizeBits: input.keySizeBits,
  });
  const db = key ? PQC_ALGORITHMS_DB[key] : null;
  if (!key || !db) return out;
  const caveat = replacement.match(/\s*\[[^\]]*\]\s*$/)?.[0] ?? '';
  const base = caveat
    ? replacement.slice(0, replacement.length - caveat.length)
    : replacement;
  const text = input.isHybridKem
    ? `${base} [PQC_ALGORITHMS_DB:${key} ${db.nistStatus}/${db.cnsa2Compliance}]`
    : `${db.recommendedReplacement} [PQC_ALGORITHMS_DB:${key} ${db.nistStatus}/${db.cnsa2Compliance}]`;
  return { ...out, replacement: text + caveat };
}

const pct = (n, d) => Math.round((n / d) * 100);

export function summarizeEndpoints(endpoints) {
  const total = endpoints.length;
  const assessed = endpoints.filter((e) => e.quantumRisk !== 'UNKNOWN');
  const n = assessed.length;
  const hybridCount = assessed.filter((e) => e.tls.isHybridKem).length;
  const pqcReadyCount = assessed.filter(
    (e) => e.quantumRisk === 'QUANTUM_SAFE'
  ).length;
  const vulnerableCount = assessed.filter(
    (e) => e.quantumRisk === 'CRITICAL' || e.quantumRisk === 'HIGH'
  ).length;

  /** @type {QuantumRiskLevel} */
  let overall;
  if (n === 0) overall = 'UNKNOWN';
  else if (vulnerableCount > 0)
    overall = vulnerableCount > n / 2 ? 'CRITICAL' : 'HIGH';
  else if (pqcReadyCount === n) overall = 'QUANTUM_SAFE';
  else overall = 'HYBRID_TRANSITIONAL';

  return {
    totalAssets: total,
    quantumVulnerableCount: vulnerableCount,
    hybridPqcCount: hybridCount,
    pqcReadyCount,
    unreachableCount: total - n,
    overallQuantumRisk: overall,
    overallHndlScore: n
      ? Math.round(assessed.reduce((a, e) => a + e.hndlExposureScore, 0) / n)
      : null,
    avgQuantumVulnerabilityScore: n
      ? Math.round(
          assessed.reduce((a, e) => a + e.quantumVulnerabilityScore, 0) / n
        )
      : null,
    cnsa2TimelineCompliance: n ? pct(hybridCount, n) : null,
    nistComplianceRate: n ? pct(pqcReadyCount, n) : null,
  };
}

async function runWithConcurrency(tasks, concurrency) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  );
  return results;
}

export function resolveScanDeps(partial = {}) {
  return {
    fetchImpl: partial.fetchImpl || globalThis.fetch,
    resolveFn:
      partial.resolveFn || ((h) => resolveHost(h, { blockPrivate: false })),
    dnsImpl: partial.dnsImpl || defaultDnsImpl(),
    tlsConnectFn: partial.tlsConnectFn || defaultProbeDeps.tlsConnectFn,
    httpsRequestFn: partial.httpsRequestFn || defaultProbeDeps.httpsRequestFn,
    execFileFn: partial.execFileFn || defaultProbeDeps.execFileFn,
    opensslPath: partial.opensslPath || process.env.OPENSSL || 'openssl',
    now: partial.now || Date.now,
    uuid: partial.uuid || randomUUID,
    randomHex: partial.randomHex || ((b) => randomBytes(b).toString('hex')),
    ...(partial.dohUrl ? { dohUrl: partial.dohUrl } : {}),
  };
}

const tri = (v, yes, no) =>
  v === true ? yes : v === false ? no : 'not determined';

export async function runPqcScan(domain, opts, partialDeps = {}) {
  const deps = resolveScanDeps(partialDeps);
  const start = deps.now();
  const logs = [];
  const base = domain.replace(/^www\./, '');
  logs.push(
    `Target ${domain} | options: ct=${opts.enableCtLogs ? 'on' : 'off'} dnssec=${opts.enableDnssec ? 'on' : 'off'} kexProbe=${opts.enableHybridProbe ? 'on' : 'off'} deepTls=${opts.deepTlsInspection ? 'on' : 'off'} subdomainLimit=${opts.subdomainLimit} timeoutMs=${opts.timeoutMs}`
  );

  // 1. Certificate Transparency
  let ctLogsCount = null;
  let ctHosts = [];
  if (opts.enableCtLogs) {
    const ct = await queryCertificateTransparency(base, {
      fetchImpl: deps.fetchImpl,
    });
    if (ct.ok) {
      ctLogsCount = ct.entries;
      ctHosts = ct.hostnames;
      logs.push(
        `CT: crt.sh returned ${ct.entries} certificate entries for %.${base}, ${ct.hostnames.length} unique in-scope hostnames`
      );
    } else {
      logs.push(
        `CT: query to crt.sh failed: ${ct.error}. Probing target domain directly.`
      );
    }
  }

  // 2. Candidate hosts
  const resolved = new Map();
  const resolveOnce = async (h) => {
    if (!resolved.has(h)) {
      let ip = null;
      try {
        ip = await deps.resolveFn(h);
      } catch {
        ip = null;
      }
      resolved.set(h, ip || null);
    }
    return resolved.get(h) ?? null;
  };
  const ctSet = new Set(ctHosts);
  const candidates = [{ host: domain, via: 'DIRECT_PROBE' }];
  const counterpart = domain.startsWith('www.') ? base : `www.${base}`;
  if (counterpart !== domain) {
    if (ctSet.has(counterpart)) {
      candidates.push({ host: counterpart, via: 'CERTIFICATE_TRANSPARENCY' });
    } else if (await resolveOnce(counterpart)) {
      candidates.push({ host: counterpart, via: 'DIRECT_PROBE' });
    }
  }
  for (const h of ctHosts) {
    if (!candidates.some((c) => c.host === h))
      candidates.push({ host: h, via: 'CERTIFICATE_TRANSPARENCY' });
  }
  const selected = candidates.slice(0, opts.subdomainLimit);
  logs.push(
    `Hosts: probing ${selected.length}: ${selected.map((c) => `${c.host} (${c.via})`).join(', ')}`
  );

  // 3. DNS records of the target + DNSSEC
  const targetDns = await queryDnsRecords(domain, { dnsImpl: deps.dnsImpl });
  if (targetDns.length)
    targetDns.forEach((r) => logs.push(`DNS ${domain} ${r.type} ${r.value}`));
  else logs.push(`DNS ${domain}: no records returned`);

  let dnssecActive = null;
  if (opts.enableDnssec) {
    const d = await checkDnssecViaDoH(base, {
      fetchImpl: deps.fetchImpl,
      dohUrl: deps.dohUrl,
    });
    dnssecActive = d.value;
    logs.push(
      `DNSSEC ${base}: ${d.value === true ? 'signed and validated' : d.value === false ? 'unsigned' : 'not determined'} (${d.detail}, via DoH)`
    );
  }

  // 4. Key-exchange group capability
  let kexOffReason = '';
  if (!opts.enableHybridProbe) {
    kexOffReason = 'key-exchange probe disabled by option';
  } else {
    const cap = await opensslPqcCapable({
      execFileFn: deps.execFileFn,
      opensslPath: deps.opensslPath,
    });
    if (cap.capable) {
      logs.push(
        `Key exchange: ${deps.opensslPath} reports OpenSSL ${cap.version}; negotiated group read from s_client.`
      );
    } else {
      kexOffReason = 'OpenSSL 3.5+ unavailable';
      logs.push(`Key exchange: ${cap.reason}; negotiated group not measured.`);
    }
  }

  // 5. Probe each host
  const tasks = selected.map((cand, idx) => async () => {
    const hostLogs = [];
    const { host, via } = cand;
    const dnsRecords =
      host === domain
        ? targetDns
        : await queryDnsRecords(host, { dnsImpl: deps.dnsImpl });
    const ip = await resolveOnce(host);

    let inspection = failedInspection(ip || '', 'not attempted');
    let kex = {
      group: null,
      measured: false,
      detail: kexOffReason || 'not attempted',
    };
    let hsts = null;
    let sessionResumption = null;
    let geo = {};

    if (!ip) {
      hostLogs.push(
        `${host}: DNS resolution returned no address; not connected.`
      );
    } else if (isBlockedIP(ip)) {
      hostLogs.push(
        `${host}: resolves to ${ip}, a private address; blocked (SSRF guard).`
      );
    } else {
      const [ins, grp] = await Promise.all([
        connectAndInspect(
          host,
          ip,
          PORT,
          {
            deepTlsInspection: opts.deepTlsInspection,
            timeoutMs: opts.timeoutMs,
          },
          { tlsConnectFn: deps.tlsConnectFn, now: deps.now }
        ),
        kexOffReason
          ? Promise.resolve(null)
          : probeNegotiatedGroup(host, ip, PORT, {
              execFileFn: deps.execFileFn,
              opensslPath: deps.opensslPath,
            }),
      ]);
      inspection = ins;
      if (grp) {
        hostLogs.push(
          `${host}: ran \`${grp.argv.join(' ')}\` -> ${grp.measured ? `group ${grp.group}` : `no group (${grp.detail})`}`
        );
        kex = { group: grp.group, measured: grp.measured, detail: grp.detail };
      }
      if (!ins.connected) {
        hostLogs.push(
          `${host}: ${ip}:${PORT} TLS handshake failed: ${ins.error}`
        );
        kex = { group: null, measured: false, detail: 'TLS handshake failed' };
      } else {
        [hsts, geo, sessionResumption] = await Promise.all([
          probeHsts(host, ip, PORT, { httpsRequestFn: deps.httpsRequestFn }),
          lookupIpRegistry(ip, { fetchImpl: deps.fetchImpl }),
          opts.deepTlsInspection
            ? probeSessionResumption(host, ip, PORT, opts.timeoutMs, {
                tlsConnectFn: deps.tlsConnectFn,
              })
            : Promise.resolve(null),
        ]);
        const c = ins.cert;
        hostLogs.push(
          `${host}: ${ip}:${PORT} ${ins.tlsVersion || 'protocol ?'} ${ins.cipherSuite || 'cipher ?'} | cert ${c.publicKeyAlgorithm || 'key ?'}${c.keySizeBits ? `-${c.keySizeBits}` : ''} ${c.signatureAlgorithm || 'sigalg ?'} CN=${c.commonName || '?'} issuer=${c.issuer || '?'}` +
            ` | chain ${ins.verified ? 'verified' : 'unverified'} | HSTS ${tri(hsts, 'present', 'absent')}`
        );
      }
    }

    const connected = inspection.connected;
    const group = connected && kex.measured ? kex.group : null;
    const kexMeasured = connected && kex.measured;
    const isHybridKem = group ? detectHybridKem(group).isHybridKem : false;
    const cert = inspection.cert;
    const expiryMeasured = connected && cert.validTo !== '';
    const risk = calculateQuantumRiskWithStandards(
      {
        publicKeyAlg: cert.publicKeyAlgorithm,
        keySizeBits: cert.keySizeBits,
        cipherSuite: inspection.cipherSuite,
        isHybridKem,
        signatureAlgorithm: cert.signatureAlgorithm,
        connected,
        keyExchangeObserved: kexMeasured,
        keyExchangeGroup: group ?? undefined,
        daysRemaining: expiryMeasured ? cert.daysRemaining : undefined,
      },
      kexMeasured ? undefined : kexOffReason || kex.detail
    );

    const endpoint = {
      id: `ep-${idx + 1}-${deps.randomHex(4)}`,
      domain,
      subdomain: host,
      port: PORT,
      ipAddress: ip || '',
      asn: geo.asn,
      org: geo.org,
      country: geo.country,
      tls: {
        protocol: inspection.tlsVersion,
        cipherSuite: inspection.cipherSuite,
        keyExchangeGroup: group ?? undefined,
        keyExchangeGroupMeasured: kexMeasured,
        isHybridKem,
        isPqcReady:
          risk.risk === 'QUANTUM_SAFE' ||
          (isHybridKem && risk.authenticationStillClassical === false),
        authenticationStillClassical: risk.authenticationStillClassical,
        verified: connected ? inspection.verified : undefined,
        alpnProtocols: inspection.alpnProtocols,
        hstsEnabled: hsts,
        ocspStapling: connected ? inspection.ocspStapling : null,
        sessionResumption,
      },
      certificate: {
        subject: cert.subject,
        commonName: cert.commonName,
        sanList: cert.sanList,
        issuer: cert.issuer,
        issuerOrg: cert.issuerOrg || undefined,
        validFrom: cert.validFrom,
        validTo: cert.validTo,
        daysRemaining: cert.daysRemaining,
        serialNumber: cert.serialNumber,
        publicKeyAlgorithm: cert.publicKeyAlgorithm,
        keySizeBits: cert.keySizeBits,
        signatureAlgorithm: cert.signatureAlgorithm,
        fingerprintSha256: cert.fingerprintSha256,
        isExpired: expiryMeasured ? cert.daysRemaining <= 0 : false,
        quantumRisk: risk.risk,
        pqcReplacement: risk.replacement,
      },
      dnsRecords,
      discoveredVia: via,
      quantumVulnerabilityScore: risk.score,
      hndlExposureScore: risk.hndlScore,
      quantumRisk: risk.risk,
      lastScanned: new Date(deps.now()).toISOString(),
      migrationPriority: risk.priority,
    };
    return { endpoint, hostLogs };
  });

  const probed = await runWithConcurrency(tasks, SUBDOMAIN_SCAN_CONCURRENCY);
  const endpoints = probed.map((p) => p.endpoint);
  probed.forEach((p) => logs.push(...p.hostLogs));

  // 6. Summary + CBOM
  const summary = summarizeEndpoints(endpoints);
  const { cbom, validation } = generateCycloneDxCbom(domain, endpoints, {
    uuid: deps.uuid,
    now: deps.now,
  });
  logs.push(
    `CBOM: CycloneDX 1.6 document built, ${cbom.components.length} components; validation ${validation.valid ? 'passed' : 'failed'}.`
  );

  return {
    scanId: `pqc-scan-${start}-${deps.randomHex(3)}`,
    targetDomain: domain,
    timestamp: new Date(start).toISOString(),
    durationMs: deps.now() - start,
    endpointsCount: endpoints.length,
    scanComplete: true,
    summary,
    endpoints,
    dnssecActive,
    ctLogsCount,
    cbom,
    logs,
    standardsCompliance: getStandardsComplianceSnapshot(),
    standardsSource: 'shared/pqcStandards.ts',
  };
}
