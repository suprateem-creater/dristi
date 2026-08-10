import React, { useMemo, useState, useEffect } from 'react';

// Pre-generate randomized particles to keep render performance extremely fast and static
const generateParticles = (count) => {
  return Array.from({ length: count }).map((_, i) => {
    const isHeart = i % 4 === 0;
    const isBlurred = i % 3 === 0;
    const size = isHeart 
      ? (i % 3) * 3 + 8 // 8px to 14px for hearts
      : (i % 3) * 1.5 + 2; // 2px to 5px for stars/dust
    
    // Assign to 3 depth categories: distant (0), middle (1), foreground (2)
    const depth = i % 3;
    let opacity = 0.08;
    if (depth === 1) opacity = 0.15;
    if (depth === 2) opacity = 0.22;
    
    // Distribute randomly across the canvas
    const left = `${(i * 17 + 11) % 96}%`;
    const top = `${(i * 23 + 7) % 96}%`;
    
    // Durations for drift animations: slow and subtle (18s to 32s)
    const duration = 20 + (i % 5) * 5;
    const delay = -(i % 4) * 6; // negative delay to avoid simultaneous starts
    
    return {
      id: i,
      isHeart,
      isBlurred,
      size,
      depth,
      opacity,
      left,
      top,
      duration,
      delay
    };
  });
};

export default function AtmosphericBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Detect mobile viewport to reduce particle counts
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    const motionHandler = (e) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener('change', motionHandler);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  const particles = useMemo(() => {
    // 24 particles on desktop, 12 on mobile for high performance
    const count = isMobile ? 12 : 24;
    return generateParticles(count);
  }, [isMobile]);

  if (shouldReduceMotion) {
    // Static gradients and vignette, no drifting particles or animations
    return (
      <div 
        className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 30%, #150920 0%, #08030d 75%)',
        }}
      >
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#040108]/90" />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 30%, #13071d 0%, #0d0615 50%, #06020a 100%)',
      }}
    >
      <style>{`
        @keyframes subtleDrift {
          0% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(8px);
          }
          100% {
            transform: translateY(0px) translateX(0px);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.18;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Cinematic Ambient Lighting spots (2-4 large, extremely subtle radial zones) */}
      <div 
        className="absolute w-[85vw] h-[85vw] max-w-[1200px] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{
          left: '-20%',
          top: '-10%',
          background: 'radial-gradient(circle, rgba(168, 78, 89, 0.12) 0%, transparent 70%)',
          animation: 'pulseGlow 28s ease-in-out infinite',
        }}
      />
      
      <div 
        className="absolute w-[75vw] h-[75vw] max-w-[1000px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{
          right: '-10%',
          bottom: '-10%',
          background: 'radial-gradient(circle, rgba(234, 214, 195, 0.08) 0%, transparent 70%)',
          animation: 'pulseGlow 35s ease-in-out infinite alternate',
        }}
      />

      <div 
        className="absolute w-[60vw] h-[60vw] max-w-[800px] rounded-full blur-[110px] opacity-15 pointer-events-none"
        style={{
          left: '30%',
          top: '40%',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.04) 0%, transparent 70%)',
        }}
      />

      {/* Edge Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(4, 1, 8, 0.45) 85%, rgba(2, 0, 5, 0.8) 100%)',
        }}
      />

      {/* Randomized Sparse Floating Particles */}
      {particles.map((p) => {
        const blurFilter = p.isBlurred && !isMobile ? 'blur(1.5px)' : 'none';
        
        return (
          <div
            key={p.id}
            className="absolute pointer-events-none transition-opacity"
            style={{
              left: p.left,
              top: p.top,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              filter: blurFilter,
              willChange: 'transform',
              animation: `subtleDrift ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.isHeart ? (
              <span style={{ color: 'rgba(255, 117, 143, 0.35)' }}>❤️</span>
            ) : (
              <div 
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: '50%',
                  background: p.id % 2 === 0 ? '#EAD6C3' : '#FFFFFF',
                  boxShadow: p.depth === 2 ? '0 0 6px rgba(255,255,255,0.7)' : 'none',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
