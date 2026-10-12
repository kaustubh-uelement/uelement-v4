// @ts-check
import { createHash, randomInt } from "node:crypto";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes validity
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * @typedef {Object} OtpRecord
 * @property {string} hash
 * @property {number} expiresAt
 * @property {number} lastSentAt
 * @property {number} attempts
 */

/** @type {Map<string, OtpRecord>} */
const otpStore = new Map();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashOtp(email, code) {
  return createHash("sha256").update(`${email}:${code}:vyuh-salt-v1`).digest("hex");
}

/**
 * Generate a 6-digit OTP, store its hash with TTL, and return raw code.
 * @param {string} rawEmail
 * @returns {{ ok: true, code: string, expiresAt: number } | { ok: false, error: string, retryAfterSeconds?: number }}
 */
export function createEmailOtp(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please provide a valid corporate email address." };
  }

  const now = Date.now();
  const existing = otpStore.get(email);

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return {
      ok: false,
      error: `Please wait ${waitSec} seconds before requesting another verification code.`,
      retryAfterSeconds: waitSec,
    };
  }

  // Cryptographically secure 6-digit code (100000 - 999999)
  const code = String(randomInt(100000, 1000000));
  const expiresAt = now + OTP_TTL_MS;

  otpStore.set(email, {
    hash: hashOtp(email, code),
    expiresAt,
    lastSentAt: now,
    attempts: 0,
  });

  return { ok: true, code, expiresAt };
}

/**
 * Verify submitted OTP against stored hash.
 * @param {string} rawEmail
 * @param {string} rawCode
 * @returns {{ ok: true, verified: true } | { ok: false, error: string, attemptsRemaining?: number }}
 */
export function verifyEmailOtp(rawEmail, rawCode) {
  const email = normalizeEmail(rawEmail);
  const code = String(rawCode || "").trim();

  if (!email || !code) {
    return { ok: false, error: "Email and verification code are required." };
  }

  const record = otpStore.get(email);
  const now = Date.now();

  if (!record) {
    return { ok: false, error: "No verification code requested or session expired. Please request a new code." };
  }

  if (now > record.expiresAt) {
    otpStore.delete(email);
    return { ok: false, error: "Verification code has expired. Please request a new code." };
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(email);
    return { ok: false, error: "Too many failed attempts. For security, please request a new verification code." };
  }

  const incomingHash = hashOtp(email, code);
  if (incomingHash === record.hash) {
    // Single-use: delete immediately upon successful verification
    otpStore.delete(email);
    return { ok: true, verified: true };
  }

  record.attempts++;
  const remaining = Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts);
  if (remaining === 0) {
    otpStore.delete(email);
    return { ok: false, error: "Too many incorrect attempts. Please request a new verification code." };
  }

  return {
    ok: false,
    error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    attemptsRemaining: remaining,
  };
}

// Stale entry garbage collection every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [email, rec] of otpStore.entries()) {
    if (now > rec.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

if (cleanupTimer.unref) {
  cleanupTimer.unref();
}
