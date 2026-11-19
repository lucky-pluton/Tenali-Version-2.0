import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playSuccessChime, playGentleBoing, playPop } from '../../../core/soundEffects';
import spec from './spec.json';

// Child-friendly slow speech synthesis helper
function speak(text, rate = 0.82, pitch = 1.15) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

export default function SunChariotWheelGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);
  const [wheelIdx, setWheelIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Targets are 6, 8, and 9 (Target 7 is reserved for the Sum 7 Dice Game)
  const WHEEL_DATA = [
    {
      target: 6,
      name: "Chariot Wheel of 6",
      spokes: [
        { known: 1, userFilled: null, correct: 5 },
        { known: 5, userFilled: null, correct: 1 },
        { known: 2, userFilled: null, correct: 4 },
        { known: 4, userFilled: null, correct: 2 },
        { known: 3, userFilled: null, correct: 3 },
        { known: 6, userFilled: null, correct: 0 }
      ]
    },
    {
      target: 8,
      name: "Chariot Wheel of 8",
      spokes: [
        { known: 7, userFilled: null, correct: 1 },
        { known: 1, userFilled: null, correct: 7 },
        { known: 2, userFilled: null, correct: 6 },
        { known: 6, userFilled: null, correct: 2 },
        { known: 3, userFilled: null, correct: 5 },
        { known: 5, userFilled: null, correct: 3 },
        { known: 4, userFilled: null, correct: 4 }
      ]
    },
    {
      target: 9,
      name: "Konark Sun Chariot Wheel (Target 9)",
      spokes: [
        { known: 1, userFilled: null, correct: 8 },
        { known: 8, userFilled: null, correct: 1 },
        { known: 2, userFilled: null, correct: 7 },
        { known: 7, userFilled: null, correct: 2 },
        { known: 3, userFilled: null, correct: 6 },
        { known: 6, userFilled: null, correct: 3 },
        { known: 4, userFilled: null, correct: 5 },
        { known: 5, userFilled: null, correct: 4 }
      ]
    }
  ];

  const currentWheel = WHEEL_DATA[wheelIdx % WHEEL_DATA.length];
  const [spokesState, setSpokesState] = useState(() => currentWheel.spokes);
  const [activeSpokeIdx, setActiveSpokeIdx] = useState(0);

  const handleSelectNumber = (num) => {
    playPop();
    const curSpoke = spokesState[activeSpokeIdx];

    if (num === curSpoke.correct) {
      playSuccessChime();
      speak(`${curSpoke.known} plus ${num} equals ${currentWheel.target}!`);
      const updated = [...spokesState];
      updated[activeSpokeIdx] = { ...curSpoke, userFilled: num };
      setSpokesState(updated);
      setStars(s => s + 1);

      setFeedback({
        type: 'success',
        text: `✨ Wonderful! ${curSpoke.known} + ${num} = ${currentWheel.target}!`
      });

      const nextUnfilled = updated.findIndex((s, idx) => idx > activeSpokeIdx && s.userFilled === null);
      if (nextUnfilled !== -1) {
        setActiveSpokeIdx(nextUnfilled);
      } else {
        const anyUnfilled = updated.findIndex(s => s.userFilled === null);
        if (anyUnfilled !== -1) {
          setActiveSpokeIdx(anyUnfilled);
        } else {
          speak(`Hooray! You completed all spokes of the Chariot Wheel of ${currentWheel.target}!`);
          setTimeout(() => {
            setShowCelebration(true);
          }, 800);
        }
      }
    } else {
      playGentleBoing();
      speak(`Oops! ${curSpoke.known} plus ${num} is ${curSpoke.known + num}, but the sun hub needs ${currentWheel.target}. Try again!`);
      setFeedback({
        type: 'error',
        text: `Oops! ${curSpoke.known} + ${num} = ${curSpoke.known + num}, but the chariot hub needs ${currentWheel.target}!`
      });
    }
  };

  const handleNextWheel = () => {
    setShowCelebration(false);
    setFeedback(null);
    const nextIdx = (wheelIdx + 1) % WHEEL_DATA.length;
    setWheelIdx(nextIdx);
    setSpokesState(WHEEL_DATA[nextIdx].spokes);
    setActiveSpokeIdx(0);
    setLevel(nextIdx + 1);
    speak(`Welcome to the ${WHEEL_DATA[nextIdx].name}!`);
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setFeedback(null);
    setSpokesState(currentWheel.spokes);
    setActiveSpokeIdx(0);
    speak(`Let's roll the ${currentWheel.name} again!`);
  };

  const renderWheel = () => {
    const spokeCount = spokesState.length;
    const centerX = 200;
    const centerY = 200;
    const rimRadius = 140;

    return (
      <svg width="400" height="400" viewBox="0 0 400 400" style={{ margin: '0 auto', display: 'block' }}>
        {/* Outer Wheel Rim */}
        <circle
          cx={centerX}
          cy={centerY}
          r={rimRadius}
          fill="none"
          stroke="var(--clr-border)"
          strokeWidth="12"
          strokeDasharray="14,6"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={rimRadius - 20}
          fill="none"
          stroke="var(--clr-border)"
          strokeWidth="2"
        />

        {/* Spokes */}
        {spokesState.map((spoke, idx) => {
          const angle = (idx / spokeCount) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + rimRadius * Math.cos(angle);
          const y = centerY + rimRadius * Math.sin(angle);
          const isActive = idx === activeSpokeIdx;
          const isFilled = spoke.userFilled !== null;

          return (
            <g key={idx}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={isActive ? "var(--clr-accent)" : "var(--clr-border)"}
                strokeWidth={isActive ? "4" : "2"}
                strokeDasharray={isActive ? "none" : "4,2"}
              />

              <circle
                cx={x}
                cy={y}
                r="26"
                fill={
                  isFilled
                    ? "var(--clr-surface)"
                    : isActive
                    ? "var(--clr-accent-soft)"
                    : "var(--clr-card)"
                }
                stroke={isActive ? "var(--clr-accent)" : isFilled ? "var(--clr-correct)" : "var(--clr-border)"}
                strokeWidth={isActive ? "3" : "2"}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(232, 134, 74, 0.6))' : 'none'
                }}
                onClick={() => setActiveSpokeIdx(idx)}
              />

              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize="13"
                fontWeight="800"
                fill={isFilled ? "var(--clr-correct)" : isActive ? "var(--clr-accent)" : "var(--clr-text)"}
              >
                {spoke.known}+{isFilled ? spoke.userFilled : '?'}
              </text>
            </g>
          );
        })}

        {/* Central Sun Hub */}
        <circle
          cx={centerX}
          cy={centerY}
          r="46"
          fill="var(--clr-accent)"
          style={{ filter: 'drop-shadow(0 0 16px rgba(232, 134, 74, 0.5))' }}
        />
        <text
          x={centerX}
          y={centerY + 11}
          textAnchor="middle"
          fontSize="34"
          fontWeight="800"
          fontFamily="var(--font-kids)"
          fill="#ffffff"
        >
          {currentWheel.target}
        </text>
      </svg>
    );
  };

  const activeSpoke = spokesState[activeSpokeIdx];

  return (
    <QuizLayout
      title="Konark Sun Chariot — Number Pair Wheels"
      subtitle="Complete every spoke so both numbers add up to the central sun hub!"
      category="Addition & Fact Families"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>
        {/* Header Wheel Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '14px 20px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: 'var(--clr-text)',
              margin: 0
            }}>
              {currentWheel.name}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Completed: {spokesState.filter(s => s.userFilled !== null).length} / {spokesState.length} Spokes
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {WHEEL_DATA.map((w, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setWheelIdx(idx);
                  setSpokesState(WHEEL_DATA[idx].spokes);
                  setActiveSpokeIdx(0);
                  setLevel(idx + 1);
                  setFeedback(null);
                  speak(`Switched to Hub ${w.target}`);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: wheelIdx === idx ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: wheelIdx === idx ? '#fff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                Hub {w.target}
              </button>
            ))}
          </div>
        </div>

        {/* Play Area */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {renderWheel()}

          {/* Active Spoke Prompt */}
          <div style={{
            margin: '20px auto 14px auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--clr-surface)',
            border: '2px solid var(--clr-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 24px',
            fontSize: '1.6rem',
            fontFamily: 'var(--font-kids)',
            fontWeight: 700,
            color: 'var(--clr-text)'
          }}>
            <span>{activeSpoke.known}</span>
            <span style={{ color: 'var(--clr-accent)' }}>+</span>
            <span style={{
              minWidth: '40px',
              padding: '2px 10px',
              borderRadius: '8px',
              background: 'rgba(232, 134, 74, 0.2)',
              border: '2px dashed var(--clr-accent)',
              color: 'var(--clr-accent)'
            }}>
              {activeSpoke.userFilled !== null ? activeSpoke.userFilled : '?'}
            </span>
            <span>=</span>
            <span>{currentWheel.target}</span>
          </div>

          <div style={{ marginTop: '14px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-soft)', marginBottom: '10px' }}>
              Choose the matching number for this spoke to make {currentWheel.target}:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
              {Array.from({ length: currentWheel.target + 1 }).map((_, n) => (
                <button
                  key={n}
                  onClick={() => handleSelectNumber(n)}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: 'var(--clr-text)',
                    boxShadow: 'var(--shadow-btn)',
                    cursor: 'pointer'
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className="anim-pop" style={{
              marginTop: '16px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: feedback.type === 'success' ? 'var(--clr-correct-bg)' : feedback.type === 'error' ? 'var(--clr-wrong-bg)' : 'var(--clr-accent-soft)',
              color: feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)',
              border: `1px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}`
            }}>
              {feedback.text}
            </div>
          )}
        </div>
      </div>

      {showCelebration && (
        <CelebrationModal
          title="Sun Chariot Completed!"
          subtitle={`You filled every spoke on the Chariot Wheel of ${currentWheel.target}!`}
          stars={3}
          onNextLevel={handleNextWheel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={wheelIdx < WHEEL_DATA.length - 1}
        />
      )}
    </QuizLayout>
  );
}
