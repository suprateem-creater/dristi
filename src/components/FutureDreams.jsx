import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { Sparkles, X } from 'lucide-react';
import { useSound } from '../SoundContext';

function DreamCard({ dream, index }) {
  const [expanded, setExpanded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { playSound } = useSound();

  const handleClose = () => {
    playSound('close');
    setExpanded(false);
  };

  const handleMouseMove = (e) => {
    if (expanded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 12;
    setTilt({ x, y });
  };

  const floatDelay = index * 0.35;
  const icons = ['🌅', '✈️', '🌙', '📸', '🏡', '🎉', '🏖️', '⛰️', '🥂'];
  const icon = icons[index % icons.length];
  
  // Natural variation in rotation to mimic scrapbooked postcards
  const rotation = index % 3 === 0 ? -1.5 : index % 3 === 1 ? 1.2 : -0.6;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        animate={{
          y: [0, -6, 0],
          rotate: rotation,
        }}
        // @ts-ignore
        transition={{
          y: { duration: 4.2 + (index % 3) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
          rotate: { duration: 0.3 }
        }}
        whileHover={{ 
          scale: 1.035, 
          y: -10, 
          rotate: rotation * 0.4,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45), 0 0 30px rgba(243, 225, 205, 0.06)',
        }}
        onMouseEnter={() => playSound('hover')}
        onClick={() => {
          playSound('open');
          setExpanded(true);
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          perspective: 800,
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(243, 225, 205, 0.08)',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
        }}
        className="relative rounded-[24px] p-8 flex flex-col items-center text-center select-none border transition-all duration-300 group min-h-[230px]"
      >
        {/* Visual Emblem circular glow */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 relative group-hover:scale-108 transition-transform duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(243,225,205,0.08) 0%, rgba(243,225,205,0.01) 70%)',
            boxShadow: '0 0 15px rgba(243,225,205,0.03)',
          }}
        >
          {icon}
        </div>

        {/* Milestone Title */}
        <h3 className="text-xl font-bold font-serif text-[#FFF3E3] tracking-wide mb-4 leading-snug">
          {dream.title}
        </h3>

        {/* Floating Tap Prompt */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3E1CD]/60 mt-auto flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles size={10} className="text-rose-400" /> Tap to dream
        </span>
      </motion.div>

      {/* Intimate Memory Reveal Modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a030f]/85 backdrop-blur-xs"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="max-w-md w-full rounded-[28px] p-8 sm:p-10 text-center relative border backdrop-blur-md"
              style={{
                background: 'rgba(24, 12, 32, 0.75)',
                borderColor: 'rgba(243, 225, 205, 0.12)',
                boxShadow: '0 30px 70px rgba(0, 0, 0, 0.6), 0 0 45px rgba(243, 225, 205, 0.05)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Circular X Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full text-[#C4B5C5] hover:text-[#FFF3E3] hover:bg-white/5 transition cursor-pointer"
                aria-label="Close reveal"
              >
                <X size={15} />
              </button>

              {/* Sophisticated Emblems */}
              <div 
                className="w-18 h-18 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
                style={{
                  background: 'radial-gradient(circle, rgba(243,225,205,0.1) 0%, transparent 70%)',
                  boxShadow: '0 0 20px rgba(243,225,205,0.05)',
                }}
              >
                {icon}
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400 mb-2 block">
                Future Milestone
              </span>

              <h3 className="text-3xl font-bold font-serif text-[#FFF3E3] tracking-wide mb-6 leading-snug">
                {dream.title}
              </h3>

              {/* Floating Quote */}
              <div className="relative mb-8 px-4 max-w-md mx-auto">
                <span className="absolute -top-3 left-0 font-serif text-5xl text-rose-300/[0.12] select-none pointer-events-none italic leading-none">“</span>
                <p 
                  className="text-xl sm:text-2xl md:text-[23px] leading-[1.8] text-[#FAF6F0] font-serif italic font-normal tracking-[0.015em] relative z-10"
                >
                  “{dream.desc}”
                </p>
              </div>

              {/* Refined Tactile Close Prompt */}
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleClose}
                className="px-8 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF6F0] border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition cursor-pointer flex items-center gap-1.5 mx-auto"
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
  const { couple } = useCouple();

  // Low-opacity slow background floating hearts
  const bgHearts = useMemo(() => [
    { top: '15%', left: '12%', size: 14, duration: 28, delay: 0 },
    { top: '22%', left: '84%', size: 10, duration: 34, delay: 2 },
    { top: '68%', left: '9%', size: 12, duration: 30, delay: 5 },
    { top: '78%', left: '89%', size: 16, duration: 25, delay: 1 },
    { top: '48%', left: '50%', size: 8, duration: 38, delay: 4 },
  ], []);

  return (
    <section
      id="dreams"
      className="section-wrapper flex flex-col items-center justify-center text-center relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(180deg, #120917 0%, #0c0510 50%, #150b1d 100%)',
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: 'clamp(5rem, 10vw, 8rem)',
      }}
    >
      {/* Soft champagne & rose radial backdrop glow spots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: `
            radial-gradient(circle at 25% 35%, rgba(243, 225, 205, 0.05) 0%, transparent 60%),
            radial-gradient(circle at 75% 65%, rgba(212, 131, 138, 0.06) 0%, transparent 65%)
          `
        }}
      />

      {/* Atmospheric slow floating heart details */}
      {bgHearts.map((heart, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-300/10 pointer-events-none select-none"
          style={{
            top: heart.top,
            left: heart.left,
            fontSize: heart.size,
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [0, -22, 0],
            x: [0, 8, 0],
            opacity: [0.06, 0.14, 0.06],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: heart.delay,
          }}
        >
          ❤️
        </motion.div>
      ))}

      <div className="section-container max-w-5xl flex flex-col items-center justify-center text-center mx-auto px-4 relative z-10">
        {/* Editorial Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="section-header text-center flex flex-col items-center mx-auto mb-16"
        >
          <span 
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-400 mb-3 block"
            style={{ textShadow: '0 0 12px rgba(244, 63, 94, 0.2)' }}
          >
            All the Good That's Still to Come
          </span>
          <h2 
            className="text-4xl sm:text-5xl font-bold font-serif leading-tight text-[#FFF3E3] tracking-wide mb-5"
            style={{ textShadow: '0 2px 25px rgba(255, 243, 227, 0.08)' }}
          >
            Our Future Together
          </h2>
          <p className="text-base sm:text-lg max-w-xl text-[#C4B5C5] font-light leading-relaxed">
            A little bucket list of dreams, adventures, and milestones waiting for us.
          </p>
        </motion.div>

        {/* Floating post cards layout */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto justify-items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          {(couple.futureDreams || []).map((dream, i) => (
            <div key={i} className="w-full max-w-sm">
              <DreamCard dream={dream} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
