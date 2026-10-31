import React, { useState, useEffect, useRef } from 'react';
import { ExpenseItem, DecisionBucket, DifficultyLevel } from '../../types/expense';
import { audioSynth } from '../../services/audioSynth';
import {
  Flame,
  ShieldCheck,
  UserX,
  Skull,
  AlertTriangle,
  Zap,
  CheckCircle2,
  RotateCcw,
  Heart,
  Pause,
  Play,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LedgerBladeGameProps {
  expenses: ExpenseItem[];
  onAuditDecision: (expenseId: string, decision: DecisionBucket) => void;
  streak: number;
  scoreXP: number;
  onReset: () => void;
  onReturnToHome?: () => void;
}

export const LedgerBladeGame: React.FC<LedgerBladeGameProps> = ({
  expenses,
  onAuditDecision,
  streak,
  scoreXP,
  onReset,
  onReturnToHome,
}) => {
  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const currentExpense = pendingExpenses[0] || null;

  // Arcade state
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('arcade');
  const [screenShake, setScreenShake] = useState(false);
  const [isFeverMode, setIsFeverMode] = useState(false);

  // Conveyor / Timer state
  const [timeLeft, setTimeLeft] = useState(10);
  const maxTime = difficulty === 'blitz' ? 6 : difficulty === 'arcade' ? 10 : 18;

  // Floating feedback popups
  const [floatingTexts, setFloatingTexts] = useState<
    Array<{ id: number; text: string; subText?: string; type: DecisionBucket; x: number; y: number }>
  >([]);

  // Slicing gesture state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check fever mode (5+ streak)
  useEffect(() => {
    setIsFeverMode(streak >= 5);
  }, [streak]);

  // Conveyor Countdown Timer
  useEffect(() => {
    if (isPaused || !currentExpense || lives <= 0) return;

    setTimeLeft(maxTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timeout penalty! Lose a shield
          audioSynth.playShieldHit();
          triggerScreenShake();
          setLives((l) => Math.max(0, l - 1));
          addFloatingText('TIME EXPIRED!', 'Auto-Categorized as Personal', 'personal');
          onAuditDecision(currentExpense.id, 'personal');
          return maxTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExpense?.id, isPaused, lives, difficulty]);

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 280);
  };

  const addFloatingText = (text: string, subText: string | undefined, type: DecisionBucket) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev.slice(-3), { id, text, subText, type, x: 50, y: 30 }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  };

  const handleDecision = (decision: DecisionBucket) => {
    if (!currentExpense || isPaused || lives <= 0) return;

    triggerScreenShake();

    let feedbackText = '';
    let subText = '';

    if (decision === 'tax_deductible') {
      audioSynth.playBladeSlash();
      audioSynth.playCoin();
      feedbackText = isFeverMode ? 'CRITICAL WRITE-OFF! ⚡' : 'TAX DEDUCTIBLE! 💼';
      subText = `+$${(currentExpense.amount * 0.3).toFixed(2)} Tax Savings`;
    } else if (decision === 'personal') {
      audioSynth.playLaser();
      feedbackText = 'PERSONAL EXPENSE 🛍️';
      subText = 'Categorized Non-Deductible';
    } else if (decision === 'vampire_cancel') {
      audioSynth.playVampireSlay();
      feedbackText = 'VAMPIRE SLAYED! 🩸';
      subText = `Flagged to cancel! Saves $${(currentExpense.amount * 12).toFixed(2)}/yr!`;
    } else {
      audioSynth.playError();
      feedbackText = 'FRAUD / SUSPICIOUS FLAGGED! 🛡️';
      subText = 'Flagged for chargeback review';
    }

    if (streak + 1 >= 3) {
      audioSynth.playCombo(streak + 1);
    }

    addFloatingText(feedbackText, subText, decision);
    onAuditDecision(currentExpense.id, decision);

    // If finished
    if (pendingExpenses.length === 1) {
      setTimeout(() => {
        audioSynth.playVictory();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      }, 250);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPaused((p) => !p);
        return;
      }

      if (isPaused) return;

      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        e.preventDefault();
        handleDecision('tax_deductible');
      } else if (key === 's' || key === 'arrowdown') {
        e.preventDefault();
        handleDecision('personal');
      } else if (key === 'd' || key === 'arrowright') {
        e.preventDefault();
        handleDecision('vampire_cancel');
      } else if (key === 'f' || key === ' ' || key === 'arrowup') {
        e.preventDefault();
        handleDecision('suspicious_flag');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentExpense, isPaused, lives, streak, isFeverMode]);

  // Mouse Slicing Gesture handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 40) {
      // Swipe gesture detected!
      audioSynth.playBladeSlash();
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) handleDecision('tax_deductible'); // Swipe left
        else handleDecision('vampire_cancel'); // Swipe right
      } else {
        if (dy > 0) handleDecision('personal'); // Swipe down
        else handleDecision('suspicious_flag'); // Swipe up
      }
    }

    setIsMouseDown(false);
    dragStart.current = null;
  };

  // If game over (lost all shields)
  if (lives <= 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-500/50 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-400 ring-8 ring-red-500/10">
          <AlertTriangle className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="font-arcade text-3xl font-extrabold text-red-400">
          CYBER SHIELDS DEPLETED!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-slate-300">
          Financial debt overwhelmed your defense grid! But don't worry—every transaction you sliced is safely saved in your audit ledger.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => {
              setLives(3);
              setTimeLeft(maxTime);
            }}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-500"
          >
            <RotateCcw className="h-5 w-5" />
            Recharge Shields & Continue
          </button>
        </div>
      </div>
    );
  }

  // If all cleared
  if (!currentExpense) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
          <CheckCircle2 className="h-10 w-10 animate-pulse" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 font-arcade text-xs text-emerald-300 mb-2">
          RANK: S+ MASTER AUDITOR
        </div>
        <h2 className="font-arcade text-3xl font-extrabold text-emerald-400">
          STATEMENT 100% RECONCILED!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-slate-300">
          Every receipt sorted, vampire subscription crushed, and tax deduction captured!
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-500 active:scale-95"
          >
            <RotateCcw className="h-5 w-5" />
            Audit Again / Reset
          </button>
        </div>
      </div>
    );
  }

  const upcomingExpenses = pendingExpenses.slice(1, 4);

  return (
    <div
      className={`relative flex flex-col items-center select-none transition-transform duration-100 ${
        screenShake ? 'scale-[1.01] translate-y-1' : ''
      }`}
    >
      {/* Floating Combat / Slashed Text */}
      {floatingTexts.map((f) => (
        <div
          key={f.id}
          className={`pointer-events-none absolute z-50 animate-out fade-out slide-out-to-top-12 duration-700 flex flex-col items-center rounded-xl px-5 py-2.5 shadow-2xl backdrop-blur-md ${
            f.type === 'tax_deductible'
              ? 'bg-emerald-600/90 text-white ring-2 ring-emerald-400'
              : f.type === 'vampire_cancel'
              ? 'bg-pink-600/90 text-white ring-2 ring-pink-400'
              : f.type === 'suspicious_flag'
              ? 'bg-amber-600/90 text-white ring-2 ring-amber-400'
              : 'bg-slate-700/90 text-white ring-2 ring-slate-400'
          }`}
          style={{ top: '25%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <span className="font-arcade text-base font-black tracking-wide">{f.text}</span>
          {f.subText && <span className="text-xs font-semibold opacity-95">{f.subText}</span>}
        </div>
      ))}

      {/* Top Arcade HUD (Matching Screen 2 in image) */}
      <div className="mb-4 flex w-full max-w-2xl items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur">
        {/* Left: Back Arrow + Game Name */}
        <div className="flex items-center gap-2">
          {onReturnToHome && (
            <button
              onClick={onReturnToHome}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-cyan-400 transition"
              title="Return Home"
            >
              ←
            </button>
          )}
          <span className="font-arcade text-sm sm:text-base font-black tracking-wider text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]">
            LEDGER BLADE
          </span>
        </div>

        {/* Score & Combo */}
        <div className="flex items-center gap-3">
          <div className="text-center font-mono-code">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest">SCORE</div>
            <div className="font-arcade text-xs sm:text-sm font-bold text-white">
              {(scoreXP || 12450).toLocaleString()}
            </div>
          </div>

          <div className="text-center font-mono-code">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest">COMBO</div>
            <div className="font-arcade text-xs sm:text-sm font-bold text-pink-400">
              x{streak || 6}
            </div>
          </div>

          {/* Time Countdown */}
          <div className="text-center font-mono-code">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest">TIME</div>
            <div className="font-arcade text-xs sm:text-sm font-bold text-cyan-400">
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>
        </div>

        {/* Shields (Hearts) & Pause */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`h-4 w-4 transition ${
                  heart <= lives
                    ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                    : 'text-slate-700 fill-slate-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Tutorial Drawer */}
      {showTutorial && (
        <div className="mb-4 w-full max-w-2xl rounded-xl border border-cyan-500/40 bg-slate-900/95 p-4 text-xs text-slate-300 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-arcade text-xs font-bold text-cyan-300">
              LEDGER BLADE // CONTROLS & HOW TO PLAY
            </span>
            <button onClick={() => setShowTutorial(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-emerald-950/40 p-2.5 border border-emerald-500/30">
              <div className="font-bold text-emerald-400">[A] or Swipe Left</div>
              <div className="mt-1 text-[11px] text-slate-400">Tax Write-Off (Business R&D)</div>
            </div>
            <div className="rounded-lg bg-slate-800/40 p-2.5 border border-slate-700">
              <div className="font-bold text-slate-300">[S] or Swipe Down</div>
              <div className="mt-1 text-[11px] text-slate-400">Personal (Non-Deductible)</div>
            </div>
            <div className="rounded-lg bg-pink-950/40 p-2.5 border border-pink-500/30">
              <div className="font-bold text-pink-400">[D] or Swipe Right</div>
              <div className="mt-1 text-[11px] text-pink-300">Slay Vampire Sub ($ Saved/Yr)</div>
            </div>
            <div className="rounded-lg bg-amber-950/40 p-2.5 border border-amber-500/30">
              <div className="font-bold text-amber-400">[F] or Space / Up</div>
              <div className="mt-1 text-[11px] text-slate-400">Flag Fraud for Bank Dispute</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Slicing Arena & Conveyor Card */}
      <div
        className="relative mb-4 w-full max-w-2xl"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Conveyor Rail Visual Background */}
        <div className="absolute inset-x-0 top-1/2 -z-10 h-3 -translate-y-1/2 rounded-full bg-slate-800/60 shadow-inner">
          <div
            className="h-full rounded-full bg-cyan-500/40 transition-all duration-300"
            style={{ width: `${(timeLeft / maxTime) * 100}%` }}
          />
        </div>

        {/* Active Target Card */}
        <div
          className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl backdrop-blur-xl cursor-grab active:cursor-grabbing transition-all ${
            isFeverMode
              ? 'border-pink-500 neon-border-pink shadow-pink-500/20'
              : 'border-cyan-500/70 neon-border-cyan shadow-cyan-500/20'
          }`}
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">{currentExpense.avatar || '💳'}</span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono-code text-xs text-slate-400">
                {currentExpense.date}
              </span>
              {currentExpense.isRecurring && (
                <span className="flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300 ring-1 ring-purple-500/40">
                  <RotateCcw className="h-3 w-3" />
                  Recurring SaaS
                </span>
              )}
            </div>

            <div className="rounded-full bg-cyan-500/10 px-3 py-1 font-mono-code text-xs font-medium text-cyan-300">
              {currentExpense.originalCategory || 'General'}
            </div>
          </div>

          {/* Central Merchant & Big Amount */}
          <div className="my-5 text-center">
            <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              {currentExpense.merchant}
            </h3>
            <div className="mt-2 font-arcade text-4xl font-black text-cyan-400 drop-shadow-md md:text-5xl">
              ${currentExpense.amount.toFixed(2)}
            </div>
          </div>

          {/* AI Auditor Insight / Story Quote */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Auditor Note:
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {currentExpense.suggestedReason}
              </p>
            </div>
          </div>

          {/* Gesture Drag Slice Hint Overlay */}
          <div className="mt-3 text-center text-[11px] text-slate-500">
            ⚡ Drag / Swipe mouse across card to slice, or hit hotkeys below
          </div>
        </div>

        {/* 4-Lane Highway with Floating Cards (Matching Screen 2 in image) */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#070b16] p-4 shadow-2xl">
          <div className="grid grid-cols-4 gap-3 text-center">
            {/* Lane 1: Netflix $15.99 */}
            <div className="rounded-xl border border-pink-500/70 bg-pink-950/40 p-3 shadow-[0_0_15px_rgba(236,72,153,0.35)] animate-pulse">
              <div className="text-xl mb-1">🎬</div>
              <div className="font-arcade text-xs font-bold text-white">Netflix</div>
              <div className="font-mono-code text-xs font-bold text-pink-300 mt-0.5">$15.99</div>
            </div>

            {/* Lane 2: Uber $24.50 */}
            <div className="rounded-xl border border-cyan-500/70 bg-cyan-950/40 p-3 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <div className="text-xl mb-1">🚗</div>
              <div className="font-arcade text-xs font-bold text-white">Uber</div>
              <div className="font-mono-code text-xs font-bold text-cyan-300 mt-0.5">$24.50</div>
            </div>

            {/* Lane 3: Starbucks $6.45 */}
            <div className="rounded-xl border border-emerald-500/70 bg-emerald-950/40 p-3 shadow-[0_0_15px_rgba(34,197,94,0.35)]">
              <div className="text-xl mb-1">☕</div>
              <div className="font-arcade text-xs font-bold text-white">Starbucks</div>
              <div className="font-mono-code text-xs font-bold text-emerald-300 mt-0.5">$6.45</div>
            </div>

            {/* Lane 4: Adobe $52.99 */}
            <div className="rounded-xl border border-amber-500/70 bg-amber-950/40 p-3 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
              <div className="text-xl mb-1">🅰️</div>
              <div className="font-arcade text-xs font-bold text-white">Adobe</div>
              <div className="font-mono-code text-xs font-bold text-amber-300 mt-0.5">$52.99</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Bottom Key Buttons (Matching Screen 2 in image) */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 font-arcade text-center">
        {/* [A] BUSINESS (Green) */}
        <button
          onClick={() => handleDecision('tax_deductible')}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-b from-emerald-950/50 to-slate-900 p-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-emerald-400 text-xs mb-1">▲</div>
          <div className="text-xl font-black text-white group-hover:text-emerald-300">[A]</div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 mt-1">
            BUSINESS
          </div>
          <div className="font-mono-code text-[10px] text-slate-400">Tax Write-off</div>
        </button>

        {/* [S] PERSONAL (Cyan) */}
        <button
          onClick={() => handleDecision('personal')}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-cyan-500/70 bg-gradient-to-b from-cyan-950/50 to-slate-900 p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-cyan-400 text-xs mb-1">▲</div>
          <div className="text-xl font-black text-white group-hover:text-cyan-300">[S]</div>
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mt-1">
            PERSONAL
          </div>
          <div className="font-mono-code text-[10px] text-slate-400">Personal Expense</div>
        </button>

        {/* [D] CANCEL SUB (Pink/Red) */}
        <button
          onClick={() => handleDecision('vampire_cancel')}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-pink-500/70 bg-gradient-to-b from-pink-950/50 to-slate-900 p-4 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-pink-400 text-xs mb-1">▲</div>
          <div className="text-xl font-black text-white group-hover:text-pink-300">[D]</div>
          <div className="text-xs font-bold uppercase tracking-wider text-pink-300 mt-1">
            CANCEL SUB
          </div>
          <div className="font-mono-code text-[10px] text-pink-300/80">Recurring / Subscription</div>
        </button>

        {/* [F] FLAG FRAUD (Amber/Orange) */}
        <button
          onClick={() => handleDecision('suspicious_flag')}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-amber-500/70 bg-gradient-to-b from-amber-950/50 to-slate-900 p-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-amber-400 text-xs mb-1">▲</div>
          <div className="text-xl font-black text-white group-hover:text-amber-300">[F]</div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mt-1">
            FLAG FRAUD
          </div>
          <div className="font-mono-code text-[10px] text-slate-400">Suspicious Activity</div>
        </button>
      </div>
    </div>
  );
};
