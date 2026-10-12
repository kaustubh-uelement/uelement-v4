import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEmailOtp, verifyEmailOtp } from '../lib/otp-store.mjs';

describe('OTP Store & Verification Engine', () => {
  it('generates a 6-digit OTP and verifies it successfully', () => {
    const email = 'executive@enterprise.com';
    const gen = createEmailOtp(email);
    assert.equal(gen.ok, true);
    if (!gen.ok) return;

    assert.equal(typeof gen.code, 'string');
    assert.equal(gen.code.length, 6);
    assert(/^\d{6}$/.test(gen.code));

    // Verify correct code
    const check = verifyEmailOtp(email, gen.code);
    assert.equal(check.ok, true);
    assert.equal(check.verified, true);

    // Verify it is single-use (cannot be verified twice)
    const secondCheck = verifyEmailOtp(email, gen.code);
    assert.equal(secondCheck.ok, false);
  });

  it('rejects incorrect verification codes and tracks attempts', () => {
    const email = 'ciso@defense.org';
    const gen = createEmailOtp(email);
    assert.equal(gen.ok, true);
    if (!gen.ok) return;

    const badCheck1 = verifyEmailOtp(email, '000000');
    assert.equal(badCheck1.ok, false);
    assert.equal(badCheck1.attemptsRemaining, 4);

    const badCheck2 = verifyEmailOtp(email, '111111');
    assert.equal(badCheck2.ok, false);
    assert.equal(badCheck2.attemptsRemaining, 3);

    // Correct code still works within attempt budget
    const goodCheck = verifyEmailOtp(email, gen.code);
    assert.equal(goodCheck.ok, true);
    assert.equal(goodCheck.verified, true);
  });

  it('enforces 30-second cooldown on re-generation', () => {
    const email = 'cto@fintech.io';
    const first = createEmailOtp(email);
    assert.equal(first.ok, true);

    // Immediate second attempt should be rate limited
    const second = createEmailOtp(email);
    assert.equal(second.ok, false);
    assert(second.error.includes('wait'));
    assert(second.retryAfterSeconds > 0);
  });
});
