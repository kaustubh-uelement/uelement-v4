// @ts-check
/**
 * lib/pqc-cbom.mjs - CycloneDX 1.6 CBOM for a PQC scan result.
 */
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validateCycloneDxCbomStructure } from '../shared/cbom.ts';
import { evaluateGroverReduction } from '../shared/quantumRisk.ts';

/** @typedef {import('../shared/types.ts').CycloneDxCbom} CycloneDxCbom */
/** @typedef {import('../shared/types.ts').CbomComponent} CbomComponent */
/** @typedef {import('../shared/types.ts').DiscoveredEndpoint} DiscoveredEndpoint */
/**
 * @typedef {Omit<DiscoveredEndpoint, 'tls'> & {
 *   tls: Omit<DiscoveredEndpoint['tls'], 'hstsEnabled'> & { hstsEnabled: boolean | null }
 * }} PqcEndpointOut
 */

let toolVersionCache = null;
function toolVersion() {
  if (toolVersionCache === null) {
    try {
      const pkg = JSON.parse(
        readFileSync(new URL('../package.json', import.meta.url), 'utf8')
      );
      toolVersionCache =
        typeof pkg.version === 'string' ? pkg.version : '0.1.0';
    } catch {
      toolVersionCache = '0.1.0';
    }
  }
  return toolVersionCache || '0.1.0';
}

export function symmetricStrength(cipherSuite) {
  if (!cipherSuite) return null;
  const norm = cipherSuite
    .toUpperCase()
    .replace(/-/g, '_')
    .replace(/AES(\d{3})/g, 'AES_$1');
  if (!/AES_(128|192|256)|CHACHA20|(^|_)DES(_|$)|3DES|DES_CBC3/.test(norm))
    return null;
  const g = evaluateGroverReduction(norm);
  return {
    classicalBits: g.classicalBits,
    quantumBits: g.quantumSecurityBits,
    groverDegraded: !g.isQuantumSafeSymmetric,
  };
}

function nistLevelForSymmetric(classicalBits) {
  if (classicalBits >= 256) return 5;
  if (classicalBits >= 192) return 3;
  if (classicalBits >= 128) return 1;
  return 0;
}

function mlKemLevel(group) {
  const g = group.toUpperCase();
  if (/1024/.test(g)) return 5;
  if (/768/.test(g)) return 3;
  if (/512/.test(g)) return 1;
  return null;
}

function classicalKexPrimitive(group) {
  return /^(ffdhe|dh)/i.test(group) ? 'dh' : 'ecdh';
}

