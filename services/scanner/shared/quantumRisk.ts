/**
 * shared/quantumRisk.ts
 *
 * Canonical shared utilities for quantum-risk assessment, Shor vulnerability
 * evaluation, Grover symmetric-strength reduction, and HNDL scoring.
 */

import type { QuantumRiskLevel } from './types.ts';

// ---------------------------------------------------------------------------
// Hybrid KEM detection — canonical (case-insensitive, hyphen/space tolerant)
// ---------------------------------------------------------------------------

export function detectHybridKem(keyExchangeGroup?: string, cipherSuite?: string) {
  const raw = `${keyExchangeGroup ?? ''} ${cipherSuite ?? ''}`;
  const upper = raw.toUpperCase();
  const normalized = upper.replace(/[\s_-]/g, '');

  const isHybrid = Boolean(
    upper.includes('MLKEM') ||
    normalized.includes('MLKEM') ||
    upper.includes('ML-KEM') ||
    upper.includes('KYBER') ||
    normalized.includes('KYBER') ||
    keyExchangeGroup === 'X25519MLKEM768' ||
    keyExchangeGroup === 'SecP256r1MLKEM768' ||
    upper.includes('X25519MLKEM768') ||
    upper.includes('SECP256R1MLKEM768') ||
    upper.includes('X25519KYBER768')
  );

  return {
    isHybridKem: isHybrid,
    nistStatus: isHybrid ? 'FIPS_203_ML_KEM' : 'CLASSICAL_PRE_PQC',
    quantumRisk: isHybrid ? 'HYBRID_TRANSITIONAL' : 'CRITICAL',
    nistSecurityCategory: isHybrid ? 3 : 0,
  } as const;
}

export const isHybridKemGroup = detectHybridKem;

// ---------------------------------------------------------------------------
// HNDL score — canonical dynamic formula
// ---------------------------------------------------------------------------

export function calculateHndlScore(params: {
  isHybridKem: boolean;
  publicKeyAlg: string;
  keySizeBits: number;
  daysRemaining: number;
  isHighValueTarget?: boolean;
}): number {
  if (params.isHybridKem) {
    let s = 8;
    if (params.daysRemaining > 365) s += 5;
    else if (params.daysRemaining > 90) s += 3;
    if (params.isHighValueTarget) s += 6;
    if (params.publicKeyAlg.includes('RSA') && params.keySizeBits <= 2048) s += 3;
    return Math.min(25, s);
  }

  let baseScore = 80;
  if (params.publicKeyAlg.includes('RSA') && params.keySizeBits <= 2048) {
    baseScore += 12;
  }
  if (params.daysRemaining > 90) {
    baseScore += 4;
  }
  if (params.isHighValueTarget) {
    baseScore += 4;
  }

  return Math.min(100, baseScore);
}

// ---------------------------------------------------------------------------
// Mosca's inequality — X (data shelf-life) + Y (migration time) > Z (years to CRQC)
// ---------------------------------------------------------------------------

export type MoscaUrgency = 'CRITICAL' | 'ELEVATED' | 'MODERATE';

export function evaluateMoscaTheorem(params: {
  dataShelfLifeYears: number;
  migrationTimelineYears: number;
  yearsUntilCrqc: number;
}): { compromisedAlready: boolean; formula: string; urgencyLevel: MoscaUrgency; exposureYears: number } {
  const totalExposureYears = params.dataShelfLifeYears + params.migrationTimelineYears;
  const exposureYears = totalExposureYears - params.yearsUntilCrqc;
  const compromisedAlready = totalExposureYears > params.yearsUntilCrqc;

  let urgencyLevel: MoscaUrgency = 'MODERATE';
  if (exposureYears >= 5) urgencyLevel = 'CRITICAL';
  else if (compromisedAlready) urgencyLevel = 'ELEVATED';

  return {
    compromisedAlready,
    formula: `X (${params.dataShelfLifeYears}y) + Y (${params.migrationTimelineYears}y) = ${totalExposureYears}y vs Z (${params.yearsUntilCrqc}y)`,
    urgencyLevel,
    exposureYears,
  };
}

