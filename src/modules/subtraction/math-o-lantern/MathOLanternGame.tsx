import React, { useState, useEffect } from 'react';
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
import { Sparkles, ArrowRight, RotateCcw, Compass, Footprints, Undo2 } from 'lucide-react';
import { GameProps } from '../../../types';

// Speech synthesis helper for friendly narration
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

export interface HopMilestone {
  target: number;
  hopAmount: number;
  label: string;
}

export interface TrailRound {
  title: string;
  start: number;
  dest: number;
  diff: number;
  hops: HopMilestone[];
}

export interface LevelConfig {
  level: number;
  name: string;
  badge: string;
  description: string;
  rounds: TrailRound[];
}

// 5 Progressive Levels tailored for young minds
const TRAIL_LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Firefly Hops (Within 30)',
    badge: 'Level 1 • Numbers up to 30',
    description: 'Learn the jump strategy with friendly 20 and 30!',
    rounds: [
      {
        title: 'Trail to 20',
        start: 14,
        dest: 20,
        diff: 6,
        hops: [
          { target: 20, hopAmount: 6, label: 'Hop to 20' }
        ]
      },
      {
        title: 'Trail to 30',
        start: 23,
        dest: 30,
        diff: 7,
        hops: [
          { target: 30, hopAmount: 7, label: 'Hop to 30' }
        ]
      },
      {
        title: 'Two-Hop Trail: 30 − 18',
        start: 18,
        dest: 30,
        diff: 12,
        hops: [
          { target: 20, hopAmount: 2, label: 'Hop to 20' },
          { target: 30, hopAmount: 10, label: 'Hop to 30' }
        ]
      }
    ]
  },
  {
    level: 2,
    name: 'Friendly Tens Trail (Within 60)',
    badge: 'Level 2 • Numbers up to 60',
    description: 'Hop to the next 10, then hop in friendly tens to the goal!',
    rounds: [
      {
        title: 'Trail to 50: 50 − 36',
        start: 36,
        dest: 50,
        diff: 14,
        hops: [
          { target: 40, hopAmount: 4, label: 'Hop to 40' },
          { target: 50, hopAmount: 10, label: 'Hop to 50' }
        ]
      },
      {
        title: 'Trail to 60: 60 − 27',
        start: 27,
        dest: 60,
        diff: 33,
        hops: [
          { target: 30, hopAmount: 3, label: 'Hop to 30' },
          { target: 60, hopAmount: 30, label: 'Hop to 60' }
        ]
      },
      {
        title: 'Trail to 50: 50 − 25',
        start: 25,
        dest: 50,
        diff: 25,
        hops: [
          { target: 30, hopAmount: 5, label: 'Hop to 30' },
          { target: 50, hopAmount: 20, label: 'Hop to 50' }
        ]
      }
    ]
  },
  {
    level: 3,
    name: 'Century Leap (Hop to 100)',
    badge: 'Level 3 • Numbers up to 100',
    description: 'Reach friendly 10, then leap all the way to 100!',
    rounds: [
      {
        title: 'Century Trail: 100 − 64',
        start: 64,
        dest: 100,
        diff: 36,
        hops: [
          { target: 70, hopAmount: 6, label: 'Hop to 70' },
          { target: 100, hopAmount: 30, label: 'Hop to 100' }
        ]
      },
      {
        title: 'Century Trail: 100 − 45',
        start: 45,
        dest: 100,
        diff: 55,
        hops: [
          { target: 50, hopAmount: 5, label: 'Hop to 50' },
          { target: 100, hopAmount: 50, label: 'Hop to 100' }
        ]
      },
      {
        title: 'Century Trail: 100 − 78',
        start: 78,
        dest: 100,
        diff: 22,
        hops: [
          { target: 80, hopAmount: 2, label: 'Hop to 80' },
          { target: 100, hopAmount: 20, label: 'Hop to 100' }
        ]
      }
    ]
  },
  {
    level: 4,
    name: 'Beyond Hundred (Up to 200)',
    badge: 'Level 4 • Numbers up to 200',
    description: 'Hop across 100 into friendly hundreds!',
    rounds: [
      {
        title: 'Across Century: 150 − 85',
        start: 85,
        dest: 150,
        diff: 65,
        hops: [
          { target: 90, hopAmount: 5, label: 'Hop to 90' },
          { target: 100, hopAmount: 10, label: 'Hop to 100' },
          { target: 150, hopAmount: 50, label: 'Hop to 150' }
        ]
      },
      {
        title: 'Trail to 200: 200 − 165',
        start: 165,
        dest: 200,
        diff: 35,
        hops: [
          { target: 170, hopAmount: 5, label: 'Hop to 170' },
          { target: 200, hopAmount: 30, label: 'Hop to 200' }
        ]
      }
    ]
  },
  {
    level: 5,
    name: 'Grand Trail Master (Up to 500)',
    badge: 'Level 5 • Numbers up to 500',
    description: 'Master big friendly hops to 300 and 500!',
    rounds: [
      {
        title: 'Grand Trail: 300 − 245',
        start: 245,
        dest: 300,
        diff: 55,
        hops: [
          { target: 250, hopAmount: 5, label: 'Hop to 250' },
          { target: 300, hopAmount: 50, label: 'Hop to 300' }
        ]
      },
      {
        title: 'Grand Trail: 500 − 438',
        start: 438,
        dest: 500,
        diff: 62,
        hops: [
          { target: 440, hopAmount: 2, label: 'Hop to 440' },
          { target: 500, hopAmount: 60, label: 'Hop to 500' }
        ]
      }
    ]
  }
];