export function generateCycloneDxCbom(domain, endpoints, deps = {}) {
  const uuid = deps.uuid || randomUUID;
  const now = deps.now || Date.now;
  /** @type {Map<string, CbomComponent>} */
  const componentMap = new Map();
  /** @type {Map<string, Set<string>>} */
  const depMap = new Map();

  endpoints.forEach((ep, idx) => {
    const sub = ep.subdomain || ep.domain;
    const rootRef = `cbom:${sub}:${ep.port}:endpoint`;
    const measured = ep.quantumRisk !== 'UNKNOWN';
    const cipher = ep.tls?.cipherSuite || '';
    const sym = symmetricStrength(cipher);

    if (!componentMap.has(rootRef)) {
      componentMap.set(rootRef, {
        bomRef: rootRef,
        type: 'cryptographic-asset',
        name: `${sub} TLS Service`,
        version: ep.tls?.protocol || 'not measured',
        cryptoProperties: {
          assetType: 'protocol',
          protocolProperties: {
            type: 'TLS',
            version: ep.tls?.protocol || 'not measured',
            cipherSuites: cipher ? [cipher] : [],
          },
        },
        quantumVulnerability: measured
          ? {
              quantumSecurityLevel: ep.tls?.isHybridKem ? 3 : 0,
              shorRisk: ep.tls?.isHybridKem
                ? false
                : ep.tls?.keyExchangeGroupMeasured
                  ? true
                  : (ep.tls?.authenticationStillClassical ??
                    ep.quantumRisk !== 'QUANTUM_SAFE'),
              groverRisk: sym ? sym.groverDegraded : false,
              replacementRecommendation: ep.tls?.isHybridKem
                ? 'Hybrid KEM active (FIPS 203 transition)'
                : ep.tls?.keyExchangeGroupMeasured
                  ? 'Migrate to TLS 1.3 with X25519MLKEM768'
                  : 'Key-exchange group not measured; migrate to TLS 1.3 with X25519MLKEM768 if not already offered',
            }
          : {
              quantumSecurityLevel: 0,
              shorRisk: false,
              groverRisk: false,
              replacementRecommendation:
                'Endpoint could not be probed (unreachable / timed out / handshake failed) - not assessed.',
            },
      });
    }
    const deps_ = depMap.get(rootRef) || new Set();
    depMap.set(rootRef, deps_);
    if (!measured) return;

    // Certificate
    const certId =
      ep.certificate?.fingerprintSha256?.replace(/:/g, '').slice(0, 16) ||
      ep.certificate?.serialNumber ||
      `ep${idx}`;
    const certRef = `cbom:${domain}:cert:${certId}`;
    if (!componentMap.has(certRef)) {
      const certShorRisk =
        ep.tls?.authenticationStillClassical ??
        ep.quantumRisk !== 'QUANTUM_SAFE';
      componentMap.set(certRef, {
        bomRef: certRef,
        type: 'cryptographic-asset',
        name: `X.509 Certificate (${ep.certificate?.commonName || sub})`,
        cryptoProperties: {
          assetType: 'certificate',
          certificateProperties: {
            subjectName: ep.certificate?.subject || 'not measured',
            issuerName: ep.certificate?.issuer || 'not measured',
            validNotAfter: ep.certificate?.validTo || '',
            signatureAlgorithmRef:
              ep.certificate?.signatureAlgorithm || 'not measured',
            subjectPublicKeyRef: `${ep.certificate.publicKeyAlgorithm}-${ep.certificate?.keySizeBits || 'unknown'}`,
          },
        },
        quantumVulnerability: {
          quantumSecurityLevel: certShorRisk ? 0 : 5,
          shorRisk: certShorRisk,
          groverRisk: false,
          replacementRecommendation: certShorRisk
            ? 'ML-DSA-65 (NIST FIPS 204) / SLH-DSA (FIPS 205)'
            : 'Already post-quantum (NIST FIPS 204 / 205)',
        },
      });
    }
    deps_.add(certRef);

    // Key exchange: only when observed.
    const group = ep.tls?.keyExchangeGroup || '';
    if (ep.tls?.keyExchangeGroupMeasured && group) {
      const kemRef = `cbom:${domain}:kem:${group.toLowerCase()}`;
      if (!componentMap.has(kemRef)) {
        const hybrid = Boolean(ep.tls?.isHybridKem);
        const level = hybrid ? mlKemLevel(group) : 0;
        componentMap.set(kemRef, {
          bomRef: kemRef,
          type: 'cryptographic-asset',
          name: `Key Exchange (${group})`,
          cryptoProperties: {
            assetType: 'algorithm',
            algorithmProperties: {
              primitive: hybrid ? 'hybrid-kem' : classicalKexPrimitive(group),
              curve: group,
              parameterSetIdentifier: group,
              ...(level !== null ? { nistQuantumSecurityLevel: level } : {}),
            },
          },
          quantumVulnerability: {
            quantumSecurityLevel: level ?? 0,
            shorRisk: !hybrid,
            groverRisk: false,
            replacementRecommendation: hybrid
              ? 'Hybrid ML-KEM key exchange in use (FIPS 203)'
              : 'Enable X25519MLKEM768 (hybrid ML-KEM, FIPS 203)',
          },
        });
      }
      deps_.add(kemRef);
    }

    // Symmetric cipher
    if (cipher) {
      const cipherRef = `cbom:${domain}:cipher:${cipher}`;
      if (!componentMap.has(cipherRef)) {
        componentMap.set(cipherRef, {
          bomRef: cipherRef,
          type: 'cryptographic-asset',
          name: `Cipher Suite (${cipher})`,
          cryptoProperties: {
            assetType: 'algorithm',
            algorithmProperties: {
              primitive: 'symmetric',
              parameterSetIdentifier: cipher,
              ...(sym
                ? {
                    keyLength: sym.classicalBits,
                    nistQuantumSecurityLevel: nistLevelForSymmetric(
                      sym.classicalBits
                    ),
                  }
                : {}),
            },
          },
          quantumVulnerability: {
            quantumSecurityLevel: sym
              ? nistLevelForSymmetric(sym.classicalBits)
              : 0,
            shorRisk: false,
            groverRisk: sym ? sym.groverDegraded : false,
            replacementRecommendation: !sym
              ? 'Symmetric cipher not recognised from the suite name - not assessed.'
              : sym.groverDegraded
                ? `${sym.classicalBits}-bit key gives ${sym.quantumBits} bits under Grover; prefer AES-256`
                : `${sym.classicalBits}-bit symmetric key (${sym.quantumBits} bits under Grover)`,
          },
        });
      }
      deps_.add(cipherRef);
    }
  });

  /** @type {CycloneDxCbom} */
  const cbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: `urn:uuid:${uuid()}`,
    version: 1,
    metadata: {
      timestamp: new Date(now()).toISOString(),
      tools: [
        { vendor: 'Vyuh', name: 'vyuh-pqc-scan', version: toolVersion() },
      ],
      component: { name: domain, type: 'application' },
    },
    components: [...componentMap.values()],
    dependencies: [...depMap.entries()].map(([ref, set]) => ({
      ref,
      dependsOn: [...set],
    })),
  };
  return { cbom, validation: validateCycloneDxCbomStructure(cbom) };
}
