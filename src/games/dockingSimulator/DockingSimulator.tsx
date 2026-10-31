import React, { useState, useEffect, useRef } from 'react';
import { audioSynth } from '../../services/audioSynth';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  RotateCcw,
  Settings,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

interface DockingSimulatorProps {
  onReturnToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const DockingSimulator: React.FC<DockingSimulatorProps> = ({
  onReturnToMenu,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 6-DOF Spacecraft State
  const simRef = useRef({
    // Position relative to docking port (meters)
    x: 10.4,
    y: 26.1,
    z: 200.0, // Forward distance (Range)

    // Velocity (m/s)
    vx: -0.05,
    vy: -0.08,
    vz: -0.602, // Approaching

    // Angles (degrees)
    roll: 13.0,
    pitch: -17.4,
    yaw: -8.7,

    // Angular rates (°/s)
    rollRate: 0.0,
    pitchRate: 0.0,
    yawRate: 0.0,

    // Active thruster firing visuals (transient)
    thrusters: {
      fwd: false,
      back: false,
      up: false,
      down: false,
      left: false,
      right: false,
      pitchUp: false,
      pitchDown: false,
      yawLeft: false,
      yawRight: false,
      rollLeft: false,
      rollRight: false,
    },

    // Stars background
    stars: [] as { x: number; y: number; z: number; size: number }[],
  });

  // UI State
  const [hudStats, setHudStats] = useState({
    x: '10.4',
    y: '26.1',
    z: '200.0',
    range: '202.0',
    rate: '0.602',
    roll: '13.0',
    rollRate: '0.0',
    pitch: '-17.4',
    pitchRate: '0.0',
    yaw: '-8.7',
    yawRate: '0.0',
    isAligned: false,
    isDocked: false,
  });

  const [activeThrusterPad, setActiveThrusterPad] = useState<{
    trans: string | null;
    rot: string | null;
  }>({ trans: null, rot: null });

  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDockedModal, setIsDockedModal] = useState(false);

  // Initialize stars on mount
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 240; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 100,
        size: Math.random() * 1.8 + 0.8,
      });
    }
    simRef.current.stars = stars;
  }, []);

  // Controls Handlers
  const fireTranslation = (axis: 'fwd' | 'back' | 'up' | 'down' | 'left' | 'right') => {
    const s = simRef.current;
    audioSynth.playRcsThruster();
    const impulse = 0.06;

    if (axis === 'fwd') {
      s.vz -= impulse;
      s.thrusters.fwd = true;
    } else if (axis === 'back') {
      s.vz += impulse;
      s.thrusters.back = true;
    } else if (axis === 'up') {
      s.vy -= impulse;
      s.thrusters.up = true;
    } else if (axis === 'down') {
      s.vy += impulse;
      s.thrusters.down = true;
    } else if (axis === 'left') {
      s.vx -= impulse;
      s.thrusters.left = true;
    } else if (axis === 'right') {
      s.vx += impulse;
      s.thrusters.right = true;
    }

    setActiveThrusterPad((p) => ({ ...p, trans: axis }));
    setTimeout(() => {
      s.thrusters[axis] = false;
      setActiveThrusterPad((p) => ({ ...p, trans: null }));
    }, 180);
  };

  const zeroTranslation = () => {
    const s = simRef.current;
    audioSynth.playRcsThruster();
    s.vx = 0;
    s.vy = 0;
    s.vz = 0;
    setActiveThrusterPad((p) => ({ ...p, trans: 'stop' }));
    setTimeout(() => setActiveThrusterPad((p) => ({ ...p, trans: null })), 200);
  };

  const fireRotation = (axis: 'pitchUp' | 'pitchDown' | 'yawLeft' | 'yawRight' | 'rollLeft' | 'rollRight') => {
    const s = simRef.current;
    audioSynth.playRcsThruster();
    const angularImpulse = 0.35;

    if (axis === 'pitchUp') {
      s.pitchRate += angularImpulse;
      s.thrusters.pitchUp = true;
    } else if (axis === 'pitchDown') {
      s.pitchRate -= angularImpulse;
      s.thrusters.pitchDown = true;
    } else if (axis === 'yawLeft') {
      s.yawRate -= angularImpulse;
      s.thrusters.yawLeft = true;
    } else if (axis === 'yawRight') {
      s.yawRate += angularImpulse;
      s.thrusters.yawRight = true;
    } else if (axis === 'rollLeft') {
      s.rollRate -= angularImpulse;
      s.thrusters.rollLeft = true;
    } else if (axis === 'rollRight') {
      s.rollRate += angularImpulse;
      s.thrusters.rollRight = true;
    }

    setActiveThrusterPad((p) => ({ ...p, rot: axis }));
    setTimeout(() => {
      s.thrusters[axis] = false;
      setActiveThrusterPad((p) => ({ ...p, rot: null }));
    }, 180);
  };

  const zeroRotation = () => {
    const s = simRef.current;
    audioSynth.playRcsThruster();
    s.pitchRate = 0;
    s.yawRate = 0;
    s.rollRate = 0;
    setActiveThrusterPad((p) => ({ ...p, rot: 'stop' }));
    setTimeout(() => setActiveThrusterPad((p) => ({ ...p, rot: null })), 200);
  };

  const resetSimulator = () => {
    audioSynth.playCyberBack();
    const s = simRef.current;
    s.x = 10.4;
    s.y = 26.1;
    s.z = 200.0;
    s.vx = -0.05;
    s.vy = -0.08;
    s.vz = -0.602;
    s.roll = 13.0;
    s.pitch = -17.4;
    s.yaw = -8.7;
    s.rollRate = 0;
    s.pitchRate = 0;
    s.yawRate = 0;
    setIsDockedModal(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Translation keys
      if (e.key === 'q' || e.key === 'Q') fireRotation('rollLeft');
      if (e.key === 'e' || e.key === 'E') fireRotation('rollRight');
      if (e.key === 'w' || e.key === 'W') fireRotation('pitchDown');
      if (e.key === 's' || e.key === 'S') fireRotation('pitchUp');
      if (e.key === 'a' || e.key === 'A') fireRotation('yawLeft');
      if (e.key === 'd' || e.key === 'D') fireRotation('yawRight');

      // Arrow keys for translation
      if (e.key === 'ArrowUp') fireTranslation('up');
      if (e.key === 'ArrowDown') fireTranslation('down');
      if (e.key === 'ArrowLeft') fireTranslation('left');
      if (e.key === 'ArrowRight') fireTranslation('right');
      if (e.key === '=' || e.key === '+') fireTranslation('fwd');
      if (e.key === '-' || e.key === '_') fireTranslation('back');
      if (e.key === ' ') zeroTranslation();
      if (e.key === 'x' || e.key === 'X') zeroRotation();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main 6-DOF Physics and Render Loop
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

    let lastTime = performance.now();
    let statsTimer = 0;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const s = simRef.current;

      // 1. Physics update
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.z += s.vz * dt;

      s.roll += s.rollRate * dt;
      s.pitch += s.pitchRate * dt;
      s.yaw += s.yawRate * dt;

      // Normalize angles (-180 to 180)
      if (s.roll > 180) s.roll -= 360;
      if (s.roll < -180) s.roll += 360;
      if (s.pitch > 180) s.pitch -= 360;
      if (s.pitch < -180) s.pitch += 360;
      if (s.yaw > 180) s.yaw -= 360;
      if (s.yaw < -180) s.yaw += 360;

      // Clamp distance
      if (s.z < 0.1) s.z = 0.1;

      const currentRange = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
      const currentRate = Math.abs(s.vz);

      // Alignment check (< 0.2 deg in all axes, range < 0.2m)
      const isAngleAligned =
        Math.abs(s.roll) < 0.3 && Math.abs(s.pitch) < 0.3 && Math.abs(s.yaw) < 0.3;
      const isPosAligned = Math.abs(s.x) < 0.2 && Math.abs(s.y) < 0.2;

      // Check Docking Capture
      if (s.z < 0.3 && isAngleAligned && isPosAligned && currentRate < 0.2) {
        if (!isDockedModal) {
          audioSynth.playDockingCapture();
          setIsDockedModal(true);
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
      }

      // Update telemetry display every 5 frames
      statsTimer++;
      if (statsTimer % 5 === 0) {
        setHudStats({
          x: s.x.toFixed(1),
          y: s.y.toFixed(1),
          z: s.z.toFixed(1),
          range: currentRange.toFixed(1),
          rate: Math.abs(s.vz).toFixed(3),
          roll: s.roll.toFixed(1),
          rollRate: s.rollRate.toFixed(1),
          pitch: s.pitch.toFixed(1),
          pitchRate: s.pitchRate.toFixed(1),
          yaw: s.yaw.toFixed(1),
          yawRate: s.yawRate.toFixed(1),
          isAligned: isAngleAligned && isPosAligned,
          isDocked: isDockedModal,
        });
      }

      // ----------------------------------------------------------------------
      // 2. RENDER SCENE
      // ----------------------------------------------------------------------
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep space background
      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, width, height);

      // Starfield (with slight parallax based on roll/yaw/pitch)
      ctx.fillStyle = '#ffffff';
      s.stars.forEach((star) => {
        const sx = (star.x + s.yaw * 6 + width * 2) % width;
        const sy = (star.y + s.pitch * 6 + height * 2) % height;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ----------------------------------------------------------------------
      // 3. EARTH LIMB (Curving blue/white horizon below)
      // ----------------------------------------------------------------------
      ctx.save();
      const earthCenterY = height * 1.55 - s.pitch * 14;
      const earthRadius = height * 1.1;

      // Earth Body Gradient
      const earthGrad = ctx.createRadialGradient(cx, earthCenterY, earthRadius * 0.85, cx, earthCenterY, earthRadius);
      earthGrad.addColorStop(0, '#0c1b33');
      earthGrad.addColorStop(0.7, '#1e3a5f');
      earthGrad.addColorStop(0.92, '#2b6cb0');
      earthGrad.addColorStop(1, '#020b18');

      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(cx, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Glow Layer
      ctx.strokeStyle = 'rgba(56, 178, 255, 0.45)';
      ctx.lineWidth = 14;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(cx, earthCenterY, earthRadius - 2, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Earth Cloud Wisps
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      for (let c = 0; c < 5; c++) {
        const cloudY = earthCenterY - earthRadius + 40 + c * 35;
        ctx.beginPath();
        ctx.ellipse(cx - 140 + c * 80 + s.yaw * 8, cloudY, 180 + c * 40, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ----------------------------------------------------------------------
      // 4. 3D ISS PROJECTION & DOCKING TARGET
      // ----------------------------------------------------------------------
      ctx.save();
      ctx.translate(cx, cy);

      // Camera orientation transform
      ctx.rotate((-s.roll * Math.PI) / 180);

      // 3D perspective scale of ISS based on Range Z
      const fov = 420;
      const issZ = Math.max(10, s.z);
      const scale = fov / issZ;

      // Projected offset of ISS center
      const issPx = (-s.x * scale);
      const issPy = (-s.y * scale) - 60 * scale;

      ctx.save();
      ctx.translate(issPx, issPy);

      // A. HEXAGONAL APPROACH TUNNEL GATES (From Reference Image!)
      // Cyan/blue concentric hexagons extending outward in perspective
      for (let gate = 1; gate <= 3; gate++) {
        const gateDist = gate * 45;
        const gateScale = fov / (issZ + gateDist);
        const hexRadius = 140 * gateScale;

        ctx.strokeStyle = gate === 1 ? 'rgba(0, 240, 255, 0.75)' : 'rgba(14, 116, 144, 0.45)';
        ctx.lineWidth = gate === 1 ? 2.5 : 1.5;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          const hx = Math.cos(ang) * hexRadius;
          const hy = Math.sin(ang) * hexRadius;
          if (a === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // B. DRAW 3D ISS MODEL (Truss, Solar Panels, Modules)
      // Main Metallic Truss Beam
      const trussW = 680 * scale;
      const trussH = 18 * scale;
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.fillRect(-trussW / 2, -trussH / 2, trussW, trussH);
      ctx.strokeRect(-trussW / 2, -trussH / 2, trussW, trussH);

      // Solar Array Wings (Bronze / Copper Photovoltaic Panels from reference)
      const panelW = 110 * scale;
      const panelH = 260 * scale;

      // Left Solar Wings
      [-trussW / 2 + panelW * 0.4, -trussW / 2 + panelW * 1.6].forEach((px) => {
        const grad = ctx.createLinearGradient(px, -panelH / 2, px + panelW, panelH / 2);
        grad.addColorStop(0, '#ca8a04');
        grad.addColorStop(0.5, '#78350f');
        grad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = grad;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.fillRect(px - panelW / 2, -panelH / 2, panelW, panelH);
        ctx.strokeRect(px - panelW / 2, -panelH / 2, panelW, panelH);

        // Panel grid lines
        for (let l = 1; l < 8; l++) {
          ctx.beginPath();
          ctx.moveTo(px - panelW / 2, -panelH / 2 + (panelH / 8) * l);
          ctx.lineTo(px + panelW / 2, -panelH / 2 + (panelH / 8) * l);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.stroke();
        }
      });

      // Right Solar Wings
      [trussW / 2 - panelW * 1.6, trussW / 2 - panelW * 0.4].forEach((px) => {
        const grad = ctx.createLinearGradient(px, -panelH / 2, px + panelW, panelH / 2);
        grad.addColorStop(0, '#ca8a04');
        grad.addColorStop(0.5, '#78350f');
        grad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = grad;
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.fillRect(px - panelW / 2, -panelH / 2, panelW, panelH);
        ctx.strokeRect(px - panelW / 2, -panelH / 2, panelW, panelH);

        for (let l = 1; l < 8; l++) {
          ctx.beginPath();
          ctx.moveTo(px - panelW / 2, -panelH / 2 + (panelH / 8) * l);
          ctx.lineTo(px + panelW / 2, -panelH / 2 + (panelH / 8) * l);
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.stroke();
        }
      });

      // Pressurized Modules Cylinders (Harmony / Destiny / Kibo)
      const modW = 120 * scale;
      const modH = 48 * scale;
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-modW / 2, -modH / 2 + 10 * scale, modW, modH, 8 * scale);
      ctx.fill();
      ctx.stroke();

      // C. ILLUMINATED DOCKING ADAPTER & GREEN DIAMOND MARKER (Matches Screenshot!)
      const portRadius = 26 * scale;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, portRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Green Diamond Alignment Target Marker
      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const dSize = 12 * scale;
      ctx.moveTo(0, -dSize);
      ctx.lineTo(dSize, 0);
      ctx.lineTo(0, dSize);
      ctx.lineTo(-dSize, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      // Docking Center Green Dot
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore ISS translation

      // ----------------------------------------------------------------------
      // 5. MAIN CIRCULAR RETICLE & ATTITUDE OVERLAYS (Matches Screenshot!)
      // ----------------------------------------------------------------------
      const reticleRadius = Math.min(width, height) * 0.28;

      // Outer Circle Ring with gaps
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;

      // Top arc
      ctx.beginPath();
      ctx.arc(0, 0, reticleRadius, -Math.PI * 0.42, -Math.PI * 0.08);
      ctx.stroke();

      // Bottom-Right arc
      ctx.beginPath();
      ctx.arc(0, 0, reticleRadius, Math.PI * 0.08, Math.PI * 0.42);
      ctx.stroke();

      // Bottom-Left arc
      ctx.beginPath();
      ctx.arc(0, 0, reticleRadius, Math.PI * 0.58, Math.PI * 0.92);
      ctx.stroke();

      // Top-Left arc
      ctx.beginPath();
      ctx.arc(0, 0, reticleRadius, Math.PI * 1.08, Math.PI * 1.42);
      ctx.stroke();

      // Cardinal notch ticks
      [-reticleRadius, reticleRadius].forEach((pos) => {
        ctx.beginPath();
        ctx.moveTo(pos - 6, 0);
        ctx.lineTo(pos + 6, 0);
        ctx.stroke();
      });

      // Center Crosshairs: ⨁
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, 0);
      ctx.moveTo(0, -24);
      ctx.lineTo(0, 24);
      ctx.stroke();

      // Center Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore center canvas translate & roll

      // ----------------------------------------------------------------------
      // 6. TOP-RIGHT 3D ATTITUDE NAVBALL (FDAI Indicator Sphere from reference)
      // ----------------------------------------------------------------------
      ctx.save();
      const ballRadius = 48;
      const ballX = width - ballRadius - 40;
      const ballY = ballRadius + 40;

      // Base Shaded Sphere
      const ballGrad = ctx.createRadialGradient(
        ballX - 14,
        ballY - 14,
        8,
        ballX,
        ballY,
        ballRadius
      );
      ballGrad.addColorStop(0, '#64748b');
      ballGrad.addColorStop(0.6, '#1e293b');
      ballGrad.addColorStop(1, '#090d16');

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Clip to sphere for rotating markings
      ctx.save();
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.clip();

      // Latitude and Longitude Lines reflecting roll, pitch, and yaw
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1;

      // Equator
      ctx.beginPath();
      ctx.moveTo(ballX - ballRadius, ballY + s.pitch * 0.4);
      ctx.lineTo(ballX + ballRadius, ballY + s.pitch * 0.4);
      ctx.stroke();

      // Meridian
      ctx.beginPath();
      ctx.moveTo(ballX + s.yaw * 0.4, ballY - ballRadius);
      ctx.lineTo(ballX + s.yaw * 0.4, ballY + ballRadius);
      ctx.stroke();

      // Grid Numbers: -3, 0, 3 (from reference screenshot)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '9px monospace';
      ctx.fillText('-3', ballX - 22, ballY + 4);
      ctx.fillText('0', ballX - 4, ballY + 4);
      ctx.fillText('3', ballX + 16, ballY + 4);

      ctx.restore();

      // Sphere Outer Bevel Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDockedModal]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black select-none font-sans text-white">
      {/* 3D Canvas Scene */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* =====================================================================
          TOP-LEFT CONTROLS: HELP, RESET, SETTINGS, BACK
          ===================================================================== */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
        <button
          onClick={() => setShowHelp(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-400 hover:text-white transition"
          title="Flight Instructions"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <button
          onClick={resetSimulator}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-400 hover:text-white transition"
          title="Reset Simulation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-400 hover:text-white transition"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        <button
          onClick={onReturnToMenu}
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-arcade font-bold text-slate-300 hover:border-pink-500/50 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>CYBERCITY</span>
        </button>
      </div>

      {/* =====================================================================
          CENTER RETICLE TELEMETRY OVERLAYS (Exact Match to Reference Screenshot!)
          ===================================================================== */}
      {/* TOP: ROLL TELEMETRY */}
      <div className="absolute top-[22%] left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none font-mono">
        <div className="text-[10px] tracking-widest text-slate-400">ROLL</div>
        <div
          className={`text-base font-bold transition-colors ${
            Math.abs(parseFloat(hudStats.roll)) < 0.3 ? 'text-emerald-400' : 'text-emerald-400'
          }`}
        >
          {hudStats.roll}°
        </div>
        <div className="text-[11px] text-cyan-400">{hudStats.rollRate} °/s</div>
      </div>

      {/* RIGHT: PITCH TELEMETRY */}
      <div className="absolute top-1/2 right-[27%] -translate-y-1/2 z-20 text-left pointer-events-none font-mono">
        <div className="text-[10px] tracking-widest text-slate-400">PITCH</div>
        <div
          className={`text-base font-bold transition-colors ${
            Math.abs(parseFloat(hudStats.pitch)) < 0.3 ? 'text-emerald-400' : 'text-emerald-400'
          }`}
        >
          {hudStats.pitch}°
        </div>
        <div className="text-[11px] text-cyan-400">{hudStats.pitchRate} °/s</div>
      </div>

      {/* BOTTOM: YAW TELEMETRY */}
      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none font-mono">
        <div
          className={`text-base font-bold transition-colors ${
            Math.abs(parseFloat(hudStats.yaw)) < 0.3 ? 'text-emerald-400' : 'text-emerald-400'
          }`}
        >
          {hudStats.yaw}°
        </div>
        <div className="text-[11px] text-cyan-400">{hudStats.yawRate} °/s</div>
        <div className="text-[10px] tracking-widest text-slate-400 mt-0.5">YAW</div>
      </div>

      {/* CENTER-LEFT: POSITION OFFSETS (X, Y, Z) */}
      <div className="absolute top-1/2 left-[30%] -translate-y-1/2 z-20 space-y-1 pointer-events-none font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 w-3">X</span>
          <span className="font-bold text-emerald-400">{hudStats.x} m</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 w-3">Y</span>
          <span className="font-bold text-emerald-400">{hudStats.y} m</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 w-3">Z</span>
          <span className="font-bold text-emerald-400">{hudStats.z} m</span>
        </div>
      </div>

      {/* CENTER-BOTTOM: RANGE & RATE (m/s) */}
      <div className="absolute bottom-[28%] left-[36%] z-20 pointer-events-none font-mono text-xs">
        <div className="text-[10px] text-slate-400 tracking-wider">RANGE</div>
        <div className="font-bold text-cyan-300 text-sm">{hudStats.range} m</div>
      </div>

      <div className="absolute bottom-[28%] right-[36%] z-20 pointer-events-none font-mono text-xs text-right">
        <div className="text-[10px] text-slate-400 tracking-wider">RATE</div>
        <div
          className={`font-bold text-sm ${
            parseFloat(hudStats.rate) > 0.6 ? 'text-cyan-300' : 'text-cyan-300'
          }`}
        >
          {hudStats.rate} m/s
        </div>
      </div>

      {/* =====================================================================
          LEFT CONTROL POD: TRANSLATION (Exact match to screenshot!)
          ===================================================================== */}
      <div className="absolute bottom-10 left-10 z-30 flex flex-col items-center select-none">
        {/* Top [-] and [+] Forward/Back Thrust Buttons */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => fireTranslation('back')}
            className={`flex h-12 w-14 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.trans === 'back'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Thrust Backward [-]"
          >
            <span className="text-xl font-bold">−</span>
          </button>

          <button
            onClick={() => fireTranslation('fwd')}
            className={`flex h-12 w-14 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.trans === 'fwd'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Thrust Forward [+]"
          >
            <span className="text-xl font-bold">+</span>
          </button>
        </div>

        {/* 4-Way Translation D-Pad with Center Stop */}
        <div className="relative flex flex-col items-center">
          {/* Translate Up */}
          <button
            onClick={() => fireTranslation('up')}
            className={`flex h-12 w-16 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.trans === 'up'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Translate Up [ArrowUp]"
          >
            <span className="text-lg">▲</span>
          </button>

          {/* Middle Row: Left, Center Stop (■), Right */}
          <div className="flex items-center gap-2 my-2">
            <button
              onClick={() => fireTranslation('left')}
              className={`flex h-16 w-12 items-center justify-center rounded-2xl border transition-all ${
                activeThrusterPad.trans === 'left'
                  ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                  : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
              }`}
              title="Translate Left [ArrowLeft]"
            >
              <span className="text-lg">◀</span>
            </button>

            {/* Center Zero-Velocity Square Button with 4 Blue RCS Indicators */}
            <button
              onClick={zeroTranslation}
              className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all ${
                activeThrusterPad.trans === 'stop'
                  ? 'border-cyan-400 bg-cyan-900/70 shadow-[0_0_20px_#00f0ff]'
                  : 'border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300'
              }`}
              title="Stop Translation / Kill Linear Drift [Space]"
            >
              <div className="h-4 w-4 rounded-xs bg-slate-300" />
              {/* 4 Blue Thruster Pips */}
              <span className="absolute top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <span className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            </button>

            <button
              onClick={() => fireTranslation('right')}
              className={`flex h-16 w-12 items-center justify-center rounded-2xl border transition-all ${
                activeThrusterPad.trans === 'right'
                  ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                  : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
              }`}
              title="Translate Right [ArrowRight]"
            >
              <span className="text-lg">▶</span>
            </button>
          </div>

          {/* Translate Down */}
          <button
            onClick={() => fireTranslation('down')}
            className={`flex h-12 w-16 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.trans === 'down'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Translate Down [ArrowDown]"
          >
            <span className="text-lg">▼</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          RIGHT CONTROL POD: ROTATION / ATTITUDE (Exact match to screenshot!)
          ===================================================================== */}
      <div className="absolute bottom-10 right-10 z-30 flex flex-col items-center select-none">
        {/* Top Roll Left (↶) and Roll Right (↷) Buttons */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => fireRotation('rollLeft')}
            className={`flex h-12 w-14 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.rot === 'rollLeft'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Roll Left [Q]"
          >
            <span className="text-xl">↶</span>
          </button>

          <button
            onClick={() => fireRotation('rollRight')}
            className={`flex h-12 w-14 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.rot === 'rollRight'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Roll Right [E]"
          >
            <span className="text-xl">↷</span>
          </button>
        </div>

        {/* Curved 4-Way Attitude D-Pad with Center Zero Rate */}
        <div className="relative flex flex-col items-center">
          {/* Pitch Down (W) */}
          <button
            onClick={() => fireRotation('pitchDown')}
            className={`flex h-12 w-16 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.rot === 'pitchDown'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Pitch Down [W]"
          >
            <span className="text-lg">⏜</span>
          </button>

          {/* Middle Row: Yaw Left, Center Stop Dot (•), Yaw Right */}
          <div className="flex items-center gap-2 my-2">
            <button
              onClick={() => fireRotation('yawLeft')}
              className={`flex h-16 w-12 items-center justify-center rounded-2xl border transition-all ${
                activeThrusterPad.rot === 'yawLeft'
                  ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                  : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
              }`}
              title="Yaw Left [A]"
            >
              <span className="text-lg">❨</span>
            </button>

            {/* Center Zero-Rate Button with 4 Blue RCS Indicators */}
            <button
              onClick={zeroRotation}
              className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all ${
                activeThrusterPad.rot === 'stop'
                  ? 'border-cyan-400 bg-cyan-900/70 shadow-[0_0_20px_#00f0ff]'
                  : 'border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300'
              }`}
              title="Zero Angular Rates / Stop Rotation [X]"
            >
              <div className="h-3 w-3 rounded-full bg-slate-200" />
              {/* 4 Blue RCS Indicators */}
              <span className="absolute top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <span className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            </button>

            <button
              onClick={() => fireRotation('yawRight')}
              className={`flex h-16 w-12 items-center justify-center rounded-2xl border transition-all ${
                activeThrusterPad.rot === 'yawRight'
                  ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                  : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
              }`}
              title="Yaw Right [D]"
            >
              <span className="text-lg">❩</span>
            </button>
          </div>

          {/* Pitch Up (S) */}
          <button
            onClick={() => fireRotation('pitchUp')}
            className={`flex h-12 w-16 items-center justify-center rounded-2xl border transition-all ${
              activeThrusterPad.rot === 'pitchUp'
                ? 'border-cyan-400 bg-cyan-900/60 shadow-[0_0_15px_#00f0ff]'
                : 'border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200'
            }`}
            title="Pitch Up [S]"
          >
            <span className="text-lg">⏝</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          HELP INSTRUCTIONS MODAL
          ===================================================================== */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-slate-950/95 p-6 shadow-2xl">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-arcade text-lg font-bold text-cyan-300 mb-2">
              SPACEX ISS DOCKING // FLIGHT CONTROLS
            </h3>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-mono">
              Control the Dragon spacecraft using real 6-DOF RCS thrusters to safely dock with the International Space Station.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="font-bold text-cyan-300 mb-1">TRANSLATION (Left Pad)</div>
                <div className="text-slate-400 text-[11px]">
                  • [-] / [+] : Thrust Backward / Forward<br />
                  • Arrows : Translate Up, Down, Left, Right<br />
                  • Center [■] or [Space] : Stop all linear drift
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="font-bold text-cyan-300 mb-1">ROTATION (Right Pad)</div>
                <div className="text-slate-400 text-[11px]">
                  • [Q] / [E] : Roll Left / Right<br />
                  • [W] / [S] : Pitch Down / Up<br />
                  • [A] / [D] : Yaw Left / Right<br />
                  • Center [•] or [X] : Kill all angular rotation rates
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-[11px] text-emerald-300">
                <strong>DOCKING SUCCESS CRITERIA:</strong><br />
                Roll, Pitch, and Yaw must be within ±0.2° (green telemetry), and approach Rate must be under 0.2 m/s when Range reaches 0.2m!
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-xl bg-cyan-600 py-2.5 font-arcade text-xs font-bold text-white hover:bg-cyan-500 transition"
            >
              RESUME DOCKING APPROACH
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          SETTINGS MODAL
          ===================================================================== */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-950/95 p-6 shadow-2xl">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-arcade text-lg font-bold text-white mb-4">
              SIMULATOR SETTINGS
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span>RCS Thruster Sound FX</span>
                <button
                  onClick={onToggleMute}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-cyan-300"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span>{isMuted ? 'Muted' : 'Audio On'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span>Simulation Difficulty</span>
                <span className="font-bold text-cyan-400">Orbital Realistic (6-DOF)</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition"
            >
              CLOSE SETTINGS
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUCCESSFUL DOCKING CAPTURE MODAL!
          ===================================================================== */}
      {isDockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-8 text-center shadow-[0_0_50px_rgba(34,197,94,0.4)]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="font-arcade text-2xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] mb-1">
              DOCKING CAPTURE CONFIRMED!
            </h2>

            <p className="text-xs text-slate-300 font-mono mb-6">
              Dragon spacecraft soft-capture ring engaged. Hard mate latches secured with the International Space Station!
            </p>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs mb-6 text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="text-[10px] text-slate-400">APPROACH RATE</div>
                <div className="font-bold text-emerald-400 text-sm">0.08 m/s</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="text-[10px] text-slate-400">ANGULAR ERROR</div>
                <div className="font-bold text-emerald-400 text-sm">0.1°</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="text-[10px] text-slate-400">RCS FUEL REMAINING</div>
                <div className="font-bold text-cyan-400 text-sm">82%</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetSimulator}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 font-arcade text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Fly Again</span>
              </button>

              <button
                onClick={onReturnToMenu}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 font-arcade text-xs font-black text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] transition"
              >
                <span>Return to Menu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

