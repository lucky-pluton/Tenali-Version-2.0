import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import { playSuccessChime, playGentleBoing } from '../../../core/soundEffects';
import spec from './spec.json';
import { Volume2, ChevronRight, RotateCcw } from 'lucide-react';

// Child-friendly slow speech synthesis matching Aarav and Riya modules
function speak(text, rate = 0.82, pitch = 1.1) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore audio error
    }
  }
}

// Landmark and kid configurations
const KID_AVATARS = ['🧒', '👧', '👦', '🧑', '👧🏽', '👦🏾', '🧒🏻', '👧🏼', '👦🏿', '🧒🏼'];

export default function SchoolBusCountdownGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);
  const [showStory, setShowStory] = useState(true);

  // Level 1 follows the exact NCERT textbook poem from Grade 1 (Screenshot 2026-11-19 131202.png)
  const LEVEL_1_STOPS = [
    {
      stopName: "Cozy Red Cottage",
      landmarkIcon: "🏡",
      landmarkDetail: "Red Roof House",
      poemLines: [
        "Five little children",
        "Raise your hand",
        "Here comes your stand",
        "One steps out, with a roar..."
      ],
      rhymeTail: "Now, we are four! (4)",
      spokenTail: "Now, we are four!",
      initialCount: 5,
      leaving: 1,
      targetRemaining: 4
    },
    {
      stopName: "The Shady Tree",
      landmarkIcon: "🌳",
      landmarkDetail: "Big Mango Tree",
      poemLines: [
        "Four little children",
        "Raise your hand",
        "Here comes your stand",
        "One steps out, near a tree..."
      ],
      rhymeTail: "Now, we are three! (3)",
      spokenTail: "Now, we are three!",
      initialCount: 4,
      leaving: 1,
      targetRemaining: 3
    },
    {
      stopName: "Cobbler's Shop",
      landmarkIcon: "👞",
      landmarkDetail: "Shoe Maker Shop",
      poemLines: [
        "Three little children",
        "Raise your hand",
        "Here comes your stand",
        "One steps out, with shining shoe..."
      ],
      rhymeTail: "Now, we are two! (2)",
      spokenTail: "Now, we are two!",
      initialCount: 3,
      leaving: 1,
      targetRemaining: 2
    },
    {
      stopName: "Sunny Hillside",
      landmarkIcon: "☀️",
      landmarkDetail: "Warm Golden Sun",
      poemLines: [
        "Two little children",
        "Raise your hand",
        "Here comes your stand",
        "One steps out, looking at the sun..."
      ],
      rhymeTail: "Now, remains one! (1)",
      spokenTail: "Now, remains one!",
      initialCount: 2,
      leaving: 1,
      targetRemaining: 1
    },
    {
      stopName: "School Terminal",
      landmarkIcon: "🏫",
      landmarkDetail: "School Gate & Bell",
      poemLines: [
        "One little child",
        "Raise your hand",
        "Here comes your stand",
        "Last steps out, having much fun..."
      ],
      rhymeTail: "Now, there are none! (0)",
      spokenTail: "Now, there are none! Zero!",
      initialCount: 1,
      leaving: 1,
      targetRemaining: 0
    }
  ];

  const LEVEL_2_STOPS = [
    {
      stopName: "Dinosaur Museum",
      landmarkIcon: "🦕",
      landmarkDetail: "Museum Gate",
      poemLines: [
        "Ten children on the excursion bus!",
        "Raise your hands and see the sights.",
        "Two step out to see dinosaur fossils..."
      ],
      rhymeTail: "10 - 2 = 8 children remain!",
      spokenTail: "Ten minus two equals eight!",
      initialCount: 10,
      leaving: 2,
      targetRemaining: 8
    },
    {
      stopName: "Starlit Planetarium",
      landmarkIcon: "🪐",
      landmarkDetail: "Observatory Dome",
      poemLines: [
        "Eight children looking at the sky!",
        "Three step out to view twinkling stars..."
      ],
      rhymeTail: "8 - 3 = 5 children remain!",
      spokenTail: "Eight minus three equals five!",
      initialCount: 8,
      leaving: 3,
      targetRemaining: 5
    },
    {
      stopName: "Botanical Rose Garden",
      landmarkIcon: "🌸",
      landmarkDetail: "Flower Garden",
      poemLines: [
        "Five smiling children on board!",
        "Two step out to smell fragrant roses..."
      ],
      rhymeTail: "5 - 2 = 3 children remain!",
      spokenTail: "Five minus two equals three!",
      initialCount: 5,
      leaving: 2,
      targetRemaining: 3
    },
    {
      stopName: "Home Terminal",
      landmarkIcon: "🏡",
      landmarkDetail: "Happy Village",
      poemLines: [
        "Three children left to go home!",
        "All three step out to their families..."
      ],
      rhymeTail: "3 - 3 = 0 (Now there are none!)",
      spokenTail: "Three minus three equals zero! Now, there are none!",
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
  const [disembarking, setDisembarking] = useState(false);

  const cur = currentStops[stopIdx];

  const handleSelectAnswer = (ans) => {
    setUserAnswer(ans);
    // Directly count the selected number aloud so child remembers!
    speak(String(ans), 0.85);

    if (ans === cur.targetRemaining) {
      playSuccessChime();
      setDisembarking(true);
      setStars(s => s + 2);
      setFeedback({
        type: 'success',
        text: `🎉 Correct! ${cur.initialCount} - ${cur.leaving} = ${cur.targetRemaining}! ${cur.rhymeTail}`
      });

      setTimeout(() => {
        setDisembarking(false);
        if (stopIdx + 1 < currentStops.length) {
          setStopIdx(s => s + 1);
          setUserAnswer(null);
          setFeedback(null);
        } else {
          setShowCelebration(true);
        }
      }, 1800);
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Count again! There were ${cur.initialCount} children, and ${cur.leaving} stepped out.`
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
      title="Five Little Children"
      subtitle="Chant the school bus poem and discover subtraction down to zero!"
      category="Subtraction & Rhymes"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
      onOpenStory={() => setShowStory(true)}
    >
      <div style={{ width: '100%', maxWidth: '820px' }}>
        {/* Top Control Bar: Stop Info & Level Switcher */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '12px 18px',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              color: 'var(--clr-text)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🚏 Stop {stopIdx + 1} of {currentStops.length}:</span>
              <span style={{ color: 'var(--clr-accent)' }}>{cur.stopName}</span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Countdown progress: {cur.initialCount} ➔ {cur.targetRemaining}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => { setLevel(1); handleReplay(); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: level === 1 ? 'var(--clr-accent)' : 'var(--clr-surface)',
                color: level === 1 ? '#fff' : 'var(--clr-text-soft)',
                border: '1px solid var(--clr-border)',
                cursor: 'pointer'
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
                border: '1px solid var(--clr-border)',
                cursor: 'pointer'
              }}
            >
              Tour Bus (10 Kids)
            </button>
          </div>
        </div>

        {/* Main Stage: Road, Scenery & Animated Yellow School Bus */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {/* Animated Landscape Stage */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 50%, #86efac 52%, #4ade80 75%, #334155 77%, #1e293b 100%)',
            borderRadius: '20px',
            padding: '24px 16px 16px 16px',
            border: '3px solid #38bdf8',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.15)',
            marginBottom: '22px',
            overflow: 'hidden'
          }}>
            {/* Sun / Clouds in Sky */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '24px',
              fontSize: '2rem',
              animation: 'spin 20s linear infinite'
            }}>
              ☀️
            </div>
            <div style={{ position: 'absolute', top: '16px', left: '30px', fontSize: '1.6rem', opacity: 0.85 }}>
              ☁️
            </div>

            {/* Landmark Destination Display */}
            <div style={{
              position: 'absolute',
              top: '32px',
              right: '36px',
              textAlign: 'center',
              zIndex: 2
            }}>
              <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}>
                {cur.landmarkIcon}
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1e293b',
                background: 'rgba(255,255,255,0.9)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1'
              }}>
                {cur.landmarkDetail}
              </div>
            </div>

            {/* Cheerful Yellow School Bus (modeled after NCERT illustration) */}
            <div style={{
              background: '#f59e0b',
              border: '4px solid #b45309',
              borderRadius: '28px 48px 16px 16px',
              padding: '16px 18px',
              maxWidth: '460px',
              margin: '20px auto 14px 20px',
              boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
              position: 'relative',
              zIndex: 3
            }}>
              {/* Red Header Sign matching textbook: "SCHOOL BUS" */}
              <div style={{
                background: '#dc2626',
                border: '2px solid #991b1b',
                color: '#ffffff',
                fontFamily: 'var(--font-kids)',
                fontWeight: 800,
                fontSize: '0.95rem',
                letterSpacing: '0.12em',
                padding: '3px 18px',
                borderRadius: '6px',
                display: 'inline-block',
                marginBottom: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                🚌 SCHOOL BUS
              </div>

              {/* Windows Area with Children */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                background: '#0284c7',
                border: '3px solid #0369a1',
                borderRadius: '12px',
                padding: '10px 12px',
                marginBottom: '12px',
                minHeight: '68px',
                alignItems: 'center',
                boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.3)'
              }}>
                {cur.initialCount === 0 ? (
                  <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                    Bus is Empty! 0 Children
                  </span>
                ) : (
                  Array.from({ length: cur.initialCount }).map((_, i) => {
                    const isExiting = i >= cur.targetRemaining;
                    const avatar = KID_AVATARS[i % KID_AVATARS.length];
                    return (
                      <div
                        key={i}
                        onClick={() => speak(String(i + 1), 0.85)}
                        style={{
                          fontSize: '1.9rem',
                          background: isExiting && disembarking ? 'rgba(255, 237, 213, 0.4)' : '#e0f2fe',
                          border: '2px solid #38bdf8',
                          borderRadius: '8px',
                          padding: '3px 6px',
                          cursor: 'pointer',
                          transform: isExiting && disembarking ? 'translateY(18px) scale(0.7)' : 'scale(1)',
                          opacity: isExiting && disembarking ? 0.3 : 1,
                          transition: 'all 0.5s ease'
                        }}
                        title={`Child ${i + 1} - click to count`}
                      >
                        {avatar}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bus Front Face: Cheerful Eyes & Smiling Bumper Grill */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 12px'
              }}>
                {/* Door Area with exit step */}
                <div style={{
                  background: '#fef08a',
                  border: '2px solid #ca8a04',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#854d0e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>🚪 Exit Door</span>
                </div>

                {/* Friendly Bus Eyes & Grill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fef08a',
                  border: '2px solid #ca8a04',
                  borderRadius: '10px',
                  padding: '2px 8px'
                }}>
                  <span style={{ fontSize: '1rem' }}>👀</span>
                  <span style={{ fontSize: '0.85rem' }}>😃</span>
                </div>
              </div>

              {/* Wheels */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 32px',
                margin: '10px 0 -34px 0'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  border: '4px solid #64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 900
                }}>
                  ⚙️
                </div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  border: '4px solid #64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 900
                }}>
                  ⚙️
                </div>
              </div>
            </div>

            {/* Sidewalk & Stepping-Out Disembark Animation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '48px',
              minHeight: '60px',
              position: 'relative',
              zIndex: 4
            }}>
              {disembarking && (
                <div
                  className="anim-pop"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    border: '2px solid #10b981'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>🎒🧒👋</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#047857' }}>
                      Step out!
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                      Safe at {cur.stopName}!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Asphalt Road with White dashed divider */}
            <div style={{
              height: '18px',
              borderTop: '2px dashed #94a3b8',
              margin: '8px -16px -16px -16px'
            }} />
          </div>

          {/* Stanza Verse Presentation (Poem format matching NCERT page 58) */}
          <div style={{
            background: 'var(--clr-surface)',
            border: '2px solid var(--clr-border)',
            borderRadius: '16px',
            padding: '16px 20px',
            maxWidth: '540px',
            margin: '0 auto 20px auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--clr-accent)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px'
            }}>
              <span>📜 NCERT Poem Rhyme</span>
            </div>

            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.18rem',
              lineHeight: 1.6,
              color: 'var(--clr-text)',
              fontStyle: 'italic'
            }}>
              {cur.poemLines.map((line, idx) => (
                <div key={idx} style={{ margin: '2px 0' }}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Subtraction Sentence Box */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--clr-surface)',
            border: '2px solid var(--clr-accent)',
            borderRadius: 'var(--radius)',
            padding: '10px 24px',
            fontSize: '1.7rem',
            fontFamily: 'var(--font-kids)',
            fontWeight: 700,
            color: 'var(--clr-text)',
            marginBottom: '18px',
            boxShadow: 'var(--shadow-btn)'
          }}>
            <span>{cur.initialCount}</span>
            <span style={{ color: 'var(--clr-wrong)' }}>-</span>
            <span>{cur.leaving}</span>
            <span>=</span>
            <span style={{
              minWidth: '54px',
              padding: '2px 14px',
              borderRadius: '10px',
              background: userAnswer !== null ? 'var(--clr-input)' : 'rgba(232, 134, 74, 0.15)',
              border: '2px dashed var(--clr-accent)',
              color: userAnswer === cur.targetRemaining ? 'var(--clr-correct)' : 'var(--clr-accent)'
            }}>
              {userAnswer !== null ? userAnswer : '?'}
            </span>
          </div>

          {/* Child-Friendly Interactive Number Buttons */}
          <div>
            <p style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--clr-text-soft)',
              marginBottom: '14px'
            }}>
              How many children are still on the bus?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {(level === 1 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(num => (
                <button
                  key={num}
                  onClick={() => handleSelectAnswer(num)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: userAnswer === num
                      ? num === cur.targetRemaining ? 'var(--clr-correct)' : 'var(--clr-wrong)'
                      : 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: userAnswer === num ? '#ffffff' : 'var(--clr-text)',
                    boxShadow: 'var(--shadow-btn)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Success or Try-Again Feedback with Voice Support */}
          {feedback && (
            <div className="anim-pop" style={{
              marginTop: '20px',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: 700,
              background: feedback.type === 'success' ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)',
              color: feedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)',
              border: `2px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`
            }}>
              {feedback.text}
            </div>
          )}
        </div>
      </div>

      {/* Illustrated Game Story Screen before playing */}
      <GameStoryModal
        isOpen={showStory}
        onClose={() => setShowStory(false)}
        title="The Joyful School Bus Ride"
        icon="🚌"
        badge="Joyful Math Rhyme"
        story="Honk honk! The cheerful yellow school bus is rolling down the road with five happy children singing together. At each stop, one child waves goodbye and steps off the bus into their neighborhood. Count down backwards as the bus empties until none are left: zero!"
        buttonText="Next ➔ Board the Bus!"
      />

      {/* Celebration Modal: Exactly matching the module name "Five Little Children Complete!" */}
      {showCelebration && (
        <CelebrationModal
          title="Five Little Children Complete!"
          subtitle={level === 1
            ? "All five little children reached their stops safely! 'Now, there are none!' (0)"
            : "All passengers reached their destination! Subtraction countdown mastered!"}
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
