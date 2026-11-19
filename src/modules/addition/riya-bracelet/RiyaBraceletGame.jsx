import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playBeadClick, playSuccessChime, playGentleBoing } from '../../../core/soundEffects';
import spec from './spec.json';

export default function RiyaBraceletGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [caseIdx, setCaseIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [selectedAddend, setSelectedAddend] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const LEVEL_1_CASES = [
    { have: 3, target: 10, prompt: "Riya has 3 beads. How many more does she need to buy to make 10?", icon: "🧒" },
    { have: 7, target: 10, prompt: "Riya has 7 beads. How many more does she need to buy to make 10?", icon: "🧒" },
    { have: 4, target: 10, prompt: "Riya has 4 beads. How many more does she need to buy to make 10?", icon: "🧒" },
    { have: 8, target: 10, prompt: "Riya has 8 beads. How many more does she need to buy to make 10?", icon: "🧒" },
    { have: 5, target: 10, prompt: "Riya has 5 beads. How many more does she need to buy to make 10?", icon: "🧒" }
  ];

  const LEVEL_2_CASES = [
    { have: 3, target: 10, location: "Under the Table", prompt: "Under the Table: Riya found 3 beads! How many more are missing?", icon: "🪑" },
    { have: 6, target: 10, location: "Behind the Flowerpot", prompt: "Behind the Flowerpot: Riya found 6 beads! How many more are missing?", icon: "🪴" },
    { have: 1, target: 10, location: "Inside the Toy Box", prompt: "Inside the Toy Box: Riya found 1 bead! How many more are missing?", icon: "🧸" },
    { have: 8, target: 10, location: "Near the Bookshelf", prompt: "Near the Bookshelf: Riya found 8 beads! How many more are missing?", icon: "📚" }
  ];

  const LEVEL_3_CASES = [
    { have: 14, target: 20, prompt: "Making a big 20-bead necklace! Riya has 14 beads. How many more to make 20?", icon: "✨" },
    { have: 11, target: 20, prompt: "Riya has 11 sparkly beads. How many more does she need to reach 20?", icon: "✨" },
    { have: 16, target: 20, prompt: "Riya has 16 beads. How many more to complete the 20-bead crown?", icon: "👑" },
    { have: 9, target: 20, prompt: "Riya has 9 beads. How many more to make 20?", icon: "✨" }
  ];

  const currentCases = level === 1 ? LEVEL_1_CASES : level === 2 ? LEVEL_2_CASES : LEVEL_3_CASES;
  const currentQ = currentCases[caseIdx % currentCases.length];
  const requiredBeads = currentQ.target - currentQ.have;

  const handleSelectOption = (num) => {
    setSelectedAddend(num);
    playBeadClick();

    if (num === requiredBeads) {
      playSuccessChime();
      setFeedback({
        type: 'success',
        text: `Spot on! ${currentQ.have} + ${num} = ${currentQ.target}! The bracelet is complete!`
      });
      setStars(s => s + 2);

      setTimeout(() => {
        if (caseIdx + 1 < currentCases.length) {
          setCaseIdx(c => c + 1);
          setSelectedAddend(null);
          setFeedback(null);
        } else {
          setShowCelebration(true);
        }
      }, 1200);
    } else {
      playGentleBoing();
      const diff = currentQ.have + num;
      setFeedback({
        type: 'error',
        text: num > requiredBeads
          ? `Too many beads! ${currentQ.have} + ${num} = ${diff} (more than ${currentQ.target}). Try a smaller number!`
          : `Not quite enough! ${currentQ.have} + ${num} = ${diff} (needs ${currentQ.target}). Try adding a few more!`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setSelectedAddend(null);
    setFeedback(null);
    setCaseIdx(0);
    if (level < 3) {
      setLevel(l => l + 1);
    } else {
      setLevel(1);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setSelectedAddend(null);
    setFeedback(null);
    setCaseIdx(0);
  };

  const renderBracelet = () => {
    const totalSlots = currentQ.target;
    const haveCount = currentQ.have;
    const addedCount = selectedAddend === requiredBeads ? requiredBeads : 0;
    const radius = 100;
    const centerX = 130;
    const centerY = 130;

    const BEAD_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

    return (
      <svg width="260" height="260" viewBox="0 0 260 260" style={{ margin: '0 auto', display: 'block' }}>
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
                r={isHave || isAdded ? "11" : "8"}
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
                  filter: isHave || isAdded ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
                  transition: 'all 0.3s'
                }}
              />
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize="9"
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
      title="Make My Bracelet — Number Bonds to 10"
      subtitle="Help Riya find and buy the missing beads to finish her bracelet!"
      category="Number Bonds"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>
        {/* Level Tabs */}
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
              {level === 1 ? '🏪 The Bead Shop' : level === 2 ? '🔍 Room Hunt Adventure' : '👑 Master 20-Bead Necklace'}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Case {caseIdx + 1} of {currentCases.length} • Target: {currentQ.target} Beads
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setLevel(1); handleReplay(); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: level === 1 ? 'var(--clr-accent)' : 'var(--clr-surface)',
                color: level === 1 ? '#fff' : 'var(--clr-text-soft)',
                border: '1px solid var(--clr-border)'
              }}
            >
              Lvl 1: Shop (10)
            </button>
            <button
              onClick={() => { setLevel(2); handleReplay(); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: level === 2 ? 'var(--clr-accent)' : 'var(--clr-surface)',
                color: level === 2 ? '#fff' : 'var(--clr-text-soft)',
                border: '1px solid var(--clr-border)'
              }}
            >
              Lvl 2: Hunt (10)
            </button>
            <button
              onClick={() => { setLevel(3); handleReplay(); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: level === 3 ? 'var(--clr-accent)' : 'var(--clr-surface)',
                color: level === 3 ? '#fff' : 'var(--clr-text-soft)',
                border: '1px solid var(--clr-border)'
              }}
            >
              Lvl 3: Mega (20)
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
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'var(--clr-text)',
            marginBottom: '16px'
          }}>
            {currentQ.location && (
              <span style={{
                background: 'var(--clr-accent-soft)',
                color: 'var(--clr-accent)',
                padding: '2px 10px',
                borderRadius: '12px',
                marginRight: '8px',
                fontSize: '0.9rem'
              }}>
                📍 {currentQ.location}
              </span>
            )}
            {currentQ.prompt}
          </div>

          {renderBracelet()}

          <div style={{
            margin: '20px auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--clr-surface)',
            border: '2px solid var(--clr-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 28px',
            fontSize: '1.8rem',
            fontFamily: 'var(--font-kids)',
            fontWeight: 700,
            color: 'var(--clr-text)'
          }}>
            <span>{currentQ.have}</span>
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
            <span>{currentQ.target}</span>
          </div>

          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '12px' }}>
              {level === 1 ? 'Select a bead jar from the shop:' : 'Pick the missing number of beads:'}
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px'
            }}>
              {(level === 3
                ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]
                : [1, 2, 3, 4, 5, 6, 7, 8, 9]
              ).map(n => (
                <button
                  key={n}
                  onClick={() => handleSelectOption(n)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: selectedAddend === n
                      ? n === requiredBeads ? 'var(--clr-correct)' : 'var(--clr-wrong)'
                      : 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: selectedAddend === n ? '#ffffff' : 'var(--clr-text)',
                    boxShadow: 'var(--shadow-btn)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span>{n}</span>
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className="anim-pop" style={{
              marginTop: '20px',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '1rem',
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

      {showCelebration && (
        <CelebrationModal
          title="Bracelet Master!"
          subtitle={`Riya completed all her bracelets and mastered number bonds to ${currentQ.target}!`}
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