// ---------------------------------------------------------------------------
// Shor vulnerability
// ---------------------------------------------------------------------------

export function evaluateShorVulnerability(publicKeyAlg: string, keySizeBits: number) {
  const isPqc =
    publicKeyAlg.includes('ML-DSA') ||
    publicKeyAlg.includes('Dilithium') ||
    publicKeyAlg.includes('SLH-DSA') ||
    publicKeyAlg.includes('SPHINCS') ||
    publicKeyAlg.includes('Falcon') ||
    publicKeyAlg.includes('FN-DSA');

  const isShorBroken =
    !isPqc && (
      publicKeyAlg.includes('RSA') ||
      publicKeyAlg.includes('ECDSA') ||
      publicKeyAlg.includes('ECDH') ||
      publicKeyAlg.includes('DSA') ||
      publicKeyAlg.includes('secp256r1') ||
      publicKeyAlg.includes('secp384r1') ||
      publicKeyAlg.includes('Ed25519') ||
      publicKeyAlg.includes('Ed448')
    );

  const quantumSecurityBits = isShorBroken ? 0 : isPqc ? 128 : 0;
  const risk: QuantumRiskLevel | string = isShorBroken
    ? keySizeBits <= 2048
      ? 'CRITICAL'
      : 'HIGH'
    : 'QUANTUM_SAFE';

  return {
    shorVulnerable: isShorBroken,
    quantumSecurityBits,
    risk,
  };
}

// ---------------------------------------------------------------------------
// Grover reduction
// ---------------------------------------------------------------------------

export function evaluateGroverReduction(cipherName: string) {
  const name = String(cipherName || '').toUpperCase().replace(/-/g, '_').replace(/AES(\d{3})/g, 'AES_$1');
  let classicalBits = 128;
  if (
    name.includes('AES_256') ||
    name.includes('CHACHA20') ||
    name.includes('256_GCM') ||
    name.includes('256_CCM')
  ) {
    classicalBits = 256;
  } else if (name.includes('AES_192') || name.includes('192_GCM')) {
    classicalBits = 192;
  } else if (
    name.includes('AES_128') ||
    name.includes('128_GCM') ||
    name.includes('128_CCM')
  ) {
    classicalBits = 128;
  } else if (name.includes('3DES') || name.includes('DES_EDE3') || name.includes('DES_CBC3')) {
    classicalBits = 112;
  } else if (name.includes('DES')) {
    classicalBits = 56;
  }

  const quantumSecurityBits = classicalBits / 2;
  const isQuantumSafeSymmetric = quantumSecurityBits >= 128;

  return {
    cipherName,
    classicalBits,
    quantumSecurityBits,
    isQuantumSafeSymmetric,
    status: isQuantumSafeSymmetric ? 'QUANTUM_RESISTANT' : 'DEGRADED_GROVER_WARNING',
  };
}

// ---------------------------------------------------------------------------
// calculateQuantumRisk — canonical wrapper
// ---------------------------------------------------------------------------

export function isClassicalSignatureAlg(signatureAlgorithm?: string, publicKeyAlg?: string): boolean {
  const s = `${signatureAlgorithm ?? ''} ${publicKeyAlg ?? ''}`.toUpperCase();
  const isPqcSig =
    s.includes('ML-DSA') || s.includes('MLDSA') || s.includes('DILITHIUM') ||
    s.includes('SLH-DSA') || s.includes('SLHDSA') || s.includes('SPHINCS') ||
    s.includes('FALCON') || s.includes('FN-DSA');
  return !isPqcSig;
}

