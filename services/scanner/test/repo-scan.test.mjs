import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRepoUrl, runRepoScan } from '../lib/repo-scan.mjs';
import { validateCycloneDxCbomStructure } from '../shared/cbom.ts';

describe('Repository Cryptographic Scanner', () => {
  describe('normalizeRepoUrl', () => {
    it('normalizes standard https URL', () => {
      const res = normalizeRepoUrl('https://github.com/auth0/node-jsonwebtoken');
      assert.equal(res.ok, true);
      if (res.ok) {
        assert.equal(res.owner, 'auth0');
        assert.equal(res.repo, 'node-jsonwebtoken');
        assert.equal(res.cloneUrl, 'https://github.com/auth0/node-jsonwebtoken.git');
      }
    });

    it('normalizes https URL with .git suffix', () => {
      const res = normalizeRepoUrl('https://github.com/expressjs/express.git');
      assert.equal(res.ok, true);
      if (res.ok) {
        assert.equal(res.owner, 'expressjs');
        assert.equal(res.repo, 'express');
      }
    });

    it('normalizes domain without scheme', () => {
      const res = normalizeRepoUrl('github.com/cloudflare/circl');
      assert.equal(res.ok, true);
      if (res.ok) {
        assert.equal(res.owner, 'cloudflare');
        assert.equal(res.repo, 'circl');
      }
    });

    it('normalizes shorthand owner/repo', () => {
      const res = normalizeRepoUrl('golang/crypto');
      assert.equal(res.ok, true);
      if (res.ok) {
        assert.equal(res.owner, 'golang');
        assert.equal(res.repo, 'crypto');
      }
    });

    it('rejects invalid targets', () => {
      const res = normalizeRepoUrl('https://malicious-domain.com/evil');
      assert.equal(res.ok, false);
    });
  });

  describe('runRepoScan live analysis', () => {
    it('scans a real public repo and produces valid CycloneDX 1.6 CBOM with authentic files', async () => {
      const norm = normalizeRepoUrl('https://github.com/auth0/node-jsonwebtoken');
      assert.equal(norm.ok, true);
      if (!norm.ok) return;

      const result = await runRepoScan(norm);

      // Verify top-level structure
      assert.equal(result.type, 'repo');
      assert.equal(typeof result.score, 'number');
      assert(result.score >= 5 && result.score <= 100);
      assert(Array.isArray(result.cbom));
      assert(result.cbom.length > 0);

      // Verify real repo files are in CBOM, NOT mock ones
      const hasRealFile = result.cbom.some(item => 
        item.asset.includes('package.json') || item.asset.includes('.js') || item.asset.includes('.ts')
      );
      assert.equal(hasRealFile, true, 'CBOM must contain real files from repository');

      // Verify NO mock items exist (e.g. auth/jwt_issuer.go)
      const hasMockGo = result.cbom.some(item => item.asset === 'auth/jwt_issuer.go');
      assert.equal(hasMockGo, false, 'CBOM must NOT contain hardcoded mock item auth/jwt_issuer.go');

      // Verify CycloneDX 1.6 valid document
      assert(result.raw?.cbom, 'Must contain CycloneDX 1.6 CBOM in raw');
      const validation = validateCycloneDxCbomStructure(result.raw.cbom);
      assert.equal(validation.valid, true, `CBOM validation errors: ${validation.errors.join(', ')}`);

      // Verify details and findings
      assert(Array.isArray(result.findings));
      assert(Array.isArray(result.detail));
      assert(Array.isArray(result.plan));
    });

    it('throws a descriptive access error when target repository does not exist or is private without token', async () => {
      const norm = normalizeRepoUrl('https://github.com/definitely-non-existent-org-99999/private-repo-12345');
      assert.equal(norm.ok, true);
      if (!norm.ok) return;

      await assert.rejects(
        async () => {
          await runRepoScan(norm, { token: '' });
        },
        (err) => {
          assert(err instanceof Error);
          assert(
            err.message.includes('Unable to access repository') ||
            err.message.includes('private') ||
            err.message.includes('does not exist')
          );
          // Verify no token syntax leaks
          assert(!err.message.includes('x-access-token'));
          return true;
        }
      );
    });
  });
});
