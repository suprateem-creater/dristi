import './App.css';
import HeartCanvas     from './components/HeartCanvas';
import Countdown       from './components/Countdown';
import Timeline        from './components/Timeline';
import MemoryCarousel  from './components/MemoryCarousel';
import PolaroidWall    from './components/PolaroidWall';
import LoveReasons     from './components/LoveReasons';
import PhotoGallery    from './components/PhotoGallery';
import Constellation   from './components/Constellation';
import HeartbeatSection from './components/HeartbeatSection';
import OurSong         from './components/OurSong';
import LoveMeter       from './components/LoveMeter';
import LoveQuiz        from './components/LoveQuiz';
import LoveLetter      from './components/LoveLetter';
import OpenWhenCards   from './components/OpenWhenCards';
import LoveMap         from './components/LoveMap';
import CoupleInitials  from './components/CoupleInitials';
import FutureDreams    from './components/FutureDreams';
import TimeCapsule     from './components/TimeCapsule';
import RandomLoveMessage from './components/RandomLoveMessage';
import KissButton      from './components/KissButton';
import AnniversaryCake from './components/AnniversaryCake';
import ForeverSection  from './components/ForeverSection';
import FloatingNav     from './components/FloatingNav';
import AtmosphericBackground from './components/AtmosphericBackground';
import { couple }      from './coupleData';
import { motion }      from 'framer-motion';

import { Routes, Route, useSearchParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useCouple } from './CoupleContext';
import Editor from './Editor';
import { useCopyProtection } from './utils/useCopyProtection';

/* ── Hero Section ─────────────────────────────────────────── */
function Hero() {
  const { couple } = useCouple();
  return (
    <section id="hero" className="hero-section">
      {/* Ambient gradient orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      {/* Floating petals */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: `${10 + i * 9}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${7 + (i % 3)}s`,
          }}
        />
      ))}

      <div className="hero-content">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="hero-eyebrow"
        >
          {couple.partner1} &amp; {couple.partner2}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="hero-title"
        >
          {couple.heroTitle ? couple.heroTitle.split('\n').map((line, idx) => (
            <span key={idx} className="block">{line}</span>
          )) : <>365 Days<br />of Us</>}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.55 }}
          className="hero-date"
        >
          Since {couple.anniversaryDate}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85 }}
          className="hero-countdown"
        >
          <Countdown />
        </motion.div>
      </div>

      <motion.button
        className="scroll-arrow"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll down"
      >
        ↓
      </motion.button>
    </section>
  );
}


/** Full-page section wrapper with smooth entrance animation on scroll */
function SectionReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const revealed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      if (revealed.current) return;
      revealed.current = true;
      if (delay > 0) {
        setTimeout(() => el.classList.add('visible'), delay);
      } else {
        el.classList.add('visible');
      }
    };

    // If already in or above the viewport on mount, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      reveal();
      return;
    }

    // Otherwise use IntersectionObserver with generous rootMargin
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: '0px 0px 80px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="section-page section-reveal">
      {children}
    </div>
  );
}

