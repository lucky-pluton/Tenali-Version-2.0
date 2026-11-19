import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playPop, playSuccessChime, playGentleBoing, playMunch } from '../../../core/soundEffects';
import { Banana, BookOpen, Sparkles, Volume2 } from 'lucide-react';
import spec from './spec.json';

// Child-friendly slow speech synthesis helper
function speak(text, rate = 0.82, pitch = 1.15) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate; // Gentle child-friendly pace
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

export default function VanishingButtonsGame({ onBack }) {
  // Whether to show the story introduction first
  const [showStoryIntro, setShowStoryIntro] = useState(true);

  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  const INITIAL_BUTTONS = level === 1 ? 4 : level === 2 ? 5 : 6;
  const [buttonsRemaining, setButtonsRemaining] = useState(INITIAL_BUTTONS);
  const [bananasEaten, setBananasEaten] = useState(0);
  const [history, setHistory] = useState([]);
  const [bellyScale, setBellyScale] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);

  // When story intro opens, give a friendly voice introduction
  useEffect(() => {
    if (showStoryIntro) {
      const timer = setTimeout(() => {
        speak("Meet Gola the monkey! Gola is wearing a shirt with shiny red buttons. Whenever Gola eats a sweet banana, his tummy grows bigger and bigger until... POP! A button pops off! Let's feed Gola and see what happens!");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showStoryIntro]);

  const handleReadStoryAloud = () => {
    speak("Meet Gola the monkey! Gola is wearing a shirt with shiny red buttons. Whenever Gola eats a sweet banana, his tummy grows bigger and bigger until... POP! A button pops off! Let's feed Gola and see what happens!");
  };

  const handleStartPlaying = () => {
    setShowStoryIntro(false);
    setButtonsRemaining(INITIAL_BUTTONS);
    setBananasEaten(0);
    setBellyScale(1);
    setHistory([]);
    setFeedback(null);
    speak(`Gola is wearing his shirt with ${INITIAL_BUTTONS} shiny buttons. Tap the button to feed him a banana!`);
  };

  const handleFeedBanana = () => {
    if (buttonsRemaining > 0 && !isFeeding) {
      setIsFeeding(true);
      playMunch();
      setBananasEaten(b => b + 1);
      setBellyScale(s => s + 0.1);

      setTimeout(() => {
        playPop(780);
        const prev = buttonsRemaining;
        const nextButtons = prev - 1;
        setButtonsRemaining(nextButtons);

        setHistory(prevHist => [
          ...prevHist,
          {
            from: prev,
            popped: 1,
            remaining: nextButtons
          }
        ]);

        if (nextButtons > 0) {
          speak(`POP! One button popped! ${prev} minus 1 equals ${nextButtons}. ${nextButtons} buttons left.`);
          setFeedback({
            type: 'info',
            text: `💥 POP! A button burst off! ${prev} - 1 = ${nextButtons} buttons remaining.`
          });
        } else {
          playSuccessChime();
          speak(`POP! The last button popped off! Gola's shirt has no buttons left. How many buttons are on the shirt now?`);
          setFeedback({
            type: 'info',
            text: `💥 POP! All buttons popped off! Look at Gola's tummy! How many buttons are left on the shirt now?`
          });
        }
        setIsFeeding(false);
      }, 500);
    }
  };

  const handleCheckZero = (val) => {
    const parsed = parseInt(val, 10);
    if (parsed === 0) {
      playSuccessChime();
      speak("Brilliant! Exactly ZERO buttons are left! Zero means none!");
      setStars(s => s + 3);
      setFeedback({
        type: 'success',
        text: `✨ Brilliant! Exactly ZERO (0) buttons are left! Zero is the number that represents none!`
      });
      setTimeout(() => {
        setShowCelebration(true);
      }, 1200);
    } else {
      playGentleBoing();
      speak(`Look closely at Gola's shirt. There are no buttons left. What number means none?`);
      setFeedback({
        type: 'error',
        text: `Look closely at Gola's shirt — there are NO buttons left. What number represents 'none'? Try 0!`
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
      const nextCount = nextLvl === 2 ? 5 : 6;
      setButtonsRemaining(nextCount);
      speak(`Level ${nextLvl}! This time Gola's shirt has ${nextCount} buttons!`);
    } else {
      setLevel(1);
      setButtonsRemaining(4);
      speak(`Back to Level 1 with 4 buttons!`);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setFeedback(null);
    setHistory([]);
    setBananasEaten(0);
    setBellyScale(1);
    setButtonsRemaining(INITIAL_BUTTONS);
    speak(`Let's play again! Gola has ${INITIAL_BUTTONS} buttons.`);
  };

  return (
    <QuizLayout
      title="Vanishing Buttons — Gola Monkey & Zero"
      subtitle="Discover how subtraction takes away buttons one-by-one until ZERO (0) are left!"
      category="Subtraction & Zero"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '820px' }}>

        {/* ============================================================== */}
        {/* STORY INTRODUCTION SCREEN                                      */}
        {/* ============================================================== */}
        {showStoryIntro ? (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            {/* Header Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 22px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '2.2rem' }}>🐒</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                color: 'var(--clr-text)',
                margin: 0
              }}>
                The Story of Gola Monkey!
              </h2>
            </div>

            {/* Story Illustrations & Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👕</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  1. Gola's Shiny Shirt
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  Gola is a happy little monkey who loves wearing his favorite shirt with bright red buttons!
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍌</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  2. Delicious Sweet Bananas
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  Gola has a big appetite! Whenever he eats a sweet banana, his tummy gets bigger and rounder!
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💥</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  3. POP! Buttons Vanish!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  As his belly swells... POP! A button bursts off! With each banana, 1 button vanishes ($N - 1$).
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>0️⃣</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  4. The Magic of ZERO
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  What happens when all the buttons pop off and NONE are left? We discover the number <strong>ZERO (0)</strong>!
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleReadStoryAloud}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--clr-surface)',
                  color: 'var(--clr-text)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={18} />
                <span>Hear Story Aloud</span>
              </button>

              <button
                onClick={handleStartPlaying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '14px 34px',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
                }}
              >
                <Banana size={22} />
                <span>Let's Feed Gola & Play! ➡️</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* INTERACTIVE GAMEPLAY ARENA                                     */
          /* ============================================================== */
          <div>
            {/* Top Control Bar */}
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
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-accent)' }}>
                  LEVEL {level} OF 3
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  color: 'var(--clr-text)',
                  margin: '2px 0 0 0'
                }}>
                  {level === 1 ? '4 Buttons Shirt' : level === 2 ? '5 Buttons Shirt' : '6 Buttons Shirt'}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--clr-text-soft)',
                  marginRight: '6px'
                }}>
                  Buttons Left: <strong style={{ color: 'var(--clr-text)' }}>{buttonsRemaining}</strong>
                </span>

                <button
                  onClick={() => setShowStoryIntro(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: 'var(--clr-surface)',
                    color: 'var(--clr-text-soft)',
                    border: '1px solid var(--clr-border)',
                    cursor: 'pointer'
                  }}
                >
                  <BookOpen size={14} />
                  <span>Story</span>
                </button>
              </div>
            </div>

            {/* Play Arena Card */}
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '26px 20px',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '36px',
                flexWrap: 'wrap',
                marginBottom: '24px'
              }}>
                {/* Gola Character with Expanding Tummy */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '6.5rem',
                    transform: `scale(${bellyScale})`,
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))'
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                    {bananasEaten} Banana{bananasEaten === 1 ? '' : 's'} Eaten 🍌
                  </div>
                </div>

                {/* Gola's Shirt with Stitched Buttons */}
                <div style={{
                  background: '#f8fafc',
                  border: '3px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '24px 30px',
                  minWidth: '220px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '14px'
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
                    {/* Vertical Placket Line */}
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
                          className={isPresent ? 'anim-pop' : ''}
                          style={{
                            width: '40px',
                            height: '40px',
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
                            transition: 'all 0.3s',
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
                    marginTop: '16px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: buttonsRemaining > 0 ? '#1e293b' : '#ef4444'
                  }}>
                    {buttonsRemaining} Button{buttonsRemaining === 1 ? '' : 's'} Remaining
                  </div>
                </div>
              </div>

              {/* Action: Feed Banana or Guess Zero */}
              {buttonsRemaining > 0 ? (
                <div>
                  <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '16px' }}>
                    Gola is ready for a treat! Feed him a banana to watch his tummy grow:
                  </p>

                  <button
                    onClick={handleFeedBanana}
                    disabled={isFeeding}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '1.2rem',
                      padding: '14px 34px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#ffffff',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)',
                      transform: isFeeding ? 'scale(0.96)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Banana size={24} />
                    <span>Feed 1 Banana to Gola! 🍌</span>
                  </button>
                </div>
              ) : (
                /* Question when all buttons popped off */
                <div className="anim-pop" style={{
                  background: 'var(--clr-surface)',
                  border: '2px solid var(--clr-accent)',
                  borderRadius: 'var(--radius)',
                  padding: '24px 20px',
                  maxWidth: '520px',
                  margin: '0 auto',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉 👕</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    color: 'var(--clr-text)',
                    margin: '0 0 8px 0'
                  }}>
                    All buttons popped off!
                  </h3>
                  <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', marginBottom: '18px' }}>
                    Look at Gola's shirt — how many buttons are left on it now?
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {[0, 1, 2, 3].map(val => (
                      <button
                        key={val}
                        onClick={() => handleCheckZero(val)}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '16px',
                          background: val === 0 ? 'var(--clr-accent)' : 'var(--clr-surface)',
                          color: val === 0 ? '#ffffff' : 'var(--clr-text)',
                          border: '2px solid var(--clr-border)',
                          fontSize: '1.7rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-btn)',
                          transition: 'all 0.15s'
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Alert */}
              {feedback && (
                <div className="anim-pop" style={{
                  marginTop: '20px',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: feedback.type === 'success' ? 'var(--clr-correct-bg)' : feedback.type === 'error' ? 'var(--clr-wrong-bg)' : 'rgba(232, 134, 74, 0.15)',
                  color: feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)',
                  border: `1px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}`
                }}>
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Subtraction Step History */}
            {history.length > 0 && (
              <div style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  color: 'var(--clr-text-soft)',
                  margin: '0 0 12px 0'
                }}>
                  Subtraction Step-by-Step History:
                </h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="anim-pop"
                      style={{
                        background: 'var(--clr-surface)',
                        border: '1px solid var(--clr-border)',
                        borderRadius: '10px',
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
        )}

      </div>

      {showCelebration && (
        <CelebrationModal
          title="Zero Discovery Hero!"
          subtitle={`You discovered that taking away all ${INITIAL_BUTTONS} buttons leaves exactly ZERO (0)!`}
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
