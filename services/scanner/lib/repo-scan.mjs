// @ts-check
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  mkdtempSync,
  rmSync,
  readFileSync,
  statSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, extname } from 'node:path';
import { randomUUID, X509Certificate } from 'node:crypto';
import { validateCycloneDxCbomStructure } from '../shared/cbom.ts';

const execFileAsync = promisify(execFile);

const MAX_SCAN_FILES = 2500;
const MAX_FILE_SIZE_BYTES = 512 * 1024; // 512 KB
const CLONE_TIMEOUT_MS = 25000; // 25s max

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'vendor',
  'target',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'venv',
  '.venv',
  '__pycache__',
  '.idea',
  '.vscode',
  '.gradle',
  '.mvn',
  'coverage',
]);

const CODE_EXTS = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.go',
  '.java',
  '.rs',
  '.rb',
  '.php',
  '.c',
  '.cpp',
  '.cc',
  '.h',
  '.hpp',
  '.cs',
  '.sh',
  '.yml',
  '.yaml',
]);

const CERT_KEY_EXTS = new Set(['.pem', '.crt', '.cer', '.key', '.pub']);

/**
 * Validates and parses a repository target URL or shorthand into GitHub metadata.
 * Supports:
 *  - https://github.com/owner/repo
 *  - http://github.com/owner/repo.git
 *  - github.com/owner/repo
 *  - owner/repo
 *
 * @param {string} raw
 * @returns {{ ok: true, owner: string, repo: string, cloneUrl: string, webUrl: string, repoFullName: string } | { ok: false, error: string }}
 */
export function normalizeRepoUrl(raw) {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'Target repository URL cannot be empty.' };
  }

  let cleaned = raw.trim();

  // Strip trailing slashes and .git
  cleaned = cleaned.replace(/\.git\/?$/i, '').replace(/\/+$/, '');

  // Handle shorthand: owner/repo (with or without http/https)
  const stripped = cleaned.replace(/^https?:\/\//i, '');
  const shorthandMatch = stripped.match(
    /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/
  );
  if (shorthandMatch && !shorthandMatch[1].includes('.')) {
    const owner = shorthandMatch[1];
    const repo = shorthandMatch[2];
    return {
      ok: true,
      owner,
      repo,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
      webUrl: `https://github.com/${owner}/${repo}`,
      repoFullName: `${owner}/${repo}`,
    };
  }

  // Handle standard URL: https://github.com/owner/repo
  const urlMatch = cleaned.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/i
  );
  if (urlMatch) {
    const owner = urlMatch[1];
    const repo = urlMatch[2];
    return {
      ok: true,
      owner,
      repo,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
      webUrl: `https://github.com/${owner}/${repo}`,
      repoFullName: `${owner}/${repo}`,
    };
  }

  return {
    ok: false,
    error:
      'Invalid repository URL. Please provide a valid public GitHub repository URL (e.g. https://github.com/owner/repo or owner/repo).',
  };
}

/**
 * Manifest package knowledge base for cryptographic identification.
 */
