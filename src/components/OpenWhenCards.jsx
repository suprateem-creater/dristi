import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
import { useSound } from '../SoundContext';

const DEFAULT_OPEN_WHEN = [
  { label: "Open when you miss me", icon: "🌙", message: "Close your eyes. Remember that afternoon when we got caught in the rain and laughed until we couldn't breathe. That's where I am. Always close." },
  { label: "Open when you're sad", icon: "🌧️", message: "Every storm passes. And when it does, I'll be right here — your umbrella, your sunshine, your safe place. You are not alone." },
  { label: "Open when you need a smile", icon: "🌞", message: "Remember when you tried to make pasta and it turned into a soup? Or that time you waved back at someone waving at someone else? You are endlessly delightful." },
  { label: "Open when you want to remember us", icon: "📖", message: "We are coffee and lazy mornings. Late night drives and lousy playlists. Fighting over blankets and forgiving in seconds. We are home to each other." },
  { label: "Open when it's our anniversary", icon: "🎉", message: "Another year. Another thousand reasons. Another forever beginning today. Happy Anniversary, my love. Here's to every beautiful chapter still ahead." },
  { label: "Open when you can't sleep", icon: "✨", message: "Wrap your blanket tight and think of all the late nights we talked until dawn. I'm looking at the very same moon, dreaming of you. Rest easy, my love." },
];

export default function OpenWhenCards() {
  const { couple } = useCouple();
  const [openCard, setOpenCard] = useState(null);
  const [opened, setOpened] = useState(new Set());
  const { playSound } = useSound();

  const handleOpen = (card, e) => {
    playSound('letter-open');
    setOpenCard(card);
    setOpened(prev => new Set([...prev, card.label]));
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnHearts(x + (Math.random()-0.5)*80, y + (Math.random()-0.5)*80, 3), i * 80);
    }
  };

  const handleClose = () => {
    playSound('letter-seal');
    setOpenCard(null);
  };

  const rawCards = couple?.openWhenCards && couple.openWhenCards.length > 0
    ? couple.openWhenCards
    : DEFAULT_OPEN_WHEN;

  // Ensure we display 6 cards
  const cards = rawCards.length === 5 
    ? [...rawCards, DEFAULT_OPEN_WHEN[3]]
    : rawCards;

  return (
    <section id="openwhen" className="section-wrapper flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #FFF2F4 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-5xl flex flex-col items-center justify-center text-center mx-auto w-full px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto mb-14"
        >
          <span className="section-eyebrow text-center">For Every Moment</span>
          <h2 className="section-title text-center">Open When...</h2>
          <p className="section-subtitle text-center">Little letters prepared in advance for every mood and moment we might face.</p>
        </motion.div>

        {/* 6 Large Prominent Cards Grid — 3 columns desktop, 2 tablet, 1 mobile */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto justify-items-center justify-center"
          style={{ gap: 'clamp(2rem, 4vw, 2.5rem)' }}
        >
          {cards.map((card, i) => {
            const isRead = opened.has(card.label);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onMouseEnter={() => playSound('hover')}
                onClick={(e) => handleOpen(card, e)}
                className="cursor-pointer rounded-3xl relative overflow-hidden group w-full text-left shadow-md hover:shadow-xl transition-all duration-300 border flex flex-col justify-between"
                style={{
                  background: isRead
                    ? 'linear-gradient(135deg, #D4838A 0%, #C9A08A 100%)'
                    : 'linear-gradient(135deg, #FFFDFB 0%, #FFE5E9 100%)',
                  borderColor: isRead ? 'rgba(212,131,138,0.4)' : 'rgba(212,131,138,0.2)',
                  padding: 'clamp(1.75rem, 3.5vw, 2rem)',
                  minHeight: 'clamp(12.5rem, 25vw, 14.5rem)',
                }}
              >
                {/* Upper Content Area */}
                <div className="flex flex-col items-start w-full">
                  {/* Emoji — Consistent size: around 32px to 40px */}
                  <span 
                    role="img" 
                    aria-label="card-icon"
                    style={{ 
                      fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                      lineHeight: 1,
                      display: 'block'
                    }}
                  >
                    {card.icon}
                  </span>

                  {/* Title — spaced 12px to 18px below emoji */}
                  <h3
                    className="font-serif font-bold leading-snug tracking-tight"
                    style={{ 
                      marginTop: 'clamp(0.75rem, 1.8vw, 1.125rem)',
                      fontSize: 'clamp(1.15rem, 2.2vw, 1.35rem)',
                      color: isRead ? '#FFFFFF' : '#2D2D2D',
                      maxWidth: '85%' // prevent colliding with heart button
                    }}
                  >
                    {card.label}
                  </h3>
                </div>

                {/* Lower Status Area — Click to open 8px to 12px below title (or pushed to bottom) */}
                <div 
                  className="flex items-center gap-1.5"
                  style={{ marginTop: 'clamp(0.5rem, 1.2vw, 0.75rem)' }}
                >
                  {!isRead ? (
                    <span 
                      className="text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                      style={{ color: '#D4838A' }}
                    >
                      Click to open <span className="text-sm">✉️</span>
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-white/90">
                      Opened ✓
                    </span>
                  )}
                </div>

                {/* Heart Button in upper-right corner */}
                <div
                  className="absolute w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md border z-10 transition-all duration-300 group-hover:scale-110"
                  style={{
                    top: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    right: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                    background: isRead ? 'rgba(255,255,255,0.25)' : '#D4838A',
                    borderColor: isRead ? 'rgba(255,255,255,0.4)' : 'rgba(212,131,138,0.2)',
                    color: 'white',
                  }}
                >
                  <span className="leading-none mt-0.5">♡</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.7, rotateY: -60, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.7, rotateY: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-md w-full rounded-3xl p-8 sm:p-10 text-center bg-[#FFFDF9] shadow-2xl relative border border-rose-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">{openCard.icon}</div>
              
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1 block">
                Open When Note
              </span>

              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-800 mb-6">
                {openCard.label}
              </h3>

              <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/70 border border-rose-100 mb-6 text-left">
                <p
                  className="text-xl sm:text-2xl leading-relaxed text-gray-800 font-script font-medium"
                  style={{ fontSize: '1.45rem', lineHeight: 1.75 }}
                >
                  "{openCard.message}"
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="px-8 py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)' }}
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