export function calculateQuantumRisk(endpoint: {
  publicKeyAlg: string;
  keySizeBits: number;
  cipherSuite: string;
  isHybridKem: boolean;
  signatureAlgorithm?: string;
  connected?: boolean;
  keyExchangeObserved?: boolean;
  daysRemaining?: number;
  isHighValueTarget?: boolean;
}): {
  risk: QuantumRiskLevel;
  score: number;
  hndlScore: number;
  priority: 'P1_IMMEDIATE' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  replacement: string;
  authenticationStillClassical?: boolean;
} {
  const kexUnobserved = endpoint.keyExchangeObserved === false && !endpoint.isHybridKem;
  const kexNote = kexUnobserved
    ? ' [Key-exchange group not observed this run (OpenSSL 3.5+ unavailable) — HNDL assumes classical KEX.]'
    : '';

  if (endpoint.connected === false) {
    return {
      risk: 'UNKNOWN',
      score: 0,
      hndlScore: 0,
      priority: 'P4_LOW',
      replacement: 'Endpoint could not be probed (unreachable / timed out / handshake failed) — not assessed.',
      authenticationStillClassical: false,
    };
  }

  if (endpoint.publicKeyAlg === '') {
    return {
      risk: 'UNKNOWN',
      score: 0,
      hndlScore: 0,
      priority: 'P4_LOW',
      replacement: 'Public-key algorithm could not be read from the certificate — not assessed.',
      authenticationStillClassical: undefined,
    };
  }

  // PQC leaf
  if (
    endpoint.publicKeyAlg.includes('ML-DSA') ||
    endpoint.publicKeyAlg.includes('Dilithium') ||
    endpoint.publicKeyAlg.includes('SLH-DSA') ||
    endpoint.publicKeyAlg.includes('Falcon')
  ) {
    return {
      risk: 'QUANTUM_SAFE',
      score: 5,
      hndlScore: 0,
      priority: 'P4_LOW',
      replacement: 'Already Post-Quantum Resistant (NIST FIPS 204 / 205)',
      authenticationStillClassical: false,
    };
  }

  // Hybrid KEM
  if (endpoint.isHybridKem) {
    const authClassical = isClassicalSignatureAlg(endpoint.signatureAlgorithm, endpoint.publicKeyAlg);
    const hndlScore =
      endpoint.daysRemaining !== undefined
        ? calculateHndlScore({
            isHybridKem: true,
            publicKeyAlg: endpoint.publicKeyAlg,
            keySizeBits: endpoint.keySizeBits,
            daysRemaining: endpoint.daysRemaining,
            isHighValueTarget: endpoint.isHighValueTarget,
          })
        : 12;
    return {
      risk: 'HYBRID_TRANSITIONAL',
      score: authClassical ? 34 : 20,
      hndlScore,
      priority: 'P3_MEDIUM',
      replacement: authClassical
        ? 'KEX protected. Authentication still classical — migrate leaf certificate signature to ML-DSA-65 (FIPS 204) before 2030.'
        : 'Authentication: maintain ML-DSA leaf signature; track FIPS 203/204 parameter updates.',
      authenticationStillClassical: authClassical,
    };
  }

  // Classical RSA
  if (endpoint.publicKeyAlg.includes('RSA')) {
    const isShort = endpoint.keySizeBits > 0 && endpoint.keySizeBits <= 2048;
    const hndlScore =
      endpoint.daysRemaining !== undefined
        ? calculateHndlScore({
            isHybridKem: false,
            publicKeyAlg: endpoint.publicKeyAlg,
            keySizeBits: endpoint.keySizeBits,
            daysRemaining: endpoint.daysRemaining,
            isHighValueTarget: endpoint.isHighValueTarget,
          })
        : isShort
          ? 92
          : 85;
    return {
      risk: isShort ? 'CRITICAL' : 'HIGH',
      score: isShort ? 94 : 85,
      hndlScore,
      priority: 'P1_IMMEDIATE',
      replacement: 'Deploy X25519MLKEM768 Hybrid KEM (FIPS 203) & Migrate CA to ML-DSA (FIPS 204)' + kexNote,
    };
  }

  // Classical ECC
  const hndlScore =
    endpoint.daysRemaining !== undefined
      ? calculateHndlScore({
          isHybridKem: false,
          publicKeyAlg: endpoint.publicKeyAlg,
          keySizeBits: endpoint.keySizeBits,
          daysRemaining: endpoint.daysRemaining,
          isHighValueTarget: endpoint.isHighValueTarget,
        })
      : 88;
  return {
    risk: 'HIGH',
    score: 82,
    hndlScore,
    priority: 'P1_IMMEDIATE',
    replacement: 'Deploy X25519MLKEM768 Hybrid KEM & upgrade leaf certificates to ML-DSA-65' + kexNote,
  };
}
