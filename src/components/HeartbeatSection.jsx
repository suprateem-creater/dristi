import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';
import { spawnHearts } from './HeartCanvas';

const HEARTBEAT_MESSAGES = [
  "You make my heart race. ❤️",
  "Still choosing you.",
  "My favorite person.",
  "365 days. Still you.",
  "Every beat is yours.",
  "You are my heartbeat.",
];

export default function HeartbeatSection() {
  const [beats, setBeats] = useState(1);
  const [msgIndex, setMsgIndex] = useState(0);
  const timerRef = useRef(null);

  const handleHeartClick = (e) => {
    const newBeats = Math.min(beats + 1, 5);
    setBeats(newBeats);
    setMsgIndex(i => (i + 1) % HEARTBEAT_MESSAGES.length);
    spawnHearts(e.clientX, e.clientY, 6);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setBeats(1), 3000);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const duration = Math.max(0.4, 1.2 / beats);

  return (
    <section className="py-24 px-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF0F3, #FDFBF7)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Feel It</p>
        <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
          My Heart ♡
        </h2>
        <p className="mt-3 text-sm" style={{ color: '#5A5A5A' }}>Tap the heart to feel it</p>
      </motion.div>

      <div className="relative flex justify-center items-center">
        {/* Pulse rings */}
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 2 + i * 0.3], opacity: [0.5, 0] }}
            transition={{ duration: duration * 1.5, repeat: Infinity, delay: i * duration * 0.3, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{ width: 120, height: 120, border: '2px solid rgba(212,131,138,0.4)' }}
          />
        ))}

        {/* Heart */}
        <motion.button
          onClick={handleHeartClick}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 text-8xl md:text-9xl cursor-pointer border-none bg-transparent focus:outline-none"
          style={{ filter: 'drop-shadow(0 0 20px rgba(212,131,138,0.6))' }}
          aria-label="Tap the heart"
        >
          ❤️
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="mt-8 text-xl"
          style={{ fontFamily: 'Dancing Script', color: '#D4838A', fontSize: '1.6rem' }}
        >
          {HEARTBEAT_MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </section>
  );
}
