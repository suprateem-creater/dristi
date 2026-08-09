import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
      {units.map(({ label, value }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div
            className="rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-5 min-w-[88px] sm:min-w-[104px] text-center shadow-md hover:shadow-lg transition-all"
            style={{
              background: 'rgba(255, 253, 249, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(201,160,138,0.4)',
              boxShadow: '0 8px 24px rgba(201,160,138,0.15)',
            }}
          >
            <span
              className="block text-3xl sm:text-4xl font-serif font-bold text-[#A84E59]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </span>
          </div>
          <span className="mt-3 text-xs font-extrabold uppercase tracking-widest text-[#C9A08A]">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
