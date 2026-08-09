import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';

function Polaroid({ photo, index, isMobile }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const [zIndex, setZIndex] = useState(index);
  const [isDragging, setIsDragging] = useState(false);

  const initial = {
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 100,
    rotate: photo.rotation,
  };

  if (isMobile) {
    return (
      <div
        className="polaroid flex-shrink-0 w-56 mx-2"
        style={{ rotate: photo.rotation + 'deg' }}
      >
        <img src={photo.src} alt={photo.caption} className="w-full h-44 object-cover" loading="lazy" />
        <p className="mt-3 text-center text-sm" style={{ fontFamily: 'Dancing Script', color: '#5A5A5A', fontSize: '1rem' }}>
          {photo.caption}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => { setIsDragging(true); setZIndex(100); }}
      onDragEnd={() => setIsDragging(false)}
      whileTap={{ scale: 1.05 }}
      onClick={() => setZIndex(100)}
      initial={initial}
      className="polaroid absolute cursor-grab active:cursor-grabbing"
      style={{
        left: `${15 + (index % 3) * 25}%`,
        top: `${10 + Math.floor(index / 3) * 45}%`,
        zIndex,
        rotate: photo.rotation,
        boxShadow: isDragging ? '0 20px 60px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <img src={photo.src} alt={photo.caption} className="w-40 h-36 object-cover" loading="lazy" />
      <p className="mt-3 text-center text-sm" style={{ fontFamily: 'Dancing Script', color: '#5A5A5A', fontSize: '1rem' }}>
        {photo.caption}
      </p>
    </motion.div>
  );
}

export default function PolaroidWall() {
  const [isMobile, setIsMobile] = useState(false);
  const [photos, setPhotos] = useState(couple.polaroidPhotos);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPhotos = files.map((f, i) => ({
        src: URL.createObjectURL(f),
        caption: "new memory ✨",
        rotation: (Math.random() - 0.5) * 15
      }));
      setPhotos(prev => [...newPhotos, ...prev]);
    }
  };

  return (
    <section className="py-24 px-4 overflow-hidden" style={{ background: '#F5F0EA' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Our Memories</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Polaroid Wall
          </h2>
          <p className="mt-3 text-sm" style={{ color: '#5A5A5A' }}>
            {isMobile ? 'Swipe through the memories' : 'Drag the photos around the board'}
          </p>
          <label className="mt-6 inline-block cursor-pointer px-6 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(212,131,138,0.1)', color: '#D4838A', border: '1px solid rgba(212,131,138,0.3)', transition: 'background 0.2s' }}>
            + Add Polaroid
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </motion.div>

        {isMobile ? (
          <div className="flex overflow-x-auto pb-6 snap-x snap-mandatory">
            {photos.map((photo, i) => (
              <div key={i} className="snap-center flex-shrink-0">
                <Polaroid photo={photo} index={i} isMobile />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative" style={{ height: '500px' }}>
            {photos.map((photo, i) => (
              <Polaroid key={i} photo={photo} index={i} isMobile={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
