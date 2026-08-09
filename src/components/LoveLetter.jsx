import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';
import { spawnHearts } from './HeartCanvas';

export default function LoveLetter() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const text = couple.loveLetterText;

  useEffect(() => {
    if (!open) { setTyped(''); return; }
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setTyped(text.slice(0, ++i));
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [open, text]);

  const handleOpen = (e) => {
    setOpen(true);
    spawnHearts(e.clientX, e.clientY, 8);
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: '#FDFBF7' }}>
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>A Little Surprise</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            A Letter For You
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              transition={{ duration: 0.5 }}
              className="inline-block cursor-pointer group"
              onClick={handleOpen}
            >
              {/* Envelope */}
              <div className="relative mx-auto w-64 h-44">
                {/* Body */}
                <div
                  className="w-full h-full rounded-lg shadow-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FFE4E8, #FFF0F3)', border: '2px solid rgba(201,160,138,0.4)' }}
                >
                  <span className="text-5xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(212,131,138,0.4))' }}>💌</span>
                </div>
                {/* Flap */}
                <motion.div
                  animate={{ rotateX: [0, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-0 left-0 w-full"
                  style={{ height: '50%', transformOrigin: 'top', transformStyle: 'preserve-3d' }}
                />
                {/* Seal */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: '#D4838A', color: 'white', boxShadow: '0 0 12px rgba(212,131,138,0.5)' }}
                >
                  ♡
                </div>
              </div>
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-6 text-sm"
                style={{ color: '#D4838A' }}
              >
                Click to open your letter ✨
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="rounded-3xl p-8 md:p-12 text-left shadow-2xl relative"
              style={{ background: '#FFFDF9', border: '1px solid rgba(201,160,138,0.3)', fontFamily: 'Dancing Script' }}
            >
              <div className="absolute top-4 right-4 text-2xl">💌</div>
              <pre
                className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
                style={{ color: '#3D3D3D', fontFamily: 'Dancing Script', fontSize: '1.1rem' }}
              >
                {typed}
                {typed.length < text.length && (
                  <span className="inline-block w-0.5 h-5 bg-current animate-pulse ml-0.5" />
                )}
              </pre>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(false)}
                className="mt-8 text-sm px-4 py-2 rounded-full"
                style={{ background: 'rgba(201,160,138,0.2)', color: '#C9A08A', fontFamily: 'Inter' }}
              >
                Close letter
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
