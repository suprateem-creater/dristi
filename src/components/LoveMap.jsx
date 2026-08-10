import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMap, ZoomControl } from 'react-leaflet';
import { useCouple } from '../CoupleContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Sparkles, MapPin, X, Heart } from 'lucide-react';
import { useSound } from '../SoundContext';

// Fix leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function heartIcon(emoji) {
  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        font-size: 28px;
        line-height: 1;
        filter: drop-shadow(0 4px 10px rgba(225, 29, 72, 0.5));
        cursor: pointer;
        user-select: none;
      ">
        ${emoji || '💖'}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'custom-heart-marker',
  });
}

function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const t3 = setTimeout(() => map.invalidateSize(), 1200);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 6, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

function Markers({ locations, onSelect }) {
  const { playSound } = useSound();
  return locations.map((loc, i) => (
    <Marker
      key={i}
      position={loc.coords}
      icon={heartIcon(loc.emoji)}
      eventHandlers={{ click: () => {
        playSound('open');
        onSelect(loc);
      } }}
    />
  ));
}

const DEFAULT_MAP_LOCATIONS = [
  {
    name: "Our First Date",
    date: "September 2026",
    coords: [22.5726, 88.3639],
    emoji: "☕",
    story: "Where our story began — hours of endless conversation over warm coffee."
  },
  {
    name: "Our Favorite Stroll",
    date: "November 2026",
    coords: [22.5448, 88.3426],
    emoji: "🌸",
    story: "Walking hand in hand under the autumn trees and laughing about everything."
  },
  {
    name: "Where We Promised Forever",
    date: "February 2027",
    coords: [22.5855, 88.4144],
    emoji: "💍",
    story: "Underneath the city lights, knowing with certainty that you are my person."
  }
];

export default function LoveMap() {
  const { couple } = useCouple();
  const [active, setActive] = useState(null);
  const { playSound } = useSound();

  const handleClose = () => {
    playSound('close');
    setActive(null);
  };

  const rawLocations = Array.isArray(couple?.loveMap) && couple.loveMap.length > 0
    ? couple.loveMap
    : DEFAULT_MAP_LOCATIONS;

  const locations = rawLocations
    .filter(l => l && Array.isArray(l.coords) && l.coords.length === 2 && !isNaN(Number(l.coords[0])) && !isNaN(Number(l.coords[1])))
    .map(l => ({
      ...l,
      coords: [Number(l.coords[0]), Number(l.coords[1])]
    }));

  const fallbackCenter = [22.5726, 88.3639];
  const center = locations.length > 0
    ? [
        locations.reduce((sum, l) => sum + l.coords[0], 0) / locations.length,
        locations.reduce((sum, l) => sum + l.coords[1], 0) / locations.length,
      ]
    : fallbackCenter;

  const polyPositions = locations.map(l => l.coords);

  return (
    <section id="lovemap" className="section-wrapper flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFF0F3 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-5xl flex flex-col items-center justify-center text-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto mb-14"
        >
          <span className="section-eyebrow text-center">Every Place We've Loved</span>
          <h2 className="section-title text-center">Our Love Map</h2>
          <p className="section-subtitle text-center">Click any heart marker or pill below to explore our special milestones across the map.</p>
        </motion.div>

        {/* Map Container with High-Performance Glass Border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl overflow-hidden shadow-2xl w-full relative z-10 border-2 border-rose-200/90"
          style={{ height: '520px', minHeight: '520px' }}
        >
          <MapContainer
            center={center}
            zoom={locations.length > 1 ? 6 : 7}
            style={{ height: '100%', width: '100%', minHeight: '520px' }}
            zoomControl={false}
            scrollWheelZoom={false}
          >
            <ZoomControl position="bottomright" />
            <InvalidateMapSize />
            <RecenterMap center={center} zoom={locations.length > 1 ? 6 : 7} />
            
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {polyPositions.length > 1 && (
              <Polyline
                positions={polyPositions}
                pathOptions={{ color: '#E11D48', weight: 3, dashArray: '8, 8', opacity: 0.8 }}
              />
            )}
            
            <Markers locations={locations} onSelect={setActive} />
          </MapContainer>
        </motion.div>

        {/* Location Pills with Clean Spacing */}
        {locations.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3.5 mt-8 w-full max-w-4xl">
            {locations.map((loc, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => playSound('hover')}
                onClick={() => {
                  playSound('open');
                  setActive(loc);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer border flex items-center gap-2 ${
                  active?.name === loc.name
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-450 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-rose-200 border-white/10 hover:border-rose-300/30 hover:text-white'
                }`}
              >
                <span>{loc.emoji || '💖'}</span>
                <span>{loc.name}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Memory Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.85, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 25, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="max-w-md w-full rounded-3xl p-8 sm:p-10 text-center bg-[#FFFDF9] shadow-2xl relative border border-rose-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-5xl mb-3">{active.emoji || '💖'}</div>
              
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1 block">
                Special Milestone
              </span>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-1 leading-snug">
                {active.name}
              </h3>
              
              <p className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-5">
                {active.date}
              </p>

              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-100 mb-6 text-left">
                <p className="text-lg leading-relaxed text-gray-800 font-script" style={{ fontSize: '1.35rem' }}>
                  "{active.story}"
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="px-8 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-400 to-rose-500 shadow-md hover:shadow-lg transition cursor-pointer"
              >
                Close ♡
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
