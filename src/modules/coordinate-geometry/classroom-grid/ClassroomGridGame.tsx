import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playPop,
  playSuccessChime,
  playGentleBoing,
  playHop,
  playVictoryFanfare
} from '../../../core/soundEffects';
import { Sparkles, ArrowRight, RotateCcw, Target, School, Compass } from 'lucide-react';
import { GameProps } from '../../../types';

function speak(text: string | number, rate: number = 0.82): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate;
      utterance.pitch = 1.15;
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
}

const CLASSROOM_ROUNDS: ClassroomProblem[] = [
  {
    title: "Round 1: The Paper Bullet & Eraser Mystery",
    parth: [2, 7],
    anish: [3, 9],
    amitRow: 1,
    amitExpectedSeat: 5,
    slope: 2,
    intercept: 3,
    equation: "y = 2x + 3"
  },
  {
    title: "Round 2: The Backbencher Pass",
    parth: [2, 4],
    anish: [4, 8],
    amitRow: 1,
    amitExpectedSeat: 2,
    slope: 2,
    intercept: 0,
    equation: "y = 2x"
  },
  {
    title: "Round 3: The Diagonal Blackboard Line",
    parth: [1, 3],
    anish: [3, 7],
    amitRow: 2,
    amitExpectedSeat: 5,
    slope: 2,
    intercept: 1,
    equation: "y = 2x + 1"
  }
];

export interface ClassroomGridGameProps extends GameProps {
  isEmbedded?: boolean;
  onNextChapter?: () => void;
  onChapterStars?: (stars: number) => void;
}

