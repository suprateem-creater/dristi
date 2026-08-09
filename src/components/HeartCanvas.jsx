import { useEffect, useRef, useCallback } from 'react';

const COLORS = ['#E8B4B8', '#C9A08A', '#D4838A', '#F0D080', '#FF8FAB', '#FFB3C1'];

class HeartParticle {
  constructor(x, y, isFloat = false) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 18 + 8;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.isFloat = isFloat;
    
    if (isFloat) {
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = -(Math.random() * 2 + 1);
      this.decay = Math.random() * 0.005 + 0.002; // Slower fade for background hearts
    } else {
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = -(Math.random() * 4 + 2);
      this.decay = Math.random() * 0.02 + 0.015;
    }
    this.alpha = 1;
    this.scale = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    
    if (this.isFloat) {
      this.vx += (Math.random() - 0.5) * 0.1; // Gentle horizontal sway
    } else {
      this.vy += 0.05; // Gentle gravity for burst
    }
    
    this.alpha -= this.decay;
    this.scale += this.isFloat ? 0.005 : 0.02;
    return this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.fillStyle = this.color;
    drawHeart(ctx, 0, 0, this.size);
    ctx.restore();
  }
}

function drawHeart(ctx, x, y, size) {
  const s = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.1);
  ctx.bezierCurveTo(x - s, y + s * 0.5, x, y + s * 0.9, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.5, x + s, y + s * 0.1);
  ctx.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3);
  ctx.fill();
}

export function spawnHearts(x, y, count = 4, isFloat = false) {
  window.__heartSpawner && window.__heartSpawner(x, y, count, isFloat);
}

export default function HeartCanvas() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  const spawnParticles = useCallback((x, y, count, isFloat = false) => {
    const n = count || Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < n; i++) {
      particlesRef.current.push(new HeartParticle(x, y, isFloat));
    }
  }, []);

  useEffect(() => {
    window.__heartSpawner = spawnParticles;
    return () => { delete window.__heartSpawner; };
  }, [spawnParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const ctx = canvas.getContext('2d');

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => {
        const alive = p.update();
        if (alive) p.draw(ctx);
        return alive;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const handlePointer = (e) => {
      const x = e.clientX ?? (e.touches?.[0]?.clientX);
      const y = e.clientY ?? (e.touches?.[0]?.clientY);
      if (x !== undefined && y !== undefined) {
        spawnParticles(x, y, Math.floor(Math.random() * 3) + 3, false);
      }
    };

    window.addEventListener('click', handlePointer, { passive: true });
    window.addEventListener('touchstart', handlePointer, { passive: true });

    // Background floating hearts
    const bgInterval = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + 20;
      spawnParticles(x, y, 1, true);
    }, 500);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handlePointer);
      window.removeEventListener('touchstart', handlePointer);
      cancelAnimationFrame(rafRef.current);
      clearInterval(bgInterval);
    };
  }, [spawnParticles]);

  return <canvas id="heart-canvas" ref={canvasRef} aria-hidden="true" />;
}
