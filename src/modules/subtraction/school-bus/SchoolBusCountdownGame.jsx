import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import { playSuccessChime, playGentleBoing, playBusHorn } from '../../../core/soundEffects';
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
      landmarkDetail: "Shoemaker Shop",
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
      playBusHorn();
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
        text: `Count again! There were ${cur.initialCount} children on the bus, and ${cur.leaving} stepped out.`
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
      subtitle="Ride the cheerful yellow school bus, chant the rhyming poem, and discover subtraction down to zero!"
      category="Subtraction & Rhymes"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
      onOpenStory={() => setShowStory(true)}
    >
      <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
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
              Bus Countdown: <strong>{cur.initialCount} ➔ {cur.targetRemaining}</strong>
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
              🚌 Rhyme Bus (5 Kids)
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
              🚌 Tour Bus (10 Kids)
            </button>
          </div>
        </div>

        {/* Main Stage: Scenic Neighborhood, Bus Stop & Animated Cartoon School Bus */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {/* Animated Landscape Stage with Road */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #86efac 48%, #4ade80 72%, #64748b 74%, #334155 100%)',
            borderRadius: '24px',
            padding: '24px 16px 20px 16px',
            border: '3px solid #0284c7',
            boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.18)',
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
            <div style={{ position: 'absolute', top: '24px', left: '160px', fontSize: '1.2rem', opacity: 0.75 }}>
              ☁️
            </div>

            {/* Landmark Destination Display in Background */}
            <div style={{
              position: 'absolute',
              top: '28px',
              right: '36px',
              textAlign: 'center',
              zIndex: 2
            }}>
              <div style={{ fontSize: '3.2rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}>
                {cur.landmarkIcon}
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1e293b',
                background: 'rgba(255,255,255,0.95)',
                padding: '3px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                {cur.landmarkDetail}
              </div>
            </div>

            {/* Bus Stop Name Sign */}
            <div style={{
              position: 'absolute',
              top: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a',
              color: '#facc15',
              border: '2px solid #facc15',
              borderRadius: '8px',
              padding: '3px 16px',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 3
            }}>
              🚏 {cur.stopName.toUpperCase()}
            </div>

            {/* ============================================================== */}
            {/* AUTHENTIC CARTOON YELLOW SCHOOL BUS (Matching NCERT textbook) */}
            {/* ============================================================== */}
            <div
              style={{
                position: 'relative',
                zIndex: 4,
                margin: '34px auto 10px auto',
                maxWidth: '680px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Main Bus Body */}
              <div
                style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, #fde047 0%, #facc15 15%, #eab308 85%, #ca8a04 100%)',
                  border: '4px solid #854d0e',
                  borderRadius: '34px 56px 18px 18px',
                  padding: '14px 18px 18px 18px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* White Roof Trim Highlight */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '20px',
                  right: '40px',
                  height: '8px',
                  background: '#ffffff',
                  opacity: 0.65,
                  borderRadius: '0 0 8px 8px'
                }} />

                {/* Top Arched Sign: "SCHOOL BUS" with flashing warning lights */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #991b1b',
                    boxShadow: '0 0 8px #ef4444',
                    animation: 'pulse 1s infinite'
                  }} />

                  <div
                    onClick={() => playBusHorn()}
                    title="Click to Honk Bus Horn!"
                    style={{
                      background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
                      border: '2px solid #7f1d1d',
                      color: '#ffffff',
                      fontFamily: 'var(--font-kids)',
                      fontWeight: 900,
                      fontSize: '1rem',
                      letterSpacing: '0.14em',
                      padding: '4px 22px',
                      borderRadius: '8px',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    🚌 SCHOOL BUS 📢
                  </div>

                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    border: '2px solid #b45309',
                    boxShadow: '0 0 8px #f59e0b',
                    animation: 'pulse 1s infinite 0.5s'
                  }} />
                </div>

                {/* Upper Deck: Front Windshield with Eyes & Passenger Windows */}
                <div style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: '10px',
                  marginBottom: '12px'
                }}>
                  {/* Front Driver Windshield with Friendly Cartoon Eyes */}
                  <div style={{
                    flex: '0 0 110px',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)',
                    border: '3px solid #0284c7',
                    borderRadius: '16px 28px 12px 12px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)',
                    position: 'relative'
                  }}>
                    {/* Glass glare line */}
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '12px',
                      width: '30px',
                      height: '4px',
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: '2px',
                      transform: 'rotate(-25deg)'
                    }} />

                    {/* Friendly Cartoon Eyes looking forward */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      border: '2px solid #0369a1',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>👀</span>
                      <span style={{ fontSize: '1rem' }}>🧑‍✈️</span>
                    </div>

                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1', marginTop: '4px' }}>
                      DRIVER
                    </span>
                  </div>

                  {/* Passenger Windows carrying the Children! */}
                  <div style={{
                    flex: 1,
                    background: '#0284c7',
                    border: '3px solid #0369a1',
                    borderRadius: '16px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    overflowX: 'auto',
                    boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.25)'
                  }}>
                    {cur.initialCount === 0 ? (
                      <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>
                        🎉 Bus is Empty! 0 Children Left!
                      </span>
                    ) : (
                      Array.from({ length: cur.initialCount }).map((_, i) => {
                        const isExiting = i >= cur.targetRemaining;
                        const avatar = KID_AVATARS[i % KID_AVATARS.length];

                        return (
                          <div
                            key={i}
                            onClick={() => speak(String(i + 1), 0.85)}
                            title={`Child ${i + 1} - click to count`}
                            style={{
                              background: '#ffffff',
                              border: isExiting && disembarking ? '2px dashed #94a3b8' : '2px solid #38bdf8',
                              borderRadius: '12px',
                              padding: '4px 6px',
                              minWidth: '50px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transform: isExiting && disembarking ? 'translateY(8px) scale(0.8)' : 'scale(1)',
                              opacity: isExiting && disembarking ? 0.4 : 1,
                              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                          >
                            {/* Window Child Number */}
                            <div style={{
                              fontSize: '10px',
                              fontWeight: 900,
                              color: '#0284c7',
                              marginBottom: '2px',
                              fontFamily: 'var(--font-kids)'
                            }}>
                              #{i + 1}
                            </div>

                            {/* Child Avatar waving */}
                            <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>
                              {isExiting && disembarking ? '💺' : avatar}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Lower Bus Body: Black Safety Rub Stripes & Smiling Front Radiator Grill */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: '10px'
                }}>
                  {/* Fold-out Red Stop Sign */}
                  <div style={{
                    background: '#dc2626',
                    border: '2px solid #ffffff',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '10px',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>🛑</span>
                    <span>STOP</span>
                  </div>

                  {/* Smiling Bumper & Headlights */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {/* Left Glowing Headlight */}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fef08a',
                      border: '2px solid #ca8a04',
                      boxShadow: '0 0 10px #fde047'
                    }} />

                    {/* Happy Smiling Radiator Grill */}
                    <div style={{
                      background: '#1e293b',
                      border: '2px solid #475569',
                      borderRadius: '0 0 16px 16px',
                      padding: '2px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>😃</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#facc15' }}>BEEP BEEP!</span>
                    </div>

                    {/* Right Glowing Headlight */}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fef08a',
                      border: '2px solid #ca8a04',
                      boxShadow: '0 0 10px #fde047'
                    }} />
                  </div>

                  {/* Boarding Passenger Door */}
                  <div style={{
                    background: '#fde047',
                    border: '2px solid #ca8a04',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#713f12'
                  }}>
                    🚪 EXIT DOOR
                  </div>
                </div>
              </div>

              {/* Realistic Bus Rubber Wheels */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '84%',
                marginTop: '-16px',
                position: 'relative',
                zIndex: 6
              }}>
                {/* Front Heavy Bus Wheel */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #64748b 25%, #1e293b 60%, #0f172a 100%)',
                  border: '4px solid #0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#cbd5e1',
                    border: '2px solid #94a3b8'
                  }} />
                </div>

                {/* Rear Heavy Bus Wheel */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #64748b 25%, #1e293b 60%, #0f172a 100%)',
                  border: '4px solid #0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#cbd5e1',
                    border: '2px solid #94a3b8'
                  }} />
                </div>
              </div>
            </div>

            {/* Sidewalk & Stepping-Out Disembark Animation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '48px',
              minHeight: '62px',
              position: 'relative',
              zIndex: 5
            }}>
              {disembarking && (
                <div
                  className="anim-pop"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.98)',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.22)',
                    border: '2px solid #10b981'
                  }}
                >
                  <span style={{ fontSize: '2.1rem' }}>🎒🧒👋</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#047857' }}>
                      Step out!
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>
                      Safe at {cur.stopName}!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Asphalt Road with White Dashed Center Divider Line */}
            <div style={{
              height: '24px',
              background: '#334155',
              borderTop: '3px solid #1e293b',
              margin: '6px -16px -20px -16px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '4px',
                background: 'repeating-linear-gradient(90deg, #facc15, #facc15 24px, transparent 24px, transparent 48px)',
                opacity: 0.8
              }} />
            </div>
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
              {Array.from({ length: 6 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectAnswer(i)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius)',
                    background: userAnswer === i
                      ? i === cur.targetRemaining ? 'var(--clr-correct)' : 'var(--clr-wrong)'
                      : 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: userAnswer === i ? '#ffffff' : 'var(--clr-text)',
                    boxShadow: 'var(--shadow-btn)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {i}
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
        title="The Joyful School Bus Ride! 🚌"
        icon="🚌"
        badge="Joyful Math Rhyme"
        story="Honk honk! The cheerful yellow school bus is rolling down the road with five happy children singing together. At each neighborhood stop, one child waves goodbye and steps off the bus. Chant the poem and count down backwards as the bus empties until none are left: zero (0)!"
        buttonText="Next ➔ Board the School Bus!"
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Five Little Children Complete! 🚌"
          subtitle={level === 1
            ? "All five little children reached their stops safely on the yellow school bus! 'Now, there are none!' (0)"
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
