import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playHop,
  playSuccessChime,
  playGentleBoing,
  playVictoryFanfare,
  playLavaSizzle
} from '../../../core/soundEffects';
import { BookOpen } from 'lucide-react';
import { GameProps } from '../../../types';
import tilesTexture from './tiles.png';

interface RoadTile {
  id: number;
  type: 'safe' | 'lava';
  targetNum?: number;
}

interface RoadLevel {
  name: string;
  targetCount: number;
  description: string;
  tiles: RoadTile[];
}

interface StoryChapterState {
  isOpen: boolean;
  title: string;
  icon: string;
  badge: string;
  story: string;
  buttonText: string;
  onProceed?: () => void;
}

interface FeedbackState {
  type: 'success' | 'error' | 'info';
  text: string;
}

// Child-friendly slow speech synthesis helper
function speak(text: string | number, rate: number = 0.82, pitch: number = 1.15): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate; // Gentle, child-friendly slow pace
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

export default function LavaHopGame({ onBack }: GameProps) {
  // Episodic Story Chapters: Story says something -> Activity happens -> Story continues!
  const [storyChapter, setStoryChapter] = useState<StoryChapterState>({
    isOpen: true,
    title: "Nadi Aur Pahar (नदी और पहाड़)!",
    icon: "🏞️",
    badge: "Childhood Schoolyard Game • नदी और पहाड़",
    story: "Remember playing 'Nadi Aur Pahar' during school recess? When someone shouts 'Nadi ya Pahar?', everyone dashes to safe ground! In our adventure, you are crossing a rushing river. The sturdy white stepping stones are 'Pahar' (पहाड़ - Safe Mountain Rocks), while the red tiles are the swift 'Nadi' (नदी - Deep River Rapids)! To cross safely to the green bank, hop only on the numbered mountain stones in exact order, counting each step aloud! Ready to leap?",
    buttonText: "Next ➔ Pahar Par Chhalang Lagao!",
    onProceed: () => {}
  });

  const handleCloseStoryChapter = () => {
    const callback = storyChapter.onProceed;
    setStoryChapter(prev => ({ ...prev, isOpen: false }));
    if (callback) callback();
  };

  const [level, setLevel] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);

  // Road configuration:
  // Authentic pavement tiles (Red Terracotta = River Rapids, White/Cream = Safe Mountain Stones)
  const ROAD_LEVELS: Record<number, RoadLevel> = {
    1: {
      name: "Chhoti Nadi Ka Safar (5 Stones)",
      targetCount: 5,
      description: "Hop across 5 mountain stones (पहाड़) without slipping into the river rapids (नदी)!",
      tiles: [
        { id: 1, type: 'safe', targetNum: 1 },
        { id: 2, type: 'lava' },
        { id: 3, type: 'safe', targetNum: 2 },
        { id: 4, type: 'lava' },
        { id: 5, type: 'safe', targetNum: 3 },
        { id: 6, type: 'safe', targetNum: 4 },
        { id: 7, type: 'lava' },
        { id: 8, type: 'safe', targetNum: 5 }
      ]
    },
    2: {
      name: "Tez Dhaara Ki Nadi (7 Stones)",
      targetCount: 7,
      description: "A wider river! Hop across all 7 mountain stones to reach the other riverbank!",
      tiles: [
        { id: 1, type: 'safe', targetNum: 1 },
        { id: 2, type: 'lava' },
        { id: 3, type: 'safe', targetNum: 2 },
        { id: 4, type: 'lava' },
        { id: 5, type: 'safe', targetNum: 3 },
        { id: 6, type: 'safe', targetNum: 4 },
        { id: 7, type: 'lava' },
        { id: 8, type: 'safe', targetNum: 5 },
        { id: 9, type: 'lava' },
        { id: 10, type: 'safe', targetNum: 6 },
        { id: 11, type: 'safe', targetNum: 7 }
      ]
    },
    3: {
      name: "Maha-Nadi Paar (10 Stones)",
      targetCount: 10,
      description: "The ultimate 10-stone crossing! Count all 10 mountain stones to safety!",
      tiles: [
        { id: 1, type: 'safe', targetNum: 1 },
        { id: 2, type: 'lava' },
        { id: 3, type: 'safe', targetNum: 2 },
        { id: 4, type: 'safe', targetNum: 3 },
        { id: 5, type: 'lava' },
        { id: 6, type: 'safe', targetNum: 4 },
        { id: 7, type: 'lava' },
        { id: 8, type: 'safe', targetNum: 5 },
        { id: 9, type: 'safe', targetNum: 6 },
        { id: 10, type: 'lava' },
        { id: 11, type: 'safe', targetNum: 7 },
        { id: 12, type: 'safe', targetNum: 8 },
        { id: 13, type: 'lava' },
        { id: 14, type: 'safe', targetNum: 9 },
        { id: 15, type: 'safe', targetNum: 10 }
      ]
    }
  };

  const currentRoad = ROAD_LEVELS[level] || ROAD_LEVELS[1];
  const [currentTileIdx, setCurrentTileIdx] = useState<number>(-1); // -1 means standing at Start sidewalk
  const [revealedNumbers, setRevealedNumbers] = useState<Record<number, number>>({}); // tileIndex -> revealed number
  const [reachedFinish, setReachedFinish] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [sizzleEffect, setSizzleEffect] = useState<number | null>(null);

  // Safe stones sequence
  const safeTileIndices = currentRoad.tiles
    .map((t, idx) => (t.type === 'safe' ? idx : -1))
    .filter(idx => idx !== -1);

  const nextExpectedSafeIndex = safeTileIndices[Object.keys(revealedNumbers).length];

  const handleHopOnTile = (tileIndex: number) => {
    const tile = currentRoad.tiles[tileIndex];

    // Case 1: Tapped on Red Lava Paver Tile!
    if (tile.type === 'lava') {
      playLavaSizzle();
      playGentleBoing();
      setSizzleEffect(tileIndex);
      setTimeout(() => setSizzleEffect(null), 600);
      setFeedback({
        type: 'error',
        text: "🌊 CHHAPAAK! That's the rushing river (नदी)! You slipped into the water! Hop only on the white mountain stones (पहाड़)!"
      });
      return;
    }

    // Case 2: Tapped a safe white paver stone
    if (tileIndex === nextExpectedSafeIndex) {
      playHop();
      const currentStepNumber = Object.keys(revealedNumbers).length + 1;

      // Reveal number on this brick
      setRevealedNumbers(prev => ({
        ...prev,
        [tileIndex]: currentStepNumber
      }));
      setCurrentTileIdx(tileIndex);

      // Speak ONLY the number aloud: "1", "2", "3"... so child remembers!
      speak(String(currentStepNumber), 0.85);

      // Check if halfway through the road (Episodic story continues!)
      if (currentStepNumber === Math.floor(currentRoad.targetCount / 2) && currentRoad.targetCount >= 5) {
        setTimeout(() => {
          setStoryChapter({
            isOpen: true,
            title: "Halfway Across the River!",
            icon: "🌊",
            badge: "Story Continues • Chapter 2",
            story: `Shabash! You made it halfway across the river! The water is rushing fast below, but your footing is strong and safe on mountain stone #${currentStepNumber}! The green riverbank is right ahead! Catch your breath and let's leap across the rest!`,
            buttonText: "Next ➔ Aage Chhalang Lagao!",
            onProceed: () => {}
          });
        }, 500);
      }

      // Check if finished
      if (currentStepNumber === currentRoad.targetCount) {
        setTimeout(() => {
          playSuccessChime();
          setReachedFinish(true);
          setFeedback({
            type: 'success',
            text: `🎉 Hooray! You reached the safe riverbank! All ${currentRoad.targetCount} mountain stones counted safely!`
          });
          setStars(s => s + 3);

          // Episodic finale
          setStoryChapter({
            isOpen: true,
            title: "Safe on the Green Riverbank!",
            icon: "🏆",
            badge: "Story Continues • Chapter 3",
            story: `HOORAY! Both feet land safely on the soft green riverbank! You leaped across all ${currentRoad.targetCount} mountain stones without slipping into the river even once, and counted every single step! You are the champion of Nadi Aur Pahar!`,
            buttonText: "Next ➔ See Your Trophy!",
            onProceed: () => {
              playVictoryFanfare();
              setShowCelebration(true);
            }
          });
        }, 500);
      } else {
        setFeedback({
          type: 'info',
          text: `✨ Mountain stone ${currentStepNumber} safe! Now hop on the next white stone!`
        });
      }
    } else if (revealedNumbers[tileIndex] !== undefined) {
      // Already hopped on this stone before - speak its number
      playHop();
      setCurrentTileIdx(tileIndex);
      speak(String(revealedNumbers[tileIndex]), 0.85);
    } else {
      // Hopped out of order (skipped a stone)
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: "👣 Don't jump too far ahead! Hop on the next mountain stone right in front of you."
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setCurrentTileIdx(-1);
    setRevealedNumbers({});
    setReachedFinish(false);
    setFeedback(null);
    const nextLvl = level < 3 ? level + 1 : 1;
    setLevel(nextLvl);
    setStoryChapter({
      isOpen: true,
      title: "The River Challenge Expands!",
      icon: "🏞️",
      badge: `Level ${nextLvl} • Chapter 1`,
      story: `You reached a wider river! There are ${ROAD_LEVELS[nextLvl].targetCount} mountain stones to cross this stream. Watch out for the river rapids and keep counting!`,
      buttonText: "Next ➔ Start Hopping!",
      onProceed: () => {}
    });
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setCurrentTileIdx(-1);
    setRevealedNumbers({});
    setReachedFinish(false);
    setFeedback(null);
    setStoryChapter({
      isOpen: true,
      title: "Nadi Aur Pahar Challenge!",
      icon: "🏞️",
      badge: `Level ${level} • Chapter 1`,
      story: "Can you cross the river even faster this time? Remember: hop only on the white mountain stones to stay safe!",
      buttonText: "Next ➔ Start Hopping!",
      onProceed: () => {}
    });
  };

  // Sprite position helpers for the 8 paver tiles in tiles.png
  // Even indices [0, 2, 4, 6] = Red Terracotta Pavers
  // Odd indices [1, 3, 5, 7] = White/Cream Pavers
  const getPaverBackground = (isSafe: boolean, idx: number): string => {
    if (isSafe) {
      const safeSpriteList = [1, 3, 5, 7];
      const spriteIdx = safeSpriteList[idx % safeSpriteList.length];
      const posPct = (spriteIdx * 100) / 7;
      return `url(${tilesTexture}) ${posPct}% 50% / 800% 100% no-repeat, #f5f5f4`;
    } else {
      const lavaSpriteList = [0, 2, 4, 6];
      const spriteIdx = lavaSpriteList[idx % lavaSpriteList.length];
      const posPct = (spriteIdx * 100) / 7;
      return `url(${tilesTexture}) ${posPct}% 50% / 800% 100% no-repeat, #ea580c`;
    }
  };

  return (
    <QuizLayout
      title="Nadi Aur Pahar"
      subtitle="Hop on the safe mountain stones (पहाड़), avoid the rushing river (नदी), and count 1, 2, 3 as you cross!"
      category="Counting & Schoolyard Games • नदी और पहाड़"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryChapter(prev => ({ ...prev, isOpen: true }))}
    >
      <div style={{ width: '100%', maxWidth: '920px' }}>

        {/* ============================================================== */}
        {/* THE RIVER CROSSING ARENA (NADI AUR PAHAR)                      */}
        {/* ============================================================== */}
        <div>
          {/* Level Controls & Stats Header */}
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
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-accent)' }}>
                LEVEL {level} OF 3
              </span>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                color: 'var(--clr-text)',
                margin: '2px 0 0 0'
              }}>
                {currentRoad.name}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--clr-text-soft)',
                marginRight: '6px'
              }}>
                Mountain Stones Hopped: <strong style={{ color: 'var(--clr-correct)' }}>{Object.keys(revealedNumbers).length} / {currentRoad.targetCount}</strong>
              </span>

              <button
                onClick={() => setStoryChapter(prev => ({ ...prev, isOpen: true }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: 'var(--clr-surface)',
                  color: 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={14} />
                <span>Story</span>
              </button>
            </div>
          </div>

          {/* THE RIVER CONTAINER */}
          <div style={{
            background: '#1c1917',
            border: '3px solid #44403c',
            borderRadius: '24px',
            padding: '24px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>

            {/* TOP RIVERBANK CURB */}
            <div style={{
              height: '14px',
              borderRadius: '8px',
              background: 'repeating-linear-gradient(45deg, #10b981, #10b981 16px, #047857 16px, #047857 32px)',
              marginBottom: '16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
            }} />

            {/* START RIVERBANK & FINISH RIVERBANK LABELS */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: '#10b981',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <span>🚩 START RIVERBANK</span>
              </div>

              <div style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '0.04em'
              }}>
                🏞️ HOP ON MOUNTAIN STONES (पहाड़) • DODGE THE RIVER RAPIDS (नदी)! 🏞️
              </div>

              <div style={{
                background: reachedFinish ? '#10b981' : '#f59e0b',
                color: '#ffffff',
                padding: '6px 16px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <span>🏁 SAFE RIVERBANK</span>
              </div>
            </div>

            {/* PAVEMENT ROADBED WITH AUTHENTIC TILES */}
            <div style={{
              background: '#292524',
              borderRadius: '18px',
              padding: '24px 16px',
              border: '2px dashed rgba(245, 158, 11, 0.3)',
              boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.6)',
              position: 'relative'
            }}>
              {/* Yellow Dashed Center Line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                right: '10px',
                height: '4px',
                background: 'repeating-linear-gradient(90deg, #f59e0b, #f59e0b 24px, transparent 24px, transparent 48px)',
                transform: 'translateY(-50%)',
                opacity: 0.25,
                pointerEvents: 'none'
              }} />

              {/* THE TILES TRAIL */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 2
              }}>

                {/* START PLATFORM */}
                <div
                  onClick={() => {
                    setCurrentTileIdx(-1);
                  }}
                  style={{
                    width: '70px',
                    height: '74px',
                    borderRadius: '16px',
                    background: '#10b981',
                    border: currentTileIdx === -1 ? '4px solid #ffffff' : '2px solid #059669',
                    boxShadow: currentTileIdx === -1 ? '0 0 18px #10b981' : '0 4px 10px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transform: currentTileIdx === -1 ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s'
                  }}
                >
                  {currentTileIdx === -1 && (
                    <div style={{
                      position: 'absolute',
                      top: '-34px',
                      fontSize: '2.2rem',
                      animation: 'bounceSlow 1s infinite'
                    }}>
                      🧒
                    </div>
                  )}
                  <span style={{ fontSize: '1.4rem' }}>🚩</span>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>START</span>
                </div>

                {/* REAL PAVER TILES */}
                {currentRoad.tiles.map((tile, idx) => {
                  const isSafe = tile.type === 'safe';
                  const isPlayerHere = currentTileIdx === idx;
                  const revealedNum = revealedNumbers[idx];
                  const isSizzling = sizzleEffect === idx;

                  return (
                    <div
                      key={tile.id}
                      onClick={() => handleHopOnTile(idx)}
                      style={{
                        width: isSafe ? '76px' : '64px',
                        height: '76px',
                        borderRadius: '16px',
                        // Exact texture sliced from user's uploaded tiles image!
                        background: getPaverBackground(isSafe, idx),
                        border: isPlayerHere
                          ? '4px solid #f59e0b'
                          : isSafe
                          ? '3px solid #e7e5e4'
                          : isSizzling
                          ? '4px solid #fbbf24'
                          : '3px solid #b91c1c',
                        boxShadow: isPlayerHere
                          ? '0 0 22px #f59e0b'
                          : isSafe
                          ? '0 6px 16px rgba(0,0,0,0.45)'
                          : isSizzling
                          ? '0 0 28px #ef4444'
                          : '0 4px 14px rgba(239, 68, 68, 0.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        transform: isPlayerHere
                          ? 'scale(1.15)'
                          : isSizzling
                          ? 'scale(0.92)'
                          : 'scale(1)',
                        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      {/* Kid Avatar on current hopped tile */}
                      {isPlayerHere && (
                        <div style={{
                          position: 'absolute',
                          top: '-36px',
                          fontSize: '2.3rem',
                          animation: 'bounceSlow 1s infinite'
                        }}>
                          🧒
                        </div>
                      )}

                      {/* Splash Effect if stepped on river tile */}
                      {isSizzling && (
                        <div style={{
                          position: 'absolute',
                          top: '-26px',
                          fontSize: '1.8rem',
                          animation: 'popIn 0.3s forwards'
                        }}>
                          💦🌊
                        </div>
                      )}

                      {/* Tile Content */}
                      {isSafe ? (
                        revealedNum !== undefined ? (
                          /* Number REVEALED upon hopping! */
                          <div className="anim-pop" style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: '2px solid #10b981',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{
                              fontSize: '1.45rem',
                              fontWeight: 900,
                              fontFamily: 'var(--font-kids)',
                              color: '#0f172a',
                              lineHeight: 1
                            }}>
                              {revealedNum}
                            </span>
                          </div>
                        ) : (
                          /* Blank White Mountain Stone before hopping */
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.78)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem'
                          }}>
                            👣
                          </div>
                        )
                      ) : (
                        /* River Rapids Hazard Tile */
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: 'rgba(185, 28, 28, 0.85)',
                          border: '1px solid #f87171',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.95rem'
                        }}>
                          🌊
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* FINISH PLATFORM */}
                <div
                  style={{
                    width: '70px',
                    height: '74px',
                    borderRadius: '16px',
                    background: reachedFinish ? '#10b981' : '#334155',
                    border: reachedFinish ? '4px solid #ffffff' : '2px dashed #94a3b8',
                    boxShadow: reachedFinish ? '0 0 18px #10b981' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transform: reachedFinish ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.3s'
                  }}
                >
                  {reachedFinish && (
                    <div style={{
                      position: 'absolute',
                      top: '-34px',
                      fontSize: '2.2rem',
                      animation: 'bounceSlow 1s infinite'
                    }}>
                      🧒
                    </div>
                  )}
                  <span style={{ fontSize: '1.4rem' }}>🏁</span>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>
                    {reachedFinish ? 'SAFE!' : 'FINISH'}
                  </span>
                </div>

              </div>
            </div>

            {/* BOTTOM ROAD CURB */}
            <div style={{
              height: '14px',
              borderRadius: '8px',
              background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #1c1917 16px, #1c1917 32px)',
              marginTop: '16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
            }} />

            {/* Status / Feedback Banner */}
            {feedback && (
              <div className="anim-pop" style={{
                marginTop: '18px',
                padding: '12px 18px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                background: feedback.type === 'success'
                  ? 'var(--clr-correct-bg)'
                  : feedback.type === 'error'
                  ? 'var(--clr-wrong-bg)'
                  : 'rgba(232, 134, 74, 0.15)',
                color: feedback.type === 'success'
                  ? 'var(--clr-correct)'
                  : feedback.type === 'error'
                  ? 'var(--clr-wrong)'
                  : 'var(--clr-accent)',
                border: `1px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}`
              }}>
                {feedback.text}
              </div>
            )}
          </div>

          {/* Level Selector Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '16px'
          }}>
            {[1, 2, 3].map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  handleReplay();
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: level === lvl ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: level === lvl ? '#ffffff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                Lvl {lvl}: {ROAD_LEVELS[lvl].targetCount} Stones
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Episodic Story Modal with Mini Speaker & Next button */}
      <GameStoryModal
        isOpen={storyChapter.isOpen}
        onClose={handleCloseStoryChapter}
        title={storyChapter.title}
        icon={storyChapter.icon}
        badge={storyChapter.badge}
        story={storyChapter.story}
        buttonText={storyChapter.buttonText}
      />

      {showCelebration && (
        <CelebrationModal
          title="Nadi Aur Pahar Champion!"
          subtitle={`Shaabaash! You bravely hopped across all ${currentRoad.targetCount} mountain stones (पहाड़) and conquered the rushing river!`}
          stars={3}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={level < 3}
        />
      )}
    </QuizLayout>
  );
}