export default function ClassroomGridGame({ onBack, isEmbedded, onNextChapter, onChapterStars }: ClassroomGridGameProps) {
  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [storyOpen, setStoryOpen] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const prob = CLASSROOM_ROUNDS[roundIdx] || CLASSROOM_ROUNDS[0];

  // Stage in round:
  // 1: Plot Parth (2, 7)
  // 2: Plot Anish (3, 9)
  // 3: Draw Line & Find Amit's seat in Row 1
  // 4: Collinear Line Revealed!
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSeat, setSelectedSeat] = useState<[number, number] | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const handleDeskClick = (row: number, seat: number) => {
    setSelectedSeat([row, seat]);

    if (stage === 1) {
      if (row === prob.parth[0] && seat === prob.parth[1]) {
        playPop(520);
        playSuccessChime();
        setFeedback({
          text: `Spot on! Parth is seated at Row ${row}, Seat ${seat} ➔ Coordinates (${row}, ${seat})!`,
          isCorrect: true
        });
        speak(`Parth found at row ${row}, seat ${seat}! Coordinates: ${row}, ${seat}!`);
        setTimeout(() => {
          setStage(2);
          setFeedback(null);
          speak(`Now, where is Anish sitting? Clue: Row ${prob.anish[0]}, Seat ${prob.anish[1]}!`);
        }, 1100);
      } else {
        playGentleBoing();
        const hint = `Parth is in Row ${prob.parth[0]} and Seat ${prob.parth[1]}! You tapped (${row}, ${seat}).`;
        setFeedback({ text: hint, isCorrect: false });
        speak(hint);
      }
    } else if (stage === 2) {
      if (row === prob.anish[0] && seat === prob.anish[1]) {
        playPop(660);
        playSuccessChime();
        setFeedback({
          text: `Got him! Anish is at Row ${row}, Seat ${seat} ➔ (${row}, ${seat})!`,
          isCorrect: true
        });
        speak(`Anish found at coordinates ${row}, ${seat}!`);
        setTimeout(() => {
          setStage(3);
          setFeedback(null);
          speak(`Parth threw the eraser straight towards Anish, but it missed and hit Amit in Row ${prob.amitRow}! What seat was Amit at?`);
        }, 1100);
      } else {
        playGentleBoing();
        const hint = `Anish is in Row ${prob.anish[0]}, Seat ${prob.anish[1]}!`;
        setFeedback({ text: hint, isCorrect: false });
        speak(hint);
      }
    } else if (stage === 3) {
      if (row === prob.amitRow && seat === prob.amitExpectedSeat) {
        playSuccessChime();
        playVictoryFanfare();
        setStars(s => s + 3);
        setStage(4);
        setFeedback({
          text: `Brilliant deduction! The eraser traveled in a straight line: ${prob.equation}. Amit was sitting at (${row}, ${seat})!`,
          isCorrect: true
        });
        speak(`Brilliant! Amit sits at Row ${row}, Seat ${seat}! All three friends sit on a straight line: ${prob.equation}!`);
      } else {
        playGentleBoing();
        const hint = `The eraser flew in a straight line connecting (${prob.anish[0]}, ${prob.anish[1]}) and (${prob.parth[0]}, ${prob.parth[1]}). In Row ${prob.amitRow}, which seat lies directly on that straight path?`;
        setFeedback({ text: hint, isCorrect: false });
        speak(hint);
      }
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

  // Dimensions of classroom grid
  const MAX_ROWS = 5;
  const MAX_SEATS = 10;

  const content = (
    <>
      <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>

        {/* Round Header */}
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
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              Story 1 • {prob.title}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              Mission: Find coordinates & discover the straight line!
            </div>
          </div>

          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--clr-accent)'
          }}>
            Round {roundIdx + 1} of {CLASSROOM_ROUNDS.length}
          </div>
        </div>

        {/* Classroom Floor Plan Coordinate Grid */}
        <div style={{
          background: '#0f172a',
          borderRadius: '24px',
          border: '3px solid #3b82f6',
          padding: '24px 20px',
          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.35)',
          color: '#ffffff',
          marginBottom: '20px',
          position: 'relative'
        }}>

          {/* Blackboard / Teacher Podium at Top (Origin (0,0)) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#1e293b',
            border: '2px solid #64748b',
            borderRadius: '16px',
            padding: '10px 18px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                border: '2px solid #ffffff'
              }}>
                👨‍🏫
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: '#fef08a' }}>PT Teacher Podium • Origin (0, 0)</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                  "Is this a fish market?! Who threw that paper bullet?!"
                </p>
              </div>
            </div>

            <div style={{
              background: '#334155',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#38bdf8'
            }}>
              X-Axis: Rows • Y-Axis: Seats
            </div>
          </div>

          {/* Interactive Classroom Coordinate Grid (Desks) */}
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `40px repeat(${MAX_ROWS}, 1fr)`,
              gap: '6px',
              minWidth: '540px'
            }}>
              {/* Header row: Row numbers on X-Axis */}
              <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                Seat ↓
              </div>
              {Array.from({ length: MAX_ROWS }).map((_, rIdx) => (
                <div
                  key={`col-head-${rIdx}`}
                  style={{
                    textAlign: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    color: '#38bdf8',
                    padding: '4px'
                  }}
                >
                  Row {rIdx + 1} (x={rIdx + 1})
                </div>
              ))}

              {/* Grid Rows (Seats 1 to 10 along Y-Axis, top to bottom or 10 to 1) */}
              {Array.from({ length: MAX_SEATS }).map((_, sIdx) => {
                const seatNum = MAX_SEATS - sIdx; // Seat 10 at top, Seat 1 at bottom
                return (
                  <React.Fragment key={`row-frag-${seatNum}`}>
                    {/* Y-axis label */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      color: '#f59e0b'
                    }}>
                      y={seatNum}
                    </div>

                    {/* Desks for each row */}
                    {Array.from({ length: MAX_ROWS }).map((_, rIdx) => {
                      const rowNum = rIdx + 1;
                      const isParth = rowNum === prob.parth[0] && seatNum === prob.parth[1];
                      const isAnish = rowNum === prob.anish[0] && seatNum === prob.anish[1];
                      const isAmit = rowNum === prob.amitRow && seatNum === prob.amitExpectedSeat;

                      const isSelected = selectedSeat && selectedSeat[0] === rowNum && selectedSeat[1] === seatNum;

                      let deskBg = '#1e293b';
                      let deskBorder = '#334155';
                      let content = `${rowNum},${seatNum}`;

                      if (stage >= 2 && isParth) {
                        deskBg = '#f59e0b';
                        deskBorder = '#ffffff';
                        content = 'Parth 🎯';
                      } else if (stage >= 3 && isAnish) {
                        deskBg = '#ec4899';
                        deskBorder = '#ffffff';
                        content = 'Anish 📄';
                      } else if (stage === 4 && isAmit) {
                        deskBg = '#10b981';
                        deskBorder = '#ffffff';
                        content = 'Amit 💥';
                      }

                      return (
                        <button
                          key={`desk-${rowNum}-${seatNum}`}
                          onClick={() => handleDeskClick(rowNum, seatNum)}
                          style={{
                            height: '38px',
                            background: deskBg,
                            border: `2px solid ${deskBorder}`,
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 0 10px #38bdf8' : 'none'
                          }}
                          onMouseEnter={e => {
                            if (deskBg === '#1e293b') e.currentTarget.style.borderColor = '#38bdf8';
                          }}
                          onMouseLeave={e => {
                            if (deskBg === '#1e293b') e.currentTarget.style.borderColor = '#334155';
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

          {/* Current Mission Prompt */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fef08a' }}>
              {stage === 1 && `Step 1: Plot Parth's location! Amit whispered: "Second row's seventh child is Parth!" Click (${prob.parth[0]}, ${prob.parth[1]}).`}
              {stage === 2 && `Step 2: Plot Anish's location! Anish was at Row ${prob.anish[0]}, 9th seat! Click (${prob.anish[0]}, ${prob.anish[1]}).`}
              {stage === 3 && `Step 3: Parth's eraser missed Anish and hit Amit in Row ${prob.amitRow} along the same straight line! Which seat was Amit sitting in?`}
              {stage === 4 && `Step 4: Eureka! All three students (${prob.amitRow}, ${prob.amitExpectedSeat}), (${prob.parth[0]}, ${prob.parth[1]}), (${prob.anish[0]}, ${prob.anish[1]}) lie on the line ${prob.equation}!`}
            </div>

            {stage === 4 && (
              <button
                onClick={handleNextRound}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '8px 20px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{roundIdx + 1 < CLASSROOM_ROUNDS.length ? 'Next Mystery ➔' : 'Complete Challenge 🎉'}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Area */}
        {feedback && (
          <div className="anim-pop" style={{
            padding: '12px 20px',
            borderRadius: '16px',
            background: feedback.isCorrect ? '#dcfce7' : '#fee2e2',
            border: `2px solid ${feedback.isCorrect ? '#86efac' : '#fca5a5'}`,
            color: feedback.isCorrect ? '#166534' : '#991b1b',
            fontWeight: 800,
            fontSize: '1rem',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {feedback.text}
          </div>
        )}

        {/* Mathematical Discovery Box */}
        {stage === 4 && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-accent)',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--clr-accent)', fontSize: '1.3rem', margin: '0 0 10px 0' }}>
              📐 The Straight Line Discovery (Collinearity)
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--clr-text)', maxWidth: '600px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              The trajectory of the thrown bullet followed a linear mathematical pattern:
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '12px 24px',
              fontSize: '1.4rem',
              fontWeight: 900,
              fontFamily: 'var(--font-kids)',
              color: '#3b82f6',
              marginBottom: '16px'
            }}>
              <span>Amit ({prob.amitRow}, {prob.amitExpectedSeat})</span>
              <span>➔</span>
              <span>Parth ({prob.parth[0]}, {prob.parth[1]})</span>
              <span>➔</span>
              <span>Anish ({prob.anish[0]}, {prob.anish[1]})</span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--clr-text)' }}>
              Equation of the Line: <strong style={{ color: '#10b981' }}>{prob.equation}</strong> (Slope m = {prob.slope})!
            </div>
          </div>
        )}

      </div>

      {/* Story Modal */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="Classroom Ka Fish Market!"
        badge="Story 1 • Coordinate Geometry"
        icon="🏫"
        story={`In Class A, the teacher was absent, so all the children were having fun and creating nuisance until the PT teacher landed and said: "Is this a fish market?!" In the meantime, Anish made a paper bullet and shot a headshot at Parth! Parth threw an eraser back, Anish dodged, and it hit Amit! Can you plot where Parth and Anish were sitting on the coordinate grid, and calculate which seat Amit was at?`}
        buttonText="Next ➔ Solve Classroom Mystery!"
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
