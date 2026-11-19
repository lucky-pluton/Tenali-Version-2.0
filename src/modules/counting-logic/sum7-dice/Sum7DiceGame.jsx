import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
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
  // Episodic Story Chapters: Story says something -> Activity happens -> Story continues!
  const [storyChapter, setStoryChapter] = useState({
    isOpen: true,
    title: "The Secret Superpower of Dice!",
    icon: "🎲",
    badge: "Chapter 1: The Magic 7 Mystery",
    story: "Every standard playing die in the world has a secret superpower! Opposite faces always balance together to equal the magic number 7! Look at the wizard's die. Throw the die and see what number is hiding underneath!",
    buttonText: "Next ➔ Throw the Die!",
    onProceed: () => {
      handleRollDie();
    }
  });

  const handleCloseStoryChapter = () => {
    const callback = storyChapter.onProceed;
    setStoryChapter(prev => ({ ...prev, isOpen: false }));
    if (callback) callback();
  };

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
      // Speak the number on top face so child hears the count
      speak(String(newTop), 0.85);
    }, 650);
  };

  const handleGuessBottom = (guess) => {
    if (rolling || revealed) return;
    setUserGuess(guess);

    // Speak ONLY the clicked guess number so child remembers!
    speak(String(guess), 0.85);

    if (guess === bottomFace) {
      playSuccessChime();
      setRevealed(true);
      setDieFlipped(true); // 3D flip over to show bottom face
      setStars(s => s + 2);

      const pairKey = `${Math.min(topFace, bottomFace)}+${Math.max(topFace, bottomFace)}`;
      const updatedPairs = discoveredPairs.includes(pairKey) ? discoveredPairs : [...discoveredPairs, pairKey];
      if (!discoveredPairs.includes(pairKey)) {
        setDiscoveredPairs(updatedPairs);
      }

      setFeedback({
        type: 'success',
        text: `✨ You nailed it! Top is ${topFace}, so the bottom is ${bottomFace}! Together they make Magic 7!`
      });

      if (updatedPairs.length >= 3) {
        setTimeout(() => {
          setStoryChapter({
            isOpen: true,
            title: "Master of the Magic 7!",
            icon: "🏆",
            badge: "Story Continues • Chapter 3",
            story: `INCREDIBLE! You discovered all three secret pairs: 1 & 6, 2 & 5, and 3 & 4! Every single opposite side of a die makes 7! Now you hold the secret wisdom of the magic die!`,
            buttonText: "Next ➔ Claim Your Trophy!",
            onProceed: () => {
              playVictoryFanfare();
              setShowCelebration(true);
            }
          });
        }, 800);
      } else if (updatedPairs.length === 1) {
        setTimeout(() => {
          setStoryChapter({
            isOpen: true,
            title: "The Secret Unfolds!",
            icon: "✨",
            badge: "Story Continues • Chapter 2",
            story: `Aha! You cracked your first secret pair: ${topFace} + ${bottomFace} = 7! But what happens if the die lands on a different number? Throw the die again to discover all the hidden pairs!`,
            buttonText: "Next ➔ Throw Again!",
            onProceed: () => {
              handleRollDie();
            }
          });
        }, 900);
      }
    } else {
      playGentleBoing();
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
    const nextLvl = level < 3 ? level + 1 : 1;
    setLevel(nextLvl);
    setStoryChapter({
      isOpen: true,
      title: "Dice Detective Challenge!",
      icon: "🎲",
      badge: `Level ${nextLvl} • Chapter 1`,
      story: `Ready for a faster round? Throw the die and deduce the bottom face even quicker!`,
      buttonText: "Next ➔ Throw the Die!",
      onProceed: () => {
        handleRollDie();
      }
    });
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setDiscoveredPairs([]);
    setRevealed(false);
    setDieFlipped(false);
    setUserGuess(null);
    setFeedback(null);
    setShowHint(false);
    setStoryChapter({
      isOpen: true,
      title: "The Secret Superpower of Dice!",
      icon: "🎲",
      badge: `Level ${level} • Chapter 1`,
      story: `Opposite faces always balance together to equal the magic number 7! Roll the die and test your skills again!`,
      buttonText: "Next ➔ Throw the Die!",
      onProceed: () => {
        handleRollDie();
      }
    });
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
      onOpenStory={() => setStoryChapter(prev => ({ ...prev, isOpen: true }))}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>

        {/* ============================================================== */}
        {/* THE MAGIC DICE GAME ARENA                                      */}
        {/* ============================================================== */}
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


      </div>

      {/* Episodic Story Modal with Mini Speaker & Next button */}
      <GameStoryModal
        isOpen={storyChapter.isOpen}
        onClose={handleCloseStoryChapter}
        title={storyChapter.title}
        icon={storyChapter.icon}
        badge={storyChapter.badge}
        story={storyChapter.story}
        buttonText={storyChapter.buttonText}
      />

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
