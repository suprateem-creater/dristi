import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { compressImages } from '../utils/imageCompressor';

function ParallaxPhoto({ src, index }) {
  if (!src) return null;
  const heights = ['h-48 md:h-60', 'h-64 md:h-80', 'h-56 md:h-68', 'h-72 md:h-92', 'h-52 md:h-64', 'h-68 md:h-84'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.25, 1, 0.5, 1] }}
      className={`relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 group ${heights[index % heights.length]}`}
    >
      <img
        src={src}
        alt={`Memory ${index + 1}`}
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
      />
      <div
        className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />
    </motion.div>
  );
}

export default function PhotoGallery() {
  const { couple } = useCouple();
  const [photos, setPhotos] = useState(couple?.photos || []);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (couple?.photos && Array.isArray(couple.photos)) {
      const valid = couple.photos.filter(p => typeof p === 'string' && p.trim() !== '');
      if (valid.length > 0) {
        setPhotos(valid);
      }
    }
  }, [couple?.photos]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsCompressing(true);
      try {
        const compressedFiles = await compressImages(files);
        const newUrls = compressedFiles.map(f => URL.createObjectURL(f));
        setPhotos(prev => [...newUrls, ...prev]);
      } catch (err) {
        console.error('Error compressing gallery images:', err);
      } finally {
        setIsCompressing(false);
        e.target.value = '';
      }
    }
  };

  const validPhotos = (photos || []).filter(p => typeof p === 'string' && p.trim() !== '');
  const col1 = validPhotos.filter((_, i) => i % 3 === 0);
  const col2 = validPhotos.filter((_, i) => i % 3 === 1);
  const col3 = validPhotos.filter((_, i) => i % 3 === 2);

  return (
    <section id="gallery" className="section-wrapper flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFF0F3 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-6xl flex flex-col items-center justify-center text-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto mb-14"
        >
          <span className="section-eyebrow text-center">Captured Moments</span>
          <h2 className="section-title text-center">Our Memory Vault</h2>
          <p className="section-subtitle text-center mb-6">A collection of our favorite snapshots and candid memories together.</p>
          <label className={`inline-flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md ${isCompressing ? 'opacity-60 pointer-events-none' : ''}`} style={{ background: 'rgba(212,131,138,0.15)', color: '#D4838A', border: '1px solid rgba(212,131,138,0.35)' }}>
            {isCompressing ? '⚡ Compressing Photos...' : '+ Add Your Photos'}
            <input type="file" multiple accept="image/*" className="hidden" disabled={isCompressing} onChange={handleFileUpload} />
          </label>
        </motion.div>

        {validPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-6">
              {col1.map((src, i) => <ParallaxPhoto key={`c1-${i}-${src}`} src={src} index={i * 3} />)}
            </div>
            <div className="flex flex-col gap-6 mt-6 md:mt-10">
              {col2.map((src, i) => <ParallaxPhoto key={`c2-${i}-${src}`} src={src} index={i * 3 + 1} />)}
            </div>
            <div className="hidden md:flex flex-col gap-6 mt-3 md:mt-5">
              {col3.map((src, i) => <ParallaxPhoto key={`c3-${i}-${src}`} src={src} index={i * 3 + 2} />)}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">No photos in vault yet.</p>
        )}
      </div>
    </section>
  );
}