function MainApp() {
  const [searchParams] = useSearchParams();
  const { setCouple } = useCouple();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applyConfig = (data) => {
      if (!data) return;
      if (data.anniversaryDate) {
        data.anniversaryDateObj = new Date(data.anniversaryDate);
      } else if (!data.anniversaryDateObj) {
        data.anniversaryDateObj = new Date("2026-09-15T00:00:00");
      }
      if (data.timeCapsuleDate) {
        data.timeCapsuleDate = new Date(data.timeCapsuleDate);
      }

      setCouple(prev => ({
        ...prev,
        ...data,
        photos: Array.isArray(data.photos) && data.photos.filter(Boolean).length > 0 ? data.photos.filter(Boolean) : prev.photos,
        polaroidPhotos: Array.isArray(data.polaroidPhotos) && data.polaroidPhotos.filter(p => p && p.src).length > 0 ? data.polaroidPhotos.filter(p => p && p.src) : prev.polaroidPhotos,
        memories: Array.isArray(data.memories) && data.memories.filter(m => m && m.photo).length > 0 ? data.memories.filter(m => m && m.photo) : prev.memories,
      }));
      setLoading(false);
    };

    // 1. Check for 100% Free Cloud Blob (?blob=...)
    const blobId = searchParams.get('blob');
    if (blobId) {
      fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`)
        .then(r => r.json())
        .then(data => applyConfig(data))
        .catch(err => {
          console.error("Error loading config from cloud blob:", err);
          setLoading(false);
        });
      return;
    }

    // 2. Check for Firestore id (?id=...)
    const id = searchParams.get('id');
    if (id) {
      getDoc(doc(db, 'configs', id))
        .then(snap => {
          if (snap.exists()) {
            applyConfig(snap.data());
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          console.error("Error loading config from Firestore:", err);
          setLoading(false);
        });
      return;
    }

    // 3. Check for URL hash (#data=...)
    const hash = window.location.hash;
    const urlData = searchParams.get('data');
    if (hash && hash.startsWith('#data=')) {
      try {
        const directData = JSON.parse(decodeURIComponent(hash.slice(6)));
        applyConfig(directData);
        return;
      } catch (e) {
        console.error("Error parsing hash data:", e);
      }
    } else if (urlData) {
      try {
        const directData = JSON.parse(decodeURIComponent(urlData));
        applyConfig(directData);
        return;
      } catch (e) {
        console.error("Error parsing query data:", e);
      }
    }

    setLoading(false);
  }, [searchParams, setCouple]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display', fontSize: '24px', color: '#D4838A', background: 'linear-gradient(135deg, #F8F0EA, #FDF5EF)' }}>Loading our memories...</div>;
  }

  return (
    <>
      <AtmosphericBackground />
      <HeartCanvas />
      <FloatingNav />
      <Hero />

      <SectionReveal><LoveReasons /></SectionReveal>
      <SectionReveal delay={60}><MemoryCarousel /></SectionReveal>
      <SectionReveal><PhotoGallery /></SectionReveal>
      <SectionReveal delay={60}><Timeline /></SectionReveal>
      <SectionReveal><LoveLetter /></SectionReveal>
      <SectionReveal delay={60}><OpenWhenCards /></SectionReveal>
      <SectionReveal><LoveMap /></SectionReveal>
      <SectionReveal delay={60}><Constellation /></SectionReveal>
      <SectionReveal><OurSong /></SectionReveal>
      <SectionReveal delay={60}><LoveQuiz /></SectionReveal>
      <SectionReveal><PolaroidWall /></SectionReveal>
      <SectionReveal delay={60}><HeartbeatSection /></SectionReveal>
      <SectionReveal><LoveMeter /></SectionReveal>
      <SectionReveal delay={60}><CoupleInitials /></SectionReveal>
      <SectionReveal><FutureDreams /></SectionReveal>
      <SectionReveal delay={60}><TimeCapsule /></SectionReveal>
      <SectionReveal><RandomLoveMessage /></SectionReveal>
      <SectionReveal delay={60}><KissButton /></SectionReveal>
      <SectionReveal><AnniversaryCake /></SectionReveal>
      <SectionReveal><ForeverSection /></SectionReveal>

      {/* Floating Customize / Editor Button */}
      <Link
        to="/editor"
        className="fixed bottom-6 right-6 z-50 bg-white/90 hover:bg-white text-[#D4838A] border border-[#D4838A]/30 px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm text-sm font-semibold flex items-center gap-2 hover:scale-105 transition active:scale-95 cursor-pointer"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        <span>✏️ Customize Site</span>
      </Link>
    </>
  );
}

export default function App() {
  useCopyProtection();
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="/edit" element={<Editor />} />
    </Routes>
  );
}
