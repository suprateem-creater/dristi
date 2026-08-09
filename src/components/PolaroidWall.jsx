import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { compressImages } from '../utils/imageCompressor';
import { X, ZoomIn, Heart, Plus } from 'lucide-react';

export default function PolaroidWall() {
  const { couple } = useCouple();
  const [photos, setPhotos] = useState(couple?.polaroidPhotos || []);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (couple?.polaroidPhotos && Array.isArray(couple.polaroidPhotos)) {
      const valid = couple.polaroidPhotos.filter(p => p && typeof p.src === 'string' && p.src.trim() !== '');
      if (valid.length > 0) {
        setPhotos(valid);
      }
    }
  }, [couple?.polaroidPhotos]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsCompressing(true);
      try {
        const compressedFiles = await compressImages(files);
        const newPhotos = compressedFiles.map((f) => ({
          src: URL.createObjectURL(f),
          caption: "Our special moment ✨",
          rotation: (Math.random() - 0.5) * 8
        }));
        setPhotos(prev => [...newPhotos, ...prev]);
      } catch (err) {
        console.error('Error compressing polaroid photos:', err);
      } finally {
        setIsCompressing(false);
        e.target.value = '';
      }
    }
  };

  const validPhotos = (photos || []).filter(p => p && typeof p.src === 'string' && p.src.trim() !== '');

  const ROTATIONS = [-3, 2, -1.5, 3.5, -2, 1.5, -3.5, 2.5, -1, 3];
  const TAPES = ['#F8D7DA', '#FFF3CD', '#D1E7DD', '#E2D9F3'];

  return (
    <section id="polaroids" className="section-wrapper flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #F5EAE4 50%, #F8EFEA 100%)' }}>
      <div className="section-container max-w-6xl flex flex-col items-center justify-center text-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto mb-14"
        >
          <span className="section-eyebrow text-center">Captured In Time</span>
          <h2 className="section-title text-center">Polaroid Wall</h2>
          <p className="section-subtitle text-center mb-6">
            Pinned memories from our favorite days. Click any polaroid to take a closer look!
          </p>

          <label className={`inline-flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md ${isCompressing ? 'opacity-60 pointer-events-none' : ''}`} style={{ background: 'rgba(212,131,138,0.15)', color: '#D4838A', border: '1px solid rgba(212,131,138,0.35)' }}>
            <Plus size={14} />
            {isCompressing ? 'Compressing photos...' : 'Add More Polaroids'}
            <input type="file" multiple accept="image/*" className="hidden" disabled={isCompressing} onChange={handleFileUpload} />
          </label>
        </motion.div>

        {/* Responsive Organic Polaroid Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 justify-items-center justify-center max-w-6xl mx-auto">
          {validPhotos.map((photo, i) => {
            const rot = photo.rotation !== undefined ? photo.rotation : ROTATIONS[i % ROTATIONS.length];
            const tapeColor = TAPES[i % TAPES.length];

            return (
              <motion.div
                key={photo.id || i}
                initial={{ opacity: 0, y: 20, rotate: rot }}
                whileInView={{ opacity: 1, y: 0, rotate: rot }}
                viewport={{ once: true, margin: '-30px' }}
                whileHover={{ 
                  scale: 1.06, 
                  rotate: 0, 
                  zIndex: 30,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.22)' 
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                onClick={() => setSelectedPhoto(photo)}
                className="bg-white p-3.5 pb-8 rounded-xl shadow-lg border border-gray-200/60 cursor-pointer relative group w-64 select-none"
                style={{
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Washi tape decoration */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 opacity-85 shadow-xs -rotate-2 rounded-xs"
                  style={{
                    background: tapeColor,
                    clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
                    border: '1px dashed rgba(0,0,0,0.1)'
                  }}
                />

                {/* Photo Image Frame */}
                <div className="w-full h-56 rounded-lg overflow-hidden bg-gray-100 relative">
                  <img
                    src={photo.src}
                    alt={photo.caption || 'Polaroid Memory'}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 rounded-full bg-white/90 text-rose-500 shadow-md">
                      <ZoomIn size={18} />
                    </span>
                  </div>
                </div>

                {/* Handwritten Caption */}
                <div className="mt-4 px-1 text-center">
                  <p className="text-gray-700 leading-tight font-medium" style={{ fontFamily: 'Dancing Script', fontSize: '1.2rem' }}>
                    {photo.caption || 'Our memories ✨'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-5 pb-8 rounded-2xl shadow-2xl max-w-lg w-full relative"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-4 -right-4 p-2 rounded-full bg-white text-gray-700 shadow-xl hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer border"
              >
                <X size={18} />
              </button>

              <div className="rounded-xl overflow-hidden bg-black/5 max-h-[65vh] flex items-center justify-center">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.caption || 'Memory'}
                  className="w-full h-auto max-h-[65vh] object-contain"
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-xl text-gray-800 font-semibold" style={{ fontFamily: 'Dancing Script', fontSize: '1.5rem' }}>
                  {selectedPhoto.caption || 'Forever & Always ✨'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
