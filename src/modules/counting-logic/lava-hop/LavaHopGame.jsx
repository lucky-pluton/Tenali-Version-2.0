import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import {
  playHop,
  playSuccessChime,
  playGentleBoing,
  playVictoryFanfare,
  playLavaSizzle
} from '../../../core/soundEffects';
import { BookOpen, Volume2, Sparkles, Flame, ShieldAlert, Award } from 'lucide-react';
import spec from './spec.json';
import tilesTexture from './tiles.png';

// Child-friendly slow speech synthesis helper
function speak(text, rate = 0.82, pitch = 1.15) {
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

export default function LavaHopGame({ onBack }) {
  // Whether to show the childhood imagination story first
  const [showStoryIntro, setShowStoryIntro] = useState(true);

  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  // Road configuration:
  // Using authentic pavement paver tiles (Red Terracotta = Lava, White/Cream = Safe)
  const ROAD_LEVELS = {
    1: {
      name: "The Suburban Footpath Crossing",
      targetCount: 5,
      description: "Hop across 5 white paver stones without stepping on the red lava tiles!",
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
      name: "The Wide Avenue Promenade",
      targetCount: 7,
      description: "A wider street! Hop across all 7 white paver stones to reach the other side!",
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
      name: "The Grand Volcano Boulevard",
      targetCount: 10,
      description: "The ultimate 10-stone challenge! Count all 10 white stepping stones to safety!",
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
  const [currentTileIdx, setCurrentTileIdx] = useState(-1); // -1 means standing at Start sidewalk
  const [revealedNumbers, setRevealedNumbers] = useState({}); // tileIndex -> revealed number
  const [reachedFinish, setReachedFinish] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sizzleEffect, setSizzleEffect] = useState(null);

  const handleStartPlaying = () => {
    setShowStoryIntro(false);
    setCurrentTileIdx(-1);
    setRevealedNumbers({});
    setReachedFinish(false);
    setFeedback(null);
  };

  // Safe stones sequence
  const safeTileIndices = currentRoad.tiles
    .map((t, idx) => (t.type === 'safe' ? idx : -1))
    .filter(idx => idx !== -1);

  const nextExpectedSafeIndex = safeTileIndices[Object.keys(revealedNumbers).length];

  const handleHopOnTile = (tileIndex) => {
    const tile = currentRoad.tiles[tileIndex];

    // Case 1: Tapped on Red Lava Paver Tile!
    if (tile.type === 'lava') {
      playLavaSizzle();
      playGentleBoing();
      setSizzleEffect(tileIndex);
      setTimeout(() => setSizzleEffect(null), 600);
      setFeedback({
        type: 'error',
        text: "🔥 SIZZLE! That's a red volcano tile! Your shoes will burn! Only hop on the white paver stones!"
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

      // Check if finished
      if (currentStepNumber === currentRoad.targetCount) {
        setTimeout(() => {
          playSuccessChime();
          setReachedFinish(true);
          setFeedback({
            type: 'success',
            text: `🎉 Hooray! You reached the safe sidewalk! All ${currentRoad.targetCount} paver stones counted safely!`
          });
          setStars(s => s + 3);
          setTimeout(() => {
            playVictoryFanfare();
            setShowCelebration(true);
          }, 1000);
        }, 500);
      } else {
        setFeedback({
          type: 'info',
          text: `✨ Stone ${currentStepNumber} safe! Now hop on the next white stone!`
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
        text: "👣 Don't jump too far ahead! Hop on the next white stone right in front of you."
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setCurrentTileIdx(-1);
    setRevealedNumbers({});
    setReachedFinish(false);
    setFeedback(null);
    if (level < 3) {
      setLevel(l => l + 1);
    } else {
      setLevel(1);
    }
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setCurrentTileIdx(-1);
    setRevealedNumbers({});
    setReachedFinish(false);
    setFeedback(null);
  };

  // Sprite position helpers for the 8 paver tiles in tiles.png
  // Even indices [0, 2, 4, 6] = Red Terracotta Pavers
  // Odd indices [1, 3, 5, 7] = White/Cream Pavers
  const getPaverBackground = (isSafe, idx) => {
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
      title="Lava Hop Adventure"
      subtitle="Hop on the white footpath stones, dodge the red volcano tiles, and count 1, 2, 3 as you go!"
      category="Counting & Number Line"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '920px' }}>

        {/* ============================================================== */}
        {/* STORY INTRODUCTION: The Classic Childhood Game                 */}
        {/* ============================================================== */}
        {showStoryIntro ? (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            {/* Title badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 22px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '2.2rem' }}>🌋</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                color: 'var(--clr-text)',
                margin: 0
              }}>
                The Secret Game Every Child Plays!
              </h2>
            </div>

            {/* Real Footpath Paver Tiles Banner */}
            <div style={{
              margin: '0 auto 20px auto',
              maxWidth: '520px',
              background: 'var(--clr-surface)',
              borderRadius: '16px',
              padding: '12px 16px',
              border: '2px solid var(--clr-border)',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--clr-text)',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                🧱 Real Street Footpath Paver Tiles:
              </div>
              <img
                src={tilesTexture}
                alt="Footpath Paver Tiles Strip"
                style={{
                  width: '100%',
                  height: '56px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '2px solid #78716c',
                  display: 'block'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '8px',
                fontSize: '0.85rem',
                fontWeight: 800
              }}>
                <span style={{ color: '#ef4444' }}>🔥 Red Tiles = HOT LAVA!</span>
                <span style={{ color: '#10b981' }}>⚪ White/Cream Tiles = SAFE!</span>
              </div>
            </div>

            {/* Visual Childhood Street Story Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚶‍♂️ 🛣️</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  1. Walking on the Footpath
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  Remember when you walked on tiled roads and footpaths with your parents? Every child looks down at these tiles!
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌋 🔥</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  2. "The Red Tiles are Lava!"
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  In your imagination, the red waffle tiles become boiling hot volcano lava! If you step on them... SIZZLE! 👟🔥
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚪ 🛡️</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  3. Hop on the White Stones!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  To stay safe, you must <strong>ONLY hop on the white/cream patterned stones</strong> without touching the red ones!
                </p>
              </div>

              <div style={{
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔢 🗣️</div>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--clr-text)' }}>
                  4. Numbers Appear & Speak!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', margin: 0, lineHeight: 1.5 }}>
                  The stones look blank at first. But when you take a hop, their secret numbers pop up and say: <strong>1, 2, 3...!</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleReadStoryAloud}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--clr-surface)',
                  color: 'var(--clr-text)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={18} />
                <span>Hear Story Aloud</span>
              </button>

              <button
                onClick={handleStartPlaying}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #ef4444, #f97316)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '14px 34px',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)'
                }}
              >
                <span>🌋 Start Crossing the Road! ➡️</span>
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* THE REALISTIC PAVEMENT ROAD ARENA                              */
          /* ============================================================== */
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
                  White Stones Hopped: <strong style={{ color: 'var(--clr-correct)' }}>{Object.keys(revealedNumbers).length} / {currentRoad.targetCount}</strong>
                </span>

                <button
                  onClick={() => setShowStoryIntro(true)}
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

            {/* THE ROAD CONTAINER (Authentic road pavement with paver tiles & curbs) */}
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

              {/* TOP ROAD CURB (Yellow/Black Concrete Sidewalk Curb) */}
              <div style={{
                height: '14px',
                borderRadius: '8px',
                background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 16px, #1c1917 16px, #1c1917 32px)',
                marginBottom: '16px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
              }} />

              {/* START SIDEWALK & FINISH SIDEWALK LABELS */}
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
                  <span>🚩 START SIDEWALK</span>
                </div>

                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#f59e0b',
                  letterSpacing: '0.04em'
                }}>
                  ⚠️ HOP ON WHITE PAVER TILES • DODGE RED LAVA TILES! ⚠️
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
                  <span>🏁 SAFE SIDEWALK</span>
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

                        {/* Sizzle Steam Effect if stepped on lava tile */}
                        {isSizzling && (
                          <div style={{
                            position: 'absolute',
                            top: '-26px',
                            fontSize: '1.8rem',
                            animation: 'popIn 0.3s forwards'
                          }}>
                            💨🔥
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
                            /* Blank White Paver Stone before hopping */
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
                          /* Hot Red Lava Paver Tile */
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
                            🔥
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
        )}

      </div>

      {showCelebration && (
        <CelebrationModal
          title="Street Crossing Champion!"
          subtitle={`You bravely hopped across all ${currentRoad.targetCount} white paver stones and conquered the boiling lava road!`}
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
