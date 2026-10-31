import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { audioSynth } from '../services/audioSynth';
import {
  Star,
  CheckCircle2,
  DollarSign,
  Clock,
  RotateCcw,
  BarChart3,
  ChevronRight
} from 'lucide-react';

interface LevelCompleteModalProps {
  scoreXP: number;
  combo: number;
  processedCount: number;
  totalSaved: number;
  onPlayAgain: () => void;
  onViewDashboard: () => void;
  onNextLevel: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  scoreXP,
  combo,
  processedCount,
  totalSaved,
  onPlayAgain,
  onViewDashboard,
  onNextLevel,
}) => {
  useEffect(() => {
    audioSynth.playVampireSlay();
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#ff007f', '#a855f7', '#f59e0b'],
    });
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-purple-500/50 bg-gradient-to-b from-[#0e0720] via-[#090b17] to-[#060814] p-8 shadow-[0_0_60px_rgba(168,85,247,0.35)] text-center">
        
        {/* Title */}
        <div className="mb-2 inline-block">
          <h2 id="level-complete-title" className="font-arcade text-3xl sm:text-4xl font-black italic tracking-wider text-white drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">
            LEVEL COMPLETE!
          </h2>
        </div>

        {/* 3 Glowing Gold Stars */}
        <div className="mb-6 flex justify-center gap-3" aria-label="3 Star Rating Awarded">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-950/40 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse"
              style={{ animationDelay: `${star * 200}ms` }}
              aria-hidden="true"
            >
              <Star className="h-7 w-7 fill-amber-300 text-amber-300" />
            </div>
          ))}
        </div>

        {/* Grid Stats & Real Impact Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
          
          {/* Left Performance Stats */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 font-mono-code text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Transactions Processed</span>
              <span className="font-arcade font-bold text-white text-sm">{processedCount || 25}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Accuracy</span>
              <span className="font-arcade font-bold text-cyan-300 text-sm">92%</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Combo Achieved</span>
              <span className="font-arcade font-bold text-purple-300 text-sm">x{combo || 8}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Points Earned</span>
              <span className="font-arcade font-bold text-amber-400 text-sm">+{scoreXP || 4320}</span>
            </div>
          </div>

          {/* Right Real Impact Card */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-3 font-mono-code text-xs shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div className="font-arcade text-[11px] font-bold tracking-widest text-amber-300 uppercase">
              REAL IMPACT
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-arcade text-base font-bold text-white">
                  ${(processedCount * 7.45 + 186.4).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Processed</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="font-arcade text-base font-bold text-amber-300">
                  ${(totalSaved || 24.99).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Potential Savings</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="font-arcade text-base font-bold text-cyan-300">
                  35 min
                </div>
                <div className="text-[10px] text-slate-400">Time Saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Play Again, View Dashboard, Next Level */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-arcade text-xs font-bold">
          <button
            onClick={onPlayAgain}
            aria-label="Play Level Again"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onViewDashboard}
            aria-label="View Audit Dashboard"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-950/40 px-6 py-3 text-cyan-300 hover:bg-cyan-900/60 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <BarChart3 className="h-4 w-4" />
            <span>View Dashboard</span>
          </button>

          <button
            onClick={onNextLevel}
            aria-label="Proceed to Next Level"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-7 py-3 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] hover:scale-105 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <span>Next Level</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
