import type { CryptoAlgorithmInfo } from './types.ts';

export const PQC_ALGORITHMS_DB: Record<string, CryptoAlgorithmInfo> = {
  // Classical Public Key Algorithms (Shor-Vulnerable)
  'RSA-2048': {
    name: 'RSA (2048-bit)',
    category: 'ASYMMETRIC_ENCRYPTION',
    classicalSecurityBits: 112,
    quantumSecurityBits: 0,
    shorVulnerable: true,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'NON_COMPLIANT',
    recommendedReplacement: 'ML-KEM-768 (FIPS 203) / ML-DSA-65 (FIPS 204)',
  },
  'RSA-4096': {
    name: 'RSA (4096-bit)',
    category: 'ASYMMETRIC_ENCRYPTION',
    classicalSecurityBits: 128,
    quantumSecurityBits: 0,
    shorVulnerable: true,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'NON_COMPLIANT',
    recommendedReplacement: 'ML-KEM-1024 (FIPS 203) / ML-DSA-87 (FIPS 204)',
  },
  'ECDSA-P256': {
    name: 'ECDSA (secp256r1)',
    category: 'DIGITAL_SIGNATURE',
    classicalSecurityBits: 128,
    quantumSecurityBits: 0,
    shorVulnerable: true,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'NON_COMPLIANT',
    recommendedReplacement: 'ML-DSA-65 (FIPS 204) / SLH-DSA-128 (FIPS 205)',
  },
  'ECDSA-P384': {
    name: 'ECDSA (secp384r1)',
    category: 'DIGITAL_SIGNATURE',
    classicalSecurityBits: 192,
    quantumSecurityBits: 0,
    shorVulnerable: true,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'NON_COMPLIANT',
    recommendedReplacement: 'ML-DSA-87 (FIPS 204)',
  },
  'X25519': {
    name: 'ECDH (X25519)',
    category: 'KEY_EXCHANGE',
    classicalSecurityBits: 128,
    quantumSecurityBits: 0,
    shorVulnerable: true,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'NON_COMPLIANT',
    recommendedReplacement: 'X25519+ML-KEM-768 Hybrid / ML-KEM-768',
  },
  'SecP256r1': {
    name: 'ECDH (secp256r1)',
    category: 'KEY_EXCHANGE',
    classicalSecurityBits: 128,
    quantumSecurityBits: 0,
    shorVulnerable: true,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'NON_COMPLIANT',
    recommendedReplacement: 'SecP256r1+ML-KEM-768 Hybrid',
  },

  // Post-Quantum Standards (NIST FIPS Finalized)
  'ML-KEM-768': {
    name: 'ML-KEM-768 (Module-Lattice KEM, Crystals-Kyber)',
    category: 'KEY_EXCHANGE',
    classicalSecurityBits: 192,
    quantumSecurityBits: 192,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'FIPS_203_ML_KEM',
    cnsa2Compliance: 'FULLY_COMPLIANT',
    recommendedReplacement: 'NIST Final Standard (FIPS 203)',
  },
  'ML-KEM-1024': {
    name: 'ML-KEM-1024 (Kyber-1024 / Category 5)',
    category: 'KEY_EXCHANGE',
    classicalSecurityBits: 256,
    quantumSecurityBits: 256,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'FIPS_203_ML_KEM',
    cnsa2Compliance: 'FULLY_COMPLIANT',
    recommendedReplacement: 'NIST Final Standard (FIPS 203)',
  },
  'X25519MLKEM768': {
    name: 'Hybrid X25519 + ML-KEM-768 (IETF RFC Draft)',
    category: 'HYBRID_KEM',
    classicalSecurityBits: 128,
    quantumSecurityBits: 192,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'PQC_HYBRID',
    cnsa2Compliance: 'TRANSITIONAL',
    recommendedReplacement: 'Transition state for TLS 1.3 / Protected against HNDL',
  },
  'SecP256r1MLKEM768': {
    name: 'Hybrid secp256r1 + ML-KEM-768 (NIST P-256 + Kyber)',
    category: 'HYBRID_KEM',
    classicalSecurityBits: 128,
    quantumSecurityBits: 192,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'PQC_HYBRID',
    cnsa2Compliance: 'TRANSITIONAL',
    recommendedReplacement: 'Transition state for TLS 1.3 / Protected against HNDL',
  },
  'ML-DSA-65': {
    name: 'ML-DSA-65 (Module-Lattice Digital Signatures, Dilithium3)',
    category: 'DIGITAL_SIGNATURE',
    classicalSecurityBits: 192,
    quantumSecurityBits: 192,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'FIPS_204_ML_DSA',
    cnsa2Compliance: 'FULLY_COMPLIANT',
    recommendedReplacement: 'NIST Final Standard (FIPS 204)',
  },
  'ML-DSA-87': {
    name: 'ML-DSA-87 (Dilithium5 / Category 5)',
    category: 'DIGITAL_SIGNATURE',
    classicalSecurityBits: 256,
    quantumSecurityBits: 256,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'FIPS_204_ML_DSA',
    cnsa2Compliance: 'FULLY_COMPLIANT',
    recommendedReplacement: 'NIST Final Standard (FIPS 204)',
  },
  'SLH-DSA-128': {
    name: 'SLH-DSA-128 (Stateless Hash-Based Signatures, SPHINCS+)',
    category: 'DIGITAL_SIGNATURE',
    classicalSecurityBits: 128,
    quantumSecurityBits: 128,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'FIPS_205_SLH_DSA',
    cnsa2Compliance: 'FULLY_COMPLIANT',
    recommendedReplacement: 'NIST Final Standard (FIPS 205)',
  },
  'XMSS_LMS': {
    name: 'LMS / XMSS (Stateful Hash-Based Signatures, RFC 8554 / RFC 8391)',
    category: 'DIGITAL_SIGNATURE',
    classicalSecurityBits: 256,
    quantumSecurityBits: 128,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'STATEFUL_HASH',
    cnsa2Compliance: 'FULLY_COMPLIANT',
    recommendedReplacement: 'Approved for firmware/bootloader code signing',
  },

  // Symmetric Ciphers (Grover-Impacted)
  'AES-128-GCM': {
    name: 'AES-128-GCM',
    category: 'SYMMETRIC_CIPHER',
    classicalSecurityBits: 128,
    quantumSecurityBits: 64,
    shorVulnerable: false,
    groverVulnerable: true,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'NON_COMPLIANT',
    recommendedReplacement: 'AES-256-GCM (CNSA 2.0 requires 256-bit)',
  },
  'AES-256-GCM': {
    name: 'AES-256-GCM',
    category: 'SYMMETRIC_CIPHER',
    classicalSecurityBits: 256,
    quantumSecurityBits: 128,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'FULLY_COMPLIANT',
    recommendedReplacement: 'Approved Post-Quantum Symmetric Cipher',
  },
  'CHACHA20-POLY1305': {
    name: 'ChaCha20-Poly1305',
    category: 'SYMMETRIC_CIPHER',
    classicalSecurityBits: 256,
    quantumSecurityBits: 128,
    shorVulnerable: false,
    groverVulnerable: false,
    nistStatus: 'CLASSICAL_LEGACY',
    cnsa2Compliance: 'TRANSITIONAL',
    recommendedReplacement: 'Approved 256-bit symmetric stream cipher',
  }
};

