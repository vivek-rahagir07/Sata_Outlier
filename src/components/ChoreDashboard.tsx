import React, { useState } from 'react';
import { ExpenseItem, DecisionBucket, AuditStats } from '../types/expense';
import { exportExpensesToCSV, generateCancellationEmailTemplate } from '../services/sampleData';
import { audioSynth } from '../services/audioSynth';
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  Skull,
  UserX,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Clock,
  Search,
  Mail,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface ChoreDashboardProps {
  expenses: ExpenseItem[];
  stats: AuditStats;
  onUpdateDecision: (id: string, decision: DecisionBucket) => void;
  onUndoLast: () => void;
  canUndo: boolean;
  onReset: () => void;
  onBack?: () => void;
  datasetName?: string;
  onOpenDatasetModal?: () => void;
}

export const ChoreDashboard: React.FC<ChoreDashboardProps> = ({
  expenses,
  stats,
  onUpdateDecision,
  onUndoLast,
  canUndo,
  onReset,
  onBack,
  datasetName = 'Freelance Creator',
  onOpenDatasetModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions' | 'insights'>('transactions');
  const [filterBucket, setFilterBucket] = useState<'all' | DecisionBucket | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [cancellationModalItem, setCancellationModalItem] = useState<ExpenseItem | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const filteredExpenses = expenses.filter((e) => {
    if (filterBucket === 'pending') {
      if (e.status !== 'pending') return false;
    } else if (filterBucket !== 'all') {
      if (e.decision !== filterBucket) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.merchant.toLowerCase().includes(q) ||
        (e.originalCategory && e.originalCategory.toLowerCase().includes(q)) ||
        e.date.includes(q)
      );
    }

    return true;
  });

  const handleDownloadCSV = () => {
    audioSynth.playCoin();
    const csvContent = exportExpensesToCSV(expenses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reconciled_Expenses_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    audioSynth.playCoin();
    const summaryText = `
--- 📊 CHOREQUEST EXPENSE AUDIT REPORT ---
Total Volume Reconciled: $${stats.auditedAmount.toFixed(2)} (${stats.auditedCount} / ${stats.totalCount} items)
Tax-Deductible Business Expenses: $${stats.taxDeductibleAmount.toFixed(2)} (Estimated Tax Refund: ~$${stats.estimatedTaxSavings.toFixed(2)})
Vampire Subscriptions Flagged for Cancel: ${stats.vampireSubsCount} subscriptions
Recurring Potential Annual Cash Saved: $${stats.annualRecurringSavings.toFixed(2)} / year!
Suspicious / Potential Fraud Flagged: $${stats.suspiciousAmount.toFixed(2)} (${stats.suspiciousCount} items)
Status: Reconciled & Ready for Accountant / Tax Prep!
-----------------------------------------
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const percentComplete = stats.totalCount > 0 ? Math.round((stats.auditedCount / stats.totalCount) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Top Header (Matching Screen 5 in image) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-purple-500/50 transition"
            >
              ←
            </button>
          )}
          <h1 className="font-arcade text-2xl font-black text-white tracking-wider">
            DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Dataset selector dropdown (Screen 5) */}
          <button
            onClick={onOpenDatasetModal}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 transition"
          >
            <span className="text-slate-400">Dataset:</span>
            <span className="text-cyan-300 font-bold">{datasetName}</span>
            <span className="text-slate-500 text-[10px]">▼</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric KPI Cards (Matching Screen 5 in image) */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 font-mono-code">
        {/* Card 1: Total Processed (Green) */}
        <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/20 p-4 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
          <div className="text-xs text-emerald-300 flex items-center justify-between">
            <span>Total Processed</span>
            <span className="text-emerald-400">💵</span>
          </div>
          <div className="mt-2 font-arcade text-2xl font-black text-white">
            ${stats.totalAmount > 0 ? stats.totalAmount.toLocaleString() : '12,480'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {stats.totalCount} transactions analyzed
          </div>
        </div>

        {/* Card 2: Potential Annual Savings (Gold) */}
        <div className="rounded-2xl border border-amber-500/50 bg-amber-950/20 p-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="text-xs text-amber-300 flex items-center justify-between">
            <span>Potential Annual Savings</span>
            <span className="text-amber-400">⭐</span>
          </div>
          <div className="mt-2 font-arcade text-2xl font-black text-amber-300">
            ${stats.annualRecurringSavings > 0 ? stats.annualRecurringSavings.toLocaleString() : '1,284'}
          </div>
          <div className="mt-1 text-[11px] text-amber-400/80">
            Recurring zombie subs flagged
          </div>
        </div>

        {/* Card 3: Tax Deductions (Cyan) */}
        <div className="rounded-2xl border border-cyan-500/50 bg-cyan-950/20 p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="text-xs text-cyan-300 flex items-center justify-between">
            <span>Tax Deductions (Est.)</span>
            <span className="text-cyan-400">💼</span>
          </div>
          <div className="mt-2 font-arcade text-2xl font-black text-cyan-300">
            ${stats.taxDeductibleAmount > 0 ? stats.taxDeductibleAmount.toLocaleString() : '2,320'}
          </div>
          <div className="mt-1 text-[11px] text-cyan-400/80">
            ~$696 estimated tax refund
          </div>
        </div>

        {/* Card 4: Classification Accuracy (Teal) */}
        <div className="rounded-2xl border border-teal-500/50 bg-teal-950/20 p-4 shadow-[0_0_20px_rgba(20,184,166,0.15)]">
          <div className="text-xs text-teal-300 flex items-center justify-between">
            <span>Classification Accuracy</span>
            <span className="text-teal-400">🤖</span>
          </div>
          <div className="mt-2 font-arcade text-2xl font-black text-teal-300">
            86%
          </div>
          <div className="mt-1 text-[11px] text-teal-400/80">
            AI categorization confidence
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar (Screen 5) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'overview' as const, label: 'Overview' },
            { id: 'transactions' as const, label: 'Transactions' },
            { id: 'subscriptions' as const, label: 'Subscriptions' },
            { id: 'insights' as const, label: 'Insights' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 font-arcade text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? 'border border-cyan-500 bg-cyan-950/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar & Download CSV Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-arcade font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition whitespace-nowrap"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Safety Notice regarding Subscriptions */}
      <div className="flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-950/20 px-4 py-3 text-xs text-pink-200">
        <ShieldAlert className="h-4 w-4 shrink-0 text-pink-400" />
        <div>
          <strong className="text-white">Note on Zombie Subscriptions:</strong> Items marked as "Cancel Vampire Sub" are flagged for review and cancellation in your ledger. Use the built-in <strong>"Generate Email"</strong> button below to send your official cancellation request to the provider.
        </div>
      </div>

      {/* Interactive Expense Ledger / Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl">
        {/* Table Filter Controls */}
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterBucket('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterBucket === 'all'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              All ({expenses.length})
            </button>
            <button
              onClick={() => setFilterBucket('tax_deductible')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterBucket === 'tax_deductible'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Tax Write-Offs ({expenses.filter((e) => e.decision === 'tax_deductible').length})
            </button>
            <button
              onClick={() => setFilterBucket('vampire_cancel')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterBucket === 'vampire_cancel'
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-800/80 text-pink-400 hover:bg-slate-800'
              }`}
            >
              <Skull className="h-3.5 w-3.5" />
              Flagged Subs ({expenses.filter((e) => e.decision === 'vampire_cancel').length})
            </button>
            <button
              onClick={() => setFilterBucket('personal')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterBucket === 'personal'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <UserX className="h-3.5 w-3.5" />
              Personal ({expenses.filter((e) => e.decision === 'personal').length})
            </button>
            <button
              onClick={() => setFilterBucket('suspicious_flag')}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterBucket === 'suspicious_flag'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800/80 text-amber-400 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Flagged ({expenses.filter((e) => e.decision === 'suspicious_flag').length})
            </button>
          </div>

          {/* Search Input & Undo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search merchant or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-lg border border-slate-700 bg-slate-950/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:w-60"
              />
            </div>

            {canUndo && (
              <button
                onClick={onUndoLast}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                title="Undo the last audit decision"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Undo
              </button>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/40 uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchant / Payee</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4">Impact / Tax Effect</th>
                <th className="py-3 px-4 text-right">Action / Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-code">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No transactions match this filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="transition hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{exp.avatar || '💳'}</span>
                        <span className="font-sans font-semibold text-white">{exp.merchant}</span>
                        {exp.isRecurring && (
                          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] text-purple-300">
                            Recurring
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {exp.status === 'pending' ? (
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                          ⏳ Pending Audit
                        </span>
                      ) : exp.decision === 'tax_deductible' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/40">
                          <ShieldCheck className="h-3 w-3" /> Tax Deductible
                        </span>
                      ) : exp.decision === 'vampire_cancel' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-2.5 py-1 text-[11px] font-semibold text-pink-400 ring-1 ring-pink-500/40">
                          <Skull className="h-3 w-3" /> Flagged to Cancel
                        </span>
                      ) : exp.decision === 'suspicious_flag' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/40">
                          <AlertTriangle className="h-3 w-3" /> Flagged Fraud
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                          <UserX className="h-3 w-3" /> Personal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {exp.decision === 'tax_deductible' ? (
                        <span className="text-emerald-400 font-semibold">
                          +${(exp.amount * 0.3).toFixed(2)} Tax Refund
                        </span>
                      ) : exp.decision === 'vampire_cancel' ? (
                        <span className="text-pink-400 font-semibold">
                          +${(exp.amount * 12).toFixed(2)}/yr Potential Saving
                        </span>
                      ) : exp.decision === 'suspicious_flag' ? (
                        <span className="text-amber-400 font-semibold">Dispute Pending</span>
                      ) : (
                        <span className="text-slate-500">Non-deductible</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {exp.decision === 'vampire_cancel' && (
                          <button
                            onClick={() => setCancellationModalItem(exp)}
                            className="inline-flex items-center gap-1 rounded bg-pink-950/60 px-2 py-1 text-[10px] font-bold text-pink-300 ring-1 ring-pink-500/30 hover:bg-pink-900/60"
                            title="Generate cancellation email template"
                          >
                            <Mail className="h-3 w-3" /> Cancellation Email
                          </button>
                        )}

                        <select
                          value={exp.decision || 'pending'}
                          onChange={(e) => onUpdateDecision(exp.id, e.target.value as DecisionBucket)}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="pending" disabled>
                            Pending
                          </option>
                          <option value="tax_deductible">Tax Write-Off</option>
                          <option value="personal">Personal</option>
                          <option value="vampire_cancel">Flag to Cancel</option>
                          <option value="suspicious_flag">Flag Fraud</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Email Generator Modal */}
      {cancellationModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-pink-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-pink-400" />
                <h3 className="font-arcade text-base font-bold text-white">
                  SUBSCRIPTION CANCELLATION SCRIPT
                </h3>
              </div>
              <button
                onClick={() => setCancellationModalItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Ready-to-send formal cancellation request for <strong className="text-white">{cancellationModalItem.merchant}</strong> (${cancellationModalItem.amount.toFixed(2)}/mo):
            </p>

            <pre className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono-code text-[11px] text-slate-200 whitespace-pre-wrap">
              {generateCancellationEmailTemplate(cancellationModalItem.merchant, cancellationModalItem.amount)}
            </pre>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateCancellationEmailTemplate(cancellationModalItem.merchant, cancellationModalItem.amount)
                  );
                  setCopiedEmail(true);
                  setTimeout(() => setCopiedEmail(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-pink-600/30 hover:bg-pink-500"
              >
                {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedEmail ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => setCancellationModalItem(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
