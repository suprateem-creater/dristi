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
import { couple }      from './coupleData';
import { motion }      from 'framer-motion';

/* ── Hero Section ─────────────────────────────────────────── */
function Hero() {
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
          365 Days<br />of Us
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

/* ── App ──────────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      {/* Global heart canvas — renders on top of everything */}
      <HeartCanvas />

      <Hero />

      {/* ① Reasons I Love You */}
      <LoveReasons />

      {/* ② Our Favorite Memories carousel */}
      <MemoryCarousel />

      {/* ③ Memory Vault — parallax photo gallery */}
      <PhotoGallery />

      {/* ④ Firsts Timeline */}
      <Timeline />

      {/* ⑤ Love Letter */}
      <LoveLetter />

      {/* ⑥ Open When Cards */}
      <OpenWhenCards />

      {/* ⑦ Our Love Map */}
      <LoveMap />

      {/* ⑧ Relationship Constellation */}
      <Constellation />

      {/* ⑨ Our Song */}
      <OurSong />

      {/* ⑩ Love Quiz */}
      <LoveQuiz />

      {/* ⑪ Polaroid Wall */}
      <PolaroidWall />

      {/* ⑫ Heartbeat */}
      <HeartbeatSection />

      {/* ⑬ Love Meter */}
      <LoveMeter />

      {/* ⑭ Couple Initials */}
      <CoupleInitials />

      {/* ⑮ Future Together */}
      <FutureDreams />

      {/* ⑯ Digital Time Capsule */}
      <TimeCapsule />

      {/* ⑰ Random Love Message */}
      <RandomLoveMessage />

      {/* ⑱ Kiss Button */}
      <KissButton />

      {/* ⑲ Anniversary Cake */}
      <AnniversaryCake />

      {/* ⑳ Forever Section */}
      <ForeverSection />
    </>
  );
}
