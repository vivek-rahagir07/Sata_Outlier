import { describe, it, expect } from 'vitest';

/**
 * Sanitizes input text to prevent CSV Injection / Formula Injection attacks
 * (e.g., =cmd|' /C calc'!A0 or @SUM(...) or + or -)
 */
export function sanitizeCsvField(field: string): string {
  if (!field) return '';
  const trimmed = field.trim();
  // Strip dangerous HTML/script tags
  const noHtml = trimmed.replace(/<[^>]*>?/gm, '');
  // If first character is an active formula trigger (=, +, -, @, tab, cr), escape with single quote
  if (/^[=+\-@\t\r]/.test(noHtml)) {
    return `'${noHtml}`;
  }
  return noHtml;
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

describe('Security Validations & Input Sanitization', () => {
  it('neutralizes CSV formula injection characters', () => {
    expect(sanitizeCsvField('=cmd|\' /C calc\'!A0')).toBe('\'=cmd|\' /C calc\'!A0');
    expect(sanitizeCsvField('+12345')).toBe('\'+12345');
    expect(sanitizeCsvField('-500')).toBe('\'-500');
    expect(sanitizeCsvField('@SUM(A1:A10)')).toBe('\'@SUM(A1:A10)');
    expect(sanitizeCsvField('Normal Merchant')).toBe('Normal Merchant');
    expect(sanitizeCsvField('<script>bad()</script>')).toBe('bad()');
  });

  it('safely parses monetary amounts without NaN or Infinity exploits', () => {
    expect(safeParseAmount('$149.99')).toBe(149.99);
    expect(safeParseAmount('1,250.50')).toBe(1250.50);
    expect(safeParseAmount('Infinity')).toBe(0);
    expect(safeParseAmount('-50')).toBe(0);
    expect(safeParseAmount('<script>alert(1)</script>')).toBe(0);
  });
});
