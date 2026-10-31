import React from 'react';
import { GameMode } from '../types/expense';
import { audioSynth } from '../services/audioSynth';
import {
  Gamepad2,
  BarChart3,
  UploadCloud,
  Volume2,
  VolumeX,
  HelpCircle,
  Clock,
  Zap,
  Flame,
  Sparkles,
  ChevronRight,
  Crosshair,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Mail,
  Trash2,
} from 'lucide-react';

interface SataHomeScreenProps {
  onNavigate: (mode: GameMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHowToPlay: () => void;
  totalExpensesCount: number;
}

export const SataHomeScreen: React.FC<SataHomeScreenProps> = ({
  onNavigate,
  isMuted,
  onToggleMute,
  onOpenHowToPlay,
  totalExpensesCount,
}) => {
  const handleLaunchGame = (mode: GameMode) => {
    audioSynth.playCyberSelect();
    onNavigate(mode);
  };

  return (
    <div className="relative min-h-screen w-full select-none overflow-x-hidden bg-[#060814] text-white flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* 1. Deep Cyber Grid Background with Glowing Perspective Mesh (Pure Clean CSS) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Deep ambient radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-purple-900/25 via-cyan-950/20 to-transparent blur-3xl" />
        
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 240, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient Floating Neon Nodes */}
        <div className="absolute top-[18%] left-[6%] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_15px_#00f0ff] animate-ping" />
        <div className="absolute top-[45%] right-[8%] h-2.5 w-2.5 rounded-full bg-pink-500 shadow-[0_0_18px_#ec4899] animate-pulse" />
        <div className="absolute bottom-[25%] left-[12%] h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-ping duration-1000" />
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-slate-800/80 pb-5">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/60 bg-cyan-950/50 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Zap className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_8px_#00f0ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-arcade text-2xl font-black tracking-wider text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]">
                Sata
              </span>
              <span className="rounded-md border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-mono-code font-bold text-cyan-300">
                CHORE BATTLE ARCHIVE
              </span>
            </div>
            <p className="text-[11px] font-mono-code tracking-widest text-slate-400">
              TURN CHORES INTO VICTORIES
            </p>
          </div>
        </div>

        {/* Right Header Navigation & Settings Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              audioSynth.playCyberHover();
              onNavigate('dashboard');
            }}
            aria-label="Open Audit Dashboard"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-arcade font-bold text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-300 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <span>DASHBOARD</span>
          </button>

          <button
            onClick={() => {
              audioSynth.playCyberHover();
              onNavigate('import_data');
            }}
            aria-label="Import Financial Statements"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-arcade font-bold text-slate-200 hover:border-pink-500/50 hover:bg-slate-800 hover:text-pink-300 transition focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <UploadCloud className="h-4 w-4 text-pink-400" />
            <span>IMPORT DATA</span>
          </button>

          <button
            onClick={() => {
              audioSynth.playCyberHover();
              onNavigate('history');
            }}
            aria-label="View Transaction Execution History"
            className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono-code font-semibold text-slate-300 hover:border-cyan-500/50 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>History</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            aria-label="Open Gameplay Guide and Tutorials"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-mono-code font-semibold text-slate-300 hover:border-purple-500/50 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <HelpCircle className="h-4 w-4 text-purple-400" />
            <span>Guide</span>
          </button>

          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute audio sound effects" : "Mute audio sound effects"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-cyan-500/50 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
            title="Audio Toggle"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* 3. Hero Intro & Mission Statement */}
      <section className="relative z-10 mx-auto max-w-6xl w-full pt-6 pb-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/40 px-3 py-1 text-[11px] font-mono-code text-purple-300 mb-2.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>REAL-WORLD BACKGROUND CHORE EXECUTION ENGINE</span>
            </div>
            <h1 className="font-arcade text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] tracking-wide">
              CHORE BATTLE ARCHIVES
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm font-mono-code text-slate-300">
              We all procrastinate on painful digital chores. Play fast-paced cyber arcade games—your 5,000 unread emails, zombie subscriptions, messy folders, and lint errors execute in the background!
            </p>
          </div>

          {/* Real Impact Summary Widget */}
          <div className="flex items-center justify-center sm:justify-end gap-3 font-mono-code">
            <div className="rounded-xl border border-slate-800 bg-black/60 px-4 py-2.5 text-center shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase">Backlog Chores</div>
              <div className="font-arcade text-sm font-bold text-cyan-300">{totalExpensesCount} Items</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-black/60 px-4 py-2.5 text-center shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase">Savings Vault</div>
              <div className="font-arcade text-sm font-bold text-pink-400">+$465/yr</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALL 4 GAMES FEATURED IN MAIN HUB (Matching "insert all games in main folder only") */}
      <main className="relative z-10 mx-auto max-w-6xl w-full py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          
          {/* GAME 1: SCATTER QUEEN 3D (3D Hypersonic Rail Starfighter Flight) */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-fuchsia-500/60 bg-gradient-to-br from-[#120626] via-[#090b1c] to-[#040612] p-6 shadow-[0_0_35px_rgba(217,70,239,0.25)] hover:border-fuchsia-400 hover:shadow-[0_0_50px_rgba(217,70,239,0.45)] transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-36 h-36 bg-fuchsia-600/10 rounded-full blur-2xl group-hover:bg-fuchsia-600/20 transition" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full border border-fuchsia-500/60 bg-fuchsia-950/60 px-3 py-0.5 text-[10px] font-arcade font-bold text-fuchsia-300 tracking-wider">
                  3D HYPERSONIC RAIL SHOOTER
                </span>
                <span className="text-[10px] font-mono-code text-cyan-400 font-bold">
                  ★ FEATURED
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/60 bg-fuchsia-950/60 text-fuchsia-300 shadow-[0_0_15px_#ff007f]">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-arcade text-xl sm:text-2xl font-black text-white group-hover:text-fuchsia-300 transition">
                    SCATTER QUEEN 3D
                  </h3>
                  <div className="text-xs font-mono-code text-fuchsia-300/80">
                    Procrastination Overload Destroyer
                  </div>
                </div>
              </div>

              <p className="text-xs font-mono-code text-slate-300 mb-4 leading-relaxed">
                Pilot starfighter into a neon cyber canyon! Shoot incoming spam swarms, dodge lasers, and eliminate 5,000 unread emails, zombie subscriptions, and disk clutter in real-time.
              </p>

              {/* Controls & Background Chores Executed */}
              <div className="rounded-xl border border-slate-800/80 bg-black/60 p-3 mb-4 space-y-1.5 font-mono-code text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Controls:</span>
                  <span className="text-cyan-300">WASD / Arrows Fly • Space / Click Shoot • E Missiles</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Chore Execution:</span>
                  <span className="text-emerald-400 font-bold">Auto-Purges Spam • Kills Vampire Subs • Cleans GBs</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchGame('scatter_queen')}
              aria-label="Launch 3D Starfighter Scatter Queen game"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 py-3.5 text-xs font-arcade font-black text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] hover:scale-[1.02] active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <span>LAUNCH 3D STARFIGHTER</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* GAME 2: AUDIT SWEEPER (2D Space Starfighter Orb Blaster) */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-cyan-500/60 bg-gradient-to-br from-[#061426] via-[#090b1c] to-[#040612] p-6 shadow-[0_0_35px_rgba(0,240,255,0.2)] hover:border-cyan-400 hover:shadow-[0_0_50px_rgba(0,240,255,0.4)] transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/20 transition" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full border border-cyan-500/60 bg-cyan-950/60 px-3 py-0.5 text-[10px] font-arcade font-bold text-cyan-300 tracking-wider">
                  2D SPACE STARFIGHTER
                </span>
                <span className="text-[10px] font-mono-code text-emerald-400 font-bold">
                  5 WAVES
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/60 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_#00f0ff]">
                  <Crosshair className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-arcade text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition">
                    AUDIT SWEEPER
                  </h3>
                  <div className="text-xs font-mono-code text-cyan-300/80">
                    Debt Debris & Clutter Blaster
                  </div>
                </div>
              </div>

              <p className="text-xs font-mono-code text-slate-300 mb-4 leading-relaxed">
                Pilot delta-wing starfighter in a cyber grid arena. Unleash rapid plasma blasters and tractor vacuum beams to destroy financial clutter orbs across 5 intense arcade waves!
              </p>

              {/* Controls & Background Chores Executed */}
              <div className="rounded-xl border border-slate-800/80 bg-black/60 p-3 mb-4 space-y-1.5 font-mono-code text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Controls:</span>
                  <span className="text-cyan-300">WASD / Steer • Click & Hold Rapid Blasters • Powerups</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Chore Execution:</span>
                  <span className="text-emerald-400 font-bold">Tags Business Tax Write-offs • Flags Suspicious</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchGame('bullet_sweeper')}
              aria-label="Launch 2D Audit Sweeper starfighter game"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-500 py-3.5 text-xs font-arcade font-black text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <span>LAUNCH AUDIT SWEEPER</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* GAME 3: LEDGER BLADE (4-Lane Rhythm Slasher) */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-[#061e16] via-[#090b1c] to-[#040612] p-6 shadow-[0_0_35px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:shadow-[0_0_50px_rgba(16,185,129,0.35)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full border border-emerald-500/60 bg-emerald-950/60 px-3 py-0.5 text-[10px] font-arcade font-bold text-emerald-300 tracking-wider">
                  4-LANE RHYTHM SLASHER
                </span>
                <span className="text-[10px] font-mono-code text-emerald-300 font-bold">
                  BEAT SYNC
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/60 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_#10b981]">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-arcade text-xl sm:text-2xl font-black text-white group-hover:text-emerald-300 transition">
                    LEDGER BLADE
                  </h3>
                  <div className="text-xs font-mono-code text-emerald-300/80">
                    High-Speed Synthwave Highway
                  </div>
                </div>
              </div>

              <p className="text-xs font-mono-code text-slate-300 mb-4 leading-relaxed">
                Transactions fly towards you along high-speed neon highway tracks to the synthwave beat! Tap A / S / D / F to slash, sort, and classify before cards cross the line.
              </p>

              <div className="rounded-xl border border-slate-800/80 bg-black/60 p-3 mb-4 space-y-1.5 font-mono-code text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Keymap:</span>
                  <span className="text-emerald-300">A (Business) • S (Personal) • D (Cancel) • F (Flag)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Combo Bonus:</span>
                  <span className="text-amber-400 font-bold">Multiplier x16 Streak • Precision Timing</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchGame('ledger_blade')}
              aria-label="Launch Ledger Blade 4-lane rhythm game"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 py-3.5 text-xs font-arcade font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <span>LAUNCH LEDGER BLADE</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* GAME 4: CYBER-COURT (Visual Novel AI Tribunal) */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-purple-500/50 bg-gradient-to-br from-[#160a26] via-[#090b1c] to-[#040612] p-6 shadow-[0_0_35px_rgba(168,85,247,0.2)] hover:border-purple-400 hover:shadow-[0_0_50px_rgba(168,85,247,0.35)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full border border-purple-500/60 bg-purple-950/60 px-3 py-0.5 text-[10px] font-arcade font-bold text-purple-300 tracking-wider">
                  VISUAL NOVEL TRIBUNAL
                </span>
                <span className="text-[10px] font-mono-code text-purple-300 font-bold">
                  STORY MODE
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-400/60 bg-purple-950/60 text-purple-300 shadow-[0_0_15px_#a855f7]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-arcade text-xl sm:text-2xl font-black text-white group-hover:text-purple-300 transition">
                    CYBER-COURT
                  </h3>
                  <div className="text-xs font-mono-code text-purple-300/80">
                    Anime Auditor & Subscription Tribunal
                  </div>
                </div>
              </div>

              <p className="text-xs font-mono-code text-slate-300 mb-4 leading-relaxed">
                Every transaction has a story. Step into the courtroom with your cybernetic co-auditor. Interrogate suspicious charges, review forgotten subscriptions, and pass judgment!
              </p>

              <div className="rounded-xl border border-slate-800/80 bg-black/60 p-3 mb-4 space-y-1.5 font-mono-code text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Mechanics:</span>
                  <span className="text-purple-300">Interactive Dialogue • Evidence Review • Verdict Buttons</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Chore Execution:</span>
                  <span className="text-pink-400 font-bold">Cancels Dormant Subscriptions • Recovers Lost Cash</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchGame('cyber_court')}
              aria-label="Launch Cyber-Court Anime Tribunal game"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 py-3.5 text-xs font-arcade font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <span>LAUNCH CYBER-COURT</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </main>

      {/* 5. Bottom Navigation & Tools Bar */}
      <footer className="relative z-10 mx-auto max-w-6xl w-full border-t border-slate-800/80 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-code text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span>Sata Procrastination Engine v2.4 • All Systems Online</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              aria-label="Navigate to Audit Dashboard"
              className="hover:text-cyan-300 transition focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded px-1"
            >
              Audit Dashboard
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('import_data')}
              aria-label="Navigate to Import Statements"
              className="hover:text-pink-300 transition focus:outline-none focus:ring-1 focus:ring-pink-400 rounded px-1"
            >
              Import Statements
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('history')}
              aria-label="Navigate to Execution History"
              className="hover:text-white transition focus:outline-none focus:ring-1 focus:ring-white rounded px-1"
            >
              Execution History
            </button>
            <span>•</span>
            <button
              onClick={onOpenHowToPlay}
              aria-label="Open How to Play modal"
              className="hover:text-purple-300 transition focus:outline-none focus:ring-1 focus:ring-purple-400 rounded px-1"
            >
              How to Play
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
