// shared/quantumCost.ts
// Quantum and classical attack-cost estimates for public-key primitives.

export function log2(n: number): number {
  return Math.log(n) / Math.LN2;
}

export function rsaLogicalQubits(n: number): number {
  return 3 * n + 0.002 * n * log2(n);
}

export function rsaToffoliGates(n: number): number {
  return 0.3 * Math.pow(n, 3) + 0.0005 * Math.pow(n, 3) * log2(n);
}

export function eccLogicalQubits(n: number): number {
  return 9 * n + 2 * Math.ceil(log2(n)) + 10;
}

export function eccToffoliGates(n: number): number {
  return 448 * Math.pow(n, 3) * log2(n) + 4090 * Math.pow(n, 3);
}

export function formatBig(n: number): string {
  if (!isFinite(n)) return '—';
  return n >= 1e6 ? n.toExponential(2) : Math.round(n).toLocaleString();
}

export type ShorTargetKind = 'RSA' | 'ECC' | 'PQC' | 'UNKNOWN';

function classifyShorTarget(algorithm: string): ShorTargetKind {
  const a = (algorithm || '').toUpperCase();
  if (a.includes('ML-') || a.includes('MLKEM') || a.includes('DILITHIUM') || a.includes('SLH') || a.includes('SPHINCS') || a.includes('FALCON') || a.includes('FN-DSA')) return 'PQC';
  if (a.includes('RSA')) return 'RSA';
  if (a.includes('EC') || a.includes('ED25519') || a.includes('ED448') || a.includes('SECP') || a.includes('P-2') || a.includes('P-3') || a.includes('P-5') || a.includes('PRIME256')) return 'ECC';
  return 'UNKNOWN';
}

export interface ShorCostEstimate {
  kind: ShorTargetKind;
  logicalQubits: number | null;
  toffoliGates: number | null;
  summary: string;
  source: string;
}

export function estimateShorCost(algorithm: string, keyBits: number): ShorCostEstimate {
  const kind = classifyShorTarget(algorithm);
  if (kind === 'PQC') {
    return {
      kind,
      logicalQubits: null,
      toffoliGates: null,
      summary: 'Not applicable — lattice/hash scheme, no Shor period-finding structure to attack.',
      source: '',
    };
  }
  if (kind === 'RSA' && keyBits > 0) {
    return {
      kind,
      logicalQubits: rsaLogicalQubits(keyBits),
      toffoliGates: rsaToffoliGates(keyBits),
      summary: `~${formatBig(rsaLogicalQubits(keyBits))} logical qubits, ~${formatBig(rsaToffoliGates(keyBits))} Toffoli gates`,
      source: 'Gidney & Ekerå, Quantum 5:433 (2021) — logical qubits, pre-error-correction',
    };
  }
  const eccBits = kind === 'ECC' ? (keyBits > 0 ? keyBits : 256) : 0;
  if (kind === 'ECC' && eccBits > 0) {
    return {
      kind,
      logicalQubits: eccLogicalQubits(eccBits),
      toffoliGates: eccToffoliGates(eccBits),
      summary: `~${formatBig(eccLogicalQubits(eccBits))} logical qubits, ~${formatBig(eccToffoliGates(eccBits))} Toffoli gates`,
      source: 'Roetteler, Naehrig, Svore & Lauter, ASIACRYPT 2017 — logical qubits, pre-error-correction',
    };
  }
  return { kind: 'UNKNOWN', logicalQubits: null, toffoliGates: null, summary: 'Insufficient data to estimate.', source: '' };
}

const GNFS_C = Math.cbrt(64 / 9);

export function gnfsCostLog2(modulusBits: number): number {
  if (modulusBits <= 0) return 0;
  const lnN = modulusBits * Math.LN2;
  const lnlnN = Math.log(lnN);
  const exponentNat = GNFS_C * Math.cbrt(lnN) * Math.pow(lnlnN, 2 / 3);
  return exponentNat / Math.LN2;
}

export const NIST_CLASSICAL_SECURITY_BITS: Record<number, number> = {
  1024: 80,
  2048: 112,
  3072: 128,
  7680: 192,
  15360: 256,
};

export function nistClassicalSecurityBits(modulusBits: number): number | null {
  if (NIST_CLASSICAL_SECURITY_BITS[modulusBits]) return NIST_CLASSICAL_SECURITY_BITS[modulusBits];
  const anchors = Object.keys(NIST_CLASSICAL_SECURITY_BITS).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < anchors.length - 1; i++) {
    if (modulusBits > anchors[i] && modulusBits < anchors[i + 1]) {
      const lo = anchors[i], hi = anchors[i + 1];
      const f = (modulusBits - lo) / (hi - lo);
      return Math.round(NIST_CLASSICAL_SECURITY_BITS[lo] + f * (NIST_CLASSICAL_SECURITY_BITS[hi] - NIST_CLASSICAL_SECURITY_BITS[lo]));
    }
  }
  return null;
}

export interface ClassicalVsQuantumComplexity {
  classicalCost: string;
  quantumCost: string;
  polynomialAdvantage: boolean;
}

export function evaluateShorAsymptoticComplexity(keySizeBits: number): ClassicalVsQuantumComplexity {
  const gnfsLog2 = Math.round(gnfsCostLog2(keySizeBits));
  const nistBits = nistClassicalSecurityBits(keySizeBits);
  const nistNote = nistBits ? ` (NIST rating: ~${nistBits}-bit classical security)` : '';
  return {
    classicalCost: `GNFS L_N[1/3, (64/9)^(1/3)] ≈ 2^${gnfsLog2} operations, sub-exponential${nistNote}`,
    quantumCost: `Shor ≈ O((log N)^3) ≈ ${Math.pow(keySizeBits, 3).toExponential(2)} gate ops, polynomial`,
    polynomialAdvantage: gnfsLog2 > 3 * log2(keySizeBits),
  };
}
