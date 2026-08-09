import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';

export default function Constellation() {
  const { couple } = useCouple();
  const [hoveredStar, setHoveredStar] = useState(null);
  const [activeStar, setActiveStar] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      setMousePos({
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  const rawStars = Array.isArray(couple?.constellationStars) ? couple.constellationStars : [];
  const stars = rawStars.filter(s => s && typeof s.label === 'string');

  // Check if star is "near" cursor
  const isNear = (star) => {
    const dx = (star.x ?? 50) - mousePos.x;
    const dy = (star.y ?? 50) - mousePos.y;
    return Math.sqrt(dx * dx + dy * dy) < 22;
  };

  return (
    <section
      id="constellation"
      className="section-wrapper text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A1A 0%, #1A0A20 50%, #0A0A1A 100%)', minHeight: '650px' }}
    >
      {/* Background twinkles */}
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            background: 'white',
          }}
        />
      ))}

      <div className="section-container max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-12"
        >
          <span className="section-eyebrow text-rose-300">Written in the Stars</span>
          <h2 className="section-title text-white">Our Love Constellation</h2>
          <p className="section-subtitle text-gray-400">
            Move your cursor or touch to illuminate the stars between our memories.
          </p>
        </motion.div>

        {/* Constellation canvas */}
        <div ref={containerRef} className="relative mx-auto w-full rounded-3xl bg-black/30 border border-purple-400/20 backdrop-blur-xs p-4" style={{ maxWidth: '850px', height: '440px' }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {/* Connection lines */}
          {stars.map((star, i) => {
            if (i === 0) return null;
            const prev = stars[i - 1];
            const nearA = isNear(star);
            const nearB = isNear(prev);
            const opacity = nearA || nearB ? 0.75 : 0.15;
            return (
              <motion.line
                key={`line-${star.id || i}`}
                x1={`${prev.x ?? 50}%`}
                y1={`${prev.y ?? 50}%`}
                x2={`${star.x ?? 50}%`}
                y2={`${star.y ?? 50}%`}
                stroke="#E8B4B8"
                strokeWidth="1.5"
                animate={{ opacity }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>

        {/* Stars */}
        {stars.map((star, i) => (
          <motion.div
            key={star.id || i}
            className="absolute cursor-pointer select-none"
            style={{
              left: `${star.x ?? 50}%`,
              top: `${star.y ?? 50}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
            onHoverStart={() => setHoveredStar(star)}
            onHoverEnd={() => setHoveredStar(null)}
            onClick={() => setActiveStar(star)}
          >
            <motion.div
              animate={{
                scale: hoveredStar?.id === star.id || isNear(star) ? 1.6 : 1,
                filter: hoveredStar?.id === star.id || isNear(star)
                  ? 'drop-shadow(0 0 10px #E8B4B8) drop-shadow(0 0 25px rgba(232,180,184,0.8))'
                  : 'drop-shadow(0 0 4px rgba(255,255,255,0.6))',
              }}
              transition={{ duration: 0.2 }}
              className="w-3.5 h-3.5 rounded-full"
              style={{ background: 'white' }}
            />
            {hoveredStar?.id === star.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: -22 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg pointer-events-none"
                style={{ background: 'rgba(232,180,184,0.95)', color: '#3D3D3D' }}
              >
                ⭐ {star.label}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Star story modal */}
      <AnimatePresence>
        {activeStar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setActiveStar(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="rounded-3xl p-8 max-w-sm w-full text-center"
              style={{ background: 'linear-gradient(135deg, #1A0A20, #0A0A2A)', border: '1px solid rgba(232,180,184,0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Playfair Display', color: '#E8B4B8' }}>
                {activeStar.label}
              </h3>
              {activeStar.date && (
                <p className="text-xs mb-4" style={{ color: 'rgba(232,180,184,0.7)' }}>{activeStar.date}</p>
              )}
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {activeStar.story || 'A magical star in our story.'}
              </p>
              <button
                onClick={() => setActiveStar(null)}
                className="mt-6 text-xs px-5 py-2 font-semibold rounded-full cursor-pointer transition hover:bg-rose-300"
                style={{ background: 'rgba(232,180,184,0.2)', color: '#E8B4B8', border: '1px solid rgba(232,180,184,0.3)' }}
              >
                Close ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </section>
  );
}
