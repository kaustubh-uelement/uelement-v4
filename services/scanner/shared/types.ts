/**
 * Shared scan contract for the Vyuh backend.
 *
 * Measurement rules:
 *  - `null` means "not measured". It never collapses to `false` or `0`.
 *  - `*Measured: false` means the related field was not observed on the wire.
 *  - `'UNKNOWN'` risk is excluded from summary rates and averages.
 */
export type QuantumRiskLevel =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'HYBRID_TRANSITIONAL'
  | 'QUANTUM_SAFE'
  | 'UNKNOWN';

export type AlgorithmCategory =
  | 'ASYMMETRIC_ENCRYPTION'
  | 'KEY_EXCHANGE'
  | 'DIGITAL_SIGNATURE'
  | 'SYMMETRIC_CIPHER'
  | 'HASH_FUNCTION'
  | 'HYBRID_KEM';

export interface CryptoAlgorithmInfo {
  name: string;
  category: AlgorithmCategory;
  classicalSecurityBits: number;
  quantumSecurityBits: number;
  shorVulnerable: boolean;
  groverVulnerable: boolean;
  nistStatus:
    | 'DEPRECATED'
    | 'CLASSICAL_LEGACY'
    | 'PQC_HYBRID'
    | 'FIPS_203_ML_KEM'
    | 'FIPS_204_ML_DSA'
    | 'FIPS_205_SLH_DSA'
    | 'FIPS_206_FN_DSA'
    | 'STATEFUL_HASH';
  cnsa2Compliance: 'NON_COMPLIANT' | 'TRANSITIONAL' | 'FULLY_COMPLIANT';
  recommendedReplacement: string;
}

export interface DnsRecord {
  type: string;
  value: string;
  ttl?: number;
  dnssecProtected?: boolean;
}

export interface CertificateInfo {
  subject: string;
  commonName: string;
  sanList: string[];
  issuer: string;
  issuerOrg?: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  serialNumber: string;
  publicKeyAlgorithm: string;
  keySizeBits: number;
  signatureAlgorithm: string;
  fingerprintSha256: string;
  isExpired: boolean;
  quantumRisk: QuantumRiskLevel;
  pqcReplacement: string;
}

export interface TlsHandshakeInfo {
  protocol: string; // e.g. "TLSv1.3", "TLSv1.2"
  cipherSuite: string;
  keyExchangeGroup?: string; // e.g. "X25519MLKEM768", "secp256r1"
  keyExchangeGroupMeasured?: boolean; // false => openssl 3.5+ unavailable, group not observed on-wire
  isHybridKem: boolean;
  isPqcReady: boolean;
  authenticationStillClassical?: boolean; // hybrid KEX but leaf signature is classical
  verified?: boolean; // chain validated against the system trust store
  alpnProtocols: string[];
  hstsEnabled: boolean | null; // null => HSTS check failed / not measured
  ocspStapling: boolean | null;
  sessionResumption: boolean | null;
}

export interface DiscoveredEndpoint {
  id: string;
  domain: string;
  subdomain: string;
  port: number;
  ipAddress: string;
  asn?: string;
  org?: string;
  country?: string;
  tls: TlsHandshakeInfo;
  certificate: CertificateInfo;
  dnsRecords: DnsRecord[];
  discoveredVia:
    | 'CERTIFICATE_TRANSPARENCY'
    | 'DNS_ENUMERATION'
    | 'DIRECT_PROBE'
    | 'SUBDOMAIN_PERMUTATION';
  quantumVulnerabilityScore: number;
  hndlExposureScore: number;
  quantumRisk: QuantumRiskLevel;
  lastScanned: string;
  migrationPriority: 'P1_IMMEDIATE' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
}

export interface CbomComponent {
  bomRef: string;
  type: 'cryptographic-asset';
  name: string;
  version?: string;
  cryptoProperties: {
    assetType: 'algorithm' | 'certificate' | 'protocol';
    algorithmProperties?: {
      primitive: string;
      curve?: string;
      keyLength?: number;
      parameterSetIdentifier?: string;
      executionEnvironment?: string;
      implementationPlatform?: string;
      nistQuantumSecurityLevel?: number;
    };
    certificateProperties?: {
      subjectName: string;
      issuerName: string;
      validNotAfter: string;
      signatureAlgorithmRef: string;
      subjectPublicKeyRef: string;
    };
    protocolProperties?: {
      type: string;
      version: string;
      cipherSuites: string[];
    };
  };
  quantumVulnerability: {
    quantumSecurityLevel: number;
    shorRisk: boolean;
    groverRisk: boolean;
    replacementRecommendation: string;
  };
}

export interface CycloneDxCbom {
  bomFormat: 'CycloneDX';
  specVersion: '1.6';
  serialNumber: string;
  version: number;
  metadata: {
    timestamp: string;
    tools: Array<{
      vendor: string;
      name: string;
      version: string;
    }>;
    component: {
      name: string;
      type: string;
    };
  };
  components: CbomComponent[];
  dependencies: Array<{
    ref: string;
    dependsOn: string[];
  }>;
}

export interface PqcScanResult {
  scanId: string;
  targetDomain: string;
  timestamp: string;
  durationMs: number;
  endpointsCount: number;
  summary: {
    totalAssets: number;
    quantumVulnerableCount: number;
    hybridPqcCount: number;
    pqcReadyCount: number;
    unreachableCount?: number;
    overallQuantumRisk: QuantumRiskLevel;
    overallHndlScore: number | null;
    avgQuantumVulnerabilityScore: number | null;
    cnsa2TimelineCompliance: number | null;
    nistComplianceRate: number | null;
  };
  endpoints: DiscoveredEndpoint[];
  dnssecActive: boolean | null;
  ctLogsCount: number | null;
  cbom: CycloneDxCbom;
  logs: string[];
}

export interface ScanOptions {
  enableCtLogs: boolean;
  enableDnssec: boolean;
  enableHybridProbe: boolean;
  deepTlsInspection: boolean;
  subdomainLimit: number;
  timeoutMs: number;
}
