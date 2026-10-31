import { describe, it, expect } from 'vitest';
import { isSafePath } from '../../server/index';

/**
 * Sanitizes input text to prevent CSV Injection / Formula Injection attacks
 * (e.g., =cmd|' /C calc'!A0 or @SUM(...) or + or -)
 */
export function sanitizeCsvField(field: string): string {
  if (!field) return '';
  // Strip <script>...</script> tags and their contents
  let clean = field.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Strip any remaining HTML tags
  clean = clean.replace(/<[^>]*>?/gm, '').trim();
  // Neutralize CSV formula injections
  if (/^[=+\-@\t\r]/.test(clean)) {
    return `'${clean}`;
  }
  return clean;
}

/**
 * Safe numeric parsing that rejects NaN, Infinity, negative amounts, or HTML strings
 */
export function safeParseAmount(val: any): number {
  if (typeof val === 'number') {
    return isFinite(val) && val > 0 ? Number(val.toFixed(2)) : 0;
  }
  if (typeof val === 'string') {
    // Check if string contains HTML tags or scripts
    if (/<[^>]*>?/gm.test(val)) {
      return 0;
    }
    // Clean currency symbols and commas
    const cleaned = val.replace(/[$€£¥,]/g, '').trim();
    // Validate that it looks like a clean positive number
    if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
      return 0;
    }
    const num = parseFloat(cleaned);
    return isFinite(num) && num > 0 ? Number(num.toFixed(2)) : 0;
  }
  return 0;
}

/**
 * Prevents Object Prototype Pollution
 */
export function safeMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  const cleanTarget = { ...target };
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Block prototype pollution key
    }
    (cleanTarget as any)[key] = source[key];
  }
  return cleanTarget;
}

/**
 * Validates alphanumeric identifiers (defense against SQLi/NoSQLi/Command injection)
 */
export function isValidIdentifier(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

describe('OWASP Security Validations & Input Sanitization', () => {
  describe('Anti-CSV / Formula Injection (DDE Defense)', () => {
    it('neutralizes equal sign formula commands (=cmd)', () => {
      expect(sanitizeCsvField('=cmd|\' /C calc\'!A0')).toBe('\'=cmd|\' /C calc\'!A0');
    });

    it('neutralizes plus formula commands (+12345)', () => {
      expect(sanitizeCsvField('+12345')).toBe('\'+12345');
    });

    it('neutralizes minus formula commands (-500)', () => {
      expect(sanitizeCsvField('-500')).toBe('\'-500');
    });

    it('neutralizes at sign formula commands (@SUM)', () => {
      expect(sanitizeCsvField('@SUM(A1:A10)')).toBe('\'@SUM(A1:A10)');
    });

    it('preserves clean legitimate business descriptions', () => {
      expect(sanitizeCsvField('AWS Cloud Hosting')).toBe('AWS Cloud Hosting');
      expect(sanitizeCsvField('Figma Subscription')).toBe('Figma Subscription');
    });
  });

  describe('XSS & HTML Tag Sanitization', () => {
    it('strips script tags from input strings', () => {
      expect(sanitizeCsvField('<script>alert("xss")</script>Test')).toBe('Test');
    });

    it('strips img tag onerror payloads', () => {
      expect(sanitizeCsvField('<img src="x" onerror="evil()"/>Merchant')).toBe('Merchant');
    });

    it('strips iframe and embedded tags', () => {
      expect(sanitizeCsvField('<iframe src="//evil.com"></iframe>Safe')).toBe('Safe');
    });
  });

  describe('Safe Numeric Bounded Parsing', () => {
    it('safely parses standard dollar amounts', () => {
      expect(safeParseAmount('$149.99')).toBe(149.99);
      expect(safeParseAmount('1,250.50')).toBe(1250.50);
    });

    it('safely parses international currency formats', () => {
      expect(safeParseAmount('€85.00')).toBe(85.0);
      expect(safeParseAmount('£42.25')).toBe(42.25);
      expect(safeParseAmount('¥10000')).toBe(10000.0);
    });

    it('rejects Infinity and NaN exploit strings', () => {
      expect(safeParseAmount('Infinity')).toBe(0);
      expect(safeParseAmount('-Infinity')).toBe(0);
      expect(safeParseAmount('NaN')).toBe(0);
    });

    it('rejects negative numbers and zero values', () => {
      expect(safeParseAmount('-50')).toBe(0);
      expect(safeParseAmount('0')).toBe(0);
    });

    it('rejects script injections in numeric fields', () => {
      expect(safeParseAmount('<script>alert(1)</script>')).toBe(0);
    });
  });

  describe('Prototype Pollution Defense', () => {
    it('blocks __proto__ property injection during object merge', () => {
      const maliciousPayload = JSON.parse('{"__proto__": {"isAdmin": true}, "name": "user"}');
      const baseObj: Record<string, any> = {};
      const result = safeMerge(baseObj, maliciousPayload);

      expect((result as any).isAdmin).toBeUndefined();
      expect(({} as any).isAdmin).toBeUndefined();
      expect(result.name).toBe('user');
    });

    it('blocks constructor and prototype manipulation', () => {
      const payload = { constructor: { prototype: { poll: true } }, safeProp: 123 };
      const baseObj: Record<string, any> = {};
      const result = safeMerge(baseObj, payload);
      expect((result as any).poll).toBeUndefined();
      expect(result.safeProp).toBe(123);
    });
  });

  describe('Alphanumeric Identifier Whitelisting', () => {
    it('accepts valid alphanumeric IDs with dashes and underscores', () => {
      expect(isValidIdentifier('exp_102')).toBe(true);
      expect(isValidIdentifier('item-uuid-4920')).toBe(true);
      expect(isValidIdentifier('c_39ab01')).toBe(true);
    });

    it('rejects SQL injection and shell metacharacter payloads in IDs', () => {
      expect(isValidIdentifier("1; DROP TABLE users;--")).toBe(false);
      expect(isValidIdentifier("exp_1' OR '1'='1")).toBe(false);
      expect(isValidIdentifier("$(whoami)")).toBe(false);
      expect(isValidIdentifier("../../../etc/passwd")).toBe(false);
    });
  });

  describe('Path Traversal & Sandbox Containment', () => {
    it('permits paths within current working directory', () => {
      expect(isSafePath(process.cwd())).toBe(true);
    });

    it('rejects path traversal attempts escaping the root', () => {
      expect(isSafePath('../../../../../etc/passwd')).toBe(false);
      expect(isSafePath('/etc/shadow')).toBe(false);
      expect(isSafePath('/var/log')).toBe(false);
    });

    it('rejects null byte injection in paths', () => {
      expect(isSafePath(`${process.cwd()}\0/etc/passwd`)).toBe(false);
    });
  });
});
