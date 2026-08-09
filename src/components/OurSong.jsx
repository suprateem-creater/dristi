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
    <section id="song" className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A0A20, #0D1A2E)' }}>
      <div className="max-w-xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#E8B4B8' }}>Playing in my Heart</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: 'white' }}>
            Our Song
          </h2>
        </motion.div>

        {/* Vinyl record */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Glow */}
          <motion.div
            animate={{ scale: playing ? [1, 1.2, 1] : 1, opacity: playing ? [0.4, 0.8, 0.4] : 0.3 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-56 h-56 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(232,180,184,0.4), transparent 70%)' }}
          />

          {/* Record */}
          <motion.div
            animate={{ rotate: playing ? 360 : 0 }}
            transition={{ duration: 4, repeat: playing ? Infinity : 0, ease: 'linear' }}
            className="w-48 h-48 rounded-full flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #1A0A20, #2D0A30)', border: '2px solid rgba(232,180,184,0.2)' }}
          >
            {/* Grooves */}
            {[60, 72, 84, 96].map(r => (
              <div key={r} className="absolute rounded-full border border-white opacity-10" style={{ width: r, height: r }} />
            ))}
            {/* Center label */}
            <div className="w-16 h-16 rounded-full overflow-hidden relative z-10">
              <img src={couple.songCover} alt="Album cover" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Arm */}
          <div
            className="absolute top-0 right-8 w-1 h-24 rounded-full origin-top"
            style={{
              background: 'rgba(232,180,184,0.6)',
              transform: playing ? 'rotate(25deg)' : 'rotate(15deg)',
              transition: 'transform 0.5s ease',
            }}
          />
        </div>

        {/* Song info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h3 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Playfair Display', color: 'white' }}>
            {couple.song}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{couple.songArtist}</p>
        </motion.div>

        {/* Waveform */}
        <div className="flex justify-center gap-1 mb-8 h-10 items-center">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              animate={playing ? {
                scaleY: [0.3, Math.random() * 0.7 + 0.3, 0.3],
              } : { scaleY: 0.2 }}
              transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.05 }}
              className="w-1.5 rounded-full"
              style={{
                background: `linear-gradient(to top, #D4838A, #E8B4B8)`,
                height: '100%',
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

        {/* Audio Element */}
        <audio ref={audioRef} />

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle}
            className="px-8 py-4 rounded-full text-white font-medium flex items-center gap-3 mx-auto"
            style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)' }}
          >
            <span className="text-xl">{playing ? '⏸' : '▶'}</span>
            {playing ? 'Pause Our Song' : 'Play Our Song'}
          </motion.button>

          <label className="cursor-pointer px-4 py-2 rounded-full text-xs" style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', transition: 'background 0.2s' }}>
            {audioUrl ? "Change Song" : "Upload an Audio File"}
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>
    </section>
  );
}
