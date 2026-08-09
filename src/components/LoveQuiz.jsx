import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couple } from '../coupleData';
import { spawnHearts } from './HeartCanvas';

export default function LoveQuiz() {
  const questions = couple.quizQuestions;
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const q = questions[step];

  const handleAnswer = (i, e) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.correct;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (step + 1 >= questions.length) {
        setDone(true);
        if (correct && score + 1 === questions.length) {
          // Perfect score — burst
          for (let j = 0; j < 15; j++) {
            setTimeout(() => spawnHearts(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 5), j * 80);
          }
        }
      } else {
        setStep(s => s + 1);
      }
    }, 1000);
  };

  const restart = () => {
    setStep(0); setScore(0); setDone(false); setSelected(null); setFeedback(null);
  };

  const finalScore = score;
  const getResult = () => {
    if (finalScore === questions.length) return `You know our story by heart ❤️`;
    if (finalScore >= questions.length * 0.7) return `You know us so well 💕`;
    if (finalScore >= questions.length * 0.5) return `You're learning our story 📖`;
    return `Time to relive our memories together 🌸`;
  };

  return (
    <section className="py-24 px-4" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFE4E8)' }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: '#D4838A' }}>Test Your Knowledge</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
            How Well Do You Know Us?
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl p-8"
              style={{ background: '#FFFDF9', border: '1px solid rgba(201,160,138,0.3)' }}
            >
              {/* Progress */}
              <div className="flex gap-2 mb-6">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-500"
                    style={{ background: i <= step ? '#D4838A' : 'rgba(212,131,138,0.3)' }}
                  />
                ))}
              </div>
              <p className="text-xs mb-3" style={{ color: '#D4838A' }}>
                Question {step + 1} of {questions.length}
              </p>
              <h3 className="text-xl font-semibold mb-8" style={{ fontFamily: 'Playfair Display', color: '#3D3D3D' }}>
                {q.question}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={selected === null ? { scale: 1.02 } : {}}
                    whileTap={selected === null ? { scale: 0.98 } : {}}
                    onClick={(e) => handleAnswer(i, e)}
                    disabled={selected !== null}
                    className="p-4 rounded-2xl text-left text-sm font-medium transition-all"
                    style={{
                      background:
                        selected === i
                          ? i === q.correct ? 'linear-gradient(135deg, #7BCB8A, #5EAE70)' : 'linear-gradient(135deg, #E87B7B, #C45555)'
                          : selected !== null && i === q.correct
                          ? 'linear-gradient(135deg, #7BCB8A, #5EAE70)'
                          : 'rgba(232,180,184,0.2)',
                      color: selected !== null ? (i === q.correct || selected === i ? 'white' : '#3D3D3D') : '#3D3D3D',
                      border: '1px solid rgba(201,160,138,0.3)',
                    }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {feedback && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-center font-semibold"
                    style={{ color: feedback === 'correct' ? '#5EAE70' : '#C45555', fontFamily: 'Dancing Script', fontSize: '1.4rem' }}
                  >
                    {feedback === 'correct' ? '✓ Yes! 💕' : '✗ Not quite...'}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-3xl p-10 text-center"
              style={{ background: '#FFFDF9', border: '1px solid rgba(201,160,138,0.3)' }}
            >
              <div className="text-6xl mb-6">
                {finalScore === questions.length ? '🎉' : '💕'}
              </div>
              <h3 className="text-3xl font-semibold mb-4" style={{ fontFamily: 'Playfair Display', color: '#C9A08A' }}>
                {finalScore}/{questions.length} Correct
              </h3>
              <p className="text-xl mb-8" style={{ fontFamily: 'Dancing Script', color: '#3D3D3D', fontSize: '1.5rem' }}>
                {getResult()}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={restart}
                className="px-8 py-3 rounded-full text-white font-medium"
                style={{ background: 'linear-gradient(135deg, #D4838A, #C9A08A)' }}
              >
                Play Again ↩
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
