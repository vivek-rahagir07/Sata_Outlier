import React, { useState, useEffect } from 'react';
import { ExpenseItem, DecisionBucket } from '../../types/expense';
import { audioSynth } from '../../services/audioSynth';
import {
  ShieldCheck,
  UserX,
  Skull,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Gavel,
  HelpCircle,
  Sparkles,
  Search,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CyberCourtGameProps {
  expenses: ExpenseItem[];
  onAuditDecision: (expenseId: string, decision: DecisionBucket) => void;
  streak: number;
  scoreXP: number;
  onReset: () => void;
  onReturnToHome?: () => void;
}

export const CyberCourtGame: React.FC<CyberCourtGameProps> = ({
  expenses,
  onAuditDecision,
  scoreXP,
  onReset,
  onReturnToHome,
}) => {
  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const currentExpense = pendingExpenses[0] || null;

  // Tribunal state
  const [isCrossExamined, setIsCrossExamined] = useState(false);
  const [verdictRendered, setVerdictRendered] = useState<{
    bucket: DecisionBucket;
    reactionText: string;
    stampTitle: string;
  } | null>(null);

  const [gavelAnimation, setGavelAnimation] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Reset state when next defendant appears
  useEffect(() => {
    setIsCrossExamined(false);
    setVerdictRendered(null);
  }, [currentExpense?.id]);

  const handleCrossExamine = () => {
    if (isCrossExamined) return;
    audioSynth.playLaser();
    setIsCrossExamined(true);
  };

  const handleVerdict = (decision: DecisionBucket) => {
    if (!currentExpense || verdictRendered || gavelAnimation) return;

    // Trigger dramatic gavel slam
    setGavelAnimation(true);
    setScreenShake(true);
    audioSynth.playGavelSlam();

    let reaction = 'Verdict recorded into the permanent ledger.';
    if (currentExpense.verdictReaction && currentExpense.verdictReaction[decision]) {
      reaction = currentExpense.verdictReaction[decision];
    }

    let stampTitle = 'OFFICIAL VERDICT RECORDED';
    if (decision === 'tax_deductible') {
      stampTitle = 'APPROVED BUSINESS WRITE-OFF';
      setTimeout(() => audioSynth.playCoin(), 300);
    } else if (decision === 'vampire_cancel') {
      stampTitle = 'VAMPIRE SUBSCRIPTION FLAGGED FOR CANCEL';
      setTimeout(() => audioSynth.playVampireSlay(), 300);
    } else if (decision === 'suspicious_flag') {
      stampTitle = 'FLAGGED FOR FRAUD DISPUTE';
      setTimeout(() => audioSynth.playError(), 300);
    } else {
      stampTitle = 'DISALLOWED PERSONAL EXPENSE';
      setTimeout(() => audioSynth.playLaser(), 300);
    }

    setTimeout(() => {
      setScreenShake(false);
      setGavelAnimation(false);
      setVerdictRendered({
        bucket: decision,
        reactionText: reaction,
        stampTitle,
      });

      onAuditDecision(currentExpense.id, decision);

      if (pendingExpenses.length === 1) {
        setTimeout(() => {
          audioSynth.playVictory();
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 },
          });
        }, 300);
      }
    }, 400);
  };

  const proceedNext = () => {
    setVerdictRendered(null);
    setIsCrossExamined(false);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (verdictRendered) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          proceedNext();
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'q') {
        e.preventDefault();
        handleCrossExamine();
      } else if (key === '1' || key === 'a') {
        e.preventDefault();
        handleVerdict('tax_deductible');
      } else if (key === '2' || key === 's') {
        e.preventDefault();
        handleVerdict('personal');
      } else if (key === '3' || key === 'd') {
        e.preventDefault();
        handleVerdict('vampire_cancel');
      } else if (key === '4' || key === 'f') {
        e.preventDefault();
        handleVerdict('suspicious_flag');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentExpense, verdictRendered, isCrossExamined, gavelAnimation]);

  if (!currentExpense) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
          <CheckCircle2 className="h-10 w-10 animate-pulse" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 font-arcade text-xs text-emerald-300 mb-2">
          JUDICIAL RATING: S-TIER ARBITER
        </div>
        <h2 className="font-arcade text-3xl font-extrabold text-emerald-400">
          THE TRIBUNAL IS ADJOURNED!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-slate-300">
          Every rogue expense and vampire charge has answered for its sins. The books are spotless, and your digital chores are completed.
        </p>
        <div className="mt-6">
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-500 active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
            Restart Tribunal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen w-full bg-[#070a14] text-white p-6 sm:p-10 font-sans flex flex-col justify-between transition-transform duration-100 ${
        screenShake ? 'scale-[1.01] translate-y-1.5' : ''
      }`}
    >
      {/* Top Header (Matching Screen 3 in image) */}
      <div className="mx-auto w-full max-w-5xl flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            {onReturnToHome && (
              <button
                onClick={onReturnToHome}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-purple-500/50 transition"
              >
                ←
              </button>
            )}
            <h1 className="font-arcade text-2xl font-black text-cyan-300 tracking-wider drop-shadow-[0_0_10px_#00f0ff]">
              CYBER-COURT
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono-code ml-13">
            Each transaction has a story. You decide the verdict.
          </p>
        </div>

        <div className="text-right font-mono-code">
          <div className="text-xs text-slate-500">PENDING DOCKET</div>
          <div className="font-arcade text-sm font-bold text-cyan-300">
            {pendingExpenses.length} Defendants
          </div>
        </div>
      </div>

      {/* Main Judicial Stage (Matching Screen 3 in image) */}
      <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
        
        {/* Left Column: Anime AI Character Avatar (Screen 3) */}
        <div className="md:col-span-5 flex flex-col items-center text-center">
          <div className="relative group">
            {/* Anime Cyber Avatar Hologram Container */}
            <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl border-2 border-purple-500/60 bg-gradient-to-b from-purple-950/40 via-slate-900 to-black p-4 shadow-[0_0_40px_rgba(168,85,247,0.4)] backdrop-blur-xl overflow-hidden">
              {/* Anime Character Face & Headset */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-8xl mb-2 drop-shadow-[0_0_20px_rgba(217,70,239,0.8)] animate-pulse">
                  👩‍🎤
                </div>
                <div className="font-arcade text-xs font-bold text-purple-300 tracking-wider">
                  AI DEFENDANT AVATAR
                </div>
                <div className="text-[10px] text-cyan-400 font-mono-code">
                  VOICE SYNTHESIS ONLINE
                </div>
              </div>
            </div>

            {/* Glowing Status Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/40 px-3 py-1 text-xs text-purple-300">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
              <span>TESTIFYING UNDER OATH</span>
            </div>
          </div>
        </div>

        {/* Right Column: Testimony Dialogue & Verdict Buttons (Screen 3) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Transaction Dialogue Card */}
          <div className="rounded-3xl border-2 border-cyan-500/40 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
            {/* Merchant Badge + Price */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 text-2xl border border-cyan-500/40">
                  {currentExpense.avatar || '💳'}
                </div>
                <div>
                  <div className="font-bold text-white text-base">
                    {currentExpense.merchant}
                  </div>
                  <div className="text-xs text-slate-400 font-mono-code">
                    Billed: {currentExpense.date}
                  </div>
                </div>
              </div>

              <div className="font-arcade text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]">
                ${currentExpense.amount.toFixed(2)}
              </div>
            </div>

            {/* Quote Dialogue Speech Bubble */}
            <div className="font-mono-code text-sm italic leading-relaxed text-slate-200 bg-black/40 p-4 rounded-2xl border border-slate-800">
              "{currentExpense.storyQuote || `I'm a creative tool. You use me for your projects, designs and content. Without me, how will you make those amazing ideas real?`}"
            </div>

            {/* Cross-Examine Reveal */}
            {isCrossExamined ? (
              <div className="mt-4 rounded-xl border border-purple-500/50 bg-purple-950/40 p-3 text-xs font-mono-code text-purple-200 animate-in fade-in">
                <div className="font-bold text-purple-300 mb-1">⚡ CONFESSION REVEALED:</div>
                "{currentExpense.crossExamineAnswer || 'We admit it—no valid work was created in the last 6 months!'}"
              </div>
            ) : (
              <button
                onClick={handleCrossExamine}
                className="mt-4 flex items-center gap-2 text-xs font-mono-code text-purple-400 hover:text-purple-300 hover:underline"
              >
                <Search className="h-3.5 w-3.5" />
                <span>[Q] Cross-Examine Defendant (Dig for hidden truth)</span>
              </button>
            )}
          </div>

          {/* Verdict Choices or Holographic Stamp */}
          {verdictRendered ? (
            <div
              className={`rounded-2xl border-2 p-5 text-center backdrop-blur-xl animate-in zoom-in-95 duration-200 ${
                verdictRendered.bucket === 'tax_deductible'
                  ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 shadow-[0_0_25px_rgba(34,197,94,0.4)]'
                  : verdictRendered.bucket === 'vampire_cancel'
                  ? 'border-pink-500 bg-pink-950/80 text-pink-300 shadow-[0_0_25px_rgba(236,72,153,0.4)]'
                  : verdictRendered.bucket === 'suspicious_flag'
                  ? 'border-amber-500 bg-amber-950/80 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                  : 'border-cyan-500 bg-cyan-950/80 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-current/30 pb-2 mb-3">
                <span className="font-arcade text-xs font-black uppercase tracking-wider">
                  HOLOGRAPHIC VERDICT STAMP
                </span>
                <span className="font-arcade text-xs font-bold">
                  CASE CLOSED • +100 XP
                </span>
              </div>
              <h4 className="font-arcade text-base font-black uppercase tracking-wide">
                {verdictRendered.stampTitle}
              </h4>
              <p className="mt-2 font-mono-code text-xs leading-relaxed">
                "{verdictRendered.reactionText}"
              </p>
              <button
                onClick={proceedNext}
                autoFocus
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 font-arcade text-xs font-black uppercase text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-500 active:scale-95"
              >
                CALL NEXT DEFENDANT <ArrowRight className="h-4 w-4" />
                <kbd className="ml-1 rounded bg-cyan-800 px-2 py-0.5 text-[10px] text-cyan-100">[Enter]</kbd>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Approve (Business) - Green */}
              <button
                onClick={() => handleVerdict('tax_deductible')}
                className="flex items-center gap-3 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-r from-emerald-950/60 to-slate-900 p-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-105 active:scale-95 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-lg">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Approve</div>
                  <div className="text-[11px] text-emerald-400 font-mono-code">(It's a business expense)</div>
                </div>
              </button>

              {/* 2. Personal - Blue */}
              <button
                onClick={() => handleVerdict('personal')}
                className="flex items-center gap-3 rounded-2xl border-2 border-cyan-500/70 bg-gradient-to-r from-cyan-950/60 to-slate-900 p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 text-lg">
                  🏠
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Personal</div>
                  <div className="text-[11px] text-cyan-400 font-mono-code">(For personal use)</div>
                </div>
              </button>

              {/* 3. Review Subscription - Red */}
              <button
                onClick={() => handleVerdict('vampire_cancel')}
                className="flex items-center gap-3 rounded-2xl border-2 border-pink-500/70 bg-gradient-to-r from-pink-950/60 to-slate-900 p-4 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-105 active:scale-95 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 text-lg">
                  🚫
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Review Subscription</div>
                  <div className="text-[11px] text-pink-400 font-mono-code">(Mark for cancellation)</div>
                </div>
              </button>

              {/* 4. Flag Suspicious - Orange */}
              <button
                onClick={() => handleVerdict('suspicious_flag')}
                className="flex items-center gap-3 rounded-2xl border-2 border-amber-500/70 bg-gradient-to-r from-amber-950/60 to-slate-900 p-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 text-lg">
                  ⚠️
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Flag Suspicious</div>
                  <div className="text-[11px] text-amber-400 font-mono-code">(This looks unusual)</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
