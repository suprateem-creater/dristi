import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    setMessage('A kiss has been delivered 💋');
    setMsgKey(k => k + 1);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFE4E8)' }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} aria-hidden="true" />

      <div className="max-w-xl mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Just Because</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>Send a Kiss</h2>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.08, boxShadow: '0 12px 40px rgba(212,131,138,0.45)' }}
          whileTap={{ scale: 0.9 }}
          onClick={sendKiss}
          className="text-5xl mb-8 rounded-full w-28 h-28 flex items-center justify-center mx-auto border-none cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #FFE4E8, #D4838A)', boxShadow: '0 8px 32px rgba(212,131,138,0.3)' }}
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
          Send A Kiss 💋
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
