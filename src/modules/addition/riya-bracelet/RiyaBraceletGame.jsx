import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playBeadClick,
  playSuccessChime,
  playGentleBoing,
  playVictoryFanfare,
  playBraceletSnap,
  playScatter
} from '../../../core/soundEffects';
import spec from './spec.json';

// Helper for speaking numbers and friendly child-pace dialogue
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

export default function RiyaBraceletGame({ onBack }) {
  // Stages:
  // 'intro_count'      -> Step 1: Count 1 to 10 on Riya's bracelet
  // 'crazy_prompt'     -> "Do you want to do a crazy thing?"
  // 'crazy_break'      -> The snap animation and scattered beads
  // 'search_found'     -> Riya searched and found only 3 beads
  // 'shopkeeper_intro' -> Shopkeeper warning: "Don't buy more beads, otherwise you will waste it"
  // 'playing_levels'   -> The 4 core user levels (3->7, 5->5, 2->8, 8->2)
  const [stage, setStage] = useState('intro_count');

  // Intro count state
  const [countedBeads, setCountedBeads] = useState([]);
  const [introSpeaking, setIntroSpeaking] = useState(false);

  // Crazy break animation state
  const [isSnapping, setIsSnapping] = useState(false);

  // Game levels state
  const LEVELS = [
    {
      level: 1,
      have: 3,
      target: 10,
      story: "Riya searched everywhere and found only 3 beads! How many beads does she want to buy to make a bracelet of 10 beads?",
      question: "Found 3 beads. How many more to make 10?",
      riyaSays: "I found only 3 beads! How many should I buy from the shop?"
    },
    {
      level: 2,
      have: 5,
      target: 10,
      story: "Next round! Riya searched the garden and found only 5 beads. How many beads does she need to make 10?",
      question: "Found 5 beads. How many more to make 10?",
      riyaSays: "I found 5 beads in the garden! How many more to complete 10?"
    },
    {
      level: 3,
      have: 2,
      target: 10,
      story: "Oh, this time Riya got only 2 beads! How many more beads does she need to buy to make 10?",
      question: "Found only 2 beads. How many more to make 10?",
      riyaSays: "I got only 2 beads from under the desk! How many more do I need?"
    },
    {
      level: 4,
      have: 8,
      target: 10,
      story: "Great searching! Riya got 8 beads! How many beads does she need to complete her 10-bead bracelet?",
      question: "Found 8 beads. How many more to make 10?",
      riyaSays: "I found 8 shiny beads! How many more to make 10?"
    }
  ];

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [showStory, setShowStory] = useState(true);
  const [selectedAddend, setSelectedAddend] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentLevel = LEVELS[currentLevelIdx];
  const requiredBeads = currentLevel.target - currentLevel.have;

  // Handle clicking on beads during the intro count (1 to 10)
  const handleIntroBeadClick = (beadNum) => {
    playBeadClick();
    // Speak ONLY the bead number so child learns the counting sequence!
    speak(beadNum, 0.85);

    setCountedBeads(prev => {
      if (prev.includes(beadNum)) return prev;
      const next = [...prev, beadNum].sort((a, b) => a - b);
      if (next.length === 10) {
        setTimeout(() => {
          playSuccessChime();
          setStage('crazy_prompt');
        }, 600);
      }
      return next;
    });
  };

  // Trigger the crazy break
  const handleTriggerCrazy = () => {
    setIsSnapping(true);
    playBraceletSnap();
    setTimeout(() => {
      playScatter();
    }, 250);

    setTimeout(() => {
      setIsSnapping(false);
      setStage('crazy_break');
    }, 1200);
  };

  // Move from break to search
  const handleGoToSearch = () => {
    setStage('search_found');
  };

  // Move from search to shopkeeper
  const handleGoToShop = () => {
    setStage('shopkeeper_intro');
  };

  // Start the actual game levels from shopkeeper intro
  const handleStartLevels = () => {
    setCurrentLevelIdx(0);
    setSelectedAddend(null);
    setFeedback(null);
    setStage('playing_levels');
  };

  // Handle answer selection in the shop levels
  const handleSelectOption = (num) => {
    setSelectedAddend(num);
    playBeadClick();
    // Speak ONLY the clicked count so child remembers!
    speak(String(num), 0.85);

    if (num === requiredBeads) {
      playSuccessChime();
      setFeedback({
        type: 'success',
        text: `✨ Spot on! ${currentLevel.have} + ${num} = 10! The bracelet is complete and no beads were wasted!`
      });
      setStars(s => s + 2);

      setTimeout(() => {
        if (currentLevelIdx + 1 < LEVELS.length) {
          const nextIdx = currentLevelIdx + 1;
          setCurrentLevelIdx(nextIdx);
          setSelectedAddend(null);
          setFeedback(null);
        } else {
          playVictoryFanfare();
          setShowCelebration(true);
        }
      }, 1600);
    } else {
      playGentleBoing();
      const sum = currentLevel.have + num;
      if (num > requiredBeads) {
        setFeedback({
          type: 'error',
          text: `⚠️ Shopkeeper says: "Don't buy more beads, otherwise you will waste it!" ${currentLevel.have} + ${num} = ${sum} (more than 10). Try a smaller jar!`
        });
      } else {
        setFeedback({
          type: 'error',
          text: `🤔 ${currentLevel.have} + ${num} = ${sum} beads. Not quite enough to make 10! Pick a bigger jar.`
        });
      }
    }
  };

  const handleNextLevelFromModal = () => {
    setShowCelebration(false);
    setCurrentLevelIdx(0);
    setSelectedAddend(null);
    setFeedback(null);
    setStage('intro_count');
    setCountedBeads([]);
  };

  const handleReplayStory = () => {
    setShowCelebration(false);
    setSelectedAddend(null);
    setFeedback(null);
    setCountedBeads([]);
    setStage('intro_count');
  };

  // SVG palette for colorful beads
  const BEAD_COLORS = [
    '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#06b6d4', '#84cc16', '#a855f7', '#f97316'
  ];

  // Render SVG Bracelet for Intro Count
  const renderIntroBracelet = () => {
    const totalSlots = 10;
    const radius = 95;
    const centerX = 125;
    const centerY = 125;

    return (
      <svg width="250" height="250" viewBox="0 0 250 250" style={{ margin: '0 auto', display: 'block' }}>
        {/* Bracelet string */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="var(--clr-accent)"
          strokeWidth="5"
          strokeDasharray={isSnapping ? "10,20" : "none"}
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(232, 134, 74, 0.4))',
            transition: 'all 0.4s'
          }}
        />

        {Array.from({ length: totalSlots }).map((_, i) => {
          const beadNum = i + 1;
          const angle = (i / totalSlots) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const isCounted = countedBeads.includes(beadNum);
          const isNext = countedBeads.length + 1 === beadNum;

          return (
            <g
              key={beadNum}
              onClick={() => handleIntroBeadClick(beadNum)}
              style={{ cursor: 'pointer' }}
              className={isCounted ? 'anim-pop' : isNext ? 'anim-bounce' : ''}
            >
              <circle
                cx={x}
                cy={y}
                r={isCounted ? "14" : isNext ? "13" : "11"}
                fill={isCounted ? BEAD_COLORS[i % BEAD_COLORS.length] : 'var(--clr-surface)'}
                stroke={isNext ? '#fbbf24' : isCounted ? '#ffffff' : 'var(--clr-border)'}
                strokeWidth={isNext ? "3" : "2"}
                style={{
                  filter: isCounted
                    ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))'
                    : isNext
                    ? 'drop-shadow(0 0 8px #fbbf24)'
                    : 'none',
                  transition: 'all 0.25s'
                }}
              />
              <text
                x={x}
                y={y + 4.5}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill={isCounted ? "#ffffff" : isNext ? "var(--clr-accent)" : "var(--clr-text-soft)"}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {beadNum}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render SVG Bracelet for Game Levels
  const renderLevelBracelet = () => {
    const totalSlots = 10;
    const haveCount = currentLevel.have;
    const addedCount = selectedAddend === requiredBeads ? requiredBeads : 0;
    const radius = 95;
    const centerX = 125;
    const centerY = 125;

    return (
      <svg width="250" height="250" viewBox="0 0 250 250" style={{ margin: '0 auto', display: 'block' }}>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="var(--clr-border)"
          strokeWidth="4"
          strokeDasharray="6,4"
        />

        {Array.from({ length: totalSlots }).map((_, i) => {
          const angle = (i / totalSlots) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          const isHave = i < haveCount;
          const isAdded = i >= haveCount && i < haveCount + addedCount;

          return (
            <g key={i} className={isAdded ? 'anim-pop' : ''}>
              <circle
                cx={x}
                cy={y}
                r={isHave || isAdded ? "13" : "9"}
                fill={
                  isHave
                    ? BEAD_COLORS[i % BEAD_COLORS.length]
                    : isAdded
                    ? '#10b981'
                    : 'var(--clr-surface)'
                }
                stroke={isHave || isAdded ? '#ffffff' : 'var(--clr-border)'}
                strokeWidth={isHave || isAdded ? "2" : "1.5"}
                style={{
                  filter: isHave || isAdded ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))' : 'none',
                  transition: 'all 0.3s'
                }}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={isHave || isAdded ? "#ffffff" : "var(--clr-text-soft)"}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <QuizLayout
      title="Riya's Bracelet"
      subtitle="Help Riya count, fix her bracelet, and buy the exact beads without wasting any!"
      category="Addition & Number Bonds to 10"
      level={stage === 'playing_levels' ? currentLevel.level : 1}
      stars={stars}
      spec={spec}
      onBack={onBack}
      onOpenStory={() => setShowStory(true)}
    >
      <div style={{ width: '100%', maxWidth: '820px' }}>

        {/* ============================================================== */}
        {/* STAGE 1: INTRO COUNT (Riya has a bracelet, count 1 to 10)     */}
        {/* ============================================================== */}
        {stage === 'intro_count' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 20px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '2rem' }}>👧</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                color: 'var(--clr-text)',
                margin: 0
              }}>
                Riya has a bracelet!
              </h2>
            </div>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--clr-text)',
              maxWidth: '600px',
              margin: '0 auto 16px auto',
              lineHeight: 1.5
            }}>
              Tell me: <strong>How many bracelets does she have?</strong> She has <strong>1</strong> bracelet! 🌸
              <br />
              <strong>How many beads does she have in the bracelet?</strong> Let's count them together!
            </p>

            <div style={{
              background: 'rgba(232, 134, 74, 0.12)',
              border: '1px solid var(--clr-accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 18px',
              display: 'inline-block',
              marginBottom: '16px',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--clr-accent)'
            }}>
              📢 Say after me: <em>"Click 1, 2, 3... like this, till 10!"</em>
            </div>

            <div style={{ position: 'relative', margin: '10px 0' }}>
              {renderIntroBracelet()}
            </div>

            {/* Counter bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '12px'
            }}>
              <span style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--clr-text)'
              }}>
                Beads counted: {countedBeads.length} / 10
              </span>
              <button
                onClick={() => speak(String(countedBeads.length), 0.85)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--clr-border)',
                  background: 'var(--clr-surface)',
                  color: 'var(--clr-text)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔊 Listen Again
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGE 1B: CRAZY THING PROMPT ("Do you want to do a crazy thing?") */}
        {/* ============================================================== */}
        {stage === 'crazy_prompt' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-accent)',
            borderRadius: 'var(--radius)',
            padding: '30px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              color: 'var(--clr-text)',
              marginBottom: '12px'
            }}>
              All 10 beads counted!
            </h2>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--clr-accent)',
              marginBottom: '24px'
            }}>
              Do you want to do a crazy thing? 💥
            </p>

            <div style={{ margin: '16px 0' }}>
              {renderIntroBracelet()}
            </div>

            <button
              onClick={handleTriggerCrazy}
              disabled={isSnapping}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '16px 36px',
                fontSize: '1.3rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                transform: isSnapping ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              {isSnapping ? '💥 SNAP! Breaking...' : '💥 YES! Do the crazy thing! 💥'}
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGE 2: CRAZY BREAK (Bracelet breaks and beads scatter)       */}
        {/* ============================================================== */}
        {stage === 'crazy_break' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #ef4444',
            borderRadius: 'var(--radius)',
            padding: '30px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>💥 ⚡ 😲</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: '#ef4444',
              margin: '0 0 12px 0'
            }}>
              SNAP! The bracelet broke!
            </h2>

            {/* Scattered beads illustration */}
            <div style={{
              height: '140px',
              position: 'relative',
              background: 'var(--clr-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--clr-border)',
              margin: '20px auto',
              overflow: 'hidden'
            }}>
              {[
                { top: '20%', left: '15%', col: '#ec4899', rot: '25deg' },
                { top: '60%', left: '25%', col: '#8b5cf6', rot: '-40deg' },
                { top: '30%', left: '40%', col: '#3b82f6', rot: '15deg' },
                { top: '70%', left: '55%', col: '#10b981', rot: '75deg' },
                { top: '15%', left: '68%', col: '#f59e0b', rot: '-20deg' },
                { top: '50%', left: '80%', col: '#ef4444', rot: '45deg' },
                { top: '75%', left: '10%', col: '#06b6d4', rot: '-60deg' },
                { top: '25%', left: '88%', col: '#84cc16', rot: '30deg' },
                { top: '80%', left: '72%', col: '#a855f7', rot: '-15deg' },
                { top: '45%', left: '48%', col: '#f97316', rot: '80deg' }
              ].map((pos, idx) => (
                <div
                  key={idx}
                  className="anim-pop"
                  style={{
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: pos.col,
                    border: '2px solid #fff',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                    transform: `rotate(${pos.rot})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#fff'
                  }}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--clr-text)',
              marginBottom: '24px'
            }}>
              Oh no! All 10 beads scattered in every direction! Where did they go?
            </p>

            <button
              onClick={handleGoToSearch}
              style={{
                background: 'var(--clr-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '14px 32px',
                fontSize: '1.15rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-btn)'
              }}
            >
              🔍 Help Riya search for the beads!
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGE 3: SEARCH & FOUND (Searched, but found ONLY 3 beads!)     */}
        {/* ============================================================== */}
        {stage === 'search_found' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '30px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔍 😢</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--clr-text)',
              marginBottom: '12px'
            }}>
              Riya searched everywhere...
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'var(--clr-text)',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto 20px auto'
            }}>
              She searched under the table, behind the chairs, and under the rug...
              <br />
              ...but she found <strong>ONLY 3 BEADS!</strong>
            </p>

            {/* Found 3 beads display */}
            <div style={{
              display: 'inline-flex',
              gap: '16px',
              padding: '16px 28px',
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-accent)',
              borderRadius: 'var(--radius)',
              marginBottom: '24px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                Found beads:
              </span>
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: BEAD_COLORS[n - 1],
                    border: '2px solid #fff',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  {n}
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(232, 134, 74, 0.1)',
              border: '1px solid var(--clr-accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 20px',
              maxWidth: '620px',
              margin: '0 auto 24px auto',
              textAlign: 'left'
            }}>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--clr-text)', lineHeight: 1.5 }}>
                👧 <strong>Riya says:</strong> <em>"I want to make a 10-bead bracelet again! I must go to the bead shop to buy more beads. But I cannot buy more than that, otherwise it would be a waste!"</em>
              </p>
            </div>

            <button
              onClick={handleGoToShop}
              style={{
                background: 'var(--clr-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '14px 32px',
                fontSize: '1.2rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-btn)'
              }}
            >
              🏪 Visit the Bead Shop ➡️
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGE 4: SHOPKEEPER INTRO (Warning: Don't buy more beads!)    */}
        {/* ============================================================== */}
        {stage === 'shopkeeper_intro' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '30px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🏪 🧓</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--clr-text)',
              marginBottom: '12px'
            }}>
              The Bead Shop
            </h2>

            {/* Shopkeeper dialogue bubble */}
            <div style={{
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-accent)',
              borderRadius: 'var(--radius)',
              padding: '20px 24px',
              maxWidth: '600px',
              margin: '0 auto 24px auto',
              boxShadow: 'var(--shadow-card)',
              position: 'relative'
            }}>
              <p style={{
                margin: '0 0 10px 0',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--clr-text)'
              }}>
                🧓 Shopkeeper says:
              </p>
              <p style={{
                margin: 0,
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#ef4444',
                lineHeight: 1.5
              }}>
                "Don't buy more beads, otherwise you will waste it!"
              </p>
              <p style={{
                margin: '10px 0 0 0',
                fontSize: '0.95rem',
                color: 'var(--clr-text-soft)'
              }}>
                Buy exactly the number needed to reach 10 — no more, no less!
              </p>
            </div>

            <button
              onClick={handleStartLevels}
              style={{
                background: 'var(--clr-accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '16px 36px',
                fontSize: '1.25rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-btn)'
              }}
            >
              ✨ Start Making 10 Beads! ✨
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STAGE 5: PLAYING LEVELS (The 4 user levels: 3, 5, 2, 8)       */}
        {/* ============================================================== */}
        {stage === 'playing_levels' && (
          <div>
            {/* Level Selector Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '12px 18px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-accent)' }}>
                  LEVEL {currentLevel.level} OF {LEVELS.length}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  color: 'var(--clr-text)',
                  margin: '2px 0 0 0'
                }}>
                  Target: 10 Beads
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {LEVELS.map((lvl, idx) => (
                  <button
                    key={lvl.level}
                    onClick={() => {
                      setCurrentLevelIdx(idx);
                      setSelectedAddend(null);
                      setFeedback(null);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      background: currentLevelIdx === idx ? 'var(--clr-accent)' : 'var(--clr-surface)',
                      color: currentLevelIdx === idx ? '#fff' : 'var(--clr-text-soft)',
                      border: '1px solid var(--clr-border)',
                      cursor: 'pointer'
                    }}
                  >
                    L{lvl.level}: Found {lvl.have}
                  </button>
                ))}

                <button
                  onClick={handleReplayStory}
                  title="Watch the story again from the start"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: 'var(--clr-surface)',
                    color: 'var(--clr-text-soft)',
                    border: '1px solid var(--clr-border)',
                    cursor: 'pointer'
                  }}
                >
                  📖 Story
                </button>
              </div>
            </div>

            {/* Play Card */}
            <div style={{
              background: 'var(--clr-card)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center'
            }}>
              {/* Question Banner */}
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: 'var(--clr-text)',
                marginBottom: '8px'
              }}>
                {currentLevel.question}
              </div>

              <p style={{
                margin: '0 auto 16px auto',
                fontSize: '0.95rem',
                color: 'var(--clr-text-soft)',
                maxWidth: '560px'
              }}>
                👧 <em>"{currentLevel.riyaSays}"</em>
              </p>

              {/* Bracelet visual */}
              {renderLevelBracelet()}

              {/* Equation Box */}
              <div style={{
                margin: '16px auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--clr-surface)',
                border: '2px solid var(--clr-accent)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 24px',
                fontSize: '1.75rem',
                fontFamily: 'var(--font-kids)',
                fontWeight: 700,
                color: 'var(--clr-text)'
              }}>
                <span title="Found beads">{currentLevel.have}</span>
                <span style={{ color: 'var(--clr-accent)' }}>+</span>
                <span style={{
                  minWidth: '50px',
                  padding: '2px 12px',
                  borderRadius: '8px',
                  background: selectedAddend !== null ? 'var(--clr-input)' : 'rgba(232, 134, 74, 0.2)',
                  border: '2px dashed var(--clr-accent)',
                  color: selectedAddend === requiredBeads ? 'var(--clr-correct)' : 'var(--clr-accent)'
                }}>
                  {selectedAddend !== null ? selectedAddend : '?'}
                </span>
                <span>=</span>
                <span>10</span>
              </div>

              {/* Shopkeeper Reminder */}
              <div style={{
                fontSize: '0.88rem',
                color: 'var(--clr-text-soft)',
                marginBottom: '14px'
              }}>
                🧓 <em>"Remember: Don't buy more beads, otherwise you will waste it!"</em>
              </div>

              {/* Number Jars to choose from */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button
                    key={n}
                    onClick={() => handleSelectOption(n)}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: selectedAddend === n
                        ? n === requiredBeads ? 'var(--clr-correct)' : 'var(--clr-wrong)'
                        : 'var(--clr-surface)',
                      border: '2px solid var(--clr-border)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: selectedAddend === n ? '#ffffff' : 'var(--clr-text)',
                      boxShadow: 'var(--shadow-btn)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              {/* Feedback box */}
              {feedback && (
                <div className="anim-pop" style={{
                  marginTop: '18px',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: feedback.type === 'success' ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)',
                  color: feedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                  border: `1px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`
                }}>
                  {feedback.text}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Illustrated Game Story Screen before playing */}
      <GameStoryModal
        isOpen={showStory}
        onClose={() => setShowStory(false)}
        title="Riya and the Ten Magical Beads"
        icon="📿"
        badge="Making 10 Story"
        story="Riya made a lovely bracelet with ten shiny, colorful beads! But suddenly—SNAP! The string broke and beads scattered everywhere. Riya searched the floor and only found a few. Help Riya visit the bead shop to buy just enough beads to make ten again without wasting any!"
        buttonText="Next ➔ Count Riya's Beads!"
      />

      {showCelebration && (
        <CelebrationModal
          title="Bracelet Champion!"
          subtitle="Riya made all her 10-bead bracelets without wasting any beads!"
          stars={3}
          onNextLevel={handleNextLevelFromModal}
          onReplay={handleReplayStory}
          onHome={onBack}
          hasNextLevel={false}
        />
      )}
    </QuizLayout>
  );
}
