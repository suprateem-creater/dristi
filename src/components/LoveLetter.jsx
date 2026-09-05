import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
import { useSound } from '../SoundContext';

export default function LoveLetter() {
  const { couple } = useCouple();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const text = couple.loveLetterText;
  const { playSound } = useSound();

  useEffect(() => {
    if (!open) {
      setTyped('');
      return;
    }
    
    let i = 0;

    const interval = setInterval(() => {
      if (i < text.length) {
        setTyped(text.slice(0, ++i));
      } else {
        clearInterval(interval);
      }
    }, 38);

    return () => {
      clearInterval(interval);
      // No requestAnimationFrames to cancel
    };
  }, [open, text, playSound]);

  // Play typing sound after each new audible character is rendered
  const prevTypedRef = useRef('');
  useEffect(() => {
    if (!open) return;
    if (typed.length > prevTypedRef.current.length) {
      const newChar = typed[typed.length - 1];
      const isAudible = newChar && newChar.trim() !== '';
      if (isAudible) {
        playSound('typing');
      }
    }
    prevTypedRef.current = typed;
  }, [typed, open, playSound]);

  const handleOpen = (e) => {
    playSound('letter-open');
    setOpen(true);
    spawnHearts(e.clientX, e.clientY, 8);
  };

  // Ambient decorative petals with stable positions
  const petals = useMemo(() => 
    Array.from({ length: 18 }).map((_, i) => ({
      left: `${5 + Math.random() * 90}%`,
      top: `${5 + Math.random() * 90}%`,
      size: Math.random() * 16 + 8,
      delay: Math.random() * 6,
      duration: Math.random() * 5 + 5,
      rotation: Math.random() * 360,
      emoji: ['🌸', '✨', '💫', '🩷', '🤍', '·'][i % 6],
      opacity: 0.15 + Math.random() * 0.25,
    })), []);

  return (
    <section
      id="letter"
      className="section-wrapper text-center relative overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* Ambient Floating Decorations */}
      {petals.map((p, i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(i) * 10, 0],
            rotate: [p.rotation, p.rotation + 30, p.rotation],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          className="absolute pointer-events-none select-none"
          style={{ left: p.left, top: p.top, fontSize: p.size, opacity: p.opacity }}
        >
          {p.emoji}
        </motion.span>
      ))}

      {/* Soft spotlight behind the letter */}
      <div 
        className="absolute w-[80vw] h-[80vw] max-w-[800px] rounded-full pointer-events-none z-0 opacity-20"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(234, 214, 195, 0.15) 0%, transparent 60%)',
          filter: 'blur(50px)'
        }}
      />

      <div className="section-container max-w-2xl text-center relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-12"
        >
          <span className="section-eyebrow">A Little Surprise</span>
          <h2 className="section-title">A Letter For You</h2>
          <p className="section-subtitle">
            Some feelings are too precious for spoken words — so I sealed them here, just for you.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
              className="inline-block cursor-pointer group"
              onClick={handleOpen}
            >
              {/* Envelope Card */}
              <div className="relative mx-auto w-72 h-52">
                {/* Shadow under envelope */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-4 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.08)', filter: 'blur(12px)' }}
                />

                {/* Envelope body */}
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(212,131,138,0.3)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-full h-full rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg, #FFE8EC, #FFF3F0, #FFE4E8)',
                    border: '2px solid rgba(201,160,138,0.35)',
                  }}
                >
                  {/* Inner paper peek */}
                  <div
                    className="absolute top-3 left-1/2 -translate-x-1/2 w-[85%] h-[30%] rounded-t-lg"
                    style={{ background: '#FFFDF9', border: '1px solid rgba(201,160,138,0.15)', borderBottom: 'none' }}
                  />

                  {/* Diagonal fold lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full"
                      style={{
                        background: 'linear-gradient(135deg, transparent 30%, rgba(212,131,138,0.06) 30%, rgba(212,131,138,0.06) 31%, transparent 31%)',
                      }}
                    />
                  </div>

                  <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300" style={{ filter: 'drop-shadow(0 4px 12px rgba(212,131,138,0.4))' }}>
                    💌
                  </span>
                </motion.div>

                {/* Wax seal */}
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-lg"
                  style={{
                    background: 'radial-gradient(circle, #E85D75, #D4838A)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(212,131,138,0.6)',
                    border: '2px solid rgba(255,255,255,0.5)',
                  }}
                >
                  ♡
                </motion.div>
              </div>

              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="mt-8 text-sm font-medium"
                style={{ color: '#D4838A' }}
              >
                Tap to open your letter ✨
              </motion.p>

              {/* Decorative quote */}
              <p className="mt-4 text-xs sm:text-sm font-serif italic max-w-sm mx-auto leading-relaxed text-[#B8A8A0] tracking-wide">
                “The best love letters are the ones that arrive when you need them most.”
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-xl mx-auto rounded-2xl text-left relative overflow-hidden select-text"
              style={{
                background: 'linear-gradient(to bottom, #FCFAF5 0%, #F5F1E8 100%)',
                boxShadow: 'inset 0 0 16px rgba(201,160,138,0.12), 0 20px 45px rgba(0,0,0,0.3)',
                padding: 'clamp(2rem, 5vw, 3.5rem)',
                minHeight: '400px',
              }}
            >
              {/* Elegant botanical prints */}
              <div className="absolute top-4 left-6 text-base opacity-25 pointer-events-none select-none">🌸</div>
              <div className="absolute bottom-4 right-6 text-base opacity-25 pointer-events-none select-none">🌿</div>

              {/* Faint paper texture lines */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, #C9A08A 28px, #C9A08A 29px)',
                }}
              />

              {/* Date */}
              <p className="text-[10px] uppercase tracking-[0.2em] mb-8 text-right font-sans font-bold text-[#A89D90]">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              {/* Greeting */}
              <p className="text-xl sm:text-2xl mb-6 font-serif font-light tracking-wide text-[#A84E59]">
                My dearest {couple.partner2 || 'love'},
              </p>

              {/* Letter body with typewriter */}
              <p
                className="text-base sm:text-lg leading-relaxed whitespace-pre-line relative z-10 font-serif text-[#3A2E2B] text-left"
                style={{ lineHeight: 1.85, wordBreak: 'break-word' }}
              >
                {typed}
                {typed.length < text.length && (
                  <span className="inline-block w-0.5 h-5 bg-[#D4838A] animate-pulse ml-0.5 align-middle" />
                )}
              </p>

              {/* Sign-off */}
              {typed.length >= text.length && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-10 text-right"
                >
                  <p className="text-sm font-sans tracking-wide text-[#A84E59]">
                    Forever yours,
                  </p>
                  <p className="text-lg font-serif font-light mt-1 text-[#8C3A44]">
                    {couple.partner1 || 'Me'}
                  </p>
                </motion.div>
              )}

              {/* Close button */}
              <div className="flex justify-start mt-8">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSound('letter-seal');
                    setOpen(false);
                  }}
                  className="px-6 py-2 rounded-full cursor-pointer text-xs font-sans tracking-widest uppercase transition border shadow-xs"
                  style={{
                    background: 'rgba(212, 131, 138, 0.08)',
                    color: '#A84E59',
                    borderColor: 'rgba(212, 131, 138, 0.25)',
                  }}
                >
                  Seal the letter 💌
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
