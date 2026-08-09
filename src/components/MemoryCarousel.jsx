import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useCouple } from '../CoupleContext';
import { compressImages } from '../utils/imageCompressor';

export default function MemoryCarousel() {
  const { couple, setCouple } = useCouple();
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const memories = Array.isArray(couple?.memories) ? couple.memories : [];
  const validMemories = memories.filter(m => m && typeof m.photo === 'string' && m.photo.trim() !== '');

  // Reset active index if out of bounds
  useEffect(() => {
    if (active >= validMemories.length && validMemories.length > 0) {
      setActive(0);
    }
  }, [validMemories.length, active]);

  // Circular navigation so buttons always cycle smoothly
  const prev = () => {
    if (validMemories.length <= 1) return;
    setActive(curr => (curr - 1 + validMemories.length) % validMemories.length);
  };

  const next = () => {
    if (validMemories.length <= 1) return;
    setActive(curr => (curr + 1) % validMemories.length);
  };

  // Keyboard Left / Right arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [validMemories.length]);

  // Touch Swipe Handlers for Mobile & Trackpads
  const onTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 35) {
      next();
    } else if (diff < -35) {
      prev();
    }
    setTouchStartX(null);
  };

  // Desktop Pan/Swipe Handler on Container
  const handlePanEnd = (_, info) => {
    if (info.offset.x < -30 || info.velocity.x < -150) {
      next();
    } else if (info.offset.x > 30 || info.velocity.x > 150) {
      prev();
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsCompressing(true);
      try {
        const compressedFiles = await compressImages(files);
        const newMemories = compressedFiles.map((f, i) => ({
          id: Date.now() + i,
          photo: URL.createObjectURL(f),
          date: "Just now",
          location: "Special Place",
          caption: "A beautiful new memory ✨"
        }));
        if (setCouple) {
          setCouple(prevCouple => ({
            ...prevCouple,
            memories: [...(prevCouple.memories || []), ...newMemories],
          }));
        }
      } catch (err) {
        console.error('Error compressing memory photos:', err);
      } finally {
        setIsCompressing(false);
        e.target.value = '';
      }
    }
  };

  return (
    <section id="memories" className="section-wrapper text-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-12"
        >
          <span className="section-eyebrow">Our Favorites</span>
          <h2 className="section-title">Our Favorite Memories</h2>
          <p className="section-subtitle mb-6">Swipe or use the arrows below to flip through our special adventures.</p>
          
          <label className={`inline-flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md ${isCompressing ? 'opacity-60 pointer-events-none' : ''}`} style={{ background: 'rgba(212,131,138,0.15)', color: '#D4838A', border: '1px solid rgba(212,131,138,0.35)' }}>
            <Plus size={14} />
            {isCompressing ? '⚡ Compressing...' : 'Add Memory'}
            <input type="file" multiple accept="image/*" className="hidden" disabled={isCompressing} onChange={handleFileUpload} />
          </label>
        </motion.div>

        {validMemories.length > 0 ? (
          <div className="relative flex flex-col items-center">
            
            {/* Carousel Interactive Stage */}
            <motion.div
              className="relative w-full flex items-center justify-center h-[460px] touch-pan-y select-none cursor-grab active:cursor-grabbing"
              onPanEnd={handlePanEnd}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {validMemories.map((mem, i) => {
                const offset = i - active;
                const isActive = offset === 0;
                const isVisible = Math.abs(offset) <= 2;

                if (!isVisible) return null;

                return (
                  <motion.div
                    key={mem.id || i}
                    animate={{
                      scale: isActive ? 1 : Math.max(0.75, 1 - Math.abs(offset) * 0.14),
                      x: offset * (typeof window !== 'undefined' && window.innerWidth < 768 ? 270 : 350),
                      opacity: isActive ? 1 : Math.max(0.45, 1 - Math.abs(offset) * 0.35),
                      filter: isActive ? 'blur(0px)' : `blur(${Math.abs(offset) * 1.5}px)`,
                      zIndex: 20 - Math.abs(offset),
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    onClick={() => {
                      if (isActive) {
                        setFullscreen(mem);
                      } else {
                        setActive(i);
                      }
                    }}
                    className="absolute w-76 sm:w-88 rounded-3xl overflow-hidden shadow-2xl cursor-pointer flex-shrink-0 border border-rose-200/80 bg-white"
                    style={{
                      boxShadow: isActive ? '0 25px 60px rgba(212,131,138,0.35)' : '0 10px 30px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Photo frame */}
                    <div className="w-full h-64 overflow-hidden bg-gray-100 relative">
                      <img src={mem.photo} alt={mem.caption || 'Memory'} className="w-full h-full object-cover pointer-events-none" loading="lazy" />
                    </div>

                    {/* Card text content */}
                    <div className="p-6 text-left bg-white">
                      <p className="text-xs mb-1.5 font-bold uppercase tracking-wider text-rose-500">
                        📍 {mem.location || 'Special Place'} · {mem.date || 'Sweet Day'}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed font-medium">
                        {mem.caption}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Bottom Navigation Buttons & Indicator Dots */}
            <div className="relative z-30 flex items-center justify-center gap-4 mt-8 pb-4">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous Memory"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-rose-500 border border-rose-200 shadow-md hover:shadow-xl hover:scale-110 active:scale-95 transition cursor-pointer hover:bg-rose-50"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="flex gap-2 items-center px-3">
                {validMemories.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Go to memory ${i + 1}`}
                    className="rounded-full transition-all cursor-pointer hover:opacity-100"
                    style={{
                      width: i === active ? '26px' : '8px',
                      height: '8px',
                      background: i === active ? '#D4838A' : 'rgba(212,131,138,0.3)',
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                aria-label="Next Memory"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-[#D4838A] border border-[#D4838A]/30 shadow-lg hover:scale-110 active:scale-95 transition cursor-pointer hover:bg-rose-50"
              >
                <ChevronRight size={22} />
              </button>
            </div>

          </div>
        ) : (
          <p className="text-center text-gray-400">No memories added yet.</p>
        )}
      </div>

      {/* Fullscreen Modal View */}
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
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <img src={fullscreen.photo} alt="" className="w-full h-80 object-cover" />
              <div className="p-8" style={{ background: '#FFFDF9' }}>
                <p className="text-sm mb-2 font-semibold" style={{ color: '#D4838A' }}>📍 {fullscreen.location} · {fullscreen.date}</p>
                <p style={{ color: '#3D3D3D', fontFamily: 'Playfair Display', fontSize: '1.15rem' }}>{fullscreen.caption}</p>
                <button
                  onClick={() => setFullscreen(null)}
                  className="mt-6 px-5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-full transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
