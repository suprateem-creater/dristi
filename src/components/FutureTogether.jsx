import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';

export default function FutureTogether() {
  const { couple } = useCouple();
  const [expanded, setExpanded] = useState(null);

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFE4E8)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Looking Ahead</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Our Future Together
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {couple.futureDreams.map((dream, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10 - i * 2, 0],
                rotate: [(i % 2 === 0 ? -2 : 2), (i % 2 === 0 ? 2 : -2), (i % 2 === 0 ? -2 : 2)],
              }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05, y: -15, rotate: 0 }}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="rounded-2xl p-6 cursor-pointer text-center"
              style={{
                background: 'white',
                border: '1px solid rgba(201,160,138,0.3)',
                boxShadow: '0 8px 30px rgba(201,160,138,0.15)',
              }}
            >
              <div className="text-3xl mb-3">
                {['🌅', '✈️', '🌙', '📸', '🏠', '🎉'][i % 6]}
              </div>
              <h3 className="font-semibold text-sm" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>
                {dream.title}
              </h3>
              <AnimatePresence>
                {expanded === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-xs overflow-hidden"
                    style={{ color: '#5A5A5A' }}
                  >
                    {dream.desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
