import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playPop,
  playSuccessChime,
  playGentleBoing,
  playVictoryFanfare
} from '../../../core/soundEffects';
import {
  Sparkles,
  ArrowRight,
  School,
  CheckCircle2,
  Volume2,
  HelpCircle,
  TrendingUp,
  Compass
} from 'lucide-react';
import { GameProps } from '../../../types';

function speak(text: string | number, rate: number = 0.85): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate;
      utterance.pitch = 1.12;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

interface ClassroomProblem {
  title: string;
  parth: [number, number]; // [row x, seat y]
  anish: [number, number];
  amitRow: number;
  amitExpectedSeat: number;
  slope: number;
  intercept: number;
  equation: string;
  storyHint: string;
}

const CLASSROOM_ROUNDS: ClassroomProblem[] = [
  {
    title: "The Paper Bullet & Flying Eraser",
    parth: [2, 7],
    anish: [3, 9],
    amitRow: 1,
    amitExpectedSeat: 5,
    slope: 2,
    intercept: 3,
    equation: "y = 2x + 3",
    storyHint: "Anish (Row 3, Seat 9) threw a paper bullet at Parth (Row 2, Seat 7). Parth dodged, threw an eraser straight back, which flew past and hit Amit in Row 1!"
  },
  {
    title: "The Backbencher Passing Mystery",
    parth: [2, 4],
    anish: [4, 8],
    amitRow: 1,
    amitExpectedSeat: 2,
    slope: 2,
    intercept: 0,
    equation: "y = 2x",
    storyHint: "A note was passed along the classroom desks from Anish (4, 8) to Parth (2, 4) all the way to Amit in Row 1!"
  },
  {
    title: "The Diagonal Classroom Pass",
    parth: [1, 3],
    anish: [3, 7],
    amitRow: 2,
    amitExpectedSeat: 5,
    slope: 2,
    intercept: 1,
    equation: "y = 2x + 1",
    storyHint: "Parth sits at (1, 3) and Anish sits at (3, 7). Where would the eraser land if it hit the middle desk in Row 2?"
  }
];

export interface ClassroomGridGameProps extends GameProps {
  isEmbedded?: boolean;
  onNextChapter?: () => void;
  onChapterStars?: (stars: number) => void;
}

