import { describe, it, expect } from 'vitest';
import { SAMPLE_DATASETS } from '../services/sampleData';

describe('Sample Data Integrity & Audit Quality', () => {
  it('contains valid predefined datasets', () => {
    expect(SAMPLE_DATASETS.freelancer).toBeDefined();
    expect(SAMPLE_DATASETS.startup).toBeDefined();
  });

  it('validates freelancer dataset schema and non-empty items', () => {
    const items = SAMPLE_DATASETS.freelancer.items;
    expect(items.length).toBeGreaterThan(0);

    const validBuckets = ['tax_deductible', 'personal', 'vampire_cancel', 'suspicious_flag'];

    items.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.merchant).toBeTruthy();
      expect(typeof item.amount).toBe('number');
      expect(item.amount).toBeGreaterThan(0);
      expect(validBuckets).toContain(item.suggestedBucket);
      expect(item.status).toBe('pending');
    });
  });

  it('detects vampire recurring subscriptions with valid frequencies', () => {
    const items = SAMPLE_DATASETS.freelancer.items;
    const vampireItems = items.filter(i => i.suggestedBucket === 'vampire_cancel');
    expect(vampireItems.length).toBeGreaterThan(0);

    vampireItems.forEach(item => {
      expect(item.isRecurring).toBe(true);
      expect(['monthly', 'annual']).toContain(item.recurringFrequency);
    });
  });
});
