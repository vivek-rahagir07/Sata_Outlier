import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { audioSynth } from '../../services/audioSynth';
import {
  Zap,
  Shield,
  Crosshair,
  Flame,
  Award,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Terminal,
  FileCheck,
  Mail,
  Trash2,
  DollarSign,
  AlertTriangle,
  Play,
  X,
  Sparkles,
  ArrowLeft,
  Layers,
  CheckCircle2,
  Clock,
  Download,
  Info
} from 'lucide-react';

interface ChoreTarget {
  id: string;
  category: 'email' | 'subscription' | 'desktop' | 'lint';
  title: string;
  subtitle: string;
  realChoreAction: string;
  realImpactValue: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  maxHp: number;
  hp: number;
  speed: number;
  hue: number;
  rot: number;
}

interface LaserBolt {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  isCharged?: boolean;
}

interface HomingMissile {
  x: number;
  y: number;
  z: number;
  targetId: string | null;
  speed: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  smoke: { x: number; y: number; z: number; alpha: number }[];
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface BossLaserBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  opacity: number;
  color: string;
  timer: number;
  maxTimer: number;
}

interface TerminalLog {
  id: string;
  time: string;
  action: string;
  impact: string;
  type: 'email' | 'sub' | 'disk' | 'lint';
}

interface ScatterQueenGameProps {
  onReturnToMenu: () => void;
  onOpenDashboard?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ScatterQueenGame: React.FC<ScatterQueenGameProps> = ({
  onReturnToMenu,
  onOpenDashboard,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gameplay state
  const [zone] = useState<number>(9);
  const [combo, setCombo] = useState<number>(13);
  const [score, setScore] = useState<number>(48200);
  const [bossHp, setBossHp] = useState<number>(100);
  const [shieldHp, setShieldHp] = useState<number>(100);
  const [energyLevel, setEnergyLevel] = useState<number>(85);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeWeapon, setActiveWeapon] = useState<'laser' | 'missile' | 'emp'>('laser');
  const [isEmpReady, setIsEmpReady] = useState<boolean>(true);

  // Background real-world chore execution state
  const [emailsPurged, setEmailsPurged] = useState<number>(2410);
  const [subsCancelled, setSubsCancelled] = useState<number>(420);
  const [diskCleanedGB, setDiskCleanedGB] = useState<number>(9.8);
  const [lintErrorsFixed, setLintErrorsFixed] = useState<number>(54);

  // Live Toast for chore executed (fades out automatically, no HUD collision)
  const [choreToast, setChoreToast] = useState<{ title: string; subtitle: string; icon: string } | null>(null);
  const choreToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerChoreToast = useCallback((title: string, subtitle: string, icon: string) => {
    if (choreToastTimerRef.current) {
      clearTimeout(choreToastTimerRef.current);
    }
    setChoreToast({ title, subtitle, icon });
    choreToastTimerRef.current = setTimeout(() => {
      setChoreToast(null);
    }, 3200);
  }, []);

  const triggerEmpNukeRef = useRef<() => void>(() => {});
  const triggerHomingMissilesRef = useRef<() => void>(() => {});

  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: '1',
      time: '14:02:18',
      action: 'BG_THREAD [IMAP]: Auto-Purged 180 Newsletters & Unread Spam',
      impact: '-180 Mails',
      type: 'email',
    },
    {
      id: '2',
      time: '14:02:24',
      action: 'BG_THREAD [BILLING]: Auto-Cancelled Inactive Gym Subscription',
      impact: '+$29.00/mo',
      type: 'sub',
    },
    {
      id: '3',
      time: '14:02:30',
      action: 'BG_THREAD [CLEANER]: Moved 42 Old Desktop Dumps to /ColdStorage',
      impact: '+1.4 GB',
      type: 'disk',
    },
  ]);

  // Target lock callout
  const [lockedTarget, setLockedTarget] = useState({
    title: '5,000 UNREAD SPAM SWARM',
    distance: 0.47,
    threat: 'HIGH',
    impact: '-180 Mails Purged',
  });

  // Engine state in mutable ref for 60fps performance
  const engineRef = useRef({
    shipX: 0,
    shipY: 0,
    shipVx: 0,
    shipVy: 0,
    targetX: 0,
    targetY: 0,
    roll: 0,
    pitch: 0,
    muzzleFlash: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      fire: false,
      missile: false,
    },
    lasers: [] as LaserBolt[],
    missiles: [] as HomingMissile[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    targets: [] as ChoreTarget[],
    lockedTargetId: null as string | null,
    bossBeams: [] as BossLaserBeam[],
    lastFireTime: 0,
    lastMissileTime: 0,
    lastEmpTime: 0,
    tunnelZ: 0,
    speed: 18,
    shake: 0,
    bgOffset: 0,
    buildings: [] as { x: number; y: number; z: number; w: number; h: number; windows: boolean[] }[],
  });

  // Chore templates
  const CHORE_PRESETS = [
    {
      category: 'email' as const,
      title: '5,000 UNREAD SPAM SWARM',
      subtitle: 'Marketing Newsletters & Cold Pitches',
      realChoreAction: 'Auto-purged 180 unread mail threads',
      realImpactValue: '+180 Mails Purged',
      hue: 190, // Cyan
    },
    {
      category: 'subscription' as const,
      title: 'VAMPIRE GYM MEMBERSHIP',
      subtitle: '$49.00/mo - 0 Visits in 2024',
      realChoreAction: 'Generated automated cancellation draft',
      realImpactValue: '+$588.00/yr Saved',
      hue: 330, // Pink
    },
    {
      category: 'subscription' as const,
      title: 'ZOMBIE CLOUD 2TB SUBSCRIPTION',
      subtitle: '$29.99/mo - Unused 9 Months',
      realChoreAction: 'Cancelled dormant cloud backup service',
      realImpactValue: '+$360.00/yr Saved',
      hue: 340, // Magenta
    },
    {
      category: 'desktop' as const,
      title: 'CHAOTIC DESKTOP DUMP (4.8 GB)',
      subtitle: '120 Screenshots & Unzipped Archives',
      realChoreAction: 'Consolidated into /Archive_2024 folder',
      realImpactValue: '+4.8 GB Cleaned',
      hue: 45, // Amber
    },
    {
      category: 'lint' as const,
      title: 'LINT HELL (84 TYPE ERRORS)',
      subtitle: 'Implicit any & stale imports in auth.ts',
      realChoreAction: 'Auto-executed eslint --fix and prettier',
      realImpactValue: '+84 Bugs Fixed',
      hue: 275, // Purple
    },
  ];

  // Spawn Chore Enemies into the 3D Tunnel (Capped to max 4 to avoid clutter)
  const spawnTarget = () => {
    if (engineRef.current.targets.length >= 4) return;
    const preset = CHORE_PRESETS[Math.floor(Math.random() * CHORE_PRESETS.length)];
    const count = engineRef.current.targets.length;
    const angle = (count * 1.57) + (Math.random() - 0.5) * 0.6;
    const distance = 200 + Math.random() * 180;

    engineRef.current.targets.push({
      ...preset,
      id: Math.random().toString(36).substring(2, 9),
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance * 0.6 - 30,
      z: 1300 + Math.random() * 400,
      radius: 40,
      maxHp: 3,
      hp: 3,
      speed: 6 + Math.random() * 2,
      rot: Math.random() * Math.PI * 2,
    });
  };

  // Generate 3D Cyber City Buildings along the sides of the canyon
  useEffect(() => {
    const buildings = [];
    for (let i = 0; i < 24; i++) {
      const isLeft = i % 2 === 0;
      const z = (i * 140) % 1800 + 100;
      const w = 110 + Math.random() * 80;
      const h = 320 + Math.random() * 260;
      const windows = Array.from({ length: 32 }, () => Math.random() > 0.35);

      buildings.push({
        x: isLeft ? -580 - Math.random() * 100 : 580 + Math.random() * 100,
        y: -h / 2,
        z,
        w,
        h,
        windows,
      });
    }
    engineRef.current.buildings = buildings;
  }, []);

  // Main Canvas Render & Game Loop
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

    // Initial chore wave (3 spaced-out targets)
    engineRef.current.targets = [];
    for (let i = 0; i < 3; i++) {
      spawnTarget();
    }

    // Input handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left - width / 2) / (width / 2);
      const normY = (e.clientY - rect.top - height / 2) / (height / 2);
      engineRef.current.targetX = normX * Math.min(380, width * 0.42);
      engineRef.current.targetY = normY * 130;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        engineRef.current.keys.fire = true;
      } else if (e.button === 2) {
        triggerHomingMissiles();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) engineRef.current.keys.fire = false;
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scrolling on gaming control keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 's', 'a', 'd', 'W', 'S', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }
      if (e.key === '1') setActiveWeapon('laser');
      if (e.key === '2') setActiveWeapon('missile');
      if (e.key === '3' || e.key === 'q' || e.key === 'Q') triggerEmpNuke();

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') engineRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') engineRef.current.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') engineRef.current.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') engineRef.current.keys.down = true;
      if (e.key === ' ' || e.key === 'j' || e.key === 'J' || e.key === 'Enter') engineRef.current.keys.fire = true;
      if (e.key === 'e' || e.key === 'E' || e.key === 'k' || e.key === 'K') triggerHomingMissiles();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') engineRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') engineRef.current.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') engineRef.current.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') engineRef.current.keys.down = false;
      if (e.key === ' ' || e.key === 'j' || e.key === 'J' || e.key === 'Enter') engineRef.current.keys.fire = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Trigger Multi-Lock Homing Missiles
    const triggerHomingMissiles = () => {
      const state = engineRef.current;
      const now = performance.now();
      if (now - state.lastMissileTime < 350 || state.targets.length === 0) return;
      state.lastMissileTime = now;
      audioSynth.playMissileLaunch();

      const availableTargets = [...state.targets];
      [-50, 50].forEach((offset, idx) => {
        const target = availableTargets[idx % availableTargets.length];
        state.missiles.push({
          x: state.shipX + offset,
          y: state.shipY + 10,
          z: 30,
          targetId: target ? target.id : null,
          speed: 28,
          vx: offset * 0.12,
          vy: -6,
          vz: 18,
          life: 90,
          smoke: [],
        });
      });
    };

    // Trigger Screen-Clearing EMP Chore Blast
    const triggerEmpNuke = () => {
      const state = engineRef.current;
      const now = performance.now();
      if (now - state.lastEmpTime < 4000) return;
      state.lastEmpTime = now;
      setIsEmpReady(false);
      setTimeout(() => setIsEmpReady(true), 4000);

      audioSynth.playVampireSlay();
      state.shake = 25;

      // Expand giant shockwave particle ring
      for (let i = 0; i < 80; i++) {
        const ang = (i / 80) * Math.PI * 2;
        state.particles.push({
          x: state.shipX,
          y: state.shipY,
          z: 80,
          vx: Math.cos(ang) * 25,
          vy: Math.sin(ang) * 20,
          vz: 8,
          color: '#00f0ff',
          alpha: 1,
          size: 6,
          life: 40,
        });
      }

      // Vaporize all active targets on screen
      const nuked = [...state.targets];
      state.targets = [];
      nuked.forEach((target) => {
        handleExecuteRealChore(target);
      });

      triggerChoreToast(
        '⚡ EMP CHORE OVERDRIVE EXECUTED!',
        `Instantly cleared ${nuked.length} procrastination backlogs in one blast!`,
        '💥'
      );
    };

    triggerHomingMissilesRef.current = triggerHomingMissiles;
    triggerEmpNukeRef.current = triggerEmpNuke;

    // ------------------------------------------------------------------------
    // MAIN 60FPS 3D RENDER LOOP
    // ------------------------------------------------------------------------
    const render = () => {
      const state = engineRef.current;
      const fov = 420; // 3D projection focal length
      const cx = width / 2;
      const cy = height / 2 - 20;

      // Apply screen shake
      ctx.save();
      if (state.shake > 0) {
        ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
        state.shake *= 0.9;
        if (state.shake < 0.5) state.shake = 0;
      }

      // ----------------------------------------------------------------------
      // 0. DEEP HIGH-CONTRAST CYBER CANYON SKY & HORIZON (Clean Dark Palette)
      // ----------------------------------------------------------------------
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#04020a');
      skyGrad.addColorStop(0.35, '#0b041c');
      skyGrad.addColorStop(0.7, '#14082e');
      skyGrad.addColorStop(1, '#05010e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Distant Horizon Electric Glow (Clean Cyan Vanishing Point)
      const horizonGrad = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy - 30, width * 0.75);
      horizonGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
      horizonGrad.addColorStop(0.35, 'rgba(59, 130, 246, 0.12)');
      horizonGrad.addColorStop(0.75, 'rgba(15, 23, 42, 0.05)');
      horizonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, 0, width, height);

      // Starfield in Upper Canyon Sky
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let s = 0; s < 45; s++) {
        const sx = ((s * 197) % width);
        const sy = ((s * 93) % (height * 0.45));
        const sSize = (s % 3 === 0) ? 1.8 : 1.1;
        ctx.fillRect(sx, sy, sSize, sSize);
      }

      state.tunnelZ = (state.tunnelZ + state.speed) % 1800;

      // ----------------------------------------------------------------------
      // 1. PROCEDURAL 3D CYBER HIGHWAY & DATA CONDUITS (Balanced & Cinematic)
      // ----------------------------------------------------------------------
      // A. Deep Synthwave Curved Highway Floor
      const floorGrad = ctx.createLinearGradient(0, cy, 0, height);
      floorGrad.addColorStop(0, '#1a0438');
      floorGrad.addColorStop(0.35, '#3b0d66');
      floorGrad.addColorStop(0.7, '#240645');
      floorGrad.addColorStop(1, '#0e011f');

      ctx.beginPath();
      ctx.moveTo(-150, height);
      ctx.lineTo(cx - 20, cy + 15);
      ctx.lineTo(cx + 20, cy + 15);
      ctx.lineTo(width + 150, height);
      ctx.closePath();
      ctx.fillStyle = floorGrad;
      ctx.fill();

      // Highway Cross-ties & Perspective Speed Grids
      for (let z = 1700; z > 40; z -= 110) {
        let ez = z - (state.tunnelZ % 110);
        if (ez <= 10) continue;
        const scale = fov / ez;
        const roadW = 900 * scale;
        const roadY = cy + 230 * scale;

        // Curved Highway Cross Ties
        ctx.strokeStyle = `rgba(168, 85, 247, ${Math.min(0.55, scale * 1.4)})`;
        ctx.lineWidth = Math.max(1, 2 * scale);
        ctx.beginPath();
        ctx.moveTo(cx - roadW / 2, roadY);
        ctx.lineTo(cx + roadW / 2, roadY);
        ctx.stroke();

        // Speed Lines along the edges
        const wallH = 220 * scale;
        ctx.strokeStyle = `rgba(0, 240, 255, ${Math.min(0.45, scale * 1.2)})`;
        ctx.beginPath();
        ctx.moveTo(cx - roadW / 2, roadY);
        ctx.lineTo(cx - roadW / 2 - 30 * scale, roadY - wallH);
        ctx.moveTo(cx + roadW / 2, roadY);
        ctx.lineTo(cx + roadW / 2 + 30 * scale, roadY - wallH);
        ctx.stroke();
      }

      // Glowing Double Center Data Rails (Electric Cyan)
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 25);
      ctx.lineTo(cx - 16, height);
      ctx.moveTo(cx + 6, cy + 25);
      ctx.lineTo(cx + 16, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Outer Highway Electric Cyan/Indigo Guardrails
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy + 25);
      ctx.lineTo(cx - 460, height);
      ctx.moveTo(cx + 24, cy + 25);
      ctx.lineTo(cx + 460, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ----------------------------------------------------------------------
      // 2. BALANCED 3D CYBER TOWERS (Widely Spaced on Left & Right Margins)
      // ----------------------------------------------------------------------
      state.buildings.forEach((b, bIdx) => {
        let ez = b.z - state.tunnelZ;
        if (ez <= 10) ez += 1800;
        const scale = fov / ez;

        // Correctly position on left or right flanks with ample canyon clearance
        const bx = cx + (b.x < 0 ? -620 - (bIdx % 3) * 60 : 620 + (bIdx % 3) * 60) * scale;
        const by = cy + (b.y + 20) * scale;
        const bw = (b.w + 30) * scale;
        const bh = (b.h + 100) * scale;

        // Building Facade with deep purple metallic tint
        ctx.fillStyle = `rgba(16, 4, 34, ${Math.min(0.96, scale * 1.5)})`;
        ctx.strokeStyle = b.x < 0 ? `rgba(0, 240, 255, ${Math.min(0.7, scale * 1.3)})` : `rgba(147, 51, 234, ${Math.min(0.7, scale * 1.3)})`;
        ctx.lineWidth = Math.max(1, 2 * scale);
        ctx.fillRect(bx - bw / 2, by, bw, bh);
        ctx.strokeRect(bx - bw / 2, by, bw, bh);

        // Vertical Edge Neon Pinstripes
        ctx.strokeStyle = b.x < 0 ? '#00f0ff' : '#a855f7';
        ctx.lineWidth = Math.max(1, 1.8 * scale);
        ctx.beginPath();
        ctx.moveTo(bx - bw / 2, by);
        ctx.lineTo(bx - bw / 2, by + bh);
        ctx.stroke();

        // Glowing Windows Matrix
        if (scale > 0.16) {
          ctx.fillStyle = bIdx % 2 === 0 ? 'rgba(0, 240, 255, 0.85)' : 'rgba(244, 114, 182, 0.8)';
          const cols = 4;
          const rows = 6;
          const winW = (bw / cols) * 0.5;
          const winH = (bh / rows) * 0.35;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (b.windows[(r * cols + c) % b.windows.length]) {
                const wx = bx - bw / 2 + (c + 0.25) * (bw / cols);
                const wy = by + (r + 0.25) * (bh / rows);
                ctx.fillRect(wx, wy, winW, winH);
              }
            }
          }

          // Holographic Real-World Chore Billboard on select skyscrapers
          if (scale > 0.35 && bIdx % 3 === 0) {
            ctx.save();
            ctx.font = `bold ${Math.round(12 * scale)}px Orbitron, sans-serif`;
            ctx.fillStyle = b.x < 0 ? '#00f0ff' : '#ff3bb2';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 8;
            const signs = ['INBOX: ZERO', 'STRIPE: SAVED', 'DISK: ARCHIVED', 'LINT: CLEAN'];
            ctx.fillText(signs[bIdx % signs.length], bx - bw * 0.45, by + bh * 0.35);
            ctx.restore();
          }
        }
      });

      // ----------------------------------------------------------------------
      // 3. OVERHEAD REAL-WORLD CHORE DATA GANTRY (Image 3 Overhead Arch)
      // ----------------------------------------------------------------------
      const archZ = 950 - (state.tunnelZ % 950);
      const archScale = fov / (archZ + 80);
      const archY = cy - 130 * archScale;
      const archW = 1200 * archScale;

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = Math.max(2, 3.5 * archScale);
      ctx.beginPath();
      ctx.moveTo(cx - archW / 2, cy + 240 * archScale);
      ctx.lineTo(cx - archW / 2, archY);
      ctx.lineTo(cx + archW / 2, archY);
      ctx.lineTo(cx + archW / 2, cy + 240 * archScale);
      ctx.stroke();

      // Cyan Digital Readout Strip on Arch
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(cx - archW * 0.45, archY - 2, archW * 0.9, Math.max(2, 3 * archScale));
      ctx.shadowBlur = 0;

      if (archScale > 0.28) {
        ctx.font = `bold ${Math.round(11 * archScale)}px Orbitron, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ REAL-WORLD CHORE ENGINE // BACKGROUND EXECUTION STREAM ⚡', cx, archY - 8);
      }
      ctx.restore();



      // ----------------------------------------------------------------------
      // 4. HYPERSONIC SPEED STREAKS (Clean, Sleek & Non-Intrusive)
      // ----------------------------------------------------------------------
      // Razor-thin warp streaks giving intense forward velocity without chunky clutter
      ctx.save();
      for (let i = 0; i < 28; i++) {
        const pz = ((i * 65 + state.tunnelZ * 2.5) % 1600) + 20;
        const pScale = fov / pz;
        const prevPScale = fov / (pz + 55);

        // Disperse radially outward from vanishing point
        const ang = (i * 1.618) * Math.PI * 2;
        const radDist = 180 + (i % 5) * 120;

        const sx1 = cx + Math.cos(ang) * radDist * prevPScale;
        const sy1 = cy + Math.sin(ang) * radDist * 0.7 * prevPScale;
        const sx2 = cx + Math.cos(ang) * radDist * pScale;
        const sy2 = cy + Math.sin(ang) * radDist * 0.7 * pScale;

        const alpha = Math.min(0.65, Math.max(0.08, (1600 - pz) / 1600));
        ctx.strokeStyle = i % 3 === 0 ? `rgba(0, 240, 255, ${alpha})` : `rgba(147, 197, 253, ${alpha * 0.75})`;
        ctx.lineWidth = Math.max(1, 1.8 * pScale);
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      }
      ctx.restore();

      // ----------------------------------------------------------------------
      // 5. SHIP PHYSICS & VECTOR FLIGHT CONTROL (Smooth, Responsive & Tight)
      // ----------------------------------------------------------------------
      const speedAcc = 3.2;
      const friction = 0.84;

      // Keyboard acceleration (WASD or Arrow keys)
      let keyMovingX = false;
      let keyMovingY = false;

      if (state.keys.left) {
        state.shipVx -= speedAcc;
        keyMovingX = true;
      }
      if (state.keys.right) {
        state.shipVx += speedAcc;
        keyMovingX = true;
      }
      if (state.keys.up) {
        state.shipVy -= speedAcc * 0.9;
        keyMovingY = true;
      }
      if (state.keys.down) {
        state.shipVy += speedAcc * 0.9;
        keyMovingY = true;
      }

      // Mouse guiding force when not actively steering with keyboard
      if (!keyMovingX) {
        const mouseDx = state.targetX - state.shipX;
        state.shipVx += mouseDx * 0.08;
      }
      if (!keyMovingY) {
        const mouseDy = state.targetY - state.shipY;
        state.shipVy += mouseDy * 0.08;
      }

      // Apply friction damping
      state.shipVx *= friction;
      state.shipVy *= friction;

      // Move ship position
      state.shipX += state.shipVx;
      state.shipY += state.shipVy;

      // Smooth Screen Clamping
      const maxX = Math.min(380, width * 0.4);
      state.shipX = Math.max(-maxX, Math.min(maxX, state.shipX));
      state.shipY = Math.max(-130, Math.min(110, state.shipY));

      // Aerodynamic Banking Roll & Pitch
      const targetRoll = (state.shipVx / 14) * 0.42;
      state.roll += (targetRoll - state.roll) * 0.22;
      const targetPitch = (state.shipVy / 12) * 0.22;
      state.pitch += (targetPitch - state.pitch) * 0.22;

      const shipScreenX = cx + state.shipX;
      const shipScreenY = cy + 180 + state.shipY;

      // ----------------------------------------------------------------------
      // 6. FIRING DUAL PLASMA LASERS (Rapid-Fire, Auto-Repeat & Punchy)
      // ----------------------------------------------------------------------
      const now = performance.now();
      if (state.keys.fire && now - state.lastFireTime > 85) {
        state.lastFireTime = now;
        state.muzzleFlash = 4;
        audioSynth.playPlasmaShot();

        // Crosshair aim point in 3D
        const aim3dX = state.shipX * 0.45;
        const aim3dY = state.shipY * 0.4 - 20;

        // Dual wing cannons
        [-38, 38].forEach((offset) => {
          const sx = state.shipX + offset;
          const sy = state.shipY + 6;
          const vx = (aim3dX - sx) * 0.055;
          const vy = (aim3dY - sy) * 0.055;

          state.lasers.push({
            x: sx,
            y: sy,
            z: 35,
            vx,
            vy,
            vz: 52, // High velocity tracer bolt
            color: '#00f0ff',
          });
        });

        // Crisp weapon recoil pulse
        state.shake = Math.min(4, state.shake + 1.2);
      }

      // Update & Draw Player Lasers
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const l = state.lasers[i];
        l.x += l.vx;
        l.y += l.vy;
        l.z += l.vz;

        const scale = fov / l.z;
        const lx = cx + l.x * scale;
        const ly = cy + l.y * scale;

        const prevScale = fov / Math.max(10, l.z - 65);
        const prevX = cx + (l.x - l.vx * 1.5) * prevScale;
        const prevY = cy + (l.y - l.vy * 1.5) * prevScale;

        // Needle-sharp luminous cyan beam with high bloom
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.lineWidth = Math.max(2, 6 * scale);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(lx, ly);
        ctx.stroke();

        // Pure white-hot laser core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, 2.2 * scale);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(lx, ly);
        ctx.stroke();
        ctx.restore();

        // Collision Check with Chore Targets (Generous, crisp hitboxes)
        for (let j = state.targets.length - 1; j >= 0; j--) {
          const t = state.targets[j];
          const distZ = Math.abs(l.z - t.z);
          const distX = Math.abs(l.x - t.x);
          const distY = Math.abs(l.y - t.y);

          if (distZ < 65 && distX < t.radius * 1.35 && distY < t.radius * 1.35) {
            t.hp--;
            state.lasers.splice(i, 1);

            // Snappy hit sparks
            for (let p = 0; p < 8; p++) {
              state.particles.push({
                x: t.x,
                y: t.y,
                z: t.z,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.5) * 16,
                vz: (Math.random() - 0.5) * 14,
                color: '#00f0ff',
                alpha: 1,
                size: 2.5 + Math.random() * 3,
                life: 20,
              });
            }

            if (t.hp <= 0) {
              // Crystalline shatter burst on kill
              for (let p = 0; p < 28; p++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = 6 + Math.random() * 20;
                state.particles.push({
                  x: t.x,
                  y: t.y,
                  z: t.z,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                  vz: (Math.random() - 0.5) * 18,
                  color: p % 2 === 0 ? '#00f0ff' : '#ff007f',
                  alpha: 1,
                  size: 2.5 + Math.random() * 4,
                  life: 32,
                });
              }
              state.shake = 8;
              handleExecuteRealChore(t);
              state.targets.splice(j, 1);
            }
            break;
          }
        }

        if (l.z > 1600) state.lasers.splice(i, 1);
      }

      // Update & Draw Homing Missiles
      for (let i = state.missiles.length - 1; i >= 0; i--) {
        const m = state.missiles[i];
        m.life--;
        m.z += m.vz;
        m.x += m.vx;
        m.y += m.vy;

        const target = state.targets.find((t) => t.id === m.targetId);
        if (target) {
          m.vx += (target.x - m.x) * 0.06;
          m.vy += (target.y - m.y) * 0.06;
        }

        const scale = fov / m.z;
        const mx = cx + m.x * scale;
        const my = cy + m.y * scale;

        // Missile smoke trail
        m.smoke.push({ x: mx, y: my, z: m.z, alpha: 0.8 });
        if (m.smoke.length > 8) m.smoke.shift();

        m.smoke.forEach((s) => {
          ctx.fillStyle = `rgba(255, 0, 128, ${s.alpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
          s.alpha *= 0.85;
        });

        // Missile warhead
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(mx, my, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (target && Math.abs(m.z - target.z) < 55) {
          // Missile detonation shatter
          for (let p = 0; p < 30; p++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 8 + Math.random() * 20;
            state.particles.push({
              x: target.x,
              y: target.y,
              z: target.z,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              vz: (Math.random() - 0.5) * 18,
              color: p % 2 === 0 ? '#facc15' : '#ff007f',
              alpha: 1,
              size: 3 + Math.random() * 4,
              life: 35,
            });
          }
          state.shake = 12;
          handleExecuteRealChore(target);
          state.targets.splice(state.targets.indexOf(target), 1);
          state.missiles.splice(i, 1);
        } else if (m.life <= 0 || m.z > 1600) {
          state.missiles.splice(i, 1);
        }
      }

      // ----------------------------------------------------------------------
      // 7. CHORE TARGETS (Sleek 3D Cyber-Crystals with clean lock-on)
      // ----------------------------------------------------------------------
      if (state.targets.length < 4 && Math.random() < 0.02) {
        spawnTarget();
      }

      // Find the single closest target to player's aiming point
      let closestTarget: ChoreTarget | null = null;
      let minZ = Infinity;
      state.targets.forEach((t) => {
        if (t.z < minZ) {
          minZ = t.z;
          closestTarget = t;
        }
      });
      state.lockedTargetId = closestTarget != null ? (closestTarget as ChoreTarget).id : null;

      for (let i = state.targets.length - 1; i >= 0; i--) {
        const t = state.targets[i];
        t.z -= t.speed;
        t.rot += 0.02;

        if (t.z <= 25) {
          // Player hit
          setShieldHp((prev) => Math.max(0, prev - 14));
          audioSynth.playExplosion();
          state.shake = 18;
          state.targets.splice(i, 1);
          continue;
        }

        const scale = fov / t.z;
        const tx = cx + t.x * scale;
        const ty = cy + t.y * scale;
        const tr = t.radius * scale;
        const isLocked = state.lockedTargetId === t.id;

        ctx.save();
        ctx.translate(tx, ty);

        const col = `hsl(${t.hue}, 100%, 60%)`;

        // Outer Rotating Orbital Ring
        ctx.strokeStyle = col;
        ctx.lineWidth = Math.max(1.5, 3 * scale);
        ctx.shadowColor = col;
        ctx.shadowBlur = 12;
        ctx.save();
        ctx.rotate(t.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, tr * 1.1, tr * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3D Diamond / Crystal Core (Anime Cel-Shaded)
        ctx.save();
        ctx.rotate(t.rot * 0.7);
        ctx.beginPath();
        ctx.moveTo(0, -tr);
        ctx.lineTo(tr * 0.8, 0);
        ctx.lineTo(0, tr);
        ctx.lineTo(-tr * 0.8, 0);
        ctx.closePath();
        ctx.fillStyle = `hsla(${t.hue}, 90%, 45%, 0.4)`;
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.stroke();
        ctx.restore();

        // Category Emblem Icon inside drone core
        ctx.save();
        ctx.font = `bold ${Math.round(Math.max(12, 20 * scale))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const glyph = t.category === 'email' ? '✉️' : t.category === 'subscription' ? '💲' : t.category === 'desktop' ? '📁' : '⚡';
        ctx.fillText(glyph, 0, 0);
        ctx.restore();

        // Clean Targeted Lock-on Reticle (ONLY on the single locked target!)
        if (isLocked) {
          // Yellow Arc Bracket
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(0, 0, tr * 1.35, Math.PI * 0.82, Math.PI * 2.18);
          ctx.stroke();

          // Horizontal Yellow Extension Leader Line
          ctx.beginPath();
          ctx.moveTo(tr * 1.35, 0);
          ctx.lineTo(tr * 1.35 + 20, 0);
          ctx.stroke();

          // Small Yellow Tick Mark at top of arc
          ctx.fillStyle = '#facc15';
          ctx.fillRect(-2, -tr * 1.35 - 3, 4, 6);

          // Clean HUD Tag: Real-World Chore Title & Threat Distance
          const tagX = tr * 1.35 + 26;
          const distKm = (t.z / 1000).toFixed(2);

          // Outer black stroke for crystal-clear readability
          ctx.font = '900 11px Orbitron, sans-serif';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeText(t.title, tagX, -6);
          ctx.fillStyle = col;
          ctx.fillText(t.title, tagX, -6);

          ctx.font = 'bold 10px Share Tech Mono, monospace';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          const threatSub = `${distKm}KM // ${t.realImpactValue} ⚠️`;
          ctx.strokeText(threatSub, tagX, 8);
          ctx.fillStyle = '#fde047';
          ctx.fillText(threatSub, tagX, 8);

          // Sleek Green Health Bar directly below the tag
          const barW = Math.max(68, tr * 1.6);
          const barH = 5;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(tagX, 13, barW, barH);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(tagX, 13, (barW * Math.max(0, t.hp)) / t.maxHp, barH);
        }

        ctx.restore();
      }

      // ----------------------------------------------------------------------
      // 8. EXPLOSION PARTICLES & FLOATING DAMAGE / REWARD TEXT
      // ----------------------------------------------------------------------
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.alpha *= 0.94;
        p.life--;

        const scale = fov / Math.max(10, p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.life <= 0 || p.alpha < 0.05) state.particles.splice(i, 1);
      }

      // Floating Reward Texts (e.g. "+180 EMAILS NUKED!")
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha *= 0.95;

        ctx.save();
        ctx.font = 'bold 13px Orbitron, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.alpha < 0.05) state.floatingTexts.splice(i, 1);
      }

      // ----------------------------------------------------------------------
      // 9. DRAW THE DETAILED 3D STARFIGHTER (Matching Image 3 Player Ship)
      // ----------------------------------------------------------------------
      ctx.save();
      ctx.translate(shipScreenX, shipScreenY);
      ctx.rotate(state.roll);

      // Ground Engine Lighting Bloom (Glowing emerald pool on trench floor below ship)
      const groundGlow = ctx.createRadialGradient(0, 35, 10, 0, 45, 90);
      groundGlow.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
      groundGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.2)');
      groundGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(0, 45, 80, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // A. Main Center Glowing Emerald Thruster Exhaust
      const thrusterPulse = 18 + Math.sin(Date.now() * 0.04) * 4;
      const thrusterGrad = ctx.createRadialGradient(0, 14, 4, 0, 18, thrusterPulse * 2.2);
      thrusterGrad.addColorStop(0, '#ffffff');
      thrusterGrad.addColorStop(0.3, '#22c55e'); // Neon Emerald Green Core
      thrusterGrad.addColorStop(0.7, '#00f0ff'); // Cyan outer plume
      thrusterGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = thrusterGrad;
      ctx.beginPath();
      ctx.arc(0, 16, thrusterPulse * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Flanking Auxiliary Emerald Thrusters (Tri-engine setup from Image 3)
      [-19, 19].forEach((ox) => {
        const auxGrad = ctx.createRadialGradient(ox, 14, 2, ox, 16, thrusterPulse * 1.1);
        auxGrad.addColorStop(0, '#ffffff');
        auxGrad.addColorStop(0.35, '#22c55e');
        auxGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auxGrad;
        ctx.beginPath();
        ctx.arc(ox, 15, thrusterPulse * 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      // Exhaust Spark Particles
      if (Math.random() < 0.45) {
        state.particles.push({
          x: state.shipX + (Math.random() - 0.5) * 16,
          y: state.shipY + 28,
          z: 35,
          vx: (Math.random() - 0.5) * 6,
          vy: 8 + Math.random() * 6,
          vz: -15,
          color: '#22c55e',
          alpha: 1,
          size: 4,
          life: 20,
        });
      }

      // B. Ship Hull - White Fuselage with Navy/Blue Accents (Matching Image 3)
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;

      // Central Nose Cone
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(18, 8);
      ctx.lineTo(26, 20);
      ctx.lineTo(0, 14);
      ctx.lineTo(-26, 20);
      ctx.lineTo(-18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Navy Center Spine Accent Stripe
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(6, -8);
      ctx.lineTo(6, 12);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-6, -8);
      ctx.closePath();
      ctx.fill();

      // Swept Wings with Navy Wingtips
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-18, 6);
      ctx.lineTo(-88, 18); // Left Wingtip
      ctx.lineTo(-86, 25);
      ctx.lineTo(-22, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Left Navy Wingtip Cap
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(-74, 16);
      ctx.lineTo(-88, 18);
      ctx.lineTo(-86, 25);
      ctx.lineTo(-72, 22);
      ctx.closePath();
      ctx.fill();

      // Right Swept Wing
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(18, 6);
      ctx.lineTo(88, 18); // Right Wingtip
      ctx.lineTo(86, 25);
      ctx.lineTo(22, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Navy Wingtip Cap
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(74, 16);
      ctx.lineTo(88, 18);
      ctx.lineTo(86, 25);
      ctx.lineTo(72, 22);
      ctx.closePath();
      ctx.fill();

      // Wingtip Cyan Strobe Lights
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(-84, 18, 4.5, 0, Math.PI * 2);
      ctx.arc(84, 18, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cockpit Tinted Canopy (Cyan reflection)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, -20, 8, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle Flashes on Cannons
      if (state.muzzleFlash > 0) {
        state.muzzleFlash--;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(-36, -10, 8, 0, Math.PI * 2);
        ctx.arc(36, -10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Sci-Fi HUD Gunsight Crosshair (Aligned with Plasma Blaster Trajectory)
      const crossX = cx + state.shipX * 0.45;
      const crossY = cy + 20 + state.shipY * 0.4;
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.8;

      // Outer targeting brackets
      ctx.beginPath();
      ctx.arc(crossX, crossY, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Precision crosshair pips
      ctx.beginPath();
      ctx.moveTo(crossX - 20, crossY);
      ctx.lineTo(crossX - 14, crossY);
      ctx.moveTo(crossX + 14, crossY);
      ctx.lineTo(crossX + 20, crossY);
      ctx.moveTo(crossX, crossY - 20);
      ctx.lineTo(crossX, crossY - 14);
      ctx.moveTo(crossX, crossY + 14);
      ctx.lineTo(crossX, crossY + 20);
      ctx.stroke();

      // Center glowing pip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(crossX, crossY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore(); // Restore shake
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Execute Real-World Chore when enemy is destroyed
  const handleExecuteRealChore = (target: ChoreTarget) => {
    audioSynth.playExplosion();
    audioSynth.playChorePurgePing();

    setCombo((c) => c + 1);
    setScore((s) => s + 950);

    // Damage Boss
    setBossHp((prev) => {
      const next = Math.max(0, prev - 4);
      if (next === 0 && !isVictory) {
        handleVictory();
      }
      return next;
    });

    // Real world chore counters
    if (target.category === 'email') {
      setEmailsPurged((prev) => prev + 180);
    } else if (target.category === 'subscription') {
      setSubsCancelled((prev) => prev + 45);
    } else if (target.category === 'desktop') {
      setDiskCleanedGB((prev) => parseFloat((prev + 1.2).toFixed(1)));
    } else if (target.category === 'lint') {
      setLintErrorsFixed((prev) => prev + 14);
    }

    // Spawn floating reward text at screen position
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    engineRef.current.floatingTexts.push({
      id: Math.random().toString(),
      x: cx + target.x * 0.5 - 50,
      y: cy + target.y * 0.5,
      text: target.realImpactValue,
      color: target.category === 'subscription' ? '#ff3bb2' : '#00f0ff',
      alpha: 1,
      vy: -1.8,
    });

    // Add Live Toast (Auto-fading, no text overlap)
    triggerChoreToast(
      `✓ REAL CHORE EXECUTED: ${target.realChoreAction}`,
      `${target.realImpactValue} • Procrastination backlog down!`,
      target.category === 'email' ? '✉️' : target.category === 'subscription' ? '💲' : target.category === 'desktop' ? '🗑️' : '⚡'
    );

    // Append to Terminal Logs
    const nowTime = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      {
        id: Math.random().toString(),
        time: nowTime,
        action: `BG_EXEC: ${target.realChoreAction}`,
        impact: target.realImpactValue,
        type: target.category === 'subscription' ? 'sub' : target.category === 'email' ? 'email' : target.category === 'desktop' ? 'disk' : 'lint',
      },
      ...prev.slice(0, 3),
    ]);
  };

  const handleVictory = () => {
    setIsVictory(true);
    audioSynth.playVampireSlay();
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#ff007f', '#a855f7', '#ffffff'],
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none font-arcade text-white">
      {/* 3D WebGL / Canvas Space Canyon */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* =====================================================================
          TOP HUD (EXACTLY MATCHING IMAGE 2)
          ===================================================================== */}
      {/* 1. TOP-LEFT: ZONE 9 & x13 COMBO */}
      <div className="absolute top-6 left-8 z-20 flex flex-col items-start gap-1">
        <div className="text-3xl font-black tracking-widest text-cyan-400 drop-shadow-[0_0_15px_rgba(0,240,255,0.9)]">
          ZONE {zone}
        </div>
        <div className="text-2xl font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]">
          x{combo} COMBO
        </div>
      </div>

      {/* 2. TOP-CENTER: BOSS "SCATTER QUEEN // PROCRASTINATION OVERLOAD" (Clean Neon Cyan / Titanium) */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 text-center pointer-events-none">
        <div className="mb-1 text-sm font-black tracking-widest text-cyan-400 drop-shadow-[0_0_12px_#00f0ff]">
          SCATTER QUEEN // PROCRASTINATION OVERLOAD
        </div>
        <div className="relative h-3.5 w-full rounded-full border border-cyan-500/80 bg-black/80 p-0.5 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-300 to-cyan-400 shadow-[0_0_15px_#00f0ff] transition-all duration-200"
            style={{ width: `${bossHp}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] font-mono-code text-cyan-300">
          <span>HP: {bossHp}%</span>
          <span>PHASE 2 // HYPER-LASER GRID</span>
        </div>
      </div>

      {/* 3. FAR-LEFT: VERTICAL BOOST / ENERGY GAUGE & LEVEL 3 (From Image 2) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        <div className="relative h-64 w-3.5 rounded-full border border-cyan-500/60 bg-slate-950/80 p-0.5 shadow-[0_0_18px_rgba(0,240,255,0.4)]">
          <div
            className="w-full rounded-full bg-gradient-to-t from-cyan-500 via-teal-300 to-cyan-300 shadow-[0_0_12px_#00f0ff] transition-all duration-300"
            style={{ height: `${energyLevel}%` }}
          />
        </div>
        <div className="text-center font-mono-code text-[12px] font-bold text-cyan-300">
          <div className="text-[10px] text-slate-400">LVL</div>
          <div>3</div>
        </div>
      </div>

      {/* 4. RIGHT-SIDE TARGET MATRIX CIRCLE RINGS & ABILITIES (Matching Image 3) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
        {/* Stack of Circular Hollow Target Rings (Matching Image 3 Right Border) */}
        {Array.from({ length: 11 }).map((_, idx) => (
          <div
            key={idx}
            className={`h-7 w-7 rounded-full border-2 transition-all duration-300 ${
              idx < 4
                ? 'border-cyan-400/90 bg-cyan-500/10 shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                : 'border-slate-600/50 bg-black/40'
            }`}
          />
        ))}

        {/* Bottom-right Circular Weapon Icons (Matching Image 3) */}
        <div className="mt-4 flex flex-col items-center gap-3">
          {/* Circular Yellow Missile Trigger */}
          <div
            onClick={() => {
              setActiveWeapon('missile');
              triggerHomingMissilesRef.current();
            }}
            className="group relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-yellow-400 bg-black/80 shadow-[0_0_20px_rgba(250,204,21,0.6)] transition-all hover:scale-110 active:scale-95"
            title="Right Click / 'E': Swarm Missiles"
          >
            <div className="absolute inset-1 rounded-full border border-yellow-400/40" />
            <Flame className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_8px_#facc15]" />
          </div>

          {/* Circular Magenta/Cyan Dial with R2 (Matching Image 3) */}
          <div
            onClick={() => triggerEmpNukeRef.current()}
            className={`group relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${
              isEmpReady
                ? 'border-fuchsia-500 bg-black/80 shadow-[0_0_22px_rgba(217,70,239,0.7)]'
                : 'border-slate-700 bg-black/60 text-slate-500'
            }`}
            title="Press '3' or 'Q' or Click: Screen-Clearing Overdrive"
          >
            <div className="absolute inset-1 rounded-full border border-cyan-400/50" />
            <div className="flex flex-col items-center">
              <Zap className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_6px_#00f0ff]" />
              <span className="font-arcade text-[10px] font-black text-fuchsia-400">R2</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM-CENTER: COCKPIT CONTROLS & ARCHED SEGMENTED HULL / SHIELD GAUGE */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
        {/* Sleek Cockpit Flight Controls Hint (Unified with lower console) */}
        <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/40 bg-slate-950/90 px-4 py-1 text-[10px] font-mono-code text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.85)] backdrop-blur-md">
          <span><b className="text-cyan-400 font-bold">WASD / Arrows:</b> Fly</span>
          <span className="text-slate-600">•</span>
          <span><b className="text-cyan-300 font-bold">Space / Click:</b> Shoot</span>
          <span className="text-slate-600">•</span>
          <span><b className="text-amber-400 font-bold">E / Right-Click:</b> Missiles</span>
          <span className="text-slate-600">•</span>
          <span><b className="text-teal-300 font-bold">Q / R2:</b> EMP Overdrive</span>
        </div>

        <div className="relative flex items-center gap-3 rounded-full border border-emerald-500/70 bg-black/85 px-6 py-1.5 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
          <span className="text-[11px] font-arcade font-bold tracking-widest text-emerald-400 drop-shadow-[0_0_6px_#10b981]">
            HULL
          </span>

          {/* Segmented Arched Green Bars */}
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-xs transition-all ${
                  i < (shieldHp / 100) * 28
                    ? 'h-3.5 bg-emerald-400 shadow-[0_0_8px_#10b981]'
                    : 'h-2 bg-slate-800 opacity-40'
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] font-arcade font-bold tracking-widest text-emerald-400 drop-shadow-[0_0_6px_#10b981]">
            SHIELD
          </span>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM-LEFT: LIVE REAL-WORLD CHORE EXECUTION DOCK (Non-Overlapping)
          ===================================================================== */}
      <div className="absolute bottom-5 left-6 z-20 w-80 space-y-2 pointer-events-none">
        {/* Terminal Header with Pulsing Active Daemon */}
        <div className="flex items-center justify-between rounded-xl border border-cyan-500/50 bg-slate-950/90 px-3 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono-code font-bold tracking-wider text-cyan-300">
              CHORE DAEMON ACTIVE
            </span>
          </div>
          <span className="text-[9px] font-mono-code text-slate-400">IMAP • BILLING • FS</span>
        </div>

        {/* Live Chore Metric Grid (2x2 Compact) */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800 bg-black/85 p-2 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2 py-1 border border-cyan-900/40">
            <Mail className="h-3.5 w-3.5 text-cyan-400" />
            <div className="leading-tight">
              <div className="text-xs font-black text-cyan-300">{emailsPurged.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400">MAILS PURGED</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2 py-1 border border-pink-900/40">
            <DollarSign className="h-3.5 w-3.5 text-pink-400" />
            <div className="leading-tight">
              <div className="text-xs font-black text-pink-400">+${subsCancelled}/yr</div>
              <div className="text-[9px] text-slate-400">SUBS CANCELLED</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2 py-1 border border-amber-900/40">
            <Trash2 className="h-3.5 w-3.5 text-amber-400" />
            <div className="leading-tight">
              <div className="text-xs font-black text-amber-300">{diskCleanedGB} GB</div>
              <div className="text-[9px] text-slate-400">STORAGE FREED</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2 py-1 border border-purple-900/40">
            <Zap className="h-3.5 w-3.5 text-purple-400" />
            <div className="leading-tight">
              <div className="text-xs font-black text-purple-300">{lintErrorsFixed} BUGS</div>
              <div className="text-[9px] text-slate-400">LINT AUTO-FIXED</div>
            </div>
          </div>
        </div>

        {/* Live Single-line Terminal Execution Log */}
        <div className="truncate rounded-lg border border-emerald-500/40 bg-slate-950/95 px-2.5 py-1 text-[10px] font-mono-code text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="text-emerald-500 font-bold">&gt; </span>
          {logs[0]?.action || 'BG_DAEMON: Monitoring procrastination backlog...'}
        </div>
      </div>

      {/* TOP-RIGHT CONTROLS: RETURN & SOUND */}
      <div className="absolute top-6 right-8 z-30 flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/40 bg-slate-950/70 text-cyan-300 hover:bg-cyan-900/50"
          title="Toggle Audio"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <button
          onClick={onReturnToMenu}
          className="flex items-center gap-1.5 rounded-xl border border-pink-500/60 bg-pink-950/60 px-4 py-1.5 font-arcade text-xs font-bold text-pink-300 shadow-[0_0_18px_rgba(255,0,128,0.4)] hover:scale-105 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>CYBERCITY</span>
        </button>

        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/60 bg-cyan-950/60 px-4 py-1.5 font-arcade text-xs font-bold text-cyan-300 shadow-[0_0_18px_rgba(0,240,255,0.4)] hover:scale-105 transition"
          >
            <span>📊</span>
            <span>SATA AUDITOR</span>
          </button>
        )}
      </div>

      {/* CELEBRATORY REAL-TIME CHORE NOTIFICATION (Centered Banner Above Starfighter) */}
      {choreToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 rounded-full border border-cyan-400/80 bg-slate-950/95 px-5 py-2 shadow-[0_0_35px_rgba(0,240,255,0.6)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <span className="text-base">{choreToast.icon}</span>
          <div className="text-center font-mono-code">
            <span className="text-xs font-bold text-cyan-200">{choreToast.title}</span>
            <span className="mx-2 text-slate-500">|</span>
            <span className="text-[11px] font-bold text-emerald-400">{choreToast.subtitle}</span>
          </div>
        </div>
      )}

      {/* =====================================================================
          VICTORY MODAL: PROCRASTINATION VANQUISHED
          ===================================================================== */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl rounded-3xl border border-cyan-400 bg-gradient-to-b from-slate-900/95 via-purple-950/60 to-slate-950/95 p-8 text-center shadow-[0_0_60px_rgba(0,240,255,0.4)]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_25px_#00f0ff]">
              <Award className="h-9 w-9" />
            </div>

            <div className="text-xs font-mono-code text-cyan-400 tracking-widest mb-1">
              CHOREQUEST ENGINE // STAGE 9 COMPLETE
            </div>

            <h2 className="font-arcade text-3xl sm:text-4xl font-black text-white neon-glow-cyan mb-2">
              SCATTER QUEEN VANQUISHED!
            </h2>

            <p className="text-sm text-slate-300 mb-6 font-mono-code">
              You played the fast-paced arcade game, and your painful real-world digital backlog was annihilated in the background!
            </p>

            {/* Real World Impact Certificate */}
            <div className="grid grid-cols-2 gap-3 text-left font-mono-code mb-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-[10px] text-slate-400">UNREAD EMAILS PURGED</div>
                <div className="text-xl font-bold text-cyan-300">{emailsPurged} Mails</div>
                <div className="text-[10px] text-emerald-400">Inbox Zero Attained!</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-[10px] text-slate-400">ZOMBIE SUBS CANCELLED</div>
                <div className="text-xl font-bold text-pink-400">+${subsCancelled}/yr</div>
                <div className="text-[10px] text-pink-300">Direct Recurring Savings</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-[10px] text-slate-400">STORAGE CLUTTER PURGED</div>
                <div className="text-xl font-bold text-amber-300">{diskCleanedGB} GB</div>
                <div className="text-[10px] text-slate-400">Cold Archived & Sorted</div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="text-[10px] text-slate-400">LINT & CODE DEBT FIXED</div>
                <div className="text-xl font-bold text-purple-300">{lintErrorsFixed} Bugs</div>
                <div className="text-[10px] text-emerald-400">ESLint Clean Pass</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  const report = {
                    date: new Date().toISOString(),
                    emailsPurged,
                    annualSavingsRecurringUSD: subsCancelled,
                    diskStorageReclaimedGB: diskCleanedGB,
                    lintErrorsFixed,
                    status: 'PROCRASTINATION_ELIMINATED',
                  };
                  const blob = new Blob([JSON.stringify(report, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ChoreQuest_Execution_Proof_${Date.now()}.json`;
                  a.click();
                }}
                className="rounded-xl border border-cyan-500/50 bg-slate-900 px-5 py-3 text-xs font-arcade font-bold text-cyan-300 hover:bg-slate-800 transition"
              >
                DOWNLOAD CHORE PROOF LOG (.JSON)
              </button>

              <button
                onClick={onReturnToMenu}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 px-7 py-3 text-xs font-arcade font-black text-white shadow-[0_0_20px_rgba(255,0,128,0.6)] hover:scale-105 transition"
              >
                <span>RETURN TO CYBERCITY</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
