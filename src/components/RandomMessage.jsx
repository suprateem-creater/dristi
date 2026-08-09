import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';
import { spawnHearts } from './HeartCanvas';

export default function RandomMessage() {
  const [msg, setMsg] = useState(null);
  const [key, setKey] = useState(0);

  const generate = (e) => {
    const random = couple.randomMessages[Math.floor(Math.random() * couple.randomMessages.length)];
    setMsg(random);
    setKey(k => k + 1);
    spawnHearts(e.clientX, e.clientY, 5);
  };

  return (
    <section className="py-20 px-4 text-center" style={{ background: '#FDFBF7' }}>
      <div className="max-w-xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl mb-8"
          style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}
        >
          Need a Reason to Smile?
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generate}
          className="px-8 py-4 rounded-full text-white font-medium mb-10"
          style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)', fontFamily: 'Inter' }}
        >
          Give Me A Reason To Smile 🌸
        </motion.button>

        <AnimatePresence mode="wait">
          {msg && (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="rounded-3xl p-8"
              style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFE4E8)', border: '1px solid rgba(201,160,138,0.3)' }}
            >
              <p style={{ fontFamily: 'Dancing Script', color: '#3D3D3D', fontSize: '1.5rem', lineHeight: 1.5 }}>
                {msg}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
