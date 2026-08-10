import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
import { useSound } from '../SoundContext';

const DEFAULT_HEARTBEAT_MESSAGES = [
  "You make my heart race. ❤️",
  "Still choosing you every single day.",
  "My favorite place is in your arms.",
  "365 days and I'm still falling for you.",
  "Every single beat belongs to you.",
  "You are my whole universe. ✨",
];

export default function HeartbeatSection() {
  const { couple } = useCouple();
  const { playSound } = useSound();
  const [beats, setBeats] = useState(1);
  const [msgIndex, setMsgIndex] = useState(0);
  const timerRef = useRef(null);

  const heartbeatMessages = (couple.heartbeatMessages && couple.heartbeatMessages.length > 0)
    ? couple.heartbeatMessages
    : DEFAULT_HEARTBEAT_MESSAGES;

  const handleHeartClick = (e) => {
    playSound('heart');
    const newBeats = Math.min(beats + 1, 5);
    setBeats(newBeats);
    setMsgIndex(i => (i + 1) % heartbeatMessages.length);
    spawnHearts(e.clientX, e.clientY, 8);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setBeats(1), 3500);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const duration = Math.max(0.45, 1.2 / beats);

  return (
    <section id="heartbeat" className="section-wrapper text-center" style={{ background: 'linear-gradient(180deg, #FAF0EA 0%, #FFF2F4 50%, #F8EFEA 100%)' }}>
      <div className="section-container max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-12"
        >
          <span className="section-eyebrow">{couple.heartbeatEyebrow || "Feel It"}</span>
          <h2 className="section-title">{couple.heartbeatTitle || "My Heartbeat For You"}</h2>
          <p className="section-subtitle">{couple.heartbeatSubtitle || "Tap the beating heart to feel how fast you make it beat."}</p>
        </motion.div>

        <div className="relative flex justify-center items-center h-48 sm:h-56 mb-6">
          {/* Pulse rings */}
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 2 + i * 0.35], opacity: [0.45, 0] }}
              transition={{ duration: duration * 1.6, repeat: Infinity, delay: i * duration * 0.35, ease: 'easeOut' }}
              className="absolute rounded-full pointer-events-none"
              style={{ width: 130, height: 130, border: '2px solid rgba(212,131,138,0.45)' }}
            />
          ))}

          {/* Heart button */}
          <motion.button
            type="button"
            onClick={handleHeartClick}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => playSound('hover')}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 text-8xl sm:text-9xl cursor-pointer border-none bg-transparent select-none drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]"
            aria-label="Tap the heart"
          >
            ❤️
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={msgIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="min-h-16 flex items-center justify-center"
          >
            <p
              className="text-xl sm:text-2xl font-bold font-script text-rose-600 leading-snug"
              style={{ fontSize: '1.65rem' }}
            >
              "{heartbeatMessages[msgIndex] || ''}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
