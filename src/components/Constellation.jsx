import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';

export default function Constellation() {
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

  const stars = couple.constellationStars;

  // Check if star is "near" cursor
  const isNear = (star) => {
    const dx = star.x - mousePos.x;
    const dy = star.y - mousePos.y;
    return Math.sqrt(dx * dx + dy * dy) < 20;
  };

  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A1A 0%, #1A0A20 50%, #0A0A1A 100%)', minHeight: '600px' }}
    >
      {/* Background stars */}
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            background: 'white',
          }}
        />
      ))}

      <div className="max-w-5xl mx-auto text-center mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#E8B4B8' }}>Written in the Stars</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: 'white' }}>
            Our Love Constellation
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Move your cursor to reveal the lines between our moments
          </p>
        </motion.div>
      </div>

      {/* Constellation canvas */}
      <div ref={containerRef} className="relative mx-auto" style={{ maxWidth: '800px', height: '400px' }}>
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {/* Connection lines */}
          {stars.map((star, i) => {
            if (i === 0) return null;
            const prev = stars[i - 1];
            const nearA = isNear(star);
            const nearB = isNear(prev);
            const opacity = nearA || nearB ? 0.6 : 0.1;
            return (
              <motion.line
                key={`line-${i}`}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${star.x}%`}
                y2={`${star.y}%`}
                stroke="#E8B4B8"
                strokeWidth="1"
                animate={{ opacity }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>

        {/* Stars */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute cursor-pointer"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}
            onHoverStart={() => setHoveredStar(star)}
            onHoverEnd={() => setHoveredStar(null)}
            onClick={() => setActiveStar(star)}
          >
            <motion.div
              animate={{
                scale: hoveredStar?.id === star.id ? 1.8 : 1,
                filter: hoveredStar?.id === star.id
                  ? 'drop-shadow(0 0 8px #E8B4B8) drop-shadow(0 0 20px rgba(232,180,184,0.6))'
                  : 'drop-shadow(0 0 4px rgba(255,255,255,0.5))',
              }}
              transition={{ duration: 0.2 }}
              className="w-3 h-3 rounded-full"
              style={{ background: 'white' }}
            />
            {hoveredStar?.id === star.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: -20 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded-full"
                style={{ background: 'rgba(232,180,184,0.9)', color: '#3D3D3D' }}
              >
                {star.label}
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
              style={{ background: 'linear-gradient(135deg, #1A0A20, #0A0A2A)', border: '1px solid rgba(232,180,184,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display', color: '#E8B4B8' }}>
                {activeStar.label}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'rgba(232,180,184,0.7)' }}>{activeStar.date}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {activeStar.story}
              </p>
              <button
                onClick={() => setActiveStar(null)}
                className="mt-6 text-xs px-4 py-2 rounded-full"
                style={{ background: 'rgba(232,180,184,0.2)', color: '#E8B4B8', border: '1px solid rgba(232,180,184,0.3)' }}
              >
                Close ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
