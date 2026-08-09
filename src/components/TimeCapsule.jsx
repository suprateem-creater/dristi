import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { Sparkles, Lock, Gift } from 'lucide-react';

function pad(n) { return String(n).padStart(2, '0'); }

function getCountdown(targetInput) {
  const now = new Date();
  const targetDate = targetInput instanceof Date ? targetInput : new Date(targetInput || "2027-09-15T00:00:00");
  if (isNaN(targetDate.getTime())) return null;
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);
  return { days, hours, minutes, seconds };
}

// Lightweight static starfield generated ONCE outside render
const STATIC_STARS = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  left: `${(i * 19) % 100}%`,
  top: `${(i * 29) % 100}%`,
  size: (i % 3) + 1.5,
  opacity: (i % 4) * 0.2 + 0.2,
  duration: (i % 3) * 1.5 + 2.5,
  delay: (i % 5) * 0.6,
}));

// Memoized Countdown Grid so ticking seconds never re-renders the whole section
const CountdownGrid = memo(function CountdownGrid({ targetDate }) {
  const [time, setTime] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    setTime(getCountdown(targetDate));
    const t = setInterval(() => {
      setTime(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const items = [
    { label: 'Days',    value: time ? time.days : 0 },
    { label: 'Hours',   value: time ? pad(time.hours) : '00' },
    { label: 'Minutes', value: time ? pad(time.minutes) : '00' },
    { label: 'Seconds', value: time ? pad(time.seconds) : '00' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-6">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className="rounded-2xl sm:rounded-3xl px-7 sm:px-9 py-5 sm:py-6 min-w-[92px] sm:min-w-[112px] text-center shadow-xl border border-rose-200/25"
            style={{
              background: 'linear-gradient(145deg, rgba(35,15,45,0.9) 0%, rgba(20,8,28,0.95) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span
              className="block text-3xl sm:text-4xl font-serif font-bold text-rose-200"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </span>
          </div>
          <span className="mt-3 text-xs font-bold uppercase tracking-widest text-rose-200/70">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
});

export default function TimeCapsule() {
  const { couple } = useCouple();
  const rawTarget = couple?.timeCapsuleDate;
  const targetObj = useMemo(() => {
    return rawTarget instanceof Date && !isNaN(rawTarget.getTime())
      ? rawTarget
      : new Date(rawTarget || "2027-09-15T00:00:00");
  }, [rawTarget]);

  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const isNaturallyUnlocked = useMemo(() => {
    return isNaN(targetObj.getTime()) || targetObj.getTime() <= Date.now();
  }, [targetObj]);

  const isUnlocked = isNaturallyUnlocked || previewUnlocked;

  return (
    <section
      id="timecapsule"
      className="section-wrapper text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0D0D1A 0%, #1A0A20 50%, #0D0D1A 100%)',
        minHeight: '650px',
        contain: 'paint',
      }}
    >
      {/* Lightweight CSS Twinkle Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {STATIC_STARS.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: star.size,
              height: star.size,
              left: star.left,
              top: star.top,
              opacity: star.opacity,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="section-container max-w-3xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-14"
        >
          <span className="section-eyebrow text-rose-300">
            {couple?.timeCapsuleSubtitle || "Sealed with Love"}
          </span>
          <h2 className="section-title text-white">
            {couple?.timeCapsuleTitle || "Our Time Capsule"}
          </h2>
          <p className="section-subtitle text-gray-300/80">
            {couple?.timeCapsuleTeaser || "Something beautiful is waiting inside..."}
          </p>
        </motion.div>

        {/* Animated Vault Orb */}
        <div className="relative mx-auto flex items-center justify-center mb-10 w-48 h-48">
          <div
            className="absolute inset-0 rounded-full border border-rose-300/30 animate-ping opacity-20 pointer-events-none"
            style={{ animationDuration: '3.5s' }}
          />

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setPreviewUnlocked(prev => !prev)}
            className="w-28 h-28 rounded-full flex items-center justify-center text-5xl select-none cursor-pointer transition shadow-2xl z-20 border-2"
            style={{
              background: isUnlocked
                ? 'radial-gradient(circle, #F0C060, #D4838A)'
                : 'linear-gradient(135deg, #2A1435, #140A1E)',
              borderColor: isUnlocked ? '#F0C060' : 'rgba(232,180,184,0.4)',
              boxShadow: isUnlocked
                ? '0 0 45px rgba(240,192,96,0.7)'
                : '0 0 25px rgba(232,180,184,0.2)',
            }}
            title="Click to toggle lock state"
          >
            {isUnlocked ? '💝' : '🔒'}
          </motion.button>
        </div>

        {/* Interactive Preview Switcher */}
        <div className="mb-12">
          <button
            type="button"
            onClick={() => setPreviewUnlocked(prev => !prev)}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-xs font-extrabold uppercase tracking-wider transition shadow-lg cursor-pointer backdrop-blur-md bg-white/10 hover:bg-white/20 text-rose-200 border border-white/20"
          >
            {isUnlocked ? <Lock size={15} /> : <Sparkles size={15} />}
            {isUnlocked ? '🔒 View Locked State' : '✨ Click to Preview Unlock Animation'}
          </button>
        </div>

        {/* Dynamic Content: Revealed Letter vs Locked Countdown */}
        <AnimatePresence mode="wait">
          {isUnlocked ? (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-8 sm:p-14 shadow-2xl text-left border border-amber-300/40 max-w-2xl mx-auto"
              style={{
                background: 'linear-gradient(160deg, rgba(35,15,45,0.92) 0%, rgba(20,8,28,0.95) 100%)',
                boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
              }}
            >
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">💝</div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-300 mb-2">
                  {couple?.timeCapsuleOpenedTitle || "The Capsule Has Opened! 🥂"}
                </h3>
                <p className="text-xs tracking-widest uppercase font-bold text-rose-200/80">
                  Unlocked on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="p-7 sm:p-10 rounded-2xl bg-black/40 border border-white/10 mb-8">
                <p
                  className="text-xl sm:text-2xl leading-relaxed text-white/95 font-script font-medium"
                  style={{ fontSize: '1.45rem', lineHeight: 1.85 }}
                >
                  "{couple?.timeCapsuleMessage || "Two years ago, we sealed this moment in time — a promise to keep growing, keep choosing, and keep loving. If you're reading this, we did it. Here's to us. 🥂"}"
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setPreviewUnlocked(false)}
                  className="px-8 py-3 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-rose-200 border border-white/20 transition cursor-pointer"
                >
                  Close &amp; Relock Capsule 🔒
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm mb-6 font-medium text-rose-200/80">
                Opens on {!isNaN(targetObj.getTime()) ? targetObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Future Anniversary'}
              </p>

              {/* Isolated high-speed countdown with proper box spacing */}
              <CountdownGrid targetDate={targetObj} />

              <p className="mt-8 text-xs font-light text-white/50">
                {couple?.timeCapsuleTeaser || "Something beautiful is waiting inside..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
