import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCouple } from '../CoupleContext';

export default function InitialsAnimation() {
  const { couple } = useCouple();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2;
      const cy = e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height / 2;
      mouseX.set(((cx - rect.left) / rect.width - 0.5) * 20);
      mouseY.set(((cy - rect.top) / rect.height - 0.5) * 20);
    };
    const el = containerRef.current;
    el?.addEventListener('mousemove', handleMove, { passive: true });
    el?.addEventListener('touchmove', handleMove, { passive: true });
    return () => {
      el?.removeEventListener('mousemove', handleMove);
      el?.removeEventListener('touchmove', handleMove);
    };
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      className="py-28 px-4 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D0A14, #1A0A1E)' }}
    >
      {/* Orbiting particles */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }}
          className="absolute"
          style={{ left: '50%', top: '50%', width: 0, height: 0 }}
        >
          <div
            style={{
              transform: `translateX(90px) translateY(-50%)`,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#E8B4B8',
              boxShadow: '0 0 12px rgba(232,180,184,0.8)',
              position: 'absolute',
            }}
          />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, type: 'spring' }}
        style={{ rotateX: springY, rotateY: springX }}
        className="relative z-10"
      >
        <h2
          className="text-6xl md:text-8xl font-bold mb-4"
          style={{
            fontFamily: 'Playfair Display',
            background: 'linear-gradient(135deg, #E8B4B8, #C9A08A, #D4A853)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 30px rgba(232,180,184,0.4))',
          }}
        >
          {couple.initials}
        </h2>
        <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter' }}>
          {couple.partner1} & {couple.partner2}
        </p>
        <p className="text-sm mt-2" style={{ color: 'rgba(232,180,184,0.6)' }}>
          Move your cursor to feel the connection ✨
        </p>
      </motion.div>

      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(232,180,184,0.08), transparent 60%)' }}
      />
    </section>
  );
}
