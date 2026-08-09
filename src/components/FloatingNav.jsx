import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Compass, 
  Sparkles, 
  Music, 
  MapPin, 
  Lock, 
  Image, 
  BookOpen, 
  ChevronUp, 
  Menu, 
  X,
  Edit3
} from 'lucide-react';

const NAV_SECTIONS = [
  { id: 'hero', label: 'Home', icon: Heart },
  { id: 'reasons', label: 'Why I Love You', icon: Sparkles },
  { id: 'memories', label: 'Memories', icon: Image },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'timeline', label: 'Our Story', icon: BookOpen },
  { id: 'letter', label: 'Love Letter', icon: Heart },
  { id: 'lovemap', label: 'Love Map', icon: MapPin },
  { id: 'constellation', label: 'Constellation', icon: Sparkles },
  { id: 'song', label: 'Our Song', icon: Music },
  { id: 'polaroids', label: 'Polaroids', icon: Image },
  { id: 'timecapsule', label: 'Time Capsule', icon: Lock },
  { id: 'cake', label: 'Celebrate', icon: Heart },
];

export default function FloatingNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const scrollPosition = window.scrollY + 250;
      for (let i = NAV_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(NAV_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Bottom Left Navigation Capsule */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-rose-200/60 text-gray-800 text-xs font-bold hover:bg-white transition cursor-pointer"
        >
          {isOpen ? <X size={15} className="text-rose-500" /> : <Compass size={15} className="text-rose-500 animate-spin-slow" />}
          <span>Chapters</span>
        </motion.button>

        {showBackToTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-rose-200/60 text-gray-700 hover:text-rose-500 transition cursor-pointer"
            title="Back to Top"
          >
            <ChevronUp size={16} />
          </motion.button>
        )}
      </div>

      {/* Chapters Popup Drawer / Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-20 left-6 z-50 w-72 max-h-[70vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-rose-200/80 p-3 space-y-1"
            >
              <div className="px-3 py-2 border-b border-rose-100 mb-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-rose-500" /> Story Chapters
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Jump to section</span>
              </div>

              <div className="space-y-0.5 max-h-[50vh] overflow-y-auto pr-1">
                {NAV_SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollTo(sec.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-rose-500 text-white shadow-md font-bold'
                          : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-white' : 'text-rose-400'} />
                      <span className="flex-1">{sec.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-rose-100 mt-2">
                <Link
                  to="/editor"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                >
                  <Edit3 size={13} /> Customize Site
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
