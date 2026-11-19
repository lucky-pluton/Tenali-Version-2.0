import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playDiceRoll, playSuccessChime, playGentleBoing } from '../../../core/soundEffects';
import { Dices } from 'lucide-react';
import spec from './spec.json';

export default function Sum7DiceGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  const [topFace, setTopFace] = useState(2);
  const [rolling, setRolling] = useState(false);
  const [userGuess, setUserGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [discoveredPairs, setDiscoveredPairs] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const bottomFace = 7 - topFace;

  const DICE_DOTS = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]]
  };

  const handleRollDie = () => {
    playDiceRoll();
    setRolling(true);
    setRevealed(false);
    setUserGuess(null);
    setFeedback(null);

    setTimeout(() => {
      const newTop = Math.floor(Math.random() * 6) + 1;
      setTopFace(newTop);
      setRolling(false);
    }, 600);
  };

  const handleGuessBottom = (guess) => {
    setUserGuess(guess);
    setRevealed(true);

    if (guess === bottomFace) {
      playSuccessChime();
      setStars(s => s + 2);
      const pairKey = `${Math.min(topFace, bottomFace)}+${Math.max(topFace, bottomFace)}`;
      if (!discoveredPairs.includes(pairKey)) {
        setDiscoveredPairs(p => [...p, pairKey]);
      }

      setFeedback({
        type: 'success',
        text: `Magical! Top is ${topFace} and Bottom is ${bottomFace}! ${topFace} + ${bottomFace} = 7!`
      });

      if (discoveredPairs.length + 1 >= 3) {
        setTimeout(() => {
          setShowCelebration(true);
        }, 1000);
      }
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Remember the Magic Rule: Top + Bottom MUST equal 7! ${topFace} + ${guess} = ${topFace + guess} (not 7).`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setDiscoveredPairs([]);
    setRevealed(false);
    setUserGuess(null);
    setFeedback(null);
    if (level < 3) {
      setLevel(l => l + 1);
    } else {
      setLevel(1);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setDiscoveredPairs([]);
    setRevealed(false);
    setUserGuess(null);
    setFeedback(null);
    handleRollDie();
  };

  const renderDieFace = (val, color = '#ffffff', dotColor = '#1e293b') => {
    const dots = DICE_DOTS[val] || [];
    return (
      <svg width="80" height="80" viewBox="0 0 100 100" style={{ borderRadius: '16px', background: color, border: '2px solid rgba(0,0,0,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="9" fill={dotColor} />
        ))}
      </svg>
    );
  };

  return (
    <QuizLayout
      title="Sum 7 Dice Game — The Magic Pair"
      subtitle="Discover the secret of opposite dice faces: they always add up to 7!"
      category="Spatial Reasoning & Pairs of 7"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>
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
              {level === 1 ? '🎲 The Magic 7 Discovery' : level === 2 ? '⚡ Fast Opposite Face Solver' : '🏆 Mystery Hidden Face Detective'}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Discovered Pairs of 7: {discoveredPairs.length} / 3 (1+6, 2+5, 3+4)
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

        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '28px 20px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-accent)',
            borderRadius: 'var(--radius-pill)',
            padding: '8px 24px',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--clr-accent)',
            marginBottom: '24px'
          }}>
            ✨ The Magic Fact: The TOP and BOTTOM faces always add up to 7!
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
                TOP FACE ⬇️
              </span>
              <div style={{
                transform: rolling ? 'rotate(360deg) scale(0.9)' : 'scale(1)',
                transition: 'transform 0.5s'
              }}>
                {renderDieFace(topFace, '#e0f2fe', '#0284c7')}
              </div>
              <span style={{
                marginTop: '6px',
                fontSize: '1.4rem',
                fontFamily: 'var(--font-kids)',
                fontWeight: 700,
                color: 'var(--clr-text)'
              }}>
                {topFace}
              </span>
            </div>

            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--clr-accent)',
              fontFamily: 'var(--font-kids)'
            }}>
              +
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#f43f5e', fontWeight: 700, marginBottom: '6px' }}>
                BOTTOM FACE ⬆️
              </span>
              {revealed ? (
                <div className="anim-pop">
                  {renderDieFace(bottomFace, '#ffe4e6', '#e11d48')}
                </div>
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'var(--clr-surface)',
                  border: '2px dashed var(--clr-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: 'var(--clr-accent)'
                }}>
                  ?
                </div>
              )}
              <span style={{
                marginTop: '6px',
                fontSize: '1.4rem',
                fontFamily: 'var(--font-kids)',
                fontWeight: 700,
                color: revealed ? 'var(--clr-correct)' : 'var(--clr-text-soft)'
              }}>
                {revealed ? bottomFace : '?'}
              </span>
            </div>

            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--clr-accent)',
              fontFamily: 'var(--font-kids)'
            }}>
              =
            </div>

            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--clr-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.6rem',
              fontWeight: 900,
              color: '#ffffff',
              fontFamily: 'var(--font-kids)',
              boxShadow: '0 0 20px rgba(232, 134, 74, 0.5)'
            }}>
              7
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={handleRollDie}
              disabled={rolling}
              className="tenali-btn-primary"
              style={{
                fontSize: '1.1rem',
                padding: '12px 28px',
                borderRadius: 'var(--radius-pill)',
                margin: '0 auto'
              }}
            >
              <Dices size={20} />
              <span>{rolling ? 'Rolling Die...' : 'Roll The Die! 🎲'}</span>
            </button>
          </div>

          {!revealed && (
            <div>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '14px' }}>
                The top face is <strong>{topFace}</strong>. What MUST the bottom face be to add up to 7?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => handleGuessBottom(num)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'var(--clr-surface)',
                      border: '2px solid var(--clr-border)',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: 'var(--clr-text)',
                      boxShadow: 'var(--shadow-btn)'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {feedback && (
            <div className="anim-pop" style={{
              marginTop: '20px',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              background: feedback.type === 'success' ? 'var(--clr-correct-bg)' : feedback.type === 'error' ? 'var(--clr-wrong-bg)' : 'var(--clr-accent-soft)',
              color: feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)',
              border: `1px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}`
            }}>
              {feedback.text}
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '18px 24px'
        }}>
          <h4 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            color: 'var(--clr-text-soft)',
            marginBottom: '12px'
          }}>
            All Dice Opposite Pairs That Sum to 7:
          </h4>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { a: 1, b: 6 },
              { a: 2, b: 5 },
              { a: 3, b: 4 }
            ].map((p, idx) => {
              const key = `${p.a}+${p.b}`;
              const isFound = discoveredPairs.includes(key);

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isFound ? 'var(--clr-correct-bg)' : 'var(--clr-surface)',
                    border: `1px solid ${isFound ? 'var(--clr-correct)' : 'var(--clr-border)'}`,
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontSize: '1.1rem',
                    fontFamily: 'var(--font-kids)',
                    fontWeight: 700,
                    color: isFound ? 'var(--clr-correct)' : 'var(--clr-text)'
                  }}
                >
                  <span>{p.a} + {p.b} = 7</span>
                  {isFound ? <span>✓</span> : <span style={{ opacity: 0.4 }}>🔒</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showCelebration && (
        <CelebrationModal
          title="Dice Master!"
          subtitle="You unlocked all magical opposite pairs of 7 on the die!"
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
