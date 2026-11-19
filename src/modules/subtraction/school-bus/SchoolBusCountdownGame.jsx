import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import { playSuccessChime, playGentleBoing, playTrainWhistle } from '../../../core/soundEffects';
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

// Vibrant coach colors for the train bogies
const COACH_COLORS = [
  { body: '#2563eb', border: '#1d4ed8', roof: '#60a5fa' }, // Blue
  { body: '#059669', border: '#047857', roof: '#34d399' }, // Green
  { body: '#d97706', border: '#b45309', roof: '#fbbf24' }, // Amber
  { body: '#db2777', border: '#be185d', roof: '#f472b6' }, // Pink
  { body: '#7c3aed', border: '#6d28d9', roof: '#a78bfa' }, // Purple
  { body: '#0891b2', border: '#0e7490', roof: '#22d3ee' }, // Cyan
  { body: '#ea580c', border: '#c2410c', roof: '#fb923c' }, // Orange
  { body: '#65a30d', border: '#4d7c0f', roof: '#a3e635' }, // Lime
  { body: '#4f46e5', border: '#4338ca', roof: '#818cf8' }, // Indigo
  { body: '#e11d48', border: '#be123c', roof: '#fb7185' }  // Rose
];

export default function SchoolBusCountdownGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);
  const [showStory, setShowStory] = useState(true);

  // Level 1 follows the exact NCERT textbook poem from Grade 1 (Screenshot 2026-11-19 131202.png)
  const LEVEL_1_STOPS = [
    {
      stopName: "Cozy Red Cottage Station",
      landmarkIcon: "🏡",
      landmarkDetail: "Red Roof Cottage",
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
      stopName: "The Shady Tree Station",
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
      stopName: "Cobbler's Village Station",
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
      stopName: "Sunny Hillside Station",
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
      stopName: "School Terminal Station",
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
      stopName: "Dinosaur Museum Station",
      landmarkIcon: "🦕",
      landmarkDetail: "Museum Gate",
      poemLines: [
        "Ten children on the Choo-Choo train!",
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
      stopName: "Starlit Planetarium Station",
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
      stopName: "Botanical Rose Garden Station",
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
      stopName: "Home Village Station",
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
      playTrainWhistle();
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
        text: `Count again! There were ${cur.initialCount} children on the train, and ${cur.leaving} stepped off.`
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
      subtitle="Ride the joyful Choo-Choo Train, chant the rhyming poem, and discover subtraction down to zero!"
      category="Subtraction & Rhymes"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
      onOpenStory={() => setShowStory(true)}
    >
      <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>
        {/* Top Control Bar: Station Info & Level Switcher */}
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
              <span>🚉 Station {stopIdx + 1} of {currentStops.length}:</span>
              <span style={{ color: 'var(--clr-accent)' }}>{cur.stopName}</span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Choo-Choo Countdown: <strong>{cur.initialCount} ➔ {cur.targetRemaining}</strong>
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
              🚂 Rhyme Express (5 Kids)
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
              🚂 Tour Express (10 Kids)
            </button>
          </div>
        </div>

        {/* Main Stage: Countryside Scenery, Station Platform & Animated Choo-Choo Train */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {/* Animated Countryside Railway Stage */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #86efac 48%, #4ade80 75%, #a8a29e 77%, #78716c 100%)',
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
            <div style={{ position: 'absolute', top: '24px', left: '140px', fontSize: '1.2rem', opacity: 0.75 }}>
              ☁️
            </div>

            {/* Station Landmark Destination Display */}
            <div style={{
              position: 'absolute',
              top: '28px',
              right: '36px',
              textAlign: 'center',
              zIndex: 2
            }}>
              <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}>
                {cur.landmarkIcon}
              </div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#1e293b',
                background: 'rgba(255,255,255,0.92)',
                padding: '3px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                {cur.landmarkDetail}
              </div>
            </div>

            {/* Station Platform Name Sign */}
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
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
              zIndex: 3
            }}>
              🚉 {cur.stopName.toUpperCase()}
            </div>

            {/* ============================================================== */}
            {/* THE COLORFUL CHOO-CHOO TRAIN (Locomotive Engine + Bogie Coaches) */}
            {/* ============================================================== */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '6px',
              margin: '36px auto 10px auto',
              padding: '10px 12px',
              overflowX: 'auto',
              maxWidth: '100%',
              position: 'relative',
              zIndex: 4
            }}>

              {/* STEAM LOCOMOTIVE ENGINE (Front of Train) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  position: 'relative'
                }}
              >
                {/* Puffing Steam Animation */}
                <div style={{
                  position: 'absolute',
                  top: '-28px',
                  left: '20px',
                  display: 'flex',
                  gap: '4px',
                  fontSize: '1.2rem',
                  animation: 'bounceSlow 1.2s infinite'
                }}>
                  <span>💨</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>💨</span>
                </div>

                {/* Locomotive Cabin & Boiler Body */}
                <div style={{
                  background: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
                  border: '3px solid #7f1d1d',
                  borderRadius: '16px 28px 8px 8px',
                  padding: '8px 12px',
                  width: '100px',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
                  position: 'relative',
                  textAlign: 'center'
                }}>
                  {/* Brass Whistle & Chimney */}
                  <div style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '16px',
                    width: '14px',
                    height: '16px',
                    background: '#1e293b',
                    borderRadius: '4px 4px 0 0',
                    border: '2px solid #0f172a'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    fontSize: '0.9rem'
                  }}>
                    🔔
                  </div>

                  {/* Engine Sign */}
                  <div style={{
                    background: '#facc15',
                    color: '#713f12',
                    fontSize: '9px',
                    fontWeight: 900,
                    borderRadius: '4px',
                    padding: '1px 4px',
                    marginBottom: '4px',
                    letterSpacing: '0.04em'
                  }}>
                    CHOO-CHOO
                  </div>

                  {/* Driver Window & Face */}
                  <div style={{
                    background: '#0284c7',
                    border: '2px solid #0369a1',
                    borderRadius: '8px',
                    padding: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    marginBottom: '6px'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>🧑‍✈️</span>
                    <span style={{ fontSize: '0.9rem' }}>😃</span>
                  </div>

                  {/* Golden Headlight */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#fef08a',
                      border: '2px solid #eab308',
                      boxShadow: '0 0 10px #fde047'
                    }} />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#fef08a' }}>EXPRESS</span>
                  </div>
                </div>

                {/* Locomotive Large Driving Wheels */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '92px',
                  marginTop: '-8px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    border: '3px solid #facc15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#94a3b8',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}>
                    ⚙️
                  </div>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#1e293b',
                    border: '3px solid #facc15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#94a3b8',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}>
                    ⚙️
                  </div>
                </div>
              </div>

              {/* TRAIN COUPLER LINK 🔗 */}
              <div style={{
                width: '10px',
                height: '4px',
                background: '#475569',
                marginBottom: '20px',
                borderRadius: '2px'
              }} />

              {/* PASSENGER COACHES / BOGIES (Each carrying one child!) */}
              {Array.from({ length: cur.initialCount }).map((_, i) => {
                const isExiting = i >= cur.targetRemaining;
                const avatar = KID_AVATARS[i % KID_AVATARS.length];
                const coachColor = COACH_COLORS[i % COACH_COLORS.length];

                return (
                  <React.Fragment key={i}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      {/* Coach Body */}
                      <div
                        onClick={() => speak(String(i + 1), 0.85)}
                        title={`Coach ${i + 1} - Child ${i + 1} (Click to count)`}
                        style={{
                          background: coachColor.body,
                          border: `3px solid ${coachColor.border}`,
                          borderRadius: '12px 12px 6px 6px',
                          padding: '6px 8px',
                          minWidth: '64px',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                          position: 'relative',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transform: isExiting && disembarking ? 'scale(0.92)' : 'scale(1)',
                          transition: 'all 0.3s'
                        }}
                      >
                        {/* Coach Roof Strip */}
                        <div style={{
                          background: coachColor.roof,
                          height: '6px',
                          borderRadius: '6px 6px 0 0',
                          margin: '-6px -8px 6px -8px'
                        }} />

                        {/* Coach Number Label */}
                        <div style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          color: '#ffffff',
                          background: 'rgba(0,0,0,0.25)',
                          borderRadius: '4px',
                          padding: '1px 4px',
                          marginBottom: '4px'
                        }}>
                          COACH {i + 1}
                        </div>

                        {/* Window with Child Avatar */}
                        <div style={{
                          background: '#f8fafc',
                          border: '2px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '4px',
                          minHeight: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)'
                        }}>
                          {isExiting && disembarking ? (
                            <span style={{ fontSize: '1.2rem', opacity: 0.4 }}>💺</span>
                          ) : (
                            <span
                              style={{
                                fontSize: '1.75rem',
                                transform: 'scale(1)',
                                display: 'inline-block'
                              }}
                            >
                              {avatar}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Coach Wheels */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '54px',
                        marginTop: '-6px'
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#1e293b',
                          border: '2px solid #94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          color: '#cbd5e1'
                        }}>
                          ⚙️
                        </div>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#1e293b',
                          border: '2px solid #94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          color: '#cbd5e1'
                        }}>
                          ⚙️
                        </div>
                      </div>
                    </div>

                    {/* Coupler link between coaches */}
                    {i < cur.initialCount - 1 && (
                      <div style={{
                        width: '6px',
                        height: '4px',
                        background: '#475569',
                        marginBottom: '16px',
                        borderRadius: '2px'
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
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
                      Step off the train!
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>
                      Safe at {cur.stopName}!
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* REALISTIC WOODEN & STEEL RAILWAY TRACKS (Rails and Sleepers) */}
            <div style={{
              height: '22px',
              background: 'repeating-linear-gradient(90deg, #78350f 0px, #78350f 8px, #d6d3d1 8px, #d6d3d1 22px)',
              borderTop: '3px solid #475569',
              borderBottom: '3px solid #334155',
              boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
              margin: '6px -16px -20px -16px',
              position: 'relative'
            }}>
              {/* Top and Bottom Steel Rail Lines */}
              <div style={{
                position: 'absolute',
                top: '2px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#cbd5e1'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '2px',
                left: 0,
                right: 0,
                height: '2px',
                background: '#94a3b8'
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
              How many children are still on the train?
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
        title="The Joyful Choo-Choo Train Ride! 🚂"
        icon="🚂"
        badge="Choo-Choo Math Rhyme"
        story="Choo-choo! The cheerful colourful train is rolling down the railway tracks with five happy children singing together in their coaches. At each village station, one child waves goodbye and steps off onto the platform. Chant the poem and count down backwards as the train empties until none are left: zero (0)!"
        buttonText="Next ➔ Board the Choo-Choo Train!"
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Five Little Children Complete! 🚂"
          subtitle={level === 1
            ? "All five little children reached their stations safely on the Choo-Choo Express! 'Now, there are none!' (0)"
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
