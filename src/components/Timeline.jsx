import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { Sparkles, Calendar, Heart } from 'lucide-react';

function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const isLeft = index % 2 === 0;

  return (
    <div ref={ref} className="relative mb-16 md:mb-24 last:mb-0">
      {/* Desktop alternating layout */}
      <div className={`hidden md:flex items-center justify-between gap-10 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Content Card (Spacious Luxury Box) */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -60 : 60, scale: 0.95 }}
          animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="w-[46%] rounded-3xl px-8 sm:px-12 py-8 sm:py-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-rose-200/90 relative overflow-hidden group select-none text-left"
          style={{
            background: 'linear-gradient(155deg, #FFFDFB 0%, #FFF5F7 60%, #FEEDF2 100%)',
            boxShadow: '0 20px 50px rgba(212,131,138,0.12), 0 4px 16px rgba(0,0,0,0.03)',
          }}
        >
          {/* Top Row: Icon Badge + Date Chip */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-rose-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              {item.icon || '🌸'}
            </div>

            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50/90 border border-rose-200/80 text-xs font-extrabold uppercase tracking-widest text-rose-600 shadow-xs">
              <Calendar size={12} className="text-rose-400" />
              <span>{item.date}</span>
            </div>
          </div>

          {/* Text Container with generous inner margin */}
          <div className="pr-4 sm:pr-8">
            {/* Event Title */}
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-gray-900 mb-3 leading-snug tracking-tight">
              {item.event}
            </h3>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans font-normal">
              {item.desc}
            </p>
          </div>

          {/* Bottom decorative flourish */}
          <div className="mt-8 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-rose-400 font-script text-base">
            <span className="flex items-center gap-1">
              <Sparkles size={13} className="text-rose-300" /> Chapter #{index + 1}
            </span>
            <Heart size={13} className="fill-rose-300 text-rose-300 opacity-60" />
          </div>
        </motion.div>

        {/* Center Glowing Pearl Node */}
        <div className="w-[8%] flex justify-center relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
            className="w-8 h-8 rounded-full border-4 border-white bg-gradient-to-tr from-rose-400 to-rose-500 shadow-[0_0_24px_rgba(244,114,182,0.8)] z-20 flex items-center justify-center text-white text-xs"
          >
            ♡
          </motion.div>
        </div>

        {/* Opposite Spacer */}
        <div className="w-[46%]" />
      </div>

      {/* Mobile left-aligned layout */}
      <div className="flex md:hidden items-start gap-4 pl-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          className="w-7 h-7 rounded-full border-3 border-white bg-gradient-to-tr from-rose-400 to-rose-500 shadow-md flex-shrink-0 mt-3 z-20 flex items-center justify-center text-white text-[10px]"
        >
          ♡
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex-1 rounded-3xl p-7 sm:p-9 shadow-md border border-rose-200/90 text-left"
          style={{
            background: 'linear-gradient(155deg, #FFFDFB 0%, #FFF5F7 60%, #FEEDF2 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-rose-100 flex items-center justify-center text-2xl flex-shrink-0">
              {item.icon || '🌸'}
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {item.date}
            </span>
          </div>

          <div className="pr-3 sm:pr-5">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-gray-900 mb-2 leading-snug">
              {item.event}
            </h3>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans">
              {item.desc}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const { couple } = useCouple();
  return (
    <section id="timeline" className="section-wrapper" style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-5xl relative">
        
        {/* Desktop Center Vertical Glowing Track */}
        <div
          className="hidden md:block absolute left-1/2 top-36 bottom-16 w-1 -translate-x-1/2 bg-gradient-to-b from-rose-200 via-rose-400 to-rose-200 rounded-full shadow-[0_0_12px_rgba(244,114,182,0.4)] pointer-events-none"
        />

        {/* Mobile Left Vertical Track */}
        <div
          className="block md:hidden absolute left-4.5 top-36 bottom-12 w-0.5 bg-gradient-to-b from-rose-200 via-rose-400 to-rose-200 rounded-full pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-16"
        >
          <span className="section-eyebrow">Our Story</span>
          <h2 className="section-title">The Firsts Timeline</h2>
          <p className="section-subtitle">Every chapter of our journey, from our very first hello to today.</p>
        </motion.div>

        <div className="space-y-4">
          {(couple.timeline || []).map((item, i) => (
            <TimelineItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
