import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';
import { spawnHearts } from './HeartCanvas';

export default function OpenWhenCards() {
  const [openCard, setOpenCard] = useState(null);
  const [opened, setOpened] = useState(new Set());

  const handleOpen = (card, e) => {
    setOpenCard(card);
    setOpened(prev => new Set([...prev, card.label]));
    // Spawn hearts around the click
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnHearts(x + (Math.random()-0.5)*80, y + (Math.random()-0.5)*80, 3), i * 80);
    }
  };

  return (
    <section className="py-24 px-4" style={{ background: '#FDFBF7' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>For Every Moment</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Open When...
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {couple.openWhenCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={(e) => handleOpen(card, e)}
              className="cursor-pointer rounded-2xl p-6 relative overflow-hidden group"
              style={{
                background: opened.has(card.label)
                  ? 'linear-gradient(135deg, #D4838A, #C9A08A)'
                  : 'linear-gradient(135deg, #FFF8F0, #FFE4E8)',
                border: '1px solid rgba(201,160,138,0.3)',
                boxShadow: '0 4px 20px rgba(201,160,138,0.15)',
              }}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3
                className="text-base font-semibold"
                style={{ fontFamily: 'Playfair Display', color: opened.has(card.label) ? 'white' : '#3D3D3D' }}
              >
                {card.label}
              </h3>
              {!opened.has(card.label) && (
                <p className="mt-2 text-xs" style={{ color: '#D4838A' }}>Click to open ✉️</p>
              )}
              {opened.has(card.label) && (
                <p className="mt-2 text-xs text-white opacity-80">Opened ✓</p>
              )}
              {/* Decorative seal */}
              <div
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{ background: opened.has(card.label) ? 'rgba(255,255,255,0.3)' : '#D4838A', color: 'white' }}
              >
                ♡
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setOpenCard(null)}
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: -90 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.5, rotateY: 90, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-md w-full rounded-3xl p-8 text-center"
              style={{ background: '#FFFDF9', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">{openCard.icon}</div>
              <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>
                {openCard.label}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ fontFamily: 'Dancing Script', color: '#3D3D3D', fontSize: '1.2rem' }}
              >
                {openCard.message}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setOpenCard(null)}
                className="mt-8 px-6 py-2 rounded-full text-sm"
                style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)', color: 'white', fontFamily: 'Inter' }}
              >
                Close ♡
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
