import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playPop,
  playSuccessChime,
  playGentleBoing,
  playHop,
  playVictoryFanfare
} from '../../../core/soundEffects';
import { Sparkles, ArrowRight, RotateCcw, Clock, Moon, BookOpen, TrendingUp } from 'lucide-react';
import { GameProps } from '../../../types';

function speak(text: string | number, rate: number = 0.82): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

export interface RahulExamGameProps extends GameProps {
  isEmbedded?: boolean;
  onNextChapter?: () => void;
  onChapterStars?: (stars: number) => void;
}

export default function RahulExamGame({ onBack, isEmbedded, onNextChapter, onChapterStars }: RahulExamGameProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [stars, setStars] = useState<number>(0);
  const [storyOpen, setStoryOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Stage 1 interactive state: y = 5x
  const [hoursStudied, setHoursStudied] = useState<number>(0);
  const [stage1Answer, setStage1Answer] = useState<number | null>(null);

  // Stage 2 & 3 interactive state: y = mx + c
  const [slopeM, setSlopeM] = useState<number>(5); // questions per hour
  const [interceptC, setInterceptC] = useState<number>(0); // already solved
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const TARGET_QUESTIONS = 40;
  const TOTAL_NIGHT_HOURS = 8; // 8 PM to 4 AM

  // Calculate hours needed to reach 40 questions
  const remainingQuestions = Math.max(0, TARGET_QUESTIONS - interceptC);
  const hoursNeeded = slopeM > 0 ? remainingQuestions / slopeM : 0;
  const sleepHours = Math.max(0, TOTAL_NIGHT_HOURS - hoursNeeded);

  // Stage 1 check
  const handleCheckStage1 = (ans: number) => {
    if (ans === 20) {
      playSuccessChime();
      playVictoryFanfare();
      setStage1Answer(ans);
      setStars(s => s + 3);
      setFeedback({
        text: `Correct! y = 5(4) = 20 questions! Half the paper is conquered in 4 hours!`,
        isCorrect: true
      });
      speak(`Spot on! 5 times 4 equals 20 questions!`);
      setTimeout(() => {
        setStage(2);
        setInterceptC(10); // shifts to y = 5x + 10!
        setFeedback(null);
        speak(`Wait! Rahul finds out he already solved 10 questions earlier! Let's see how the equation shifts to y = 5x + 10!`);
      }, 1500);
    } else {
      playGentleBoing();
      const hint = `Multiply: 5 questions/hour × 4 hours = ?`;
      setFeedback({ text: hint, isCorrect: false });
      speak(hint);
    }
  };

  // Stage 2 transition to Stage 3
  const handleProceedToSleepStrategy = () => {
    playSuccessChime();
    setStage(3);
    speak(`Now, adjust Rahul's speed slider to see how many hours of sleep he can get while still finishing all 40 questions!`);
  };

  const handleFinishTopper = () => {
    playVictoryFanfare();
    onChapterStars?.(3);
    setShowCelebration(true);
  };

  const content = (
    <>
      <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>

        {/* Phase Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '12px 20px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              Story 2 • Linear Equations in Real Life
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              {stage === 1 && "Plan A: Pure Speed (y = 5x)"}
              {stage === 2 && "Plan B: The Y-Intercept Shift (y = 5x + 10)"}
              {stage === 3 && "Plan C: Slope & Sleep Optimization (y = mx + 10)"}
            </div>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--clr-accent)'
          }}>
            Target: 40 PYQ Questions 🏆
          </div>
        </div>

        {/* INTERACTIVE COORDINATE GRAPH (TIME VS QUESTIONS) */}
        <div style={{
          background: 'linear-gradient(180deg, #090d16 0%, #111827 100%)',
          borderRadius: '24px',
          border: '3px solid #8b5cf6',
          padding: '24px 20px',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.35)',
          color: '#ffffff',
          marginBottom: '20px',
          position: 'relative'
        }}>

          {/* Graph Title & Equation Display */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 900, color: '#fef08a' }}>
              <TrendingUp size={22} color="#a78bfa" />
              <span>
                Linear Equation: <strong style={{ color: '#38bdf8' }}>y = {slopeM}x {interceptC > 0 ? `+ ${interceptC}` : ''}</strong>
              </span>
            </div>

            <div style={{
              background: 'rgba(167, 139, 250, 0.2)',
              border: '1px solid #a78bfa',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 14px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#ddd6fe'
            }}>
              x = Hours Studied • y = Questions Solved
            </div>
          </div>

          {/* SVG Coordinate Graph */}
          <div style={{ position: 'relative', margin: '16px 0 10px 0' }}>
            <svg
              viewBox="0 0 600 240"
              style={{ width: '100%', height: 'auto', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: 9 }).map((_, h) => {
                const x = 50 + h * 60;
                return (
                  <g key={`x-grid-${h}`}>
                    <line x1={x} y1="20" x2={x} y2="200" stroke="#1f2937" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={x} y="218" fill="#9ca3af" fontSize="10" textAnchor="middle" fontWeight="700">
                      {h}h
                    </text>
                  </g>
                );
              })}

              {/* Y Grid lines (0, 10, 20, 30, 40) */}
              {[0, 10, 20, 30, 40].map((q) => {
                const y = 200 - (q / 45) * 180;
                return (
                  <g key={`y-grid-${q}`}>
                    <line x1="50" y1={y} x2="530" y2={y} stroke={q === 40 ? '#ef4444' : '#1f2937'} strokeWidth={q === 40 ? '2' : '1'} strokeDasharray={q === 40 ? '4 2' : '3 3'} />
                    <text x="42" y={y + 4} fill={q === 40 ? '#f87171' : '#9ca3af'} fontSize="10" textAnchor="end" fontWeight="800">
                      {q}
                    </text>
                  </g>
                );
              })}

              {/* Axis lines */}
              <line x1="50" y1="20" x2="50" y2="200" stroke="#64748b" strokeWidth="2.5" />
              <line x1="50" y1="200" x2="540" y2="200" stroke="#64748b" strokeWidth="2.5" />

              {/* Exam Target Line Label (y = 40) */}
              <text x="532" y={200 - (40 / 45) * 180 + 4} fill="#f87171" fontSize="10" fontWeight="900">
                Target 40 Qs 🏆
              </text>

              {/* Plotted Line y = mx + c */}
              {(() => {
                const x0 = 50;
                const y0 = 200 - (interceptC / 45) * 180;

                // Max hours to plot
                const plotHours = Math.min(8, (45 - interceptC) / slopeM);
                const xEnd = 50 + plotHours * 60;
                const yEnd = 200 - ((slopeM * plotHours + interceptC) / 45) * 180;

                // Intersection point with Target 40
                const targetHourX = 50 + hoursNeeded * 60;
                const targetHourY = 200 - (40 / 45) * 180;

                return (
                  <g>
                    <line
                      x1={x0}
                      y1={y0}
                      x2={xEnd}
                      y2={yEnd}
                      stroke="url(#lineGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Y-intercept dot (0, c) */}
                    <circle cx={x0} cy={y0} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                    {interceptC > 0 && (
                      <text x={x0 + 12} y={y0 + 4} fill="#38bdf8" fontSize="10" fontWeight="900">
                        (0, {interceptC})
                      </text>
                    )}

                    {/* Target Reached Intersection Dot */}
                    {hoursNeeded <= 8 && (
                      <g>
                        <circle cx={targetHourX} cy={targetHourY} r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                        <text x={targetHourX} y={targetHourY - 10} fill="#34d399" fontSize="11" fontWeight="900" textAnchor="middle">
                          ({hoursNeeded.toFixed(1)}h, 40)
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Sleep & Schedule Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#38bdf8" />
              <span>Study Time Required: <strong style={{ color: '#38bdf8' }}>{hoursNeeded.toFixed(1)} Hours</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Moon size={18} color="#fbbf24" />
              <span>Sleep Time Before Exam: <strong style={{ color: sleepHours >= 4 ? '#34d399' : '#f87171' }}>{sleepHours.toFixed(1)} Hours</strong> {sleepHours >= 4 ? '😴 (Refreshed!)' : '🥱 (Tired!)'}</span>
            </div>
          </div>
        </div>

        {/* INTERACTION SECTION */}
        {stage === 1 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0 0 10px 0' }}>
              Plan A: "If I solve 5 questions every hour, how many will I solve in 4 hours?"
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', marginBottom: '18px' }}>
              Equation: <strong>y = 5x</strong>. Calculate <strong>y = 5(4)</strong>:
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {[15, 20, 25, 30].map((ans) => (
                <button
                  key={ans}
                  onClick={() => handleCheckStage1(ans)}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-kids)',
                    color: 'var(--clr-text)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-btn)'
                  }}
                >
                  {ans} Questions
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', margin: '0 0 10px 0' }}>
              🎉 Discovery: The Y-Intercept (+10)!
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', maxWidth: '620px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              Rahul realizes he had already solved 10 questions! So at 0 hours studied ($x = 0$), his starting point is already $10$!
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '12px 24px',
              fontSize: '1.4rem',
              fontWeight: 900,
              fontFamily: 'var(--font-kids)',
              color: 'var(--clr-accent)',
              marginBottom: '18px'
            }}>
              <span>New Equation: y = 5x + 10</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', marginBottom: '18px' }}>
              Questions remaining to reach 40: <strong>40 − 10 = 30 questions</strong>!
            </p>

            <button
              onClick={handleProceedToSleepStrategy}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '12px 30px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              <span>Explore Study Speeds & Sleep Trade-offs ➔</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {stage === 3 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0 0 10px 0' }}>
              Plan C: The Slope (Speed) vs Sleep Dilemma!
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: '0 0 20px 0' }}>
              Choose a study speed (Slope m) to cover the remaining questions and maximize sleep:
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '22px' }}>
              {[
                { speed: 5, label: "5 Qs/hr (y = 5x + 10)", time: "Needs 4 hrs study", sleep: "Leaves 4 hrs sleep! 😴" },
                { speed: 10, label: "10 Qs/hr (y = 10x + 10)", time: "Needs 2 hrs study", sleep: "Leaves 6 hrs sleep! ⭐" },
                { speed: 20, label: "20 Qs/hr (y = 20x + 10)", time: "Needs 1 hr study", sleep: "Leaves 7 hrs sleep! 🚀" }
              ].map((opt) => (
                <button
                  key={opt.speed}
                  onClick={() => {
                    playPop(480 + opt.speed * 20);
                    setSlopeM(opt.speed);
                  }}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '16px',
                    background: slopeM === opt.speed ? '#8b5cf6' : 'var(--clr-surface)',
                    color: slopeM === opt.speed ? '#ffffff' : 'var(--clr-text)',
                    border: '2px solid var(--clr-border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: 'var(--shadow-btn)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{opt.time} ➔ {opt.sleep}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleFinishTopper}
              style={{
                background: '#8b5cf6',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '12px 32px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
              }}
            >
              <span>Rahul Tops the Class! 🏆🎉</span>
              <Sparkles size={18} />
            </button>
          </div>
        )}

        {/* Feedback Area */}
        {feedback && (
          <div className="anim-pop" style={{
            padding: '12px 20px',
            borderRadius: '16px',
            background: feedback.isCorrect ? '#dcfce7' : '#fee2e2',
            border: `2px solid ${feedback.isCorrect ? '#86efac' : '#fca5a5'}`,
            color: feedback.isCorrect ? '#166534' : '#991b1b',
            fontWeight: 800,
            fontSize: '1rem',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {feedback.text}
          </div>
        )}

      </div>

      {/* Story Modal */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="Rahul Ki Night-Before Strategy!"
        badge="Story 2 • Linear Equations y = mx + c"
        icon="📖"
        story={`Rahul, although a backbencher, was the topper of the class! Want to know how? It was 8 PM before the morning exam and he realized something terrible: he hadn't prepared anything! He opened previous years' papers and found 40 important questions. With 8 hours left, he created a linear equation: y = 5x (solve 5 questions per hour). Then he discovered he already knew 10 questions, shifting the equation to y = 5x + 10! Let's explore how changing the slope (study rate) gave him time to sleep and still top the exam!`}
        buttonText="Next ➔ Master Linear Equations!"
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Exam Topper Champion! 🏆🎓"
          subtitle="You mastered y = mx + c, understood slope as rate of change, and y-intercept as the starting bonus!"
          stars={3}
          onNextLevel={() => {
            setShowCelebration(false);
            if (onNextChapter) {
              onNextChapter();
            } else {
              setStage(1);
            }
          }}
          onReplay={() => {
            setShowCelebration(false);
            setStage(1);
          }}
          onHome={onBack}
          hasNextLevel={Boolean(onNextChapter)}
        />
      )}
    </>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <QuizLayout
      title="Rahul Ki Night-Before Exam Strategy"
      subtitle="Master linear equations y = mx + c and slope to finish 40 questions and top the exam!"
      category="Coordinate Geometry / निर्देशांक"
      level={stage}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      {content}
    </QuizLayout>
  );
}
