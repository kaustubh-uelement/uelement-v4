// @ts-check

/**
 * Multi-tier In-Memory Sliding Window Rate Limiter
 */

/**
 * @typedef {Object} RateLimitConfig
 * @property {number} windowMs - Window duration in milliseconds
 * @property {number} maxRequests - Max allowed requests within window
 */

/** @type {Record<string, RateLimitConfig>} */
const TIER_CONFIGS = {
  // OTP email dispatch: max 5 requests per 10 minutes per IP
  otp_send: { windowMs: 10 * 60 * 1000, maxRequests: 5 },
  // OTP verification attempts: max 10 attempts per 5 minutes per IP
  otp_verify: { windowMs: 5 * 60 * 1000, maxRequests: 10 },
  // Company verification lookup: max 30 per minute per IP
  company_verify: { windowMs: 60 * 1000, maxRequests: 30 },
  // Cryptographic scanner execution: max 15 scans per 10 minutes per IP
  scan: { windowMs: 10 * 60 * 1000, maxRequests: 15 },
  // Global catch-all: max 120 requests per minute
  global: { windowMs: 60 * 1000, maxRequests: 120 },
};

/** @type {Map<string, { timestamps: number[] }>} */
const rateStore = new Map();

/**
 * Extract real client IP taking into account Cloudflare and GCP Cloud Run load balancers.
 * @param {import('node:http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (cf && typeof cf === 'string') return cf.trim();

  const xff = req.headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const first = xff.split(',')[0];
    if (first) return first.trim();
  }

  const xReal = req.headers['x-real-ip'];
  if (xReal && typeof xReal === 'string') return xReal.trim();

  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Check whether request is allowed for given IP and tier.
 * @param {string} ip
 * @param {keyof typeof TIER_CONFIGS} [tier='global']
 * @returns {{ allowed: boolean, remaining: number, resetAfterSec: number }}
 */
export function checkRateLimit(ip, tier = 'global') {
  const cfg = TIER_CONFIGS[tier] || TIER_CONFIGS.global;
  const key = `${tier}:${ip}`;
  const now = Date.now();
  const windowStart = now - cfg.windowMs;

  let entry = rateStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateStore.set(key, entry);
  }

  // Filter out timestamps outside current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= cfg.maxRequests) {
    const oldest = entry.timestamps[0] || now;
    const resetAfterMs = Math.max(1000, oldest + cfg.windowMs - now);
    return {
      allowed: false,
      remaining: 0,
      resetAfterSec: Math.ceil(resetAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: cfg.maxRequests - entry.timestamps.length,
    resetAfterSec: Math.ceil(cfg.windowMs / 1000),
  };
}

// Sweep stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateStore.entries()) {
    const tierName = key.split(':')[0];
    const cfg = TIER_CONFIGS[tierName] || TIER_CONFIGS.global;
    entry.timestamps = entry.timestamps.filter((ts) => ts > now - cfg.windowMs);
    if (entry.timestamps.length === 0) {
      rateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
