import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { useSound } from '../SoundContext';

/* ─── Orbital point configuration ──────────────────────────── */
// Each star has a startAngle (deg), orbit radius (px), size, speed (s), and glow intensity
const STAR_CONFIG = [
  { id: 0, startAngle: 0,   ring: 1, sizePx: 7,  glowColor: '#F9C9D4', speed: 38, brightness: 0.9, direction: 1 },
  { id: 1, startAngle: 50,  ring: 1, sizePx: 5,  glowColor: '#E8B4B8', speed: 46, brightness: 0.7, direction: -1 },
  { id: 2, startAngle: 105, ring: 1, sizePx: 8,  glowColor: '#F9C9D4', speed: 42, brightness: 1.0, direction: 1 },
  { id: 3, startAngle: 160, ring: 1, sizePx: 6,  glowColor: '#DDA8BF', speed: 50, brightness: 0.8, direction: -1 },
  { id: 4, startAngle: 215, ring: 1, sizePx: 7,  glowColor: '#E8B4B8', speed: 44, brightness: 0.85, direction: 1 },
  { id: 5, startAngle: 270, ring: 1, sizePx: 5,  glowColor: '#F9C9D4', speed: 48, brightness: 0.75, direction: -1 },
  { id: 6, startAngle: 315, ring: 2, sizePx: 8,  glowColor: '#C9A0B4', speed: 56, brightness: 0.95, direction: 1 },
  { id: 7, startAngle: 135, ring: 2, sizePx: 6,  glowColor: '#C9A0B4', speed: 62, brightness: 0.6, direction: -1 },
];

/* ─── Static background sparkles ───────────────────────────── */
const BG_SPARKLES = [
  { x: '8%',  y: '12%', size: 2, opacity: 0.25 },
  { x: '88%', y: '9%',  size: 1.5, opacity: 0.2  },
  { x: '5%',  y: '68%', size: 1.5, opacity: 0.18 },
  { x: '93%', y: '72%', size: 2, opacity: 0.22 },
  { x: '15%', y: '88%', size: 1, opacity: 0.15 },
  { x: '82%', y: '85%', size: 1, opacity: 0.15 },
  { x: '50%', y: '6%',  size: 1.5, opacity: 0.2  },
  { x: '48%', y: '92%', size: 1.5, opacity: 0.18 },
  { x: '30%', y: '18%', size: 1, opacity: 0.12 },
  { x: '70%', y: '22%', size: 1, opacity: 0.12 },
  { x: '22%', y: '50%', size: 1, opacity: 0.1  },
  { x: '78%', y: '48%', size: 1, opacity: 0.1  },
];

/* ─── Default fallback messages ───────────────────────────── */
const DEFAULT_MESSAGES = [
  "I'd choose you in every version of our story.",
  "You make ordinary days feel extraordinary.",
  "Some of my favorite memories have you in them.",
  "Even the quiet moments feel special with you.",
  "You're still my favorite part of every day.",
  "Home feels a little warmer when you're around.",
  "Every chapter is better with you in it.",
  "I'd find my way back to you, every time.",
];

