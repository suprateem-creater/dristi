import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
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

      {/* Chapter Label — Description-to-chapter spacing: 12px to 16px */}
      <div 
        className="pt-3.5 border-t border-rose-100 flex items-center justify-between text-rose-500 font-script text-sm"
        style={{ marginTop: 'clamp(0.75rem, 1.8vw, 1rem)' }}
      >
        <span className="flex items-center gap-1.5 font-bold tracking-wide">
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
  const questions = (couple.loveQuiz && couple.loveQuiz.length > 0) 
    ? couple.loveQuiz 
    : ((couple.quizQuestions && couple.quizQuestions.length > 0) ? couple.quizQuestions : DEFAULT_QUIZ_QUESTIONS);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(1); // Default selection highlight on Option B as in reference image
  const [isInteracted, setIsInteracted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const q = questions[step] || questions[0];

  const handleSelectOption = (index, e) => {
    setIsInteracted(true);
    setSelected(index);
    const isCorrect = index === q.correct;

    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback('correct');
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      spawnHearts(x, y, 10);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (step + 1 < questions.length) {
        setStep(s => s + 1);
        setSelected(null);
      } else {
        setFinalScore(score + (isCorrect ? 1 : 0));
        setDone(true);
      }
    }, 1300);
  };

  const handleRestart = () => {
    setStep(0);
    setScore(0);
    setSelected(1);
    setIsInteracted(false);
    setFeedback(null);
    setDone(false);
    setFinalScore(0);
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
      {/* Extended pink-to-white gradient background area with scattered faint hearts */}
      <div
        className="relative w-full rounded-[40px] sm:rounded-[48px] overflow-hidden flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #FFF5F7 0%, #FDF0F3 30%, #FFEEF2 60%, #FFF8FA 100%)',
          padding: 'clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 8vw, 6rem)',
        }}
      >
        {/* Scattered faint pink hearts across the wide background */}
        {QUIZ_SCATTER_HEARTS.map((h, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{
              top: h.top,
              left: h.left,
              right: h.right,
              opacity: h.opacity,
              transform: `rotate(${h.rotate}deg)`,
            }}
            animate={{
              y: [0, -8, 0],
              opacity: [h.opacity, h.opacity * 1.3, h.opacity],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          >
            <Heart size={h.size} className="fill-rose-300/50 text-rose-300/60" />
          </motion.div>
        ))}

        {/* Centered quiz card — constrained width within the spacious outer area */}
        <div className="relative w-full max-w-[850px]" style={{ margin: '0 auto' }}>
          <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="bg-white/95 backdrop-blur-xl border border-rose-200/50 relative overflow-hidden"
            style={{
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 4vw, 3rem)',
              boxShadow: '0 12px 40px rgba(212,131,138,0.08), 0 4px 12px rgba(0,0,0,0.02)',
            }}
          >
            {/* Top Progress Bar & Counter */}
            <div 
              className="flex items-center justify-between gap-4"
              style={{ marginBottom: 'clamp(1rem, 2vw, 1.5rem)' }}
            >
              <div className="flex gap-2 flex-1">
                {questions.map((_, i) => {
                  const isActive = i <= step;
                  return (
                    <div
                      key={i}
                      className="h-2 flex-1 rounded-full transition-all duration-500"
                      style={{
                        background: isActive ? 'linear-gradient(90deg, #F43F5E, #E11D48)' : '#F3E8E8',
                      }}
                    />
                  );
                })}
              </div>

              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-rose-600 px-3.5 py-1.5 bg-rose-50 rounded-full border border-rose-100 flex-shrink-0 whitespace-nowrap font-sans">
                Question {step + 1} of {questions.length}
              </span>
            </div>

            {/* Prominent Serif Question — Cormorant Garamond / Playfair Display */}
            <div 
              className="text-center px-1 max-w-2xl mx-auto"
              style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              <h3 
                className="font-bold text-gray-900 leading-snug"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.35rem)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                }}
              >
                {q.question}
              </h3>
            </div>

            {/* 2×2 Answer Grid: CSS Grid with equal-size cards */}
            <div
              className="quiz-options-grid w-full"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                gap: 'clamp(1.125rem, 2.2vw, 1.5rem)', // 18px to 24px gap
              }}
            >
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === q.correct;
                const letter = OPTION_LETTERS[i] || `${i + 1}`;

                // Default Clean Unselected State
                let cardStyleObj = {
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderColor: 'rgba(244, 63, 94, 0.12)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
                  borderRadius: '22px',
                };
                let letterBadgeStyles = 'bg-rose-50/50 text-rose-600 border-rose-100 font-bold';
                let hoverEnabled = true;

                // Default Selected State (Option B highlighted by default)
                if (isSelected && !isInteracted) {
                  cardStyleObj = {
                    background: '#FFF1F2',
                    borderColor: '#FB7185',
                    boxShadow: '0 8px 24px rgba(244, 63, 94, 0.08)',
                    borderRadius: '22px',
                    transform: 'translateY(-2px)',
                  };
                  letterBadgeStyles = 'bg-white text-rose-600 border-rose-300 font-extrabold shadow-sm';
                } else if (isInteracted) {
                  hoverEnabled = false;
                  if (isSelected && isCorrect) {
                    cardStyleObj = {
                      background: 'linear-gradient(90deg, #10B981, #14B8A6)',
                      borderColor: '#059669',
                      color: '#FFFFFF',
                      borderRadius: '22px',
                    };
                    letterBadgeStyles = 'bg-white text-emerald-600 border-white shadow-md font-bold';
                  } else if (isSelected && !isCorrect) {
                    cardStyleObj = {
                      background: 'linear-gradient(90deg, #EF4444, #F43F5E)',
                      borderColor: '#DC2626',
                      color: '#FFFFFF',
                      borderRadius: '22px',
                    };
                    letterBadgeStyles = 'bg-white text-rose-600 border-white shadow-md font-bold';
                  } else if (isCorrect && feedback !== null) {
                    cardStyleObj = {
                      background: 'linear-gradient(90deg, #10B981, #14B8A6)',
                      borderColor: '#059669',
                      color: '#FFFFFF',
                      borderRadius: '22px',
                    };
                    letterBadgeStyles = 'bg-white text-emerald-600 border-white shadow-md font-bold';
                  } else {
                    cardStyleObj = {
                      background: 'rgba(243, 244, 246, 0.6)',
                      borderColor: '#E5E7EB',
                      color: '#9CA3AF',
                      borderRadius: '22px',
                      opacity: 0.5,
                    };
                    letterBadgeStyles = 'bg-gray-200 text-gray-400 border-gray-200';
                  }
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={hoverEnabled ? { y: -3, boxShadow: '0 8px 24px rgba(212,131,138,0.18)' } : {}}
                    whileTap={hoverEnabled ? { scale: 0.98 } : {}}
                    onClick={(e) => handleSelectOption(i, e)}
                    className="flex items-center text-left transition-all duration-300 border cursor-pointer select-none relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 w-full"
                    style={{
                      ...cardStyleObj,
                      minHeight: 'clamp(3.75rem, 8vw, 4.75rem)',
                      paddingTop: 'clamp(1.25rem, 2vw, 1.5rem)',
                      paddingBottom: 'clamp(1.25rem, 2vw, 1.5rem)',
                      paddingLeft: 'clamp(1.5rem, 2.5vw, 1.75rem)',
                      paddingRight: 'clamp(1.5rem, 2.5vw, 1.75rem)',
                      gap: 'clamp(1.25rem, 2.2vw, 1.5rem)', // Gap between badge and answer text: 20px to 24px
                    }}
                  >
                    {/* Letter Badge — Exactly 48px x 48px */}
                    <div
                      className={`flex-shrink-0 border flex items-center justify-center font-bold`}
                      style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '12px',
                        fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
                        ...letterBadgeStyles.includes('bg-white') ? {} : { background: 'rgba(255, 255, 255, 0.9)' },
                      }}
                      className={`flex-shrink-0 border flex items-center justify-center font-bold ${letterBadgeStyles}`}
                    >
                      {isInteracted && isCorrect && feedback !== null ? (
                        <Check size={18} className="stroke-[3]" />
                      ) : isInteracted && isSelected && !isCorrect ? (
                        <CloseIcon size={18} className="stroke-[3]" />
                      ) : (
                        letter
                      )}
                    </div>

                    {/* Answer Text — Plus Jakarta Sans sans-serif */}
                    <span
                      className="flex-1 font-sans"
                      style={{ 
                        fontSize: 'clamp(1.06rem, 1.8vw, 1.18rem)', // 17px to 19px
                        fontWeight: 600,
                        lineHeight: 1.4,
                        color: isInteracted && !isCorrect && !isSelected ? '#9CA3AF' : '#1F2937'
                      }}
                    >
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>

                {/* Feedback Notification */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="mt-5 text-center"
                    >
                      <p
                        className="text-lg sm:text-xl font-bold font-script"
                        style={{ color: feedback === 'correct' ? '#059669' : '#E11D48' }}
                      >
                        {feedback === 'correct' ? '✓ Exactly right! You remember! 💕' : '✗ Aww, close! But I still love you 🥰'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                className="bg-white/90 backdrop-blur-xl rounded-[28px] sm:rounded-[36px] p-7 sm:p-12 text-center shadow-2xl border border-rose-200/80"
              >
                <div className="text-5xl sm:text-6xl mb-4 animate-bounce">
                  {finalScore === questions.length ? '👑' : '💝'}
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-rose-500 mb-2 block">
                  Quiz Completed
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mb-3">
                  {finalScore} of {questions.length} Correct
                </h3>
                <p className="text-lg sm:text-xl text-rose-600 mb-7 max-w-sm mx-auto leading-relaxed font-script">
                  {finalScore === questions.length 
                    ? "Perfect score! You remember every beautiful detail 💕" 
                    : "Every moment with you is a memory worth celebrating 🥂"}
                </p>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-white font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-500 shadow-xl hover:shadow-2xl hover:scale-105 transition cursor-pointer"
                >
                  <RotateCcw size={14} /> Play Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
