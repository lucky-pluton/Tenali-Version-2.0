import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playSuccessChime, playGentleBoing, playMunch } from '../../../core/soundEffects';
import { Utensils, CheckCircle } from 'lucide-react';
import spec from './spec.json';

export default function AaravGulabJamunGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);

  const [stepIdx, setStepIdx] = useState(0);
  const [userInputs, setUserInputs] = useState(['', '', '', '']);
  const [totalInput, setTotalInput] = useState('');
  const [chewing, setChewing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const LEVEL_CONFIGS = {
    1: [
      {
        title: "Aarav's Birthday!",
        giver: [
          { name: "Mother", amount: 1, role: "First, his mother fed him one gulab jamun." },
          { name: "Father", amount: 1, role: "Then, his father fed him one gulab jamun." },
          { name: "Sister", amount: 1, role: "Next, his sister fed him one gulab jamun." },
          { name: "Friend", amount: 1, role: "Finally, his friend fed him one gulab jamun." }
        ]
      }
    ],
    2: [
      {
        title: "Aarav's Sweet Feast",
        giver: [
          { name: "Mother", amount: 2, role: "Mother fed him 2 gulab jamuns!" },
          { name: "Father", amount: 3, role: "Father served him 3 delicious jamuns." },
          { name: "Sister", amount: 1, role: "His sister sneaked in 1 more treat." },
          { name: "Friend", amount: 2, role: "His friend shared 2 sweet treats." }
        ]
      }
    ],
    3: [
      {
        title: "Mega Sweet Challenge!",
        giver: [
          { name: "Mother", amount: 4, role: "Mother feeds Aarav 4 warm sweets!" },
          { name: "Father", amount: 3, role: "Father brings 3 more sweets." },
          { name: "Sister", amount: 3, role: "Sister adds 3 juicy jamuns." },
          { name: "Friend", amount: 2, role: "Friend offers 2 golden treats." }
        ]
      }
    ]
  };

  const currentLevelRounds = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[1];
  const currentScenario = currentLevelRounds[round % currentLevelRounds.length];
  const givers = currentScenario.giver;

  const totalEatenSoFar = givers
    .slice(0, stepIdx)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const grandTotal = givers.reduce((acc, curr) => acc + curr.amount, 0);

  const handleFeed = () => {
    if (stepIdx < givers.length) {
      playMunch();
      setChewing(true);
      setTimeout(() => setChewing(false), 600);

      const next = stepIdx + 1;
      setStepIdx(next);

      const updatedInputs = [...userInputs];
      updatedInputs[stepIdx] = String(givers[stepIdx].amount);
      setUserInputs(updatedInputs);

      if (next === givers.length) {
        playSuccessChime();
        setFeedbackMsg({
          type: 'info',
          text: "Aarav says: 'Hmm... I am so full! Now calculate the grand total!'"
        });
      }
    }
  };

  const handleCheckTotal = () => {
    const val = parseInt(totalInput.trim(), 10);
    if (val === grandTotal) {
      playSuccessChime();
      setStars(s => s + 3);
      setFeedbackMsg({
        type: 'success',
        text: `Correct! ${givers.map(g => g.amount).join(' + ')} = ${grandTotal} sweets in total!`
      });
      setTimeout(() => {
        setShowCelebration(true);
      }, 700);
    } else {
      playGentleBoing();
      setFeedbackMsg({
        type: 'error',
        text: `Not quite! Count all the gulab jamuns Aarav ate: ${givers.map(g => g.amount).join(' + ')}`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setStepIdx(0);
    setUserInputs(['', '', '', '']);
    setTotalInput('');
    setFeedbackMsg(null);
    if (level < 3) {
      setLevel(l => l + 1);
      setRound(0);
    } else {
      setRound(r => r + 1);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setStepIdx(0);
    setUserInputs(['', '', '', '']);
    setTotalInput('');
    setFeedbackMsg(null);
  };

  return (
    <QuizLayout
      title="Aarav's Gulab Jamun Adventure"
      subtitle="Help feed Aarav delicious sweets and count up the total!"
      category="Addition"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>
        {/* Level Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '14px 20px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: 'var(--clr-text)',
              margin: 0
            }}>
              {currentScenario.title}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Step {Math.min(stepIdx + 1, 4)} of 4 • Cumulative Addition
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  handleReplay();
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: level === lvl ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: level === lvl ? '#fff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)'
                }}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Feeding Scene */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '6rem',
                transform: chewing ? 'scale(1.15) rotate(3deg)' : 'scale(1)',
                transition: 'transform 0.2s',
                filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))'
              }}>
                {stepIdx === 4 ? '🤤' : chewing ? '😋' : '🧒'}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--clr-text)',
                marginTop: '6px'
              }}>
                Aarav {stepIdx === 4 ? '(So Full!)' : ''}
              </div>
              {chewing && (
                <span className="anim-pop" style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: '#f59e0b',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  Yum!
                </span>
              )}
            </div>

            <div style={{
              background: 'var(--clr-surface)',
              border: '2px dashed var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '16px 24px',
              minWidth: '240px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginBottom: '8px' }}>
                Gulab Jamuns Eaten: <strong>{totalEatenSoFar}</strong>
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '44px'
              }}>
                {Array.from({ length: totalEatenSoFar }).map((_, i) => (
                  <span
                    key={i}
                    className="anim-pop"
                    style={{
                      fontSize: '1.8rem',
                      display: 'inline-block',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
                    }}
                  >
                    🟤
                  </span>
                ))}
                {totalEatenSoFar === 0 && (
                  <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', fontStyle: 'italic' }}>
                    Ready for the first treat!
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 18px',
            marginBottom: '20px',
            fontSize: '1.05rem',
            color: 'var(--clr-text)'
          }}>
            {stepIdx < givers.length ? (
              <span>
                <strong>{givers[stepIdx].name}:</strong> "{givers[stepIdx].role}" (+{givers[stepIdx].amount} sweet{givers[stepIdx].amount > 1 ? 's' : ''})
              </span>
            ) : (
              <span>
                🎉 <strong>Aarav:</strong> "I had a wonderful birthday! Everyone fed me delicious treats. How many did I eat in total?"
              </span>
            )}
          </div>

          {stepIdx < givers.length ? (
            <button
              onClick={handleFeed}
              className="tenali-btn-primary"
              style={{
                fontSize: '1.1rem',
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                margin: '0 auto'
              }}
            >
              <Utensils size={20} />
              <span>Feed {givers[stepIdx].amount} Sweet{givers[stepIdx].amount > 1 ? 's' : ''} to Aarav!</span>
            </button>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--clr-text)',
                fontFamily: 'var(--font-kids)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {givers.map((g, idx) => (
                  <React.Fragment key={idx}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'var(--clr-surface)',
                      border: '1px solid var(--clr-border)'
                    }}>
                      {g.amount}
                    </span>
                    {idx < givers.length - 1 && <span>+</span>}
                  </React.Fragment>
                ))}
                <span>=</span>
                <input
                  type="number"
                  value={totalInput}
                  onChange={e => setTotalInput(e.target.value)}
                  placeholder="?"
                  autoFocus
                  style={{
                    width: '70px',
                    height: '48px',
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--clr-accent)',
                    background: 'var(--clr-input)',
                    color: 'var(--clr-text)',
                    fontWeight: 700
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCheckTotal();
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map(n => (
                  <button
                    key={n}
                    onClick={() => setTotalInput(String(n))}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'var(--clr-surface)',
                      border: '1px solid var(--clr-border)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--clr-text)'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCheckTotal}
                className="tenali-btn-primary"
                style={{
                  fontSize: '1.1rem',
                  padding: '12px 32px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                <CheckCircle size={20} />
                <span>Check My Total</span>
              </button>
            </div>
          )}

          {feedbackMsg && (
            <div style={{
              marginTop: '16px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 500,
              background: feedbackMsg.type === 'success' ? 'var(--clr-correct-bg)' : feedbackMsg.type === 'error' ? 'var(--clr-wrong-bg)' : 'var(--clr-accent-soft)',
              color: feedbackMsg.type === 'success' ? 'var(--clr-correct)' : feedbackMsg.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)',
              border: `1px solid ${feedbackMsg.type === 'success' ? 'var(--clr-correct)' : feedbackMsg.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}`
            }}>
              {feedbackMsg.text}
            </div>
          )}
        </div>

        {/* 4 Comic Panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px'
        }}>
          {givers.map((g, idx) => {
            const isCompleted = stepIdx > idx;
            const isCurrent = stepIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isCurrent ? 'var(--clr-surface)' : 'var(--clr-card)',
                  border: isCurrent
                    ? '2px solid var(--clr-accent)'
                    : isCompleted
                    ? '1px solid var(--clr-correct)'
                    : '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  textAlign: 'center',
                  opacity: stepIdx < idx ? 0.6 : 1,
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
                  {idx === 0 ? '👩' : idx === 1 ? '👨' : idx === 2 ? '👧' : '👦'}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--clr-text)', fontSize: '0.95rem' }}>
                  {g.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-soft)', marginTop: '4px' }}>
                  {isCompleted ? (
                    <span style={{ color: 'var(--clr-correct)', fontWeight: 600 }}>
                      Fed {g.amount} sweet{g.amount > 1 ? 's' : ''} ✓
                    </span>
                  ) : isCurrent ? (
                    <span style={{ color: 'var(--clr-accent)', fontWeight: 600 }}>Feeding now...</span>
                  ) : (
                    <span>Waiting turn</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCelebration && (
        <CelebrationModal
          title="Sweet Math Champion!"
          subtitle={`Aarav ate all ${grandTotal} sweets! You nailed the multi-addend sum!`}
          stars={3}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={level < 3}
        />
      )}
    </QuizLayout>
  );
}
