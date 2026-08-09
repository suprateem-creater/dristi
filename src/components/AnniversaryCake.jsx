import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spawnHearts } from './HeartCanvas';

function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 200 }} aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: Math.random() * 720 - 360 }}
          transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: 'easeIn' }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ background: ['#D4838A', '#E8B4B8', '#F0C060', '#C9A08A', '#7BCB8A'][i % 5], top: 0 }}
        />
      ))}
    </div>
  );
}

export default function AnniversaryCake() {
  const [blown, setBlown] = useState([false, false]);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const blowCandle = (index, e) => {
    if (blown[index]) return;
    const next = [...blown];
    next[index] = true;
    setBlown(next);
    spawnHearts(e.clientX, e.clientY, 6);
    if (next.every(Boolean)) {
      setTimeout(() => {
        setRevealed(true);
        setConfetti(true);
        for (let i = 0; i < 20; i++) {
          setTimeout(() => spawnHearts(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.5, 4), i * 80);
        }
        setTimeout(() => setConfetti(false), 4000);
      }, 600);
    }
  };

  const reset = () => { setBlown([false, false]); setRevealed(false); };

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FDFBF7)' }}>
      <Confetti active={confetti} />
      <div className="max-w-lg mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>One Year of Magic</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>Make a Wish</h2>
          {!blown.every(Boolean) && <p className="mt-3 text-sm" style={{ color: '#5A5A5A' }}>Tap each candle to blow it out 🎂</p>}
        </motion.div>

        {/* Cake */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 150, damping: 18 }} className="mx-auto mb-10" style={{ width: '260px' }}>
          <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
            <ellipse cx="130" cy="188" rx="115" ry="12" fill="rgba(201,160,138,0.15)" />
            <rect x="20" y="130" width="220" height="60" rx="12" fill="#D4838A" />
            <rect x="20" y="130" width="220" height="20" rx="12" fill="#E8B4B8" />
            {[50, 90, 130, 170, 210].map(x => <circle key={x} cx={x} cy="160" r="5" fill="white" opacity="0.6" />)}
            <rect x="55" y="80" width="150" height="55" rx="10" fill="#C9A08A" />
            <rect x="55" y="80" width="150" height="16" rx="10" fill="#E8C4A0" />
            {[80, 115, 150, 185].map(x => <circle key={x} cx={x} cy="110" r="4" fill="white" opacity="0.5" />)}
            {[70, 100, 140, 170].map((x, i) => <path key={i} d={`M${x},80 Q${x + 8},95 ${x + 5},105`} stroke="white" strokeWidth="6" fill="none" opacity="0.4" strokeLinecap="round" />)}
            <text x="130" y="108" textAnchor="middle" fontSize="18" fontFamily="Playfair Display, serif" fill="white" opacity="0.8">1</text>
            {[95, 155].map((cx, i) => (
              <g key={i} onClick={(e) => blowCandle(i, e)} style={{ cursor: blown[i] ? 'default' : 'pointer' }}>
                <rect x={cx - 6} y="48" width="12" height="32" rx="4" fill={blown[i] ? '#C9A08A' : '#F0C060'} />
                <line x1={cx} y1="48" x2={cx} y2="40" stroke="#5A5A5A" strokeWidth="1.5" strokeLinecap="round" />
                {!blown[i] && (
                  <motion.g animate={{ scaleY: [1, 1.15, 0.9, 1], scaleX: [1, 0.9, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }} style={{ transformOrigin: `${cx}px 38px` }}>
                    <ellipse cx={cx} cy="30" rx="7" ry="12" fill="#F0C060" opacity="0.9" />
                    <ellipse cx={cx} cy="33" rx="4" ry="8" fill="#FF8C42" />
                    <ellipse cx={cx} cy="36" rx="2" ry="4" fill="white" opacity="0.8" />
                  </motion.g>
                )}
                {blown[i] && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: 2 }}>
                    <circle cx={cx} cy="35" r="3" fill="rgba(100,100,100,0.3)" />
                    <circle cx={cx - 2} cy="28" r="2" fill="rgba(100,100,100,0.2)" />
                  </motion.g>
                )}
              </g>
            ))}
          </svg>
        </motion.div>

        <div className="flex justify-center gap-8 mb-8">
          {blown.map((b, i) => (
            <div key={i} className="text-sm" style={{ color: b ? '#5EAE70' : '#D4838A' }}>
              Candle {i + 1}: {b ? '✓ Out' : '🔥 Tap'}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {revealed && (
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #FFE4E8, #FFF0E8)', border: '1px solid rgba(201,160,138,0.3)' }}>
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>Here's to another year of us.</p>
              <p className="text-base" style={{ fontFamily: 'Dancing Script', color: '#5A5A5A', fontSize: '1.2rem' }}>May every year be sweeter than the last. 🎂✨</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={reset} className="mt-6 px-6 py-2 rounded-full text-sm" style={{ background: 'rgba(201,160,138,0.2)', color: '#C9A08A', border: '1px solid rgba(201,160,138,0.3)', fontFamily: 'Inter' }}>
                Light Again ↺
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
