import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import { playPop, playSuccessChime, playGentleBoing, playHop, playVictoryFanfare } from '../../../core/soundEffects';
import { Sparkles, ArrowRight, RotateCcw, Compass, CheckCircle2, Footprints } from 'lucide-react';
import { GameProps } from '../../../types';
import spec from './spec.json';

// Child-friendly slow speech synthesis helper
function speak(text: string | number, rate: number = 0.82, pitch: number = 1.15): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

interface TrailProblem {
  level: number;
  start: number; // Subtrahend
  dest: number;  // Minuend
  diff: number;  // dest - start
  benchmark10: number; // next friendly 10 (e.g. 53 -> 60)
  hop1: number; // e.g. 7
  benchmark100: number; // next friendly 100 (e.g. 60 -> 100)
  hop2: number; // e.g. 40
  hop3: number; // e.g. 400
  title: string;
}

const LANTERN_PROBLEMS: TrailProblem[] = [
  { level: 1, start: 28, dest: 300, diff: 272, benchmark10: 30, hop1: 2, benchmark100: 100, hop2: 70, hop3: 200, title: "Starter Trail: 300 − 28" },
  { level: 2, start: 65, dest: 400, diff: 335, benchmark10: 70, hop1: 5, benchmark100: 100, hop2: 30, hop3: 300, title: "Forest Trail: 400 − 65" },
  { level: 3, start: 53, dest: 500, diff: 447, benchmark10: 60, hop1: 7, benchmark100: 100, hop2: 40, hop3: 400, title: "Magic Trail: 500 − 53" },
  { level: 4, start: 84, dest: 600, diff: 516, benchmark10: 90, hop1: 6, benchmark100: 100, hop2: 10, hop3: 500, title: "Moonlight Trail: 600 − 84" },
  { level: 5, start: 49, dest: 700, diff: 651, benchmark10: 50, hop1: 1, benchmark100: 100, hop2: 50, hop3: 600, title: "Grand Trail: 700 − 49" }
];

interface JumpRecord {
  from: number;
  to: number;
  distance: number;
  label: string;
}

