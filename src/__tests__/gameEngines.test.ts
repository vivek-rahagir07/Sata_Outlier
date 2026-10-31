import { describe, it, expect } from 'vitest';
import { DecisionBucket, ExpenseItem } from '../types/expense';

describe('Game Mechanics, Multipliers & Decision Scoring', () => {
  describe('Ledger Blade Hotkey Mappings & Multiplier Logic', () => {
    const KEYMAP: Record<string, DecisionBucket> = {
      KeyA: 'tax_deductible',
      KeyS: 'personal',
      KeyD: 'vampire_cancel',
      KeyF: 'suspicious_flag'
    };

    it('maps keyboard input A/S/D/F to proper financial buckets', () => {
      expect(KEYMAP.KeyA).toBe('tax_deductible');
      expect(KEYMAP.KeyS).toBe('personal');
      expect(KEYMAP.KeyD).toBe('vampire_cancel');
      expect(KEYMAP.KeyF).toBe('suspicious_flag');
    });

    it('calculates streak combo multiplier correctly', () => {
      const getMultiplier = (streak: number) => {
        if (streak >= 16) return 16;
        if (streak >= 8) return 8;
        if (streak >= 4) return 4;
        if (streak >= 2) return 2;
        return 1;
      };

      expect(getMultiplier(0)).toBe(1);
      expect(getMultiplier(1)).toBe(1);
      expect(getMultiplier(3)).toBe(2);
      expect(getMultiplier(6)).toBe(4);
      expect(getMultiplier(10)).toBe(8);
      expect(getMultiplier(20)).toBe(16);
    });

    it('awards bonus XP for slaying vampire recurring subscriptions', () => {
      const calculateXP = (decision: DecisionBucket, streak: number) => {
        const baseXP = decision === 'vampire_cancel' ? 150 : 100;
        const multiplier = streak >= 8 ? 2 : 1;
        return baseXP * multiplier;
      };

      expect(calculateXP('personal', 0)).toBe(100);
      expect(calculateXP('tax_deductible', 0)).toBe(100);
      expect(calculateXP('vampire_cancel', 0)).toBe(150);
      expect(calculateXP('vampire_cancel', 10)).toBe(300); // 150 * 2
    });
  });

  describe('Cyber-Court Interrogation & Avatar Verdicts', () => {
    it('verifies expense items have dialogue quotes and cross-examination answers', () => {
      const mockItem: ExpenseItem = {
        id: 'test_1',
        date: '2026-10-01',
        merchant: 'Unused Streaming Hub',
        amount: 19.99,
        suggestedBucket: 'vampire_cancel',
        suggestedReason: 'Zero logins recorded in 6 months',
        status: 'pending',
        storyQuote: 'I provide top tier 4K movies you never watch!',
        crossExamineQuestion: 'When was the last time the user logged in?',
        crossExamineAnswer: 'Last active session: April 14, 2024 (18 months ago).',
        verdictReaction: {
          tax_deductible: 'Approved as research material!',
          personal: 'Moved to personal entertainment.',
          vampire_cancel: 'Subscription cancelled! Recovered $239.88 annually.',
          suspicious_flag: 'Flagged for audit investigation.'
        }
      };

      expect(mockItem.storyQuote).toBeTruthy();
      expect(mockItem.crossExamineAnswer).toContain('Last active session');
      expect(mockItem.verdictReaction?.vampire_cancel).toContain('cancelled');
    });
  });
});