const KNOWN_PACKAGES = {
  // JavaScript / TypeScript (npm)
  jsonwebtoken: {
    primitive: 'Classical Digital Signatures (RS256/ES256/HS256)',
    purpose: 'Authentication & Session Token Signing',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65) / CNSA 2.0 State-Managed PKI',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  jose: {
    primitive: 'Universal JOSE (JWT, JWS, JWE with RSA/ECDH)',
    purpose: 'Cryptographic Token Signatures & Encryption',
    verdict: 'broken',
    replacement: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  'crypto-js': {
    primitive: 'Legacy Ciphers & Hashes (MD5, SHA-1, AES-128, DES)',
    purpose: 'Client-side Symmetric Confidentiality & Digest',
    verdict: 'broken',
    replacement: 'Web Cryptography API / AES-256-GCM / SHA-384',
    quantumSecurityLevel: 0,
    shorRisk: false,
    groverRisk: true,
  },
  'node-forge': {
    primitive: 'Classical PKI & RSA-2048/4096 / TLS Implementation',
    purpose: 'Certificate Generation & Public Key Management',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65) PKI Hierarchy',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  elliptic: {
    primitive: 'Classical Elliptic Curve Cryptography (secp256k1/P-256)',
    purpose: 'Elliptic Curve Key Exchange & ECDSA Signatures',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65) Signatures',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  tweetnacl: {
    primitive: 'Classical Ed25519 & X25519 Primitives',
    purpose: 'Public-key Authenticated Box Encryption & Signatures',
    verdict: 'broken',
    replacement: 'NIST FIPS 203 (ML-KEM-768) & FIPS 204 (ML-DSA)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  bcrypt: {
    primitive: 'Blowfish-derived Key Derivation (Classical)',
    purpose: 'Credential Storage & Password Hashing',
    verdict: 'weak',
    replacement: 'Argon2id (RFC 9106) / PBKDF2 with SHA-384',
    quantumSecurityLevel: 1,
    shorRisk: false,
    groverRisk: false,
  },
  bcryptjs: {
    primitive: 'Blowfish-derived Key Derivation (Classical JS)',
    purpose: 'Credential Storage & Password Hashing',
    verdict: 'weak',
    replacement: 'Argon2id (RFC 9106) / PBKDF2 with SHA-384',
    quantumSecurityLevel: 1,
    shorRisk: false,
    groverRisk: false,
  },
  '@noble/curves': {
    primitive: 'Classical Elliptic Curves (secp256k1, Ed25519, P-256)',
    purpose: 'ECC Signatures & Key Agreement',
    verdict: 'broken',
    replacement: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  '@noble/hashes': {
    primitive: 'Cryptographic Hashes (SHA-256, SHA-384, SHA-512, SHA-3)',
    purpose: 'Cryptographic Digest & HMAC Verification',
    verdict: 'safe',
    replacement: 'Maintained (Grover-Resistant SHA-384 / SHA-512)',
    quantumSecurityLevel: 3,
    shorRisk: false,
    groverRisk: false,
  },
  ssh2: {
    primitive: 'Classical SSH Key Exchange & Host Authentication',
    purpose: 'Secure Remote Shell & Automated Transfer',
    verdict: 'broken',
    replacement: 'OpenSSH 9.0+ Hybrid (sntrup761x25519-sha512 / ML-KEM)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },

  // Python
  cryptography: {
    primitive: 'Classical RSA / DSA / ECDSA & AES Hazmat',
    purpose: 'Core Application Cryptography & Key Management',
    verdict: 'broken',
    replacement: 'NIST FIPS 203 (ML-KEM) / FIPS 204 (ML-DSA) & AES-256',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  pycryptodome: {
    primitive: 'Classical RSA, DES, 3DES, AES Ciphers',
    purpose: 'Low-level Cryptographic Primitives',
    verdict: 'broken',
    replacement: 'NIST FIPS 203/204 Post-Quantum Algorithms',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  pycrypto: {
    primitive: 'Deprecated Classical Crypto Toolkit',
    purpose: 'Legacy Encryption & Signing',
    verdict: 'broken',
    replacement: 'Migrate immediately to Post-Quantum Cryptography',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  rsa: {
    primitive: 'Classical Pure-Python RSA-2048/4096',
    purpose: 'Asymmetric Encryption & PKCS#1 Signatures',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  ecdsa: {
    primitive: 'Classical Pure-Python ECDSA',
    purpose: 'Digital Signatures & Identity Verification',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  paramiko: {
    primitive: 'Classical SSHv2 Protocol (RSA / ECDSA Host Keys)',
    purpose: 'Remote Command Execution & SFTP Transport',
    verdict: 'broken',
    replacement: 'Post-Quantum SSH (ML-KEM / sntrup761 Hybrid)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  pyjwt: {
    primitive: 'Classical JWT Token Signatures (RS256, ES256)',
    purpose: 'API Authentication & Bearer Tokens',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65) Token Profiles',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  pynacl: {
    primitive: 'Classical libsodium Python Bindings (Ed25519/X25519)',
    purpose: 'Public-key Authenticated Box Encryption',
    verdict: 'broken',
    replacement: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  pqcrypto: {
    primitive: 'NIST Post-Quantum Algorithms (ML-KEM / ML-DSA)',
    purpose: 'Quantum-Resistant Key Exchange & Signatures',
    verdict: 'safe',
    replacement: 'Maintained (NIST FIPS 203/204 Compliant)',
    quantumSecurityLevel: 3,
    shorRisk: false,
    groverRisk: false,
  },
  liboqs: {
    primitive: 'Open Quantum Safe (OQS) C/Python Post-Quantum Library',
    purpose: 'Post-Quantum KEMs & Digital Signatures',
    verdict: 'safe',
    replacement: 'Maintained (NIST FIPS 203/204/205 Compliant)',
    quantumSecurityLevel: 3,
    shorRisk: false,
    groverRisk: false,
  },

  // Java / JVM
  'org.bouncycastle:bcprov-jdk18on': {
    primitive: 'Bouncy Castle Security Provider (FIPS 203/204 Supported)',
    purpose: 'Enterprise Cryptography & Certificate Management',
    verdict: 'safe',
    replacement:
      'Maintained (Ensure ML-KEM and ML-DSA providers are instantiated)',
    quantumSecurityLevel: 3,
    shorRisk: false,
    groverRisk: false,
  },
  'org.bouncycastle:bcprov-jdk15on': {
    primitive: 'Legacy Bouncy Castle Provider (Classical RSA/ECC)',
    purpose: 'Enterprise Cryptography Provider',
    verdict: 'broken',
    replacement: 'Upgrade to Bouncy Castle 1.78+ with ML-KEM/ML-DSA Provider',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  'io.jsonwebtoken:jjwt': {
    primitive: 'Classical Java JWT (RSA / ECDSA / HMAC)',
    purpose: 'Microservice JWT Token Validation',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA) Token Validation',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },

  // Go
  'golang.org/x/crypto': {
    primitive: 'Classical Go Supplementary Crypto (SSH, Curve25519, OpenPGP)',
    purpose: 'Go Cryptographic Protocols & Primitives',
    verdict: 'broken',
    replacement: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  'github.com/cloudflare/circl': {
    primitive: 'Cloudflare CIRCL Post-Quantum Suite (ML-KEM / ML-DSA)',
    purpose: 'Post-Quantum Key Exchange & Signature Verification',
    verdict: 'safe',
    replacement: 'Maintained (NIST FIPS 203 ML-KEM Active)',
    quantumSecurityLevel: 3,
    shorRisk: false,
    groverRisk: false,
  },
  'github.com/golang-jwt/jwt': {
    primitive: 'Classical Go JWT (RS256, ES256, EdDSA)',
    purpose: 'Go API Authorization & Token Handling',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65) Profiles',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },

  // Rust
  ring: {
    primitive: 'Classical Rust Crypto (RSA, ECDSA, Ed25519, AES-GCM)',
    purpose: 'High-performance Asymmetric & Symmetric Operations',
    verdict: 'broken',
    replacement: 'NIST FIPS 203/204 Post-Quantum Rust Crates',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  rsa_crate: {
    primitive: 'Classical Pure-Rust RSA-2048/4096',
    purpose: 'Rust Asymmetric Key Management',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  'ed25519-dalek': {
    primitive: 'Classical Ed25519 Digital Signatures',
    purpose: 'Fast Rust Signature Generation & Verification',
    verdict: 'broken',
    replacement: 'NIST FIPS 204 (ML-DSA-65)',
    quantumSecurityLevel: 0,
    shorRisk: true,
    groverRisk: false,
  },
  'pqcrypto-traits': {
    primitive: 'NIST Post-Quantum Rust Interface (ML-KEM / ML-DSA)',
    purpose: 'Quantum-Resistant Key Exchange & Signatures',
    verdict: 'safe',
    replacement: 'Maintained (NIST FIPS 203/204 Compliant)',
    quantumSecurityLevel: 3,
    shorRisk: false,
    groverRisk: false,
  },
};

/**
 * Parses Node.js package.json.
 */
function scanPackageJson(content, relPath) {
  const assets = [];
  try {
    const pkg = JSON.parse(content);
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    for (const [depName, depVer] of Object.entries(deps)) {
      const known = KNOWN_PACKAGES[depName.toLowerCase()];
      if (known) {
        assets.push({
          source: 'manifest',
          file: relPath,
          line: 1,
          name: `${depName} (${depVer})`,
          asset: `${relPath} -> ${depName}@${depVer}`,
          primitive: known.primitive,
          purpose: known.purpose,
          verdict: known.verdict,
          replacement: known.replacement,
          quantumSecurityLevel: known.quantumSecurityLevel,
          shorRisk: known.shorRisk,
          groverRisk: known.groverRisk,
        });
      }
    }
  } catch {
    // Ignore invalid JSON
  }
  return assets;
}

/**
 * Parses Python requirements.txt or pyproject.toml.
 */
function scanPythonRequirements(content, relPath) {
  const assets = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([a-zA-Z0-9_\-.]+)/);
    if (!match) continue;

    const pkgName = match[1].toLowerCase().replace(/_/g, '-');
    const known =
      KNOWN_PACKAGES[pkgName] || KNOWN_PACKAGES[match[1].toLowerCase()];
    if (known) {
      assets.push({
        source: 'manifest',
        file: relPath,
        line: i + 1,
        name: line,
        asset: `${relPath}:${i + 1} -> ${line}`,
        primitive: known.primitive,
        purpose: known.purpose,
        verdict: known.verdict,
        replacement: known.replacement,
        quantumSecurityLevel: known.quantumSecurityLevel,
        shorRisk: known.shorRisk,
        groverRisk: known.groverRisk,
      });
    }
  }
  return assets;
}

/**
 * Parses Go go.mod.
 */
function scanGoMod(content, relPath) {
  const assets = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;

    for (const [knownMod, known] of Object.entries(KNOWN_PACKAGES)) {
      if (line.includes(knownMod)) {
        assets.push({
          source: 'manifest',
          file: relPath,
          line: i + 1,
          name: line,
          asset: `${relPath}:${i + 1} -> ${knownMod}`,
          primitive: known.primitive,
          purpose: known.purpose,
          verdict: known.verdict,
          replacement: known.replacement,
          quantumSecurityLevel: known.quantumSecurityLevel,
          shorRisk: known.shorRisk,
          groverRisk: known.groverRisk,
        });
      }
    }
  }
  return assets;
}

/**
 * Parses Rust Cargo.toml.
 */
function scanCargoToml(content, relPath) {
  const assets = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([a-zA-Z0-9_\-]+)\s*=/);
    if (!match) continue;

    let crateName = match[1].toLowerCase();
    if (crateName === 'rsa') crateName = 'rsa_crate';

    const known = KNOWN_PACKAGES[crateName];
    if (known) {
      assets.push({
        source: 'manifest',
        file: relPath,
        line: i + 1,
        name: line,
        asset: `${relPath}:${i + 1} -> ${match[1]}`,
        primitive: known.primitive,
        purpose: known.purpose,
        verdict: known.verdict,
        replacement: known.replacement,
        quantumSecurityLevel: known.quantumSecurityLevel,
        shorRisk: known.shorRisk,
        groverRisk: known.groverRisk,
      });
    }
  }
  return assets;
}

/**
 * Parses Java pom.xml.
 */
function scanPomXml(content, relPath) {
  const assets = [];
  for (const [depArtifact, known] of Object.entries(KNOWN_PACKAGES)) {
    if (content.includes(depArtifact)) {
      assets.push({
        source: 'manifest',
        file: relPath,
        line: 1,
        name: depArtifact,
        asset: `${relPath} -> ${depArtifact}`,
        primitive: known.primitive,
        purpose: known.purpose,
        verdict: known.verdict,
        replacement: known.replacement,
        quantumSecurityLevel: known.quantumSecurityLevel,
        shorRisk: known.shorRisk,
        groverRisk: known.groverRisk,
      });
    }
  }
  return assets;
}

/**
 * Scans certificates and committed keys using Node's X509Certificate parser.
 */
function scanCertificateOrKeyFile(content, relPath) {
  const assets = [];

  // 1. Detect X.509 Certificate
  if (content.includes('-----BEGIN CERTIFICATE-----')) {
    try {
      const cert = new X509Certificate(content);
      const keyType = cert.publicKey.asymmetricKeyType?.toUpperCase() || 'RSA';
      const keyDetails = cert.publicKey.asymmetricKeyDetails;
      const keySize = keyDetails?.modulusLength
        ? `${keyDetails.modulusLength}-bit`
        : keyDetails?.namedCurve
          ? keyDetails.namedCurve
          : 'Standard';

      const isShor =
        !keyType.includes('ML-DSA') &&
        !keyType.includes('DILITHIUM') &&
        !keyType.includes('SLH-DSA');

      assets.push({
        source: 'certificate',
        file: relPath,
        line: 1,
        name: `${relPath} (Committed X.509 Certificate)`,
        asset: `${relPath} (${cert.subject.split('\n')[0] || 'Leaf Cert'})`,
        primitive: `${keyType} (${keySize}) / ${cert.signatureAlgorithm || 'SHA-256'}`,
        purpose: 'Committed Identity & Transport Credential',
        verdict: isShor ? 'broken' : 'safe',
        replacement: isShor
          ? 'NIST FIPS 204 (ML-DSA-65) Dual-Certificate Hierarchy'
          : 'Maintained (Post-Quantum Certificate)',
        quantumSecurityLevel: isShor ? 0 : 3,
        shorRisk: isShor,
        groverRisk: false,
        certInfo: {
          subject: cert.subject,
          issuer: cert.issuer,
          validTo: cert.validTo,
          fingerprint: cert.fingerprint256,
        },
      });
    } catch {
      // Invalid cert formatting
    }
  }

  // 2. Detect committed private keys (CRITICAL security risk)
  const privateKeyMatch = content.match(
    /-----BEGIN\s+((?:RSA|EC|DSA|OPENSSH|ENCRYPTED|PRIVATE))\s+KEY-----/i
  );
  if (privateKeyMatch) {
    const keyType = privateKeyMatch[1].toUpperCase();
    assets.push({
      source: 'private-key',
      file: relPath,
      line: 1,
      name: `${relPath} (Committed ${keyType} Private Key)`,
      asset: `${relPath} (Committed ${keyType} Private Key)`,
      primitive: `Unencrypted ${keyType} Private Key (Direct Exposure)`,
      purpose: 'Private Key Storage (Critical Compromise)',
      verdict: 'broken',
      replacement:
        'Immediately Revoke Key, Purge from Git History & Rotate to FIPS 204 / Vault KMS',
      quantumSecurityLevel: 0,
      shorRisk: true,
      groverRisk: false,
    });
  }

  return assets;
}

/**
 * Scans source code lines for crypto function invocations, weak ciphers, and broken hashes.
 */
function scanSourceCode(content, relPath) {
  const assets = [];
  const lines = content.split(/\r?\n/);

  // Skip huge generated files or minified bundles
  if (lines.length > 5000 || (lines[0] && lines[0].length > 1000)) {
    return assets;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 300) continue; // skip massive lines

    // 1. MD5 Message Digest
    if (
      /(?:createHash\s*\(\s*['"]md5['"]|hashlib\.md5|MessageDigest\.getInstance\s*\(\s*["']MD5["']|md5\.New\(\)|MD5_Init)/i.test(
        line
      )
    ) {
      assets.push({
        source: 'code',
        file: relPath,
        line: i + 1,
        name: `MD5 Invocations`,
        asset: `${relPath}:${i + 1}`,
        primitive: 'MD5 Message Digest (Broken, Collision Vulnerability)',
        purpose: 'Cryptographic Integrity / Hash Check',
        verdict: 'broken',
        replacement: 'SHA-384 / SHA-512 / SHA3-256 (NIST FIPS 180-4 / 202)',
        quantumSecurityLevel: 0,
        shorRisk: false,
        groverRisk: true,
      });
    }

    // 2. SHA-1 Message Digest
    if (
      /(?:createHash\s*\(\s*['"]sha1['"]|hashlib\.sha1|MessageDigest\.getInstance\s*\(\s*["']SHA-?1["']|sha1\.New\(\)|SHA1_Init)/i.test(
        line
      )
    ) {
      assets.push({
        source: 'code',
        file: relPath,
        line: i + 1,
        name: `SHA-1 Invocations`,
        asset: `${relPath}:${i + 1}`,
        primitive:
          'SHA-1 Digest (Shattered / Deprecated Collision Vulnerability)',
        purpose: 'Cryptographic Integrity / Signature Digest',
        verdict: 'broken',
        replacement: 'SHA-384 / SHA-512 (CNSA 2.0 Minimum)',
        quantumSecurityLevel: 0,
        shorRisk: false,
        groverRisk: true,
      });
    }

    // 3. DES / 3DES Insecure Ciphers
    if (
      /(?:['"](?:des|des-ede3|des-cbc|des-ede3-cbc)['"]|Cipher\.getInstance\s*\(\s*["']DES|DES\.new\()/i.test(
        line
      )
    ) {
      assets.push({
        source: 'code',
        file: relPath,
        line: i + 1,
        name: `DES / 3DES Cipher`,
        asset: `${relPath}:${i + 1}`,
        primitive: 'DES / Triple-DES 56/112-bit Cipher (Broken)',
        purpose: 'Data Confidentiality & Symmetric Encryption',
        verdict: 'broken',
        replacement: 'AES-256-GCM (NIST SP 800-38D / CNSA 2.0)',
        quantumSecurityLevel: 0,
        shorRisk: false,
        groverRisk: true,
      });
    }

    // 4. RC4 Stream Cipher
    if (
      /(?:['"](?:rc4|arcfour)['"]|Cipher\.getInstance\s*\(\s*["']RC4|ARC4\.new\()/i.test(
        line
      )
    ) {
      assets.push({
        source: 'code',
        file: relPath,
        line: i + 1,
        name: `RC4 Stream Cipher`,
        asset: `${relPath}:${i + 1}`,
        primitive: 'RC4 Stream Cipher (Broken Biases / Bar Mitzvah Attack)',
        purpose: 'Stream Encryption & Obfuscation',
        verdict: 'broken',
        replacement: 'AES-256-GCM / ChaCha20-Poly1305',
        quantumSecurityLevel: 0,
        shorRisk: false,
        groverRisk: true,
      });
    }

    // 5. AES-128 (Grover Degraded)
    if (
      /(?:['"](?:aes-128-cbc|aes-128-gcm|aes-128-ecb|aes-128-ctr)['"]|Cipher\.getInstance\s*\(\s*["']AES\/CBC\/PKCS5Padding["'])/i.test(
        line
      )
    ) {
      assets.push({
        source: 'code',
        file: relPath,
        line: i + 1,
        name: `AES-128 Cipher`,
        asset: `${relPath}:${i + 1}`,
        primitive:
          'AES-128 (128-bit Symmetric Key - Grover Degraded to 64-bit)',
        purpose: 'Symmetric Block Encryption',
        verdict: 'weak',
        replacement:
          'AES-256-GCM (256-bit Key / 128-bit Post-Quantum Strength)',
        quantumSecurityLevel: 1,
        shorRisk: false,
        groverRisk: true,
      });
    }

    // 6. Classical RSA Key Generation in Source
    if (
      /(?:generateKeyPair(?:Sync)?\s*\(\s*['"]rsa['"]|RSA\.generate\s*\(|rsa\.GenerateKey\s*\()/i.test(
        line
      )
    ) {
      assets.push({
        source: 'code',
        file: relPath,
        line: i + 1,
        name: `RSA Key Generation`,
        asset: `${relPath}:${i + 1}`,
        primitive:
          'RSA Key Pair Generation (Shor Vulnerable Polynomial Factoring)',
        purpose: 'Asymmetric Key Generation & Exchange',
        verdict: 'broken',
        replacement: 'NIST FIPS 203 (ML-KEM-768) / FIPS 204 (ML-DSA-65)',
        quantumSecurityLevel: 0,
        shorRisk: true,
        groverRisk: false,
      });
    }

    // 7. Post-Quantum Algorithms actively used (ML-KEM / ML-DSA / Kyber / Dilithium)
    if (
      /(?:ml_kem|mlkem|kyber768|kyber1024|X25519MLKEM768)/i.test(line) &&
      !line.includes('//')
    ) {
      assets.push({
        source: 'code',
        file: relPath,
        line: i + 1,
        name: `ML-KEM Post-Quantum KEM`,
        asset: `${relPath}:${i + 1}`,
        primitive: 'NIST FIPS 203 (ML-KEM) Lattice-Based KEM',
        purpose: 'Quantum-Resistant Key Establishment',
        verdict: 'safe',
        replacement: 'Maintained (NIST FIPS 203 Compliant)',
        quantumSecurityLevel: 3,
        shorRisk: false,
        groverRisk: false,
      });
    }
  }

  return assets;
}

/**
 * Recursively walks a directory up to max file limit.
 */
function walkRepoDirectory(dir, rootDir, collectedFiles = []) {
  if (collectedFiles.length >= MAX_SCAN_FILES) return collectedFiles;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (collectedFiles.length >= MAX_SCAN_FILES) break;

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
        walkRepoDirectory(fullPath, rootDir, collectedFiles);
      }
    } else if (entry.isFile()) {
      const rel = relative(rootDir, fullPath);
      collectedFiles.push({ fullPath, rel });
    }
  }
  return collectedFiles;
}

/**
 * Assembles a fully valid CycloneDX 1.6 Cryptographic Bill of Materials (CBOM).
 */
function buildRepoCbomDocument(repoFullName, assets) {
  const uuid = randomUUID();
  const timestamp = new Date().toISOString();

  // Root component
  const rootRef = `cbom:repo:${repoFullName}:root`;

  const components = [];
  const dependsOn = [];

  assets.forEach((asset, idx) => {
    const bomRef = `cbom:repo:${repoFullName}:asset:${idx + 1}`;
    dependsOn.push(bomRef);

    const isCert = asset.source === 'certificate';

    /** @type {Record<string, any>} */
    const comp = {
      bomRef,
      type: 'cryptographic-asset',
      name: asset.name || asset.primitive,
      cryptoProperties: {
        assetType: isCert ? 'certificate' : 'algorithm',
        ...(isCert
          ? {
              certificateProperties: {
                subjectName:
                  asset.certInfo?.subject || 'Repository Certificate',
                issuerName: asset.certInfo?.issuer || 'Self-Signed / Internal',
                validNotAfter: asset.certInfo?.validTo || '',
                signatureAlgorithmRef: asset.primitive,
                subjectPublicKeyRef: asset.name,
              },
            }
          : {
              algorithmProperties: {
                primitive: asset.shorRisk ? 'asymmetric' : 'symmetric',
                parameterSetIdentifier: asset.primitive,
                nistQuantumSecurityLevel: asset.quantumSecurityLevel,
              },
            }),
      },
      quantumVulnerability: {
        quantumSecurityLevel: asset.quantumSecurityLevel,
        shorRisk: Boolean(asset.shorRisk),
        groverRisk: Boolean(asset.groverRisk),
        replacementRecommendation: asset.replacement,
      },
    };

    components.push(comp);
  });

  // If no assets detected, create a baseline clean component to keep CycloneDX valid
  if (components.length === 0) {
    const emptyRef = `cbom:repo:${repoFullName}:baseline`;
    dependsOn.push(emptyRef);
    components.push({
      bomRef: emptyRef,
      type: 'cryptographic-asset',
      name: 'Baseline Repository Cryptographic Posture',
      cryptoProperties: {
        assetType: 'algorithm',
        algorithmProperties: {
          primitive: 'symmetric',
          parameterSetIdentifier: 'Clean Manifests',
          nistQuantumSecurityLevel: 5,
        },
      },
      quantumVulnerability: {
        quantumSecurityLevel: 5,
        shorRisk: false,
        groverRisk: false,
        replacementRecommendation:
          'No vulnerable classical cryptographic primitives detected in repository manifests.',
      },
    });
  }

  const dependencies = [
    {
      ref: rootRef,
      dependsOn,
    },
  ];

  const cbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${uuid}`,
    version: 1,
    metadata: {
      timestamp,
      tools: [
        {
          vendor: 'UElement Technologies',
          name: 'Vyu Repository Cryptographic BOM Engine',
          version: '2.4.0',
        },
      ],
      component: {
        name: repoFullName,
        type: 'application',
      },
    },
    components,
    dependencies,
  };

  const validation = validateCycloneDxCbomStructure(cbom);
  return { cbom, validation };
}

/**
 * Executes a full cryptographic analysis of a public GitHub repository.
 *
 * @param {{ owner: string, repo: string, cloneUrl: string, webUrl: string, repoFullName: string }} repoInfo
 * @param {any} [options]
 */
export async function runRepoScan(repoInfo, options = {}) {
  const { owner, repo, cloneUrl, webUrl, repoFullName } = repoInfo;
  const tempDir = mkdtempSync(join(tmpdir(), `vyu-repo-${owner}-${repo}-`));

  let commitSha = 'HEAD';
  let defaultBranch = 'main';

  const token = (
    options.token ||
    options.githubToken ||
    process.env.GITHUB_TOKEN ||
    ''
  ).trim();

  // If token is provided, construct authenticated clone URL
  const authCloneUrl = token
    ? `https://x-access-token:${encodeURIComponent(token)}@github.com/${owner}/${repo}.git`
    : cloneUrl;

  try {
    // 1. Perform shallow snapshot clone
    try {
      await execFileAsync(
        'git',
        ['clone', '--depth', '1', '--single-branch', authCloneUrl, tempDir],
        {
          timeout: CLONE_TIMEOUT_MS,
          maxBuffer: 10 * 1024 * 1024,
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: '0',
          },
        }
      );
    } catch (cloneErr) {
      const rawMsg =
        cloneErr instanceof Error ? cloneErr.message : String(cloneErr);
      // Guarantee token is never leaked in error logs or output
      const safeMsg = rawMsg.replace(/https:\/\/[^@]+@github\.com/g, 'https://github.com');
      console.error(`Git clone failed for ${repoFullName}:`, safeMsg);

      if (
        safeMsg.includes('Repository not found') ||
        safeMsg.includes('Authentication failed') ||
        safeMsg.includes('could not read Username') ||
        safeMsg.includes('terminal prompts disabled')
      ) {
        if (token) {
          throw new Error(
            `Unable to access repository '${repoFullName}'. The provided GitHub token may be invalid, expired, or lack read permissions for this repository.`
          );
        }
        throw new Error(
          `Unable to access repository '${repoFullName}'. The repository is private or does not exist on GitHub. To scan a private repository, please provide a GitHub Personal Access Token.`
        );
      }
      throw new Error(`Git clone failed: ${safeMsg.split('\n')[0]}`);
    }

    // Inspect commit SHA & branch
    try {
      const { stdout: headOut } = await execFileAsync(
        'git',
        ['rev-parse', '--short', 'HEAD'],
        { cwd: tempDir }
      );
      commitSha = headOut.trim();

      const { stdout: branchOut } = await execFileAsync(
        'git',
        ['rev-parse', '--abbrev-ref', 'HEAD'],
        { cwd: tempDir }
      );
      defaultBranch = branchOut.trim();
    } catch {
      // Non-fatal
    }

    // 2. Discover all repository files
    const allFiles = walkRepoDirectory(tempDir, tempDir);
    const languagesDetected = new Set();
    const discoveredAssets = [];

    // Track duplicate assets per file/line to avoid clutter
    const seenAssetKeys = new Set();
    const addAsset = (item) => {
      const key = `${item.file}:${item.primitive}:${item.line || 1}`;
      if (!seenAssetKeys.has(key)) {
        seenAssetKeys.add(key);
        discoveredAssets.push(item);
      }
    };

    for (const fileObj of allFiles) {
      const { fullPath, rel } = fileObj;
      const ext = extname(rel).toLowerCase();
      const baseName = rel.split('/').pop() || '';

      // Skip binary files or files exceeding max size
      try {
        const stats = statSync(fullPath);
        if (stats.size > MAX_FILE_SIZE_BYTES || stats.size === 0) continue;
      } catch {
        continue;
      }

      let content = '';
      try {
        content = readFileSync(fullPath, 'utf8');
      } catch {
        continue; // Binary file or decoding error
      }

      // ── Language tagging ──
      if (['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx'].includes(ext)) {
        languagesDetected.add('JavaScript/TypeScript');
      } else if (ext === '.py') {
        languagesDetected.add('Python');
      } else if (ext === '.go') {
        languagesDetected.add('Go');
      } else if (['.java', '.kt', '.scala'].includes(ext)) {
        languagesDetected.add('Java/JVM');
      } else if (ext === '.rs') {
        languagesDetected.add('Rust');
      }

      // ── 1. Manifests ──
      if (baseName === 'package.json') {
        const items = scanPackageJson(content, rel);
        items.forEach(addAsset);
      } else if (
        baseName === 'requirements.txt' ||
        baseName === 'pyproject.toml' ||
        baseName === 'setup.py' ||
        baseName === 'Pipfile'
      ) {
        const items = scanPythonRequirements(content, rel);
        items.forEach(addAsset);
      } else if (baseName === 'go.mod') {
        const items = scanGoMod(content, rel);
        items.forEach(addAsset);
      } else if (baseName === 'Cargo.toml') {
        const items = scanCargoToml(content, rel);
        items.forEach(addAsset);
      } else if (
        baseName === 'pom.xml' ||
        baseName.startsWith('build.gradle')
      ) {
        const items = scanPomXml(content, rel);
        items.forEach(addAsset);
      }

      // ── 2. Certificates & Keys ──
      if (CERT_KEY_EXTS.has(ext) || content.includes('-----BEGIN')) {
        const items = scanCertificateOrKeyFile(content, rel);
        items.forEach(addAsset);
      }

      // ── 3. Source Code Static Crypto Analysis ──
      if (CODE_EXTS.has(ext)) {
        const items = scanSourceCode(content, rel);
        items.forEach(addAsset);
      }
    }

    // 3. Compile CycloneDX 1.6 CBOM
    const { cbom, validation } = buildRepoCbomDocument(
      repoFullName,
      discoveredAssets
    );

    // 4. Calculate Risk Metrics & Score
    let brokenCount = 0;
    let weakCount = 0;
    let safeCount = 0;

    for (const item of discoveredAssets) {
      if (item.verdict === 'broken') brokenCount++;
      else if (item.verdict === 'weak') weakCount++;
      else if (item.verdict === 'safe') safeCount++;
    }

    let score = 88;
    let band = 'No Cryptographic Exposure Detected';

    if (discoveredAssets.length > 0) {
      score = Math.max(
        5,
        Math.min(100, Math.round(100 - (brokenCount * 12 + weakCount * 5)))
      );
      if (brokenCount > 0 && score > 90) {
        score = 85;
      }

      if (brokenCount >= 3 || score < 40) {
        band = 'Critical Quantum Exposure (Broken / Legacy Crypto)';
      } else if (brokenCount > 0) {
        band = 'High Quantum Exposure (Classical RSA/ECC Primitives)';
      } else if (weakCount > 0) {
        band = 'Moderate Quantum Exposure (Upgrade In Progress)';
      } else if (safeCount > 0) {
        band = 'Quantum-Safe (NIST FIPS 203/204 Compliant)';
        score = Math.max(95, score);
      }
    }

    // Format CBOM items for front-end table
    const cbomItems = discoveredAssets.map((item) => ({
      asset: item.asset,
      primitive: item.primitive,
      purpose: item.purpose,
      verdict: item.verdict,
      replacement: item.replacement,
    }));

    // Generate Tailored Findings
    const findings = [];

    const committedKeys = discoveredAssets.filter(
      (a) => a.source === 'private-key'
    );
    if (committedKeys.length > 0) {
      findings.push({
        sev: 'critical',
        title: 'Committed Unencrypted Private Cryptographic Keys Detected',
        detail: `Static analysis detected committed private key files (${committedKeys.map((k) => k.file).join(', ')}). Storing private keys directly in source control compromises the entire root of trust and exposes private signing material.`,
        fix: 'Immediately revoke the exposed private keys, remove them completely from git history using git-filter-repo, and migrate keys to a dedicated Key Management Service (AWS KMS, GCP Cloud KMS, or HashiCorp Vault).',
        std: 'NIST SP 800-57 Part 1 / OWASP Top 10 A02:2021',
      });
    }

    const shorVulns = discoveredAssets.filter(
      (a) => a.shorRisk && a.source !== 'private-key'
    );
    if (shorVulns.length > 0) {
      findings.push({
        sev: 'high',
        title: 'Shor-Vulnerable Classical Asymmetric Primitives & Dependencies',
        detail: `The codebase utilizes classical asymmetric algorithms (RSA, ECDSA, Ed25519) across dependencies or source calls (${shorVulns
          .slice(0, 3)
          .map((v) => v.file)
          .join(
            ', '
          )}). Shor's quantum algorithm can solve discrete logarithms and factor integers in polynomial time.`,
        fix: 'Plan migration to NIST FIPS 204 (ML-DSA-65) for digital signatures and token verification, and NIST FIPS 203 (ML-KEM-768) for key establishment.',
        std: 'NIST FIPS 203 / NIST FIPS 204 / NSA CNSA 2.0',
      });
    }

    const brokenHashes = discoveredAssets.filter(
      (a) =>
        a.verdict === 'broken' &&
        (a.primitive.includes('MD5') || a.primitive.includes('SHA-1'))
    );
    if (brokenHashes.length > 0) {
      findings.push({
        sev: 'high',
        title: 'Deprecated Collision-Compromised Hash Algorithms (MD5 / SHA-1)',
        detail: `Discovered active invocations of MD5 or SHA-1 message digests (${brokenHashes
          .slice(0, 3)
          .map((h) => h.asset)
          .join(
            ', '
          )}). These algorithms possess practical collision attacks and violate federal security mandates.`,
        fix: 'Refactor cryptographic digests to SHA-384, SHA-512 (NIST FIPS 180-4), or SHA3-256 (FIPS 202).',
        std: 'NIST SP 800-131A Rev. 2 / FIPS 180-4',
      });
    }

    const groverVulns = discoveredAssets.filter(
      (a) =>
        a.groverRisk &&
        !a.primitive.includes('MD5') &&
        !a.primitive.includes('SHA-1')
    );
    if (groverVulns.length > 0) {
      findings.push({
        sev: 'medium',
        title:
          '128-Bit Symmetric Ciphers Vulnerable to Grover Quadratic Speedup',
        detail:
          'Detected symmetric encryption algorithms utilizing 128-bit key lengths. Grover’s algorithm reduces effective security margin to 64 bits, below minimum requirements for quantum resistance.',
        fix: 'Upgrade symmetric encryption algorithms to 256-bit key spaces (AES-256-GCM / ChaCha20-Poly1305).',
        std: 'NIST SP 800-57 / CNSA 2.0',
      });
    }

    if (findings.length === 0) {
      findings.push({
        sev: 'low',
        title: 'Cryptographic Inventory Clean & Continuous Monitoring Advised',
        detail: `No critical cryptographic vulnerabilities or hardcoded keys were identified in the scanned snapshot of ${repoFullName}.`,
        fix: 'Integrate automated CycloneDX 1.6 CBOM verification into CI/CD pull-request checks to prevent future introduction of classical primitives.',
        std: 'CycloneDX 1.6 / OWASP CBOM Guide',
      });
    }

    // Technical Detail Key-Value Pairs
    const detail = [
      ['Target Repository', webUrl],
      ['Repository Slug', repoFullName],
      ['Default Branch', defaultBranch],
      ['Snapshot Commit SHA', commitSha],
      ['Total Files Inspected', String(allFiles.length)],
      [
        'Detected Ecosystems',
        languagesDetected.size > 0
          ? Array.from(languagesDetected).join(', ')
          : 'Generic Codebase',
      ],
      ['Identified Cryptographic Assets', String(discoveredAssets.length)],
      ['Shor Vulnerable Assets', String(brokenCount)],
      ['Grover Degraded Assets', String(weakCount)],
      ['Quantum-Safe / PQC Assets', String(safeCount)],
      [
        'CBOM Compliance',
        validation.valid ? 'CycloneDX 1.6 Validated' : 'CycloneDX 1.6 Custom',
      ],
      ['Static Analysis Mode', 'Shallow Sandbox Clone (Ephemeral, Cleaned Up)'],
    ];

    // Migration Plan Tailored for Code Repositories
    const plan = [
      {
        phase: 'Phase 1: Remediation & Immediate Purge (0–3 Months)',
        title: 'Eliminate Committed Keys & Deprecate Broken Hashes',
        desc: `Purge all hardcoded certificates and secret keys from ${repoFullName}. Replace deprecated MD5 and SHA-1 instances with SHA-384/SHA-512 to achieve immediate cryptographic baseline integrity.`,
      },
      {
        phase: 'Phase 2: Symmetric Hardening & Cipher Agility (3–6 Months)',
        title: 'Enforce AES-256-GCM & Abstract Cryptographic Calls',
        desc: 'Refactor symmetric encryption invocations from 128-bit blocks to AES-256-GCM. Introduce crypto-agile wrapper modules so underlying signature and KEM implementations can be swapped without rewriting business logic.',
      },
      {
        phase:
          'Phase 3: Post-Quantum Authentication & Signatures (6–18 Months)',
        title: 'Adopt NIST FIPS 204 (ML-DSA) for Token & Identity Signing',
        desc: 'Update JWT signing profiles, API tokens, and microservice authentication to NIST FIPS 204 (ML-DSA-65). Deploy hybrid ML-KEM-768 for internal RPC communication.',
      },
      {
        phase: 'Phase 4: Continuous CBOM Pipeline Integration (18+ Months)',
        title: 'Automated CI/CD CycloneDX 1.6 Verification',
        desc: 'Embed Vyu CBOM generation as an automated gate in GitHub Actions / GitLab CI. Block pull requests that introduce legacy classical primitives or Shor-vulnerable dependencies.',
      },
    ];

    return {
      target: webUrl,
      type: 'repo',
      when: new Date(),
      score,
      band,
      retention: 12,
      stats: {
        total: Math.max(cbomItems.length, 1),
        broken: brokenCount,
        weak: weakCount,
        safe: safeCount,
      },
      cbom: cbomItems,
      findings,
      detail,
      plan,
      raw: {
        cbom,
        repoInfo: {
          owner,
          repo,
          commitSha,
          defaultBranch,
          languages: Array.from(languagesDetected),
          filesScanned: allFiles.length,
        },
      },
    };
  } finally {
    // Immediate, guaranteed cleanup of ephemeral clone directory
    try {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.warn(`Failed to remove temp dir ${tempDir}:`, cleanupErr);
    }
  }
}
