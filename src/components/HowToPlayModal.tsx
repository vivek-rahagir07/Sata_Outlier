import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Flame,
  X,
  HelpCircle
} from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'court' | 'sweeper'>('ledger');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/50 bg-gradient-to-b from-[#0f0926] via-[#090c1a] to-[#060814] p-8 shadow-[0_0_60px_rgba(168,85,247,0.35)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close how to play guide"
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-6 w-6 text-purple-400" />
          <h2 id="how-to-play-title" className="font-arcade text-2xl font-black text-white tracking-wider">
            HOW TO PLAY
          </h2>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6" role="tablist" aria-label="Game Tutorial Modes">
          {[
            { id: 'ledger' as const, label: 'Ledger Blade', icon: Gamepad2 },
            { id: 'court' as const, label: 'Cyber-Court', icon: Sparkles },
            { id: 'sweeper' as const, label: 'Audit Sweeper', icon: Flame },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                aria-label={`${tab.label} Tutorial`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 font-arcade text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  isSelected
                    ? 'border border-purple-500/60 bg-purple-950/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: LEDGER BLADE TUTORIAL */}
        {activeTab === 'ledger' && (
          <div className="space-y-6" role="tabpanel" aria-label="Ledger Blade Instructions">
            {/* Visual Lane Preview */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070b16] p-6 shadow-inner">
              <div className="flex justify-center gap-3 mb-5">
                <div className="rounded-xl border border-cyan-500/60 bg-cyan-950/40 p-3 text-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                  <div className="text-[10px] text-slate-400">Uber</div>
                  <div className="font-arcade text-sm font-bold text-cyan-300">$24.50</div>
                </div>

                <div className="rounded-xl border border-pink-500/60 bg-pink-950/40 p-3 text-center shadow-[0_0_12px_rgba(236,72,153,0.3)]">
                  <div className="text-[10px] text-slate-400">Netflix</div>
                  <div className="font-arcade text-sm font-bold text-pink-300">$15.99</div>
                </div>

                <div className="rounded-xl border border-amber-500/60 bg-amber-950/40 p-3 text-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <div className="text-[10px] text-slate-400">AWS</div>
                  <div className="font-arcade text-sm font-bold text-amber-300">$86.20</div>
                </div>
              </div>

              {/* Hotkey Indicators */}
              <div className="grid grid-cols-4 gap-2 text-center font-arcade text-[10px]">
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-2 text-emerald-300">
                  <div className="text-sm font-black">[A]</div>
                  <div>Business</div>
                </div>
                <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-2 text-cyan-300">
                  <div className="text-sm font-black">[S]</div>
                  <div>Personal</div>
                </div>
                <div className="rounded-xl border border-pink-500/40 bg-pink-950/30 p-2 text-pink-300">
                  <div className="text-sm font-black">[D]</div>
                  <div>Cancel Sub</div>
                </div>
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-2 text-amber-300">
                  <div className="text-sm font-black">[F]</div>
                  <div>Flag Fraud</div>
                </div>
              </div>
            </div>

            {/* Numbered Steps */}
            <div className="space-y-2 font-mono-code text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-bold text-white text-[10px]">1</span>
                <span>Transactions move towards you along the highway</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-bold text-white text-[10px]">2</span>
                <span>Press <strong className="text-cyan-300">A / S / D / F</strong> to sort into audit buckets</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-bold text-white text-[10px]">3</span>
                <span>Build combos for higher score multipliers</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-bold text-white text-[10px]">4</span>
                <span>Don't let cards reach the bottom and deplete shields!</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 font-bold text-white text-[10px]">5</span>
                <span>Complete the level before time runs out!</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CYBER COURT TUTORIAL */}
        {activeTab === 'court' && (
          <div className="space-y-4 font-mono-code text-xs text-slate-300" role="tabpanel" aria-label="Cyber Court Instructions">
            <p>
              In <strong className="text-purple-300">Cyber-Court</strong>, each recurring expense pleads its case through an expressive AI anime avatar.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="text-cyan-300 font-arcade text-xs">CROSS-EXAMINATION:</div>
              <div>Press the search button to interrogate defendants and reveal hidden truths (e.g., zero logins for 7 months).</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="text-pink-400 font-arcade text-xs">RENDER VERDICT:</div>
              <div>Approve as business, mark as personal, cancel zombie subscriptions, or flag fraud to slam the cyber-gavel!</div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT SWEEPER TUTORIAL */}
        {activeTab === 'sweeper' && (
          <div className="space-y-4 font-mono-code text-xs text-slate-300" role="tabpanel" aria-label="Audit Sweeper Instructions">
            <p>
              Fly your starfighter through floating chore orbs. Blast them with dual plasma lasers and collect powerups like <strong className="text-cyan-300">Shields, Time Slow, and Magnets</strong>.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3">
                <strong className="text-emerald-400">Green Orbs:</strong> Business Expenses
              </div>
              <div className="rounded-xl border border-pink-500/40 bg-pink-950/20 p-3">
                <strong className="text-pink-400">Pink Orbs:</strong> Vampire Subscriptions
              </div>
              <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3">
                <strong className="text-cyan-400">Blue Orbs:</strong> Personal Costs
              </div>
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3">
                <strong className="text-amber-400">Orange Orbs:</strong> Suspicious / Fraud
              </div>
            </div>
          </div>
        )}

        {/* Got It Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Acknowledge guide and close modal"
            className="rounded-xl bg-purple-600 hover:bg-purple-500 px-8 py-3 font-arcade text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
