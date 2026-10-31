import React from 'react';
import { GameMode, AuditStats } from '../types/expense';
import { audioSynth } from '../services/audioSynth';
import {
  Gamepad2,
  Gavel,
  Crosshair,
  Sparkles,
  Zap,
  Shield,
  FileSpreadsheet,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';

interface TitleScreenProps {
  onSelectMode: (mode: GameMode) => void;
  stats: AuditStats;
  currentDatasetName: string;
  onOpenDatasetModal: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onSelectMode,
  stats,
  currentDatasetName,
  onOpenDatasetModal,
}) => {
  const handleStartGame = (mode: GameMode) => {
    audioSynth.playCoin();
    onSelectMode(mode);
  };

  return (
    <div className="relative flex min-h-[82vh] flex-col items-center justify-center py-6 text-center">
      {/* Background Cyber Grid Accent */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
        <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 blur-3xl animate-pulse" />
      </div>

      {/* Main Title Badge */}
      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-4 py-1.5 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-arcade text-xs font-bold tracking-widest text-cyan-300">
            SYSTEM ONLINE // CHOREQUEST 2088
          </span>
        </div>

        <h1 className="font-arcade text-4xl font-black tracking-tight text-white drop-shadow-xl sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent neon-glow-cyan">
            LEDGER SLAYER
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">
          Procrastinating on 50 unreviewed receipts and forgotten subscriptions?
          <br className="hidden sm:inline" />
          <strong className="text-cyan-300"> Play a fast-paced cyber arcade game </strong>
          while real-world accounting execution happens automatically in the background.
        </p>

        {/* Big INSERT COIN / START Action */}
        <div className="pt-2">
          <button
            onClick={() => handleStartGame('ledger_blade')}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 px-8 py-4 font-arcade text-base font-black text-black shadow-2xl shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="h-6 w-6 fill-black transition group-hover:rotate-12" />
            <span>PRESS START // INSERT COIN</span>
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </button>
        </div>

        {/* Live Ledger Status Pill */}
        <div className="mx-auto flex max-w-md items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-400">Statement:</span>
            <span className="font-bold text-white">{currentDatasetName}</span>
          </div>
          <button
            onClick={onOpenDatasetModal}
            className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            Change / Upload CSV →
          </button>
        </div>

        {/* 3 Game Mode Cabinets */}
        <div className="mt-8 grid grid-cols-1 gap-5 text-left md:grid-cols-3">
          {/* Cabinet 1: Ledger Blade */}
          <div
            onClick={() => handleStartGame('ledger_blade')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400 hover:shadow-cyan-500/20 active:scale-98"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40 transition group-hover:scale-110">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-950 px-2 py-0.5 font-arcade text-[10px] font-bold text-cyan-300">
                ARCADE SLASHER
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <Flame className="h-3 w-3 fill-amber-400" /> Combos
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white group-hover:text-cyan-300">
              Ledger Blade
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Fast-paced conveyor slasher. Rapid-fire hotkeys <kbd className="font-mono text-cyan-300">[A, S, D, F]</kbd> or mouse drag to slice expenses, build streaks, and slay vampire subscriptions.
            </p>
            <div className="mt-4 flex items-center gap-1 font-arcade text-xs font-bold text-cyan-400 group-hover:underline">
              PLAY ARCADE MODE <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Cabinet 2: Cyber-Court */}
          <div
            onClick={() => handleStartGame('cyber_court')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-400 hover:shadow-purple-500/20 active:scale-98"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40 transition group-hover:scale-110">
              <Gavel className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-purple-950 px-2 py-0.5 font-arcade text-[10px] font-bold text-purple-300">
                STORY TRIBUNAL
              </span>
              <span className="text-[11px] font-bold text-purple-300">
                Branching Dialog
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white group-hover:text-purple-300">
              Cyber-Court
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Dystopian visual novel courtroom. Receipts take the stand, plea their case, and you can cross-examine their hidden motives before slamming the holographic gavel.
            </p>
            <div className="mt-4 flex items-center gap-1 font-arcade text-xs font-bold text-purple-400 group-hover:underline">
              ENTER THE COURTROOM <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Cabinet 3: Audit Sweeper */}
          <div
            onClick={() => handleStartGame('bullet_sweeper')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-blue-500/20 active:scale-98"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40 transition group-hover:scale-110">
              <Crosshair className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-950 px-2 py-0.5 font-arcade text-[10px] font-bold text-blue-300">
                BULLET SURVIVOR
              </span>
              <span className="text-[11px] font-bold text-cyan-300">
                EMP Power-Ups
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white group-hover:text-blue-300">
              Audit Sweeper
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Top-down 2D canvas arena. Pilot your drone with WASD/mouse, collect EMP blasts & Quantum Magnets, dodge laser firewalls, and vacuum up floating financial debris.
            </p>
            <div className="mt-4 flex items-center gap-1 font-arcade text-xs font-bold text-blue-400 group-hover:underline">
              LAUNCH DRONE ARENA <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Real-World Impact Features Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-8 sm:grid-cols-4 text-center">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3.5">
            <Sparkles className="mx-auto mb-1.5 h-5 w-5 text-cyan-400" />
            <div className="text-xs font-bold text-white">Real CSV Engine</div>
            <div className="text-[11px] text-slate-400">Every kill audits real data</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3.5">
            <Award className="mx-auto mb-1.5 h-5 w-5 text-pink-400" />
            <div className="text-xs font-bold text-white">Vampire Slayer</div>
            <div className="text-[11px] text-slate-400">Uncover zombie SaaS charges</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3.5">
            <Shield className="mx-auto mb-1.5 h-5 w-5 text-emerald-400" />
            <div className="text-xs font-bold text-white">Tax Write-Offs</div>
            <div className="text-[11px] text-slate-400">Maximize business refunds</div>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3.5">
            <FileSpreadsheet className="mx-auto mb-1.5 h-5 w-5 text-amber-400" />
            <div className="text-xs font-bold text-white">1-Click CPA Export</div>
            <div className="text-[11px] text-slate-400">Ready for accountant / taxes</div>
          </div>
        </div>
      </div>
    </div>
  );
};
