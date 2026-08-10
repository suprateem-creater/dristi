import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';

export default function KissButton() {
  const { couple } = useCouple();
  const [message, setMessage] = useState(null);
  const [msgKey, setMsgKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    const handler = (e) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const sendKiss = () => {
    setMessage(couple.kissSuccessMessage || 'A kiss has been delivered 💋');
    setMsgKey(k => k + 1);
    
    // Auto-clear message
    const msgTimer = setTimeout(() => setMessage(null), 3000);

    if (shouldReduceMotion) return () => clearTimeout(msgTimer);

    // Trigger button and glow animations
    setIsAnimating(true);
    const animTimer = setTimeout(() => setIsAnimating(false), 600);

    // Create 8-12 particles staggered
    const count = 10;
    const now = Date.now();
    const newParticles = [];

    for (let i = 0; i < count; i++) {
      const randomX = (Math.random() - 0.5) * 160;
      const randomY = -60 - Math.random() * 80;
      const size = Math.random() * 16 + 16;
      const rotation = (Math.random() - 0.5) * 60;
      const char = ['💋', '❤️', '💕', '💖'][Math.floor(Math.random() * 4)];
      const delay = Math.random() * 0.12;

      newParticles.push({
        id: `${now}-${i}`,
        char,
        size,
        x: randomX,
        y: randomY,
        rotation,
        delay,
      });
    }

    setParticles(prev => {
      const combined = [...prev, ...newParticles];
      if (combined.length > 20) {
        return combined.slice(combined.length - 20);
      }
      return combined;
    });

    const cleanupTimer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);

    return () => {
      clearTimeout(msgTimer);
      clearTimeout(animTimer);
      clearTimeout(cleanupTimer);
    };
  };

  const rawButtonText = couple.kissButtonText || "Send A Kiss 💋";
  const cleanButtonText = rawButtonText.replace(/💋/g, '').trim();

  return (
    <section id="kiss" className="section-wrapper text-center relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}>
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

        <div className="relative inline-flex items-center justify-center my-6 w-full">
          {/* Lightweight GPU particles */}
          {particles.map(p => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0.7, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [1, 1, 0],
                x: p.x,
                y: [0, p.y, p.y - 40],
                scale: [0.7, 1.1, 0.8],
                rotate: p.rotation,
              }}
              transition={{
                duration: 0.9,
                delay: p.delay,
                ease: 'easeOut',
              }}
              className="absolute pointer-events-none select-none text-center leading-none z-10"
              style={{
                fontSize: `${p.size}px`,
                willChange: 'transform, opacity',
              }}
            >
              {p.char}
            </motion.span>
          ))}

          {/* Soft expansion glow background */}
          <motion.div
            animate={isAnimating ? { scale: [1, 1.4], opacity: [0, 0.45, 0] } : { scale: 1, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-28 h-28 bg-rose-200/40 rounded-full pointer-events-none"
          />

          <motion.button
            type="button"
            onClick={sendKiss}
            animate={isAnimating ? { scale: [1, 0.96, 1] } : {}}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="text-6xl rounded-full w-28 h-28 flex items-center justify-center cursor-pointer select-none bg-gradient-to-br from-rose-200 via-rose-300 to-rose-450 border-none shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden"
            aria-label="Send a kiss"
          >
            <motion.span
              animate={isAnimating ? { scale: [1, 0.92, 1.08, 1] } : {}}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="block"
            >
              💋
            </motion.span>
          </motion.button>
        </div>

        <div className="mt-4 flex justify-center">
          <motion.button
            whileHover={{ y: -3, scale: 1.025 }}
            whileTap={{ y: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={sendKiss}
            className="relative px-9 py-3.5 md:px-11 md:py-4 rounded-full text-white font-semibold tracking-wide border border-white/20 cursor-pointer shadow-[0_8px_20px_-4px_rgba(225,29,72,0.35),_inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_14px_28px_-2px_rgba(225,29,72,0.45),_inset_0_1px_1px_rgba(255,255,255,0.5)] transition-[box-shadow,background-color,border-color] duration-300"
            style={{ 
              background: 'linear-gradient(135deg, #FFB3C1 0%, #FF758F 50%, #E11D48 100%)', 
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif" 
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="leading-none">{cleanButtonText}</span>
              <motion.span 
                animate={isAnimating ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="inline-block text-lg md:text-xl align-middle leading-none select-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
              >
                💋
              </motion.span>
            </span>
          </motion.button>
        </div>

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

