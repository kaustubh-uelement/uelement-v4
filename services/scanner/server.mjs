// @ts-check
import http from 'node:http';
import { normalizeDomain, parseScanOptions, runPqcScan } from './lib/pqc-scan.mjs';
import { normalizeRepoUrl, runRepoScan } from './lib/repo-scan.mjs';
import { createEmailOtp, verifyEmailOtp } from './lib/otp-store.mjs';
import { sendOtpEmail } from './lib/email-service.mjs';

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';

// In-memory rate limiting: max 15 scans per 5 minutes per IP
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const ipRequestMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  entry.count++;
  return false;
}

// Clean up stale rate-limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRequestMap.entries()) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      ipRequestMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

function setCorsHeaders(res, req) {
  const origin = req.headers['origin'] || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Format raw scan result into the structure expected by VyuhScanner frontend.
 */
function formatFrontendResults(raw) {
  const { summary, endpoints, targetDomain, ctLogsCount, dnssecActive } = raw;
  const primaryEp = endpoints[0] || null;

  // Quantum readiness score (0 = critically exposed, 100 = fully quantum-safe)
  const hndl = summary.overallHndlScore ?? 75;
  const score = Math.max(5, Math.min(100, Math.round(100 - hndl)));

  let band = 'Critical Quantum Exposure (Broken / Legacy Crypto)';
  if (summary.overallQuantumRisk === 'QUANTUM_SAFE') {
    band = 'Quantum-Safe (NIST FIPS 203/204/205 Compliant)';
  } else if (summary.overallQuantumRisk === 'HYBRID_TRANSITIONAL') {
    band = 'Hybrid Transitional (ML-KEM Active, Classical Auth)';
  } else if (summary.overallQuantumRisk === 'HIGH') {
    band = 'High Quantum Exposure (Classical RSA/ECC Primitives)';
  } else if (summary.overallQuantumRisk === 'MEDIUM') {
    band = 'Moderate Quantum Exposure (Upgrade In Progress)';
  }

  const cbomItems = [];
  let brokenCount = 0;
  let weakCount = 0;
  let safeCount = 0;

  for (const ep of endpoints) {
    const sub = ep.subdomain || ep.domain;
    if (ep.quantumRisk === 'UNKNOWN') continue;

    // 1. Certificate Primitive
    const cert = ep.certificate;
    const certVerdict = cert.quantumRisk === 'QUANTUM_SAFE' ? 'safe' : 'broken';
    if (certVerdict === 'safe') safeCount++; else brokenCount++;
    cbomItems.push({
      asset: `${sub} Leaf Certificate`,
      primitive: `${cert.publicKeyAlgorithm || 'RSA'} (${cert.keySizeBits || 2048}-bit) / ${cert.signatureAlgorithm || 'SHA-256'}`,
      purpose: 'Server Authentication & Identity',
      verdict: certVerdict,
      replacement: cert.pqcReplacement || 'ML-DSA-65 (NIST FIPS 204)',
    });

    // 2. Key Exchange
    const isHybrid = ep.tls.isHybridKem;
    const kexVerdict = isHybrid ? 'safe' : 'broken';
    if (kexVerdict === 'safe') safeCount++; else brokenCount++;
    cbomItems.push({
      asset: `${sub} TLS Key Exchange`,
      primitive: ep.tls.keyExchangeGroup || 'ECDHE (Classical)',
      purpose: 'Session Key Establishment',
      verdict: kexVerdict,
      replacement: isHybrid ? 'Maintained (ML-KEM Compliant)' : 'X25519MLKEM768 Hybrid (NIST FIPS 203)',
    });

    // 3. Transport Cipher
    const cipher = ep.tls.cipherSuite || 'AES-128-GCM';
    const is256 = cipher.includes('256') || cipher.includes('CHACHA20');
    const cipherVerdict = is256 ? 'safe' : 'weak';
    if (cipherVerdict === 'safe') safeCount++; else weakCount++;
    cbomItems.push({
      asset: `${sub} Bulk Transport Cipher`,
      primitive: cipher,
      purpose: 'Payload Confidentiality (Symmetric)',
      verdict: cipherVerdict,
      replacement: is256 ? 'Maintained (Grover-Resistant 256-bit)' : 'AES-256-GCM (NIST CNSA 2.0)',
    });

    // 4. Ingress Protocol
    const proto = ep.tls.protocol || 'TLSv1.3';
    const protoVerdict = proto === 'TLSv1.3' ? 'safe' : 'weak';
    if (protoVerdict === 'safe') safeCount++; else weakCount++;
    cbomItems.push({
      asset: `${sub} Ingress Protocol`,
      primitive: proto,
      purpose: 'Network Transport Security',
      verdict: protoVerdict,
      replacement: proto === 'TLSv1.3' ? 'Maintained (TLS 1.3)' : 'Enforce TLS 1.3 Strict',
    });

    // 5. CA Chain
    if (cert.issuerOrg || cert.issuer) {
      brokenCount++;
      cbomItems.push({
        asset: `${sub} Intermediate CA`,
        primitive: cert.issuerOrg || cert.issuer,
        purpose: 'Chain of Trust Validation',
        verdict: 'broken',
        replacement: 'ML-DSA-87 Hierarchy (NIST FIPS 204)',
      });
    }
  }

  // Generate dynamic findings
  const findings = [];
  const assessedEndpoints = endpoints.filter(e => e.quantumRisk !== 'UNKNOWN');
  const hasClassicalKex = assessedEndpoints.some(e => !e.tls.isHybridKem);
  const hasClassicalCert = assessedEndpoints.some(e => e.certificate.quantumRisk !== 'QUANTUM_SAFE');
  const hasWeakCipher = assessedEndpoints.some(e => !e.tls.cipherSuite.includes('256') && !e.tls.cipherSuite.includes('CHACHA20'));
  const hasNoHsts = assessedEndpoints.some(e => e.tls.hstsEnabled === false);

  if (hasClassicalKex) {
    findings.push({
      sev: 'critical',
      title: 'Harvest Now, Decrypt Later (HNDL) Vulnerability in TLS Handshake',
      detail: `Endpoints on ${targetDomain} negotiate classical key exchange algorithms (ECDHE/RSA). Encrypted communications can be recorded today and decrypted once cryptanalytically relevant quantum computers (CRQCs) emerge.`,
      fix: 'Deploy hybrid post-quantum key exchange (X25519MLKEM768) on load balancers, reverse proxies, and CDN edge listeners.',
      std: 'NIST FIPS 203 (ML-KEM) / NSA CNSA 2.0',
    });
  }

  if (hasClassicalCert) {
    findings.push({
      sev: 'high',
      title: 'Classical Public Key Infrastructure (Shor-Vulnerable Signatures)',
      detail: `Public certificates utilize classical RSA/ECDSA key pairs. Shor's algorithm provides polynomial-time factoring of these keys, enabling fraudulent digital certificate forgery.`,
      fix: 'Establish migration roadmap to NIST FIPS 204 (ML-DSA-65/87) dual-certificate hierarchies and crypto-agile PKI.',
      std: 'NIST FIPS 204 (ML-DSA) / RFC 9549',
    });
  }

  if (hasWeakCipher) {
    findings.push({
      sev: 'medium',
      title: '128-Bit Symmetric Cipher Suites Vulnerable to Grover Speedup',
      detail: 'Observed TLS ciphers employ 128-bit keys (e.g. AES-128-GCM). Grover’s quantum algorithm reduces effective symmetric security by half (to 64-bit strength), which falls below federal security thresholds.',
      fix: 'Reconfigure TLS cipher priority to require 256-bit symmetric primitives (AES-256-GCM / ChaCha20-Poly1305).',
      std: 'NIST SP 800-57 / CNSA 2.0',
    });
  }

  if (hasNoHsts) {
    findings.push({
      sev: 'medium',
      title: 'Missing or Non-Compliant HTTP Strict Transport Security (HSTS)',
      detail: 'Target web service fails to return a strict HSTS header with max-age >= 31536000, leaving user agents susceptible to SSL-stripping and downgrade maneuvers.',
      fix: 'Set header "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" across all ingress points.',
      std: 'RFC 6797',
    });
  }

  if (dnssecActive === false) {
    findings.push({
      sev: 'low',
      title: 'DNSSEC Signatures Inactive on Zone Apex',
      detail: 'DNS query responses lack cryptographic authentication signatures (RRSIG). An attacker capable of DNS cache poisoning can divert traffic prior to TLS negotiation.',
      fix: 'Activate DNSSEC signing at the domain registrar with ECDSA / PQC-compatible DS records.',
      std: 'RFC 4033 / RFC 4035',
    });
  }

  // Technical detail key-value pairs
  const detail = [
    ['Target Domain', targetDomain],
    ['Total Discovered Subdomains', String(ctLogsCount || endpoints.length)],
    ['Assessed Live Endpoints', `${assessedEndpoints.length} of ${endpoints.length}`],
    ['Primary Host IP', primaryEp?.ipAddress || 'Not resolved'],
    ['Autonomous System (ASN)', primaryEp?.asn || 'Not determined'],
    ['Hosting Provider / Org', primaryEp?.org || 'Not determined'],
    ['Primary Certificate CN', primaryEp?.certificate?.commonName || targetDomain],
    ['Subject Alt Names (SANs)', primaryEp?.certificate?.sanList?.slice(0, 6).join(', ') || 'None'],
    ['Certificate Authority (CA)', primaryEp?.certificate?.issuer || 'Unknown'],
    ['Certificate Expiry', primaryEp?.certificate?.validTo ? `${primaryEp.certificate.daysRemaining} days remaining (${primaryEp.certificate.validTo.slice(0, 10)})` : 'Unknown'],
    ['Public Key Algorithm', primaryEp?.certificate ? `${primaryEp.certificate.publicKeyAlgorithm} (${primaryEp.certificate.keySizeBits} bits)` : 'Unknown'],
    ['Signature Algorithm', primaryEp?.certificate?.signatureAlgorithm || 'Unknown'],
    ['Observed TLS Protocol', primaryEp?.tls?.protocol || 'TLS 1.3'],
    ['Negotiated Cipher Suite', primaryEp?.tls?.cipherSuite || 'Unknown'],
    ['Hybrid PQC Group (ML-KEM)', primaryEp?.tls?.keyExchangeGroup || 'None (Classical Only)'],
    ['HSTS Enforcement', primaryEp?.tls?.hstsEnabled ? 'Active (Strict)' : 'Not Observed'],
    ['DNSSEC Verification', dnssecActive ? 'Signed & Validated' : dnssecActive === false ? 'Unsigned' : 'Unmeasured'],
  ];

  // Tailored migration plan
  const plan = [
    {
      phase: 'Phase 1: Immediate Ingress Protection (0–3 Months)',
      title: 'Deploy Hybrid KEM at Edge Ingress (HNDL Mitigation)',
      desc: 'Enable X25519MLKEM768 hybrid key exchange (NIST FIPS 203) across public load balancers, Cloudflare, or Nginx reverse proxies to immediately safeguard against retroactive decryption.',
    },
    {
      phase: 'Phase 2: Cryptographic Inventory & CBOM (3–9 Months)',
      title: 'Continuous CBOM Generation & Dependency Audits',
      desc: 'Integrate CycloneDX 1.6 Cryptographic BOM generation into internal CI/CD pipelines to track deprecation of RSA-2048, 128-bit ciphers, and legacy digest algorithms.',
    },
    {
      phase: 'Phase 3: Public Key Infrastructure Migration (9–24 Months)',
      title: 'Transition PKI & Certificates to NIST FIPS 204 (ML-DSA)',
      desc: 'Establish dual-certificate support on internal Certificate Authorities and upgrade leaf and intermediate X.509 certificates to ML-DSA-65 / ML-DSA-87.',
    },
    {
      phase: 'Phase 4: Full Sovereign & CNSA 2.0 Compliance (24+ Months)',
      title: 'Retire Classical Cryptographic Fallbacks',
      desc: 'Enforce exclusive Post-Quantum Cryptography across internal mTLS, databases, and microservice meshes in compliance with CNSA 2.0 and national guidelines.',
    },
  ];

  return {
    target: targetDomain,
    type: 'url',
    when: new Date(),
    score,
    band,
    retention: 12,
    stats: {
      total: cbomItems.length,
      broken: brokenCount,
      weak: weakCount,
      safe: safeCount,
    },
    cbom: cbomItems,
    findings,
    detail,
    plan,
    raw,
  };
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;

  // Health check
  if (path === '/' || path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'vyuh-pqc-scanner', version: '0.1.0' }));
    return;
  }

  // OTP Endpoint 1: Send Corporate Email Verification Code
  if (path === '/api/otp/send-email' && req.method === 'POST') {
    let bodyRaw = '';
    req.on('data', chunk => {
      bodyRaw += chunk;
      if (bodyRaw.length > 16 * 1024) req.destroy();
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyRaw || '{}');
        const email = String(body.email || '').trim().toLowerCase();
        const name = String(body.name || '').trim();

        if (!email || !email.includes('@')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Please provide a valid corporate email address.' }));
          return;
        }

        const otpResult = createEmailOtp(email);
        if (!otpResult.ok) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: otpResult.error, retryAfterSeconds: otpResult.retryAfterSeconds }));
          return;
        }

        const sendResult = await sendOtpEmail(email, otpResult.code, name);
        if (!sendResult.ok) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: sendResult.error || 'Failed to dispatch email verification code.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Verification code sent to ${email}`,
          expiresAt: otpResult.expiresAt,
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error processing OTP request.' }));
      }
    });
    return;
  }

  // OTP Endpoint 2: Verify Corporate Email Verification Code
  if (path === '/api/otp/verify-email' && req.method === 'POST') {
    let bodyRaw = '';
    req.on('data', chunk => {
      bodyRaw += chunk;
      if (bodyRaw.length > 16 * 1024) req.destroy();
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyRaw || '{}');
        const email = String(body.email || '').trim().toLowerCase();
        const code = String(body.code || '').trim();

        if (!email || !code) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email and 6-digit verification code are required.' }));
          return;
        }

        const verifyResult = verifyEmailOtp(email, code);
        if (!verifyResult.ok) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: verifyResult.error,
            attemptsRemaining: verifyResult.attemptsRemaining,
          }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          verified: true,
          email,
          message: 'Corporate email address successfully verified.',
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error verifying code.' }));
      }
    });
    return;
  }

  // Scan endpoint
  if (path === '/api/scan' && req.method === 'POST') {
    const clientIp = req.socket.remoteAddress || '127.0.0.1';
    if (isRateLimited(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Rate limit exceeded. Please wait a few minutes before scanning again.' }));
      return;
    }

    let bodyRaw = '';
    req.on('data', chunk => {
      bodyRaw += chunk;
      if (bodyRaw.length > 64 * 1024) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyRaw || '{}');
        const rawTarget = body.target || body.repo || body.domain || '';
        const scanType = body.type || (rawTarget.includes('github.com') ? 'repo' : 'url');

        if (!rawTarget || typeof rawTarget !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Please provide a target domain or repository to scan.' }));
          return;
        }

        // Branch 1: Public & Private GitHub Repository Scan
        if (scanType === 'repo') {
          const normRepo = normalizeRepoUrl(rawTarget);
          if (!normRepo.ok) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: normRepo.error }));
            return;
          }

          // Extract token from request body, headers, or server environment
          const authHeader = req.headers['authorization'] || '';
          const token = (
            body.token ||
            body.githubToken ||
            body.options?.token ||
            body.options?.githubToken ||
            (authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '') ||
            req.headers['x-github-token'] ||
            process.env.GITHUB_TOKEN ||
            ''
          ).trim();

          const scanOptions = {
            ...(body.options || {}),
            token,
          };

          try {
            const repoResult = await runRepoScan(normRepo, scanOptions);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(repoResult));
          } catch (repoErr) {
            const errMsg =
              repoErr instanceof Error ? repoErr.message : String(repoErr);
            const isAccessError =
              errMsg.includes('Unable to access') ||
              errMsg.includes('private') ||
              errMsg.includes('not found') ||
              errMsg.includes('token');
            const statusCode = isAccessError ? 400 : 500;
            res.writeHead(statusCode, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: errMsg,
                details: errMsg,
                isAccessError,
              })
            );
          }
          return;
        }

        // Branch 2: Public Domain / Ingress TLS Scan
        const norm = normalizeDomain(rawTarget);
        if (!norm.ok) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: norm.error }));
          return;
        }

        const scanOptions = parseScanOptions(body.options);
        const rawResult = await runPqcScan(norm.domain, scanOptions);
        const formatted = formatFrontendResults(rawResult);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(formatted));
      } catch (err) {
        console.error('Scan execution error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'An error occurred while executing the scan.',
          details: err instanceof Error ? err.message : String(err),
        }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`[vyuh-scanner] Production PQC scanner server listening on http://${HOST}:${PORT}`);
});
