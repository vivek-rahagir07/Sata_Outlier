import React, { useState } from 'react';
import { ExpenseItem, DecisionBucket } from '../types/expense';
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  Clock,
  Filter,
  Search,
  Sparkles,
  Zap,
  Building2,
  User,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface TransactionHistoryScreenProps {
  expenses: ExpenseItem[];
  onBack: () => void;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({
  expenses,
  onBack,
}) => {
  const [filter, setFilter] = useState<'all' | 'business' | 'personal' | 'subscriptions' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample or real audited transactions
  const auditedItems = expenses.filter((e) => {
    if (filter === 'business') return e.decision === 'tax_deductible';
    if (filter === 'personal') return e.decision === 'personal';
    if (filter === 'subscriptions') return e.decision === 'vampire_cancel' || e.isRecurring;
    if (filter === 'flagged') return e.decision === 'suspicious_flag';
    return true;
  });

  const getBadgeStyle = (decision?: DecisionBucket) => {
    switch (decision) {
      case 'tax_deductible':
        return {
          label: 'Categorized as Business',
          color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
          xp: '+100 pts',
        };
      case 'vampire_cancel':
        return {
          label: 'Marked for Review / Cancel',
          color: 'text-pink-400 bg-pink-950/40 border-pink-500/40',
          xp: '+150 pts',
        };
      case 'suspicious_flag':
        return {
          label: 'Flagged as Suspicious',
          color: 'text-amber-400 bg-amber-950/40 border-amber-500/40',
          xp: '+120 pts',
        };
      case 'personal':
      default:
        return {
          label: 'Categorized as Personal',
          color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40',
          xp: '+80 pts',
        };
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070a14] text-white p-6 sm:p-10 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Top Header (Matching Screen 9 in image) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-purple-500/50 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-arcade text-2xl font-black text-white tracking-wider">
              TRANSACTION HISTORY
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-arcade text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>{expenses.filter(e => e.status === 'audited').length} RECONCILED</span>
          </div>
        </div>

        {/* Filter Pills (Screen 9: All, Business, Personal, Subscriptions, Flagged) */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all' as const, label: 'All' },
            { id: 'business' as const, label: 'Business' },
            { id: 'personal' as const, label: 'Personal' },
            { id: 'subscriptions' as const, label: 'Subscriptions' },
            { id: 'flagged' as const, label: 'Flagged' },
          ].map((pill) => {
            const isSelected = filter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setFilter(pill.id)}
                className={`rounded-xl px-4 py-2 font-arcade text-xs font-bold transition ${
                  isSelected
                    ? 'border border-purple-500 bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Live List of Audited Transactions (Matching Screen 9) */}
        <div className="space-y-3">
          {auditedItems.slice(0, 15).map((item, idx) => {
            const badge = getBadgeStyle(item.decision || item.suggestedBucket);
            const time = ['12:42 PM', '12:41 PM', '12:40 PM', '12:39 PM', '12:38 PM', '12:36 PM'][idx % 6];

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 hover:bg-slate-900/90"
              >
                {/* Left Time, Merchant & Action */}
                <div className="flex items-center gap-4">
                  <div className="font-mono-code text-xs text-slate-500 w-16">
                    {time}
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                    <span className="font-bold text-lg">{item.avatar || '💳'}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.merchant}</span>
                      <span className="font-mono-code text-xs text-slate-400">— ${item.amount.toFixed(2)}</span>
                    </div>
                    <div className={`mt-0.5 inline-block text-[11px] font-semibold ${badge.color.split(' ')[0]}`}>
                      {badge.label}
                    </div>
                  </div>
                </div>

                {/* Right XP Earned */}
                <div className="flex items-center gap-2 font-arcade text-xs font-bold text-emerald-400">
                  <span>{badge.xp}</span>
                </div>
              </div>
            );
          })}

          {auditedItems.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 font-mono-code text-sm">
              No transactions match the selected filter. Play a game to reconcile more transactions!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

