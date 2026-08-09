import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { Sparkles, X, Heart } from 'lucide-react';

function DreamCard({ dream, index }) {
  const [expanded, setExpanded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (expanded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 14;
    setTilt({ x, y });
  };

  const floatDelay = index * 0.35;
  const icons = ['🌅', '✈️', '🌙', '📸', '🏡', '🎉', '🏖️', '⛰️', '🥂'];
  const icon = icons[index % icons.length];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.08 }}
        animate={{
          y: [0, -8, 0],
        }}
        // @ts-ignore
        transition={{
          y: { duration: 3.5 + (index % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
        }}
        whileHover={{ scale: 1.05, y: -10, zIndex: 10 }}
        onClick={() => setExpanded(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          perspective: 800,
          cursor: 'pointer',
        }}
        className="relative rounded-3xl p-7 flex flex-col items-center text-center select-none shadow-md hover:shadow-2xl transition-all duration-300 border border-rose-200/80 group"
        style={{
          background: 'linear-gradient(155deg, #FFFDFB 0%, #FFF5F7 60%, #FEEDF2 100%)',
        }}
      >
        {/* Glow behind icon */}
        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-rose-100 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Dream Title */}
        <h3 className="text-xl font-bold font-serif text-gray-800 mb-2 leading-snug tracking-tight">
          {dream.title}
        </h3>

        <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 mt-2 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1">
          <Sparkles size={11} className="text-rose-400" /> Tap to dream
        </span>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-md w-full rounded-3xl p-8 sm:p-10 text-center bg-[#FFFDF9] shadow-2xl relative border border-rose-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-5xl mb-3">{icon}</div>

              <span className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1 block">
                Future Milestone
              </span>

              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-800 mb-4">
                {dream.title}
              </h3>

              <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100/80 mb-6 text-left">
                <p className="text-lg leading-relaxed text-gray-700 font-script" style={{ fontSize: '1.35rem' }}>
                  "{dream.desc}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-8 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-400 to-rose-500 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                Close ♡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function FutureDreams() {
  const { couple } = useCouple();
  return (
    <section
      id="dreams"
      className="section-wrapper flex flex-col items-center justify-center text-center"
      style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}
    >
      <div className="section-container max-w-5xl flex flex-col items-center justify-center text-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto mb-14"
        >
          <span className="section-eyebrow text-center">All the Good That's Still to Come</span>
          <h2 className="section-title text-center">Our Future Together</h2>
          <p className="section-subtitle text-center">A little bucket list of dreams, adventures, and milestones waiting for us.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mx-auto justify-items-center justify-center" style={{ perspective: '1200px' }}>
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
