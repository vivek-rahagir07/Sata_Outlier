import { describe, it, expect } from 'vitest';
import { parseCSVToExpenses } from '../services/sampleData';

describe('CSV Ingestion & Heuristic Classification Suite', () => {
  it('returns empty array when CSV has fewer than 2 lines', () => {
    expect(parseCSVToExpenses('')).toEqual([]);
    expect(parseCSVToExpenses('Date,Merchant,Amount')).toEqual([]);
  });

  it('correctly parses standard 3-column CSV', () => {
    const csv = `Date,Merchant,Amount
2026-10-01,GitHub Copilot,10.00
2026-10-02,Starbucks Coffee,5.75
2026-10-03,DigitalOcean Droplet,24.00`;

    const items = parseCSVToExpenses(csv);
    expect(items.length).toBe(3);
    expect(items[0].merchant).toBe('GitHub Copilot');
    expect(items[0].amount).toBe(10.00);
    expect(items[1].merchant).toBe('Starbucks Coffee');
    expect(items[1].amount).toBe(5.75);
    expect(items[2].merchant).toBe('DigitalOcean Droplet');
    expect(items[2].amount).toBe(24.00);
  });

  it('correctly handles quoted fields with commas (RFC 4180)', () => {
    const csv = `Date,Merchant,Amount
2026-10-01,"Smith, Jones & Associates LLC",500.00
2026-10-02,"Amazon.com, Inc.",42.50`;

    const items = parseCSVToExpenses(csv);
    expect(items.length).toBe(2);
    expect(items[0].merchant).toBe('Smith, Jones & Associates LLC');
    expect(items[0].amount).toBe(500.00);
    expect(items[1].merchant).toBe('Amazon.com, Inc.');
    expect(items[1].amount).toBe(42.50);
  });

  it('neutralizes formula injection characters within CSV cells', () => {
    const maliciousCsv = `Date,Merchant,Amount
2026-10-01,=cmd|' /C calc'!A0,100.00
2026-10-02,+@SUM(A1:A10),25.00`;

    const items = parseCSVToExpenses(maliciousCsv);
    expect(items.length).toBe(2);
    // Verified that formula prefixes are escaped with single quote
    expect(items[0].merchant.startsWith("'=")).toBe(true);
    expect(items[1].merchant.startsWith("'+")).toBe(true);
  });

  it('strips currency symbols and commas from amounts ($ and €)', () => {
    const csv = `Date,Merchant,Amount
2026-10-01,Office Rent,"$2,450.00"
2026-10-02,Coworking Space,€350.50`;

    const items = parseCSVToExpenses(csv);
    expect(items[0].amount).toBe(2450.00);
    expect(items[1].amount).toBe(350.50);
  });

  it('skips zero-amount or invalid amount rows', () => {
    const csv = `Date,Merchant,Amount
2026-10-01,Zero Item,0.00
2026-10-02,Invalid Item,N/A
2026-10-03,Valid Item,15.00`;

    const items = parseCSVToExpenses(csv);
    expect(items.length).toBe(1);
    expect(items[0].merchant).toBe('Valid Item');
    expect(items[0].amount).toBe(15.00);
  });
});
