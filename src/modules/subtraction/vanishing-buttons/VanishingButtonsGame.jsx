import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import { playPop, playSuccessChime, playGentleBoing, playMunch } from '../../../core/soundEffects';
import { Banana, BookOpen, Volume2, Sparkles } from 'lucide-react';
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
  const [poppedButtons, setPoppedButtons] = useState([]); // Buttons that have popped onto the floor!
  const [bananasEaten, setBananasEaten] = useState(0);
  const [history, setHistory] = useState([]);
  const [bellyScale, setBellyScale] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animation states
  const [isFeeding, setIsFeeding] = useState(false);
  const [activeFlyingBanana, setActiveFlyingBanana] = useState(false);
  const [recentlyPoppedIdx, setRecentlyPoppedIdx] = useState(null);

  // When story intro opens, give a friendly voice introduction
  const handleStartPlaying = () => {
    setShowStoryIntro(false);
    setButtonsRemaining(INITIAL_BUTTONS);
    setPoppedButtons([]);
    setBananasEaten(0);
    setBellyScale(1);
    setHistory([]);
    setFeedback(null);
    setIsFeeding(false);
    setActiveFlyingBanana(false);
    setRecentlyPoppedIdx(null);
  };

  const handleFeedBanana = () => {
    if (buttonsRemaining > 0 && !isFeeding) {
      setIsFeeding(true);
      setActiveFlyingBanana(true);

      // Phase 1: Banana flies from basket to Gola's mouth (500ms)
      setTimeout(() => {
        playMunch();
        setActiveFlyingBanana(false);
        setBananasEaten(b => b + 1);
        setBellyScale(s => s + 0.1);

        // Phase 2: Belly swells, button pops out and lands on the floor! (450ms)
        setTimeout(() => {
          playPop(780);
          const prev = buttonsRemaining;
          const nextRemaining = prev - 1;
          const poppedButtonNumber = prev;

          setRecentlyPoppedIdx(poppedButtonNumber);
          setButtonsRemaining(nextRemaining);

          // Add button to the popped collection on the floor
          setPoppedButtons(curr => [...curr, poppedButtonNumber]);

          // Subtraction step history
          setHistory(prevHist => [
            ...prevHist,
            {
              from: prev,
              popped: 1,
              remaining: nextRemaining
            }
          ]);

          // Speak ONLY the remaining count: "3", "2", "1", "0"!
          speak(String(nextRemaining), 0.85);

          if (nextRemaining > 0) {
            setFeedback({
              type: 'info',
              text: `💥 POP! Button #${poppedButtonNumber} popped off the shirt onto the floor! ${prev} - 1 = ${nextRemaining} buttons left on shirt.`
            });
          } else {
            playSuccessChime();
            setFeedback({
              type: 'info',
              text: `💥 POP! All buttons have popped off onto the floor! How many buttons are left on Gola's shirt now?`
            });
          }

          setTimeout(() => {
            setRecentlyPoppedIdx(null);
            setIsFeeding(false);
          }, 350);
        }, 450);
      }, 500);
    }
  };

  const handleCheckZero = (val) => {
    // Speak ONLY the clicked number so child remembers!
    speak(String(val), 0.85);

    const parsed = parseInt(val, 10);
    if (parsed === 0) {
      playSuccessChime();
      setStars(s => s + 3);
      setFeedback({
        type: 'success',
        text: `✨ Brilliant! Exactly ZERO (0) buttons left on the shirt! All ${INITIAL_BUTTONS} buttons are on the floor. Zero is the number for none!`
      });
      setTimeout(() => {
        setShowCelebration(true);
      }, 1200);
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Look closely at Gola's shirt — there are NO buttons left on it. What number represents 'none'? Try 0!`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setFeedback(null);
    setHistory([]);
    setPoppedButtons([]);
    setBananasEaten(0);
    setBellyScale(1);

    if (level < 3) {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      const nextCount = nextLvl === 2 ? 5 : 6;
      setButtonsRemaining(nextCount);
    } else {
      setLevel(1);
      setButtonsRemaining(4);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setFeedback(null);
    setHistory([]);
    setPoppedButtons([]);
    setBananasEaten(0);
    setBellyScale(1);
    setButtonsRemaining(INITIAL_BUTTONS);
  };

  const remainingBananasInBasket = buttonsRemaining;

  return (
    <QuizLayout
      title="Vanishing Buttons — Gola Monkey & Zero"
      subtitle="Feed bananas to Gola, watch buttons pop onto the floor, and discover ZERO!"
      category="Subtraction & Zero"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
      onOpenStory={() => setShowStoryIntro(true)}
    >
      <div style={{ width: '100%', maxWidth: '860px' }}>

        {/* ============================================================== */}
        {/* INTERACTIVE GAMEPLAY ARENA                                     */}
        {/* ============================================================== */}
        <div>
            {/* Top Level Bar */}
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

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--clr-text-soft)'
                }}>
                  On Shirt: <strong style={{ color: 'var(--clr-accent)' }}>{buttonsRemaining}</strong> • On Floor: <strong style={{ color: '#ef4444' }}>{poppedButtons.length}</strong>
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
              padding: '24px 20px',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
              marginBottom: '20px'
            }}>

              {/* 3 Interactive Areas: Basket (Left) | Gola + Shirt (Center) | Popped Floor (Right) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                alignItems: 'start',
                marginBottom: '24px'
              }}>

                {/* AREA 1: THE BANANA BASKET 🧺 */}
                <div style={{
                  background: 'var(--clr-surface)',
                  border: '2px solid var(--clr-border)',
                  borderRadius: '20px',
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-card)',
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--clr-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px'
                  }}>
                    🧺 Banana Basket
                  </div>

                  {/* Basket Graphic & Bananas */}
                  <div
                    onClick={buttonsRemaining > 0 && !isFeeding ? handleFeedBanana : undefined}
                    style={{
                      width: '120px',
                      height: '110px',
                      borderRadius: '16px 16px 28px 28px',
                      background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
                      border: '3px solid #92400e',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: buttonsRemaining > 0 && !isFeeding ? 'pointer' : 'default',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => {
                      if (buttonsRemaining > 0 && !isFeeding) e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {/* Woven pattern lines */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px)',
                      pointerEvents: 'none'
                    }} />

                    {/* Bananas inside the basket */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: '4px',
                      zIndex: 2,
                      padding: '8px'
                    }}>
                      {Array.from({ length: remainingBananasInBasket }).map((_, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '1.8rem',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                            display: 'inline-block'
                          }}
                        >
                          🍌
                        </span>
                      ))}
                      {remainingBananasInBasket === 0 && (
                        <span style={{ fontSize: '0.85rem', color: '#fef3c7', fontWeight: 600 }}>
                          Empty! (0 bananas)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flying Banana Animation Overlay */}
                  {activeFlyingBanana && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50px',
                        left: '60px',
                        fontSize: '2.5rem',
                        zIndex: 20,
                        animation: 'flyToGola 0.5s ease-in-out forwards',
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                      }}
                    >
                      🍌
                    </div>
                  )}

                  <div style={{
                    marginTop: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--clr-text)'
                  }}>
                    {remainingBananasInBasket} Banana{remainingBananasInBasket === 1 ? '' : 's'} in Basket
                  </div>

                  {buttonsRemaining > 0 && (
                    <button
                      onClick={handleFeedBanana}
                      disabled={isFeeding}
                      style={{
                        marginTop: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-pill)',
                        padding: '10px 18px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                      }}
                    >
                      <Banana size={16} />
                      <span>Feed 1 Banana!</span>
                    </button>
                  )}
                </div>

                {/* AREA 2: GOLA & HIS SHIRT (CENTER) 🐒 👕 */}
                <div style={{
                  background: 'var(--clr-surface)',
                  border: '2px solid var(--clr-border)',
                  borderRadius: '20px',
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--clr-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px'
                  }}>
                    🐒 Gola's Shirt
                  </div>

                  {/* Gola Character */}
                  <div style={{
                    fontSize: '5.5rem',
                    transform: `scale(${bellyScale})`,
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))',
                    marginBottom: '8px'
                  }}>
                    {buttonsRemaining === 0 ? '🐵' : '🐒'}
                  </div>

                  {/* Shirt Card with buttons and empty holes */}
                  <div style={{
                    background: '#f8fafc',
                    border: '3px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    width: '100%',
                    maxWidth: '180px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      position: 'relative'
                    }}>
                      {/* Vertical line through buttons */}
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
                        const isPoppingNow = recentlyPoppedIdx === buttonNum;

                        return (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: isPresent ? '#ef4444' : '#f1f5f9',
                              border: isPresent ? '3px solid #b91c1c' : '2px dashed #94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isPresent ? '0 3px 6px rgba(239, 68, 68, 0.4)' : 'none',
                              zIndex: 2,
                              transition: 'all 0.3s'
                            }}
                          >
                            {isPresent ? (
                              /* Fastened button with thread holes */
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
                            ) : (
                              /* Empty button slot (thread left behind) */
                              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
                                ✕
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: buttonsRemaining > 0 ? 'var(--clr-text)' : '#ef4444'
                  }}>
                    {buttonsRemaining} Button{buttonsRemaining === 1 ? '' : 's'} on Shirt
                  </div>
                </div>

                {/* AREA 3: POPPED BUTTONS ON THE FLOOR 🟫 (DO NOT DISAPPEAR!) */}
                <div style={{
                  background: 'var(--clr-surface)',
                  border: '2px solid var(--clr-border)',
                  borderRadius: '20px',
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-card)',
                  minHeight: '220px'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#ef4444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px'
                  }}>
                    🟫 Popped onto the Floor
                  </div>

                  {/* Floor Mat area */}
                  <div style={{
                    background: '#e2e8f0',
                    border: '3px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '16px',
                    width: '100%',
                    minHeight: '140px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)'
                  }}>
                    {poppedButtons.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                        No buttons on floor yet!
                      </span>
                    ) : (
                      poppedButtons.map((btnNum, i) => (
                        <div
                          key={btnNum}
                          className="anim-pop"
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            border: '3px solid #b91c1c',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '11px',
                            transform: `rotate(${(btnNum * 47) % 360}deg)`
                          }}
                        >
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '2px'
                          }}>
                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#7f1d1d' }} />
                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#7f1d1d' }} />
                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#7f1d1d' }} />
                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#7f1d1d' }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{
                    marginTop: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#ef4444'
                  }}>
                    {poppedButtons.length} Button{poppedButtons.length === 1 ? '' : 's'} on Floor
                  </div>
                </div>

              </div>

              {/* ZERO QUESTION STAGE (When all buttons have popped onto the floor!) */}
              {buttonsRemaining === 0 && (
                <div className="anim-pop" style={{
                  background: 'var(--clr-surface)',
                  border: '2px solid var(--clr-accent)',
                  borderRadius: 'var(--radius)',
                  padding: '24px 20px',
                  maxWidth: '520px',
                  margin: '0 auto 16px auto',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉 👕</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.35rem',
                    color: 'var(--clr-text)',
                    margin: '0 0 8px 0'
                  }}>
                    All buttons popped onto the floor!
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
                  marginTop: '16px',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontSize: '0.98rem',
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


      </div>

      {/* Embedded CSS animation for flying banana */}
      <style>{`
        @keyframes flyToGola {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(90px, -40px) scale(1.3) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: translate(180px, 10px) scale(0.6) rotate(90deg);
            opacity: 0;
          }
        }
      `}</style>

            {/* Illustrated Game Story Screen before playing */}
      <GameStoryModal
        isOpen={showStoryIntro}
        onClose={() => setShowStoryIntro(false)}
        title="Gola Monkey's Favorite Shirt"
        icon="🐒"
        badge="Zero Discovery Story"
        story="Meet Gola the monkey! Gola loves wearing his favorite white shirt with shiny red buttons. But Gola also loves sweet bananas! As you feed him bananas, his tummy swells until POP—buttons pop off the shirt onto the floor! Count down how many buttons remain on his shirt until zero are left!"
        buttonText="Next ➔ Feed Gola Bananas!"
      />

      {showCelebration && (
        <CelebrationModal
          title="Zero Discovery Hero!"
          subtitle={`You discovered that taking away all ${INITIAL_BUTTONS} buttons leaves exactly ZERO (0) on the shirt!`}
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
