import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playPop, playSuccessChime, playGentleBoing, playMunch } from '../../../core/soundEffects';
import { Banana } from 'lucide-react';
import spec from './spec.json';

export default function VanishingButtonsGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  const INITIAL_BUTTONS = level === 1 ? 4 : level === 2 ? 6 : 5;
  const [buttonsRemaining, setButtonsRemaining] = useState(INITIAL_BUTTONS);
  const [bananasEaten, setBananasEaten] = useState(0);
  const [history, setHistory] = useState([]);
  const [bellyScale, setBellyScale] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleFeedBanana = () => {
    if (buttonsRemaining > 0) {
      playMunch();
      setBananasEaten(b => b + 1);
      setBellyScale(s => s + 0.08);

      setTimeout(() => {
        playPop(780);
        const nextButtons = buttonsRemaining - 1;
        setButtonsRemaining(nextButtons);

        setHistory(prev => [
          ...prev,
          {
            from: buttonsRemaining,
            popped: 1,
            remaining: nextButtons
          }
        ]);

        if (nextButtons === 0) {
          playSuccessChime();
          setFeedback({
            type: 'info',
            text: "All buttons popped away! Look at Gola's tummy! How many buttons are left on the shirt?"
          });
        }
      }, 400);
    }
  };

  const handleCheckZero = (val) => {
    const parsed = parseInt(val, 10);
    if (parsed === 0) {
      playSuccessChime();
      setStars(s => s + 3);
      setFeedback({
        type: 'success',
        text: "Brilliant! Exactly ZERO (0) buttons are left! Zero is a real number that means none!"
      });
      setTimeout(() => {
        setShowCelebration(true);
      }, 900);
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Look closely at Gola's shirt — there are NO buttons left. What number represents 'none'?`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setFeedback(null);
    setHistory([]);
    setBananasEaten(0);
    setBellyScale(1);

    if (level < 3) {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      setButtonsRemaining(nextLvl === 2 ? 6 : 5);
    } else {
      setLevel(1);
      setButtonsRemaining(4);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setFeedback(null);
    setHistory([]);
    setBananasEaten(0);
    setBellyScale(1);
    setButtonsRemaining(INITIAL_BUTTONS);
  };

  return (
    <QuizLayout
      title="Vanishing Buttons — Gola Monkey & Zero"
      subtitle="Feed bananas to Gola, watch buttons pop, and discover the magic of ZERO!"
      category="Subtraction & Zero"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>
        {/* Level Selector */}
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
              {level === 1 ? '🍌 Story of Gola Monkey (4 Buttons)' : level === 2 ? '🌴 Banana Garden Party (6 Buttons)' : '🔎 Subtraction Detective (Zero Mastery)'}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Buttons Left: <strong>{buttonsRemaining}</strong> • Bananas Eaten: {bananasEaten}
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

        {/* Play Arena */}
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '6.5rem',
                transform: `scale(${bellyScale})`,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
              }}>
                {buttonsRemaining === 0 ? '🐵' : '🐒'}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--clr-text)',
                marginTop: '8px'
              }}>
                Gola the Monkey
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '3px solid #cbd5e1',
              borderRadius: '20px',
              padding: '24px 30px',
              minWidth: '220px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px'
              }}>
                Gola's Shirt
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: '#cbd5e1'
                }} />

                {Array.from({ length: INITIAL_BUTTONS }).map((_, idx) => {
                  const buttonNum = INITIAL_BUTTONS - idx;
                  const isPresent = buttonNum <= buttonsRemaining;

                  return (
                    <div
                      key={idx}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isPresent ? '#ef4444' : 'transparent',
                        border: isPresent ? '3px solid #b91c1c' : '2px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: isPresent ? '0 3px 8px rgba(239, 68, 68, 0.4)' : 'none',
                        transition: 'all 0.4s',
                        zIndex: 2
                      }}
                    >
                      {isPresent && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '2px'
                        }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7f1d1d' }} />
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7f1d1d' }} />
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7f1d1d' }} />
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#7f1d1d' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{
                marginTop: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                color: buttonsRemaining > 0 ? '#1e293b' : '#ef4444'
              }}>
                {buttonsRemaining} Button{buttonsRemaining === 1 ? '' : 's'} Remaining
              </div>
            </div>
          </div>

          {buttonsRemaining > 0 ? (
            <div>
              <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                Gola is eating bananas in the garden! Feed him another banana to see what happens:
              </p>

              <button
                onClick={handleFeedBanana}
                className="tenali-btn-primary"
                style={{
                  fontSize: '1.15rem',
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#f59e0b',
                  color: '#1a1614',
                  fontWeight: 700
                }}
              >
                <Banana size={22} />
                <span>Feed 1 Banana to Gola! 🍌</span>
              </button>
            </div>
          ) : (
            <div className="anim-pop" style={{
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              maxWidth: '480px',
              margin: '0 auto'
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                color: 'var(--clr-accent)',
                marginBottom: '8px'
              }}>
                All buttons popped off!
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                How many buttons are left on Gola's shirt now?
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {[0, 1, 2, 3].map(val => (
                  <button
                    key={val}
                    onClick={() => handleCheckZero(val)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--clr-input)',
                      border: '2px solid var(--clr-border)',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: 'var(--clr-text)',
                      boxShadow: 'var(--shadow-btn)'
                    }}
                  >
                    {val}
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

        {history.length > 0 && (
          <div style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '18px 20px'
          }}>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              color: 'var(--clr-text-soft)',
              marginBottom: '12px'
            }}>
              Subtraction Step-by-Step History:
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '1.1rem',
                    fontFamily: 'var(--font-kids)',
                    fontWeight: 700,
                    color: 'var(--clr-text)'
                  }}
                >
                  {h.from} - {h.popped} = <span style={{ color: h.remaining === 0 ? 'var(--clr-wrong)' : 'var(--clr-accent)' }}>{h.remaining}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCelebration && (
        <CelebrationModal
          title="Zero Discovery Hero!"
          subtitle="You learned how subtraction takes away items down to ZERO!"
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
