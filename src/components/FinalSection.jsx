import { motion } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';

export default function FinalSection() {
  const { couple } = useCouple();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTap = (e) => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        spawnHearts(
          e.clientX + (Math.random() - 0.5) * 100,
          e.clientY + (Math.random() - 0.5) * 200,
          5
        );
      }, i * 40);
    }
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden cursor-pointer"
      style={{ background: 'linear-gradient(160deg, #0A0A1A, #1A0A20, #0D1020)' }}
      onClick={handleTap}
    >
      {/* Background particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -(Math.random() * 80 + 40)],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            delay: Math.random() * 6,
          }}
          className="absolute pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: 0,
            color: ['#E8B4B8', '#C9A08A', '#D4838A', 'white'][i % 4],
            fontSize: Math.random() * 14 + 6,
          }}
        >
          {['♡', '✦', '✧', '⋆'][i % 4]}
        </motion.div>
      ))}

      {/* Glowing heart background */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute text-[30rem] pointer-events-none select-none"
        style={{ color: '#D4838A', lineHeight: 1 }}
      >
        ❤️
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-2xl"
      >
        <p className="text-sm uppercase tracking-[0.3em] mb-8" style={{ color: '#E8B4B8' }}>
          And Counting...
        </p>

        <h2
          className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4"
          style={{
            fontFamily: 'Playfair Display',
            background: 'linear-gradient(135deg, #FFFFFF, #E8B4B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          365 days down.
        </h2>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-4xl sm:text-6xl font-bold mb-12 italic"
          style={{
            fontFamily: 'Playfair Display',
            background: 'linear-gradient(135deg, #E8B4B8, #C9A08A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Forever to go.
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-2xl mb-12"
          style={{ fontFamily: 'Dancing Script', color: 'rgba(232,180,184,0.8)', fontSize: '2rem' }}
        >
          {couple.partner1} & {couple.partner2} ♡
        </motion.p>

        <p className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Tap anywhere on this section to send love ♡
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); scrollToTop(); }}
          className="px-8 py-3 rounded-full text-sm font-medium"
          style={{
            background: 'rgba(232,180,184,0.15)',
            color: '#E8B4B8',
            border: '1px solid rgba(232,180,184,0.3)',
            fontFamily: 'Inter',
          }}
        >
          ↑ Replay Our Story
        </motion.button>
      </motion.div>
    </section>
  );
}
