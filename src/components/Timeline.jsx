import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { couple } from '../coupleData';

function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;

  return (
    <div ref={ref} className={`flex items-center gap-4 md:gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'} mb-12`}>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-5/12 glass rounded-2xl p-5 cursor-default hover:shadow-lg transition-shadow"
        style={{ border: '1px solid rgba(201,160,138,0.25)' }}
      >
        <div className="text-2xl mb-2">{item.icon}</div>
        <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>
          {item.event}
        </h3>
        <p className="text-sm mb-2" style={{ color: '#D4838A' }}>{item.date}</p>
        <p className="text-sm" style={{ color: '#5A5A5A' }}>{item.desc}</p>
      </motion.div>

      {/* Center dot */}
      <div className="flex flex-col items-center w-2/12">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="w-5 h-5 rounded-full border-2 z-10"
          style={{ background: '#C9A08A', borderColor: '#FDFBF7', boxShadow: '0 0 12px rgba(201,160,138,0.6)' }}
        />
      </div>

      {/* Spacer */}
      <div className="w-5/12" />
    </div>
  );
}

export default function Timeline() {
  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFF0F3 50%, #FDFBF7 100%)' }}>
      {/* Vertical line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px timeline-line"
        style={{ transform: 'translateX(-50%)' }}
      />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Our Story</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            The Firsts Timeline
          </h2>
        </motion.div>

        {couple.timeline.map((item, i) => (
          <TimelineItem key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
