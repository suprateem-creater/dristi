import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { Sparkles, Heart } from 'lucide-react';

function LoveCard({ item, index }) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (flipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="tilt-card h-64 cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => { setFlipped(!flipped); setTilt({ x: 0, y: 0 }); }}
    >
      <motion.div
        className="card-inner w-full h-full rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500"
        animate={{
          rotateY: flipped ? 180 : 0,
          rotateX: flipped ? 0 : tilt.x,
          rotateZ: flipped ? 0 : tilt.y * 0.2,
        }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div
          className="card-front flex flex-col items-center justify-between p-7 text-center rounded-3xl border border-rose-200/90 shadow-md relative overflow-hidden group"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(155deg, #FFFDFB 0%, #FFF5F7 60%, #FEEDF2 100%)',
          }}
        >
          {/* Subtle top ambient glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-rose-200/40 rounded-full blur-xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-rose-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
            {['💖', '✨', '🌹', '🕊️', '💫', '🌸'][index % 6]}
          </div>

          {/* Card Title */}
          <div className="my-auto px-2">
            <h3 className="text-2xl font-serif font-bold text-gray-800 leading-snug tracking-tight">
              {item.front}
            </h3>
          </div>

          {/* Tap Prompt Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-bold uppercase tracking-wider text-rose-500 shadow-xs group-hover:bg-rose-100 transition-colors">
            <Sparkles size={11} className="text-rose-400" />
            <span>Tap to flip</span>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="card-back flex flex-col items-center justify-between p-7 text-center rounded-3xl shadow-xl border border-rose-400/40 relative overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, #A84E59 0%, #8C3A44 60%, #6E2B33 100%)',
          }}
        >
          {/* Corner Flourish */}
          <div className="text-rose-200/30 text-xs font-serif tracking-widest uppercase">
            Reason #{index + 1}
          </div>

          {/* Love Note Text */}
          <div className="my-auto px-1">
            <p className="text-white text-lg md:text-xl font-serif italic leading-relaxed">
              "{item.back}"
            </p>
          </div>

          {/* Footer Heart Icon */}
          <div className="flex items-center gap-1 text-rose-200 text-xs font-script text-base">
            <Heart size={13} className="fill-rose-300 text-rose-300" />
            <span>Forever Yours</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LoveReasons() {
  const { couple } = useCouple();
  return (
    <section id="reasons" className="section-wrapper flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(180deg, #F8EDE8 0%, #FFF5F0 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-5xl flex flex-col items-center justify-center text-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto mb-14"
        >
          <span className="section-eyebrow text-center">Six of Infinite</span>
          <h2 className="section-title text-center">Reasons I Love You</h2>
          <p className="section-subtitle text-center">Every little thing about you made me fall in love — tap each card to reveal the memory inside.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mx-auto justify-items-center justify-center">
          {(couple.loveReasons || []).map((item, i) => (
            <div key={i} className="w-full max-w-sm">
              <LoveCard item={item} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
