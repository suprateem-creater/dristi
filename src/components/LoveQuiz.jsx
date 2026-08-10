import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
import { Check, X as CloseIcon, Sparkles } from 'lucide-react';
import { useSound } from '../SoundContext';

const DEFAULT_QUESTIONS = [
  {
    question: "Where was our very first date?",
    options: ["A cozy coffee shop", "The botanical garden", "By the sunset beach", "A quiet bookstore café"],
    correct: 0,
  },
  {
    question: "What was the first movie we watched together?",
    options: ["La La Land", "About Time", "Before Sunrise", "The Notebook"],
    correct: 1,
  },
  {
    question: "Who said 'I love you' first?",
    options: ["You did 💕", "I did! 🥰", "We said it at the same time!", "It was a secret"],
    correct: 2,
  },
  {
    question: "What is our favorite thing to do on a lazy Sunday?",
    options: ["Sleep in & make brunch", "Go on long road trips", "Binge-watch our favorite show", "Cook together"],
    correct: 0,
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/* ─── Static background sparkles ───────────────────────────── */
const BG_SPARKLES = [
  { x: '10%', y: '15%', size: 1.5, opacity: 0.2 },
  { x: '85%', y: '12%', size: 2,   opacity: 0.18 },
  { x: '6%',  y: '75%', size: 2,   opacity: 0.22 },
  { x: '92%', y: '80%', size: 1.5, opacity: 0.15 },
  { x: '20%', y: '90%', size: 1,   opacity: 0.12 },
  { x: '78%', y: '88%', size: 2,   opacity: 0.18 },
];

export default function LoveQuiz() {
  const { couple } = useCouple();
  const { playSound } = useSound();
  const questions = (couple.loveQuiz && couple.loveQuiz.length > 0) ? couple.loveQuiz : DEFAULT_QUESTIONS;

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  // Quiz states: "playing" | "transitioning" | "result"
  const [quizState, setQuizState] = useState("playing");
  const [finalScore, setFinalScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [scoreSettled, setScoreSettled] = useState(false);
  const [particles, setParticles] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  const q = questions[step] || questions[0];

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Ensure selected and feedback are reset when step changes to prevent faded options on new question load
  useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [step]);

  const handleAnswer = (index, e) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === q.correct;
    
    if (correct) {
      playSound('timeline-today');
      setScore(s => s + 1);
      setFeedback('correct');
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      spawnHearts(x, y, 8);
    } else {
      playSound('close');
      setFeedback('wrong');
    }

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      
      if (step + 1 < questions.length) {
        setStep(s => s + 1);
      } else {
        const finalVal = score + (correct ? 1 : 0);
        setFinalScore(finalVal);
        
        // Orchestrate smooth transition from final question to results
        setQuizState("transitioning");
        setTimeout(() => {
          setQuizState("result");
        }, 550);
      }
    }, 1300);
  };

  // Score Count-Up Animation
  useEffect(() => {
    if (quizState !== 'result') return;

    if (reducedMotion) {
      setDisplayScore(finalScore);
      triggerCelebration();
      return;
    }

    let current = 0;
    const totalDuration = 700; // Count-up over 700ms
    const stepTime = Math.max(120, totalDuration / Math.max(1, finalScore));

    const timer = setInterval(() => {
      if (current < finalScore) {
        current += 1;
        setDisplayScore(current);
        playSound('hover');
      } else {
        clearInterval(timer);
        triggerCelebration();
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [quizState, finalScore, reducedMotion]);

  // Play soft chime when results screen mounts
  useEffect(() => {
    if (quizState === 'result') {
      playSound('timeline-today');
    }
  }, [quizState]);

  const triggerCelebration = () => {
    setScoreSettled(true);
    
    // Play celebratory romantic sound once count finishes
    playSound('celebration');

    if (reducedMotion) return;

    // Generate 10 romantic floating particle coordinates (hearts & dots)
    const newParticles = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      angle: (i * 360) / 10 + (Math.random() - 0.5) * 15,
      distance: 80 + Math.random() * 80,
      size: i % 3 === 0 ? 8 : 4 + Math.random() * 3, // some tiny hearts, some dots
      delay: i * 0.05,
      type: i % 3 === 0 ? 'heart' : 'dot',
    }));
    setParticles(newParticles);
  };

  const restart = () => {
    playSound('click');
    setStep(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setFinalScore(0);
    setDisplayScore(0);
    setScoreSettled(false);
    setParticles([]);
    setQuizState("playing");
  };

  const getResult = () => {
    const total = questions.length;
    if (finalScore === total) return `You know us better than anyone in the universe 💕`;
    if (finalScore >= total * 0.75) return `So close to perfection! You truly know my heart 🌸`;
    return `Every moment with you is a memory worth celebrating 🥂`;
  };

  const getResultHeader = () => {
    const total = questions.length;
    if (finalScore === total) return "YOU KNOW US PERFECTLY";
    if (finalScore >= total * 0.75) return "YOU KNOW US PRETTY WELL";
    return "QUIZ COMPLETE";
  };

  return (
    <section 
      id="quiz" 
      className="section-wrapper" 
      style={{ 
        background: 'radial-gradient(ellipse 85% 70% at 50% 50%, #150a29 0%, #0e051e 45%, #06020f 100%)',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '6rem 1rem',
      }}
    >
      {/* ── Background stars (cohesive atmosphere) ── */}
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
            animation: reducedMotion ? 'none' : `twinkle ${3 + i * 0.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.3}s`,
            '--op-from': s.opacity * 0.5,
            '--op-to': s.opacity * 1.5,
          }}
        />
      ))}

      <div className="section-container w-full max-w-4xl" style={{ position: 'relative', zIndex: 2 }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto"
          style={{ marginBottom: 'clamp(2.5rem, 4.5vw, 3.5rem)' }}
        >
          <span 
            style={{
              display: 'block',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgba(232,180,184,0.65)',
              marginBottom: '0.6rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Test Your Memory
          </span>
          <h2 
            className="section-title text-center"
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
              fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
              color: '#FAF5F0',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              marginBottom: '0.7rem',
            }}
          >
            How Well Do You Know Us?
          </h2>
          <p 
            className="section-subtitle text-center max-w-2xl"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
              fontWeight: 400,
              color: 'rgba(232,180,184,0.5)',
              lineHeight: 1.5,
            }}
          >
            A mini playful quiz celebrating all the little moments we shared.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {quizState === "playing" && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="relative w-full max-w-[780px] mx-auto"
              style={{
                padding: '1rem 0',
              }}
            >
              {/* Progress Tracker */}
              <div 
                className="flex items-center justify-between gap-4"
                style={{ marginBottom: 'clamp(1.2rem, 2.4vw, 1.8rem)' }}
              >
                <div 
                  className="flex flex-1"
                  style={{ gap: 'clamp(0.75rem, 1.5vw, 1rem)' }}
                >
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 transition-all duration-500 shadow-xs"
                      style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: i <= step ? 'linear-gradient(90deg, #E86C82, #C44866)' : 'rgba(232, 180, 184, 0.15)',
                      }}
                    />
                  ))}
                </div>
                <span 
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#E8B4B8',
                    padding: '5px 12px',
                    background: 'rgba(232, 180, 184, 0.08)',
                    borderRadius: '20px',
                    border: '1px solid rgba(232, 180, 184, 0.15)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {step + 1} / {questions.length}
                </span>
              </div>

              {/* Question Text */}
              <div 
                className="text-center px-2 max-w-2xl mx-auto"
                style={{ marginBottom: 'clamp(1.8rem, 3vw, 2.4rem)' }}
              >
                <h3 
                  className="leading-snug"
                  style={{
                    fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.15rem)',
                    fontWeight: 500,
                    color: '#FAF5F0',
                  }}
                >
                  {q.question}
                </h3>
              </div>

              {/* 2x2 Grid Options */}
              <div
                className="quiz-options-grid w-full"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                  gap: 'clamp(1rem, 2vw, 1.25rem)',
                }}
              >
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === q.correct;
                  const letter = OPTION_LETTERS[i] || `${i + 1}`;

                  let cardStyleObj = {
                    background: 'rgba(232, 180, 184, 0.04)',
                    borderColor: 'rgba(232, 180, 184, 0.12)',
                    color: '#FAF5F0',
                    borderRadius: '20px',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  };
                  let letterBadgeStyles = 'bg-white/5 text-rose-300 border-white/10 font-bold';
                  let hoverEnabled = selected === null;

                  if (selected !== null) {
                    if (isSelected && isCorrect) {
                      cardStyleObj = {
                        background: 'linear-gradient(90deg, #10B981, #14B8A6)',
                        borderColor: '#10B981',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                      };
                      letterBadgeStyles = 'bg-white text-emerald-600 border-white shadow-md font-bold';
                    } else if (isSelected && !isCorrect) {
                      cardStyleObj = {
                        background: 'linear-gradient(90deg, #EF4444, #F43F5E)',
                        borderColor: '#EF4444',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                      };
                      letterBadgeStyles = 'bg-white text-rose-600 border-white shadow-md font-bold';
                    } else if (isCorrect) {
                      cardStyleObj = {
                        background: 'linear-gradient(90deg, #10B981, #14B8A6)',
                        borderColor: '#10B981',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                      };
                      letterBadgeStyles = 'bg-white text-emerald-600 border-white shadow-md font-bold';
                    } else {
                      cardStyleObj = {
                        background: 'rgba(255, 255, 255, 0.01)',
                        borderColor: 'rgba(255, 255, 255, 0.03)',
                        color: 'rgba(255, 255, 255, 0.25)',
                        borderRadius: '20px',
                        opacity: 0.4,
                      };
                      letterBadgeStyles = 'bg-transparent text-gray-500 border-white/5';
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={hoverEnabled ? { y: -3, borderColor: 'rgba(232, 180, 184, 0.35)', background: 'rgba(232, 180, 184, 0.08)' } : {}}
                      whileTap={hoverEnabled ? { scale: 0.99 } : {}}
                      onMouseEnter={() => hoverEnabled && playSound('hover')}
                      onClick={(e) => handleAnswer(i, e)}
                      disabled={selected !== null}
                      className="flex items-center text-left transition-all duration-300 border cursor-pointer select-none relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 w-full"
                      style={{
                        ...cardStyleObj,
                        minHeight: 'clamp(5rem, 10vw, 6rem)',
                        paddingTop: 'clamp(0.8rem, 1.8vw, 1.2rem)',
                        paddingBottom: 'clamp(0.8rem, 1.8vw, 1.2rem)',
                        paddingLeft: 'clamp(1rem, 2vw, 1.5rem)',
                        paddingRight: 'clamp(1rem, 2vw, 1.5rem)',
                        gap: 'clamp(1rem, 2vw, 1.25rem)',
                      }}
                    >
                      {/* Option Letter Chip */}
                      <div
                        style={{
                          width: 'clamp(2.4rem, 4vw, 2.8rem)',
                          height: 'clamp(2.4rem, 4vw, 2.8rem)',
                          borderRadius: '12px',
                          fontSize: 'clamp(0.9rem, 1.8vw, 1rem)',
                        }}
                        className={`flex-shrink-0 border flex items-center justify-center font-bold ${letterBadgeStyles}`}
                      >
                        {selected !== null && isCorrect ? (
                          <Check size={18} className="stroke-[3]" />
                        ) : selected !== null && isSelected && !isCorrect ? (
                          <CloseIcon size={18} className="stroke-[3]" />
                        ) : (
                          letter
                        )}
                      </div>

                      {/* Option Text */}
                      <span
                        className="flex-1 font-sans"
                        style={{ 
                          fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
                          fontWeight: 500,
                          lineHeight: 1.4,
                          color: selected !== null && !isCorrect && !isSelected ? 'rgba(255, 255, 255, 0.3)' : '#FAF5F0'
                        }}
                      >
                        {opt}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback Animation */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="mt-6 text-center"
                  >
                    <p
                      className="text-xl sm:text-2xl font-bold font-script"
                      style={{ color: feedback === 'correct' ? '#10B981' : '#F43F5E' }}
                    >
                      {feedback === 'correct' ? '✓ Exactly right! You remember! 💕' : '✗ Aww, close! But I still love you 🥰'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {quizState === "transitioning" && (
            <motion.div
              key="transition-stage"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ minHeight: '300px' }}
            />
          )}

          {quizState === "result" && (
            <motion.div
              key="result-stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* ── Center Heart ── */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.2rem' }}>
                {/* Champagne/Blush Celebration Particles Starburst */}
                {particles.map(p => (
                  <motion.span
                    key={p.id}
                    initial={{ x: 24, y: 22, opacity: 1, scale: 0.2 }}
                    animate={{
                      x: 24 + Math.cos((p.angle * Math.PI) / 180) * p.distance,
                      y: 22 + Math.sin((p.angle * Math.PI) / 180) * p.distance,
                      opacity: 0,
                      scale: 1.2,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: p.delay }}
                    style={{
                      position: 'absolute',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      color: p.id % 2 === 0 ? '#E8B4B8' : '#FAF5F0',
                    }}
                  >
                    {p.type === 'heart' ? (
                      <span style={{ fontSize: `${p.size}px`, lineHeight: 1 }}>♥</span>
                    ) : (
                      <span 
                        style={{ 
                          width: `${p.size}px`, 
                          height: `${p.size}px`, 
                          borderRadius: '50%', 
                          background: 'currentColor',
                          boxShadow: `0 0 8px currentColor`
                        }} 
                      />
                    )}
                  </motion.span>
                ))}

                <motion.div
                  whileHover={{ scale: 1.08 }}
                  animate={{
                    scale: [1, 1.08, 1.02, 1.15, 1, 1],
                    filter: [
                      'drop-shadow(0 0 10px rgba(232, 180, 184, 0.4))',
                      'drop-shadow(0 0 20px rgba(232, 180, 184, 0.7))',
                      'drop-shadow(0 0 12px rgba(232, 180, 184, 0.5))',
                      'drop-shadow(0 0 24px rgba(232, 180, 184, 0.8))',
                      'drop-shadow(0 0 10px rgba(232, 180, 184, 0.4))',
                      'drop-shadow(0 0 10px rgba(232, 180, 184, 0.4))'
                    ]
                  }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.1, 0.18, 0.32, 0.48, 1]
                  }}
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    playSound('heart');
                    spawnHearts(window.innerWidth / 2, window.innerHeight / 3.5, 6);
                  }}
                >
                  <svg
                    width="48"
                    height="44"
                    viewBox="0 0 160 150"
                  >
                    <path
                      d="M80 135 C 40 100, 0 80, 0 50 C 0 25, 20 10, 40 10 C 55 10, 68 18, 80 30 C 92 18, 105 10, 120 10 C 140 10, 160 25, 160 50 C 160 80, 120 100, 80 135Z"
                      fill="#E8B4B8"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Quiz Result Title */}
              <span 
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(232,180,184,0.65)',
                  marginBottom: '1.5rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {getResultHeader()}
              </span>

              {/* ── Main Score Centerpiece (Vertical Stack) ── */}
              <div 
                style={{ 
                  margin: '0.5rem 0 2.5rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <motion.div 
                  animate={scoreSettled ? { 
                    scale: [1, 1.08, 1],
                    textShadow: [
                      '0 0 25px rgba(232, 180, 184, 0.2)',
                      '0 0 50px rgba(232, 180, 184, 0.6)',
                      '0 0 35px rgba(232, 180, 184, 0.3)'
                    ]
                  } : {}}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    fontSize: 'clamp(6rem, 15vw, 9.5rem)',
                    fontWeight: 200,
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                    color: '#FAF5F0',
                    lineHeight: 0.85,
                  }}
                >
                  {displayScore}
                </motion.div>
                
                <div style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                  color: 'rgba(232,180,184,0.65)',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  lineHeight: 1.2,
                  marginTop: '0.5rem',
                }}>
                  of {questions.length}
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#E8B4B8',
                  marginTop: '0.4rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  correct
                </div>
              </div>

              {/* ── Personal Message Quote ── */}
              <AnimatePresence>
                {scoreSettled && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                    style={{ textAlign: 'center' }}
                  >
                    <p 
                      style={{
                        fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                        fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
                        fontStyle: 'italic',
                        color: '#FAF5F0',
                        lineHeight: 1.65,
                        maxWidth: '460px',
                        margin: '0 auto 2.8rem auto',
                        wordBreak: 'break-word',
                        padding: '0 1rem',
                      }}
                    >
                      "{getResult()}"
                    </p>

                    {/* ── Try Again Pill Button ── */}
                    <motion.button
                      type="button"
                      onClick={restart}
                      whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(232, 180, 184, 0.45)', filter: 'brightness(1.08)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        background: '#E8B4B8',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        borderRadius: '9999px',
                        padding: '13px 36px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: '#150a29',
                        boxShadow: '0 8px 24px rgba(232, 180, 184, 0.25)',
                        cursor: 'pointer',
                        outline: 'none',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Try Again</span>
                      <span style={{ fontSize: '0.85rem' }}>♥</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes twinkle {
          from { opacity: var(--op-from, 0.1); transform: scale(0.9); }
          to   { opacity: var(--op-to, 0.35);  transform: scale(1.2); }
        }
        @keyframes heartGlow {
          from { opacity: 0.5; transform: scale(1); }
          to   { opacity: 0.95; transform: scale(1.15); }
        }
      `}</style>
    </section>
  );
}
