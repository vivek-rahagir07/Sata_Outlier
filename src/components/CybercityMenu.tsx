import React, { useState, useEffect, useRef, useMemo } from 'react';
import cybercityBg from '../assets/cybercity-bg.jpg';
import { audioSynth } from '../services/audioSynth';
import { GameMode, ExpenseItem, DecisionBucket } from '../types/expense';
import { SAMPLE_DATASETS } from '../services/sampleData';
import {
  Gamepad2,
  Volume2,
  VolumeX,
  Music,
  Monitor,
  Sparkles,
  Sliders,
  X,
  Play,
  RotateCcw,
  Shield,
  Zap,
  Terminal,
  Crosshair,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Award,
  Layers,
  HelpCircle,
  AlertTriangle,
  BarChart3,
  UploadCloud,
  Clock,
  ArrowRight,
  DollarSign
} from 'lucide-react';

export type CybercityAction =
  | 'continue'
  | 'load_game'
  | 'new_game'
  | 'settings'
  | 'quit_game'
  | 'sata_auditor';

interface CybercityMenuProps {
  onContinue: () => void;
  onNewGame: () => void;
  onLaunchGame?: (mode: GameMode) => void;
  expenses?: ExpenseItem[];
  onAuditDecision?: (expenseId: string, decision: DecisionBucket) => void;
  onResetExpenses?: () => void;
  onSelectDataset?: (name: string, items: ExpenseItem[]) => void;
  currentDatasetName?: string;
  onOpenSettings?: () => void;
  onOpenSata?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
}

