import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spawnHearts } from './HeartCanvas';

const LABELS = ['A Little', 'Pretty Much', 'A Lot', 'So Much', 'Infinity', 'Still Not Enough ∞'];

export default function LoveMeter() {
  const [value, setValue] = useState(0);
  const [burst, setBurst] = useState(false);

  const handleChange = (e) => {
    const v = Number(e.target.value);
    setValue(v);
    if (v === 100 && !burst) {
      setBurst(true);
      // Spawn hearts all over screen
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          spawnHearts(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            5
          );
        }, i * 60);
      }
      setTimeout(() => setBurst(false), 2000);
    }
  };

  const labelIndex = Math.floor((value / 100) * (LABELS.length - 1));
  const label = LABELS[Math.min(labelIndex, LABELS.length - 1)];

  return (
    <section className="py-24 px-4" style={{ background: 'linear-gradient(135deg, #FFF0F3, #FDFBF7)' }}>
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>An Important Question</p>
          <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            How Much Do We Love Each Other?
          </h2>
        </motion.div>

        {/* Heart meter */}
        <div className="relative flex justify-center mb-8">
          <motion.div
            animate={{
              scale: burst ? [1, 1.4, 1] : [1, 1.08, 1],
            }}
            transition={{
              duration: burst ? 0.3 : 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <svg width="160" height="150" viewBox="0 0 160 150">
              {/* Background heart */}
              <path
                d="M80 135 C 40 100, 0 80, 0 50 C 0 25, 20 10, 40 10 C 55 10, 68 18, 80 30 C 92 18, 105 10, 120 10 C 140 10, 160 25, 160 50 C 160 80, 120 100, 80 135Z"
                fill="rgba(232,180,184,0.3)"
              />
              {/* Filled heart (clip) */}
              <defs>
                <clipPath id="heartClip">
                  <path d="M80 135 C 40 100, 0 80, 0 50 C 0 25, 20 10, 40 10 C 55 10, 68 18, 80 30 C 92 18, 105 10, 120 10 C 140 10, 160 25, 160 50 C 160 80, 120 100, 80 135Z" />
                </clipPath>
              </defs>
              <rect
                x="0"
                y={150 - (value / 100) * 150}
                width="160"
                height="150"
                fill="url(#heartGrad)"
                clipPath="url(#heartClip)"
                style={{ transition: 'y 0.3s ease' }}
              />
              <defs>
                <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4838A" />
                  <stop offset="100%" stopColor="#C9A08A" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {/* Label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-semibold mb-8"
            style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}
          >
            {label}
          </motion.p>
        </AnimatePresence>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="w-full h-2 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #D4838A ${value}%, rgba(232,180,184,0.3) ${value}%)`,
            WebkitAppearance: 'none',
          }}
        />
        <p className="mt-4 text-sm" style={{ color: '#5A5A5A' }}>Drag to measure the love ❤️</p>

        {burst && (
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-xl font-semibold"
            style={{ fontFamily: 'Dancing Script', color: '#D4838A', fontSize: '1.8rem' }}
          >
            Still Not Enough! 🌹
          </motion.p>
        )}
      </div>
    </section>
  );
}
