import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';

function DreamCard({ dream, index }) {
  const [expanded, setExpanded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (expanded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top)  / rect.height - 0.5) * 14;
    const y = -((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    setTilt({ x, y });
  };

  const floatDelay = index * 0.4;
  const rotations = [-3, 2, -1.5, 2.5, -2, 1];
  const rotation = rotations[index % rotations.length];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        animate={{
          y: [0, -10, 0],
          rotate: [rotation, rotation + 0.5, rotation],
        }}
        // @ts-ignore
        transition={{
          y:      { duration: 3 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
          rotate: { duration: 4 + index * 0.2, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
        }}
        whileHover={{ scale: 1.05, zIndex: 10 }}
        onClick={() => setExpanded(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          perspective: 800,
          cursor: 'pointer',
        }}
        className="relative rounded-2xl p-6 flex flex-col items-center text-center select-none"
      >
        <div
          className="w-full h-full rounded-2xl p-6 flex flex-col items-center text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,248,240,0.95), rgba(255,228,232,0.95))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(201,160,138,0.35)',
            boxShadow: '0 8px 32px rgba(201,160,138,0.2)',
          }}
        >
          <div className="text-4xl mb-4">
            {['🌅', '✈️', '🌙', '📸', '🏡', '🎉'][index % 6]}
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}
          >
            {dream.title}
          </h3>
          <p className="text-xs" style={{ color: '#8A8A9A' }}>Tap to dream ✨</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(61,61,61,0.6)' }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-sm w-full rounded-3xl p-10 text-center"
              style={{ background: '#FFFDF9', boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-5">
                {['🌅', '✈️', '🌙', '📸', '🏡', '🎉'][index % 6]}
              </div>
              <h3
                className="text-2xl font-semibold mb-4"
                style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}
              >
                {dream.title}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ fontFamily: 'Dancing Script', color: '#3D3D3D', fontSize: '1.2rem' }}
              >
                {dream.desc}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(false)}
                className="mt-8 px-6 py-2 rounded-full text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)' }}
              >
                Close ♡
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function FutureDreams() {
  return (
    <section
      className="py-24 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFF0F3, #FDFBF7)' }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>
            All the Good That's Still to Come
          </p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Our Future Together
          </h2>
          <p className="mt-3 text-sm" style={{ color: '#5A5A5A' }}>
            Tap each dream to read more
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
          {couple.futureDreams.map((dream, i) => (
            <DreamCard key={i} dream={dream} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
