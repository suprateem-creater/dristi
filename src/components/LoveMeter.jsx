import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spawnHearts } from './HeartCanvas';
import { useCouple } from '../CoupleContext';

const DEFAULT_LABELS = ['A Little', 'Pretty Much', 'A Lot', 'So Much', 'To the Moon & Back', 'Still Not Enough ∞'];

export default function LoveMeter() {
  const { couple } = useCouple();
  const [value, setValue] = useState(0);
  const [burst, setBurst] = useState(false);

  const labels = (couple.lovemeterLabels && couple.lovemeterLabels.length > 0)
    ? couple.lovemeterLabels
    : DEFAULT_LABELS;

  const handleChange = (e) => {
    const v = Number(e.target.value);
    setValue(v);
    if (v === 100 && !burst) {
      setBurst(true);
      for (let i = 0; i < 18; i++) {
        setTimeout(() => {
          spawnHearts(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            4
          );
        }, i * 70);
      }
      setTimeout(() => setBurst(false), 2200);
    }
  };

  const labelIndex = Math.floor((value / 100) * (labels.length - 1));
  const label = labels[Math.min(labelIndex, labels.length - 1)];

  return (
    <section id="lovemeter" className="section-wrapper text-center" style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-10"
        >
          <span className="section-eyebrow">{couple.lovemeterEyebrow || "An Important Question"}</span>
          <h2 className="section-title">{couple.lovemeterTitle || "How Much Do We Love Each Other?"}</h2>
          <p className="section-subtitle">{couple.lovemeterSubtitle || "Drag the slider to test our official love meter."}</p>
        </motion.div>

        {/* Heart graphic meter */}
        <div className="relative flex justify-center mb-6">
          <motion.div
            animate={{
              scale: burst ? [1, 1.35, 1] : [1, 1.05, 1],
            }}
            transition={{
              duration: burst ? 0.35 : 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative drop-shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
          >
            <svg width="150" height="140" viewBox="0 0 160 150">
              <path
                d="M80 135 C 40 100, 0 80, 0 50 C 0 25, 20 10, 40 10 C 55 10, 68 18, 80 30 C 92 18, 105 10, 120 10 C 140 10, 160 25, 160 50 C 160 80, 120 100, 80 135Z"
                fill="rgba(232,180,184,0.3)"
              />
              <defs>
                <clipPath id="heartClip">
                  <path d="M80 135 C 40 100, 0 80, 0 50 C 0 25, 20 10, 40 10 C 55 10, 68 18, 80 30 C 92 18, 105 10, 120 10 C 140 10, 160 25, 160 50 C 160 80, 120 100, 80 135Z" />
                </clipPath>
                <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#FB7185" />
                </linearGradient>
              </defs>
              <rect
                x="0"
                y={150 - (value / 100) * 150}
                width="160"
                height="150"
                fill="url(#heartGrad)"
                clipPath="url(#heartClip)"
                style={{ transition: 'y 0.25s ease' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Dynamic Label */}
        <div className="min-h-12 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-2xl sm:text-3xl font-bold font-serif text-rose-600"
            >
              {label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Custom Slider */}
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleChange}
            className="w-full h-3 appearance-none rounded-full cursor-pointer accent-rose-500 bg-gray-200"
            style={{
              background: `linear-gradient(to right, #F43F5E ${value}%, #E5E7EB ${value}%)`,
            }}
          />
          <div className="flex justify-between text-xs font-semibold text-gray-400 mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>{labels.length > 5 ? labels[5] : '100% ∞'}</span>
          </div>
        </div>

        {burst && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-2xl font-bold font-script text-rose-600"
          >
            {couple.lovemeterSuccessMessage || "Overflowing with Love! 🌹✨"}
          </motion.p>
        )}
      </div>
    </section>
  );
}
