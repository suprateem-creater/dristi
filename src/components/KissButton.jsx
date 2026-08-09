import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';

class KissParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size  = Math.random() * 22 + 12;
    this.vx    = (Math.random() - 0.5) * 6;
    this.vy    = -(Math.random() * 5 + 3);
    this.alpha = 1;
    this.decay = Math.random() * 0.018 + 0.012;
    this.char  = ['💋', '❤️', '💕', '💖'][Math.floor(Math.random() * 4)];
    this.rotation = (Math.random() - 0.5) * 40;
    this.scale = 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.alpha -= this.decay;
    this.scale += 0.015;
    return this.alpha > 0;
  }
}

export default function KissButton() {
  const { couple } = useCouple();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [msgKey, setMsgKey] = useState(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesRef.current = particlesRef.current.filter(p => {
      const alive = p.update();
      if (alive) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size * p.scale}px serif`;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }
      return alive;
    });
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  const sendKiss = (e) => {
    const x = e.clientX ?? window.innerWidth / 2;
    const y = e.clientY ?? window.innerHeight / 2;
    for (let i = 0; i < 18; i++) {
      setTimeout(() => {
        particlesRef.current.push(new KissParticle(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 80));
      }, i * 40);
    }
    setMessage(couple.kissSuccessMessage || 'A kiss has been delivered 💋');
    setMsgKey(k => k + 1);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <section id="kiss" className="section-wrapper text-center relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} aria-hidden="true" />

      <div className="section-container max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-8"
        >
          <span className="section-eyebrow">{couple.kissEyebrow || "Just Because"}</span>
          <h2 className="section-title">{couple.kissTitle || "Send a Kiss"}</h2>
          <p className="section-subtitle">{couple.kissSubtitle || "Tap the giant kiss to send a virtual shower of love!"}</p>
        </motion.div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1, boxShadow: '0 16px 40px rgba(244,63,94,0.4)' }}
          whileTap={{ scale: 0.9 }}
          onClick={sendKiss}
          className="text-6xl mb-6 rounded-full w-28 h-28 flex items-center justify-center mx-auto border-none cursor-pointer select-none bg-gradient-to-br from-rose-200 via-rose-300 to-rose-400 shadow-xl"
          aria-label="Send a kiss"
        >
          💋
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={sendKiss}
          className="px-8 py-3 rounded-full text-white font-medium"
          style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)', fontFamily: 'Inter' }}
        >
          {couple.kissButtonText || "Send A Kiss 💋"}
        </motion.button>

        <div className="h-12 mt-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                key={msgKey}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="text-base font-medium"
                style={{ fontFamily: 'Dancing Script', color: '#D4838A', fontSize: '1.3rem' }}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
