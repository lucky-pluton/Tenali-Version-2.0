import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playSuccessChime, playGentleBoing } from '../../../core/soundEffects';
import spec from './spec.json';

export default function SchoolBusCountdownGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  const LEVEL_1_STOPS = [
    {
      stopName: "Green Meadow Park",
      verse: "Five little children, raise your hand! Here comes your stand. One steps out with a roar...",
      rhymeTail: "Now, we are four!",
      initialCount: 5,
      leaving: 1,
      targetRemaining: 4
    },
    {
      stopName: "The Mango Tree",
      verse: "Four little children, raise your hand! Here comes your stand. One steps out near a tree...",
      rhymeTail: "Now, we are three!",
      initialCount: 4,
      leaving: 1,
      targetRemaining: 3
    },
    {
      stopName: "Shoe Maker Shop",
      verse: "Three little children, raise your hand! Here comes your stand. One steps out with shining shoe...",
      rhymeTail: "Now, we are two!",
      initialCount: 3,
      leaving: 1,
      targetRemaining: 2
    },
    {
      stopName: "Sunny Hillside",
      verse: "Two little children, raise your hand! Here comes your stand. One steps out looking at the sun...",
      rhymeTail: "Now, remains one!",
      initialCount: 2,
      leaving: 1,
      targetRemaining: 1
    },
    {
      stopName: "Final School Terminal",
      verse: "One little child, raise your hand! Here comes your stand. Last steps out having much fun...",
      rhymeTail: "Now, there are none! (0)",
      initialCount: 1,
      leaving: 1,
      targetRemaining: 0
    }
  ];

  const LEVEL_2_STOPS = [
    {
      stopName: "Museum Stop",
      verse: "Ten children on the excursion bus! 2 step out to see dinosaur fossils.",
      rhymeTail: "10 - 2 = 8 children remain!",
      initialCount: 10,
      leaving: 2,
      targetRemaining: 8
    },
    {
      stopName: "Planetarium Stop",
      verse: "Eight children on board! 3 step out to view the stars.",
      rhymeTail: "8 - 3 = 5 children remain!",
      initialCount: 8,
      leaving: 3,
      targetRemaining: 5
    },
    {
      stopName: "Botanical Garden",
      verse: "Five children smiling! 2 step out to smell the flowers.",
      rhymeTail: "5 - 2 = 3 children remain!",
      initialCount: 5,
      leaving: 2,
      targetRemaining: 3
    },
    {
      stopName: "Final Terminal",
      verse: "Three children left! All 3 step out to go home.",
      rhymeTail: "3 - 3 = 0 (none left)!",
      initialCount: 3,
      leaving: 3,
      targetRemaining: 0
    }
  ];

  const currentStops = level === 1 ? LEVEL_1_STOPS : LEVEL_2_STOPS;
  const [stopIdx, setStopIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  const cur = currentStops[stopIdx];

  const handleSelectAnswer = (ans) => {
    setUserAnswer(ans);
    if (ans === cur.targetRemaining) {
      playSuccessChime();
      setDoorOpen(true);
      setStars(s => s + 2);
      setFeedback({
        type: 'success',
        text: `Correct! ${cur.initialCount} - ${cur.leaving} = ${cur.targetRemaining}! ${cur.rhymeTail}`
      });

      setTimeout(() => {
        setDoorOpen(false);
        if (stopIdx + 1 < currentStops.length) {
          setStopIdx(s => s + 1);
          setUserAnswer(null);
          setFeedback(null);
        } else {
          setShowCelebration(true);
        }
      }, 1500);
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Not quite! Count the children left on the bus: ${cur.initialCount} minus ${cur.leaving}.`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setUserAnswer(null);
    setFeedback(null);
    setStopIdx(0);
    setLevel(l => (l === 1 ? 2 : 1));
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setUserAnswer(null);
    setFeedback(null);
    setStopIdx(0);
  };

  return (
    <QuizLayout
      title="Five Little Children — School Bus Countdown"
      subtitle="Follow the school bus from stop to stop and practice subtraction rhymes!"
      category="Subtraction & Rhymes"
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
              🚏 Stop {stopIdx + 1}: {cur.stopName}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Stepwise Countdown: {cur.initialCount} ➔ {cur.targetRemaining}
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
              Rhyme Bus (5 Kids)
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
              Tour Bus (10 Kids)
            </button>
          </div>
        </div>

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
            background: '#fbbf24',
            border: '4px solid #d97706',
            borderRadius: '24px 40px 16px 16px',
            padding: '20px 24px',
            maxWidth: '520px',
            margin: '0 auto 24px auto',
            boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <div style={{
              background: '#1e293b',
              color: '#fbbf24',
              fontFamily: 'var(--font-kids)',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.1em',
              padding: '4px 16px',
              borderRadius: '6px',
              display: 'inline-block',
              marginBottom: '14px'
            }}>
              SCHOOL BUS
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              background: '#0284c7',
              border: '3px solid #0369a1',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              {Array.from({ length: cur.initialCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '2rem',
                    background: '#e0f2fe',
                    borderRadius: '8px',
                    padding: '4px',
                    filter: i >= cur.targetRemaining && doorOpen ? 'opacity(0.3)' : 'none',
                    transition: 'opacity 0.4s'
                  }}
                >
                  🧒
                </div>
              ))}
              {cur.initialCount === 0 && (
                <span style={{ color: '#fff', fontWeight: 600 }}>Empty Bus</span>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 40px',
              margin: '-32px 0 -36px 0'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e293b', border: '5px solid #64748b' }} />
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e293b', border: '5px solid #64748b' }} />
            </div>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px 20px',
            fontSize: '1.15rem',
            fontFamily: 'var(--font-display)',
            color: 'var(--clr-text)',
            marginBottom: '20px',
            lineHeight: 1.5
          }}>
            "{cur.verse}"
          </div>

          <div style={{
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
            color: 'var(--clr-text)',
            marginBottom: '20px'
          }}>
            <span>{cur.initialCount}</span>
            <span style={{ color: 'var(--clr-wrong)' }}>-</span>
            <span>{cur.leaving}</span>
            <span>=</span>
            <span style={{
              minWidth: '50px',
              padding: '2px 14px',
              borderRadius: '8px',
              background: userAnswer !== null ? 'var(--clr-input)' : 'rgba(232, 134, 74, 0.2)',
              border: '2px dashed var(--clr-accent)',
              color: userAnswer === cur.targetRemaining ? 'var(--clr-correct)' : 'var(--clr-accent)'
            }}>
              {userAnswer !== null ? userAnswer : '?'}
            </span>
          </div>

          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '12px' }}>
              How many children are still on the bus?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {(level === 1 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(num => (
                <button
                  key={num}
                  onClick={() => handleSelectAnswer(num)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: userAnswer === num
                      ? num === cur.targetRemaining ? 'var(--clr-correct)' : 'var(--clr-wrong)'
                      : 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: userAnswer === num ? '#fff' : 'var(--clr-text)',
                    boxShadow: 'var(--shadow-btn)'
                  }}
                >
                  {num}
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
          title="Countdown Complete!"
          subtitle="All students safely reached home and you mastered subtraction counting down to ZERO!"
          stars={3}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={level < 2}
        />
      )}
    </QuizLayout>
  );
}
