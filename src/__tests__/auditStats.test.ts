import { describe, it, expect } from 'vitest';
import { ExpenseItem, AuditStats } from '../types/expense';

function calculateAuditStats(expenses: ExpenseItem[], streak = 0, scoreXP = 0): AuditStats {
  let auditedCount = 0;
  let auditedAmount = 0;
  let totalAmount = 0;
  let taxDeductibleAmount = 0;
  let vampireSubsCount = 0;
  let annualRecurringSavings = 0;
  let suspiciousCount = 0;
  let suspiciousAmount = 0;

  expenses.forEach((item) => {
    totalAmount += item.amount;
    if (item.status === 'audited') {
      auditedCount++;
      auditedAmount += item.amount;

      if (item.decision === 'tax_deductible') {
        taxDeductibleAmount += item.amount;
      } else if (item.decision === 'vampire_cancel') {
        vampireSubsCount++;
        const annualFactor = item.recurringFrequency === 'annual' ? 1 : 12;
        annualRecurringSavings += item.amount * annualFactor;
      } else if (item.decision === 'suspicious_flag') {
        suspiciousCount++;
        suspiciousAmount += item.amount;
      }
    }
  });

  const completionRate = expenses.length > 0 ? (auditedCount / expenses.length) : 0;
  let rank: 'S+' | 'S' | 'A' | 'B' | 'C' = 'C';
  if (completionRate >= 1.0 && streak >= 5) rank = 'S+';
  else if (completionRate >= 0.8) rank = 'S';
  else if (completionRate >= 0.5) rank = 'A';
  else if (completionRate >= 0.25) rank = 'B';

  return {
    totalCount: expenses.length,
    auditedCount,
    totalAmount,
    auditedAmount,
    taxDeductibleAmount,
    estimatedTaxSavings: taxDeductibleAmount * 0.30, // 30% average deduction rate
    vampireSubsCount,
    annualRecurringSavings,
    suspiciousCount,
    suspiciousAmount,
    currentStreak: streak,
    highestStreak: Math.max(streak, 10),
    scoreXP,
    timeSpentSeconds: 120,
    rank
  };
}

describe('Audit Calculations & Financial Metrics', () => {
  it('correctly calculates total amount and audited counts', () => {
    const mockExpenses: ExpenseItem[] = [
      {
        id: '1',
        date: '2026-10-01',
        merchant: 'Figma',
        amount: 15,
        status: 'audited',
        decision: 'tax_deductible',
        suggestedBucket: 'tax_deductible',
        suggestedReason: 'Design tool for client deliverables'
      },
      {
        id: '2',
        date: '2026-10-02',
        merchant: 'Unused Gym',
        amount: 50,
        status: 'audited',
        decision: 'vampire_cancel',
        recurringFrequency: 'monthly',
        suggestedBucket: 'vampire_cancel',
        suggestedReason: 'Recurring charge with zero check-ins'
      },
      {
        id: '3',
        date: '2026-10-03',
        merchant: 'Suspicious Offshore Server',
        amount: 120,
        status: 'audited',
        decision: 'suspicious_flag',
        suggestedBucket: 'suspicious_flag',
        suggestedReason: 'Unrecognized IP location'
      },
      {
        id: '4',
        date: '2026-10-04',
        merchant: 'Coffee Shop',
        amount: 6,
        status: 'pending',
        suggestedBucket: 'personal',
        suggestedReason: 'Personal beverage'
      }
    ];

    const stats = calculateAuditStats(mockExpenses, 6, 450);

    expect(stats.totalCount).toBe(4);
    expect(stats.auditedCount).toBe(3);
    expect(stats.totalAmount).toBe(191);
    expect(stats.auditedAmount).toBe(185);
    expect(stats.taxDeductibleAmount).toBe(15);
    expect(stats.estimatedTaxSavings).toBe(4.5);
    expect(stats.vampireSubsCount).toBe(1);
    expect(stats.annualRecurringSavings).toBe(600); // 50 * 12
    expect(stats.suspiciousCount).toBe(1);
    expect(stats.suspiciousAmount).toBe(120);
    expect(stats.rank).toBe('A'); // 75% audited
  });

  it('awards S+ rank for 100% completion and high streak', () => {
    const completedExpenses: ExpenseItem[] = [
      {
        id: '1',
        date: '2026-10-01',
        merchant: 'AWS Cloud',
        amount: 100,
        status: 'audited',
        decision: 'tax_deductible',
        suggestedBucket: 'tax_deductible',
        suggestedReason: 'Infrastructure'
      }
    ];

    const stats = calculateAuditStats(completedExpenses, 7, 1200);
    expect(stats.rank).toBe('S+');
  });
});
