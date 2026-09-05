import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
import { useSound } from '../SoundContext';
import { 
  Sparkles, 
  Calendar, 
  Heart, 
  Mail, 
  PhoneCall, 
  Sunset, 
  Stethoscope, 
  Camera, 
  Plane, 
  PartyPopper,
  Check,
  X as CloseIcon,
  RotateCcw,
  Award
} from 'lucide-react';

// Stylized Icon Resolver matching prompt specifications
function MilestoneIcon({ icon, className = "text-rose-500" }) {
  if (typeof icon === 'string') {
    const lower = icon.toLowerCase();
    if (icon === '💌' || lower.includes('envelope') || lower.includes('message') || lower.includes('mail')) {
      return <span className="text-3xl select-none" role="img" aria-label="envelope">💌</span>;
    }
    if (icon === '📞' || lower.includes('phone') || lower.includes('call')) {
      return <span className="text-3xl select-none" role="img" aria-label="phone">📞</span>;
    }
    if (icon === '🌅' || lower.includes('sunset') || lower.includes('date')) {
      return <span className="text-3xl select-none" role="img" aria-label="sunset">🌅</span>;
    }
    if (icon === '🩺' || lower.includes('stethoscope') || lower.includes('talk')) {
      return <span className="text-3xl select-none" role="img" aria-label="stethoscope">🩺</span>;
    }
    if (icon === '📸' || lower.includes('camera') || lower.includes('photo')) {
      return <span className="text-3xl select-none" role="img" aria-label="camera">📸</span>;
    }
    if (icon === '❤️' || lower.includes('heart') || lower.includes('love')) {
      return <span className="text-3xl select-none" role="img" aria-label="heart">❤️</span>;
    }
    if (icon === '🎄' || lower.includes('christmas') || lower.includes('tree')) {
      return <span className="text-3xl select-none" role="img" aria-label="christmas">🎄</span>;
    }
    if (icon === '✈️' || lower.includes('plane') || lower.includes('trip')) {
      return <span className="text-3xl select-none" role="img" aria-label="plane">✈️</span>;
    }
    if (icon === '🎉' || lower.includes('party') || lower.includes('anniversary')) {
      return <span className="text-3xl select-none" role="img" aria-label="anniversary">🎉</span>;
    }
    return <span className="text-3xl select-none">{icon}</span>;
  }
  return <Sparkles size={26} className={className} />;
}

function TimelineCard({ item, index, isLeft }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="relative w-full">
      {/* ── Desktop: CSS Grid — 3 columns: [left card/spacer] [node] [right card/spacer] ── */}
      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: '1fr auto 1fr',
          columnGap: 'clamp(3rem, 8vw, 5rem)',
          alignItems: 'center',
        }}
      >
        {/* Left Column: holds left card or an empty spacer */}
        {isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.96 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(212,131,138,0.18), 0 6px 18px rgba(0,0,0,0.04)' }}
            className="rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-rose-200/90 relative overflow-hidden group select-none text-left"
            style={{
              justifySelf: 'end',
              width: '100%',
              maxWidth: 'clamp(18rem, 40vw, 27rem)',
              background: 'linear-gradient(155deg, #FFFDFB 0%, #FFF5F7 60%, #FEEDF2 100%)',
              boxShadow: '0 16px 40px rgba(212,131,138,0.10), 0 4px 14px rgba(0,0,0,0.03)',
              padding: 'clamp(1.5rem, 3vw, 2rem)',
            }}
          >
            <CardContent item={item} index={index} />
          </motion.div>
        ) : (
          <div />
        )}

        {/* Center Node Column: center timeline marker */}
        <div className="flex justify-center flex-shrink-0" style={{ width: '3rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className="w-9 h-9 rounded-full border-4 border-white bg-gradient-to-tr from-rose-400 via-rose-500 to-pink-500 shadow-[0_0_22px_rgba(244,63,94,0.6)] z-20 flex items-center justify-center text-white"
          >
            <Heart size={14} className="fill-white text-white" />
          </motion.div>
        </div>

        {/* Right Column: holds right card or an empty spacer */}
        {!isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(212,131,138,0.18), 0 6px 18px rgba(0,0,0,0.04)' }}
            className="rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-rose-200/90 relative overflow-hidden group select-none text-left"
            style={{
              justifySelf: 'start',
              width: '100%',
              maxWidth: 'clamp(18rem, 40vw, 27rem)',
              background: 'linear-gradient(155deg, #FFFDFB 0%, #FFF5F7 60%, #FEEDF2 100%)',
              boxShadow: '0 16px 40px rgba(212,131,138,0.10), 0 4px 14px rgba(0,0,0,0.03)',
              padding: 'clamp(1.5rem, 3vw, 2rem)',
            }}
          >
            <CardContent item={item} index={index} />
          </motion.div>
        ) : (
          <div />
        )}
      </div>

      {/* ── Mobile: Left-aligned stack ── */}
      <div className="flex md:hidden items-start gap-4 pl-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          className="w-8 h-8 rounded-full border-3 border-white bg-gradient-to-tr from-rose-400 via-rose-500 to-pink-500 shadow-md flex-shrink-0 mt-4 z-20 flex items-center justify-center text-white"
        >
          <Heart size={12} className="fill-white text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex-1 rounded-3xl shadow-md border border-rose-200/90 text-left"
          style={{
            background: 'linear-gradient(155deg, #FFFDFB 0%, #FFF5F7 60%, #FEEDF2 100%)',
            padding: 'clamp(1.25rem, 4vw, 1.75rem) clamp(1.5rem, 5vw, 2rem)',
          }}
        >
          <CardContent item={item} index={index} mobile />
        </motion.div>
      </div>
    </div>
  );
}

