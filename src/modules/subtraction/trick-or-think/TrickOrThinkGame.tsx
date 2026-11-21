import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playPop,
  playSuccessChime,
  playVictoryFanfare,
  playGentleBoing
} from '../../../core/soundEffects';
import { Sparkles, Wind, ArrowRight, RotateCcw } from 'lucide-react';
import { GameProps } from '../../../types';

// Palette of happy, vibrant balloon colors
const BALLOON_PALETTES = [
  { main: '#ef4444', light: '#fca5a5', dark: '#b91c1c', name: 'Red' },
  { main: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8', name: 'Blue' },
  { main: '#22c55e', light: '#86efac', dark: '#15803d', name: 'Green' },
  { main: '#f59e0b', light: '#fde68a', dark: '#b45309', name: 'Yellow' },
  { main: '#ec4899', light: '#fbcfe8', dark: '#be185d', name: 'Pink' },
  { main: '#8b5cf6', light: '#c4b5fd', dark: '#6d28d9', name: 'Purple' },
  { main: '#06b6d4', light: '#a5f3fc', dark: '#0e7490', name: 'Cyan' },
  { main: '#f97316', light: '#fed7aa', dark: '#c2410c', name: 'Orange' },
];

export interface BalloonItem {
  id: number;
  palette: typeof BALLOON_PALETTES[0];
  isReleased: boolean;
  countedBadge: number | null;
  wobbleDelay: number;
}

export interface RoundConfig {
  startCount: number;
  flyCount: number;
  questionType?: 'find_difference' | 'find_missing';
}

export interface LevelConfig {
  level: number;
  name: string;
  badge: string;
  description: string;
  rounds: RoundConfig[];
}

const BALLOON_LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Little Balloon Helper',
    badge: 'Level 1 • Numbers up to 5',
    description: 'Count up to 5 balloons and let 1 or 2 float away!',
    rounds: [
      { startCount: 3, flyCount: 1 },
      { startCount: 4, flyCount: 2 },
      { startCount: 5, flyCount: 2 },
      { startCount: 5, flyCount: 3 },
    ]
  },
  {
    level: 2,
    name: 'Fairground Friend',
    badge: 'Level 2 • Numbers up to 8',
    description: 'Bigger colorful bunches at the Sunday Mela!',
    rounds: [
      { startCount: 6, flyCount: 2 },
      { startCount: 7, flyCount: 3 },
      { startCount: 8, flyCount: 4 },
      { startCount: 7, flyCount: 5 },
    ]
  },
  {
    level: 3,
    name: 'Mela Champion',
    badge: 'Level 3 • Numbers up to 10',
    description: 'Subtractions across 10 with rainbow balloons!',
    rounds: [
      { startCount: 9, flyCount: 4 },
      { startCount: 10, flyCount: 3 },
      { startCount: 10, flyCount: 5 },
      { startCount: 9, flyCount: 6 },
    ]
  },
  {
    level: 4,
    name: 'Sky Detective',
    badge: 'Level 4 • How Many Flew Away?',
    description: 'Find the missing number of balloons that blew into the sky!',
    rounds: [
      { startCount: 6, flyCount: 2, questionType: 'find_missing' },
      { startCount: 8, flyCount: 3, questionType: 'find_missing' },
      { startCount: 10, flyCount: 4, questionType: 'find_missing' },
      { startCount: 7, flyCount: 3, questionType: 'find_missing' },
    ]
  },
  {
    level: 5,
    name: 'Grand Balloon Party',
    badge: 'Level 5 • Numbers up to 15',
    description: 'Festive subtraction challenges with up to 15 balloons!',
    rounds: [
      { startCount: 12, flyCount: 4 },
      { startCount: 14, flyCount: 5 },
      { startCount: 15, flyCount: 6 },
      { startCount: 13, flyCount: 7 },
    ]
  }
];

// Slow, gentle speech synthesis helper
function speak(text: string, rate: number = 0.82) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

type GameStage = 'count_initial' | 'release' | 'solve' | 'celebrate_round';