interface CompletedHop {
  from: number;
  to: number;
  amount: number;
  color: string;
}

const HOP_COLORS = ['#f59e0b', '#10b981', '#38bdf8', '#a855f7'];

export default function MathOLanternGame({ onBack }: GameProps) {
  const [level, setLevel] = useState<number>(1);
  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [subMode, setSubMode] = useState<'guided' | 'sandbox'>('guided');

  const currentLevel = TRAIL_LEVELS[level - 1] || TRAIL_LEVELS[0];
  const currentRound = currentLevel.rounds[roundIdx] || currentLevel.rounds[0];
  const { start, dest, diff, hops } = currentRound;

  // Guided Journey State
  const [hopStep, setHopStep] = useState<number>(0);
  const [completedHops, setCompletedHops] = useState<CompletedHop[]>([]);
  const [currentPos, setCurrentPos] = useState<number>(start);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Sandbox Mode State
  const [sandboxPos, setSandboxPos] = useState<number>(start);
  const [sandboxHops, setSandboxHops] = useState<CompletedHop[]>([]);

  // Modals
  const [storyOpen, setStoryOpen] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Reset round state
  const resetRound = () => {
    setHopStep(0);
    setCompletedHops([]);
    setCurrentPos(start);
    setFeedback(null);
    setSandboxPos(start);
    setSandboxHops([]);
  };

  useEffect(() => {
    resetRound();
  }, [level, roundIdx]);

  // All milestone stations along the trail for visual display
  const trailMilestones = [start, ...hops.map(h => h.target)];

  // Current target milestone for guided mode
  const currentMilestone = hops[hopStep];
  const isGuidedFinished = hopStep >= hops.length;

  // Options for the active hop question
  const getHopOptions = () => {
    if (!currentMilestone) return [];
    const correct = currentMilestone.hopAmount;
    const opts = new Set<number>([correct]);

    const potentialDeltas = correct <= 10
      ? [-2, -1, 1, 2, 3, 4]
      : [-20, -10, 10, 20];

    for (const d of potentialDeltas) {
      if (opts.size >= 3) break;
      const fake = correct + d;
      if (fake > 0 && fake !== correct) {
        opts.add(fake);
      }
    }
    return Array.from(opts).sort((a, b) => a - b);
  };

  const [options, setOptions] = useState<number[]>([]);
  useEffect(() => {
    if (!isGuidedFinished && currentMilestone) {
      setOptions(getHopOptions());
    }
  }, [hopStep, level, roundIdx]);

  // Handle option click in Guided Mode
  const handleSelectHop = (chosenAmount: number) => {
    if (!currentMilestone) return;

    if (chosenAmount === currentMilestone.hopAmount) {
      playHop();
      playSuccessChime();

      const newHop: CompletedHop = {
        from: currentPos,
        to: currentMilestone.target,
        amount: chosenAmount,
        color: HOP_COLORS[hopStep % HOP_COLORS.length]
      };

      const nextPos = currentMilestone.target;
      const nextStep = hopStep + 1;

      setCompletedHops(prev => [...prev, newHop]);
      setCurrentPos(nextPos);
      setFeedback({
        text: `Great hop! +${chosenAmount} takes Jugnu to milestone ${nextPos}!`,
        isCorrect: true
      });
      speak(`Hop plus ${chosenAmount}! Reached ${nextPos}!`);

      setTimeout(() => {
        setFeedback(null);
        setHopStep(nextStep);

        if (nextStep >= hops.length) {
          playVictoryFanfare();
          setStars(s => s + 3);
          speak(`Destination ${dest} reached! Total hops equal ${diff}! So ${dest} minus ${start} is ${diff}!`, 0.85);
        }
      }, 900);
    } else {
      playGentleBoing();
      const hint = `Check: from ${currentPos} to ${currentMilestone.target} is +${currentMilestone.hopAmount}!`;
      setFeedback({ text: hint, isCorrect: false });
      speak(hint, 0.85);
    }
  };

  // Sandbox Mode: Free jump increments
  const handleSandboxHop = (amt: number) => {
    if (sandboxPos + amt > dest) {
      playGentleBoing();
      speak(`That hop of +${amt} would overshoot ${dest}! Try a smaller hop.`, 0.85);
      return;
    }

    playHop();
    const newPos = sandboxPos + amt;
    const newHop: CompletedHop = {
      from: sandboxPos,
      to: newPos,
      amount: amt,
      color: HOP_COLORS[sandboxHops.length % HOP_COLORS.length]
    };

    setSandboxHops(prev => [...prev, newHop]);
    setSandboxPos(newPos);
    speak(`Plus ${amt}, now at ${newPos}`);

    if (newPos === dest) {
      playVictoryFanfare();
      playSuccessChime();
      setStars(s => s + 3);
      speak(`Goal reached! All your hops sum to ${diff}!`, 0.85);
    }
  };

  const handleUndoSandboxHop = () => {
    if (sandboxHops.length === 0) return;
    playPop();
    const newHops = [...sandboxHops];
    newHops.pop();
    const lastPos = newHops.length > 0 ? newHops[newHops.length - 1].to : start;
    setSandboxHops(newHops);
    setSandboxPos(lastPos);
  };

  // Advance round or level
  const handleNextRoundOrLevel = () => {
    if (roundIdx + 1 < currentLevel.rounds.length) {
      setRoundIdx(r => r + 1);
    } else {
      setShowCelebration(true);
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    if (level < 5) {
      setLevel(l => l + 1);
      setRoundIdx(0);
    } else {
      setLevel(1);
      setRoundIdx(0);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setRoundIdx(0);
    resetRound();
  };

  const totalGuidedAmount = completedHops.reduce((sum, h) => sum + h.amount, 0);
  const totalSandboxAmount = sandboxHops.reduce((sum, h) => sum + h.amount, 0);

  return (
    <QuizLayout
      title="Math O' Lantern: Jump Trail"
      subtitle="Discover subtraction by hopping forward along the friendly lantern trail!"
      category="Counting-Up Subtraction"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>

        {/* Level and Mode Header */}
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
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              {currentLevel.badge} • Round {roundIdx + 1} of {currentLevel.rounds.length}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              Subtraction Goal: {dest} − {start} = ?
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                playPop();
                setSubMode('guided');
              }}
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                background: subMode === 'guided' ? '#f59e0b' : 'var(--clr-surface)',
                color: subMode === 'guided' ? '#ffffff' : 'var(--clr-text)',
                border: '1px solid var(--clr-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={16} />
              <span>Guided Journey</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setSubMode('sandbox');
              }}
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                background: subMode === 'sandbox' ? '#f59e0b' : 'var(--clr-surface)',
                color: subMode === 'sandbox' ? '#ffffff' : 'var(--clr-text)',
                border: '1px solid var(--clr-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Compass size={16} />
              <span>Free Sandbox</span>
            </button>
          </div>
        </div>

        {/* GLOWING NUMBER LINE TRAIL SCENE */}
        <div style={{
          background: 'linear-gradient(180deg, #181124 0%, #24143a 100%)',
          borderRadius: '24px',
          border: '3px solid #7c3aed',
          padding: '24px 20px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.35)',
          color: '#ffffff',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Subtraction Concept Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 800, color: '#fef08a' }}>
              <span>🏮</span>
              <span>Find the distance from {start} to {dest}!</span>
              <span style={{ fontSize: '1.1rem', opacity: 0.8, marginLeft: '6px' }}>🌙✨</span>
            </div>

            <div style={{
              background: 'rgba(254, 240, 138, 0.15)',
              border: '1px solid #fef08a',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 16px',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#fef08a',
              whiteSpace: 'nowrap'
            }}>
              Hops Counted: {subMode === 'guided' ? totalGuidedAmount : totalSandboxAmount} / {diff}
            </div>
          </div>

          {/* SVG Visual Number Line with Bouncy Hop Arcs */}
          <div style={{ position: 'relative', margin: '20px 0 10px 0' }}>
            <svg
              viewBox="0 0 600 130"
              style={{ width: '100%', height: 'auto', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="trailLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>

                <filter id="glowArc" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Number Line Axis */}
              <line
                x1="40"
                y1="100"
                x2="560"
                y2="100"
                stroke="url(#trailLineGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Render Nodes along the Axis */}
              {trailMilestones.map((val, idx) => {
                const totalNodes = trailMilestones.length;
                const cx = 50 + (idx * (500 / (totalNodes - 1)));
                const cy = 100;
                const isReached = subMode === 'guided'
                  ? currentPos >= val
                  : sandboxPos >= val;
                const isStart = val === start;
                const isDest = val === dest;

                return (
                  <g key={`node-${val}-${idx}`}>
                    {/* Tick Mark */}
                    <line x1={cx} y1="92" x2={cx} y2="108" stroke="#ffffff" strokeWidth="2" />

                    {/* Milestone Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill={isReached ? (isDest ? '#a855f7' : isStart ? '#f59e0b' : '#10b981') : '#33204e'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Milestone Number Label */}
                    <text
                      x={cx}
                      y={cy + 4}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="900"
                      textAnchor="middle"
                      fontFamily="var(--font-kids)"
                    >
                      {val}
                    </text>

                    {/* Lantern Icon above milestone when reached */}
                    {isReached && (
                      <text
                        x={cx}
                        y={cy - 20}
                        fontSize="14"
                        textAnchor="middle"
                        style={{ filter: 'drop-shadow(0 0 6px #fef08a)' }}
                      >
                        🏮
                      </text>
                    )}

                    {/* Bottom Tag */}
                    <text
                      x={cx}
                      y={cy + 22}
                      fill={isDest ? '#c084fc' : isStart ? '#fde68a' : '#86efac'}
                      fontSize="9"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {isStart ? 'Start' : isDest ? 'Goal' : 'Ten'}
                    </text>
                  </g>
                );
              })}

              {/* Render Completed Hop Arcs */}
              {(subMode === 'guided' ? completedHops : sandboxHops).map((hop, hIdx) => {
                // Find node index or interpolate
                const totalNodes = trailMilestones.length;
                const fromIdx = trailMilestones.indexOf(hop.from);
                const toIdx = trailMilestones.indexOf(hop.to);

                const x1 = fromIdx !== -1
                  ? 50 + (fromIdx * (500 / (totalNodes - 1)))
                  : 50 + ((hop.from - start) / (dest - start)) * 500;

                const x2 = toIdx !== -1
                  ? 50 + (toIdx * (500 / (totalNodes - 1)))
                  : 50 + ((hop.to - start) / (dest - start)) * 500;

                const midX = (x1 + x2) / 2;
                const arcHeight = Math.min(65, 30 + Math.abs(x2 - x1) * 0.25);
                const midY = 100 - arcHeight;

                return (
                  <g key={`hop-${hIdx}`}>
                    {/* Parabolic Jump Arc */}
                    <path
                      d={`M ${x1} 96 Q ${midX} ${midY} ${x2} 96`}
                      fill="none"
                      stroke={hop.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="6 2"
                      filter="url(#glowArc)"
                    />

                    {/* Hop Amount Badge */}
                    <rect
                      x={midX - 16}
                      y={midY - 14}
                      width="32"
                      height="18"
                      rx="9"
                      fill={hop.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={midX}
                      y={midY - 2}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      +{hop.amount}
                    </text>
                  </g>
                );
              })}

              {/* Jugnu the Firefly Active Position Indicator */}
              {(() => {
                const totalNodes = trailMilestones.length;
                const activeVal = subMode === 'guided' ? currentPos : sandboxPos;
                const activeIdx = trailMilestones.indexOf(activeVal);
                const curX = activeIdx !== -1
                  ? 50 + (activeIdx * (500 / (totalNodes - 1)))
                  : 50 + ((activeVal - start) / (dest - start)) * 500;

                return (
                  <g transform={`translate(${curX - 14}, 54)`}>
                    <text fontSize="20" style={{ filter: 'drop-shadow(0 0 8px #fde047)' }}>
                      🪲💡
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Traveler Status Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-pill)',
            padding: '8px 18px',
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#fef08a'
          }}>
            <span>📍 Position: <strong>{subMode === 'guided' ? currentPos : sandboxPos}</strong></span>
            <span>🏁 Destination: <strong>{dest}</strong></span>
            <span>Remaining: <strong>{dest - (subMode === 'guided' ? currentPos : sandboxPos)}</strong> steps</span>
          </div>
        </div>

        {/* 1. GUIDED JOURNEY INTERACTION */}
        {subMode === 'guided' && (
          <div>
            {!isGuidedFinished && currentMilestone && (
              <div className="anim-pop" style={{
                background: 'var(--clr-card)',
                border: '2px solid var(--clr-accent)',
                borderRadius: '20px',
                padding: '24px 20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--clr-text)',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Footprints size={22} color="var(--clr-accent)" />
                  <span>
                    Jugnu is at <strong>{currentPos}</strong>. How many steps to reach milestone <strong>{currentMilestone.target}</strong>?
                  </span>
                </div>

                {/* Big, Clear Hop Choice Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '14px',
                  flexWrap: 'wrap',
                  marginBottom: '16px'
                }}>
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectHop(opt)}
                      style={{
                        padding: '14px 28px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--clr-surface)',
                        border: '2px solid var(--clr-border)',
                        color: 'var(--clr-text)',
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-kids)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-btn)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#f59e0b';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      +{opt} 🏮
                    </button>
                  ))}
                </div>

                {/* Feedback message */}
                {feedback && (
                  <div className="anim-pop" style={{
                    display: 'inline-block',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    background: feedback.isCorrect ? '#dcfce7' : '#fee2e2',
                    color: feedback.isCorrect ? '#166534' : '#991b1b',
                    border: `1px solid ${feedback.isCorrect ? '#86efac' : '#fca5a5'}`
                  }}>
                    {feedback.text}
                  </div>
                )}
              </div>
            )}

            {/* AHA! SUBTRACTION REVEAL BANNER (When All Hops Completed) */}
            {isGuidedFinished && (
              <div className="anim-pop" style={{
                background: 'var(--clr-card)',
                border: '3px solid #10b981',
                borderRadius: '24px',
                padding: '28px 20px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ color: '#10b981', fontSize: '1.45rem', fontWeight: 900, margin: '0 0 10px 0' }}>
                  Destination Reached! The Secret of Subtraction!
                </h3>

                <p style={{ fontSize: '1.05rem', color: 'var(--clr-text-soft)', maxWidth: '560px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                  Instead of taking away backwards, we hopped forward from <strong>{start}</strong> to <strong>{dest}</strong>!
                </p>

                {/* The Visual Equation Equation */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  background: 'var(--clr-surface)',
                  border: '2px solid var(--clr-border)',
                  borderRadius: '16px',
                  padding: '14px 24px',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-kids)',
                  color: 'var(--clr-text)',
                  marginBottom: '20px'
                }}>
                  {completedHops.map((h, i) => (
                    <span key={i}>
                      <span style={{ color: h.color }}>+{h.amount}</span>
                      {i < completedHops.length - 1 && <span style={{ margin: '0 6px', color: 'var(--clr-text-soft)' }}>+</span>}
                    </span>
                  ))}
                  <span style={{ margin: '0 8px', color: 'var(--clr-accent)' }}>=</span>
                  <span style={{ color: '#10b981', background: '#dcfce7', padding: '2px 12px', borderRadius: '8px' }}>
                    {diff}
                  </span>
                  <span style={{ margin: '0 10px', color: 'var(--clr-text-soft)' }}>➔</span>
                  <span style={{ color: '#f59e0b' }}>{dest} − {start} = {diff} ✓</span>
                </div>

                <div>
                  <button
                    onClick={handleNextRoundOrLevel}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-pill)',
                      padding: '12px 32px',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{roundIdx + 1 < currentLevel.rounds.length ? 'Next Trail Challenge ➔' : 'Complete Level 🎉'}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. FREE SANDBOX MODE INTERACTION */}
        {subMode === 'sandbox' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0 0 6px 0' }}>
              🧪 Free Jump Explorer
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--clr-text-soft)', margin: '0 0 16px 0' }}>
              Choose your own hops to reach <strong>{dest}</strong> from <strong>{start}</strong>!
            </p>

            {/* Clear, logical jump buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {[1, 5, 10, 20, 50].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleSandboxHop(amt)}
                  disabled={sandboxPos + amt > dest}
                  style={{
                    background: 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '10px 20px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--clr-text)',
                    cursor: sandboxPos + amt > dest ? 'not-allowed' : 'pointer',
                    opacity: sandboxPos + amt > dest ? 0.35 : 1,
                    boxShadow: 'var(--shadow-btn)'
                  }}
                >
                  +{amt} 🏮
                </button>
              ))}
            </div>

            {/* Controls: Undo & Reset */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleUndoSandboxHop}
                disabled={sandboxHops.length === 0}
                style={{
                  background: 'var(--clr-surface)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '8px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--clr-text-soft)',
                  cursor: sandboxHops.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: sandboxHops.length === 0 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Undo2 size={16} />
                <span>Undo Last Hop</span>
              </button>

              <button
                onClick={() => {
                  playPop();
                  setSandboxPos(start);
                  setSandboxHops([]);
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '8px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--clr-text-soft)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={16} />
                <span>Reset Trail</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Story Modal with Voice Narration */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="Jugnu & the Glowing Lantern Trail"
        badge="Counting-Up Story"
        icon="🏮"
        story={`Meet Jugnu the glowing firefly! Did you know that subtraction is really just measuring distance? To find out what ${dest} minus ${start} is, we don't have to take anything away. Instead, Jugnu starts at ${start} and takes friendly hops forward until reaching ${dest}! All the hops you take add up to the exact answer!`}
        buttonText="Next ➔ Start Hopping!"
      />

      {/* Level Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Trailblazer Champion! 🏮🌟"
          subtitle={`You mastered all the jump trails in ${currentLevel.name}! You know how to hop forward to find the difference!`}
          stars={3}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={level < 5}
        />
      )}
    </QuizLayout>
  );
}
