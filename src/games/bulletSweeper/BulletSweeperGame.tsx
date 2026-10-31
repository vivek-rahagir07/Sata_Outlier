import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ExpenseItem, DecisionBucket } from '../../types/expense';
import { audioSynth } from '../../services/audioSynth';
import {
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Clock,
  Star,
  BarChart3,
  ChevronRight,
  Shield,
  Zap,
  Magnet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BulletSweeperGameProps {
  expenses: ExpenseItem[];
  onAuditDecision: (expenseId: string, decision: DecisionBucket) => void;
  scoreXP: number;
  onReset: () => void;
  onReturnToHome?: () => void;
  onOpenDashboard?: () => void;
  onNextLevel?: () => void;
}

interface Orb {
  id: string;
  expenseId?: string;
  merchant: string;
  amount: number;
  categoryLabel: string;
  categoryIcon: string;
  decision: DecisionBucket;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  bgGlow: string;
}

interface Laser {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  isOverdrive?: boolean;
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

interface PowerUpItem {
  id: string;
  type: 'emp' | 'magnet' | 'freeze' | 'shield';
  x: number;
  y: number;
  radius: number;
  icon: string;
}

const SAMPLE_CHORES = [
  { merchant: 'Netflix Premium', amount: 19.99, cat: 'SUBSCRIPTION', icon: '📦', bucket: 'vampire_cancel' as DecisionBucket, color: '#ec4899', glow: 'rgba(236,72,153,0.25)' },
  { merchant: 'AWS Cloud EC2', amount: 86.20, cat: 'BUSINESS', icon: '💼', bucket: 'tax_deductible' as DecisionBucket, color: '#10b981', glow: 'rgba(16,185,129,0.25)' },
  { merchant: 'Adobe Creative Suite', amount: 52.99, cat: 'SUBSCRIPTION', icon: '📦', bucket: 'vampire_cancel' as DecisionBucket, color: '#ec4899', glow: 'rgba(236,72,153,0.25)' },
  { merchant: 'Starbucks Coffee', amount: 6.45, cat: 'PERSONAL', icon: '☕', bucket: 'personal_expense' as DecisionBucket, color: '#00f0ff', glow: 'rgba(0,240,255,0.25)' },
  { merchant: 'Uber City Ride', amount: 24.50, cat: 'PERSONAL', icon: '🚗', bucket: 'personal_expense' as DecisionBucket, color: '#00f0ff', glow: 'rgba(0,240,255,0.25)' },
  { merchant: 'Unknown Offshore LLC', amount: 120.00, cat: 'FRAUD', icon: '⚠️', bucket: 'suspicious_flag' as DecisionBucket, color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
  { merchant: 'Gym Vampire Sub', amount: 49.00, cat: 'SUBSCRIPTION', icon: '📦', bucket: 'vampire_cancel' as DecisionBucket, color: '#ec4899', glow: 'rgba(236,72,153,0.25)' },
  { merchant: 'Google Workspace', amount: 14.00, cat: 'BUSINESS', icon: '💼', bucket: 'tax_deductible' as DecisionBucket, color: '#10b981', glow: 'rgba(16,185,129,0.25)' },
];

export const BulletSweeperGame: React.FC<BulletSweeperGameProps> = ({
  expenses,
  onAuditDecision,
  scoreXP,
  onReset,
  onReturnToHome,
  onOpenDashboard,
  onNextLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Progress State
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [totalWaves] = useState<number>(5);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(3);
  const [score, setScore] = useState<number>(scoreXP || 8230);
  const [waveBanner, setWaveBanner] = useState<string | null>('WAVE 1 // ENGAGE TARGETS');
  const [timeSeconds, setTimeSeconds] = useState<number>(72); // 01:12 starting time

  // PowerUp Charges
  const [shieldCharges, setShieldCharges] = useState<number>(2);
  const [slowCharges, setSlowCharges] = useState<number>(1);
  const [magnetCharges, setMagnetCharges] = useState<number>(1);
  const [laserCharges, setLaserCharges] = useState<number>(1);
  const [activePowerUpBanner, setActivePowerUpBanner] = useState<string | null>(null);

  // Starfighter Physics & Controls
  const ship = useRef({
    x: 360,
    y: 380,
    vx: 0,
    vy: 0,
    radius: 24,
    auraRadius: 54,
    isShielded: false,
    hasMagnet: false,
    isSlowMo: false,
    hasOverdrive: false,
  });

  const isMouseDown = useRef<boolean>(false);
  const lastShotTime = useRef<number>(0);
  const keysDown = useRef<{ [key: string]: boolean }>({});
  const orbsRef = useRef<Orb[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }>
  >([]);

  // Spawn Wave Orbs
  const spawnWaveOrbs = useCallback((waveNum: number) => {
    const width = 720;
    const height = 460;
    const orbCount = 6 + waveNum * 2; // Wave 1 = 8, Wave 2 = 10, etc.

    const newOrbs: Orb[] = [];
    const cols = 4;

    for (let i = 0; i < orbCount; i++) {
      const template = SAMPLE_CHORES[i % SAMPLE_CHORES.length];
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Grid placement with gentle random jitter
      const startX = 90 + col * 150 + (Math.random() - 0.5) * 40;
      const startY = 70 + row * 90 + (Math.random() - 0.5) * 30;
      const speed = 0.8 + waveNum * 0.25;

      newOrbs.push({
        id: Math.random().toString(),
        merchant: template.merchant,
        amount: template.amount,
        categoryLabel: template.cat === 'SUBSCRIPTION' ? 'SUB' : template.cat,
        categoryIcon: template.icon,
        decision: template.bucket,
        x: Math.max(50, Math.min(width - 50, startX)),
        y: Math.max(50, Math.min(height - 180, startY)),
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 1.5,
        radius: 32,
        hp: waveNum >= 4 ? 2 : 1, // High waves take 2 hits
        maxHp: waveNum >= 4 ? 2 : 1,
        color: template.color,
        bgGlow: template.glow,
      });
    }

    orbsRef.current = newOrbs;

    // Spawn 1 or 2 collectible power-ups in arena
    powerUpsRef.current = [
      { id: 'p1', type: 'emp', x: 160 + Math.random() * 400, y: 150, radius: 17, icon: '⚡' },
    ];
  }, []);

  // Fire Blaster Lasers
  const fireBlasters = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTime.current < 140) return; // Fire rate limiter (~7 shots/sec)
    lastShotTime.current = now;

    const s = ship.current;
    audioSynth.playLaser();

    if (s.hasOverdrive) {
      // Quad spread shot in Overdrive mode
      lasersRef.current.push(
        { id: Math.random().toString(), x: s.x - 20, y: s.y - 18, vx: -2.5, vy: -15, life: 1, isOverdrive: true },
        { id: Math.random().toString(), x: s.x - 8, y: s.y - 20, vx: -0.6, vy: -16, life: 1, isOverdrive: true },
        { id: Math.random().toString(), x: s.x + 8, y: s.y - 20, vx: 0.6, vy: -16, life: 1, isOverdrive: true },
        { id: Math.random().toString(), x: s.x + 20, y: s.y - 18, vx: 2.5, vy: -15, life: 1, isOverdrive: true }
      );
    } else {
      // Twin plasma laser cannons
      lasersRef.current.push(
        { id: Math.random().toString(), x: s.x - 14, y: s.y - 20, vx: s.vx * 0.15, vy: -14, life: 1 },
        { id: Math.random().toString(), x: s.x + 14, y: s.y - 20, vx: s.vx * 0.15, vy: -14, life: 1 }
      );
    }
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    setCurrentWave(1);
    setIsGameWon(false);
    setIsGameOver(false);
    setWaveBanner('WAVE 1 // ENGAGE TARGETS');
    setTimeout(() => setWaveBanner(null), 2400);
    spawnWaveOrbs(1);
  }, [spawnWaveOrbs]);

  // Wave Timer Countdown
  useEffect(() => {
    if (isGameWon || isGameOver) return;
    const timer = setInterval(() => {
      setTimeSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameWon, isGameOver]);

  // Keyboard controls & firing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        fireBlasters();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [fireBlasters]);

  // Trigger PowerUp
  const triggerPowerUp = (type: 'shield' | 'freeze' | 'magnet' | 'emp') => {
    const s = ship.current;

    if (type === 'shield' && shieldCharges > 0) {
      setShieldCharges((c) => c - 1);
      s.isShielded = true;
      setActivePowerUpBanner('🛡️ CYBER SHIELD ACTIVE (8s)');
      setTimeout(() => { s.isShielded = false; }, 8000);
    } else if (type === 'freeze' && slowCharges > 0) {
      setSlowCharges((c) => c - 1);
      s.isSlowMo = true;
      setActivePowerUpBanner('⏱️ TIME FREEZE SNOOZE (6s)');
      setTimeout(() => { s.isSlowMo = false; }, 6000);
    } else if (type === 'magnet' && magnetCharges > 0) {
      setMagnetCharges((c) => c - 1);
      s.hasMagnet = true;
      setActivePowerUpBanner('🧲 QUANTUM TRACTOR MAGNET (7s)');
      setTimeout(() => { s.hasMagnet = false; }, 7000);
    } else if (type === 'emp' && laserCharges > 0) {
      setLaserCharges((c) => c - 1);
      s.hasOverdrive = true;
      setActivePowerUpBanner('⚡ QUAD-PLASMA OVERDRIVE (8s)');
      setTimeout(() => { s.hasOverdrive = false; }, 8000);
    }

    setTimeout(() => setActivePowerUpBanner(null), 2500);
  };

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Deep Cyber Grid Arena
      ctx.fillStyle = '#060914';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Grid Lines
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.16)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Continuous firing while holding mouse
      if (isMouseDown.current) {
        fireBlasters();
      }

      // 2. Starfighter Movement (Keyboard WASD / Arrows)
      const s = ship.current;
      const acc = 0.95;
      if (keysDown.current['w'] || keysDown.current['arrowup']) s.vy -= acc;
      if (keysDown.current['s'] || keysDown.current['arrowdown']) s.vy += acc;
      if (keysDown.current['a'] || keysDown.current['arrowleft']) s.vx -= acc;
      if (keysDown.current['d'] || keysDown.current['arrowright']) s.vx += acc;

      // Friction
      s.vx *= 0.88;
      s.vy *= 0.88;
      s.x += s.vx;
      s.y += s.vy;

      // Arena boundary limits
      if (s.x < 35) { s.x = 35; s.vx = 0; }
      if (s.x > canvas.width - 35) { s.x = canvas.width - 35; s.vx = 0; }
      if (s.y < 35) { s.y = 35; s.vy = 0; }
      if (s.y > canvas.height - 35) { s.y = canvas.height - 35; s.vy = 0; }

      // 3. Mutual Soft-Body Repulsion (No Clumping/Overlapping)
      const orbs = orbsRef.current;
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const o1 = orbs[i];
          const o2 = orbs[j];
          const dx = o2.x - o1.x;
          const dy = o2.y - o1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = o1.radius + o2.radius + 16;

          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / minDist;
            const nx = dx / dist;
            const ny = dy / dist;
            o1.vx -= nx * overlap * 0.35;
            o1.vy -= ny * overlap * 0.35;
            o2.vx += nx * overlap * 0.35;
            o2.vy += ny * overlap * 0.35;
          }
        }
      }

      // 4. Update & Render Plasma Lasers
      for (let lIdx = lasersRef.current.length - 1; lIdx >= 0; lIdx--) {
        const l = lasersRef.current[lIdx];
        l.x += l.vx;
        l.y += l.vy;
        l.life -= 0.035;

        if (l.y < 0 || l.life <= 0) {
          lasersRef.current.splice(lIdx, 1);
          continue;
        }

        // Draw Laser Beam
        ctx.shadowColor = l.isOverdrive ? '#f59e0b' : '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = l.isOverdrive ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + 16);
        ctx.stroke();

        ctx.strokeStyle = l.isOverdrive ? '#f59e0b' : '#00f0ff';
        ctx.lineWidth = l.isOverdrive ? 6 : 4.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Check laser collision with Orbs
        for (let oIdx = orbsRef.current.length - 1; oIdx >= 0; oIdx--) {
          const orb = orbsRef.current[oIdx];
          if (Math.hypot(l.x - orb.x, l.y - orb.y) < orb.radius + 6) {
            orb.hp -= 1;
            lasersRef.current.splice(lIdx, 1);

            // Hit particles
            for (let p = 0; p < 8; p++) {
              const ang = (p / 8) * Math.PI * 2;
              particlesRef.current.push({
                x: orb.x,
                y: orb.y,
                vx: Math.cos(ang) * (2 + Math.random() * 2),
                vy: Math.sin(ang) * (2 + Math.random() * 2),
                color: orb.color,
                life: 0.8,
              });
            }

            if (orb.hp <= 0) {
              // Destroyed!
              if (orb.decision === 'vampire_cancel') audioSynth.playVampireSlay();
              else if (orb.decision === 'tax_deductible') audioSynth.playCoin();
              else audioSynth.playLaser();

              // Background chore execution
              onAuditDecision(orb.expenseId || orb.id, orb.decision);

              // Floating score
              floatingTextsRef.current.push({
                id: Math.random().toString(),
                x: orb.x,
                y: orb.y,
                text: `+$${orb.amount.toFixed(0)} RECONCILED!`,
                color: orb.color,
                alpha: 1,
                vy: -1.5,
              });

              orbsRef.current.splice(oIdx, 1);
              setScore((sc) => sc + 150);
            }
            break;
          }
        }
      }

      // 5. Update & Render Target Orbs
      const speedMult = s.isSlowMo ? 0.25 : 1.0;
      for (let i = orbsRef.current.length - 1; i >= 0; i--) {
        const orb = orbsRef.current[i];

        // Magnet attraction
        if (s.hasMagnet) {
          const angle = Math.atan2(s.y - orb.y, s.x - orb.x);
          orb.vx += Math.cos(angle) * 0.55;
          orb.vy += Math.sin(angle) * 0.55;
        }

        orb.x += orb.vx * speedMult;
        orb.y += orb.vy * speedMult;

        // Bounce walls
        if (orb.x - orb.radius < 15 || orb.x + orb.radius > canvas.width - 15) orb.vx *= -1;
        if (orb.y - orb.radius < 15 || orb.y + orb.radius > canvas.height - 15) orb.vy *= -1;

        // Glowing Aura
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = orb.bgGlow;
        ctx.fill();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = orb.color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner Core Glass
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * 0.82, 0, Math.PI * 2);
        ctx.fillStyle = '#060d1d';
        ctx.fill();

        // Icon
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(orb.categoryIcon, orb.x, orb.y - 10);

        // Category Tag
        ctx.font = 'bold 8px Orbitron, sans-serif';
        ctx.fillStyle = orb.color;
        ctx.fillText(orb.categoryLabel, orb.x, orb.y + 4);

        // Amount Badge
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`$${orb.amount.toFixed(0)}`, orb.x, orb.y + 16);

        // Proximity Tractor Pull (Gentle magnetic pull towards ship when close)
        const dist = Math.hypot(s.x - orb.x, s.y - orb.y);
        if (dist < s.auraRadius + orb.radius) {
          // Draw subtle tractor tether
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - 14);
          ctx.lineTo(orb.x, orb.y);
          ctx.stroke();

          // Magnetic pull towards ship core
          const pullAngle = Math.atan2(s.y - orb.y, s.x - orb.x);
          orb.vx += Math.cos(pullAngle) * 0.35;
          orb.vy += Math.sin(pullAngle) * 0.35;

          // Only vacuum if orb physically touches ship hull
          if (dist < s.radius + 14) {
            audioSynth.playCoin();
            onAuditDecision(orb.expenseId || orb.id, orb.decision);
            orbsRef.current.splice(i, 1);
            setScore((sc) => sc + 100);

            floatingTextsRef.current.push({
              id: Math.random().toString(),
              x: orb.x,
              y: orb.y,
              text: `VACUUMED! +$${orb.amount.toFixed(0)}`,
              color: '#00f0ff',
              alpha: 1,
              vy: -1.5,
            });
          }
        }
      }

      // Check Wave Completion
      if (orbsRef.current.length === 0) {
        if (currentWave < totalWaves) {
          // Advance to Next Wave!
          const nextW = currentWave + 1;
          setCurrentWave(nextW);
          audioSynth.playVictory();
          setWaveBanner(`WAVE ${nextW} // INCOMING TARGETS!`);
          setTimeout(() => setWaveBanner(null), 2500);
          spawnWaveOrbs(nextW);
        } else {
          // Final Wave 5 Complete! Game Won!
          setIsGameWon(true);
          audioSynth.playVictory();
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#10b981', '#f59e0b', '#ec4899'],
          });
        }
      }

      // 6. Draw Starfighter Jet
      ctx.save();
      ctx.translate(s.x, s.y);
      const bank = Math.max(-0.35, Math.min(0.35, s.vx * 0.08));
      ctx.rotate(bank);

      // Thruster Flame Animation
      const thrustPulse = 16 + Math.sin(Date.now() * 0.02) * 5;
      const tGrad = ctx.createLinearGradient(0, 14, 0, 14 + thrustPulse);
      tGrad.addColorStop(0, '#00f0ff');
      tGrad.addColorStop(0.5, '#3b82f6');
      tGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = tGrad;
      // Left Engine
      ctx.beginPath();
      ctx.moveTo(-11, 14);
      ctx.lineTo(-7, 14 + thrustPulse);
      ctx.lineTo(-3, 14);
      ctx.fill();
      // Right Engine
      ctx.beginPath();
      ctx.moveTo(3, 14);
      ctx.lineTo(7, 14 + thrustPulse);
      ctx.lineTo(11, 14);
      ctx.fill();

      // Starfighter Delta Hull
      ctx.shadowColor = s.isShielded ? '#c084fc' : s.hasOverdrive ? '#f59e0b' : '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#060d1d';
      ctx.strokeStyle = s.isShielded ? '#c084fc' : s.hasOverdrive ? '#f59e0b' : '#00f0ff';
      ctx.lineWidth = 2.8;

      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(22, 14);
      ctx.lineTo(15, 17);
      ctx.lineTo(7, 13);
      ctx.lineTo(0, 16);
      ctx.lineTo(-7, 13);
      ctx.lineTo(-15, 17);
      ctx.lineTo(-22, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Glass
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, -4, 4, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Forcefield Shield Ring if Active
      if (s.isShielded) {
        ctx.beginPath();
        ctx.arc(0, 0, s.auraRadius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // 7. Render Floating Text Popups
      for (let ftIdx = floatingTextsRef.current.length - 1; ftIdx >= 0; ftIdx--) {
        const ft = floatingTextsRef.current[ftIdx];
        ft.y += ft.vy;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(ftIdx, 1);
          continue;
        }

        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentWave, totalWaves, fireBlasters, onAuditDecision, spawnWaveOrbs]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    ship.current.vx += (targetX - ship.current.x) * 0.08;
    ship.current.vy += (targetY - ship.current.y) * 0.08;
  };

  const handleMouseDown = () => {
    isMouseDown.current = true;
    fireBlasters();
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  // Restart Wave 1
  const handleRestart = () => {
    setCurrentWave(1);
    setIsGameWon(false);
    setIsGameOver(false);
    setScore(8230);
    setTimeSeconds(72);
    setShieldCharges(2);
    setSlowCharges(1);
    setMagnetCharges(1);
    setLaserCharges(1);
    setWaveBanner('WAVE 1 // ENGAGE TARGETS');
    setTimeout(() => setWaveBanner(null), 2400);
    spawnWaveOrbs(1);
    onReset();
  };

  // Format Time (MM:SS)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // LEVEL COMPLETE VIEW (Only shown when all 5 waves are truly cleared!)
  // =========================================================================
  if (isGameWon) {
    return (
      <div className="relative w-full max-w-xl rounded-3xl border border-purple-500/50 bg-gradient-to-b from-[#0e0720] via-[#090b17] to-[#060814] p-8 shadow-[0_0_60px_rgba(168,85,247,0.35)] text-center animate-in fade-in duration-300">
        <div className="mb-2 inline-block">
          <h2 className="font-arcade text-3xl sm:text-4xl font-black italic tracking-wider text-white drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]">
            LEVEL COMPLETE!
          </h2>
        </div>

        {/* 3 Glowing Gold Stars */}
        <div className="mb-6 flex justify-center gap-3">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-950/40 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse"
              style={{ animationDelay: `${star * 200}ms` }}
            >
              <Star className="h-7 w-7 fill-amber-300 text-amber-300" />
            </div>
          ))}
        </div>

        {/* Stats Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 font-mono-code text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Transactions Processed</span>
              <span className="font-arcade font-bold text-white text-sm">25</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Accuracy</span>
              <span className="font-arcade font-bold text-cyan-300 text-sm">96%</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Waves Survived</span>
              <span className="font-arcade font-bold text-purple-300 text-sm">5 / 5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Points Earned</span>
              <span className="font-arcade font-bold text-amber-400 text-sm">+{score}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-3 font-mono-code text-xs shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div className="font-arcade text-[11px] font-bold tracking-widest text-amber-300 uppercase">
              REAL IMPACT
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-arcade text-base font-bold text-white">$186.40</div>
                <div className="text-[10px] text-slate-400">Processed</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="font-arcade text-base font-bold text-amber-300">$24.99</div>
                <div className="text-[10px] text-slate-400">Potential Savings</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="font-arcade text-base font-bold text-cyan-300">35 min</div>
                <div className="text-[10px] text-slate-400">Time Saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-arcade text-xs font-bold">
          <button
            onClick={handleRestart}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-purple-500/50 bg-purple-950/50 px-6 py-3 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-900/60 hover:text-white transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onOpenDashboard || onReturnToHome}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-950/40 px-6 py-3 text-cyan-300 hover:bg-cyan-900/60 transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <BarChart3 className="h-4 w-4" />
            <span>View Dashboard</span>
          </button>

          <button
            onClick={onNextLevel || onReturnToHome}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 px-6 py-3 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition"
          >
            <span>Next Level</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ARENA GAMEPLAY VIEW (Matching Screen 4 in Image 1)
  // =========================================================================
  return (
    <div className="flex flex-col items-center select-none w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Top HUD (Screen 4: AUDIT SWEEPER) */}
      <div className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 px-5 py-3 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
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
            AUDIT SWEEPER
          </span>
        </div>

        {/* Score, Wave, Time */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono-code text-center">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest">SCORE</div>
            <div className="font-arcade text-xs sm:text-sm font-bold text-white">{score}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest">WAVE</div>
            <div className="font-arcade text-xs sm:text-sm font-bold text-cyan-300">
              {currentWave}/{totalWaves}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest">TIME</div>
            <div className="font-arcade text-xs sm:text-sm font-bold text-emerald-400">
              {formatTime(timeSeconds)}
            </div>
          </div>
        </div>

        {/* Hearts & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-red-500">
            <span>❤️</span>
            <span>❤️</span>
            <span>❤️</span>
          </div>
          <button
            onClick={handleRestart}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition"
            title="Restart Wave"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Floating Wave/PowerUp Notification Banner */}
      {(waveBanner || activePowerUpBanner) && (
        <div className="mb-2 rounded-full border border-cyan-400 bg-slate-900/90 px-5 py-1 text-xs font-mono-code font-bold text-cyan-300 shadow-[0_0_15px_#00f0ff] animate-in fade-in">
          {waveBanner || activePowerUpBanner}
        </div>
      )}

      {/* Canvas Arena (Screen 4) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/50 bg-[#060914] shadow-2xl neon-border-cyan w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={460}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="cursor-crosshair max-w-full"
        />
      </div>

      {/* Controls Bar */}
      <div className="mt-2.5 inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-black/80 px-4 py-1 text-[11px] font-mono-code text-slate-300 shadow-md backdrop-blur-sm whitespace-nowrap">
        <span><b className="text-cyan-400">WASD / Arrows:</b> Fly</span>
        <span className="text-slate-600">•</span>
        <span><b className="text-cyan-300">Click & Hold / Space:</b> Rapid Blasters</span>
        <span className="text-slate-600">•</span>
        <span><b className="text-emerald-400">Tractor Aura:</b> Pulls & Vacuums Orbs</span>
      </div>

      {/* Bottom Powerup Dock (Screen 4 in Image 1) */}
      <div className="mt-3 grid grid-cols-4 gap-3 w-full max-w-2xl font-arcade text-xs text-center">
        <button
          onClick={() => triggerPowerUp('shield')}
          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 transition ${
            shieldCharges > 0
              ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:scale-105 active:scale-95'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60'
          }`}
        >
          <Shield className="h-4 w-4 text-cyan-400" />
          <span>Shield: {shieldCharges}</span>
        </button>

        <button
          onClick={() => triggerPowerUp('freeze')}
          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 transition ${
            slowCharges > 0
              ? 'border-purple-500/60 bg-purple-950/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)] hover:scale-105 active:scale-95'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60'
          }`}
        >
          <Clock className="h-4 w-4 text-purple-400" />
          <span>Slow Time: {slowCharges}</span>
        </button>

        <button
          onClick={() => triggerPowerUp('magnet')}
          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 transition ${
            magnetCharges > 0
              ? 'border-pink-500/60 bg-pink-950/40 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.25)] hover:scale-105 active:scale-95'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60'
          }`}
        >
          <Magnet className="h-4 w-4 text-pink-400" />
          <span>Magnet: {magnetCharges}</span>
        </button>

        <button
          onClick={() => triggerPowerUp('emp')}
          className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 transition ${
            laserCharges > 0
              ? 'border-amber-500/60 bg-amber-950/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95'
              : 'border-slate-800 bg-slate-900/50 text-slate-500 opacity-60'
          }`}
        >
          <Zap className="h-4 w-4 text-amber-400" />
          <span>Laser: {laserCharges}</span>
        </button>
      </div>
    </div>
  );
};