export default function GubbarewalaGame({ onBack }: GameProps) {
  const [level, setLevel] = useState<number>(1);
  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);

  const currentLevel = BALLOON_LEVELS[level - 1] || BALLOON_LEVELS[0];
  const currentRound = currentLevel.rounds[roundIdx] || currentLevel.rounds[0];
  const { startCount, flyCount, questionType = 'find_difference' } = currentRound;
  const remainCount = startCount - flyCount;

  // Game state
  const [stage, setStage] = useState<GameStage>('count_initial');
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [releasedCount, setReleasedCount] = useState<number>(0);
  const [remainingCounted, setRemainingCounted] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Modals
  const [storyOpen, setStoryOpen] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Initialize round balloons
  useEffect(() => {
    const newBalloons: BalloonItem[] = Array.from({ length: startCount }).map((_, i) => ({
      id: i,
      palette: BALLOON_PALETTES[i % BALLOON_PALETTES.length],
      isReleased: false,
      countedBadge: null,
      wobbleDelay: (i * 0.25) % 2,
    }));
    setBalloons(newBalloons);
    setStage('count_initial');
    setReleasedCount(0);
    setRemainingCounted(0);
    setFeedback(null);
  }, [level, roundIdx]);

  // Stage 1: Tap to count initial balloons
  const handleTapInitialBalloon = (id: number) => {
    if (stage !== 'count_initial') return;

    setBalloons(prev => {
      const alreadyCounted = prev.filter(b => b.countedBadge !== null).length;
      return prev.map(b => {
        if (b.id === id && b.countedBadge === null) {
          const nextCount = alreadyCounted + 1;
          playPop(440 + nextCount * 40);
          speak(String(nextCount));
          return { ...b, countedBadge: nextCount };
        }
        return b;
      });
    });
  };

  // Check if all initial balloons are counted
  const initialCountedTotal = balloons.filter(b => b.countedBadge !== null).length;
  const isInitialCountDone = initialCountedTotal === startCount;

  const handleProceedToRelease = () => {
    playSuccessChime();
    setStage('release');
    speak(`Whoosh! A gentle wind blows! Tap ${flyCount} balloons to watch them float away into the clouds!`, 0.85);
  };

  // Stage 2: Tap to release balloon
  const handleTapReleaseBalloon = (id: number) => {
    if (stage !== 'release') return;
    if (releasedCount >= flyCount) return;

    const targetBalloon = balloons.find(b => b.id === id);
    if (!targetBalloon || targetBalloon.isReleased) return;

    const nextReleased = releasedCount + 1;
    setReleasedCount(nextReleased);

    // Audio pop & spoken counter
    playPop(520 + nextReleased * 60);
    speak(`${nextReleased} flew away!`);

    setBalloons(prev =>
      prev.map(b => (b.id === id ? { ...b, isReleased: true } : b))
    );

    // Check if target flyCount reached
    if (nextReleased >= flyCount) {
      setTimeout(() => {
        playSuccessChime();
        setStage('solve');
        if (questionType === 'find_missing') {
          speak(`Kaka had ${startCount} balloons. Now only ${remainCount} are left. How many balloons flew away?`, 0.85);
        } else {
          speak(`We had ${startCount} balloons. ${flyCount} floated away! How many balloons are left in Kaka's hand?`, 0.85);
        }
      }, 1000);
    }
  };

  // Stage 3: Tap remaining balloon to count
  const handleTapRemainingBalloon = (id: number) => {
    if (stage !== 'solve') return;
    const b = balloons.find(item => item.id === id);
    if (!b || b.isReleased) return;

    const nextCount = remainingCounted + 1;
    setRemainingCounted(nextCount);
    playPop(480 + nextCount * 50);
    speak(String(nextCount));
  };

  // Multiple-choice options generator
  const getOptions = () => {
    const correctAnswer = questionType === 'find_missing' ? flyCount : remainCount;
    const opts = new Set<number>([correctAnswer]);

    while (opts.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const fake = correctAnswer + delta;
      if (fake >= 0 && fake <= startCount + 2 && fake !== correctAnswer) {
        opts.add(fake);
      }
    }
    return Array.from(opts).sort((a, b) => a - b);
  };

  const [options, setOptions] = useState<number[]>([]);
  useEffect(() => {
    if (stage === 'solve') {
      setOptions(getOptions());
    }
  }, [stage, level, roundIdx]);

  // Answer handler
  const handleSelectAnswer = (ans: number) => {
    const correctAnswer = questionType === 'find_missing' ? flyCount : remainCount;

    if (ans === correctAnswer) {
      playSuccessChime();
      playVictoryFanfare();
      setFeedback({
        text: `Spot on! ${startCount} − ${flyCount} = ${remainCount} balloons!`,
        isCorrect: true
      });
      speak(`Super job! ${startCount} minus ${flyCount} equals ${remainCount}!`, 0.85);
      setStars(s => s + 3);
      setStage('celebrate_round');

      setTimeout(() => {
        if (roundIdx + 1 < currentLevel.rounds.length) {
          setRoundIdx(r => r + 1);
        } else {
          setShowCelebration(true);
        }
      }, 1800);
    } else {
      playGentleBoing();
      const hint = questionType === 'find_missing'
        ? `Let's count how many balloons floated away into the sky!`
        : `Count the balloons still in Kaka's hand! There are ${remainCount} left.`;
      setFeedback({ text: hint, isCorrect: false });
      speak(hint, 0.85);
    }
  };

  // Next level handler
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
    setBalloons(prev => prev.map(b => ({ ...b, isReleased: false, countedBadge: null })));
    setStage('count_initial');
    setReleasedCount(0);
    setRemainingCounted(0);
    setFeedback(null);
  };

  return (
    <QuizLayout
      title="Gubbarewala: The Flying Balloons"
      subtitle="Watch balloons float into the sky and discover subtraction naturally!"
      category="Subtraction & Take-Away"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      <div style={{ width: '100%', maxWidth: '860px', margin: '0 auto' }}>

        {/* Level & Round Header */}
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
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase' }}>
              {currentLevel.badge}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              Round {roundIdx + 1} of {currentLevel.rounds.length}
            </div>
          </div>

          {/* Quick Level Selector Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {BALLOON_LEVELS.map(lvl => (
              <button
                key={lvl.level}
                onClick={() => {
                  setLevel(lvl.level);
                  setRoundIdx(0);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: level === lvl.level ? '#f97316' : 'var(--clr-surface)',
                  color: level === lvl.level ? '#ffffff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                Lvl {lvl.level}
              </button>
            ))}
          </div>
        </div>

        {/* Sky Fairground Scene */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 55%, #fef3c7 100%)',
          borderRadius: '24px',
          border: '3px solid #38bdf8',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>

          {/* Fluffy Clouds Background */}
          <div style={{ position: 'absolute', top: '12px', left: '20px', fontSize: '2.5rem', opacity: 0.85, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>
            ☁️
          </div>
          <div style={{ position: 'absolute', top: '25px', right: '40px', fontSize: '3rem', opacity: 0.9, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>
            ☁️
          </div>
          <div style={{ position: 'absolute', top: '15px', left: '45%', fontSize: '1.8rem', opacity: 0.75 }}>
            ☀️
          </div>

          {/* Stage Prompt Banner */}
          <div style={{
            alignSelf: 'center',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            border: '2px solid #38bdf8',
            borderRadius: 'var(--radius-pill)',
            padding: '8px 22px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.98rem',
            fontWeight: 800,
            color: '#0369a1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 10
          }}>
            {stage === 'count_initial' && (
              <>
                <span>🎈 Tap each balloon to count Kaka's bunch!</span>
                <span style={{ color: '#f97316' }}>({initialCountedTotal} / {startCount})</span>
              </>
            )}
            {stage === 'release' && (
              <>
                <Wind size={18} color="#0284c7" />
                <span>Tap {flyCount} balloons to let the wind carry them away! 💨</span>
                <span style={{ color: '#ea580c' }}>({releasedCount} / {flyCount} flown)</span>
              </>
            )}
            {stage === 'solve' && (
              <>
                <span>✨ How many balloons are left in Kaka's hand?</span>
              </>
            )}
            {stage === 'celebrate_round' && (
              <>
                <Sparkles size={18} color="#eab308" />
                <span style={{ color: '#15803d' }}>Wonderful! You solved it! 🎉</span>
              </>
            )}
          </div>

          {/* Balloons Cluster */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: startCount > 10 ? '12px 14px' : '18px 24px',
            padding: '30px 10px 20px 10px',
            minHeight: '220px',
            zIndex: 5
          }}>
            {balloons.map((balloon) => {
              const isFlyTarget = stage === 'release' && !balloon.isReleased && releasedCount < flyCount;
              const isCountTarget = stage === 'count_initial' && balloon.countedBadge === null;

              return (
                <div
                  key={balloon.id}
                  onClick={() => {
                    if (stage === 'count_initial') handleTapInitialBalloon(balloon.id);
                    if (stage === 'release') handleTapReleaseBalloon(balloon.id);
                    if (stage === 'solve') handleTapRemainingBalloon(balloon.id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: (isFlyTarget || isCountTarget || stage === 'solve') ? 'pointer' : 'default',
                    transform: balloon.isReleased
                      ? 'translateY(-260px) scale(0.4) rotate(15deg)'
                      : 'translateY(0) scale(1)',
                    opacity: balloon.isReleased ? 0 : 1,
                    transition: balloon.isReleased
                      ? 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)'
                      : 'transform 0.2s',
                    position: 'relative',
                    userSelect: 'none'
                  }}
                >
                  {/* Balloon Oval Body */}
                  <div
                    style={{
                      width: startCount > 10 ? '54px' : '68px',
                      height: startCount > 10 ? '68px' : '84px',
                      borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                      background: `radial-gradient(circle at 35% 30%, ${balloon.palette.light} 0%, ${balloon.palette.main} 60%, ${balloon.palette.dark} 100%)`,
                      boxShadow: `0 8px 16px ${balloon.palette.dark}44, inset 0 -4px 6px rgba(0,0,0,0.25)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      border: isFlyTarget ? '3px dashed #ffffff' : 'none',
                      animation: !balloon.isReleased ? `wobbleBalloon 3s ease-in-out infinite alternate ${balloon.wobbleDelay}s` : 'none'
                    }}
                  >
                    {/* Cute smiling balloon face */}
                    <div style={{
                      position: 'absolute',
                      top: '32%',
                      display: 'flex',
                      gap: '12px',
                      opacity: 0.75
                    }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff' }} />
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff' }} />
                    </div>

                    {/* Number Badge */}
                    {balloon.countedBadge !== null && stage === 'count_initial' && (
                      <span style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: '#ffffff',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        fontFamily: 'var(--font-kids)'
                      }}>
                        {balloon.countedBadge}
                      </span>
                    )}

                    {/* Step indicator tag */}
                    {stage === 'release' && !balloon.isReleased && releasedCount < flyCount && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: 'rgba(255,255,255,0.9)',
                        color: '#b91c1c',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-pill)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }}>
                        Fly! 💨
                      </span>
                    )}
                  </div>

                  {/* Knot & String */}
                  <div style={{
                    width: '8px',
                    height: '5px',
                    background: balloon.palette.dark,
                    borderRadius: '2px',
                    marginTop: '-1px'
                  }} />
                  <div style={{
                    width: '2px',
                    height: '35px',
                    background: 'rgba(100, 116, 139, 0.65)',
                    transform: 'rotate(-4deg)'
                  }} />
                </div>
              );
            })}
          </div>

          {/* Fairground Base: Gubbarewala Kaka avatar & prompt */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.95)',
            borderTop: '2px solid #bae6fd',
            borderRadius: '16px',
            padding: '12px 18px',
            zIndex: 10,
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Kaka Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#ffedd5',
                border: '2px solid #f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
              }}>
                👳‍♂️
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--clr-text)' }}>Gubbarewala Kaka</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                  {stage === 'count_initial' && `Holding a bunch of ${startCount} balloons!`}
                  {stage === 'release' && `Whoosh! The wind blows away ${flyCount} balloons!`}
                  {stage === 'solve' && `How many balloons do I have left in my hand?`}
                  {stage === 'celebrate_round' && `Shabash! You found the correct count!`}
                </p>
              </div>
            </div>

            {/* Stage 1 "Counted All!" Button */}
            {stage === 'count_initial' && (
              <button
                onClick={handleProceedToRelease}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 22px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(249, 115, 22, 0.35)',
                  transition: 'transform 0.15s'
                }}
              >
                <span>{isInitialCountDone ? 'Let the Wind Blow! 💨' : `Ready with ${startCount} Balloons ➔`}</span>
                <ArrowRight size={18} />
              </button>
            )}

            {/* Stage 2 Flown Counter */}
            {stage === 'release' && (
              <div style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#ea580c',
                background: '#ffedd5',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)'
              }}>
                Fluew away: {releasedCount} of {flyCount}
              </div>
            )}
          </div>
        </div>

        {/* Stage 3: The Subtraction Math Equation & Answers */}
        {stage === 'solve' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: '20px',
            padding: '24px 20px',
            marginTop: '20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>

            {/* The Concrete Subtraction Equation */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-accent)',
              borderRadius: 'var(--radius-pill)',
              padding: '12px 28px',
              fontSize: '1.9rem',
              fontWeight: 900,
              fontFamily: 'var(--font-kids)',
              color: 'var(--clr-text)',
              marginBottom: '18px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
              <span>{startCount}</span>
              <span style={{ color: '#ef4444' }}>−</span>
              <span>{questionType === 'find_missing' ? '?' : flyCount}</span>
              <span style={{ color: 'var(--clr-accent)' }}>=</span>
              <span style={{
                color: '#f97316',
                background: '#ffedd5',
                padding: '2px 14px',
                borderRadius: '12px',
                minWidth: '42px'
              }}>
                {questionType === 'find_missing' ? remainCount : '?'}
              </span>
            </div>

            <p style={{
              fontSize: '1.1rem',
              color: 'var(--clr-text-soft)',
              marginBottom: '20px',
              fontWeight: 600
            }}>
              {questionType === 'find_missing'
                ? `Kaka had ${startCount} balloons. Now ${remainCount} remain. How many balloons flew away into the sky?`
                : `We started with ${startCount} balloons. ${flyCount} flew away into the sky. How many remain?`}
            </p>

            {/* Answer Options Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '14px',
              maxWidth: '520px',
              margin: '0 auto'
            }}>
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(opt)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-kids)',
                    color: 'var(--clr-text)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-btn)',
                    transition: 'all 0.15s ease-in-out'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = '#f97316';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--clr-border)';
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Feedback message */}
            {feedback && (
              <div style={{
                marginTop: '16px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'inline-block',
                background: feedback.isCorrect ? '#dcfce7' : '#fee2e2',
                color: feedback.isCorrect ? '#166534' : '#991b1b',
                border: `1px solid ${feedback.isCorrect ? '#86efac' : '#fca5a5'}`
              }}>
                {feedback.text}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Story Modal with Mini Speaker & Read Aloud */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="Gubbarewala at the Sunday Mela!"
        badge="Story Time"
        icon="🎈"
        story="Welcome to the Sunday Village Mela! Kaka the balloon seller is here with the most colorful bunches of balloons you have ever seen! But oh ho—a playful summer breeze keeps blowing across the fairgrounds! Watch the balloons float high into the clouds, count what remains in Kaka's hand, and master subtraction together!"
        buttonText="Next ➔ Visit the Mela!"
      />

      {/* Celebration Modal on Level Complete */}
      {showCelebration && (
        <CelebrationModal
          title="Balloon Champion! 🎈✨"
          subtitle={`You mastered all the balloon challenges in ${currentLevel.name}! You know exactly how many balloons fly away and how many stay!`}
          stars={3}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={level < 5}
        />
      )}

      {/* CSS Keyframes for Gentle Balloon Floating Wobble */}
      <style>{`
        @keyframes wobbleBalloon {
          0% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(-3deg); }
        }
      `}</style>
    </QuizLayout>
  );
}
