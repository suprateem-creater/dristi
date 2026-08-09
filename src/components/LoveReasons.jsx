import { useState } from 'react';
import { motion } from 'framer-motion';
import { couple } from '../coupleData';

function LoveCard({ item, index }) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (flipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="tilt-card h-52 cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => { setFlipped(!flipped); setTilt({ x: 0, y: 0 }); }}
    >
      <motion.div
        className="card-inner w-full h-full"
        animate={{
          rotateY: flipped ? 180 : 0,
          rotateX: flipped ? 0 : tilt.x,
          rotateZ: flipped ? 0 : tilt.y * 0.3,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="card-front flex flex-col items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #FFF8F0, #FFE4E8)', border: '1px solid rgba(201,160,138,0.3)' }}
        >
          <div className="text-4xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>
            {item.front}
          </h3>
          <p className="text-xs mt-3 opacity-60" style={{ color: '#5A5A5A' }}>tap to reveal</p>
        </div>

        {/* Back */}
        <div
          className="card-back flex items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #D4838A, #C9A08A)' }}
        >
          <p className="text-white text-sm leading-relaxed" style={{ fontFamily: 'Inter' }}>
            {item.back}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LoveReasons() {
  return (
    <section className="py-24 px-4" style={{ background: '#FDFBF7' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>
            Six of infinite
          </p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Reasons I Love You
          </h2>
          <p className="mt-4 text-sm" style={{ color: '#5A5A5A' }}>Tap each card to reveal the memory inside</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {couple.loveReasons.map((item, i) => (
            <LoveCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
