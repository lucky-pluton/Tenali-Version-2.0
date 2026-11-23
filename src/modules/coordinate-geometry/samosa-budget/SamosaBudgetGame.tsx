import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playPop,
  playSuccessChime,
  playGentleBoing,
  playVictoryFanfare
} from '../../../core/soundEffects';
import { Sparkles, ArrowRight, RotateCcw, Wallet, AlertTriangle, Calculator, CheckCircle2 } from 'lucide-react';
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

export interface SamosaBudgetGameProps extends GameProps {
  isEmbedded?: boolean;
  onNextChapter?: () => void;
  onChapterStars?: (stars: number) => void;
}

export default function SamosaBudgetGame({ onBack, isEmbedded, onNextChapter, onChapterStars }: SamosaBudgetGameProps) {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [stars, setStars] = useState<number>(0);
  const [storyOpen, setStoryOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Samosa parameters
  const COST_PER_SAMOSA = 12;
  const PACKAGING_FEE = 20;
  const TOTAL_BUDGET = 200;

  // Samosa quantity slider state
  const [samosaCount, setSamosaCount] = useState<number>(10);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Compute total cost: C(x) = 12x + 20
  const totalCost = COST_PER_SAMOSA * samosaCount + PACKAGING_FEE;
  const remainingBudget = TOTAL_BUDGET - totalCost;
  const isOverBudget = totalCost > TOTAL_BUDGET;

  // Stage 1 check
  const handleCheckStage1 = (ans: number) => {
    if (ans === 140) {
      playSuccessChime();
      setStars(s => s + 3);
      setFeedback({
        text: `Correct! 12 × 10 = ₹120, plus ₹20 packaging = ₹140! You still have ₹60 left!`,
        isCorrect: true
      });
      speak(`Spot on! 12 times 10 plus 20 equals 140 rupees!`);
      setTimeout(() => {
        setStage(2);
        setFeedback(null);
        speak(`Now let's turn this pattern into a mathematical function!`);
      }, 1500);
    } else {
      playGentleBoing();
      const hint = `Calculate: (10 samosas × ₹12) + ₹20 packaging charge = ?`;
      setFeedback({ text: hint, isCorrect: false });
      speak(hint);
    }
  };

  // Stage 4 budget check
  const handleCheckMaxSamosas = (ans: number) => {
    if (ans === 15) {
      playSuccessChime();
      playVictoryFanfare();
      setStars(s => s + 3);
      onChapterStars?.(3);
      setFeedback({
        text: `EXACTLY! 12x + 20 ≤ 200 gives x ≤ 15! You can buy at most 15 samosas without going broke!`,
        isCorrect: true
      });
      speak(`Superb! 15 samosas cost 180 plus 20 equals exactly 200 rupees! Budget safe!`);
      setTimeout(() => {
        setShowCelebration(true);
      }, 1800);
    } else {
      playGentleBoing();
      const hint = `Check: 12 × ${ans} + 20 = ₹${12 * ans + 20}. Can that fit in ₹200?`;
      setFeedback({ text: hint, isCorrect: false });
      speak(hint);
    }
  };

  const content = (
    <>
      <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>

        {/* Stage Header */}
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
              Story 4 • Functions & Budget Inequalities
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              {stage === 1 && "Stage 1: Let's Investigate Samosa Costs!"}
              {stage === 2 && "Stage 2: What is a Cost Function C(x)?"}
              {stage === 3 && "Stage 3: The Interactive Samosa Calculator"}
              {stage === 4 && "Stage 4: The Ultimate Budget Challenge (≤ ₹200)"}
            </div>
          </div>

          <div style={{
            background: isOverBudget ? '#fee2e2' : '#dcfce7',
            border: `1px solid ${isOverBudget ? '#ef4444' : '#10b981'}`,
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: isOverBudget ? '#991b1b' : '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Wallet size={16} />
            <span>Budget: ₹{TOTAL_BUDGET} • Bill: ₹{totalCost}</span>
          </div>
        </div>

        {/* INTERACTIVE CANTEEN GRAPH & SAMOSA DISPLAY */}
        <div style={{
          background: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)',
          borderRadius: '24px',
          border: '3px solid #f59e0b',
          padding: '24px 20px',
          boxShadow: '0 8px 30px rgba(245, 158, 11, 0.35)',
          color: '#ffffff',
          marginBottom: '20px',
          position: 'relative'
        }}>

          {/* Samosa Counter Tray */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '12px 20px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '2rem' }}>🥟</div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#fef08a' }}>
                  {samosaCount} Samosas in Box
                </strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#d4d4d8' }}>
                  ₹12 per samosa + ₹20 packaging box charge
                </p>
              </div>
            </div>

            {/* Samosa Quantity Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Quantity (x):</span>
              <input
                type="range"
                min="0"
                max="20"
                value={samosaCount}
                onChange={e => {
                  playPop(300 + Number(e.target.value) * 20);
                  setSamosaCount(Number(e.target.value));
                }}
                style={{ width: '140px', cursor: 'pointer', accentColor: '#f59e0b' }}
              />
              <span style={{
                background: '#f59e0b',
                color: '#000000',
                padding: '2px 10px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 900,
                fontSize: '0.9rem'
              }}>
                x = {samosaCount}
              </span>
            </div>
          </div>

          {/* SVG Cost Function Graph C(x) = 12x + 20 */}
          <div style={{ position: 'relative', margin: '14px 0 10px 0' }}>
            <svg
              viewBox="0 0 600 240"
              style={{ width: '100%', height: 'auto', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="samosaLine" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Grid Lines X (0, 5, 10, 15, 20 samosas) */}
              {[0, 5, 10, 15, 20].map((s) => {
                const x = 60 + (s / 20) * 460;
                return (
                  <g key={`x-grid-${s}`}>
                    <line x1={x} y1="20" x2={x} y2="200" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={x} y="218" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontWeight="700">
                      x={s} Samosas
                    </text>
                  </g>
                );
              })}

              {/* Grid Lines Y (₹0, ₹50, ₹100, ₹150, ₹200, ₹250) */}
              {[0, 50, 100, 150, 200, 250].map((c) => {
                const y = 200 - (c / 280) * 180;
                return (
                  <g key={`y-grid-${c}`}>
                    <line x1="60" y1={y} x2="520" y2={y} stroke={c === 200 ? '#ef4444' : '#3f3f46'} strokeWidth={c === 200 ? '2' : '1'} strokeDasharray={c === 200 ? '4 2' : '3 3'} />
                    <text x="50" y={y + 4} fill={c === 200 ? '#f87171' : '#a1a1aa'} fontSize="10" textAnchor="end" fontWeight="800">
                      ₹{c}
                    </text>
                  </g>
                );
              })}

              {/* Budget Limit Line Label */}
              <text x="525" y={200 - (200 / 280) * 180 + 4} fill="#f87171" fontSize="10" fontWeight="900">
                Budget Limit (₹200)
              </text>

              {/* Axes */}
              <line x1="60" y1="20" x2="60" y2="200" stroke="#71717a" strokeWidth="2.5" />
              <line x1="60" y1="200" x2="530" y2="200" stroke="#71717a" strokeWidth="2.5" />

              {/* Cost Function Line: C(x) = 12x + 20 */}
              {(() => {
                const x0 = 60;
                const y0 = 200 - (20 / 280) * 180;

                const xEnd = 60 + (20 / 20) * 460;
                const yEnd = 200 - ((12 * 20 + 20) / 280) * 180;

                // Active dot on line
                const activeDotX = 60 + (samosaCount / 20) * 460;
                const activeDotY = 200 - (totalCost / 280) * 180;

                // Budget threshold dot at x = 15
                const maxBudgetX = 60 + (15 / 20) * 460;
                const maxBudgetY = 200 - (200 / 280) * 180;

                return (
                  <g>
                    <line
                      x1={x0}
                      y1={y0}
                      x2={xEnd}
                      y2={yEnd}
                      stroke="url(#samosaLine)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Packaging fixed fee dot at x=0 */}
                    <circle cx={x0} cy={y0} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

                    {/* Max Budget Dot (15, 200) */}
                    <circle cx={maxBudgetX} cy={maxBudgetY} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <text x={maxBudgetX} y={maxBudgetY - 10} fill="#34d399" fontSize="10" fontWeight="900" textAnchor="middle">
                      Max (15, ₹200)
                    </text>

                    {/* Active Selected Point Dot */}
                    <circle
                      cx={activeDotX}
                      cy={activeDotY}
                      r="8"
                      fill={isOverBudget ? '#ef4444' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <text
                      x={activeDotX}
                      y={activeDotY - 12}
                      fill={isOverBudget ? '#f87171' : '#fef08a'}
                      fontSize="11"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      ({samosaCount}, ₹{totalCost})
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Samosa Calculator Box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, color: '#fef08a' }}>
              <Calculator size={18} color="#f59e0b" />
              <span>Cost Function: C({samosaCount}) = 12({samosaCount}) + 20 = ₹{totalCost}</span>
            </div>

            <div style={{
              fontWeight: 800,
              fontSize: '0.9rem',
              color: isOverBudget ? '#f87171' : '#34d399'
            }}>
              {isOverBudget
                ? `⚠️ Over Budget by ₹${Math.abs(remainingBudget)}! Pocket empty!`
                : `✅ Within Budget! ₹${remainingBudget} left in wallet.`}
            </div>
          </div>
        </div>

        {/* STAGES & QUESTIONS */}
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
              Stage 1: "If our group decides to buy 10 samosas, how much will the total bill be?"
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', marginBottom: '18px' }}>
              Remember: Each samosa costs ₹12, plus ₹20 fixed packaging charge!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {[120, 140, 160, 200].map((ans) => (
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
                  ₹{ans}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-accent)',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--clr-accent)', margin: '0 0 10px 0' }}>
              Stage 2: Why do mathematicians name it a "Function"?
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', maxWidth: '640px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              Instead of repeating the words "Multiply by 12 and add 20" every time, we name this rule:
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
              color: '#f59e0b',
              marginBottom: '16px'
            }}>
              <span>Cost Function: C(x) = 12x + 20</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', marginBottom: '18px' }}>
              Think of it as a reusable Samosa Calculator machine: input quantity <strong>x</strong>, and output total bill <strong>C(x)</strong>!
            </p>

            <button
              onClick={() => {
                playSuccessChime();
                setStage(3);
                speak(`Now test the samosa calculator using the slider above!`);
              }}
              style={{
                background: 'var(--clr-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '12px 30px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Next ➔ Try the Samosa Calculator Machine</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {stage === 3 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #f59e0b',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0 0 10px 0' }}>
              Stage 3: Test the Samosa Machine with the Slider Above!
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', maxWidth: '600px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              Currently selected: <strong>{samosaCount} samosas</strong>.
              <br />
              Total Bill: 12 × {samosaCount} + 20 = <strong>₹{totalCost}</strong>!
              <br />
              {isOverBudget ? (
                <span style={{ color: '#ef4444', fontWeight: 800 }}>⚠️ Over the ₹200 budget by ₹{totalCost - TOTAL_BUDGET}!</span>
              ) : (
                <span style={{ color: '#10b981', fontWeight: 800 }}>✅ Within budget! Remaining: ₹{remainingBudget}</span>
              )}
            </p>

            <button
              onClick={() => {
                playSuccessChime();
                setStage(4);
                speak(`Now solve the budget inequality: with only 200 rupees, what is the maximum number of samosas you can buy?`);
              }}
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
                gap: '8px'
              }}
            >
              <span>Ready for Final Budget Challenge ➔</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {stage === 4 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #ef4444',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0 0 10px 0' }}>
              Stage 4: "What is the maximum number of samosas we can buy with ₹200?"
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', maxWidth: '600px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              The inequality rule is: <strong>12x + 20 ≤ 200</strong>.
              <br />
              Subtract 20: <strong>12x ≤ 180</strong>. Divide by 12: <strong>x ≤ ?</strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {[12, 14, 15, 18, 20].map((ans) => (
                <button
                  key={ans}
                  onClick={() => handleCheckMaxSamosas(ans)}
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
                  At most {ans}
                </button>
              ))}
            </div>
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
        title="Can ₹200 Feed the Whole Group?"
        badge="Story 4 • Cost Functions & Budget"
        icon="🥟"
        story={`Imagine you and your friends are planning a school event, and everyone is craving hot crispy samosas! You head to the canteen, and the shopkeeper announces: each samosa is ₹12, plus a one-time packaging charge of ₹20. "Wait! We have only ₹200. How many samosas can we buy without going broke?!" Discover the cost function C(x) = 12x + 20 and solve the budget inequality 12x + 20 ≤ 200!`}
        buttonText="Next ➔ Solve the Samosa Budget!"
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Function & Budget Master! 🥟🏆"
          subtitle="You mastered linear functions C(x) = 12x + 20 and solved inequalities (x ≤ 15) to keep the party within budget!"
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
      title="School Canteen Ki Samosa Party"
      subtitle="Explore linear functions C(x) = 12x + 20 and budget inequalities in the school canteen!"
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
