import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Countdown from './Countdown';
import { couple } from '../coupleData';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1A0A1E 0%, #2D1535 30%, #0D1020 70%, #0A0A1A 100%)' }}
    >
      {/* Background parallax image */}
      <motion.div
        style={{ y, scale, opacity: 0.15 }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=60"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'blur(2px)' }}
        />
      </motion.div>

      {/* Glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(232,180,184,0.12) 0%, transparent 70%)' }}
      />

      {/* Animated particles in background */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -(Math.random() * 60 + 20)],
            opacity: [0, 0.7, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeOut',
          }}
          className="absolute text-xs pointer-events-none select-none"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 30}%`,
            color: ['#E8B4B8', '#C9A08A', '#D4838A'][i % 3],
            fontSize: Math.random() * 12 + 8,
          }}
        >
          ♡
        </motion.div>
      ))}

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-3xl">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm uppercase tracking-[0.3em] mb-6"
          style={{ color: '#E8B4B8' }}
        >
          {couple.anniversaryDate} · One Year
        </motion.p>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4 leading-tight"
          style={{
            fontFamily: 'Playfair Display',
            background: 'linear-gradient(135deg, #FFFFFF, #E8B4B8, #C9A08A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          365 Days
          <br />
          <span className="italic">of Us</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-lg md:text-xl mb-4"
          style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter', fontWeight: 300 }}
        >
          {couple.partner1} & {couple.partner2}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-base mb-16"
          style={{ color: 'rgba(232,180,184,0.6)', fontFamily: 'Dancing Script', fontSize: '1.3rem' }}
        >
          "Every day with you is my favorite day."
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mb-6"
        >
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Time Together
          </p>
          <Countdown />
        </motion.div>
      </motion.div>

      {/* Scroll arrow */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'rgba(232,180,184,0.6)' }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ fontFamily: 'Inter' }}>Scroll</span>
        <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
          <path d="M10 0 L10 20 M4 14 L10 20 L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.div>
    </section>
  );
}
