import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { couple } from '../coupleData';

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
  const [time, setTime] = useState(getElapsed(couple.anniversaryDateObj));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getElapsed(couple.anniversaryDateObj));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: pad(time.hours) },
    { label: 'Minutes', value: pad(time.minutes) },
    { label: 'Seconds', value: pad(time.seconds) },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
      {units.map(({ label, value }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div
            className="glass rounded-2xl px-5 py-4 min-w-[80px] text-center"
            style={{ border: '1px solid rgba(201,160,138,0.3)' }}
          >
            <motion.span
              key={value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="block text-3xl md:text-4xl font-bold"
              style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}
            >
              {value}
            </motion.span>
          </div>
          <span className="mt-2 text-xs uppercase tracking-widest" style={{ color: '#D4838A' }}>
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