function CardContent({ item, index, mobile = false }) {
  const iconSize = mobile ? 'w-11 h-11' : 'w-13 h-13';
  const iconRound = mobile ? 'rounded-xl' : 'rounded-2xl';
  const titleClass = mobile
    ? 'font-serif font-bold text-xl sm:text-2xl text-gray-900 leading-snug'
    : 'font-serif font-bold text-2xl sm:text-[1.7rem] text-gray-900 leading-snug tracking-tight';
  const descClass = mobile
    ? 'text-sm sm:text-base text-gray-700 leading-relaxed font-sans'
    : 'text-base text-gray-700 leading-relaxed font-sans';

  return (
    <>
      {/* Top Row: Icon + Date — Icon-to-content spacing: 16px to 20px */}
      <div 
        className="flex items-center justify-between gap-3"
        style={{ marginBottom: 'clamp(1rem, 2vw, 1.25rem)' }}
      >
        <div className={`${iconSize} ${iconRound} bg-white shadow-xs border border-rose-100/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          <MilestoneIcon icon={item.icon} />
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50/90 border border-rose-200/90 text-[11px] font-extrabold uppercase tracking-widest text-rose-600 shadow-xs flex-shrink-0">
          <Calendar size={12} className="text-rose-500" />
          <span>{item.date}</span>
        </div>
      </div>

      {/* Event Title — Heading-to-description spacing: 8px to 12px */}
      <h3 
        className={titleClass}
        style={{ marginBottom: 'clamp(0.5rem, 1.2vw, 0.75rem)' }}
      >
        {item.event}
      </h3>

      {/* Description */}
      <p className={descClass}>{item.desc}</p>

      {/* Chapter Label — Refined Luxury Monospace Badge */}
      <div 
        className="pt-3.5 border-t border-white/10 flex items-center justify-between text-rose-300 font-mono text-[11px] uppercase tracking-wider"
        style={{ marginTop: 'clamp(0.75rem, 1.8vw, 1rem)' }}
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Sparkles size={13} className="text-rose-400" /> Chapter #{index + 1}
        </span>
        <Heart size={13} className="fill-rose-400 text-rose-400 opacity-75 animate-pulse" />
      </div>
    </>
  );
}

// Labeled options helper
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const DEFAULT_QUIZ_QUESTIONS = [
  {
    question: "Where was our very first date?",
    options: ["A cozy coffee shop", "The botanical garden", "By the sunset beach", "A quiet bookstore café"],
    correct: 1, // 'The botanical garden' (Option B)
  },
  {
    question: "What was the first movie we watched together?",
    options: ["La La Land", "About Time", "Before Sunrise", "The Notebook"],
    correct: 1,
  },
  {
    question: "Who said 'I love you' first?",
    options: ["You did 💕", "I did! 🥰", "We said it at the same time!", "It was a secret"],
    correct: 0,
  },
  {
    question: "What is our favorite thing to do on a lazy Sunday?",
    options: ["Sleep in & make brunch", "Go on long road trips", "Binge-watch our favorite show", "Cook together"],
    correct: 0,
  },
];

/* ── Scattered Faint Heart Accent for Quiz Background ── */
const QUIZ_SCATTER_HEARTS = [
  { top: '6%', left: '4%', size: 18, rotate: -15, opacity: 0.18 },
  { top: '14%', right: '6%', size: 22, rotate: 12, opacity: 0.15 },
  { top: '28%', left: '8%', size: 16, rotate: 25, opacity: 0.12 },
  { top: '38%', right: '5%', size: 20, rotate: -20, opacity: 0.16 },
  { top: '52%', left: '3%', size: 24, rotate: 8, opacity: 0.14 },
  { top: '62%', right: '7%', size: 18, rotate: -10, opacity: 0.17 },
  { top: '74%', left: '6%', size: 14, rotate: 30, opacity: 0.13 },
  { top: '82%', right: '4%', size: 20, rotate: -5, opacity: 0.15 },
  { top: '90%', left: '10%', size: 16, rotate: 18, opacity: 0.11 },
  { top: '45%', right: '10%', size: 26, rotate: -22, opacity: 0.1 },
  { top: '20%', left: '12%', size: 12, rotate: 35, opacity: 0.12 },
  { top: '70%', right: '12%', size: 14, rotate: -30, opacity: 0.1 },
];

/* ── Centered Interactive Quiz Card Below Timeline ── */
function TimelineQuizCard() {
  const { couple } = useCouple();
  const { playSound } = useSound();
  const questions = (couple.loveQuiz && couple.loveQuiz.length > 0) 
    ? couple.loveQuiz 
    : ((couple.quizQuestions && couple.quizQuestions.length > 0) ? couple.quizQuestions : DEFAULT_QUIZ_QUESTIONS);

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

  // Play soft chime when results screen mounts
  useEffect(() => {
    if (quizState === 'result') {
      playSound('timeline-today');
    }
  }, [quizState]);

  const handleSelectOption = (index, e) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === q.correct;
    
    if (correct) {
      playSound('timeline-today');
      setScore(s => s + 1);
      setFeedback('correct');
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      spawnHearts(x, y, 10);
    } else {
      playSound('close');
      setFeedback('wrong');
    }

    setTimeout(() => {
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

  const handleRestart = () => {
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
    /* Full-width outer wrapper — creates generous symmetrical negative space */
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full mt-24 sm:mt-32 z-20 flex justify-center items-center"
    >
      <div className="relative w-full flex flex-col items-center justify-center">
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
                      onClick={(e) => handleSelectOption(i, e)}
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
                      className="text-xl sm:text-2xl font-serif italic tracking-wide"
                      style={{ color: feedback === 'correct' ? '#34D399' : '#FB7185' }}
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
                      onClick={handleRestart}
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
    </motion.div>
  );
}

/* ── Main Timeline Component ── */
export default function Timeline() {
  const { couple } = useCouple();

  // Floating Heart Background Accents configuration
  const floatingHearts = [
    { top: '8%', left: '7%', size: 28, delay: 0, duration: 8, opacity: 0.3 },
    { top: '18%', right: '9%', size: 22, delay: 2, duration: 9.5, opacity: 0.25 },
    { top: '32%', left: '11%', size: 30, delay: 1, duration: 10, opacity: 0.2 },
    { top: '46%', right: '8%', size: 24, delay: 3, duration: 8.5, opacity: 0.28 },
    { top: '60%', left: '6%', size: 32, delay: 1.5, duration: 9, opacity: 0.22 },
    { top: '74%', right: '12%', size: 26, delay: 2.5, duration: 11, opacity: 0.26 },
    { top: '88%', left: '10%', size: 20, delay: 0.5, duration: 7.5, opacity: 0.24 },
    { top: '95%', right: '15%', size: 28, delay: 3.5, duration: 10.5, opacity: 0.2 },
  ];

  const timelineItems = couple.timeline || [];

  return (
    <section 
      id="timeline" 
      className="section-wrapper relative overflow-hidden" 
      style={{ background: 'linear-gradient(180deg, #FBF1F3 0%, #FFF5F7 50%, #FDF0F3 100%)' }}
    >
      {/* Floating Heart Ambient Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingHearts.map((heart, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300 select-none pointer-events-none"
            style={{
              top: heart.top,
              left: heart.left,
              right: heart.right,
              opacity: heart.opacity,
            }}
            animate={{
              y: [0, -22, 0],
              rotate: [0, 8, -8, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
              ease: 'easeInOut',
            }}
          >
            <Heart size={heart.size} className="fill-rose-300/40 text-rose-400" />
          </motion.div>
        ))}
      </div>

      <div className="section-container max-w-5xl relative z-10">

        {/* Section Header with Bold Serif Title */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header mb-16 sm:mb-20 text-center"
        >
          <span className="section-eyebrow flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-rose-400" /> CHAPTERS &amp; MILESTONES <Sparkles size={14} className="text-rose-400" />
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-gray-900 tracking-tight leading-tight uppercase mb-3">
            OUR SHARED JOURNEY: MILESTONES &amp; MEMORIES.
          </h2>
          <p className="section-subtitle">
            Every chapter of our journey, from our very first hello to today.
          </p>
        </motion.div>

        {/* Vertical Timeline Track Container */}
        <div className="relative w-full">
          {/* Desktop Center Vertical Glowing Track */}
          <div
            className="hidden md:block absolute left-1/2 top-6 bottom-6 w-1 -translate-x-1/2 bg-gradient-to-b from-rose-300 via-rose-400 to-rose-300 rounded-full shadow-[0_0_15px_rgba(244,114,182,0.5)] pointer-events-none"
          />

          {/* Mobile Left Vertical Glowing Track */}
          <div
            className="block md:hidden absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-rose-300 via-rose-400 to-rose-300 rounded-full pointer-events-none"
          />

          {/* Milestones list with alternating left/right positioning */}
          <div 
            className="w-full"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(5rem, 10vw, 7.5rem)',
            }}
          >
            {timelineItems.map((item, i) => (
              <TimelineCard 
                key={i} 
                item={item} 
                index={i} 
                isLeft={i % 2 === 0} 
              />
            ))}
          </div>
        </div>

        {/* Centered Quiz Card Directly Below Timeline */}
        <TimelineQuizCard />

      </div>
    </section>
  );
}
