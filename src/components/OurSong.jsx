import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';

export default function OurSong() {
  const { couple } = useCouple();
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioUrl && !audioRef.current?.src) {
      alert("Please select a song first!");
      return;
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
    setPlaying(!playing);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = url;
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const onEnded = () => setPlaying(false);
      audio.addEventListener('ended', onEnded);
      return () => audio.removeEventListener('ended', onEnded);
    }
  }, [audioUrl]);

  return (
    <section id="song" className="py-24 px-4 relative overflow-hidden" style={{ background: 'transparent' }}>
      <div className="max-w-xl mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Editorial Subtitle & Title */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 text-center"
        >
          <p className="text-[10px] font-sans font-semibold tracking-[0.22em] uppercase mb-2 text-[#FF758F]">
            Playing in my Heart
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-[#FAF6F0] tracking-[0.05em] uppercase">
            Our Song
          </h2>
        </motion.div>

        {/* Turntable / Vinyl Composition Area */}
        <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 mb-10 select-none">
          
          {/* Soft warm spotlight behind the record */}
          <div 
            className="absolute w-80 h-80 rounded-full pointer-events-none z-0 opacity-20" 
            style={{ 
              background: 'radial-gradient(circle, rgba(234, 214, 195, 0.12) 0%, rgba(168, 78, 89, 0.08) 50%, transparent 70%)',
              filter: 'blur(30px)' 
            }}
          />

          {/* Turntable Platter Outer Ring */}
          <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-white/5 bg-slate-950/25 shadow-2xl z-0" />

          {/* Vinyl Record */}
          <motion.div
            animate={{ rotate: playing ? 360 : 0 }}
            transition={{ duration: 16, repeat: playing ? Infinity : 0, ease: 'linear' }}
            className="w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center relative z-10 shadow-[0_15px_40px_rgba(0,0,0,0.7)]"
            style={{ 
              background: 'radial-gradient(circle, #1a0f26 0%, #0d0615 100%)', 
              border: '1.5px solid rgba(255, 255, 255, 0.08)' 
            }}
          >
            {/* Concentric Grooves */}
            <div className="absolute inset-3 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-7 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-12 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-18 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-24 rounded-full border border-white/[0.04]" />
            <div className="absolute inset-30 rounded-full border border-white/[0.04]" />
            
            {/* Conic sheen reflection line */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none opacity-20" 
              style={{ 
                background: 'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.08) 40deg, transparent 80deg, transparent 180deg, rgba(255,255,255,0.08) 220deg, transparent 260deg)' 
              }} 
            />
            
            {/* Center label (Album cover) with golden border */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden relative z-10 border-[2.5px] border-[#EAD6C3]/80 shadow-[0_0_12px_rgba(234,214,195,0.25)]">
              <img src={couple.songCover} alt="Album cover" className="w-full h-full object-cover" />
            </div>

            {/* Turntable spindle center black hole */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#06020a] border border-white/20 z-20" />
          </motion.div>

          {/* Tonearm Base / Pivot assembly */}
          <div className="absolute -top-4 right-4 w-9 h-9 rounded-full border border-white/10 shadow-lg flex items-center justify-center z-25 bg-[#0f0717]">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#EAD6C3] to-[#CDB39B] border border-white/15" />
          </div>

          {/* Physical Tonearm */}
          <motion.div
            animate={{ rotate: playing ? 29 : 12 }}
            transition={{ type: 'spring', stiffness: 70, damping: 14 }}
            className="absolute -top-1 right-8 w-2.5 h-36 origin-[10px_10px] z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #CDB39B 0%, #EAD6C3 40%, #CDB39B 100%)',
              borderRadius: '3px',
              filter: 'drop-shadow(-3px 8px 6px rgba(0,0,0,0.5))',
            }}
          >
            {/* Headshell / Needle cartridge assembly */}
            <div className="absolute bottom-0 left-[-3px] w-4.5 h-7 bg-gradient-to-b from-[#CDB39B] to-slate-600 rounded-b-sm origin-top" style={{ transform: 'rotate(-4deg)' }}>
              <div className="absolute -bottom-1.5 -left-1 w-6.5 h-3.5 bg-slate-950 border border-white/15 rounded-xs" />
            </div>
          </motion.div>
        </div>

        {/* Song info - editorial alignment */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h3 className="text-xl sm:text-2xl font-serif text-[#FAF6F0] mb-1 font-light">
            {couple.song}
          </h3>
          <p className="text-xs font-sans tracking-widest text-[#EAD6C3]/65 uppercase font-medium">{couple.songArtist}</p>
        </motion.div>

        {/* Minimal Rounded-Bar Waveform */}
        <div className="flex justify-center gap-[3px] mb-8 h-8 items-center w-64 sm:w-72">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              animate={playing ? {
                scaleY: [0.35, Math.random() * 0.75 + 0.35, 0.35],
              } : { scaleY: 0.2 }}
              transition={{ duration: 0.6 + Math.random() * 0.6, repeat: Infinity, delay: i * 0.04 }}
              className="w-[3px] rounded-full"
              style={{
                background: 'linear-gradient(to top, rgba(234,214,195,0.15) 0%, #FF758F 100%)',
                height: '100%',
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} />

        {/* Playback Controls & Subtle upload link */}
        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggle}
            className="px-10 py-3.5 rounded-2xl font-sans font-semibold tracking-[0.18em] text-xs uppercase text-[#1A0923] shadow-[0_4px_20px_rgba(234,214,195,0.2)] hover:shadow-[0_10px_30px_rgba(234,214,195,0.4)] border-none flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #EAD6C3 0%, #CDB39B 100%)',
            }}
          >
            <span>{playing ? '⏸' : '▶'}</span>
            <span>{playing ? 'Pause Our Song' : 'Play Our Song'}</span>
          </motion.button>

          <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] text-[#EAD6C3]/60 hover:text-[#EAD6C3] font-sans tracking-wide hover:underline transition-colors mt-2">
            <span>🎵</span>
            <span>{audioUrl ? "Change Song" : "Upload an Audio File"}</span>
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>
    </section>
  );
}
