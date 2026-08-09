import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';
import { spawnHearts } from './HeartCanvas';

export default function RandomLoveMessage() {
  const messages = couple.randomMessages;
  const [current, setCurrent] = useState(null);
  const [key, setKey] = useState(0);

  const generate = (e) => {
    const random = messages[Math.floor(Math.random() * messages.length)];
    setCurrent(random);
    setKey(k => k + 1);
    // Spawn hearts around the button
    const x = e.clientX ?? window.innerWidth / 2;
    const y = e.clientY ?? window.innerHeight / 2;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnHearts(x + (Math.random() - 0.5) * 120, y + (Math.random() - 0.5) * 60, 3), i * 80);
    }
  };

  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FDFBF7, #FFF0F3)' }}
    >
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>
            A Little Reminder
          </p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Words of Love
          </h2>
        </motion.div>

        {/* Message display */}
        <div className="min-h-[120px] flex items-center justify-center mb-10">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.p
                key={key}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="text-xl md:text-2xl leading-relaxed px-4"
                style={{
                  fontFamily: 'Dancing Script',
                  color: '#3D3D3D',
                  fontSize: '1.5rem',
                }}
              >
                {current}
              </motion.p>
            ) : (
              <motion.p
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-base"
                style={{ color: '#B0A0A8' }}
              >
                Press the button for a reason to smile ✨
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(212,131,138,0.4)' }}
          whileTap={{ scale: 0.94 }}
          onClick={generate}
          className="px-10 py-4 rounded-full text-white font-semibold text-base flex items-center gap-3 mx-auto"
          style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)', fontFamily: 'Inter' }}
        >
          <span>💬</span>
          Give Me A Reason To Smile
        </motion.button>

        {current && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 text-xs"
            style={{ color: '#B0A0A8' }}
          >
            Click again for another ♡
          </motion.p>
        )}
      </div>
    </section>
  );
}
