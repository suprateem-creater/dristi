import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
import { Sparkles, MessageCircleHeart } from 'lucide-react';

export default function RandomLoveMessage() {
  const { couple } = useCouple();
  const messages = couple.randomMessages || [];
  const [current, setCurrent] = useState(null);
  const [key, setKey] = useState(0);

  const generate = (e) => {
    const random = messages[Math.floor(Math.random() * messages.length)];
    setCurrent(random);
    setKey(k => k + 1);
    const x = e.clientX ?? window.innerWidth / 2;
    const y = e.clientY ?? window.innerHeight / 2;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => spawnHearts(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 50, 3), i * 70);
    }
  };

  return (
    <section
      id="randommessage"
      className="section-wrapper text-center"
      style={{ background: 'linear-gradient(180deg, #FAF0EA 0%, #FFF5F0 50%, #F8EFEA 100%)' }}
    >
      <div className="section-container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-12"
        >
          <span className="section-eyebrow">A Little Reminder</span>
          <h2 className="section-title">Words of Love</h2>
          <p className="section-subtitle">Need a reason to smile? Tap below for a spontaneous love note.</p>
        </motion.div>

        {/* Message Card Container */}
        <div
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-10 sm:p-14 shadow-2xl border border-rose-200/90 min-h-[220px] flex items-center justify-center mb-10 relative overflow-hidden text-center"
          style={{
            boxShadow: '0 20px 50px rgba(212,131,138,0.15), 0 4px 16px rgba(0,0,0,0.03)',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(201,160,138,0.06) 28px, rgba(201,160,138,0.06) 29px)',
          }}
        >
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -15 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                className="px-4"
              >
                <p
                  className="text-2xl sm:text-3xl leading-relaxed text-gray-800 font-script font-medium"
                  style={{ fontSize: '1.75rem', lineHeight: 1.8 }}
                >
                  "{current}"
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-base font-medium text-gray-400 flex items-center gap-2.5"
              >
                <Sparkles size={18} className="text-rose-400" /> Tap the button below for a spontaneous note ✨
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 12px 30px rgba(244,63,94,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={generate}
          className="px-9 py-4 rounded-full text-white font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-500 shadow-xl hover:shadow-2xl transition flex items-center gap-2.5 mx-auto cursor-pointer"
        >
          <MessageCircleHeart size={18} />
          <span>Tap for a Love Note ✨</span>
        </motion.button>
      </div>
    </section>
  );
}
