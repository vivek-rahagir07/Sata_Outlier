export type DecisionBucket = 'tax_deductible' | 'personal' | 'vampire_cancel' | 'suspicious_flag';

export interface ExpenseItem {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  originalCategory?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'annual';
  suggestedBucket: DecisionBucket;
  suggestedReason: string;
  
  // Audited state
  status: 'pending' | 'audited';
  decision?: DecisionBucket;
  decisionTimestamp?: number;
  annualSavings?: number; // Calculated if vampire_cancel
  taxSavingsEstimate?: number; // Calculated if tax_deductible
  
  // Interactive Story details
  avatar?: string;
  avatarMood?: 'pleading' | 'smug' | 'sneaky' | 'robotic' | 'guilty';
  storyQuote?: string;
  crossExamineQuestion?: string;
  crossExamineAnswer?: string;
  verdictReaction?: {
    tax_deductible: string;
    personal: string;
    vampire_cancel: string;
    suspicious_flag: string;
  };
}

export interface AuditStats {
  totalCount: number;
  auditedCount: number;
  totalAmount: number;
  auditedAmount: number;
  taxDeductibleAmount: number;
  estimatedTaxSavings: number;
  vampireSubsCount: number;
  annualRecurringSavings: number;
  suspiciousCount: number;
  suspiciousAmount: number;
  currentStreak: number;
  highestStreak: number;
  scoreXP: number;
  timeSpentSeconds: number;
  rank?: 'S+' | 'S' | 'A' | 'B' | 'C';
}

export type GameMode =
  | 'cybercity'
  | 'scatter_queen'
  | 'home'
  | 'ledger_blade'
  | 'cyber_court'
  | 'bullet_sweeper'
  | 'dashboard'
  | 'import_data'
  | 'history'
  | 'how_to_play';
export type DifficultyLevel = 'chill' | 'arcade' | 'blitz';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}
