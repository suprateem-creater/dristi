import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { couple } from '../coupleData';

export default function MemoryCarousel() {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(null);
  const [memories, setMemories] = useState(couple.memories);
  const dragX = useMotionValue(0);

  const prev = () => setActive(a => Math.max(0, a - 1));
  const next = () => setActive(a => Math.min(memories.length - 1, a + 1));

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60) next();
    else if (info.offset.x > 60) prev();
    dragX.set(0);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newMemories = files.map((f, i) => ({
        id: Date.now() + i,
        photo: URL.createObjectURL(f),
        date: "Just now",
        location: "Here",
        caption: "A beautiful new memory ✨"
      }));
      setMemories(prev => [...prev, ...newMemories]);
    }
  };

  return (
    <section className="py-24 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF0F3 0%, #FDFBF7 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Our Favorites</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Our Favorite Memories
          </h2>
          <p className="mt-3 text-sm" style={{ color: '#5A5A5A' }}>Swipe or click to explore</p>
          <label className="mt-6 inline-block cursor-pointer px-6 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(212,131,138,0.1)', color: '#D4838A', border: '1px solid rgba(212,131,138,0.3)', transition: 'background 0.2s' }}>
            + Add Memory
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </motion.div>

        <div className="relative flex items-center justify-center gap-4 h-[420px]">
          {memories.map((mem, i) => {
            const offset = i - active;
            const isActive = offset === 0;
            return (
              <motion.div
                key={mem.id}
                animate={{
                  scale: isActive ? 1 : Math.max(0.7, 1 - Math.abs(offset) * 0.12),
                  x: offset * (window.innerWidth < 768 ? 260 : 320),
                  opacity: Math.abs(offset) > 2 ? 0 : Math.max(0.3, 1 - Math.abs(offset) * 0.3),
                  filter: isActive ? 'blur(0px)' : `blur(${Math.abs(offset) * 1.5}px)`,
                  zIndex: 10 - Math.abs(offset),
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag={isActive ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                onClick={() => isActive ? setFullscreen(mem) : setActive(i)}
                className="absolute w-72 md:w-80 rounded-3xl overflow-hidden shadow-2xl cursor-pointer flex-shrink-0"
                style={{ boxShadow: isActive ? '0 20px 60px rgba(201,160,138,0.4)' : undefined }}
              >
                <img src={mem.photo} alt={mem.caption} className="w-full h-60 object-cover" loading="lazy" />
                <div className="p-5" style={{ background: '#FFFDF9' }}>
                  <p className="text-xs mb-1" style={{ color: '#D4838A' }}>📍 {mem.location} · {mem.date}</p>
                  <p className="text-sm" style={{ color: '#3D3D3D', fontFamily: 'Inter' }}>{mem.caption}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Nav buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={prev}
            disabled={active === 0}
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30"
            style={{ background: 'rgba(201,160,138,0.2)', color: '#C9A08A', border: '1px solid rgba(201,160,138,0.4)' }}
          >
            ←
          </motion.button>
          <div className="flex gap-2 items-center">
            {memories.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === active ? '20px' : '8px',
                  height: '8px',
                  background: i === active ? '#D4838A' : 'rgba(212,131,138,0.3)',
                }}
              />
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={next}
            disabled={active === couple.memories.length - 1}
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-30"
            style={{ background: 'rgba(201,160,138,0.2)', color: '#C9A08A', border: '1px solid rgba(201,160,138,0.4)' }}
          >
            →
          </motion.button>
        </div>
      </div>

      {/* Fullscreen view */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setFullscreen(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-2xl w-full rounded-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <img src={fullscreen.photo} alt="" className="w-full h-80 object-cover" />
              <div className="p-8" style={{ background: '#FFFDF9' }}>
                <p className="text-sm mb-2" style={{ color: '#D4838A' }}>📍 {fullscreen.location} · {fullscreen.date}</p>
                <p style={{ color: '#3D3D3D', fontFamily: 'Playfair Display', fontSize: '1.1rem' }}>{fullscreen.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
