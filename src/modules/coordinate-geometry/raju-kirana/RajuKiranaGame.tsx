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
import { Sparkles, ArrowRight, RotateCcw, Search, ShieldCheck, FileText, CheckCircle2, BookOpen, Volume2 } from 'lucide-react';
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

interface ReceiptLine {
  day: string;
  equation: string;
  yIntercept: number; // when x=0
  xIntercept: number; // when y=0
  color: string;
  isPlotted: boolean;
}

export interface RajuKiranaGameProps extends GameProps {
  isEmbedded?: boolean;
  onNextChapter?: () => void;
  onChapterStars?: (stars: number) => void;
}

export default function RajuKiranaGame({ onBack, isEmbedded, onNextChapter, onChapterStars }: RajuKiranaGameProps) {
  const [showStoryPrologue, setShowStoryPrologue] = useState<boolean>(true);
  const [prologueAns, setPrologueAns] = useState<boolean | null>(null);
  const [stars, setStars] = useState<number>(0);
  const [storyOpen, setStoryOpen] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // 3 Lines for Monday, Tuesday, Wednesday
  const [lines, setLines] = useState<ReceiptLine[]>([
    { day: "Monday", equation: "x + y = 4", yIntercept: 4, xIntercept: 4, color: "#38bdf8", isPlotted: false },
    { day: "Tuesday", equation: "2x + y = 8", yIntercept: 8, xIntercept: 4, color: "#f59e0b", isPlotted: false },
    { day: "Wednesday", equation: "3x + y = 12", yIntercept: 12, xIntercept: 4, color: "#ec4899", isPlotted: false },
  ]);

  const [activeStep, setActiveStep] = useState<number>(0); // 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = find intersection
  const [identifiedIntersection, setIdentifiedIntersection] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Plot next day's receipt line
  const handlePlotReceiptLine = (idx: number) => {
    playPop(520 + idx * 80);
    playSuccessChime();

    setLines(prev => prev.map((l, i) => i === idx ? { ...l, isPlotted: true } : l));
    const nextStep = idx + 1;
    setActiveStep(nextStep);

    if (nextStep < 3) {
      speak(`${lines[idx].day} receipt plotted: ${lines[idx].equation}! Now inspect ${lines[nextStep].day}'s sales receipt!`);
    } else {
      speak(`All 3 lines are plotted on the coordinate plane! Notice that all three lines meet at exactly one point! Tap the intersection point to reveal the thief's identity!`);
    }
  };

  // Identify intersection point
  const handleSelectIntersection = (x: number, y: number) => {
    if (x === 4 && y === 0) {
      playSuccessChime();
      playVictoryFanfare();
      setStars(s => s + 3);
      onChapterStars?.(3);
      setIdentifiedIntersection(true);
      setFeedback({
        text: `BULLSEYE! Intersection Point (4, 0) identified! The thief bought 4 packets of Chips and 0 bottles of Juice!`,
        isCorrect: true
      });
      speak(`Bullseye! Point 4 comma 0! The suspect bought 4 packets of chips and 0 bottles of juice! His mathematical fingerprint caught him!`);
      setTimeout(() => {
        setShowCelebration(true);
      }, 1800);
    } else {
      playGentleBoing();
      const hint = `Check where the blue, amber, and pink lines intersect! They all meet on the X-axis where y = 0.`;
      setFeedback({ text: hint, isCorrect: false });
      speak(hint);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setLines(prev => prev.map(l => ({ ...l, isPlotted: false })));
    setActiveStep(0);
    setIdentifiedIntersection(false);
    setFeedback(null);
  };

  const content = (
    <>
      <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>

        {/* Case File Header */}
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
              Story 3 • Crime Investigation & Systems of Equations
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              Case: Raju Kirana Chips & Juice Mystery
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                playPop();
                setShowStoryPrologue(p => !p);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 800,
                background: showStoryPrologue ? '#ec4899' : 'var(--clr-surface)',
                color: showStoryPrologue ? '#ffffff' : 'var(--clr-text)',
                border: '1px solid var(--clr-border)',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={14} />
              <span>{showStoryPrologue ? "Evidence Graph Board ➔" : "Story & Case File"}</span>
            </button>

            <div style={{
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 16px',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#38bdf8'
            }}>
              Status: {showStoryPrologue ? "Case Briefing 📋" : (activeStep < 3 ? `Analyzing Evidence (${activeStep}/3)` : (identifiedIntersection ? "Suspect Caught! 🚨" : "Find Intersection!"))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PROLOGUE: THE CHIPS & JUICE ROBBERY MYSTERY BRIEFING           */}
        {/* ============================================================== */}
        {showStoryPrologue && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #ec4899',
            borderRadius: '24px',
            padding: '24px 20px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.5rem' }}>🔍</span>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-kids)', fontSize: '1.35rem', color: 'var(--clr-text)' }}>
                Case File #401: The Chips & Juice Robbery Mystery
              </h3>
            </div>

            {/* 4 Comic Narrative Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🏦 🚨</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#ef4444' }}>1. The Small Town Robbery</h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--clr-text-soft)', lineHeight: 1.45 }}>
                  A small town bank was robbed of massive cash by 4 unknown thieves. The town was in chaos, but the police were stuck with zero fingerprints, no CCTV footage, and no witnesses!
                </p>
              </div>

              <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>✉️ 🕵️</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#f59e0b' }}>2. The Well-Wisher's Chit</h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--clr-text-soft)', lineHeight: 1.45 }}>
                  A shadowy man slipped a note to the inspector and vanished: <em>"You can catch all four if you catch one... He likes chips and juice. He visits Raju Kirana Store. Find him."</em>
                </p>
              </div>

              <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🧾 🍟</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#38bdf8' }}>3. Why One Equation Fails!</h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--clr-text-soft)', lineHeight: 1.45 }}>
                  At Raju Kirana, Monday's receipt showed: <strong style={{ color: '#38bdf8' }}>x + y = 4</strong> (x = chips, y = juice).
                  <br />
                  Could he have bought (0,4), (1,3), (2,2), (3,1), or (4,0)? A single equation has too many possibilities!
                </p>
              </div>

              <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🎯 📍</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#10b981' }}>4. The Intersection Point (4, 0)!</h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--clr-text-soft)', lineHeight: 1.45 }}>
                  Tuesday's receipt: <strong style={{ color: '#f59e0b' }}>2x + y = 8</strong>.
                  <br />
                  Wednesday's receipt: <strong style={{ color: '#ec4899' }}>3x + y = 12</strong>.
                  <br />
                  When the detective entered these into GeoGebra, all three lines met at <strong style={{ color: '#10b981' }}>(4, 0)</strong>! 4 chips, 0 juice—his exact mathematical fingerprint!
                </p>
              </div>
            </div>

            {/* Intuition Concept Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%)',
              border: '2px solid #ec4899',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '18px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📐</span>
                <span>The Core Mathematical Insight: Systems of Linear Equations</span>
              </h4>
              <div style={{ fontSize: '0.88rem', color: 'var(--clr-text)', lineHeight: 1.5 }}>
                • <strong>A Single Line:</strong> Represents all pairs of (x, y) that satisfy one receipt. Infinite points!<br />
                • <strong>The Intersection Point:</strong> The UNIQUE point where all 3 receipts agree simultaneously.<br />
                • The thief deliberately avoided juice to look normal, but (4, 0) appeared on every single receipt line!
              </div>
            </div>

            {/* Quick Intuition Check */}
            <div style={{
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--clr-text)', marginBottom: '8px' }}>
                🤔 Quick Detective Check: Why did the detective need more than one day's receipt?
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    playSuccessChime();
                    setPrologueAns(true);
                    speak("Correct! One line has many pairs, but intersecting lines isolate the single truth!");
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)',
                    background: prologueAns === true ? '#10b981' : 'var(--clr-card)',
                    color: prologueAns === true ? '#ffffff' : 'var(--clr-text)',
                    border: `2px solid ${prologueAns === true ? '#10b981' : 'var(--clr-border)'}`,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  One equation gives many possibilities; intersecting lines isolate the unique answer!
                </button>

                <button
                  onClick={() => {
                    playGentleBoing();
                    setPrologueAns(false);
                    speak("No, multiple lines are needed to find the single point that satisfies all conditions!");
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)',
                    background: prologueAns === false ? '#ef4444' : 'var(--clr-card)',
                    color: prologueAns === false ? '#ffffff' : 'var(--clr-text)',
                    border: `2px solid ${prologueAns === false ? '#ef4444' : 'var(--clr-border)'}`,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  One equation alone is enough to catch a thief
                </button>
              </div>

              {prologueAns === false && (
                <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#ef4444', fontWeight: 700 }}>
                  ⚠️ Remember: x + y = 4 can be (0,4), (1,3), (2,2), (3,1), or (4,0)! You need intersecting lines!
                </div>
              )}
              {prologueAns === true && (
                <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                  ✅ Exactly! The intersection point of the lines gives the unique solution!
                </div>
              )}
            </div>

            {/* Enter Board Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  playPop(600);
                  setShowStoryPrologue(false);
                  speak("Opening Detective Evidence Board! Plot Monday's receipt line to begin!");
                }}
                style={{
                  background: '#ec4899',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '14px 28px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(236, 72, 153, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Open Detective Board & Plot Evidence Lines ➔</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* COORDINATE GRAPH (EVIDENCE BOARD)                              */}
        {/* ============================================================== */}
        {!showStoryPrologue && (
          <>
        <div style={{
          background: '#0a0f1d',
          borderRadius: '24px',
          border: '3px solid #0284c7',
          padding: '24px 20px',
          boxShadow: '0 8px 30px rgba(2, 132, 199, 0.35)',
          color: '#ffffff',
          marginBottom: '20px',
          position: 'relative'
        }}>

          {/* Graph Sub-banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 800, color: '#fef08a' }}>
              <Search size={20} color="#38bdf8" />
              <span>Coordinate Evidence Board (x = Chips 🍟, y = Juice 🧃)</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {lines.map((l, i) => (
                <span
                  key={i}
                  style={{
                    background: l.isPlotted ? l.color : '#1e293b',
                    color: l.isPlotted ? '#000000' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    border: `1px solid ${l.color}`
                  }}
                >
                  {l.day}: {l.equation}
                </span>
              ))}
            </div>
          </div>

          {/* SVG Graph Plane */}
          <div style={{ position: 'relative', margin: '14px 0 10px 0' }}>
            <svg
              viewBox="0 0 600 240"
              style={{ width: '100%', height: 'auto', overflow: 'visible' }}
            >
              {/* Grid Lines */}
              {Array.from({ length: 9 }).map((_, xi) => {
                const x = 60 + xi * 55;
                return (
                  <g key={`x-grid-${xi}`}>
                    <line x1={x} y1="20" x2={x} y2="200" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={x} y="218" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="700">
                      x={xi} (Chips)
                    </text>
                  </g>
                );
              })}

              {/* Y Grid lines (0, 2, 4, 6, 8, 10, 12) */}
              {[0, 2, 4, 6, 8, 10, 12].map((yVal) => {
                const y = 200 - (yVal / 14) * 180;
                return (
                  <g key={`y-grid-${yVal}`}>
                    <line x1="60" y1={y} x2="520" y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="50" y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end" fontWeight="700">
                      y={yVal}
                    </text>
                  </g>
                );
              })}

              {/* Main Axes */}
              <line x1="60" y1="20" x2="60" y2="200" stroke="#64748b" strokeWidth="2.5" />
              <line x1="60" y1="200" x2="530" y2="200" stroke="#64748b" strokeWidth="2.5" />

              {/* Plotted Linear Equation Lines */}
              {lines.map((l, i) => {
                if (!l.isPlotted) return null;

                // Points: (0, yIntercept) and (xIntercept, 0)
                const x1 = 60;
                const y1 = 200 - (l.yIntercept / 14) * 180;
                const x2 = 60 + l.xIntercept * 55;
                const y2 = 200;

                return (
                  <g key={`plotted-line-${i}`}>
                    {/* The Line */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={l.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Y-intercept node */}
                    <circle cx={x1} cy={y1} r="5" fill={l.color} stroke="#ffffff" strokeWidth="1.5" />
                    <text x={x1 + 8} y={y1 + 4} fill={l.color} fontSize="9" fontWeight="800">
                      (0, {l.yIntercept})
                    </text>
                  </g>
                );
              })}

              {/* Intersection Point (4, 0) */}
              {activeStep >= 3 && (
                <g
                  onClick={() => handleSelectIntersection(4, 0)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible generous hit target for mobile/tablet/touch */}
                  <circle
                    cx={60 + 4 * 55}
                    cy={200}
                    r={28}
                    fill="transparent"
                  />
                  <circle
                    cx={60 + 4 * 55}
                    cy={200}
                    r={identifiedIntersection ? 11 : 9}
                    fill={identifiedIntersection ? '#10b981' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="anim-pop"
                  />
                  <text
                    x={60 + 4 * 55}
                    y={178}
                    fill={identifiedIntersection ? '#34d399' : '#f87171'}
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    Intersection (4, 0)!
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Clue Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.92rem', color: '#fef08a', fontWeight: 700 }}>
              {activeStep < 3 && `Step ${activeStep + 1}: Inspect ${lines[activeStep].day}'s sales receipt (${lines[activeStep].equation}) and plot it on the graph!`}
              {activeStep >= 3 && !identifiedIntersection && "Step 4: All 3 days plotted! Find where all three lines cross each other and tap the intersection point!"}
              {identifiedIntersection && "SUSPECT CONFIRMED: 4 Packets of Chips, 0 Bottles of Juice! The mathematical fingerprint matched!"}
            </div>

            {activeStep < 3 && (
              <button
                onClick={() => handlePlotReceiptLine(activeStep)}
                style={{
                  background: lines[activeStep].color,
                  color: '#000000',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '8px 18px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Plot {lines[activeStep].day} Line ➔</span>
                <ArrowRight size={16} />
              </button>
            )}

            {activeStep >= 3 && !identifiedIntersection && (
              <button
                onClick={() => handleSelectIntersection(4, 0)}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '8px 20px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
              >
                <span>Identify Suspect at (4, 0) ➔</span>
                <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Receipt Evidence Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}>
          {lines.map((l, i) => (
            <div
              key={i}
              style={{
                background: 'var(--clr-card)',
                border: `2px solid ${l.isPlotted ? l.color : 'var(--clr-border)'}`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)',
                opacity: l.isPlotted ? 1 : (i === activeStep ? 0.95 : 0.5)
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, color: l.color, fontSize: '0.9rem' }}>
                  🧾 {l.day} Receipt
                </span>
                {l.isPlotted && <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>Plotted ✓</span>}
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)', marginBottom: '6px' }}>
                {l.equation}
              </div>

              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--clr-text-soft)' }}>
                If 0 chips (x=0) ➔ y={l.yIntercept} juices. If 0 juice (y=0) ➔ x={l.xIntercept} chips.
              </p>
            </div>
          ))}
        </div>

        {/* Feedback Message */}
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

        {/* Solved Case Card */}
        {identifiedIntersection && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#10b981', fontSize: '1.35rem', margin: '0 0 10px 0' }}>
              🔍 "The intersection isn't just where three lines meet..."
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', maxWidth: '640px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              "...It's where three days of evidence agree on the exact same suspect! x = 4 chips, y = 0 juice. Point (4, 0) cracked the bank robbery!"
            </p>

            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#92400e',
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '0.92rem',
              fontWeight: 700,
              maxWidth: '560px',
              margin: '0 auto'
            }}>
              ✉️ Mysterious Note: "You can catch all four of them if you catch one..." TO BE CONTINUED!
            </div>
          </div>
        )}
        </>
        )}

      </div>

      {/* Story Modal */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="The Raju Kirana Bank Robbery!"
        badge="Story 3 • Intersection of Lines"
        icon="🔍"
        story={`There was a bank robbery in a small town. Four thieves, but zero fingerprints, no clear CCTV! Suddenly, a mysterious man handed a chit: "You can catch all four if you catch one... He visits Raju Kirana Store and buys a particular combination of chips and juice!" The storekeeper's receipts revealed three equations: Monday (x + y = 4), Tuesday (2x + y = 8), and Wednesday (3x + y = 12). Graph the lines and find the intersection point to crack the case!`}
        buttonText="Next ➔ Solve with Linear Equations!"
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Case Solved! Detective Champion 🔍🏆"
          subtitle="You solved the bank robbery using simultaneous linear equations and the intersection point (4, 0)!"
          stars={3}
          onNextLevel={() => {
            setShowCelebration(false);
            if (onNextChapter) {
              onNextChapter();
            } else {
              handleReplay();
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
      title="Raju Kirana Bank Robbery"
      subtitle="Solve the bank robbery by finding the intersection point of linear equations!"
      category="Coordinate Geometry / निर्देशांक"
      level={activeStep + 1}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      {content}
    </QuizLayout>
  );
}
