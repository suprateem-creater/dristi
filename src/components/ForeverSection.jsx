import { motion } from 'framer-motion';
import { couple } from '../coupleData';
import { spawnHearts } from './HeartCanvas';

export default function ForeverSection({ topRef }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTap = (e) => {
    const x = e.clientX ?? window.innerWidth / 2;
    const y = e.clientY ?? window.innerHeight / 2;
    for (let i = 0; i < 30; i++) {
      setTimeout(() => spawnHearts(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        4
      ), i * 50);
    }
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden text-center"
      style={{ background: 'linear-gradient(180deg, #1A0A20 0%, #0A0A1A 40%, #1A0512 100%)' }}
      onClick={handleTap}
    >
      {/* Animated particle stars */}
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 5 }}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            width:  Math.random() * 2.5 + 0.5,
            height: Math.random() * 2.5 + 0.5,
            left:   `${Math.random() * 100}%`,
            top:    `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Central glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(212,131,138,0.3) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Big glow heart */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl mb-10 pointer-events-none select-none"
          style={{ filter: 'drop-shadow(0 0 40px rgba(212,131,138,0.7)) drop-shadow(0 0 80px rgba(212,131,138,0.3))' }}
        >
          ❤️
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-light mb-4"
          style={{ fontFamily: 'Playfair Display', color: 'white', lineHeight: 1.2 }}
        >
          365 days down.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-5xl md:text-7xl font-light mb-14"
          style={{ fontFamily: 'Playfair Display', color: '#E8B4B8', lineHeight: 1.2 }}
        >
          Forever to go.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <span style={{ fontFamily: 'Dancing Script', fontSize: '2rem', color: 'rgba(232,180,184,0.8)' }}>
            {couple.partner1}
          </span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: '#D4838A', fontSize: '1.8rem' }}
          >
            ♡
          </motion.span>
          <span style={{ fontFamily: 'Dancing Script', fontSize: '2rem', color: 'rgba(232,180,184,0.8)' }}>
            {couple.partner2}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="text-sm mb-12"
          style={{ color: 'rgba(232,180,184,0.4)' }}
        >
          Tap anywhere to fill the sky with love ✨
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4 }}
          whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(212,131,138,0.4)' }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => { e.stopPropagation(); scrollToTop(); }}
          className="px-8 py-4 rounded-full text-white font-medium text-sm flex items-center gap-3 mx-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(212,131,138,0.25), rgba(201,160,138,0.25))',
            border: '1px solid rgba(232,180,184,0.35)',
            backdropFilter: 'blur(12px)',
            fontFamily: 'Inter',
          }}
        >
          <span>↑</span>
          Replay Our Story
        </motion.button>
      </div>

      {/* Since date */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 text-xs"
        style={{ color: 'rgba(232,180,184,0.3)', fontFamily: 'Inter', letterSpacing: '0.1em' }}
      >
        Since {couple.anniversaryDate} · Made with ❤️
      </motion.p>
    </section>
  );
}
