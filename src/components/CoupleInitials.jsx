import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCouple } from '../CoupleContext';

export default function CoupleInitials() {
  const { couple } = useCouple();
  const containerRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const rafRef = useRef(null);

  // Continuous orbit
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setAngle(a => (a + 0.4) % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handler = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouse({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 24,
        y: ((e.clientY - rect.top)  / rect.height - 0.5) * 24,
      });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const toRad = deg => (deg * Math.PI) / 180;

  // Two orbiting particles at 180° apart
  const p1 = {
    x: Math.cos(toRad(angle)) * 90,
    y: Math.sin(toRad(angle)) * 40,
  };
  const p2 = {
    x: Math.cos(toRad(angle + 180)) * 90,
    y: Math.sin(toRad(angle + 180)) * 40,
  };

  return (
    <section
      className="py-28 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFF8F0, #FDFBF7)' }}
      ref={containerRef}
    >
      {/* Soft radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(232,180,184,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Always & Forever</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Written in the Stars
          </h2>
        </motion.div>

        {/* Initials stage */}
        <div className="relative flex items-center justify-center" style={{ height: '240px' }}>
          {/* Orbit ellipse (decorative) */}
          <div
            className="absolute rounded-full"
            style={{
              width: '200px',
              height: '90px',
              border: '1px dashed rgba(201,160,138,0.35)',
              transform: `translate(${mouse.x * 0.3}px, ${mouse.y * 0.15}px)`,
              transition: 'transform 0.6s ease',
            }}
          />

          {/* Particle 1 */}
          <div
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle, #F0C060, #D4838A)',
              boxShadow: '0 0 16px rgba(240,192,96,0.8)',
              transform: `translate(calc(${p1.x + mouse.x * 0.4}px - 8px), calc(${p1.y + mouse.y * 0.2}px - 8px))`,
            }}
          />

          {/* Particle 2 */}
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, #E8B4B8, #D4838A)',
              boxShadow: '0 0 12px rgba(232,180,184,0.8)',
              transform: `translate(calc(${p2.x + mouse.x * 0.4}px - 6px), calc(${p2.y + mouse.y * 0.2}px - 6px))`,
            }}
          />

          {/* Initials text */}
          <motion.div
            animate={{
              x: mouse.x * 0.15,
              y: mouse.y * 0.08,
            }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            className="relative z-10 select-none"
          >
            <p
              className="text-7xl md:text-8xl font-light"
              style={{
                fontFamily: 'Playfair Display',
                color: '#C9A08A',
                letterSpacing: '0.12em',
                textShadow: '0 4px 32px rgba(201,160,138,0.35)',
              }}
            >
              {couple.initials}
            </p>
          </motion.div>
        </div>

        {/* Names */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex justify-center items-center gap-4"
        >
          <span style={{ fontFamily: 'Dancing Script', fontSize: '1.5rem', color: '#5A5A5A' }}>
            {couple.partner1}
          </span>
          <span style={{ color: '#D4838A', fontSize: '1.2rem' }}>♡</span>
          <span style={{ fontFamily: 'Dancing Script', fontSize: '1.5rem', color: '#5A5A5A' }}>
            {couple.partner2}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm"
          style={{ color: '#8A8A9A' }}
        >
          Move your cursor to feel the connection ✨
        </motion.p>
      </div>
    </section>
  );
}
