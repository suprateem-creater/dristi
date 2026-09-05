import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useCouple } from '../CoupleContext';

/**
 * MagneticButton - Anti-Gravity UI Micro-interaction (Pillar 5)
 * Subtly pulls toward the cursor using physical spring damping,
 * oscillating microscopically upon release back to equilibrium.
 */
function MagneticButton({ children, onClick, className, style, ariaLabel }) {
  const shouldReduceMotion = useReducedMotion();
  const btnRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics conforming to Pillar 1 (mass: 0.5, stiffness: 350, damping: 22)
  const springConfig = { damping: 22, stiffness: 350, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Magnetic pull radius factor (max displacement ~14px)
    const pullX = (e.clientX - centerX) * 0.22;
    const pullY = (e.clientY - centerY) * 0.22;
    mouseX.set(pullX);
    mouseY.set(pullY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.button
      ref={btnRef}
      type="button"
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        x: shouldReduceMotion ? 0 : smoothX,
        y: shouldReduceMotion ? 0 : smoothY,
      }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.035 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25, mass: 0.6 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export default function KissButton() {
  const { couple } = useCouple();
  const [message, setMessage] = useState(null);
  const [msgKey, setMsgKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const shouldReduceMotion = useReducedMotion();

  const sendKiss = () => {
    setMessage(couple.kissSuccessMessage || 'A kiss has been delivered 💋');
    setMsgKey(k => k + 1);

    // Auto-clear message
    const msgTimer = setTimeout(() => setMessage(null), 3200);

    if (shouldReduceMotion) return () => clearTimeout(msgTimer);

    // Trigger pulse and glow animations
    setIsAnimating(true);
    const animTimer = setTimeout(() => setIsAnimating(false), 650);

    // Spawn staggered weightless particles
    const count = 12;
    const now = Date.now();
    const newParticles = [];

    for (let i = 0; i < count; i++) {
      const randomX = (Math.random() - 0.5) * 180;
      const randomY = -80 - Math.random() * 110;
      const size = Math.random() * 16 + 18;
      const rotation = (Math.random() - 0.5) * 45;
      const char = ['💋', '❤️', '💕', '💖', '✨'][Math.floor(Math.random() * 5)];
      const delay = Math.random() * 0.14;

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
      if (combined.length > 24) {
        return combined.slice(combined.length - 24);
      }
      return combined;
    });

    const cleanupTimer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1300);

    return () => {
      clearTimeout(msgTimer);
      clearTimeout(animTimer);
      clearTimeout(cleanupTimer);
    };
  };

  const rawButtonText = couple.kissButtonText || "Send A Kiss 💋";
  const cleanButtonText = rawButtonText.replace(/💋/g, '').trim();

  // The Apple Standard curve for decelerating upward float: cubic-bezier(0.16, 1, 0.3, 1)
  const floatEase = [0.16, 1, 0.3, 1];

  return (
    <section 
      id="kiss" 
      className="section-wrapper text-center relative overflow-hidden" 
      style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}
    >
      <div className="section-container max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: floatEase }}
          className="section-header mb-8"
        >
          <span className="section-eyebrow">{couple.kissEyebrow || "Just Because"}</span>
          <h2 className="section-title">{couple.kissTitle || "Send a Kiss"}</h2>
          <p className="section-subtitle">{couple.kissSubtitle || "Tap the giant kiss to send a virtual shower of love!"}</p>
        </motion.div>

        <div className="relative inline-flex items-center justify-center my-6 w-full">
          {/* Weightless Floating Particles with Atmospheric Deceleration */}
          {particles.map(p => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, scale: 0.8, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: p.x,
                y: [0, p.y * 0.7, p.y],
                scale: [0.8, 1.15, 0.95],
                rotate: p.rotation,
              }}
              transition={{
                duration: 1.1,
                delay: p.delay,
                ease: floatEase,
                times: [0, 0.15, 0.7, 1],
              }}
              className="absolute pointer-events-none select-none text-center leading-none z-20"
              style={{
                fontSize: `${p.size}px`,
                willChange: 'transform, opacity',
                filter: 'drop-shadow(0 4px 8px rgba(225, 29, 72, 0.2))',
              }}
            >
              {p.char}
            </motion.span>
          ))}

          {/* Living Aurora Pulsing Glow */}
          <motion.div
            animate={isAnimating ? { scale: [1, 1.55], opacity: [0, 0.55, 0] } : { scale: 1, opacity: 0 }}
            transition={{ duration: 0.65, ease: floatEase }}
            className="absolute w-32 h-32 bg-gradient-to-tr from-rose-400/40 via-pink-300/30 to-rose-200/20 rounded-full blur-xl pointer-events-none"
          />

          {/* Giant Magnetic Circular Button */}
          <MagneticButton
            onClick={sendKiss}
            ariaLabel="Send a giant kiss"
            className="text-6xl rounded-full w-28 h-28 flex items-center justify-center cursor-pointer select-none bg-gradient-to-br from-rose-200 via-rose-300 to-rose-400 border border-white/40 relative overflow-hidden"
            style={{
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.12), 0 12px 28px rgba(225, 29, 72, 0.16), 0 24px 48px rgba(225, 29, 72, 0.10)',
            }}
          >
            <motion.span
              animate={isAnimating ? { scale: [1, 0.88, 1.14, 1] } : {}}
              transition={{ type: 'spring', stiffness: 500, damping: 15, mass: 0.5 }}
              className="block filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
            >
              💋
            </motion.span>
          </MagneticButton>
        </div>

        {/* Magnetic Pill Call-to-Action with Multi-Layered Drop Shadow */}
        <div className="mt-4 flex justify-center">
          <MagneticButton
            onClick={sendKiss}
            ariaLabel={rawButtonText}
            className="relative px-9 py-3.5 md:px-11 md:py-4 rounded-full text-white font-semibold tracking-wide border border-white/25 cursor-pointer"
            style={{ 
              background: 'linear-gradient(135deg, #FFB3C1 0%, #FF758F 50%, #E11D48 100%)', 
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25), 0 10px 28px rgba(225, 29, 72, 0.20), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="leading-none">{cleanButtonText}</span>
              <motion.span 
                animate={isAnimating ? { scale: [1, 1.35, 1], rotate: [0, 18, -18, 0] } : {}}
                transition={{ type: 'spring', stiffness: 450, damping: 14 }}
                className="inline-block text-lg md:text-xl align-middle leading-none select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
              >
                💋
              </motion.span>
            </span>
          </MagneticButton>
        </div>

        {/* Kinetic Entrance for Success Message */}
        <div className="h-12 mt-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {message && (
              <motion.p
                key={msgKey}
                initial={{ opacity: 0, y: 14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.35, ease: floatEase }}
                className="text-base font-medium"
                style={{ fontFamily: 'Dancing Script', color: '#D4838A', fontSize: '1.35rem' }}
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