export interface TimelineMilestone {
  id: string;
  phase: string;
  deadline: string;
  agency: string;
  region: 'GLOBAL_US' | 'INDIA';
  mandate: string;
  status: 'ACTIVE_MIGRATION' | 'HYBRID_DEPLOYMENT' | 'STANDARDIZATION' | 'FINAL_SUNSET' | 'STRATEGIC_MISSION';
  algorithms: string[];
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export const CNSA_2_TIMELINE: TimelineMilestone[] = [
  {
    id: 'cnsa-code-signing',
    phase: 'Software & Firmware Code Signing',
    deadline: '2025 - 2030',
    agency: 'NSA / CISA (USA)',
    region: 'GLOBAL_US',
    mandate: 'Stateful hash signatures (LMS/XMSS) or ML-DSA-87 required for all newly deployed equipment; full transition by 2030.',
    status: 'ACTIVE_MIGRATION',
    algorithms: ['LMS (RFC 8554)', 'XMSS (RFC 8391)', 'ML-DSA-87 (FIPS 204)'],
    impactLevel: 'CRITICAL'
  },
  {
    id: 'cnsa-web-tls',
    phase: 'Web Browsers & Public TLS / HTTPS',
    deadline: '2025 - 2033',
    agency: 'NSA / IETF / NIST',
    region: 'GLOBAL_US',
    mandate: 'Hybrid KEM (X25519MLKEM768) preferred immediately; ML-KEM-1024 & ML-DSA-87 default by 2030; full classical retirement by 2033.',
    status: 'HYBRID_DEPLOYMENT',
    algorithms: ['X25519MLKEM768', 'ML-KEM-1024 (FIPS 203)', 'ML-DSA-87 (FIPS 204)'],
    impactLevel: 'HIGH'
  },
  {
    id: 'cnsa-vpn-ipsec',
    phase: 'IPsec / MACsec / Virtual Private Networks',
    deadline: '2026 - 2030',
    agency: 'NSA / DoD',
    region: 'GLOBAL_US',
    mandate: 'Pre-shared Post-Quantum Keys (PPK) + ML-KEM mandatory across all classified and unclassified federal networks.',
    status: 'STANDARDIZATION',
    algorithms: ['ML-KEM-768', 'ML-KEM-1024', 'PPK-IKEv2'],
    impactLevel: 'HIGH'
  },
  {
    id: 'cnsa-final-sunset',
    phase: 'Legacy Cryptography Retirement',
    deadline: '2033 Final Cutoff',
    agency: 'NSA (CNSA 2.0)',
    region: 'GLOBAL_US',
    mandate: 'CNSA 2.0 requires exclusive use of PQC and prohibits RSA, Diffie-Hellman, ECDH, and ECDSA across US National Security Systems by 2033.',
    status: 'FINAL_SUNSET',
    algorithms: ['Complete Classical Zero-Trust Prohibition'],
    impactLevel: 'CRITICAL'
  }
];

export const INDIA_PQC_TIMELINE: TimelineMilestone[] = [
  {
    id: 'india-nqm-foundation',
    phase: 'National Quantum Mission (NQM) Launch',
    deadline: '2023 - 2026',
    agency: 'DST (Govt of India)',
    region: 'INDIA',
    mandate: '₹6,003 Cr (~$730M) national flagship mission establishing Quantum Communication hubs, with a stated target of satellite-based and inter-city fibre QKD over ~2,000 km, plus PQC algorithmic foundations.',
    status: 'STRATEGIC_MISSION',
    algorithms: ['Indigenous QKD (C-DoT)', 'Lattice-based PQC', 'Satellite QKD (ISRO / RRI)'],
    impactLevel: 'CRITICAL'
  },
  {
    id: 'india-cert-in-pqc',
    phase: 'CERT-In & C-DAC Critical Infrastructure Guidelines',
    deadline: '2024 - 2027',
    agency: 'CERT-In / MeitY / NCIIPC',
    region: 'INDIA',
    mandate: 'National advisory for Government Ministries and Critical Information Infrastructure (CII) to catalog cryptographic assets and mandate Hybrid ML-KEM on public web services.',
    status: 'ACTIVE_MIGRATION',
    algorithms: ['X25519MLKEM768', 'ML-DSA-65', 'SLH-DSA-128'],
    impactLevel: 'HIGH'
  },
  {
    id: 'india-rbi-bfsi-upi',
    phase: 'RBI & IDRBT Quantum Security for Banking & UPI',
    deadline: '2025 - 2029',
    agency: 'Reserve Bank of India / IDRBT / NPCI',
    region: 'INDIA',
    mandate: 'Mandatory crypto-agility roadmap for Indian Financial Systems: upgrading RTGS, NEFT, Core Banking HSMs, and Unified Payments Interface (UPI) switches to quantum-resistant signatures.',
    status: 'HYBRID_DEPLOYMENT',
    algorithms: ['ML-KEM-768 Hybrid', 'Stateful Hash Signatures', 'AES-256-GCM'],
    impactLevel: 'CRITICAL'
  },
  {
    id: 'india-tec-telecom',
    phase: 'DoT / TEC Telecom 5G/6G PQC Standards',
    deadline: '2026 - 2030',
    agency: 'Telecommunication Engineering Centre (TEC / DoT)',
    region: 'INDIA',
    mandate: 'Technical regulations mandating quantum-safe Key Encapsulation (FIPS 203) for all 5G Core, eSIM over-the-air (OTA) provisioning, and submarine optical transport backbones.',
    status: 'STANDARDIZATION',
    algorithms: ['ML-KEM-1024', 'ML-DSA-87', 'Quantum-Resistant IKEv2'],
    impactLevel: 'HIGH'
  },
  {
    id: 'india-defence-drdo',
    phase: 'DRDO / SAG Strategic Defence Sovereign Encryption',
    deadline: '2028 - 2032',
    agency: 'DRDO / Scientific Analysis Group (SAG)',
    region: 'INDIA',
    mandate: 'Deployment of indigenous post-quantum cipher suites and quantum-entangled secure channels across Tri-Services Defence Cyber Agency (DCyA) command networks.',
    status: 'ACTIVE_MIGRATION',
    algorithms: ['Indigenous Lattice Cryptography', 'SAG Quantum Mesh'],
    impactLevel: 'CRITICAL'
  },
  {
    id: 'india-sovereign-sunset',
    phase: 'Bharat Quantum-Safe Sovereign Cutoff',
    deadline: '2033 Final Cutoff',
    agency: 'National Cyber Security Coordinator (NCSC)',
    region: 'INDIA',
    mandate: 'Strict prohibition of classical RSA/ECC across all Indian critical infrastructure, Aadhaar digital identity PKI, and sovereign citizen services.',
    status: 'FINAL_SUNSET',
    algorithms: ['Complete Sovereign Post-Quantum Cryptographic Enforcement'],
    impactLevel: 'CRITICAL'
  }
];

export const DEMO_PRESET_TARGETS = [
  {
    domain: 'cloudflare.com',
    label: 'Cloudflare (Hybrid PQC Leader)',
    desc: 'Public edge supporting X25519MLKEM768 hybrid key exchange & HTTP/3',
    expectedKEM: 'X25519MLKEM768 (Draft / Standardized)',
    status: 'HYBRID_ACTIVE'
  },
  {
    domain: 'google.com',
    label: 'Google Production (Kyber/ML-KEM Pilot)',
    desc: 'TLS 1.3 endpoints experimenting with X25519Kyber768 / ML-KEM',
    expectedKEM: 'X25519MLKEM768 / secp256r1',
    status: 'HYBRID_ACTIVE'
  },
  {
    domain: 'nic.in',
    label: 'NIC.in (National Informatics Centre - India)',
    desc: 'Indian Government national informatics portal & sovereign gateways',
    expectedKEM: 'ECDSA / RSA-2048 (Classical Leaf / Vulnerable to Shor)',
    status: 'CLASSICAL_EXPOSED'
  },
  {
    domain: 'rbi.org.in',
    label: 'RBI.org.in (Reserve Bank of India)',
    desc: 'Indian central bank regulatory & BFSI policy gateway',
    expectedKEM: 'RSA-2048 / secp256r1 (Transition Candidate)',
    status: 'CLASSICAL_EXPOSED'
  },
  {
    domain: 'cisa.gov',
    label: 'CISA.gov (US Federal Cyber Agency)',
    desc: 'US Cybersecurity & Infrastructure Security Agency web gateway',
    expectedKEM: 'secp256r1 (RSA-2048 Leaf / Vulnerable)',
    status: 'CLASSICAL_EXPOSED'
  },
  {
    domain: 'nist.gov',
    label: 'NIST.gov (Standardization Body)',
    desc: 'National Institute of Standards and Technology portal',
    expectedKEM: 'secp384r1 (ECDSA / Shor-Vulnerable)',
    status: 'CLASSICAL_EXPOSED'
  }
];