export const CybercityMenu: React.FC<CybercityMenuProps> = ({
  onContinue,
  onNewGame,
  onLaunchGame,
  expenses = [],
  onAuditDecision,
  onResetExpenses,
  onSelectDataset,
  currentDatasetName = 'Freelance Tech Creator',
  onOpenSata,
  isMuted,
  onToggleMute,
  crtEnabled,
  onToggleCrt,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeModal, setActiveModal] = useState<CybercityAction | null>(null);
  const [sataAuditorTab, setSataAuditorTab] = useState<'battles' | 'dashboard' | 'import' | 'history' | 'guide'>('battles');
  const [isBgmActive, setIsBgmActive] = useState(false);

  // Live Stats computed for Sata Auditor Console
  const liveStats = useMemo(() => {
    let auditedCount = 0;
    let totalAmount = 0;
    let savingsAmount = 0;
    let taxDeductible = 0;

    expenses.forEach((e) => {
      totalAmount += e.amount;
      if (e.status === 'audited') {
        auditedCount++;
        if (e.decision === 'vampire_cancel') savingsAmount += e.amount * 12;
        if (e.decision === 'tax_deductible') taxDeductible += e.amount;
      }
    });

    const accuracy = expenses.length > 0 ? Math.round((auditedCount / expenses.length) * 100) : 86;

    return {
      totalAmount: totalAmount || 12480,
      savingsAmount: savingsAmount || 1284,
      taxDeductible: taxDeductible || 2320,
      accuracy: accuracy || 86,
      auditedCount,
      totalCount: expenses.length || 25,
    };
  }, [expenses]);
  const [rainIntensity, setRainIntensity] = useState<number>(85);
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);
  const [chromaticAberration, setChromaticAberration] = useState<boolean>(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'audio' | 'video' | 'controls'>('audio');
  const [masterVolume, setMasterVolume] = useState<number>(80);
  const [sfxVolume, setSfxVolume] = useState<number>(90);

  // New Game selection state
  const [selectedClass, setSelectedClass] = useState<'samurai' | 'netrunner' | 'corpo'>('netrunner');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'tourist' | 'hardwired' | 'psycho'>('hardwired');

  // Load Game selection state
  const [selectedSaveSlot, setSelectedSaveSlot] = useState<number>(1);

  // Canvas ref for animated rain & reflections
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keyIndicatorPressedRef = useRef<{ nav: boolean; sel: boolean }>({ nav: false, sel: false });
  const [keyVisuals, setKeyVisuals] = useState<{ nav: boolean; sel: boolean }>({ nav: false, sel: false });

  const menuItems: { id: CybercityAction; label: string; sub: string }[] = [
    { id: 'continue', label: 'Continue', sub: 'Resume Sector 07 Infiltration' },
    { id: 'load_game', label: 'Load game', sub: 'Access Cyber-Save Memory Banks' },
    { id: 'new_game', label: 'New game', sub: 'Initialize Fresh Neural Construct' },
    { id: 'settings', label: 'Settings', sub: 'Audio, Visuals & Interface Config' },
    { id: 'quit_game', label: 'Quit game', sub: 'Sever Neural Link Connection' },
  ];

  // Animated Rain, Puddle Ripples, and Steam Fog on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Raindrops
    const rainCount = Math.floor((width * height) / 3800) * (rainIntensity / 50);
    interface Drop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      thickness: number;
      color: string;
    }

    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
      color: string;
    }

    const colors = ['rgba(0, 240, 255, ', 'rgba(255, 59, 178, ', 'rgba(168, 85, 247, ', 'rgba(255, 255, 255, '];

    const drops: Drop[] = [];
    for (let i = 0; i < rainCount; i++) {
      drops.push({
        x: Math.random() * (width + 300) - 150,
        y: Math.random() * height,
        length: 18 + Math.random() * 26,
        speed: 16 + Math.random() * 14,
        opacity: 0.15 + Math.random() * 0.45,
        thickness: 0.8 + Math.random() * 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const ripples: Ripple[] = [];

    // Steam/fog particles rising from wet asphalt
    interface Mist {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
    }
    const mists: Mist[] = [];
    for (let i = 0; i < 25; i++) {
      mists.push({
        x: Math.random() * width,
        y: height * 0.65 + Math.random() * (height * 0.35),
        radius: 40 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.3,
        opacity: 0.03 + Math.random() * 0.05,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle rising neon steam on wet road
      mists.forEach((m) => {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < height * 0.55) {
          m.y = height + 20;
          m.x = Math.random() * width;
        }

        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
        grad.addColorStop(0, `rgba(168, 85, 247, ${m.opacity})`);
        grad.addColorStop(0.5, `rgba(0, 240, 255, ${m.opacity * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw raindrops
      ctx.lineWidth = 1;
      drops.forEach((d) => {
        d.x += 2.8; // diagonal wind
        d.y += d.speed;

        // Ground collision splash
        if (d.y > height * 0.65 && Math.random() < 0.08) {
          if (ripples.length < 40) {
            ripples.push({
              x: d.x,
              y: d.y + (Math.random() * 20 - 10),
              radius: 1,
              maxRadius: 8 + Math.random() * 16,
              opacity: 0.5,
              color: d.color,
            });
          }
        }

        if (d.y > height || d.x > width + 100) {
          d.y = -30;
          d.x = Math.random() * (width + 300) - 200;
        }

        ctx.strokeStyle = `${d.color}${d.opacity})`;
        ctx.lineWidth = d.thickness;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 3, d.y + d.length);
        ctx.stroke();
      });

      // Draw puddle ripples on the asphalt
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.8;
        r.opacity *= 0.94;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius * 2, r.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color}${r.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        if (r.opacity < 0.02 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [rainIntensity]);

  // Keyboard navigation & Gamepad polling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open
      if (activeModal) {
        if (e.key === 'Escape') {
          audioSynth.playCyberBack();
          setActiveModal(null);
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        audioSynth.playCyberHover();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
        triggerKeyVisual('nav');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        audioSynth.playCyberHover();
        setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
        triggerKeyVisual('nav');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerKeyVisual('sel');
        triggerMenuAction(menuItems[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Gamepad API polling loop
    let lastButtonPress = 0;
    let gamepadPollId: number;

    const pollGamepad = () => {
      const now = performance.now();
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1];

      if (gp && now - lastButtonPress > 200) {
        // D-Pad Up or Left Stick Up
        if (gp.buttons[12]?.pressed || (gp.axes[1] && gp.axes[1] < -0.5)) {
          audioSynth.playCyberHover();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
          triggerKeyVisual('nav');
          lastButtonPress = now;
        }
        // D-Pad Down or Left Stick Down
        else if (gp.buttons[13]?.pressed || (gp.axes[1] && gp.axes[1] > 0.5)) {
          audioSynth.playCyberHover();
          setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
          triggerKeyVisual('nav');
          lastButtonPress = now;
        }
        // A / Cross button (Button 0)
        else if (gp.buttons[0]?.pressed) {
          triggerKeyVisual('sel');
          triggerMenuAction(menuItems[selectedIndex].id);
          lastButtonPress = now;
        }
        // B / Circle button (Button 1) -> Close modal
        else if (gp.buttons[1]?.pressed && activeModal) {
          audioSynth.playCyberBack();
          setActiveModal(null);
          lastButtonPress = now;
        }
      }

      gamepadPollId = requestAnimationFrame(pollGamepad);
    };

    gamepadPollId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(gamepadPollId);
    };
  }, [selectedIndex, activeModal, menuItems]);

  const triggerKeyVisual = (type: 'nav' | 'sel') => {
    setKeyVisuals((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setKeyVisuals((prev) => ({ ...prev, [type]: false }));
    }, 220);
  };

  const triggerMenuAction = (id: CybercityAction) => {
    audioSynth.playCyberSelect();
    if (id === 'continue') {
      onContinue();
    } else if (id === 'new_game') {
      onNewGame();
    } else if (id === 'load_game') {
      setActiveModal('load_game');
    } else if (id === 'settings') {
      setActiveModal('settings');
    } else if (id === 'quit_game') {
      setActiveModal('quit_game');
    }
  };

  const handleToggleBgm = () => {
    const active = audioSynth.toggleMusic();
    setIsBgmActive(active);
  };

  return (
    <div
      className={`relative min-h-screen w-full select-none overflow-hidden bg-black text-white ${
        chromaticAberration ? 'filter contrast-110 saturate-125' : ''
      }`}
      style={{
        backgroundImage: `url(${cybercityBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dynamic Animated Canvas Layer: Rain, Splash Ripples, Ambient Mist */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-90"
      />

      {/* Optional CRT Scanlines Layer */}
      {crtEnabled && <div className="scanlines absolute inset-0 z-30 pointer-events-none" />}

      {/* Atmospheric Vignette & Color Grading Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.85)',
        }}
      />

      {/* LEFT GLASSMORPHIC HUD STRIP & MENU */}
      <div className="relative z-20 flex h-screen w-full max-w-2xl flex-col justify-between cyber-hud-glass px-6 py-6 sm:px-12 sm:py-8 md:w-[48%] lg:w-[42%] overflow-hidden">
        
        {/* Top Header: Logo + Edition */}
        <div className="pt-2 sm:pt-6">
          {/* Brand Telemetry Metadata */}
          <div className="mb-3 flex items-center gap-3 text-[10px] tracking-widest text-cyan-400/80 font-mono-code">
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SYS.VER // 2.0.89-RELEASE</span>
            <span className="text-pink-500/60">|</span>
            <span className="hidden sm:inline">SECTOR 07 // RAIN SENSOR: {rainIntensity}%</span>
          </div>

          {/* CYBERCITY LOGO (Bold italic retro-synthwave with laser slash) */}
          <div className="relative inline-block">
            <h1 className="cybercity-logo text-5xl sm:text-6xl md:text-7xl font-black">
              CYBERCITY
            </h1>

            {/* "Edition 2.0" cursive signature font */}
            <div className="relative -mt-3 ml-12 sm:ml-20">
              <span className="edition-script text-3xl sm:text-4xl md:text-5xl">
                Edition 2.0
              </span>
            </div>
          </div>
        </div>

        {/* Brand Icon Glyphs (Sneaker neon badge & script tag on left) */}
        <div className="pointer-events-none absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 opacity-80">
          {/* Cyber sneaker glowing emblem */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-500/40 bg-pink-950/30 p-1.5 shadow-[0_0_15px_rgba(255,0,128,0.4)] backdrop-blur-md">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 stroke-pink-400 fill-none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.5 13h17l-1.5-6h-7l-1 3h-5l-2.5 3z" />
              <path d="M2 17h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z" />
              <circle cx="7" cy="17" r="1.5" />
              <circle cx="17" cy="17" r="1.5" />
              <path d="M7 10l2 3" />
            </svg>
          </div>

          {/* Glowing script mini badge */}
          <div className="font-cyber-script text-xs text-pink-400 drop-shadow-[0_0_8px_rgba(255,59,178,0.8)] -rotate-90 tracking-wider">
            Roots Tokyo
          </div>
        </div>

        {/* Center: The Main Game Menu */}
        <div className="my-auto py-8 pl-4 sm:pl-6">
          <nav className="flex flex-col gap-3.5 sm:gap-4 max-w-md">
            {menuItems.map((item, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => {
                    if (selectedIndex !== index) {
                      audioSynth.playCyberHover();
                      setSelectedIndex(index);
                    }
                  }}
                  onClick={() => triggerMenuAction(item.id)}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-2xl px-6 py-3.5 sm:px-7 sm:py-4 transition-all duration-200 ${
                    isSelected
                      ? 'cyber-menu-active scale-[1.03] translate-x-1.5'
                      : 'cyber-menu-inactive hover:translate-x-2'
                  }`}
                >
                  {/* Left Label */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-cyber-menu text-2xl sm:text-3xl font-bold tracking-wide transition-colors ${
                        isSelected ? 'text-white' : 'text-cyan-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Active Indicator Pulse Glow */}
                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff] animate-ping" />
                      <span className="font-mono-code text-[11px] font-bold text-cyan-200 tracking-wider opacity-90 hidden sm:inline">
                        ENTER ↵
                      </span>
                    </div>
                  )}

                  {/* High-tech border highlight accent on hover */}
                  <div
                    className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      background:
                        'radial-gradient(circle at 10% 50%, rgba(0, 240, 255, 0.25), transparent 70%)',
                    }}
                  />
                </div>
              );
            })}
          </nav>
        </div>

        {/* Quick Footer Utilities */}
        <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                isMuted
                  ? 'bg-red-950/60 text-red-400 border border-red-500/40'
                  : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60'
              }`}
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span>{isMuted ? 'MUTED' : 'AUDIO'}</span>
            </button>

            <button
              onClick={handleToggleBgm}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                isBgmActive
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-700 hover:text-white'
              }`}
              title="Toggle Synthwave BGM Generator"
            >
              <Music className={`h-4 w-4 ${isBgmActive ? 'animate-bounce' : ''}`} />
              <span>{isBgmActive ? 'SYNTH: ON' : 'SYNTH: OFF'}</span>
            </button>

            <button
              onClick={() => {
                audioSynth.playCyberSelect();
                setActiveModal('sata_auditor');
              }}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/60 bg-cyan-950/70 px-3 py-1.5 text-xs font-arcade font-bold text-cyan-300 hover:bg-cyan-900/80 hover:scale-105 shadow-[0_0_15px_rgba(0,240,255,0.35)] transition cursor-pointer"
              title="Access Sata Chore Battles & Financial Audit Suite"
            >
              <span>⚡</span>
              <span>SATA AUDITOR</span>
            </button>
          </div>

          <div className="font-mono-code text-[11px] text-cyan-400/70 hidden sm:block">
            NEURAL_SYNC: 99.4%
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT CONTROLLER HUD (Matches Reference Image) */}
      <div className="fixed bottom-6 right-8 z-30 flex items-center gap-6 rounded-2xl border border-cyan-500/30 bg-slate-950/70 px-6 py-3 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md">
        {/* NAVIGATE D-PAD */}
        <div
          className={`flex items-center gap-2.5 transition-all duration-150 ${
            keyVisuals.nav ? 'scale-110 text-cyan-200' : 'text-slate-300'
          }`}
        >
          {/* D-Pad Icon */}
          <div className="relative flex h-6 w-6 items-center justify-center">
            <div className="h-5 w-1.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <div className="absolute h-1.5 w-5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          </div>
          <span className="font-arcade text-xs font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
            NAVIGATE
          </span>
        </div>

        {/* DIVIDER */}
        <div className="h-4 w-px bg-slate-700" />

        {/* SELECT 'X' BUTTON */}
        <div
          className={`flex items-center gap-2.5 transition-all duration-150 ${
            keyVisuals.sel ? 'scale-110 text-cyan-200' : 'text-slate-300'
          }`}
        >
          {/* PlayStation 'X' Button Ring */}
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400 bg-cyan-950/50 shadow-[0_0_8px_#00f0ff]">
            <X className="h-3.5 w-3.5 stroke-[3] text-cyan-300" />
          </div>
          <span className="font-arcade text-xs font-bold tracking-widest text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
            SELECT
          </span>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE MODALS FOR EACH MENU OPTION
          ========================================================================= */}

      {/* 1. CONTINUE SESSION MODAL */}
      {activeModal === 'continue' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-cyan-500/50 bg-gradient-to-b from-slate-900/95 via-purple-950/40 to-slate-950/95 p-8 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
            {/* Close Button */}
            <button
              onClick={() => {
                audioSynth.playCyberBack();
                setActiveModal(null);
              }}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 text-cyan-400 font-mono-code text-xs mb-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>SAVED COGNITIVE SNAPSHOT FOUND</span>
            </div>

            <h2 className="font-arcade text-3xl font-black text-white neon-glow-cyan mb-4">
              RESUME NEURAL RUN
            </h2>

            {/* Profile / Save Snapshot Card */}
            <div className="space-y-4 rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-slate-400 font-mono-code">LOCATION</div>
                  <div className="text-base font-bold text-white">Neo-Shinjuku Sector 07 // Night District</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono-code">PLAYTIME</div>
                  <div className="text-base font-bold text-cyan-300">42h 18m</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="text-[10px] text-slate-400 font-mono-code">OPERATIVE</div>
                  <div className="text-sm font-bold text-purple-300">V-07 Netrunner</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="text-[10px] text-slate-400 font-mono-code">LEVEL / SYNC</div>
                  <div className="text-sm font-bold text-cyan-300">LVL 38 (98%)</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="text-[10px] text-slate-400 font-mono-code">CREDITS</div>
                  <div className="text-sm font-bold text-amber-300">84,200 ED</div>
                </div>
              </div>

              <div className="rounded-xl bg-purple-950/30 border border-purple-500/30 p-3.5 text-xs text-purple-200">
                <strong className="text-purple-300">Current Objective:</strong> Infiltrate the Arasaka Subnet node and decrypt 48 pending transaction logs without tripping ICE detection.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                onClick={() => {
                  audioSynth.playCyberBack();
                  setActiveModal(null);
                }}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-arcade font-bold text-slate-300 hover:bg-slate-800"
              >
                [ESC] CANCEL
              </button>
              <button
                onClick={() => {
                  audioSynth.playCyberSelect();
                  setActiveModal(null);
                  onContinue();
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 px-7 py-3 text-xs font-arcade font-black text-black shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95 transition"
              >
                <Play className="h-4 w-4 fill-black" />
                <span>[ENTER] DEPLOY NOW</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOAD GAME MODAL */}
      {activeModal === 'load_game' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/50 bg-gradient-to-b from-slate-900/95 via-purple-950/40 to-slate-950/95 p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                audioSynth.playCyberBack();
                setActiveModal(null);
              }}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-arcade text-3xl font-black text-white neon-glow-pink mb-2">
              LOAD CYBER-SAVE
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-mono-code">
              SELECT NEURAL MEMORY BANK TO RESTORE RUN CONTEXT
            </p>

            {/* Save Slots */}
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  type: 'AUTOSAVE',
                  location: 'Downtown Neon Strip // Rain Station',
                  level: 38,
                  playtime: '42h 18m',
                  date: 'Today, 12:44 PM',
                  desc: 'Cleared 32 rogue expense drones. Next checkpoint reached.',
                },
                {
                  id: 2,
                  type: 'MANUAL SAVE',
                  location: 'Arasaka Skyline Penthouse',
                  level: 35,
                  playtime: '36h 02m',
                  date: 'Yesterday, 9:20 PM',
                  desc: 'Boss encounter primed: The Chief Auditor awaits.',
                },
                {
                  id: 3,
                  type: 'CHECKPOINT',
                  location: 'Underground Data Canal 03',
                  level: 28,
                  playtime: '24h 50m',
                  date: '3 days ago',
                  desc: 'Decrypted 150 legacy receipts. All systems green.',
                },
                {
                  id: 4,
                  type: 'EMPTY SLOT',
                  location: 'Memory Bank Empty',
                  level: 0,
                  playtime: '--',
                  date: '--',
                  desc: 'Available for cloud neural snapshot backup.',
                },
              ].map((slot) => {
                const isSelected = selectedSaveSlot === slot.id;
                const isEmpty = slot.type === 'EMPTY SLOT';

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (!isEmpty) {
                        audioSynth.playCyberHover();
                        setSelectedSaveSlot(slot.id);
                      }
                    }}
                    className={`rounded-2xl border p-4.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                        : isEmpty
                        ? 'border-slate-800 bg-slate-900/30 opacity-60 cursor-not-allowed'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-arcade font-bold ${
                            slot.type === 'AUTOSAVE'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : isEmpty
                              ? 'bg-slate-800 text-slate-500'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          SLOT {slot.id} // {slot.type}
                        </span>
                        <span className="text-sm font-bold text-white">{slot.location}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono-code">{slot.date}</span>
                    </div>

                    {!isEmpty && (
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                        <span className="text-slate-400">{slot.desc}</span>
                        <span className="font-mono-code text-cyan-300 font-bold">
                          LVL {slot.level} • {slot.playtime}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  audioSynth.playCyberBack();
                  setActiveModal(null);
                }}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-arcade font-bold text-slate-300 hover:bg-slate-800"
              >
                BACK
              </button>
              <button
                onClick={() => {
                  audioSynth.playCyberSelect();
                  setActiveModal(null);
                  onContinue();
                }}
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-7 py-3 text-xs font-arcade font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] transition"
              >
                <span>RESTORE SELECTED SAVE</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEW GAME MODAL */}
      {activeModal === 'new_game' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/50 bg-gradient-to-b from-slate-900/95 via-cyan-950/30 to-slate-950/95 p-8 shadow-[0_0_50px_rgba(0,240,255,0.3)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                audioSynth.playCyberBack();
                setActiveModal(null);
              }}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-arcade text-3xl font-black text-white neon-glow-cyan mb-2">
              INITIALIZE NEW CONSTRUCT
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-mono-code">
              SELECT YOUR OPERATIVE ARCHETYPE AND NEURAL DIFFICULTY
            </p>

            {/* Class Selection */}
            <div className="mb-6">
              <label className="text-xs font-arcade text-cyan-300 tracking-wider mb-3 block">
                1. CHOOSE OPERATIVE CLASS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'samurai' as const,
                    name: 'Street Samurai',
                    perk: '+35% Blade Sweep Speed',
                    icon: Zap,
                    desc: 'Master of lightning melee cuts. Slices rogue subscriptions before they bill.',
                  },
                  {
                    id: 'netrunner' as const,
                    name: 'Netrunner',
                    perk: 'Auto-detect Tax Writeoffs',
                    icon: Terminal,
                    desc: 'Deep-dives into bank feeds and detects anomalous recurring micro-charges.',
                  },
                  {
                    id: 'corpo' as const,
                    name: 'Corpo Fixer',
                    perk: 'x2 Audit Multiplier',
                    icon: Shield,
                    desc: 'Armed with executive clearance. Negotiates high-value bill cancellations.',
                  },
                ].map((c) => {
                  const isSelected = selectedClass === c.id;
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        audioSynth.playCyberHover();
                        setSelectedClass(c.id);
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_18px_rgba(0,240,255,0.35)] scale-[1.02]'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-white text-sm mb-1">{c.name}</div>
                      <div className="text-[11px] font-mono-code text-cyan-300 mb-2">{c.perk}</div>
                      <div className="text-[11px] text-slate-400 leading-snug">{c.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="text-xs font-arcade text-cyan-300 tracking-wider mb-3 block">
                2. SELECT PROTOCOL DIFFICULTY
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'tourist' as const, label: 'Tourist', sub: 'Relaxed pacing & hints' },
                  { id: 'hardwired' as const, label: 'Hardwired', sub: 'Standard arcade speed' },
                  { id: 'psycho' as const, label: 'Psycho', sub: 'High risk permadeath' },
                ].map((d) => {
                  const isSelected = selectedDifficulty === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        audioSynth.playCyberHover();
                        setSelectedDifficulty(d.id);
                      }}
                      className={`cursor-pointer rounded-xl border p-3 text-center transition ${
                        isSelected
                          ? 'border-pink-500 bg-pink-950/40 text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.35)]'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-arcade text-xs font-bold">{d.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{d.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  audioSynth.playCyberBack();
                  setActiveModal(null);
                }}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-arcade font-bold text-slate-300 hover:bg-slate-800"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  audioSynth.playCyberSelect();
                  setActiveModal(null);
                  onNewGame();
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 text-xs font-arcade font-bold text-white shadow-[0_0_20px_rgba(255,0,128,0.5)] transition hover:scale-105 active:scale-95"
              >
                <span>START NEW CAMPAIGN</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-cyan-500/50 bg-gradient-to-b from-slate-900/95 via-purple-950/40 to-slate-950/95 p-8 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
            <button
              onClick={() => {
                audioSynth.playCyberBack();
                setActiveModal(null);
              }}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-arcade text-3xl font-black text-white neon-glow-cyan mb-2">
              SYSTEM CONFIG
            </h2>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-3 mb-6">
              {[
                { id: 'audio' as const, label: 'Audio', icon: Volume2 },
                { id: 'video' as const, label: 'Graphics', icon: Monitor },
                { id: 'controls' as const, label: 'Controls', icon: Gamepad2 },
              ].map((tab) => {
                const isSelected = activeSettingsTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      audioSynth.playCyberHover();
                      setActiveSettingsTab(tab.id);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-arcade transition ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: AUDIO */}
            {activeSettingsTab === 'audio' && (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono-code mb-2 text-slate-300">
                    <span>MASTER GAIN</span>
                    <span className="text-cyan-400">{masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMasterVolume(val);
                      audioSynth.setMasterVolume(val / 100);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono-code mb-2 text-slate-300">
                    <span>SFX SYNTHESIZER GAIN</span>
                    <span className="text-pink-400">{sfxVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVolume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSfxVolume(val);
                      audioSynth.setSFXVolume(val / 100);
                    }}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div>
                    <div className="text-sm font-bold text-white">Procedural Synthwave Ambient</div>
                    <div className="text-xs text-slate-400 font-mono-code">Analog 80s bassline & neon chords</div>
                  </div>
                  <button
                    onClick={handleToggleBgm}
                    className={`rounded-xl px-4 py-2 font-arcade text-xs font-bold transition ${
                      isBgmActive
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                        : 'border border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isBgmActive ? 'ACTIVE' : 'MUTED'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VIDEO */}
            {activeSettingsTab === 'video' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div>
                    <div className="text-sm font-bold text-white">CRT Scanlines & Phosphor Mask</div>
                    <div className="text-xs text-slate-400 font-mono-code">Simulate retro cyberpunk arcade monitor</div>
                  </div>
                  <button
                    onClick={onToggleCrt}
                    className={`rounded-xl px-4 py-2 font-arcade text-xs font-bold transition ${
                      crtEnabled
                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                        : 'border border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    {crtEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono-code mb-2 text-slate-300">
                    <span>DYNAMIC RAIN INTENSITY</span>
                    <span className="text-cyan-400">{rainIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={rainIntensity}
                    onChange={(e) => setRainIntensity(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div>
                    <div className="text-sm font-bold text-white">Chromatic Glitch Filter</div>
                    <div className="text-xs text-slate-400 font-mono-code">Subtle RGB displacement & saturation</div>
                  </div>
                  <button
                    onClick={() => {
                      audioSynth.playCyberHover();
                      setChromaticAberration(!chromaticAberration);
                    }}
                    className={`rounded-xl px-4 py-2 font-arcade text-xs font-bold transition ${
                      chromaticAberration
                        ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(255,0,128,0.5)]'
                        : 'border border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    {chromaticAberration ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CONTROLS */}
            {activeSettingsTab === 'controls' && (
              <div className="space-y-3 font-mono-code text-xs">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="text-cyan-300 font-arcade text-sm font-bold">KEYBOARD SHORTCUTS</div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Navigate Menu</span>
                    <span className="text-white font-bold">↑ / ↓ or W / S</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Confirm / Select</span>
                    <span className="text-cyan-300 font-bold">ENTER / SPACE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Back / Close Modal</span>
                    <span className="text-pink-400 font-bold">ESCAPE</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="text-purple-300 font-arcade text-sm font-bold">GAMEPAD MAPPING</div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Move Selection</span>
                    <span className="text-white font-bold">D-Pad / Left Thumbstick</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Execute Action</span>
                    <span className="text-cyan-300 font-bold">A / Cross (Button 0)</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  audioSynth.playCyberBack();
                  setActiveModal(null);
                }}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-xs font-arcade font-bold text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] transition"
              >
                APPLY & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. QUIT GAME CONFIRMATION MODAL */}
      {activeModal === 'quit_game' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-red-500/50 bg-gradient-to-b from-slate-900/95 via-red-950/30 to-slate-950/95 p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/40 bg-red-950/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h3 className="font-arcade text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] mb-2">
              DISCONNECT NEURAL LINK?
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-mono-code mb-6">
              Cognitive cache will be safely detached from Sector 07 subnet. Are you sure you wish to return to meatspace?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  audioSynth.playCyberBack();
                  setActiveModal(null);
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-arcade font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                [ESC] CANCEL
              </button>
              <button
                onClick={() => {
                  audioSynth.playCyberGlitch();
                  setActiveModal(null);
                  window.location.reload();
                }}
                className="rounded-xl bg-red-600 hover:bg-red-500 px-6 py-2.5 text-xs font-arcade font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] transition"
              >
                TERMINATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FULLY INTEGRATED SATA AUDITOR & CHORE BATTLES SUITE (Directly Inside Cybercity) */}
      {activeModal === 'sata_auditor' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-3xl border border-cyan-500/60 bg-gradient-to-b from-[#0c0620]/95 via-[#080d1e]/95 to-[#040714]/95 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,240,255,0.35)] max-h-[92vh] flex flex-col justify-between overflow-hidden">
            
            {/* Top Bar: Sata Brand, Tabs & Close Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/60 bg-cyan-950/60 shadow-[0_0_15px_#00f0ff]">
                  <Zap className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-arcade text-xl font-black tracking-wider text-white drop-shadow-[0_0_10px_#00f0ff]">
                      Sata
                    </span>
                    <span className="rounded-md border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-mono-code font-bold text-cyan-300">
                      CHORE BATTLE ARCHIVE
                    </span>
                  </div>
                  <div className="text-[10px] font-mono-code tracking-widest text-slate-400">
                    TURN CHORES INTO VICTORIES
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => {
                    audioSynth.playCyberHover();
                    setSataAuditorTab('battles');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-arcade font-bold transition cursor-pointer ${
                    sataAuditorTab === 'battles'
                      ? 'border border-fuchsia-500 bg-fuchsia-950/70 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  <span>CHORE BATTLES</span>
                </button>

                <button
                  onClick={() => {
                    audioSynth.playCyberHover();
                    setSataAuditorTab('dashboard');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-arcade font-bold transition cursor-pointer ${
                    sataAuditorTab === 'dashboard'
                      ? 'border border-cyan-500 bg-cyan-950/70 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>DASHBOARD</span>
                </button>

                <button
                  onClick={() => {
                    audioSynth.playCyberHover();
                    setSataAuditorTab('import');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-arcade font-bold transition cursor-pointer ${
                    sataAuditorTab === 'import'
                      ? 'border border-pink-500 bg-pink-950/70 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>IMPORT DATA</span>
                </button>

                <button
                  onClick={() => {
                    audioSynth.playCyberHover();
                    setSataAuditorTab('history');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-arcade font-bold transition cursor-pointer ${
                    sataAuditorTab === 'history'
                      ? 'border border-amber-500 bg-amber-950/70 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>HISTORY</span>
                </button>

                {/* Close Modal Button */}
                <button
                  onClick={() => {
                    audioSynth.playCyberBack();
                    setActiveModal(null);
                  }}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  title="Close Sata Console"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1">
              
              {/* TAB 1: CHORE BATTLES (Matches exact 4 cards from user screenshot) */}
              {sataAuditorTab === 'battles' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-arcade text-2xl font-black text-white">
                        CHORE BATTLE ARCHIVES
                      </h3>
                      <p className="text-xs font-mono-code text-slate-300">
                        We all procrastinate on painful digital chores. Play fast-paced cyber arcade games—your 5,000 unread emails, zombie subscriptions, messy folders, and lint errors execute in the background!
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono-code shrink-0">
                      <div className="rounded-xl border border-slate-800 bg-black/60 px-3 py-1.5 text-center">
                        <div className="text-[9px] text-slate-400">BACKLOG CHORES</div>
                        <div className="font-arcade text-xs font-bold text-cyan-300">{expenses.length || 15} Items</div>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-black/60 px-3 py-1.5 text-center">
                        <div className="text-[9px] text-slate-400">SAVINGS VAULT</div>
                        <div className="font-arcade text-xs font-bold text-pink-400">+$465/yr</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Game 1: Scatter Queen 3D */}
                    <div className="rounded-2xl border-2 border-fuchsia-500/60 bg-gradient-to-br from-[#16062a] to-[#080d1c] p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(217,70,239,0.2)] hover:border-fuchsia-400 transition">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-arcade mb-2">
                          <span className="rounded-full bg-fuchsia-950/70 border border-fuchsia-500/60 px-2 py-0.5 text-fuchsia-300">
                            3D HYPERSONIC RAIL SHOOTER
                          </span>
                          <span className="text-cyan-300 font-mono-code font-bold">★ FEATURED</span>
                        </div>
                        <h4 className="font-arcade text-lg font-black text-white mb-1">SCATTER QUEEN 3D</h4>
                        <div className="text-[11px] font-mono-code text-fuchsia-300 mb-2">Procrastination Overload Destroyer</div>
                        <p className="text-xs font-mono-code text-slate-300 mb-3">
                          Pilot starfighter into a neon cyber canyon! Shoot incoming spam swarms, dodge lasers, and eliminate 5,000 unread emails, zombie subs, and disk clutter in real-time.
                        </p>
                        <div className="rounded-xl bg-black/60 p-2.5 font-mono-code text-[10px] space-y-1 mb-3">
                          <div className="text-slate-400">Controls: <span className="text-cyan-300">WASD / Arrows Fly • Space / Click Shoot • E Missiles</span></div>
                          <div className="text-slate-400">Execution: <span className="text-emerald-400 font-bold">Auto-Purges Spam • Kills Vampire Subs • Cleans GBs</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          if (onLaunchGame) onLaunchGame('scatter_queen');
                          else onContinue();
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 py-2.5 text-xs font-arcade font-black text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                      >
                        LAUNCH 3D STARFIGHTER &gt;
                      </button>
                    </div>

                    {/* Game 2: Audit Sweeper */}
                    <div className="rounded-2xl border-2 border-cyan-500/60 bg-gradient-to-br from-[#061426] to-[#080d1c] p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(0,240,255,0.2)] hover:border-cyan-400 transition">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-arcade mb-2">
                          <span className="rounded-full bg-cyan-950/70 border border-cyan-500/60 px-2 py-0.5 text-cyan-300">
                            2D SPACE STARFIGHTER
                          </span>
                          <span className="text-emerald-300 font-mono-code font-bold">5 WAVES</span>
                        </div>
                        <h4 className="font-arcade text-lg font-black text-white mb-1">AUDIT SWEEPER</h4>
                        <div className="text-[11px] font-mono-code text-cyan-300 mb-2">Debt Debris & Clutter Blaster</div>
                        <p className="text-xs font-mono-code text-slate-300 mb-3">
                          Pilot delta-wing starfighter in a cyber grid arena. Unleash rapid plasma blasters and tractor vacuum beams to destroy financial clutter orbs across 5 intense arcade waves!
                        </p>
                        <div className="rounded-xl bg-black/60 p-2.5 font-mono-code text-[10px] space-y-1 mb-3">
                          <div className="text-slate-400">Controls: <span className="text-cyan-300">WASD / Steer • Click & Hold Rapid Blasters • Powerups</span></div>
                          <div className="text-slate-400">Execution: <span className="text-emerald-400 font-bold">Tags Business Tax Write-offs • Flags Suspicious</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          if (onLaunchGame) onLaunchGame('bullet_sweeper');
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 py-2.5 text-xs font-arcade font-black text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                      >
                        LAUNCH AUDIT SWEEPER &gt;
                      </button>
                    </div>

                    {/* Game 3: Ledger Blade */}
                    <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-[#061e16] to-[#080d1c] p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:border-emerald-400 transition">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-arcade mb-2">
                          <span className="rounded-full bg-emerald-950/70 border border-emerald-500/60 px-2 py-0.5 text-emerald-300">
                            4-LANE RHYTHM SLASHER
                          </span>
                          <span className="text-emerald-300 font-mono-code font-bold">BEAT SYNC</span>
                        </div>
                        <h4 className="font-arcade text-lg font-black text-white mb-1">LEDGER BLADE</h4>
                        <div className="text-[11px] font-mono-code text-emerald-300 mb-2">High-Speed Synthwave Highway</div>
                        <p className="text-xs font-mono-code text-slate-300 mb-3">
                          Transactions fly towards you along high-speed neon tracks to the synthwave beat! Tap A / S / D / F to slash, sort, and classify before cards cross the line.
                        </p>
                        <div className="rounded-xl bg-black/60 p-2.5 font-mono-code text-[10px] space-y-1 mb-3">
                          <div className="text-slate-400">Keymap: <span className="text-emerald-300">A (Business) • S (Personal) • D (Cancel) • F (Flag)</span></div>
                          <div className="text-slate-400">Combo Bonus: <span className="text-amber-400 font-bold">Multiplier x16 Streak • Precision Timing</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          if (onLaunchGame) onLaunchGame('ledger_blade');
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-arcade font-black text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                      >
                        LAUNCH LEDGER BLADE &gt;
                      </button>
                    </div>

                    {/* Game 4: Cyber-Court */}
                    <div className="rounded-2xl border-2 border-purple-500/50 bg-gradient-to-br from-[#160a26] to-[#080d1c] p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:border-purple-400 transition">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-arcade mb-2">
                          <span className="rounded-full bg-purple-950/70 border border-purple-500/60 px-2 py-0.5 text-purple-300">
                            VISUAL NOVEL TRIBUNAL
                          </span>
                          <span className="text-purple-300 font-mono-code font-bold">STORY MODE</span>
                        </div>
                        <h4 className="font-arcade text-lg font-black text-white mb-1">CYBER-COURT</h4>
                        <div className="text-[11px] font-mono-code text-purple-300 mb-2">Anime Auditor & Subscription Tribunal</div>
                        <p className="text-xs font-mono-code text-slate-300 mb-3">
                          Every transaction has a story. Step into the courtroom with your cybernetic co-auditor. Interrogate suspicious charges, review forgotten subscriptions, and pass judgment!
                        </p>
                        <div className="rounded-xl bg-black/60 p-2.5 font-mono-code text-[10px] space-y-1 mb-3">
                          <div className="text-slate-400">Mechanics: <span className="text-purple-300">Interactive Dialogue • Evidence Review • Verdict Buttons</span></div>
                          <div className="text-slate-400">Execution: <span className="text-pink-400 font-bold">Cancels Dormant Subscriptions • Recovers Lost Cash</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveModal(null);
                          if (onLaunchGame) onLaunchGame('cyber_court');
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-arcade font-black text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                      >
                        LAUNCH CYBER-COURT &gt;
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIT DASHBOARD */}
              {sataAuditorTab === 'dashboard' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code">
                    <div className="rounded-xl border border-cyan-500/40 bg-slate-950/70 p-3">
                      <div className="text-[10px] text-slate-400">TOTAL PROCESSED</div>
                      <div className="font-arcade text-lg font-bold text-cyan-300">${liveStats.totalAmount.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500">Live Statements</div>
                    </div>
                    <div className="rounded-xl border border-pink-500/40 bg-slate-950/70 p-3">
                      <div className="text-[10px] text-slate-400">POTENTIAL SAVINGS</div>
                      <div className="font-arcade text-lg font-bold text-pink-400">${liveStats.savingsAmount.toLocaleString()}/yr</div>
                      <div className="text-[9px] text-pink-300">Direct Recurring</div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/40 bg-slate-950/70 p-3">
                      <div className="text-[10px] text-slate-400">TAX WRITE-OFFS</div>
                      <div className="font-arcade text-lg font-bold text-emerald-400">${liveStats.taxDeductible.toLocaleString()}</div>
                      <div className="text-[9px] text-emerald-300">Business Deductions</div>
                    </div>
                    <div className="rounded-xl border border-purple-500/40 bg-slate-950/70 p-3">
                      <div className="text-[10px] text-slate-400">ACCURACY RATING</div>
                      <div className="font-arcade text-lg font-bold text-purple-300">{liveStats.accuracy}%</div>
                      <div className="text-[9px] text-purple-400">AI Confidence</div>
                    </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                    <div className="font-arcade text-xs text-white mb-2 flex items-center justify-between">
                      <span>RECENT TRANSACTIONS ({expenses.length} ITEMS)</span>
                      <span className="text-slate-400 font-mono-code text-[10px]">Dataset: {currentDatasetName}</span>
                    </div>
                    <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto font-mono-code text-xs">
                      {expenses.slice(0, 10).map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{item.avatar || '💳'}</span>
                            <div>
                              <div className="font-bold text-white">{item.merchant}</div>
                              <div className="text-[10px] text-slate-400">{item.date} • {item.originalCategory || 'General'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">${item.amount.toFixed(2)}</span>
                            {onAuditDecision && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onAuditDecision(item.id, 'tax_deductible')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                    item.decision === 'tax_deductible'
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                                  }`}
                                >
                                  Business
                                </button>
                                <button
                                  onClick={() => onAuditDecision(item.id, 'vampire_cancel')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                    item.decision === 'vampire_cancel'
                                      ? 'bg-pink-500 text-white'
                                      : 'bg-pink-950/50 text-pink-300 border border-pink-500/40 hover:bg-pink-900/60'
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IMPORT DATA */}
              {sataAuditorTab === 'import' && (
                <div className="space-y-4">
                  <div className="font-arcade text-sm text-white mb-2">
                    SELECT CHORE DATASET OR UPLOAD BANK STATEMENT
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-code">
                    {Object.entries(SAMPLE_DATASETS).map(([key, dataset]) => {
                      const isCurrent = currentDatasetName.toLowerCase().includes(key.toLowerCase()) || (key === 'freelancer' && currentDatasetName.includes('Freelance'));
                      return (
                        <div
                          key={key}
                          onClick={() => {
                            audioSynth.playCyberSelect();
                            if (onSelectDataset) onSelectDataset(dataset.name, dataset.items);
                          }}
                          className={`rounded-2xl border p-4 cursor-pointer transition ${
                            isCurrent
                              ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-arcade text-xs font-bold text-white mb-1">{dataset.name}</div>
                          <div className="text-[11px] text-slate-400 mb-2">{dataset.description}</div>
                          <div className="text-[10px] text-cyan-300 font-bold">{dataset.items.length} Transactions</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-cyan-500/40 bg-slate-950/60 p-6 text-center font-mono-code">
                    <UploadCloud className="h-8 w-8 text-cyan-400 mx-auto mb-2 animate-bounce" />
                    <div className="font-bold text-white text-xs mb-1">Drag & Drop Bank Statement CSV</div>
                    <div className="text-[10px] text-slate-400 mb-3">Supports Chase, Amex, Bank of America, Apple Card CSVs</div>
                    <button
                      onClick={() => {
                        audioSynth.playCoin();
                        if (onSelectDataset) onSelectDataset('Uploaded_Chase_Statement.csv', SAMPLE_DATASETS.freelancer.items);
                      }}
                      className="rounded-xl border border-cyan-500/60 bg-cyan-950/60 px-4 py-2 text-xs font-arcade text-cyan-300 hover:bg-cyan-900/60 transition"
                    >
                      CHOOSE SAMPLE STATEMENT
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: TRANSACTION HISTORY */}
              {sataAuditorTab === 'history' && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono-code text-xs">
                  <div className="font-arcade text-sm text-white mb-3 flex items-center justify-between">
                    <span>LIVE CHORE EXECUTION LOG</span>
                    <span className="text-emerald-400 text-xs">● DAEMON ACTIVE</span>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {[
                      { time: '14:02:18', action: 'BG_THREAD [IMAP]: Auto-Purged 180 Newsletters & Spam', type: 'email', gain: '+100 pts' },
                      { time: '14:02:24', action: 'BG_THREAD [BILLING]: Dispatched Cancellation for Vampire Gym Membership', type: 'sub', gain: '+150 pts' },
                      { time: '14:02:31', action: 'BG_THREAD [DISK]: Reclaimed 4.8 GB Unzipped Desktop Dumps into /Archive_2024', type: 'disk', gain: '+100 pts' },
                      { time: '14:02:45', action: 'BG_THREAD [LINT]: Auto-executed eslint --fix across 84 TypeScript errors', type: 'lint', gain: '+120 pts' },
                    ].map((log, lIdx) => (
                      <div key={lIdx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{log.time}</span>
                          <span className="text-slate-300">{log.action}</span>
                        </div>
                        <span className="text-emerald-400 font-bold shrink-0">{log.gain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Status Bar */}
            <div className="border-t border-slate-800 pt-3 mt-3 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span>Sata Daemon v2.4 Online • All Chores Gamified</span>
              </div>
              <button
                onClick={() => {
                  audioSynth.playCyberBack();
                  setActiveModal(null);
                }}
                className="hover:text-cyan-300 transition cursor-pointer"
              >
                [ESC] RETURN TO CYBERCITY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

