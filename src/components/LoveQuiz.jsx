import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCouple } from '../CoupleContext';
import { spawnHearts } from './HeartCanvas';
import { Check, X as CloseIcon, Sparkles, Award } from 'lucide-react';

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

export default function LoveQuiz() {
  const { couple } = useCouple();
  const questions = (couple.loveQuiz && couple.loveQuiz.length > 0) ? couple.loveQuiz : DEFAULT_QUESTIONS;

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const q = questions[step] || questions[0];

  const handleAnswer = (index, e) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === q.correct;
    if (correct) {
      setScore(s => s + 1);
      setFeedback('correct');
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      spawnHearts(x, y, 8);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (step + 1 < questions.length) {
        setStep(s => s + 1);
      } else {
        setFinalScore(score + (correct ? 1 : 0));
        setDone(true);
      }
    }, 1300);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setDone(false);
    setFinalScore(0);
  };

  const getResult = () => {
    const total = questions.length;
    if (finalScore === total) return `Perfect score! You know us better than anyone in the universe 💕`;
    if (finalScore >= total * 0.75) return `So close to perfection! You truly know my heart 🌸`;
    return `Every moment with you is a memory worth celebrating 🥂`;
  };

  return (
    <section id="quiz" className="section-wrapper" style={{ background: 'linear-gradient(180deg, #F8EFEA 0%, #FFF5F0 50%, #FAF0EA 100%)' }}>
      <div className="section-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header text-center flex flex-col items-center mx-auto"
          style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}
        >
          <span className="section-eyebrow text-center">Test Your Memory</span>
          <h2 className="section-title text-center">How Well Do You Know Us?</h2>
          <p 
            className="section-subtitle text-center max-w-2xl"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.125rem, 2vw, 1.3rem)', // 18px to 21px
              fontWeight: 450,
              lineHeight: 1.5,
              color: '#7C5C5E',
            }}
          >
            A mini playful quiz celebrating all the little moments we shared.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/95 backdrop-blur-xl border border-rose-200/50 relative overflow-hidden w-full max-w-[920px] mx-auto"
              style={{
                borderRadius: '24px',
                padding: 'clamp(1.75rem, 3.2vw, 2.25rem)',
                boxShadow: '0 25px 60px rgba(212,131,138,0.14), 0 4px 16px rgba(0,0,0,0.03)',
              }}
            >
              {/* Progress bar and counter */}
              <div 
                className="flex items-center justify-between gap-4"
                style={{ marginBottom: 'clamp(1.125rem, 2.2vw, 1.5rem)' }}
              >
                <div 
                  className="flex flex-1"
                  style={{ gap: 'clamp(0.875rem, 1.8vw, 1.125rem)' }} // 14px to 18px gap
                >
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 transition-all duration-500 shadow-xs"
                      style={{
                        height: '12px', // height around 12px
                        borderRadius: '6px',
                        background: i <= step ? 'linear-gradient(90deg, #F43F5E, #E11D48)' : '#FFE4E6',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-rose-500 px-4 py-1.5 bg-rose-50 rounded-full border border-rose-200/60 flex-shrink-0 font-sans">
                  Question {step + 1} of {questions.length}
                </span>
              </div>

              {/* Large Prominent Question with Generous Spacing */}
              <div 
                className="text-center px-2 max-w-2xl mx-auto"
                style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}
              >
                <h3 
                  className="font-bold text-gray-900 leading-snug"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', // 36px to 42px on desktop
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
                  gap: 'clamp(1.25rem, 2.5vw, 1.625rem)', // 20px to 26px gap
                }}
              >
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === q.correct;
                  const letter = OPTION_LETTERS[i] || `${i + 1}`;

                  // Default State
                  let cardStyleObj = {
                    background: 'rgba(255, 255, 255, 0.85)',
                    borderColor: 'rgba(244, 63, 94, 0.12)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
                    borderRadius: '22px',
                  };
                  let letterBadgeStyles = 'bg-rose-50/50 text-rose-600 border-rose-100 font-bold';
                  let hoverEnabled = selected === null;

                  if (selected !== null) {
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
                    } else if (isCorrect) {
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
                      whileHover={hoverEnabled ? { y: -3, boxShadow: '0 8px 24px rgba(212,131,138,0.18)', borderColor: '#FDA4AF', background: '#FFFDFD' } : {}}
                      whileTap={hoverEnabled ? { scale: 0.98 } : {}}
                      onClick={(e) => handleAnswer(i, e)}
                      disabled={selected !== null}
                      className="flex items-center text-left transition-all duration-300 border cursor-pointer select-none relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 w-full"
                      style={{
                        ...cardStyleObj,
                        minHeight: 'clamp(6.875rem, 12vw, 7.8rem)', // 110px to 125px card height
                        paddingTop: 'clamp(1.375rem, 2.2vw, 1.75rem)',
                        paddingBottom: 'clamp(1.375rem, 2.2vw, 1.75rem)',
                        paddingLeft: 'clamp(1.375rem, 2.2vw, 1.75rem)',
                        paddingRight: 'clamp(1.375rem, 2.2vw, 1.75rem)',
                        gap: 'clamp(1.25rem, 2.2vw, 1.5rem)', // 20px to 24px gap between badge and text
                      }}
                    >
                      {/* Option Letter Chip — 48px to 52px */}
                      <div
                        className={`flex-shrink-0 border flex items-center justify-center font-bold`}
                        style={{
                          width: 'clamp(3rem, 5vw, 3.25rem)',
                          height: 'clamp(3rem, 5vw, 3.25rem)',
                          borderRadius: '14px',
                          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                          ...letterBadgeStyles.includes('bg-white') ? {} : { background: 'rgba(255, 255, 255, 0.9)' },
                        }}
                        className={`flex-shrink-0 border flex items-center justify-center font-bold ${letterBadgeStyles}`}
                      >
                        {selected !== null && isCorrect ? (
                          <Check size={22} className="stroke-[3]" />
                        ) : selected !== null && isSelected && !isCorrect ? (
                          <CloseIcon size={22} className="stroke-[3]" />
                        ) : (
                          letter
                        )}
                      </div>

                      {/* Option Text — Plus Jakarta Sans */}
                      <span
                        className="flex-1 font-sans"
                        style={{ 
                          fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', // 18px to 20px
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: selected !== null && !isCorrect && !isSelected ? '#9CA3AF' : '#1F2937'
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
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="mt-8 text-center"
                  >
                    <p
                      className="text-2xl sm:text-3xl font-bold font-script"
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
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-14 text-center shadow-2xl border border-rose-200/90"
            >
              <div className="text-6xl sm:text-7xl mb-4 animate-bounce">
                {finalScore === questions.length ? '👑' : '💝'}
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-500 mb-2 block">
                Quiz Results
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 mb-4">
                {finalScore} of {questions.length} Correct
              </h3>
              <p className="text-xl sm:text-2xl text-rose-600 mb-8 max-w-md mx-auto leading-relaxed font-script" style={{ fontSize: '1.65rem' }}>
                "{getResult()}"
              </p>
              <button
                type="button"
                onClick={restart}
                className="px-10 py-3.5 rounded-full text-white font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-500 shadow-xl hover:shadow-2xl hover:scale-105 transition cursor-pointer"
              >
                Play Again ↩
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
