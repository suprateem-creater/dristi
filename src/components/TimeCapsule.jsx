import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';

function pad(n) { return String(n).padStart(2, '0'); }

function getCountdown(targetDate) {
  const now  = new Date();
  const diff = targetDate - now;
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);
  return { days, hours, minutes, seconds };
}

export default function TimeCapsule() {
  const target = couple.timeCapsuleDate;
  const [time, setTime] = useState(getCountdown(target));

  useEffect(() => {
    const t = setInterval(() => setTime(getCountdown(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  const isUnlocked = time === null;

  return (
    <section
      className="py-24 px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0D0D1A 0%, #1A0A20 50%, #0D0D1A 100%)' }}
    >
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 4 }}
          className="absolute rounded-full bg-white"
          style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        />
      ))}

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#E8B4B8' }}>Sealed with Love</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: 'white' }}>Our Time Capsule</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          className="relative mx-auto flex items-center justify-center mb-12"
          style={{ width: '180px', height: '180px' }}
        >
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
              className="absolute rounded-full"
              style={{ width: 80 + i * 30, height: 80 + i * 30, border: `1px solid rgba(232,180,184,${0.5 - i * 0.1})` }}
            />
          ))}
          <motion.div
            animate={{ rotateY: isUnlocked ? [0, 360] : 0 }}
            transition={{ duration: 1.5 }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{
              background: isUnlocked ? 'radial-gradient(circle, #F0C060, #D4838A)' : 'rgba(26,10,32,0.8)',
              border: '2px solid rgba(232,180,184,0.4)',
              boxShadow: isUnlocked ? '0 0 40px rgba(240,192,96,0.6)' : '0 0 20px rgba(232,180,184,0.2)',
            }}
          >
            {isUnlocked ? '💝' : '🔒'}
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isUnlocked ? (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="rounded-3xl p-8"
              style={{ background: 'rgba(255,248,240,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(232,180,184,0.3)' }}
            >
              <div className="text-5xl mb-4">💝</div>
              <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display', color: '#E8B4B8' }}>
                The Capsule Has Opened!
              </h3>
              <p className="text-base leading-relaxed" style={{ fontFamily: 'Dancing Script', color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem' }}>
                Two years ago, we sealed this moment in time — a promise to keep growing, keep choosing, and keep loving. If you're reading this, we did it. Here's to us. 🥂
              </p>
            </motion.div>
          ) : (
            <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm mb-8" style={{ color: 'rgba(232,180,184,0.7)' }}>
                Opens on {target.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { label: 'Days',    value: time.days },
                  { label: 'Hours',   value: pad(time.hours) },
                  { label: 'Minutes', value: pad(time.minutes) },
                  { label: 'Seconds', value: pad(time.seconds) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="rounded-2xl px-5 py-4 min-w-[76px] text-center" style={{ background: 'rgba(26,10,32,0.7)', border: '1px solid rgba(232,180,184,0.25)', backdropFilter: 'blur(12px)' }}>
                      <motion.span key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="block text-3xl font-bold" style={{ fontFamily: 'Playfair Display', color: '#E8B4B8' }}>
                        {value}
                      </motion.span>
                    </div>
                    <span className="mt-2 text-xs uppercase tracking-widest" style={{ color: 'rgba(232,180,184,0.5)' }}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Something beautiful is waiting inside...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