export default function ClassroomGridGame({
  onBack,
  isEmbedded,
  onNextChapter,
  onChapterStars
}: ClassroomGridGameProps) {
  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [storyOpen, setStoryOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const prob = CLASSROOM_ROUNDS[roundIdx] || CLASSROOM_ROUNDS[0];

  // Stage in round:
  // 1: Plot Parth (Row 2, Seat 7)
  // 2: Plot Anish (Row 3, Seat 9)
  // 3: Identify Amit's Seat in Row 1 (Where the eraser hit)
  // 4: The Collinear Pattern Question (Do they form a line?)
  // 5: Collinear Line Revealed & Explained!
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedSeat, setSelectedSeat] = useState<[number, number] | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [hoveredDesk, setHoveredDesk] = useState<[number, number] | null>(null);

  // Classroom dimensions
  const MAX_ROWS = 5;
  const MAX_SEATS = 10;

  const handleDeskClick = (row: number, seat: number) => {
    setSelectedSeat([row, seat]);

    if (stage === 1) {
      if (row === prob.parth[0] && seat === prob.parth[1]) {
        playPop(520);
        playSuccessChime();
        setFeedback({
          text: `🎉 Spot on! Parth found at Row ${row}, Seat ${seat} ➔ Coordinates (${row}, ${seat})!`,
          isCorrect: true
        });
        speak(`Parth found at row ${row}, seat ${seat}! Coordinates: ${row}, ${seat}!`);
        setTimeout(() => {
          setStage(2);
          setFeedback(null);
          speak(`Now, plot Anish! Anish is sitting at Row ${prob.anish[0]}, Seat ${prob.anish[1]}!`);
        }, 1100);
      } else {
        playGentleBoing();
        const hint = `Parth is in Row ${prob.parth[0]}, Seat ${prob.parth[1]}! You tapped (${row}, ${seat}). Check the row and seat headers!`;
        setFeedback({ text: hint, isCorrect: false });
        speak(hint);
      }
    } else if (stage === 2) {
      if (row === prob.anish[0] && seat === prob.anish[1]) {
        playPop(660);
        playSuccessChime();
        setFeedback({
          text: `🎉 Excellent! Anish found at Row ${row}, Seat ${seat} ➔ Coordinates (${row}, ${seat})!`,
          isCorrect: true
        });
        speak(`Anish spotted at coordinates ${row}, ${seat}!`);
        setTimeout(() => {
          setStage(3);
          setFeedback(null);
          speak(`Now, Parth threw an eraser back in a straight line towards Anish, but it missed and hit Amit in Row ${prob.amitRow}! What seat was Amit at?`);
        }, 1100);
      } else {
        playGentleBoing();
        const hint = `Anish is at Row ${prob.anish[0]}, Seat ${prob.anish[1]}! Look for Row ${prob.anish[0]} on the X-axis and Seat ${prob.anish[1]} on the Y-axis.`;
        setFeedback({ text: hint, isCorrect: false });
        speak(hint);
      }
    } else if (stage === 3) {
      handleCheckAmitSeat(seat, row);
    }
  };

  const handleCheckAmitSeat = (seat: number, row: number = prob.amitRow) => {
    if (seat === prob.amitExpectedSeat && row === prob.amitRow) {
      playSuccessChime();
      playPop(720);
      setStars(s => s + 2);
      setStage(4);
      setFeedback({
        text: `🎯 Brilliant! The eraser traveled in a straight path hitting Amit at Row ${prob.amitRow}, Seat ${prob.amitExpectedSeat}! Coordinates: (${prob.amitRow}, ${prob.amitExpectedSeat})!`,
        isCorrect: true
      });
      speak(`Brilliant! Amit was sitting at Row ${prob.amitRow}, Seat ${prob.amitExpectedSeat}! Now look closely at all three desks!`);
    } else {
      playGentleBoing();
      const hint = `The eraser flew along the straight path connecting Anish (${prob.anish[0]}, ${prob.anish[1]}) and Parth (${prob.parth[0]}, ${prob.parth[1]}). In Row ${prob.amitRow}, which seat lies on that straight line? (Hint: Notice the pattern: 9 ➔ 7 ➔ ?)`;
      setFeedback({ text: hint, isCorrect: false });
      speak(hint);
    }
  };

  const handleAnswerPatternQuestion = (isLine: boolean) => {
    if (isLine) {
      playSuccessChime();
      playVictoryFanfare();
      setStars(s => s + 3);
      setStage(5);
      setFeedback({
        text: `🌟 EUREKA! All three desks form a PERFECT STRAIGHT LINE! In coordinate geometry, points on the same line are called COLLINEAR!`,
        isCorrect: true
      });
      speak(`Eureka! All three desks lie on a straight line! That makes them collinear!`);
    } else {
      playGentleBoing();
      setFeedback({
        text: `Take a look at the grid! Can a single ruler or laser beam connect Amit, Parth, and Anish directly?`,
        isCorrect: false
      });
      speak(`Take another look at the grid! Can a ruler connect all three desks in a straight path?`);
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 < CLASSROOM_ROUNDS.length) {
      setRoundIdx(r => r + 1);
      setStage(1);
      setSelectedSeat(null);
      setFeedback(null);
    } else {
      onChapterStars?.(3);
      setShowCelebration(true);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setRoundIdx(0);
    setStage(1);
    setSelectedSeat(null);
    setFeedback(null);
  };

  const content = (
    <>
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>

        {/* ============================================================== */}
        {/* INTERACTIVE CLASSROOM COMIC STRIP HEADER                       */}
        {/* ============================================================== */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)',
          border: '2px solid #6366f1',
          borderRadius: '20px',
          padding: '16px 20px',
          marginBottom: '16px',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#6366f1',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}>
                🏫
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Story 1 • {prob.title}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-kids)' }}>
                  Classroom Ka "Fish Market"!
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => speak(`PT Teacher stands at Origin (0,0). ${prob.storyHint}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Listen to story"
              >
                <Volume2 size={16} />
                <span>Listen Aloud</span>
              </button>

              <span style={{
                background: '#312e81',
                border: '1px solid #6366f1',
                color: '#c7d2fe',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 800
              }}>
                Round {roundIdx + 1} of {CLASSROOM_ROUNDS.length}
              </span>
            </div>
          </div>

          {/* Comic Narrative Speech Bubble */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.92rem',
            lineHeight: 1.5,
            color: '#f8fafc'
          }}>
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>👨‍🏫</span>
            <div>
              <strong style={{ color: '#fef08a' }}>PT Sir landed and shouted:</strong> "Is this a fish market?!"
              <br />
              <span style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                {prob.storyHint}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* GEOGEBRA-STYLE CLASSROOM COORDINATE FLOOR PLAN                 */}
        {/* ============================================================== */}
        <div style={{
          background: '#090d16',
          borderRadius: '24px',
          border: '3px solid #3b82f6',
          padding: '20px 16px',
          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.35)',
          color: '#ffffff',
          marginBottom: '18px',
          position: 'relative'
        }}>

          {/* Teacher's Podium: Origin (0, 0) Bar */}
          <div style={{
            background: '#1e293b',
            border: '2px solid #475569',
            borderRadius: '14px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>👨‍🏫 📢</span>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#fef08a' }}>PT Teacher Podium • Origin (0, 0)</strong>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>
                  Facing the class: Rows are X-Axis (1 to 5) • Seats are Y-Axis (1 to 10)
                </span>
              </div>
            </div>

            <div style={{
              background: '#0f172a',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid #38bdf8',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#38bdf8'
            }}>
              {hoveredDesk ? `Point: Row ${hoveredDesk[0]}, Seat ${hoveredDesk[1]} ➔ (${hoveredDesk[0]}, ${hoveredDesk[1]})` : "Hover or tap any desk to see coordinates!"}
            </div>
          </div>

          {/* The Coordinate Desks Floor Plan */}
          <div style={{ overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `42px repeat(${MAX_ROWS}, minmax(56px, 1fr))`,
              gap: '6px',
              minWidth: 'min(100%, 480px)',
              margin: '0 auto'
            }}>
              {/* Corner label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#64748b'
              }}>
                Seats ↓
              </div>

              {/* X-Axis Header: Rows 1 to 5 */}
              {Array.from({ length: MAX_ROWS }).map((_, rIdx) => (
                <div
                  key={`col-head-${rIdx}`}
                  style={{
                    textAlign: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    color: '#38bdf8',
                    padding: '4px 2px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.25)'
                  }}
                >
                  Row {rIdx + 1}
                  <div style={{ fontSize: '0.7rem', color: '#7dd3fc', fontWeight: 700 }}>x={rIdx + 1}</div>
                </div>
              ))}

              {/* Y-Axis: Seats 10 at top to Seat 1 at bottom (standard Cartesian orientation) */}
              {Array.from({ length: MAX_SEATS }).map((_, sIdx) => {
                const seatNum = MAX_SEATS - sIdx; // Seat 10 at top, Seat 1 at bottom
                return (
                  <React.Fragment key={`row-frag-${seatNum}`}>
                    {/* Y-axis seat label */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.82rem',
                      color: '#f59e0b',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      y={seatNum}
                    </div>

                    {/* Desks along the row */}
                    {Array.from({ length: MAX_ROWS }).map((_, rIdx) => {
                      const rowNum = rIdx + 1;
                      const isParth = rowNum === prob.parth[0] && seatNum === prob.parth[1];
                      const isAnish = rowNum === prob.anish[0] && seatNum === prob.anish[1];
                      const isAmit = rowNum === prob.amitRow && seatNum === prob.amitExpectedSeat;

                      const isSelected = selectedSeat && selectedSeat[0] === rowNum && selectedSeat[1] === seatNum;

                      // Desk style logic
                      let deskBg = '#1e293b';
                      let deskBorder = '#334155';
                      let content: React.ReactNode = (
                        <span style={{ opacity: 0.65, fontSize: '0.74rem' }}>
                          ({rowNum},{seatNum})
                        </span>
                      );

                      if (stage >= 2 && isParth) {
                        deskBg = 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)';
                        deskBorder = '#ffffff';
                        content = (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                            <span style={{ fontSize: '1rem' }}>🎯</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ffffff' }}>Parth</span>
                          </div>
                        );
                      } else if (stage >= 3 && isAnish) {
                        deskBg = 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)';
                        deskBorder = '#ffffff';
                        content = (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                            <span style={{ fontSize: '1rem' }}>📄✈️</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ffffff' }}>Anish</span>
                          </div>
                        );
                      } else if (stage >= 4 && isAmit) {
                        deskBg = 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
                        deskBorder = '#ffffff';
                        content = (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                            <span style={{ fontSize: '1rem' }}>💥🧼</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#ffffff' }}>Amit</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={`desk-${rowNum}-${seatNum}`}
                          onClick={() => handleDeskClick(rowNum, seatNum)}
                          onMouseEnter={() => setHoveredDesk([rowNum, seatNum])}
                          onMouseLeave={() => setHoveredDesk(null)}
                          style={{
                            height: '42px',
                            background: deskBg,
                            border: `2px solid ${deskBorder}`,
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                            boxShadow: isSelected ? '0 0 14px #38bdf8' : 'none',
                            position: 'relative'
                          }}
                        >
                          {content}
                        </button>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Laser Trajectory Graphic indicator when line is revealed */}
          {stage >= 5 && (
            <div className="anim-pop" style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              borderRadius: '14px',
              padding: '12px 18px',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>📏✨</span>
                <div>
                  <strong style={{ color: '#34d399', fontSize: '1rem' }}>Straight Line Equation: {prob.equation}</strong>
                  <span style={{ display: 'block', fontSize: '0.82rem', color: '#e2e8f0' }}>
                    Slope m = {prob.slope} (For every 1 row back, the seat shifts by +2!)
                  </span>
                </div>
              </div>

              <div style={{
                background: '#047857',
                color: '#ffffff',
                padding: '4px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: 800
              }}>
                All 3 Points are Collinear!
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE STAGE MISSIONS & QUESTION PROMPTS                  */}
        {/* ============================================================== */}

        {/* STAGE 1: Plot Parth */}
        {stage === 1 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #f59e0b',
            borderRadius: '18px',
            padding: '18px 20px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.6rem' }}>🎯</span>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                  Step 1 of 4 • Spot Parth's Desk!
                </span>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
                  Amit whispered: "Sir, the second row's seventh child is Parth!"
                </h4>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: '0 0 12px 0' }}>
              On the classroom grid above, locate <strong>Row 2 (X-axis = 2)</strong> and <strong>Seat 7 (Y-axis = 7)</strong>, then tap the desk at <strong>(2, 7)</strong>!
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDeskClick(prob.parth[0], prob.parth[1])}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '2px solid #f59e0b',
                  color: 'var(--clr-text)',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <span>Tap here to auto-select Row 2, Seat 7 ➔ (2, 7)</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: Plot Anish */}
        {stage === 2 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #ec4899',
            borderRadius: '18px',
            padding: '18px 20px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.6rem' }}>📄✈️</span>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase' }}>
                  Step 2 of 4 • Spot Anish's Desk!
                </span>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
                  Anish was sitting at the 3rd row, 9th seat!
                </h4>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: '0 0 12px 0' }}>
              Locate <strong>Row {prob.anish[0]} (X = {prob.anish[0]})</strong> and <strong>Seat {prob.anish[1]} (Y = {prob.anish[1]})</strong> on the grid, then tap the desk at <strong>({prob.anish[0]}, {prob.anish[1]})</strong>!
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDeskClick(prob.anish[0], prob.anish[1])}
                style={{
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '2px solid #ec4899',
                  color: 'var(--clr-text)',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <span>Tap here to auto-select Row {prob.anish[0]}, Seat {prob.anish[1]} ➔ ({prob.anish[0]}, {prob.anish[1]})</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: Find Amit's Seat */}
        {stage === 3 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #3b82f6',
            borderRadius: '18px',
            padding: '18px 20px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.6rem' }}>💥🧼</span>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>
                  Step 3 of 4 • Deduce Amit's Location!
                </span>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
                  Parth's eraser flew in a straight line and hit Amit in Row {prob.amitRow}! What seat was Amit at?
                </h4>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: '0 0 14px 0' }}>
              Look at the straight trajectory pattern: Anish was at seat {prob.anish[1]}, Parth was at seat {prob.parth[1]}. If the eraser flew in the same straight line, what seat was Amit in Row {prob.amitRow}?
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[3, 4, 5, 6, 7].map(seatNum => (
                <button
                  key={seatNum}
                  onClick={() => handleCheckAmitSeat(seatNum, prob.amitRow)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--clr-text)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-btn)'
                  }}
                >
                  {seatNum}th Seat {seatNum === prob.amitExpectedSeat ? '⭐' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 4: Pattern Question */}
        {stage === 4 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #10b981',
            borderRadius: '18px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', margin: '0 0 8px 0', fontFamily: 'var(--font-kids)' }}>
              "Is there any pattern in their seating arrangement?"
            </h4>
            <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', margin: '0 auto 16px auto', maxWidth: '580px' }}>
              Take a look at Amit ({prob.amitRow}, {prob.amitExpectedSeat}), Parth ({prob.parth[0]}, {prob.parth[1]}), and Anish ({prob.anish[0]}, {prob.anish[1]}). What geometric shape do all 3 desks make?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleAnswerPatternQuestion(true)}
                style={{
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-pill)',
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <span>📏 A Straight Line! (Collinear)</span>
                <Sparkles size={18} />
              </button>

              <button
                onClick={() => handleAnswerPatternQuestion(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--clr-surface)',
                  color: 'var(--clr-text)',
                  border: '2px solid var(--clr-border)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>⭕ A Circle</span>
              </button>

              <button
                onClick={() => handleAnswerPatternQuestion(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--clr-surface)',
                  color: 'var(--clr-text)',
                  border: '2px solid var(--clr-border)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>🔺 A Triangle</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: Complete Round & Next Button */}
        {stage === 5 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #10b981',
            borderRadius: '18px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                ROUND {roundIdx + 1} SOLVED! 🏆
              </div>
              <h4 style={{ margin: '2px 0', fontSize: '1.2rem', color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
                Equation Found: {prob.equation}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--clr-text-soft)' }}>
                You proved that all 3 points lie on a straight line!
              </p>
            </div>

            <button
              onClick={handleNextRound}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '12px 26px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>{roundIdx + 1 < CLASSROOM_ROUNDS.length ? 'Next Classroom Mystery ➔' : 'Complete Chapter 1 🎉'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div className="anim-pop" style={{
            padding: '12px 20px',
            borderRadius: '14px',
            background: feedback.isCorrect ? '#dcfce7' : '#fee2e2',
            border: `2px solid ${feedback.isCorrect ? '#86efac' : '#fca5a5'}`,
            color: feedback.isCorrect ? '#166534' : '#991b1b',
            fontWeight: 800,
            fontSize: '0.95rem',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            {feedback.text}
          </div>
        )}

      </div>

      {/* Story Modal (Only opened when user taps story button) */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="Classroom Ka Fish Market!"
        badge="Story 1 • Coordinate Geometry"
        icon="🏫"
        story={`In Class A, the teacher was absent, so all the children were having fun and creating nuisance until the PT teacher landed and said: "Is this a fish market?!"

In the meantime, Anish made a paper bullet and shot a headshot at Parth! Parth threw an eraser back, Anish dodged, and it hit Amit!

Amit complained: "Sir, the second row's seventh child is Parth!"

Suppose PT Sir is standing at the origin (0,0). Rows are on the X-axis and seats are on the Y-axis. Can you plot Parth (2, 7) and Anish (3, 9), and find which seat Amit was at? Do their seats make a straight line?`}
        buttonText="Let's Solve ➔"
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Classroom Grid Solved! 📐🎓"
          subtitle="You solved where all the friends were sitting and proved that their seats lie on a straight line!"
          stars={3}
          onNextLevel={() => {
            setShowCelebration(false);
            if (onNextChapter) {
              onNextChapter();
            } else {
              handleNextRound();
            }
          }}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={Boolean(onNextChapter)}
        />
      )}
    </>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <QuizLayout
      title="Classroom Ka Fish Market"
      subtitle="Discover coordinates & straight lines during the PT teacher's classroom inspection!"
      category="Coordinate Geometry / निर्देशांक"
      level={roundIdx + 1}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      {content}
    </QuizLayout>
  );
}
