import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import { couple } from '../coupleData';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function heartIcon(emoji) {
  return L.divIcon({
    html: `<div style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 10px rgba(212,131,138,0.9));cursor:pointer;">${emoji}</div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    className:  '',
  });
}

// Component to handle map marker clicks without Popup
function Markers({ locations, onSelect }) {
  return locations.map((loc, i) => (
    <Marker
      key={i}
      position={loc.coords}
      icon={heartIcon(loc.emoji)}
      eventHandlers={{ click: () => onSelect(loc) }}
    />
  ));
}

export default function LoveMap() {
  const [active, setActive] = useState(null);

  const center = couple.loveMap.reduce(
    (acc, l) => [acc[0] + l.coords[0] / couple.loveMap.length, acc[1] + l.coords[1] / couple.loveMap.length],
    [0, 0]
  );

  const polyPositions = couple.loveMap.map(l => l.coords);

  return (
    <section className="py-24 px-4 overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFF0F3 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Every Place We've Loved</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            Our Love Map
          </h2>
          <p className="mt-3 text-sm" style={{ color: '#5A5A5A' }}>Click a heart to relive the memory</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ height: '480px', border: '2px solid rgba(201,160,138,0.3)' }}
        >
          <MapContainer
            center={center}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <Polyline
              positions={polyPositions}
              pathOptions={{ color: '#D4838A', weight: 2, dashArray: '8 6', opacity: 0.7 }}
            />
            <Markers locations={couple.loveMap} onSelect={setActive} />
          </MapContainer>
        </motion.div>

        {/* Location pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {couple.loveMap.map((loc, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActive(loc)}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: active?.name === loc.name
                  ? 'linear-gradient(135deg, #D4838A, #C9A08A)'
                  : 'rgba(232,180,184,0.2)',
                color: active?.name === loc.name ? 'white' : '#3D3D3D',
                border: '1px solid rgba(201,160,138,0.3)',
              }}
            >
              {loc.emoji} {loc.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Memory modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="max-w-md w-full rounded-3xl p-8 text-center"
              style={{ background: '#FFFDF9', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">{active.emoji}</div>
              <h3 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>
                {active.name}
              </h3>
              <p className="text-xs mb-4" style={{ color: '#D4838A' }}>{active.date}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#3D3D3D', fontFamily: 'Inter' }}>
                {active.story}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setActive(null)}
                className="mt-7 px-6 py-2 rounded-full text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)' }}
              >
                Close ♡
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
