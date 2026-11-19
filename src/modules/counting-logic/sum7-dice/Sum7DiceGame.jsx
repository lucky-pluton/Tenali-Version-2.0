import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import {
  playDiceRoll,
  playSuccessChime,
  playGentleBoing,
  playVictoryFanfare,
  playPop
} from '../../../core/soundEffects';
import { Dices, BookOpen, Volume2, Sparkles, HelpCircle, Eye } from 'lucide-react';
import spec from './spec.json';

// Child-friendly slow speech synthesis helper
function speak(text, rate = 0.82, pitch = 1.15) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate; // Gentle, child-friendly slow pace
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

export default function Sum7DiceGame({ onBack }) {
  // Whether to show the magic dice story intro screen first
  const [showStoryIntro, setShowStoryIntro] = useState(true);

  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  const [topFace, setTopFace] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [userGuess, setUserGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [discoveredPairs, setDiscoveredPairs] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [dieFlipped, setDieFlipped] = useState(false);

  const bottomFace = 7 - topFace;

  const DICE_DOTS = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]]
  };

  // When story intro opens, give a friendly voice introduction
  useEffect(() => {
    if (showStoryIntro) {
      const timer = setTimeout(() => {
        speak("Did you know that standard dice have a secret superpower? Whenever you throw a die, the number on the top face and the hidden number on the bottom face always equal 7! Let's throw the die and guess the bottom face!");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showStoryIntro]);

  const handleReadStoryAloud = () => {
    speak("Did you know that standard dice have a secret superpower? Whenever you throw a die, the number on the top face and the hidden number on the bottom face always equal 7! If top is 1, bottom is 6! If top is 2, bottom is 5! If top is 3, bottom is 4!");
  };

  const handleStartPlaying = () => {
    setShowStoryIntro(false);
    setUserGuess(null);
    setRevealed(false);
    setDieFlipped(false);
    setFeedback(null);
    setShowHint(false);
    handleRollDie();
  };

  const handleRollDie = () => {
    playDiceRoll();
    setRolling(true);
    setRevealed(false);
    setDieFlipped(false);
    setUserGuess(null);
    setFeedback(null);
    setShowHint(false);

    setTimeout(() => {
      const newTop = Math.floor(Math.random() * 6) + 1;
      setTopFace(newTop);
      setRolling(false);
      speak(`The die landed with ${newTop} on top! What number is hiding on the bottom face?`);
    }, 650);
  };

  const handleGuessBottom = (guess) => {
    if (rolling || revealed) return;
    setUserGuess(guess);

    if (guess === bottomFace) {
      playSuccessChime();
      setRevealed(true);
      setDieFlipped(true); // 3D flip over to show bottom face
      setStars(s => s + 2);

      const pairKey = `${Math.min(topFace, bottomFace)}+${Math.max(topFace, bottomFace)}`;
      if (!discoveredPairs.includes(pairKey)) {
        setDiscoveredPairs(p => [...p, pairKey]);
      }

      speak(`Awesome! ${topFace} is on top, so ${bottomFace} is hiding on the bottom! Together they make Magic 7!`);
      setFeedback({
        type: 'success',
        text: `✨ You nailed it! Top is ${topFace}, so the bottom is ${bottomFace}! Together they make Magic 7!`
      });

      if (discoveredPairs.length + 1 >= 3) {
        setTimeout(() => {
          playVictoryFanfare();
          setShowCelebration(true);
        }, 1200);
      }
    } else {
      playGentleBoing();
      speak(`Not quite! Remember, top and bottom always make 7. If top is ${topFace}, what must be at the bottom?`);
      setFeedback({
        type: 'error',
        text: `🤔 Not quite! Top is ${topFace}. What number balances with ${topFace} to make 7? Try another number or peek at the hint!`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setDiscoveredPairs([]);
    setRevealed(false);
    setDieFlipped(false);
    setUserGuess(null);
    setFeedback(null);
    setShowHint(false);
    if (level < 3) {
      setLevel(l => l + 1);
      speak(`Level ${level + 1}! Let's roll!`);
    } else {
      setLevel(1);
      speak("Back to Level 1 Dice Detective!");
    }
    handleRollDie();
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setDiscoveredPairs([]);
    setRevealed(false);
    setDieFlipped(false);
    setUserGuess(null);
    setFeedback(null);
    setShowHint(false);
    handleRollDie();
  };

  // Helper to render die SVG face
  const renderDieFace = (val, bgColor = '#ffffff', dotColor = '#1e293b', size = 88) => {
    const dots = DICE_DOTS[val] || [];
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          borderRadius: '18px',
          background: bgColor,
          border: '3px solid rgba(0,0,0,0.15)',
          boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
          display: 'block'
        }}
      >
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="10" fill={dotColor} />
        ))}
      </svg>
    );
  };

  return (
    <QuizLayout
      title="Magic Seven Discovery"
      subtitle="Throw the die and guess the secret number hiding on the bottom face!"
      category="Spatial Reasoning & Pairs of 7"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>

        {/* ============================================================== */}
        {/* STORY INTRODUCTION: The Secret Superpower of Dice              */}
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
            {/* Title Badge */}
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
              <span style={{ fontSize: '2.2rem' }}>🎲</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                color: 'var(--clr-text)',
                margin: 0
              }}>
                The Secret Superpower of Dice!
              </h2>
            </div>

            {/* Visual Story Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎲 ✨</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  1. The Magic Rule of 7
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  Did you know that on every real die in the world, the <strong>TOP</strong> face and the <strong>BOTTOM</strong> face always balance to <strong>7</strong>?
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔄 ↕️</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  2. Opposite Best Friends
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  Opposite sides are best friends:
                  <br />• <strong>1</strong> on top $\to$ <strong>6</strong> on bottom!
                  <br />• <strong>2</strong> on top $\to$ <strong>5</strong> on bottom!
                  <br />• <strong>3</strong> on top $\to$ <strong>4</strong> on bottom!
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎲 🕵️‍♂️</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  3. Throw & Guess!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  Throw the die! Look at the top face, and use your detective skills to guess what number is hiding underneath!
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍 💡</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  4. Peek Mirror Clues
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  Need a hint? Tap the <strong>Magic Peek Mirror</strong> to inspect the opposite faces before you make your guess!
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
                  background: 'linear-gradient(135deg, #e8864a, #d97706)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '14px 34px',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(232, 134, 74, 0.4)'
                }}
              >
                <Dices size={22} />
                <span>Throw the Die & Play! ➡️</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* THE MAGIC DICE GAME ARENA                                      */
          /* ============================================================== */
          <div>
            {/* Top Bar */}
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
                  {level === 1 ? 'Dice Detective' : level === 2 ? 'Opposite Face Master' : 'Grand Die Magician'}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--clr-text-soft)',
                  marginRight: '6px'
                }}>
                  Pairs Discovered: <strong style={{ color: 'var(--clr-correct)' }}>{discoveredPairs.length} / 3</strong>
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
              padding: '28px 20px',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
              marginBottom: '20px'
            }}>

              {/* The Dice Table Scene */}
              <div style={{
                background: 'radial-gradient(circle at center, #2e2621 0%, #1c1815 100%)',
                border: '3px solid #4a3b32',
                borderRadius: '24px',
                padding: '30px 20px',
                maxWidth: '540px',
                margin: '0 auto 20px auto',
                boxShadow: 'inset 0 4px 18px rgba(0,0,0,0.6)',
                position: 'relative'
              }}>

                {/* 3D Dice Stage */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '24px',
                  marginBottom: '16px'
                }}>

                  {/* The Physical Die with 3D Flip */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#38bdf8',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      TOP FACE (Landed) ⬇️
                    </div>

                    <div style={{
                      perspective: '600px',
                      display: 'inline-block'
                    }}>
                      <div style={{
                        transform: rolling
                          ? 'rotate(720deg) scale(0.85)'
                          : dieFlipped
                          ? 'rotateY(180deg)'
                          : 'rotate(0deg) scale(1)',
                        transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transformStyle: 'preserve-3d'
                      }}>
                        {renderDieFace(topFace, '#e0f2fe', '#0284c7', 96)}
                      </div>
                    </div>

                    <div style={{
                      marginTop: '8px',
                      fontSize: '1.4rem',
                      fontFamily: 'var(--font-kids)',
                      fontWeight: 700,
                      color: 'var(--clr-text)'
                    }}>
                      {topFace}
                    </div>
                  </div>

                  {/* Secret Connection / Opposite Arrow */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '1.6rem', color: 'var(--clr-accent)' }}>⇄</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'var(--clr-accent)',
                      background: 'rgba(232, 134, 74, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}>
                      OPPOSITE
                    </span>
                  </div>

                  {/* The Hidden Bottom Face */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#f43f5e',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      BOTTOM FACE (Hidden) ⬆️
                    </div>

                    {revealed ? (
                      <div className="anim-pop" style={{ display: 'inline-block' }}>
                        {renderDieFace(bottomFace, '#ffe4e6', '#e11d48', 96)}
                      </div>
                    ) : (
                      <div style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '18px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '3px dashed rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--clr-accent)',
                        boxShadow: '0 8px 18px rgba(0,0,0,0.2)'
                      }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800 }}>?</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--clr-text-soft)' }}>
                          HIDING
                        </span>
                      </div>
                    )}

                    <div style={{
                      marginTop: '8px',
                      fontSize: '1.4rem',
                      fontFamily: 'var(--font-kids)',
                      fontWeight: 700,
                      color: revealed ? 'var(--clr-correct)' : 'var(--clr-text-soft)'
                    }}>
                      {revealed ? bottomFace : '?'}
                    </div>
                  </div>

                </div>

                {/* Roll Die Action Button */}
                <button
                  onClick={handleRollDie}
                  disabled={rolling}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #e8864a, #d97706)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '12px 28px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(232, 134, 74, 0.4)'
                  }}
                >
                  <Dices size={18} />
                  <span>{rolling ? 'Rolling Die...' : 'Throw Die Again! 🎲'}</span>
                </button>
              </div>

              {/* The Core Question: Framed as a game, not an equation! */}
              {!revealed ? (
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--clr-text)',
                    marginBottom: '10px'
                  }}>
                    The top face landed on {topFace}! What is the number on the bottom face?
                  </h3>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <button
                      onClick={() => {
                        setShowHint(!showHint);
                        playPop();
                        speak(`Hint: 1 balances with 6, 2 balances with 5, and 3 balances with 4! If top is ${topFace}, what balances to make 7?`);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: showHint ? 'var(--clr-accent-soft)' : 'var(--clr-surface)',
                        color: showHint ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
                        border: '1px solid var(--clr-border)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '6px 16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={15} />
                      <span>{showHint ? 'Hide Hint' : '💡 Peek Mirror Hint'}</span>
                    </button>
                  </div>

                  {/* Peek Mirror Hint Display */}
                  {showHint && (
                    <div className="anim-pop" style={{
                      background: 'rgba(232, 134, 74, 0.12)',
                      border: '1px solid var(--clr-accent)',
                      borderRadius: '14px',
                      padding: '12px 18px',
                      maxWidth: '480px',
                      margin: '0 auto 16px auto',
                      fontSize: '0.92rem',
                      color: 'var(--clr-text)',
                      textAlign: 'left'
                    }}>
                      💡 <strong>Opposite Faces Cheat-Sheet:</strong>
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '6px', fontWeight: 700 }}>
                        <span>1 ⇄ 6</span>
                        <span>2 ⇄ 5</span>
                        <span>3 ⇄ 4</span>
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                        If top is {topFace}, then the bottom face must balance with it!
                      </p>
                    </div>
                  )}

                  {/* Number choices to guess */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => handleGuessBottom(num)}
                        style={{
                          width: '58px',
                          height: '58px',
                          borderRadius: '16px',
                          background: userGuess === num
                            ? num === bottomFace ? 'var(--clr-correct)' : 'var(--clr-wrong)'
                            : 'var(--clr-surface)',
                          border: '2px solid var(--clr-border)',
                          fontSize: '1.5rem',
                          fontWeight: 800,
                          color: userGuess === num ? '#ffffff' : 'var(--clr-text)',
                          boxShadow: 'var(--shadow-btn)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Revealed Congratulations Card */
                <div className="anim-pop" style={{
                  background: 'var(--clr-surface)',
                  border: '2px solid var(--clr-correct)',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  maxWidth: '480px',
                  margin: '0 auto'
                }}>
                  <span style={{ fontSize: '2rem' }}>🎉</span>
                  <h4 style={{
                    fontSize: '1.25rem',
                    color: 'var(--clr-correct)',
                    margin: '6px 0'
                  }}>
                    Mystery Solved!
                  </h4>
                  <p style={{ fontSize: '1rem', color: 'var(--clr-text)', margin: '0 0 14px 0' }}>
                    Top was <strong>{topFace}</strong> and the bottom was <strong>{bottomFace}</strong>!
                  </p>
                  <button
                    onClick={handleRollDie}
                    style={{
                      background: 'var(--clr-accent)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-pill)',
                      padding: '10px 24px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🎲 Roll for Next Mystery!
                  </button>
                </div>
              )}

              {/* Feedback alert */}
              {feedback && (
                <div className="anim-pop" style={{
                  marginTop: '16px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  background: feedback.type === 'success' ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)',
                  color: feedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                  border: `1px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`
                }}>
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Magic Dice Pair Collection Badges */}
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '18px 24px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <h4 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: 'var(--clr-text-soft)',
                margin: '0 0 12px 0'
              }}>
                Magic Opposite Pairs You Have Discovered:
              </h4>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { a: 1, b: 6, title: "1 on Top ⇄ 6 on Bottom" },
                  { a: 2, b: 5, title: "2 on Top ⇄ 5 on Bottom" },
                  { a: 3, b: 4, title: "3 on Top ⇄ 4 on Bottom" }
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
                        padding: '10px 18px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: isFound ? 'var(--clr-correct)' : 'var(--clr-text)'
                      }}
                    >
                      <span>{p.title}</span>
                      {isFound ? <span>⭐</span> : <span style={{ opacity: 0.4 }}>🔒</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {showCelebration && (
        <CelebrationModal
          title="Dice Detective Champion!"
          subtitle="You cracked all the secret opposite faces of Magic 7 on the die!"
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
