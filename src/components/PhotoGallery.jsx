import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { couple } from '../coupleData';

function ParallaxPhoto({ src, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -30 : 30, index % 2 === 0 ? 30 : -30]);

  const heights = ['h-48', 'h-64', 'h-56', 'h-72', 'h-52', 'h-68', 'h-44', 'h-60'];

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-2xl ${heights[index % heights.length]}`}>
      <motion.img
        src={src}
        alt={`Memory ${index + 1}`}
        style={{ y, scale: 1.1 }}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: 'linear-gradient(to top, rgba(61,61,61,0.3), transparent)' }}
      />
    </div>
  );
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState(couple.photos);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newUrls = files.map(f => URL.createObjectURL(f));
      setPhotos(prev => [...newUrls, ...prev]);
    }
  };

  const col1 = photos.filter((_, i) => i % 3 === 0);
  const col2 = photos.filter((_, i) => i % 3 === 1);
  const col3 = photos.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-24 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFF0F3 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Captured Moments</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Our Memory Vault
          </h2>
          <label className="mt-6 inline-block cursor-pointer px-6 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(212,131,138,0.1)', color: '#D4838A', border: '1px solid rgba(212,131,138,0.3)', transition: 'background 0.2s' }}>
            + Add Your Photos
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            {col1.map((src, i) => <ParallaxPhoto key={`c1-${i}`} src={src} index={i * 3} />)}
          </div>
          <div className="flex flex-col gap-4 mt-8">
            {col2.map((src, i) => <ParallaxPhoto key={`c2-${i}`} src={src} index={i * 3 + 1} />)}
          </div>
          <div className="hidden md:flex flex-col gap-4 mt-4">
            {col3.map((src, i) => <ParallaxPhoto key={`c3-${i}`} src={src} index={i * 3 + 2} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
