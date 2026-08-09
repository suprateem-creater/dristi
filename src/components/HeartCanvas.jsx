import { useEffect, useRef, useCallback } from 'react';

// Curated authentic romantic palette: rose quartz, champagne blush, soft coral, warm peach, ethereal pearl
const PALETTES = [
  { main: 'rgba(232, 160, 175, ', glow: 'rgba(255, 180, 195, 0.4)' },
  { main: 'rgba(212, 131, 138, ', glow: 'rgba(230, 150, 160, 0.35)' },
  { main: 'rgba(201, 160, 138, ', glow: 'rgba(225, 180, 160, 0.3)' },
  { main: 'rgba(244, 194, 194, ', glow: 'rgba(255, 210, 210, 0.4)' },
  { main: 'rgba(248, 225, 215, ', glow: 'rgba(255, 235, 225, 0.3)' },
];

class RomanticParticle {
  constructor(w, h, isSpark = false, startX, startY) {
    this.reset(w, h, isSpark, startX, startY);
  }

  reset(w, h, isSpark = false, startX, startY) {
    this.isSpark = isSpark;
    this.x = startX !== undefined ? startX : Math.random() * w;
    this.y = startY !== undefined ? startY : (isSpark ? startY : h + Math.random() * 50);
    
    // Depth layer: 0 = far background, 1 = mid, 2 = foreground
    this.depth = isSpark ? 2 : Math.random();
    this.size = isSpark
      ? Math.random() * 9 + 4
      : (this.depth < 0.3 ? Math.random() * 8 + 6 : (this.depth < 0.7 ? Math.random() * 14 + 10 : Math.random() * 20 + 16));
    
    this.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    
    // Base speed and fluid swaying harmonics
    this.baseSpeed = isSpark ? (Math.random() * 3 + 1.5) : (0.4 + this.depth * 0.7);
    this.swayFreq = 0.0015 + Math.random() * 0.002;
    this.swayAmp = 18 + this.depth * 35;
    this.phase = Math.random() * Math.PI * 2;
    this.originX = this.x;
    
    // Smooth 3D tilt & rotation
    this.rotation = (Math.random() - 0.5) * 0.8;
    this.rotSpeed = (Math.random() - 0.5) * 0.012;
    this.tilt = Math.random() * Math.PI;
    this.tiltSpeed = 0.015 + Math.random() * 0.02;

    // Alpha & decay
    this.maxAlpha = isSpark ? 0.9 : (0.18 + this.depth * 0.32);
    this.alpha = isSpark ? this.maxAlpha : 0;
    this.fadeIn = !isSpark;
    this.decay = isSpark ? (0.012 + Math.random() * 0.015) : 0;

    // Spark burst physics
    if (isSpark) {
      const angle = Math.random() * Math.PI * 2;
      const force = Math.random() * 4 + 1;
      this.vx = Math.cos(angle) * force;
      this.vy = Math.sin(angle) * force - 1.5;
    }
  }

  update(time, w, h) {
    if (this.isSpark) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.95;
      this.vy += 0.06; // gentle gravity
      this.alpha -= this.decay;
      this.rotation += this.rotSpeed * 2;
      return this.alpha > 0;
    }

    // Natural fluid ascent with harmonic sinusoidal drift
    this.y -= this.baseSpeed;
    this.x = this.originX + Math.sin(time * this.swayFreq + this.phase) * this.swayAmp;
    this.rotation += this.rotSpeed;
    this.tilt += this.tiltSpeed;

    // Smooth fade-in and fade-out at borders
    if (this.fadeIn) {
      this.alpha += 0.008;
      if (this.alpha >= this.maxAlpha) {
        this.alpha = this.maxAlpha;
        this.fadeIn = false;
      }
    } else if (this.y < 80) {
      this.alpha = Math.max(0, this.maxAlpha * (this.y / 80));
    }

    // Wrap around smoothly when leaving top of screen
    if (this.y < -30) {
      this.reset(w, h);
    }
    return true;
  }

  draw(ctx) {
    if (this.alpha <= 0.01) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Natural flutter perspective scale
    const horizontalScale = Math.cos(this.tilt) * 0.35 + 0.65;
    ctx.scale(horizontalScale, 1);

    const s = this.size * 0.5;

    // Soft luminous radial aura glow
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2.2);
    glowGrad.addColorStop(0, `${this.palette.main}${this.alpha * 0.5})`);
    glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, s * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Authentic delicate soft heart geometry
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(0, -s * 0.45, -s * 1.1, -s * 0.45, -s * 1.1, s * 0.15);
    ctx.bezierCurveTo(-s * 1.1, s * 0.65, -s * 0.25, s * 1.05, 0, s * 1.35);
    ctx.bezierCurveTo(s * 0.25, s * 1.05, s * 1.1, s * 0.65, s * 1.1, s * 0.15);
    ctx.bezierCurveTo(s * 1.1, -s * 0.45, 0, -s * 0.45, 0, s * 0.35);

    // Ethereal subtle gradient fill
    const heartGrad = ctx.createLinearGradient(-s, -s, s, s * 1.4);
    heartGrad.addColorStop(0, `${this.palette.main}${this.alpha * 0.95})`);
    heartGrad.addColorStop(0.6, `${this.palette.main}${this.alpha * 0.75})`);
    heartGrad.addColorStop(1, `${this.palette.main}${this.alpha * 0.5})`);

    ctx.fillStyle = heartGrad;
    ctx.fill();

    // Subtle soft petal highlight on the top left curvature
    ctx.beginPath();
    ctx.arc(-s * 0.45, -s * 0.05, s * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.4})`;
    ctx.fill();

    ctx.restore();
  }
}

export function spawnHearts(x, y, count = 5) {
  window.__heartSpawner && window.__heartSpawner(x, y, count);
}

export default function HeartCanvas() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const sparksRef = useRef([]);
  const rafRef = useRef(null);

  const spawnParticles = useCallback((x, y, count = 5) => {
    const n = Math.min(count, 12);
    for (let i = 0; i < n; i++) {
      sparksRef.current.push(new RomanticParticle(window.innerWidth, window.innerHeight, true, x, y));
    }
  }, []);

  useEffect(() => {
    window.__heartSpawner = spawnParticles;
    return () => { delete window.__heartSpawner; };
  }, [spawnParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Initialize optimal pool of smooth, organic floating ambient hearts
    const ambientCount = width < 768 ? 18 : 28;
    particlesRef.current = Array.from({ length: ambientCount }).map(() => {
      const p = new RomanticParticle(width, height);
      p.y = Math.random() * height; // Spread across initial screen
      p.alpha = Math.random() * p.maxAlpha;
      return p;
    });

    let startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, width, height);

      // Render & update ambient floating particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.update(elapsed, width, height);
        p.draw(ctx);
      }

      // Render & update interactive click sparks
      if (sparksRef.current.length > 0) {
        sparksRef.current = sparksRef.current.filter(s => {
          const alive = s.update(elapsed, width, height);
          if (alive) s.draw(ctx);
          return alive;
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handlePointer = (e) => {
      const x = e.clientX ?? (e.touches?.[0]?.clientX);
      const y = e.clientY ?? (e.touches?.[0]?.clientY);
      if (x !== undefined && y !== undefined) {
        spawnParticles(x, y, 6);
      }
    };

    window.addEventListener('click', handlePointer, { passive: true });
    window.addEventListener('touchstart', handlePointer, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handlePointer);
      window.removeEventListener('touchstart', handlePointer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [spawnParticles]);

  return <canvas id="heart-canvas" ref={canvasRef} aria-hidden="true" />;
}