export default function RandomLoveMessage() {
  const { couple } = useCouple();
  const { playSound } = useSound();

  const rawMessages = (couple.randomMessages && couple.randomMessages.length > 0)
    ? couple.randomMessages
    : DEFAULT_MESSAGES;

  const messages = rawMessages.slice(0, 8);

  const [selected, setSelected] = useState(null);       // The finalized selected star ID
  const [activeMessage, setActiveMessage] = useState(null); // The message content currently displayed
  const [travelingStar, setTravelingStar] = useState(null); // The star ID currently traveling to center
  const [revealed, setRevealed] = useState(false);
  const [heartActive, setHeartActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const transitionRef = useRef(false);

  // Detect window resizing for responsive orbits
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const ringRadius = isMobile ? { 1: 85, 2: 125 } : { 1: 140, 2: 195 };

  const handleStarClick = useCallback((starId) => {
    if (transitionRef.current) return;
    if (selected === starId) return;

    transitionRef.current = true;

    // 1. Play soft chime/sweep immediately on click
    playSound('open');

    // 2. Clear old selection immediately so it spirals out and fades out old message
    setSelected(null);
    setRevealed(false);
    setTravelingStar(starId);

    // 3. After the travel animation duration (~800ms)
    const delay = reducedMotion ? 50 : 800;
    setTimeout(() => {
      // 4. Anchor the star at the center, pause its rotation
      setSelected(starId);
      setTravelingStar(null);
      setHeartActive(true);

      // 5. Play second warm note as the star merges into the heart
      playSound('timeline-select');
      
      // Update displayed message content
      setActiveMessage(messages[starId % messages.length]);

      // 6. Fade in the new message text
      setTimeout(() => {
        setRevealed(true);
        setHeartActive(false);
        transitionRef.current = false;
      }, reducedMotion ? 50 : 250);
    }, delay);
  }, [selected, messages, playSound, reducedMotion]);

  const displayNum = selected !== null
    ? String((selected % messages.length) + 1).padStart(2, '0') + ' / ' + String(messages.length).padStart(2, '0')
    : null;

  // Generate dynamic orbit keyframes
  const keyframesStyles = STAR_CONFIG.map(star => `
    @keyframes starOrbitClockwise_${star.id} {
      from { transform: rotate(${star.startAngle}deg); }
      to { transform: rotate(${star.startAngle + 360}deg); }
    }
    @keyframes starOrbitCounterClockwise_${star.id} {
      from { transform: rotate(${star.startAngle}deg); }
      to { transform: rotate(${star.startAngle - 360}deg); }
    }
  `).join('\n');

  return (
    <section
      id="randommessage"
      aria-label="Words of Love constellation"
      style={{
        background: 'radial-gradient(ellipse 85% 70% at 50% 50%, #170b2c 0%, #0f0622 45%, #070312 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '6rem 1rem',
        width: '100%',
      }}
    >
      <style>{keyframesStyles}</style>

      {/* ── Background stars (purely decorative, zero JS cost) ── */}
      {BG_SPARKLES.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#e8c4d4',
            opacity: s.opacity,
            pointerEvents: 'none',
            animation: reducedMotion ? 'none' : `twinkle ${3.5 + i * 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
            // Custom properties for keyframe twinkle
            '--op-from': s.opacity * 0.4,
            '--op-to': s.opacity * 1.5,
          }}
        />
      ))}

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '3.5rem', position: 'relative', zIndex: 2 }}
      >
        <span style={{
          display: 'block',
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(232,180,184,0.65)',
          marginBottom: '0.6rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          A Little Reminder
        </span>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontSize: 'clamp(2.4rem, 5.5vw, 3.6rem)',
          fontWeight: 600,
          color: '#FAF5F0',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          marginBottom: '0.8rem',
        }}>
          Words of Love
        </h2>
        <p style={{
          fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
          color: 'rgba(232,180,184,0.5)',
          fontStyle: 'italic',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '0.04em',
        }}>
          "Little thoughts, hidden among the stars."
        </p>
      </motion.div>

      {/* ── Constellation stage ─────────────────────────────────── */}
      <div
        aria-label="Love constellation space"
        style={{
          position: 'relative',
          width: 'min(440px, 95vw)',
          height: 'min(440px, 95vw)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          zIndex: 3,
        }}
      >
        {/* ── Orbit rings (purely visual, faint) ── */}
        {[1, 2].map(ring => (
          <div
            key={ring}
            aria-hidden="true"
            style={{
              position: 'absolute',
              borderRadius: '50%',
              border: `1px dashed rgba(232,180,184,${ring === 1 ? 0.07 : 0.045})`,
              width: `${ringRadius[ring] * 2}px`,
              height: `${ringRadius[ring] * 2}px`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* ── Central heart ──────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          {/* Ambient glow behind heart */}
          <div style={{
            position: 'absolute',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,131,138,0.22) 0%, transparent 70%)',
            filter: 'blur(16px)',
            animation: reducedMotion ? 'none' : 'heartGlow 4.5s ease-in-out infinite alternate',
            transform: heartActive ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }} />

          {/* Heart SVG */}
          <motion.div
            animate={heartActive
              ? { scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }
              : { scale: [1, 1.025, 1], opacity: [0.85, 0.95, 0.85] }
            }
            transition={heartActive
              ? { duration: 0.5, ease: 'easeInOut' }
              : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <svg
              width="80"
              height="74"
              viewBox="0 0 160 150"
              style={{ filter: 'drop-shadow(0 0 16px rgba(212,131,138,0.6))' }}
            >
              <defs>
                <linearGradient id="cHeartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E86C82" />
                  <stop offset="100%" stopColor="#C44866" />
                </linearGradient>
              </defs>
              <path
                d="M80 135 C 40 100, 0 80, 0 50 C 0 25, 20 10, 40 10 C 55 10, 68 18, 80 30 C 92 18, 105 10, 120 10 C 140 10, 160 25, 160 50 C 160 80, 120 100, 80 135Z"
                fill="url(#cHeartGrad)"
              />
              <path
                d="M60 40 C 62 30, 70 24, 80 30"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </motion.div>
        </div>

        {/* ── Orbiting stars ──────────────────────────────────── */}
        {STAR_CONFIG.map((star) => {
          const r = ringRadius[star.ring];
          const isSelected = selected === star.id;
          const isTraveling = travelingStar === star.id;
          const msgForStar = star.id % messages.length;

          return (
            <div
              key={star.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 0,
                height: 0,
                transformOrigin: 'center center',
                animation: reducedMotion ? 'none' : `starOrbitClockwise_${star.id} ${star.speed}s linear infinite`,
                animationPlayState: isSelected ? 'paused' : 'running',
                // Check if direction is counter-clockwise
                ...(star.direction === -1 ? {
                  animationName: `starOrbitCounterClockwise_${star.id}`
                } : {})
              }}
              className="star-orbit-wrapper"
            >
              <OrbitingStarButton
                star={star}
                radius={r}
                isSelected={isSelected}
                isTraveling={isTraveling}
                reducedMotion={reducedMotion}
                onClick={() => handleStarClick(star.id)}
                ariaLabel={`Love thought ${msgForStar + 1}`}
              />
            </div>
          );
        })}
      </div>

      {/* ── Message reveal ──────────────────────────────────────── */}
      <div
        style={{
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2.5rem',
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '560px',
          padding: '0 1.5rem',
        }}
      >
        <AnimatePresence mode="wait">
          {selected !== null && revealed ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
              transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
              style={{ textAlign: 'center', width: '100%' }}
            >
              {/* Eyebrow */}
              <span style={{
                display: 'block',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: 'rgba(232,180,184,0.5)',
                marginBottom: '1.2rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                A Little Thought For You
              </span>

              {/* Float the typography naturally without cards or box layouts */}
              <p style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontSize: 'clamp(1.4rem, 3.8vw, 1.95rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#FAF5F0',
                lineHeight: 1.7,
                letterSpacing: '0.01em',
                margin: '0 auto',
                wordBreak: 'break-word',
              }}>
                "{activeMessage}"
              </p>

              {/* Counter */}
              <span style={{
                display: 'block',
                marginTop: '1.5rem',
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                color: 'rgba(232,180,184,0.35)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {displayNum}
              </span>

              {/* Soft prompt indicator */}
              <p style={{
                marginTop: '2rem',
                fontSize: '0.78rem',
                color: 'rgba(232,180,184,0.22)',
                fontStyle: 'italic',
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '0.04em',
              }}>
                explore the space to discover another thought
              </p>
            </motion.div>
          ) : selected === null && !travelingStar ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center' }}
            >
              <p style={{
                fontSize: '0.82rem',
                color: 'rgba(232,180,184,0.3)',
                fontStyle: 'italic',
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '0.05em',
              }}>
                discover the memories revolving around our heart
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── CSS animations stylesheet ───────────────────────────── */}
      <style>{`
        @keyframes twinkle {
          from { opacity: var(--op-from, 0.15); transform: scale(1); }
          to   { opacity: var(--op-to, 0.45);   transform: scale(1.35); }
        }
        @keyframes heartGlow {
          from { opacity: 0.55; transform: scale(1); }
          to   { opacity: 0.95; transform: scale(1.16); }
        }
        .orbit-star {
          position: absolute;
          border-radius: 50%;
          cursor: pointer;
          will-change: transform;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
        }
        .orbit-star:focus-visible {
          outline: 2px solid rgba(232,180,184,0.5);
          outline-offset: 4px;
        }
        .orbit-star-inner {
          border-radius: 50%;
          transition: transform 0.35s ease, box-shadow 0.35s ease, opacity 0.35s ease;
        }
        .orbit-star:hover .orbit-star-inner,
        .orbit-star:focus-visible .orbit-star-inner {
          transform: scale(1.4) !important;
          opacity: 1 !important;
        }
        .star-orbit-wrapper:hover {
          animation-play-state: paused !important;
        }
        /* Reduced motion override */
        @media (prefers-reduced-motion: reduce) {
          .star-orbit-wrapper { animation: none !important; }
          .orbit-star { transition: none !important; }
          .orbit-star-inner { transition: none !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── Individual orbiting star button component ─────────────────── */
function OrbitingStarButton({ star, radius, isSelected, isTraveling, reducedMotion, onClick, ariaLabel }) {
  const dotSize = star.sizePx;
  const hitSize = Math.max(dotSize + 22, 44); // 44px minimum touch target

  const glowSize = dotSize + 10;
  const glowColor = star.glowColor;

  // Base ambient glow styles
  const idleBoxShadow = `0 0 ${dotSize + 3}px ${dotSize - 1}px ${glowColor}50, 0 0 ${dotSize * 2}px ${glowColor}25`;
  const activeBoxShadow = `0 0 ${dotSize + 7}px ${dotSize + 2}px ${glowColor}90, 0 0 ${dotSize * 3}px ${glowColor}65`;

  const isAtCenter = isSelected || isTraveling;

  const buttonStyle = reducedMotion
    ? {
        position: 'absolute',
        width: hitSize,
        height: hitSize,
        transform: `rotate(${star.startAngle}deg) translateX(${radius}px) rotate(-${star.startAngle}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
        transform: isAtCenter
          ? 'translate(-50%, -50%) translate(14px, -14px)' // Sits close to heart as a glowing accent
          : `translate(-50%, -50%) translate(${radius}px, 0px)`,
        transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
        width: hitSize,
        height: hitSize,
      };

  return (
    <button
      type="button"
      className="orbit-star"
      style={buttonStyle}
      onClick={onClick}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {/* Soft outer aura ring */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: glowSize + 8,
          height: glowSize + 8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor}15 0%, transparent 70%)`,
          animation: reducedMotion ? 'none' : `twinkle ${2.8 + star.id * 0.4}s ease-in-out infinite alternate`,
          animationDelay: `${star.id * 0.3}s`,
          pointerEvents: 'none',
          '--op-from': 0.05,
          '--op-to': 0.22,
        }}
      />

      {/* Main core dot */}
      <span
        className="orbit-star-inner"
        aria-hidden="true"
        style={{
          width: dotSize,
          height: dotSize,
          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${glowColor} 75%, ${glowColor} 100%)`,
          opacity: isSelected ? 1 : star.brightness,
          boxShadow: isSelected ? activeBoxShadow : idleBoxShadow,
          transform: isSelected ? 'scale(1.6)' : 'scale(1)',
          // Render star shape polygons for alternate points to keep it organic
          ...(star.id % 3 === 0 ? {
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            borderRadius: '0',
          } : {}),
        }}
      />
    </button>
  );
}