export default function MathOLanternGame({ onBack }: GameProps) {
  const [level, setLevel] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);
  const [subMode, setSubMode] = useState<'guided' | 'sandbox'>('guided');
  const [storyOpen, setStoryOpen] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const prob = LANTERN_PROBLEMS[level - 1] || LANTERN_PROBLEMS[0];
  const { start, dest, diff, benchmark10, hop1, benchmark100, hop2, hop3 } = prob;

  // Guided Journey step: 0 = hop to 10, 1 = hop to 100, 2 = hop to dest, 3 = summary
  const [guidedStep, setGuidedStep] = useState<number>(0);
  const [completedJumps, setCompletedJumps] = useState<JumpRecord[]>([]);
  const [currentPosition, setCurrentPosition] = useState<number>(start);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Sandbox mode state
  const [sandboxPos, setSandboxPos] = useState<number>(start);
  const [sandboxJumps, setSandboxJumps] = useState<JumpRecord[]>([]);

  // Reset problem state
  const resetForLevel = (newProb: TrailProblem) => {
    setGuidedStep(0);
    setCompletedJumps([]);
    setCurrentPosition(newProb.start);
    setFeedback(null);
    setSandboxPos(newProb.start);
    setSandboxJumps([]);
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    const nextLvl = level < 5 ? level + 1 : 1;
    setLevel(nextLvl);
    resetForLevel(LANTERN_PROBLEMS[nextLvl - 1]);
  };

  const handleReplay = () => {
    setShowCelebration(false);
    resetForLevel(prob);
  };

  // Total lanterns collected so far
  const totalGuidedLanterns = completedJumps.reduce((acc, j) => acc + j.distance, 0);
  const totalSandboxLanterns = sandboxJumps.reduce((acc, j) => acc + j.distance, 0);

  // Guided Question definition
  const getGuidedQuestion = () => {
    if (guidedStep === 0) {
      return {
        prompt: `We are at ${start}. What is the nearest friendly ten milestone ahead?`,
        target: benchmark10,
        options: [
          { text: `Hop to ${benchmark10} (+${hop1} lanterns) 🏮`, isCorrect: true, dist: hop1, to: benchmark10, feedback: `Great hop! From ${start} to ${benchmark10} is +${hop1} lanterns!` },
          { text: `Hop to ${benchmark10 + 10} (+${hop1 + 10} lanterns)`, isCorrect: false, dist: 0, to: 0, feedback: `Look closer: ${benchmark10} is the very next friendly ten!` },
          { text: `Hop directly to ${benchmark100}`, isCorrect: false, dist: 0, to: 0, feedback: `First reach the nearest friendly ten (${benchmark10})!` }
        ]
      };
    }
    if (guidedStep === 1) {
      return {
        prompt: `Now we are at ${benchmark10}. Let's hop to the nearest friendly hundred (${benchmark100})! How many lanterns?`,
        target: benchmark100,
        options: [
          { text: `Hop to ${benchmark100} (+${hop2} lanterns) 🏮`, isCorrect: true, dist: hop2, to: benchmark100, feedback: `Brilliant! ${benchmark10} + ${hop2} = ${benchmark100}!` },
          { text: `Hop to ${benchmark100} (+${hop2 + 10} lanterns)`, isCorrect: false, dist: 0, to: 0, feedback: `${benchmark100} − ${benchmark10} = ${hop2} lanterns!` },
          { text: `Hop to ${benchmark100} (+${Math.max(10, hop2 - 10)} lanterns)`, isCorrect: false, dist: 0, to: 0, feedback: `Count tens: from ${benchmark10} to ${benchmark100} is ${hop2} lanterns.` }
        ]
      };
    }
    if (guidedStep === 2) {
      return {
        prompt: `We are at ${benchmark100}. The final destination is ${dest}! How far is this big jump?`,
        target: dest,
        options: [
          { text: `Hop to ${dest} (+${hop3} lanterns) 🏮`, isCorrect: true, dist: hop3, to: dest, feedback: `Spectacular! From ${benchmark100} to ${dest} is +${hop3} lanterns!` },
          { text: `Hop to ${dest} (+${hop3 + 100} lanterns)`, isCorrect: false, dist: 0, to: 0, feedback: `${dest} − ${benchmark100} = ${hop3} hundreds!` },
          { text: `Hop to ${dest} (+${Math.max(100, hop3 - 100)} lanterns)`, isCorrect: false, dist: 0, to: 0, feedback: `Calculate: ${dest} − ${benchmark100} is exactly ${hop3}.` }
        ]
      };
    }
    return null;
  };

  const guidedQ = getGuidedQuestion();

  // Handle option click in Guided Journey
  const handleGuidedOption = (opt: { text: string; isCorrect: boolean; dist: number; to: number; feedback: string }) => {
    if (opt.isCorrect) {
      playHop();
      playSuccessChime();
      setFeedback({ text: opt.feedback, isCorrect: true });
      speak(opt.feedback, 0.85);

      const newJump: JumpRecord = {
        from: currentPosition,
        to: opt.to,
        distance: opt.dist,
        label: `+${opt.dist}`
      };

      setTimeout(() => {
        setCompletedJumps(prev => [...prev, newJump]);
        setCurrentPosition(opt.to);
        setFeedback(null);

        if (guidedStep < 2) {
          setGuidedStep(s => s + 1);
        } else {
          // Guided journey complete!
          setGuidedStep(3);
          playVictoryFanfare();
          setStars(s => s + 3);
          setTimeout(() => {
            setShowCelebration(true);
          }, 900);
        }
      }, 750);
    } else {
      playGentleBoing();
      setFeedback({ text: opt.feedback, isCorrect: false });
      speak(opt.feedback, 0.85);
    }
  };

  // Sandbox custom jump button click
  const handleSandboxJump = (dist: number) => {
    if (sandboxPos + dist > dest) {
      playGentleBoing();
      speak(`That jump of +${dist} would overshoot our destination of ${dest}!`, 0.85);
      return;
    }

    playHop();
    const newPos = sandboxPos + dist;
    const newJump: JumpRecord = {
      from: sandboxPos,
      to: newPos,
      distance: dist,
      label: `+${dist}`
    };

    setSandboxJumps(prev => [...prev, newJump]);
    setSandboxPos(newPos);

    if (newPos === dest) {
      playVictoryFanfare();
      playSuccessChime();
      setStars(s => s + 3);
      speak(`Destination reached! Total lanterns: ${totalSandboxLanterns + dist}!`, 0.85);
      setTimeout(() => {
        setShowCelebration(true);
      }, 900);
    }
  };

  return (
    <QuizLayout
      title="Math O' Lantern"
      subtitle={`Count up from ${start} to ${dest} along the glowing lantern trail to find the difference!`}
      category="Counting-Up Subtraction"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>

        {/* Level & Sub-Mode Switcher Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '12px 20px',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-accent)', textTransform: 'uppercase' }}>
              Counting-Up Trail • {prob.title}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              Subtraction: {dest} − {start} = {diff}
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                playPop();
                setSubMode('guided');
              }}
              className="tenali-btn-primary"
              style={{
                fontSize: '0.85rem',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                background: subMode === 'guided' ? 'var(--clr-accent)' : 'var(--clr-surface)',
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
              className="tenali-btn-primary"
              style={{
                fontSize: '0.85rem',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                background: subMode === 'sandbox' ? 'var(--clr-accent)' : 'var(--clr-surface)',
                color: subMode === 'sandbox' ? '#ffffff' : 'var(--clr-text)',
                border: '1px solid var(--clr-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Compass size={16} />
              <span>Lantern Sandbox</span>
            </button>
          </div>
        </div>

        {/* LANTERN TRAIL NUMBER LINE DISPLAY */}
        <div style={{
          background: 'radial-gradient(ellipse at center, #1e1133 0%, #0e061a 100%)',
          border: '3px solid #7c3aed',
          borderRadius: '24px',
          padding: '24px 20px',
          marginBottom: '20px',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.35)',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, color: '#fef08a' }}>
              <span>🏮</span>
              <span>Magical Number Jump Trail: {start} ➔ {dest}</span>
            </div>

            <div style={{
              background: 'rgba(254, 240, 138, 0.15)',
              border: '1px solid #fef08a',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 14px',
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#fef08a'
            }}>
              Lanterns Collected: {subMode === 'guided' ? totalGuidedLanterns : totalSandboxLanterns} / {diff}
            </div>
          </div>

          {/* Graphical Number Trail */}
          <div style={{
            position: 'relative',
            margin: '24px 0 16px 0',
            padding: '10px 0'
          }}>
            {/* Trail Baseline */}
            <div style={{
              height: '8px',
              background: 'linear-gradient(90deg, #d97706 0%, #10b981 50%, #3b82f6 100%)',
              borderRadius: '4px',
              margin: '35px 20px 25px 20px'
            }} />

            {/* Trail Milestone Nodes */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              marginTop: '-44px',
              padding: '0 10px'
            }}>
              {/* Start Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  border: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: '#ffffff'
                }}>
                  {start}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fde68a', marginTop: '6px' }}>
                  Start
                </span>
              </div>

              {/* Hop 1 Arch (+hop1) */}
              <div style={{ textAlign: 'center', flex: 1, padding: '0 4px' }}>
                {(subMode === 'guided' ? completedJumps.length >= 1 : sandboxJumps.length >= 1) && (
                  <div className="anim-pop" style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#4ade80',
                    background: 'rgba(74, 222, 128, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #4ade80',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}>
                    +{(subMode === 'guided' ? completedJumps[0]?.distance : sandboxJumps[0]?.distance)} 🏮
                  </div>
                )}
              </div>

              {/* Benchmark 10 Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: (subMode === 'guided' ? currentPosition >= benchmark10 : sandboxPos >= benchmark10) ? '#10b981' : 'rgba(255,255,255,0.2)',
                  border: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: '#ffffff'
                }}>
                  {benchmark10}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a7f3d0', marginTop: '6px' }}>
                  Friendly 10
                </span>
              </div>

              {/* Hop 2 Arch (+hop2) */}
              <div style={{ textAlign: 'center', flex: 1, padding: '0 4px' }}>
                {(subMode === 'guided' ? completedJumps.length >= 2 : sandboxJumps.length >= 2) && (
                  <div className="anim-pop" style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #38bdf8',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}>
                    +{(subMode === 'guided' ? completedJumps[1]?.distance : sandboxJumps[1]?.distance)} 🏮
                  </div>
                )}
              </div>

              {/* Benchmark 100 Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: (subMode === 'guided' ? currentPosition >= benchmark100 : sandboxPos >= benchmark100) ? '#0284c7' : 'rgba(255,255,255,0.2)',
                  border: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: '#ffffff'
                }}>
                  {benchmark100}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#bae6fd', marginTop: '6px' }}>
                  Friendly 100
                </span>
              </div>

              {/* Hop 3 Arch (+hop3) */}
              <div style={{ textAlign: 'center', flex: 1, padding: '0 4px' }}>
                {(subMode === 'guided' ? completedJumps.length >= 3 : sandboxJumps.length >= 3) && (
                  <div className="anim-pop" style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#c084fc',
                    background: 'rgba(192, 132, 252, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #c084fc',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}>
                    +{(subMode === 'guided' ? completedJumps[2]?.distance : sandboxJumps[2]?.distance)} 🏮
                  </div>
                )}
              </div>

              {/* Destination Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: (subMode === 'guided' ? currentPosition >= dest : sandboxPos >= dest) ? '#a855f7' : 'rgba(255,255,255,0.2)',
                  border: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: '#ffffff'
                }}>
                  {dest}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e9d5ff', marginTop: '6px' }}>
                  Goal ({dest})
                </span>
              </div>
            </div>
          </div>

          {/* Current Position Marker */}
          <div style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#ffffff',
            marginTop: '8px'
          }}>
            📍 Traveler Position: <span style={{ color: '#fef08a' }}>{subMode === 'guided' ? currentPosition : sandboxPos}</span>
          </div>
        </div>

        {/* 1. GUIDED JOURNEY MODE INTERACTION */}
        {subMode === 'guided' && (
          <div>
            {guidedQ && guidedStep < 3 && (
              <div className="anim-pop" style={{
                background: 'var(--clr-card)',
                border: '2px solid var(--clr-accent)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                boxShadow: 'var(--shadow-card)',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--clr-text)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Footprints size={22} color="var(--clr-accent)" />
                  <span>{guidedQ.prompt}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {guidedQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGuidedOption(opt)}
                      className="tenali-btn-primary"
                      style={{
                        background: 'var(--clr-surface)',
                        color: 'var(--clr-text)',
                        border: '2px solid var(--clr-border)',
                        borderRadius: '12px',
                        padding: '12px 18px',
                        textAlign: 'left',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-btn)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--clr-accent)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--clr-border)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <span>{opt.text}</span>
                      <ArrowRight size={18} color="var(--clr-accent)" />
                    </button>
                  ))}
                </div>

                {/* Instant Feedback Notice */}
                {feedback && (
                  <div className="anim-pop" style={{
                    marginTop: '14px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: feedback.isCorrect ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)',
                    border: `2px solid ${feedback.isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`,
                    color: feedback.isCorrect ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}>
                    {feedback.text}
                  </div>
                )}
              </div>
            )}

            {/* Guided Journey Complete Banner */}
            {guidedStep === 3 && (
              <div className="anim-pop" style={{
                background: 'var(--clr-correct-bg)',
                border: '2px solid var(--clr-correct)',
                borderRadius: 'var(--radius)',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: 'var(--clr-correct)', fontSize: '1.4rem', margin: '0 0 8px 0' }}>
                  🎉 Distance Discovered!
                </h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--clr-text)', margin: '0 0 12px 0' }}>
                  Hops: <strong>+{hop1}</strong> + <strong>+{hop2}</strong> + <strong>+{hop3}</strong> = <strong>{diff}</strong> lanterns!
                </p>
                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-kids)',
                  color: 'var(--clr-accent)',
                  marginBottom: '16px'
                }}>
                  Therefore: {dest} − {start} = {diff}!
                </div>

                <button
                  onClick={handleNextLevel}
                  className="tenali-btn-primary"
                  style={{
                    fontSize: '1.15rem',
                    padding: '12px 30px',
                    borderRadius: 'var(--radius-pill)',
                    margin: '0 auto',
                    cursor: 'pointer'
                  }}
                >
                  <span>{level < 5 ? `Next Trail Level (${level + 1}) ➔` : 'Replay Trail 🔄'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. LANTERN SANDBOX MODE INTERACTION */}
        {subMode === 'sandbox' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--clr-text)', margin: '0 0 6px 0' }}>
              🧪 Free Explorer Sandbox
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: '0 0 16px 0' }}>
              Choose your own jump increments to reach {dest} from {start}. All valid jump sequences will add up to {diff}!
            </p>

            {/* Jump options */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {[1, 2, 5, 7, 10, 20, 30, 40, 50, 100, 200, 300, 400].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleSandboxJump(amt)}
                  disabled={sandboxPos + amt > dest}
                  className="tenali-btn-primary"
                  style={{
                    background: 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '8px 16px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--clr-text)',
                    cursor: sandboxPos + amt > dest ? 'not-allowed' : 'pointer',
                    opacity: sandboxPos + amt > dest ? 0.35 : 1
                  }}
                >
                  +{amt} 🏮
                </button>
              ))}
            </div>

            {/* Sandbox History */}
            <div style={{
              background: 'var(--clr-surface)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', fontWeight: 700 }}>
                  Jumps Made:
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-text)' }}>
                  {sandboxJumps.length === 0 ? 'No jumps yet. Tap an increment above!' : sandboxJumps.map(j => j.label).join(' ')}
                </div>
              </div>

              <button
                onClick={() => {
                  playPop();
                  setSandboxPos(start);
                  setSandboxJumps([]);
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--clr-text-soft)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset Sandbox</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Story Modal */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="The Glowing Lantern Trail"
        badge="Counting-Up Story"
        icon="🏮"
        story={`Meet the brave traveler walking across the mystical lantern valley! Instead of taking away, we can discover the difference between ${dest} and ${start} by hopping forward along benchmark milestones! Start at ${start}, hop to ${benchmark10}, then to ${benchmark100}, and finally to ${dest}. The sum of your lantern hops is the exact answer!`}
        buttonText="Next ➔ Hop Along the Trail!"
      />

      {/* Level Complete Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Trailblazer Champion!"
          subtitle={`You counted up from ${start} to ${dest} and discovered the difference is ${diff}!`}
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
