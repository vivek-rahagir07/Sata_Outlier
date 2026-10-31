import { describe, it, expect } from 'vitest';
import { app, isSafePath } from '../../server/index';

describe('Server Security Controls & API Architecture', () => {
  it('instantiates the Express server app with defined middleware stack', () => {
    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });

  describe('Path Traversal & Safe Sandbox Enforcement', () => {
    it('verifies safe execution within project root', () => {
      expect(isSafePath(process.cwd())).toBe(true);
      expect(isSafePath(`${process.cwd()}/chaos_sandbox`)).toBe(true);
    });

    it('blocks directory escape via relative traversal', () => {
      expect(isSafePath('../../../etc')).toBe(false);
      expect(isSafePath('../../..')).toBe(false);
      expect(isSafePath('/etc/passwd')).toBe(false);
      expect(isSafePath('/bin/sh')).toBe(false);
    });

    it('blocks empty or non-string inputs safely', () => {
      expect(isSafePath('')).toBe(false);
      expect(isSafePath(null as any)).toBe(false);
      expect(isSafePath(undefined as any)).toBe(false);
    });
  });
});

