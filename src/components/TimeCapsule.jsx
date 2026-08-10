import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { Lock, Unlock, Heart } from 'lucide-react';

function pad(n) { return String(n).padStart(2, '0'); }

function getCountdown(targetInput) {
  const now = new Date();
  const targetDate = targetInput instanceof Date ? targetInput : new Date(targetInput || "2027-09-15T00:00:00");
  if (isNaN(targetDate.getTime())) return null;
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000)  / 60000);
  const seconds = Math.floor((diff % 60000)    / 1000);
  return { days, hours, minutes, seconds };
}

// Lightweight static starfield generated ONCE outside render
const STATIC_STARS = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  left: `${(i * 19) % 100}%`,
  top: `${(i * 29) % 100}%`,
  size: (i % 3) + 1.5,
  opacity: (i % 4) * 0.2 + 0.2,
  duration: (i % 3) * 1.5 + 2.5,
  delay: (i % 5) * 0.6,
}));

// Memoized Countdown Grid so ticking seconds never re-renders the whole section
const CountdownGrid = memo(function CountdownGrid({ targetDate }) {
  const [time, setTime] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    setTime(getCountdown(targetDate));
    const t = setInterval(() => {
      setTime(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const items = [
    { label: 'Days',    value: time ? time.days : 0 },
    { label: 'Hours',   value: time ? pad(time.hours) : '00' },
    { label: 'Minutes', value: time ? pad(time.minutes) : '00' },
    { label: 'Seconds', value: time ? pad(time.seconds) : '00' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-6">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div
            className="rounded-[1.25rem] px-6 py-4.5 min-w-[85px] sm:min-w-[100px] text-center border border-white/5"
            style={{
              background: 'rgba(9, 3, 18, 0.35)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.08)',
            }}
          >
            <span
              className="block text-2xl sm:text-3xl font-serif font-light text-[#EAD6C3]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </span>
          </div>
          <span className="mt-2.5 text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-[#EAD6C3]/65">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
});

// Sophisticated slow floating hearts in background with depth-of-field blur
const FLOATING_HEARTS = Array.from({ length: 8 }).map((_, i) => {
  const size = (i % 3) * 6 + 10;
  let blurClass = 'blur-[0.5px]';
  if (i % 3 === 1) blurClass = 'blur-[2px]';
  if (i % 3 === 2) blurClass = 'blur-[4px]';

  return {
    id: i,
    left: `${(i * 13 + 7) % 95}%`,
    bottom: `${(i * 19) % 35}%`,
    size,
    duration: (i % 3) * 6 + 16,
    delay: (i % 2) * 3,
    blur: blurClass,
    opacity: (i % 4) * 0.1 + 0.12,
  };
});

export default function TimeCapsule() {
  const { couple } = useCouple();
  const rawTarget = couple?.timeCapsuleDate;
  const targetObj = useMemo(() => {
    return rawTarget instanceof Date && !isNaN(rawTarget.getTime())
      ? rawTarget
      : new Date(rawTarget || "2027-09-15T00:00:00");
  }, [rawTarget]);

  const [isOpen, setIsOpen] = useState(false);
  const [capsuleOffset, setCapsuleOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [sectionMouse, setSectionMouse] = useState({ x: 0, y: 0 });

  // Unified tab + timeline state
  const [activeContent, setActiveContent] = useState({
    type: 'tab',
    id: 'story',
  });

  const isNaturallyUnlocked = useMemo(() => {
    return isNaN(targetObj.getTime()) || targetObj.getTime() <= Date.now();
  }, [targetObj]);

  // Canvas particle burst reference
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameIdRef = useRef(null);

  // Section mouse tracking for mouse follow lighting effect
  const handleSectionMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100 - 50;
    const y = ((e.clientY - rect.top) / rect.height) * 100 - 50;
    setSectionMouse({ x, y });
  };

  const handleSectionMouseLeave = () => {
    setSectionMouse({ x: 0, y: 0 });
  };

  // Capsule magnetic pull hover tracking
  const handleCapsuleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.22; // magnetic factor
    const deltaY = (e.clientY - centerY) * 0.22;
    setCapsuleOffset({ x: deltaX, y: deltaY });
    setIsHovered(true);
  };

  const handleCapsuleMouseLeave = () => {
    setCapsuleOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Canvas particle burst animation
  const triggerBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    particlesRef.current = [];
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 15 : 32;
    const colors = ['#FFA3B1', '#FF758F', '#F0D080', '#D4838A', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      particlesRef.current.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 5 + Math.random() * 9,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.018,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.45 ? 'circle' : (Math.random() > 0.5 ? 'heart' : 'star'),
      });
    }

    const drawHeart = (c, x, y, size) => {
      c.beginPath();
      c.moveTo(x, y + size / 4);
      c.bezierCurveTo(x, y - size / 2, x - size, y - size / 2, x - size, y + size / 4);
      c.bezierCurveTo(x - size, y + size * 0.75, x, y + size * 1.1, x, y + size * 1.25);
      c.bezierCurveTo(x, y + size * 1.1, x + size, y + size * 0.75, x + size, y + size / 4);
      c.bezierCurveTo(x + size, y - size / 2, x, y - size / 2, x, y + size / 4);
      c.fill();
    };

    const drawStar = (c, cx, cy, spikes, outerRadius, innerRadius) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particlesRef.current.forEach(p => {
        if (p.alpha <= 0) return;
        active = true;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045; // gravity
        p.vx *= 0.975; // friction
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size);
        } else {
          drawStar(ctx, p.x, p.y, 5, p.size / 2, p.size / 4);
        }
        ctx.restore();
      });

      if (active) {
        animationFrameIdRef.current = requestAnimationFrame(update);
      }
    };

    update();
  };

  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  const handleCapsuleClick = () => {
    setIsOpen(true);
    setTimeout(() => {
      triggerBurst();
    }, 80);
  };

  const sealCapsule = () => {
    setIsOpen(false);
    setActiveContent({ type: 'tab', id: 'story' });
  };

  // Structured Content mapping for tabs and timeline events
  const contents = useMemo(() => ({
    story: {
      subtitle: "Our Story",
      text: couple?.timeCapsuleMessage || "Two years ago, we sealed this moment in time — a promise to keep growing, keep choosing, and keep loving. If you're reading this, we did it. Here's to us. 🥂",
    },
    moment: {
      subtitle: "Favorite Moment",
      text: "Our favorite memory together remains that stunning sunset trip on the Amalfi Coast. Laughing, listening to the waves, and promising that wherever we travel, we are always home in each other's hearts. 🌅",
    },
    "two-years": {
      subtitle: "Two Years of Us",
      text: "730 days of sharing mornings, solving life's riddles, and holding hands through every storm. Each day spent with you has built this beautiful sanctuary of ours. Happy two years, my love. ❤️",
    },
    "first-day": {
      subtitle: "First Day",
      text: "August 9, 2025. A simple message in a coffee shop that changed the course of our lives forever. The best spark of my life.",
    },
    "first-memory": {
      subtitle: "First Memory",
      text: "September 21, 2025. Walking down the path at the botanical gardens as the sky turned amber. I knew right then.",
    },
    today: {
      subtitle: "Today",
      text: "Two full years of love, growth, and shared dreams. Standing together looking back at this timeline, feeling so grateful.",
    },
    "next-chapter": {
      subtitle: "Next Chapter",
      text: "Our endless tomorrow. A page waiting for more travels, slow-danced kitchen nights, and new heights. The best is yet to come.",
    },
  }), [couple?.timeCapsuleMessage]);

  const lines = useMemo(() => {
    const rawMsg = contents[activeContent.id]?.text || "";
    return rawMsg.split(/(?<=[.!?])\s+/).filter(Boolean);
  }, [activeContent.id, contents]);

  // Staggered reveal animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
        delayChildren: 0.1,
      }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" }
    }
  };

  return (
    <section
      id="timecapsule"
      onMouseMove={handleSectionMouseMove}
      onMouseLeave={handleSectionMouseLeave}
      className="section-wrapper text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #07020d 0%, #0d0617 50%, #07020d 100%)',
        minHeight: '700px',
        contain: 'paint',
      }}
    >
      {/* Self-contained CSS Orbit animations */}
      <style>{`
        @keyframes orbit-1 {
          0% { transform: rotate(0deg) translateX(85px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(85px) rotate(-360deg); }
        }
        @keyframes orbit-2 {
          0% { transform: rotate(120deg) translateX(102px) rotate(-120deg); }
          100% { transform: rotate(480deg) translateX(102px) rotate(-480deg); }
        }
        @keyframes orbit-3 {
          0% { transform: rotate(240deg) translateX(118px) rotate(-240deg); }
          100% { transform: rotate(600deg) translateX(118px) rotate(-600deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes drift-up-depth {
          0% { transform: translateY(120px) rotate(0deg); }
          100% { transform: translateY(-550px) rotate(360deg); }
        }
        .orbit-dot-1 { animation: orbit-1 9s linear infinite; }
        .orbit-dot-2 { animation: orbit-2 13s linear infinite; }
        .orbit-dot-3 { animation: orbit-3 11s linear infinite; }
        .capsule-float { animation: float-slow 4.5s ease-in-out infinite; }
        .bg-drifting-heart { animation: drift-up-depth var(--duration) linear infinite; }
      `}</style>

      {/* Sophisticated slow ambient stars */}
      <div className="absolute inset-0 pointer-events-none opacity-25 z-0">
        {STATIC_STARS.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: star.size,
              height: star.size,
              left: star.left,
              top: star.top,
              opacity: star.opacity,
              animationDuration: `${star.duration * 1.5}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Romantic slow floating hearts in background with depth-of-field blur */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {FLOATING_HEARTS.map(heart => (
          <span
            key={heart.id}
            className={`absolute bg-drifting-heart font-sans select-none text-rose-400 pointer-events-none ${heart.blur}`}
            style={{
              left: heart.left,
              bottom: heart.bottom,
              fontSize: `${heart.size}px`,
              opacity: heart.opacity,
              '--duration': `${heart.duration}s`,
              animationDelay: `-${heart.delay}s`,
            }}
          >
            ❤️
          </span>
        ))}
      </div>

      {/* Subtle radial cursor lighting / atmospheric glow layers */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-radial from-rose-500/5 to-transparent blur-3xl pointer-events-none transition-transform duration-700 ease-out z-0"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${sectionMouse.x * 0.3}px, ${sectionMouse.y * 0.3}px)`,
        }}
      />
      
      {/* Blurred pink/champagne lighting overlay layers */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-radial from-rose-500/8 to-transparent blur-3xl pointer-events-none z-0" style={{ left: '25%', top: '30%' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-radial from-amber-300/4 to-transparent blur-3xl pointer-events-none z-0" style={{ right: '25%', bottom: '25%' }} />

      <div className="section-container max-w-3xl text-center relative z-10">
        {/* Dynamic header state transition */}
        <div className="h-32 mb-10 relative">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="locked-header"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span className="flex items-center gap-1.5 text-rose-300/80 font-sans font-semibold tracking-[0.2em] text-[10px] sm:text-xs uppercase mb-2">
                  <Lock className="w-3.5 h-3.5 text-rose-300/80 animate-pulse" />
                  {couple?.timeCapsuleSubtitle || "SEALED WITH LOVE"}
                </span>
                <h2 
                  className="font-serif tracking-[0.25em] text-2xl sm:text-3xl text-[#EAD6C3] font-light uppercase select-none"
                  style={{ textShadow: '0 0 15px rgba(234, 214, 195, 0.15)' }}
                >
                  OUR LITTLE TIME CAPSULE
                </h2>
              </motion.div>
            ) : (
              <motion.div
                key="unlocked-header"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span className="flex items-center gap-1.5 text-amber-300/80 font-sans font-semibold tracking-[0.2em] text-[10px] sm:text-xs uppercase mb-2">
                  <Unlock className="w-3.5 h-3.5 text-amber-300/80" />
                  MEMORY UNLOCKED ✨
                </span>
                <h2 
                  className="font-serif tracking-[0.25em] text-2xl sm:text-3xl text-[#EAD6C3] font-light uppercase select-none"
                  style={{ textShadow: '0 0 15px rgba(234, 214, 195, 0.2)' }}
                >
                  {couple?.timeCapsuleTitle || "OUR TIME CAPSULE"}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* vault / open transition container */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="closed-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center"
            >
              {/* Interactive Floating Capsule Orb */}
              <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72 mb-6">
                
                {/* Tooltip on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-2 bg-[#0f0717]/95 border border-rose-300/30 text-rose-200 text-xs font-bold px-4 py-1.5 rounded-full shadow-2xl pointer-events-none z-30 font-sans tracking-wide uppercase"
                    >
                      Open Our Memory ✨
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Orbiting particles */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute w-2.5 h-2.5 bg-rose-300 rounded-full orbit-dot-1 blur-[1px] shadow-[0_0_8px_#f43f5e]" style={{ left: 'calc(50% - 5px)', top: 'calc(50% - 5px)' }} />
                  <div className="absolute w-2 h-2 bg-amber-300 rounded-full orbit-dot-2 blur-[1px] shadow-[0_0_8px_#fbbf24]" style={{ left: 'calc(50% - 4px)', top: 'calc(50% - 4px)' }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full orbit-dot-3 blur-[0.5px] shadow-[0_0_6px_#fff]" style={{ left: 'calc(50% - 3px)', top: 'calc(50% - 3px)' }} />
                </div>

                {/* Canvas Overlay for Explosion Burst */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-[-100px] pointer-events-none z-20"
                />

                {/* Background Ambient Glow */}
                <motion.div
                  animate={isHovered ? { scale: 1.25, opacity: 0.5 } : { scale: 1, opacity: 0.28 }}
                  className="absolute w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-rose-500/20 blur-2xl pointer-events-none"
                />

                {/* Glass Capsule Outer Container */}
                <div className="capsule-float">
                  <motion.button
                    type="button"
                    animate={{ x: capsuleOffset.x, y: capsuleOffset.y }}
                    transition={{ type: 'spring', stiffness: 180, damping: 15 }}
                    onMouseMove={handleCapsuleMouseMove}
                    onMouseLeave={handleCapsuleMouseLeave}
                    onClick={handleCapsuleClick}
                    className="w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center select-none cursor-pointer border border-white/20 backdrop-blur-md relative group transition-shadow"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 70%)',
                      boxShadow: isHovered
                        ? 'inset 0 1px 1px rgba(255,255,255,0.35), 0 0 50px rgba(244,63,94,0.45), 0 10px 30px rgba(0,0,0,0.5)'
                        : 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 30px rgba(244,63,94,0.25), 0 8px 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Floating interior icon */}
                    <motion.div
                      animate={isHovered ? { scale: 1.12 } : { scale: 1 }}
                      className="flex items-center justify-center"
                    >
                      <Heart className="w-12 h-12 text-rose-300 fill-rose-300/35 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" style={{ animationDuration: '2.5s' }} />
                    </motion.div>
                  </motion.button>
                </div>

                {/* Decorative Hover Sparkles */}
                <AnimatePresence>
                  {isHovered && (
                    <>
                      <motion.span
                        initial={{ opacity: 0, scale: 0, x: -30, y: -30 }}
                        animate={{ opacity: 1, scale: 1, x: -60, y: -60 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute text-xl pointer-events-none select-none z-10"
                      >
                        ✨
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, scale: 0, x: 30, y: -30 }}
                        animate={{ opacity: 1, scale: 1, x: 60, y: -60 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute text-xl pointer-events-none select-none z-10"
                      >
                        ❤️
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, scale: 0, x: -30, y: 30 }}
                        animate={{ opacity: 1, scale: 1, x: -60, y: 60 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute text-xl pointer-events-none select-none z-10"
                      >
                        💖
                      </motion.span>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Countdown or Teaser if naturally locked */}
              {!isNaturallyUnlocked && (
                <div className="w-full mt-2">
                  <p className="text-xs mb-3 font-semibold text-[#EAD6C3]/65 uppercase tracking-widest font-sans">
                    Officially Opens on {targetObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <CountdownGrid targetDate={targetObj} />
                </div>
              )}

              {isNaturallyUnlocked && (
                <p className="text-xs font-light text-rose-200/60 font-sans tracking-wide">
                  {couple?.timeCapsuleTeaser || "Something beautiful is waiting inside..."}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="opened-state"
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl mx-auto rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 md:p-14 backdrop-blur-2xl relative overflow-hidden"
              style={{
                background: 'rgba(9, 3, 18, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: '0 30px 70px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 0 80px rgba(244, 63, 94, 0.04)',
              }}
            >
              {/* Clean understated section label */}
              <div className="text-center mb-6">
                <span className="font-sans font-semibold tracking-[0.2em] text-[10px] sm:text-xs text-[#EAD6C3]/50 uppercase block mb-1">
                  SEALED MOMENT
                </span>
                <span className="font-sans font-semibold tracking-[0.25em] text-[10px] sm:text-xs text-rose-300/90 uppercase block">
                  {contents[activeContent.id]?.subtitle}
                </span>
              </div>

              {/* Message Block with Line-by-Line staggered reveal - no box-within-box */}
              <div className="mb-10 text-center px-4 sm:px-6">
                <motion.div
                  key={activeContent.id}
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="min-h-[140px] flex flex-col justify-center items-center"
                >
                  {lines.map((line, idx) => (
                    <motion.p
                      key={idx}
                      variants={lineVariants}
                      className="text-lg sm:text-xl md:text-[22px] leading-relaxed text-[#FAF6F0] font-serif italic mb-4 font-light text-center"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              </div>

              {/* Memory Navigation Tabs (underlines instead of pills) */}
              <div className="flex justify-center gap-6 sm:gap-8 mb-10 border-b border-white/5 pb-4">
                {[
                  { id: 'story', label: 'Our Story', icon: '💌' },
                  { id: 'moment', label: 'Favorite Moment', icon: '📸' },
                  { id: 'two-years', label: 'Two Years', icon: '❤️' },
                ].map(tab => {
                  const isActive = activeContent.type === 'tab' && activeContent.id === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveContent({ type: 'tab', id: tab.id })}
                      className="relative pb-2.5 font-sans text-xs sm:text-sm tracking-wider uppercase font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 select-none border-none bg-transparent"
                      style={{
                        color: isActive ? '#EAD6C3' : 'rgba(255, 255, 255, 0.4)',
                        textShadow: isActive ? '0 0 10px rgba(234, 214, 195, 0.25)' : 'none',
                      }}
                    >
                      <span className="opacity-70 text-xs sm:text-sm">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#EAD6C3] to-transparent shadow-[0_0_8px_#EAD6C3]"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Horizontal Journey Timeline */}
              <div className="mt-12 mb-8 px-2 sm:px-6">
                <div className="relative flex items-center justify-between w-full">
                  {/* Thin glowing connection line */}
                  <div className="absolute left-0 right-0 h-[1px] bg-white/10 pointer-events-none" style={{ top: '10px' }} />
                  
                  {[
                    { id: 'first-day', label: 'FIRST DAY' },
                    { id: 'first-memory', label: 'FIRST MEMORY' },
                    { id: 'today', label: 'TODAY' },
                    { id: 'next-chapter', label: 'NEXT CHAPTER' },
                  ].map(pt => {
                    const isActive = activeContent.type === 'timeline' && activeContent.id === pt.id;
                    const isToday = pt.id === 'today';
                    return (
                      <div key={pt.id} className="relative flex flex-col items-center z-10 w-1/4">
                        <div className="relative flex items-center justify-center h-5 w-5">
                          {/* Active halo */}
                          {isActive && !isToday && (
                            <div className="absolute -inset-1 rounded-full border border-[#EAD6C3]/30 animate-pulse" />
                          )}
                          {/* Double ring structure for TODAY */}
                          {isToday && (
                            <div className={`absolute inset-0 rounded-full border border-amber-300/35 ${isActive ? 'animate-ping opacity-50' : 'opacity-20'}`} style={{ animationDuration: '3.5s' }} />
                          )}
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.25 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveContent({ type: 'timeline', id: pt.id })}
                            className={`rounded-full transition-all duration-300 cursor-pointer relative z-20 ${
                              isActive 
                                ? 'w-3.5 h-3.5 bg-[#EAD6C3] border border-white shadow-[0_0_12px_#EAD6C3,_0_0_24px_rgba(234,214,195,0.7)]' 
                                : isToday
                                  ? 'w-3.5 h-3.5 bg-slate-950 border-[2.5px] border-amber-400 hover:border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.355)]'
                                  : 'w-2.5 h-2.5 bg-slate-950 border border-white/25 hover:border-white/60'
                            }`}
                            title={pt.label}
                          />
                        </div>
                        <span className={`mt-4 text-[8px] sm:text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 font-sans text-center ${
                          isActive ? 'text-[#EAD6C3] font-bold' : 'text-gray-500 hover:text-gray-400'
                        }`}>
                          {pt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Relock Action button - champagne rounded-2xl CTA */}
              <div className="text-center border-t border-white/5 pt-8">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={sealCapsule}
                  className="px-10 py-3.5 rounded-2xl font-sans font-semibold tracking-[0.18em] text-xs uppercase text-[#1A0923] transition-shadow duration-300 cursor-pointer shadow-[0_4px_20px_rgba(234,214,195,0.2)] hover:shadow-[0_10px_30px_rgba(234,214,195,0.4)] border-none"
                  style={{
                    background: 'linear-gradient(135deg, #EAD6C3 0%, #CDB39B 100%)',
                  }}
                >
                  🔐 Seal This Memory
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
