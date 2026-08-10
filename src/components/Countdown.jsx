import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';

function pad(n) { return String(n).padStart(2, '0'); }

function getElapsed(startDate) {
  const now = new Date();
  const diff = Math.abs(now - startDate);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function CountdownUnit({ label, value }) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    const handler = (e) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div 
      className="countdown-item group transition-all duration-300 hover:-translate-y-0.5"
      style={{
        width: '140px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* countdown-card container */}
      <div
        className="countdown-card rounded-2xl bg-[#FFFDFB] border border-rose-100/50 transition-all duration-300 shadow-[0_4px_16px_rgba(228,180,185,0.08)] group-hover:shadow-[0_8px_24px_rgba(244,114,182,0.14)] group-hover:border-rose-200/60"
        style={{
          width: '140px',
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          padding: 0,
          margin: 0,
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.95), 0 4px 16px rgba(228, 180, 185, 0.08)',
        }}
      >
        <div 
          className="countdown-number"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            padding: 0,
            margin: 0,
          }}
        >
          {shouldReduceMotion ? (
            <span
              style={{
                fontFamily: '"Playfair Display", serif',
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
                display: 'block',
                width: '100%',
                textAlign: 'center',
                margin: 0,
                padding: 0,
                lineHeight: 1,
                fontSize: '44px',
                fontWeight: 500,
                color: '#B05C66',
              }}
            >
              {value}
            </span>
          ) : (
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                fontFamily: '"Playfair Display", serif',
                fontVariantNumeric: 'tabular-nums',
                fontFeatureSettings: '"tnum"',
                display: 'block',
                width: '100%',
                textAlign: 'center',
                margin: 0,
                padding: 0,
                lineHeight: 1,
                fontSize: '44px',
                fontWeight: 500,
                color: '#B05C66',
              }}
            >
              {value}
            </motion.span>
          )}
        </div>
      </div>
      
      {/* countdown-label centered below */}
      <div 
        className="countdown-label text-[13px] font-bold uppercase tracking-wider text-[#B05C66]/70 text-center"
        style={{ 
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          width: '100%',
          textAlign: 'center',
          margin: '6px 0 0 0',
          padding: 0,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function Countdown() {
  const { couple } = useCouple();
  
  const getDate = () => {
    if (couple.anniversaryDateObj instanceof Date && !isNaN(couple.anniversaryDateObj)) {
      return couple.anniversaryDateObj;
    }
    if (couple.anniversaryDate) {
      const parsed = new Date(couple.anniversaryDate);
      if (!isNaN(parsed)) return parsed;
    }
    return new Date("2026-09-15T00:00:00");
  };

  const [time, setTime] = useState(() => getElapsed(getDate()));

  useEffect(() => {
    setTime(getElapsed(getDate()));
    const interval = setInterval(() => {
      setTime(getElapsed(getDate()));
    }, 1000);
    return () => clearInterval(interval);
  }, [couple.anniversaryDateObj, couple.anniversaryDate]);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: pad(time.hours) },
    { label: 'Minutes', value: pad(time.minutes) },
    { label: 'Seconds', value: pad(time.seconds) },
  ];

  return (
    <div className="relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-rose-200/10 blur-3xl rounded-full pointer-events-none -z-10" />
      
      <div 
        className="countdown-container max-w-3xl mx-auto"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '28px',
        }}
      >
        {units.map(({ label, value }) => (
          <CountdownUnit key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
