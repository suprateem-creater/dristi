import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spawnHearts } from './HeartCanvas';
import { useCouple } from '../CoupleContext';
import { useSound } from '../SoundContext';

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
  const { couple } = useCouple();
  const [blown, setBlown] = useState([false, false]);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const { playSound } = useSound();

  const blowCandle = (index, e) => {
    if (blown[index]) return;
    playSound('candle-extinguish');
    const next = [...blown];
    next[index] = true;
    setBlown(next);
    spawnHearts(e.clientX, e.clientY, 6);
    if (next.every(Boolean)) {
      setTimeout(() => {
        playSound('celebration');
        setRevealed(true);
        setConfetti(true);
        for (let i = 0; i < 20; i++) {
          setTimeout(() => spawnHearts(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.5, 4), i * 80);
        }
        setTimeout(() => setConfetti(false), 4000);
      }, 600);
    }
  };

  const reset = () => { 
    playSound('candle-light');
    setBlown([false, false]); 
    setRevealed(false); 
  };

  return (
    <section id="cake" className="py-24 px-4 relative overflow-hidden" style={{ background: 'transparent' }}>
      <Confetti active={confetti} />
      
      {/* Soft spotlight behind the cake scene */}
      <div 
        className="absolute w-[80vw] h-[80vw] max-w-[700px] rounded-full pointer-events-none z-0 opacity-20"
        style={{
          left: '50%',
          top: '55%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(234, 214, 195, 0.14) 0%, rgba(168, 78, 89, 0.08) 50%, transparent 70%)',
          filter: 'blur(45px)'
        }}
      />

      <div className="section-container max-w-lg relative z-10 flex flex-col items-center">
        
        {/* Editorial Subtitle & Title */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-10 text-center"
        >
          <span className="section-eyebrow text-[#FF758F] tracking-[0.2em] text-[10px] uppercase font-semibold">
            {couple.cakeEyebrow || "One Year of Magic"}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-[#FAF6F0] tracking-[0.05em] uppercase mt-2 mb-3">
            {couple.cakeTitle || "Make a Wish"}
          </h2>
          <p className="text-xs font-sans tracking-wide text-[#EAD6C3]/75 max-w-xs mx-auto leading-relaxed">
            {!blown.every(Boolean) 
              ? (couple.cakeBlowMessage || 'Tap each glowing candle to blow it out together 🎂') 
              : (couple.cakeSuccessMessage || 'Your wish is sealed in our hearts! ✨')}
          </p>
        </motion.div>

        {/* Premium Illustrated Cake SVG */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }} 
          transition={{ type: 'spring', stiffness: 140, damping: 16 }} 
          className="mx-auto mb-8 w-64 sm:w-72 select-none"
        >
          <svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
            <defs>
              {/* Cake base layer gradient */}
              <linearGradient id="cakeBase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C4737B" />
                <stop offset="100%" stopColor="#8A3E47" />
              </linearGradient>
              {/* Cake top layer gradient */}
              <linearGradient id="cakeTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EAD6C3" />
                <stop offset="100%" stopColor="#B39982" />
              </linearGradient>
              {/* Candle gradient */}
              <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CDB39B" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FCFAF5" />
                <stop offset="100%" stopColor="#B39982" stopOpacity="0.8" />
              </linearGradient>
              {/* Candle Glow filter */}
              <filter id="candleHalos" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* Stand / Plate Shadow */}
            <ellipse cx="130" cy="188" rx="112" ry="10" fill="rgba(6, 2, 10, 0.5)" />
            
            {/* Stand / Plate Surface */}
            <ellipse cx="130" cy="184" rx="108" ry="8" fill="#FCFAF5" opacity="0.08" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* Bottom Layer Cake Body */}
            <rect x="25" y="125" width="210" height="56" rx="12" fill="url(#cakeBase)" />
            
            {/* Bottom Layer Frosting (Dripping path) */}
            <path d="M 25,138 C 35,147 45,138 55,143 C 65,148 75,138 85,143 C 95,148 105,138 115,143 C 125,148 135,138 145,143 C 155,148 165,138 175,143 C 185,148 195,138 205,143 C 215,148 225,138 235,138 L 235,125 L 25,125 Z" fill="#FCFAF5" opacity="0.94" />

            {/* Frosting sprinkles pearls */}
            {[45, 80, 115, 150, 185, 220].map(x => (
              <circle key={x} cx={x} cy="158" r="3" fill="#EAD6C3" opacity="0.8" />
            ))}

            {/* Top Layer Cake Body */}
            <rect x="55" y="75" width="150" height="50" rx="10" fill="url(#cakeTop)" />
            
            {/* Top Layer Frosting (Dripping path) */}
            <path d="M 55,87 Q 65,95 75,87 Q 85,95 95,87 Q 105,95 115,87 Q 125,95 135,87 Q 145,95 155,87 Q 165,95 175,87 Q 185,95 195,87 L 205,87 L 205,75 L 55,75 Z" fill="#FCFAF5" opacity="0.95" />

            {/* Dimensional serif number '1' */}
            <text x="130" y="112" textAnchor="middle" fontSize="24" fontFamily="Cormorant Garamond, Playfair Display, serif" fontWeight="300" fill="#8C3A44" opacity="0.85">
              {couple.cakeYears ?? 1}
            </text>

            {/* Candles Interactive Group */}
            {[95, 165].map((cx, i) => (
              <g key={i} onClick={(e) => blowCandle(i, e)} style={{ cursor: blown[i] ? 'default' : 'pointer' }}>
                
                {/* Candle body */}
                <rect x={cx - 5} y="44" width="10" height="32" rx="2" fill="url(#candleGrad)" />
                
                {/* Wick */}
                <line x1={cx} y1="44" x2={cx} y2="36" stroke="#4A3B32" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Candle flame glow halo */}
                {!blown[i] && (
                  <circle cx={cx} cy="24" r="24" fill="rgba(240, 192, 96, 0.12)" filter="url(#candleHalos)" pointerEvents="none" />
                )}
                
                {/* Candle flame animation */}
                {!blown[i] && (
                  <motion.g 
                    animate={{ scaleY: [1, 1.12, 0.92, 1], scaleX: [1, 0.92, 1.08, 1], y: [0, -1, 0] }} 
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} 
                    style={{ transformOrigin: `${cx}px 32px` }}
                  >
                    {/* Outer flame */}
                    <path d={`M ${cx - 5} 24 Q ${cx} 10 ${cx + 5} 24 Q ${cx} 32 ${cx - 5} 24 Z`} fill="#F0C060" opacity="0.9" />
                    {/* Inner core */}
                    <path d={`M ${cx - 2.5} 24 Q ${cx} 16 ${cx + 2.5} 24 Q ${cx} 28 ${cx - 2.5} 24 Z`} fill="#FF8C42" />
                    <ellipse cx={cx} cy="26" rx="1.5" ry="3" fill="#FFFDF9" opacity="0.95" />
                  </motion.g>
                )}
                
                {/* Extinguished Smoke Trail */}
                {blown[i] && (
                  <motion.g initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 0.6, 0], y: [-5, -25], x: [0, 5, -2] }} transition={{ duration: 1.6 }}>
                    <path d={`M ${cx} 32 Q ${cx + 2} 24 ${cx - 2} 16 T ${cx + 4} 0`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                  </motion.g>
                )}
              </g>
            ))}
          </svg>
        </motion.div>

        {/* Elegant Candle Indicators */}
        <div className="flex justify-center gap-6 mb-8 text-[11px] font-sans tracking-[0.18em] uppercase select-none">
          {blown.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5 transition-all duration-300" style={{ color: b ? 'rgba(255,255,255,0.3)' : '#FF758F' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: b ? 'rgba(255,255,255,0.2)' : '#FF758F', boxShadow: b ? 'none' : '0 0 8px #FF758F' }} />
              <span>Candle {i + 1} {b ? 'Out' : 'Lit'}</span>
            </span>
          ))}
        </div>

        {/* Floating Celebration Message Stationery */}
        <AnimatePresence>
          {revealed && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              transition={{ type: 'spring', stiffness: 180, damping: 18 }} 
              className="w-full max-w-md mx-auto rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden select-none border-none"
              style={{ 
                background: 'linear-gradient(to bottom, #FCFAF5 0%, #F5F1E8 100%)',
                boxShadow: 'inset 0 0 16px rgba(201,160,138,0.12), 0 20px 45px rgba(0,0,0,0.3)',
              }}
            >
              <div className="text-3xl mb-4 opacity-80 select-none">🎉</div>
              
              <p className="text-xl sm:text-2xl font-serif font-light mb-3 text-[#A84E59] tracking-wide leading-snug">
                {couple.cakeRevealedMessage || "Here's to another year of us."}
              </p>
              
              <p className="text-sm font-serif text-[#3A2E2B] leading-relaxed italic" style={{ fontSize: '1.05rem' }}>
                {couple.cakeRevealedSubtitle || "May every year be sweeter than the last. 🎂✨"}
              </p>
              
              <div className="flex justify-center mt-6">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -0.5 }} 
                  whileTap={{ scale: 0.98 }} 
                  onClick={reset} 
                  className="px-6 py-2 rounded-full text-xs font-sans tracking-widest uppercase transition cursor-pointer border shadow-xs"
                  style={{ 
                    background: 'rgba(212, 131, 138, 0.06)', 
                    color: '#A84E59', 
                    borderColor: 'rgba(212, 131, 138, 0.22)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                  }}
                >
                  Light Candles Again ↻
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
