import React, { useState, useEffect, useRef } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playFlowerPick,
  playFlowerAttach,
  playSuccessChime,
  playGentleBoing,
  playVictoryFanfare
} from '../../../core/soundEffects';
import spec from './spec.json';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle, Volume2, Award, Heart } from 'lucide-react';

// Child-friendly pure counting speech synthesis
function speakCount(num, rate = 0.85, pitch = 1.15) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(num));
      utterance.rate = rate; // Gentle, child-friendly slow pace
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

// Beautiful Scalable SVG Marigold Flower (Orange or Yellow)
function MarigoldFlower({ type = 'orange', size = 52, isHighlighted = false, countBadge = null, onClick }) {
  const isOrange = type === 'orange';

  // Petal Colors
  const outerPetal = isOrange ? '#ea580c' : '#eab308';
  const midPetal = isOrange ? '#f97316' : '#facc15';
  const innerPetal = isOrange ? '#fb923c' : '#fde047';
  const centerColor = isOrange ? '#c2410c' : '#ca8a04';
  const highlightGlow = isOrange ? 'rgba(249, 115, 22, 0.45)' : 'rgba(250, 204, 21, 0.45)';

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transform: isHighlighted ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        userSelect: 'none'
      }}
    >
      {/* Number Badge if this flower has been counted */}
      {countBadge !== null && (
        <div
          className="anim-pop"
          style={{
            position: 'absolute',
            top: '-16px',
            zIndex: 10,
            background: isOrange ? '#ea580c' : '#ca8a04',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 800,
            fontFamily: 'var(--font-kids)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '2px solid #ffffff'
          }}
        >
          {countBadge}
        </div>
      )}

      {/* Realistic Multi-layered Marigold Flower SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          filter: isHighlighted
            ? `drop-shadow(0 0 12px ${highlightGlow}) drop-shadow(0 4px 6px rgba(0,0,0,0.25))`
            : 'drop-shadow(0 3px 5px rgba(0,0,0,0.18))'
        }}
      >
        {/* Green Sepal Knot Behind Flower */}
        <circle cx="50" cy="50" r="46" fill="#15803d" opacity="0.35" />

        {/* Outer Ruffled Petals (12 petals) */}
        <g fill={outerPetal}>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <path
              key={deg}
              d="M 50 14 C 42 14, 40 38, 50 48 C 60 38, 58 14, 50 14 Z"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </g>

        {/* Mid-layer Ruffled Petals (12 petals rotated 15 deg) */}
        <g fill={midPetal}>
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map(deg => (
            <path
              key={deg}
              d="M 50 22 C 44 22, 42 42, 50 50 C 58 42, 56 22, 50 22 Z"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </g>

        {/* Inner Dense Fluffy Ruffles (8 petals) */}
        <g fill={innerPetal}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <circle
              key={deg}
              cx="50"
              cy="34"
              r="10"
              transform={`rotate(${deg} 50 50)`}
              opacity="0.9"
            />
          ))}
        </g>

        {/* Center Fluffy Disk */}
        <circle cx="50" cy="50" r="14" fill={centerColor} />
        <circle cx="50" cy="50" r="9" fill={innerPetal} opacity="0.85" />
        <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.6" />
      </svg>
    </div>
  );
}

export default function MarigoldMagicGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [roundIdx, setRoundIdx] = useState(0);
  const [stars, setStars] = useState(0);

  // Progressive Level Configurations
  const LEVEL_CONFIGS = {
    1: {
      name: "Level 1: Little Decorator",
      subtitle: "Count 1 to 5 flowers, add 1 or 2 more!",
      rounds: [
        { orig: 3, add: 2 },
        { orig: 2, add: 1 },
        { orig: 4, add: 1 },
        { orig: 3, add: 1 },
        { orig: 5, add: 2 }
      ]
    },
    2: {
      name: "Level 2: Flower Helper",
      subtitle: "Count 3 to 7 flowers, add 1 to 4 more with equations!",
      rounds: [
        { orig: 4, add: 3 },
        { orig: 5, add: 4 },
        { orig: 6, add: 2 },
        { orig: 7, add: 3 },
        { orig: 5, add: 3 }
      ]
    },
    3: {
      name: "Level 3: Decoration Champion",
      subtitle: "Count 5 to 10 flowers, add 2 to 5 more (totals up to 15)!",
      rounds: [
        { orig: 8, add: 2 },
        { orig: 7, add: 4 },
        { orig: 6, add: 5 },
        { orig: 9, add: 3 },
        { orig: 8, add: 5 }
      ]
    },
    4: {
      name: "Level 4: Independence Day Expert",
      subtitle: "Grand celebration garlands! Totals up to 20 flowers!",
      rounds: [
        { orig: 10, add: 4 },
        { orig: 11, add: 5 },
        { orig: 9, add: 7 },
        { orig: 12, add: 6 },
        { orig: 10, add: 8 }
      ]
    }
  };

  const currentLevelData = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[1];
  const currentRound = currentLevelData.rounds[roundIdx % currentLevelData.rounds.length];
  const origCount = currentRound.orig;
  const addCount = currentRound.add;
  const totalCount = origCount + addCount;

  // Stages: 'count_initial' | 'adding_animation' | 'count_total' | 'celebrate_garland'
  const [stage, setStage] = useState('count_initial');

  // Interactive counting state
  const [countedOriginal, setCountedOriginal] = useState({}); // flowerIdx -> order
  const [countedTotal, setCountedTotal] = useState({}); // flowerIdx -> order
  const [userAnswer, setUserAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [attachedCount, setAttachedCount] = useState(0); // for animation in Stage 2
  const [showCelebration, setShowCelebration] = useState(false);

  // Episodic Story Chapters Modal
  const [storyChapter, setStoryChapter] = useState({
    isOpen: true,
    title: "Independence Day School Decoration! 🇮🇳",
    icon: "🌼",
    badge: "Chapter 1: The First Orange Laddi",
    story: "Independence Day is tomorrow, and our school is getting ready for the grand flag-hoisting ceremony! Teacher Sharma and your classmates are decorating the school walls with traditional Indian marigold flower laddis (garlands). Look at this beautiful orange garland—can you help count how many flowers are in this laddi?",
    buttonText: "Next ➔ Count Orange Flowers!",
    onProceed: () => {}
  });

  const handleCloseStoryChapter = () => {
    const callback = storyChapter.onProceed;
    setStoryChapter(prev => ({ ...prev, isOpen: false }));
    if (callback) callback();
  };

  // Reset when level or round changes
  useEffect(() => {
    setStage('count_initial');
    setCountedOriginal({});
    setCountedTotal({});
    setUserAnswer(null);
    setFeedback(null);
    setAttachedCount(0);
  }, [level, roundIdx]);

  // Stage 1: Child taps an individual orange flower
  const handleTapOriginalFlower = (idx) => {
    if (stage !== 'count_initial') return;

    playFlowerPick(520 + idx * 30);
    const alreadyCounted = countedOriginal[idx] !== undefined;
    let nextNum;

    if (!alreadyCounted) {
      nextNum = Object.keys(countedOriginal).length + 1;
      setCountedOriginal(prev => ({ ...prev, [idx]: nextNum }));
    } else {
      nextNum = countedOriginal[idx];
    }

    // Pure counting speech: speaks ONLY "1", "2", "3"...
    speakCount(nextNum);
  };

  // Stage 1: Child checks their original garland count
  const handleSelectOriginalAnswer = (ans) => {
    setUserAnswer(ans);
    speakCount(ans);

    if (ans === origCount) {
      playSuccessChime();
      setFeedback({
        type: 'success',
        text: `🎉 Spot on! There are exactly ${origCount} orange marigold flowers in this laddi!`
      });

      // Advance to Chapter 2 (Story Continues!)
      setTimeout(() => {
        setStoryChapter({
          isOpen: true,
          title: "Fresh Basket of Sunny Yellow Flowers!",
          icon: "🧺",
          badge: "Story Continues • Chapter 2",
          story: `Teacher Sharma smiles warmly: "Wonderful counting! You found all ${origCount} orange flowers!" Just then, she opens a fresh wicker basket: "Look, I brought ${addCount} sunny yellow marigolds! Let's attach them to the garland to make it longer and prettier for our school wall!"`,
          buttonText: "Next ➔ Attach Yellow Flowers!",
          onProceed: () => {
            startAttachAnimation();
          }
        });
      }, 700);
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Teacher Sharma gently says: "Let's count those beautiful flowers once more! Tap each flower to count 1, 2, 3..."`
      });
    }
  };

  // Stage 2: Animate newly added yellow flowers joining the garland
  const startAttachAnimation = () => {
    setStage('adding_animation');
    setUserAnswer(null);
    setFeedback(null);
    setAttachedCount(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setAttachedCount(current);
      playFlowerAttach();
      speakCount(origCount + current);

      if (current >= addCount) {
        clearInterval(interval);
        setTimeout(() => {
          setStage('count_total');
          setFeedback({
            type: 'info',
            text: `We had ${origCount} orange flowers. We added ${addCount} yellow flowers. How many flowers do we have altogether?`
          });
        }, 500);
      }
    }, 600);
  };

  // Stage 2: Child taps flowers to count the combined total
  const handleTapTotalFlower = (idx) => {
    if (stage !== 'count_total') return;

    playFlowerPick(520 + idx * 25);
    const alreadyCounted = countedTotal[idx] !== undefined;
    let nextNum;

    if (!alreadyCounted) {
      nextNum = Object.keys(countedTotal).length + 1;
      setCountedTotal(prev => ({ ...prev, [idx]: nextNum }));
    } else {
      nextNum = countedTotal[idx];
    }

    // Pure counting speech
    speakCount(nextNum);
  };

  // Stage 2: Child submits final addition sum
  const handleSelectTotalAnswer = (ans) => {
    setUserAnswer(ans);
    speakCount(ans);

    if (ans === totalCount) {
      playSuccessChime();
      setStars(s => s + 3);
      setFeedback({
        type: 'success',
        text: `✨ Brilliant! ${origCount} + ${addCount} = ${totalCount} flowers altogether!`
      });

      // Advance to Chapter 3 (Story Continues: Decorate and Celebrate!)
      setTimeout(() => {
        setStage('celebrate_garland');
        setStoryChapter({
          isOpen: true,
          title: "Decorate the School Wall! 🇮🇳🌼",
          icon: "🏫",
          badge: "Story Continues • Chapter 3",
          story: `Teacher Sharma and all your school friends cheer: "BHARAT MATA KI JAI! 🇮🇳 Our school looks absolutely magnificent!" Watch your completed ${totalCount}-flower marigold garland hang proudly on the school corridor wall with tricolour bunting!`,
          buttonText: "Next ➔ Hang Garland & Celebrate!",
          onProceed: () => {
            playVictoryFanfare();
            setShowCelebration(true);
          }
        });
      }, 700);
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Not quite! We had ${origCount} orange flowers, and added ${addCount} yellow ones. Try counting them all together!`
      });
    }
  };

  // Multiple choice answer generator
  const getChoiceOptions = (correctVal) => {
    const choices = new Set([correctVal]);
    let offset = 1;
    while (choices.size < 4) {
      if (correctVal - offset > 0) choices.add(correctVal - offset);
      if (correctVal + offset <= 25) choices.add(correctVal + offset);
      offset++;
    }
    return Array.from(choices).sort((a, b) => a - b);
  };

  // Advance level or round
  const handleNextRoundOrLevel = () => {
    setShowCelebration(false);
    if (roundIdx + 1 < currentLevelData.rounds.length) {
      setRoundIdx(r => r + 1);
    } else {
      setRoundIdx(0);
      const nextLvl = level < 4 ? level + 1 : 1;
      setLevel(nextLvl);
    }
    setStoryChapter({
      isOpen: true,
      title: "Another Beautiful Garland! 🌼",
      icon: "🇮🇳",
      badge: "New Decoration Challenge",
      story: `Teacher Sharma has another garland ready for the main school corridor! Can you help count the orange marigolds and add more yellow flowers to complete it?`,
      buttonText: "Next ➔ Start Decorating!",
      onProceed: () => {}
    });
  };

  const handleReplay = () => {
    setShowCelebration(false);
    setStage('count_initial');
    setCountedOriginal({});
    setCountedTotal({});
    setUserAnswer(null);
    setFeedback(null);
    setAttachedCount(0);
    setStoryChapter({
      isOpen: true,
      title: "Marigold Magic – Decorate the School! 🇮🇳",
      icon: "🌼",
      badge: "Replay Challenge",
      story: `Ready to count and decorate again? Let's count the orange flowers in the garland!`,
      buttonText: "Next ➔ Count Flowers!",
      onProceed: () => {}
    });
  };

  return (
    <QuizLayout
      title="Marigold Magic – Decorate the School!"
      subtitle="Help Teacher Sharma count orange marigolds, add sunny yellow flowers, and decorate the school for Independence Day!"
      category="Addition & One-to-One Counting"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
      onOpenStory={() => setStoryChapter(prev => ({ ...prev, isOpen: true }))}
    >
      <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>

        {/* Level Controls & Stats Header */}
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
          gap: '10px'
        }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-accent)' }}>
              ROUND {roundIdx + 1} OF {currentLevelData.rounds.length} • {currentLevelData.name}
            </span>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.18rem',
              color: 'var(--clr-text)',
              margin: '2px 0 0 0'
            }}>
              {stage === 'count_initial' && "Step 1: Count the Orange Marigolds"}
              {(stage === 'adding_animation' || stage === 'count_total') && "Step 2: Add Yellow Flowers & Find Total"}
              {stage === 'celebrate_garland' && "Step 3: Hang Garland & Celebrate! 🇮🇳"}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--clr-text-soft)'
            }}>
              {stage === 'count_initial' && (
                <>Tapped: <strong style={{ color: '#ea580c' }}>{Object.keys(countedOriginal).length} / {origCount}</strong></>
              )}
              {stage === 'count_total' && (
                <>Total Tapped: <strong style={{ color: 'var(--clr-correct)' }}>{Object.keys(countedTotal).length} / {totalCount}</strong></>
              )}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* INDEPENDENCE DAY SCHOOL CORRIDOR ARENA                         */}
        {/* ============================================================== */}
        <div style={{
          background: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 40%, #fef9c3 100%)',
          border: '3px solid #f59e0b',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 12px 32px rgba(245, 158, 11, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>

          {/* TRICOLOUR INDEPENDENCE DAY FESTOONS / BUNTING */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '22px',
            background: 'linear-gradient(90deg, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#000080',
              textTransform: 'uppercase'
            }}>
              🇮🇳 HAPPY INDEPENDENCE DAY • AZADI KA AMRIT MAHOTSAV 🇮🇳
            </span>
          </div>

          {/* SCHOOL CLASSROOM WALL HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Teacher Sharma Profile & Speech Bubble */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '3px solid #ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                👩‍🏫
              </div>
              <div style={{
                background: '#ffffff',
                border: '2px solid #fed7aa',
                borderRadius: '16px',
                padding: '10px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                maxWidth: '420px',
                position: 'relative'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                  Teacher Sharma
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                  {stage === 'count_initial' && "Look at this fresh orange laddi! Tap each flower to count how many there are!"}
                  {stage === 'adding_animation' && `Attaching ${addCount} sunny yellow flowers to make our garland longer!`}
                  {stage === 'count_total' && `We had ${origCount} orange flowers and added ${addCount} yellow ones! How many altogether?`}
                  {stage === 'celebrate_garland' && "Shabash! Our school decoration looks absolutely gorgeous!"}
                </div>
              </div>
            </div>

            {/* Student Helper */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '2px solid #bbf7d0',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '1.4rem' }}>🧒</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                Decoration Helper
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* THE MARIGOLD GARLAND DISPLAY (LADDI ON WALL)                   */}
          {/* ============================================================== */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '2px dashed #f59e0b',
            padding: '28px 16px',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.04)',
            position: 'relative',
            minHeight: '170px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflowX: 'auto'
          }}>

            {/* Braided Green Garland Thread / Rope */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '20px',
              right: '20px',
              height: '6px',
              background: 'repeating-linear-gradient(45deg, #15803d, #15803d 8px, #166534 8px, #166534 16px)',
              borderRadius: '3px',
              transform: stage === 'celebrate_garland' ? 'translateY(10px) scaleY(1.5)' : 'translateY(-50%)',
              transition: 'all 0.5s',
              zIndex: 1
            }} />

            {/* Garland End Knots with Red/Gold Tassels */}
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              fontSize: '1.3rem'
            }}>
              🪢
            </div>
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              fontSize: '1.3rem'
            }}>
              🪢
            </div>

            {/* FLOWERS ON THE GARLAND */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 2,
              padding: '10px 24px'
            }}>
              {/* ORIGINAL ORANGE FLOWERS */}
              {Array.from({ length: origCount }).map((_, idx) => {
                const countBadge = stage === 'count_initial'
                  ? (countedOriginal[idx] ?? null)
                  : (countedTotal[idx] ?? (stage === 'count_total' ? null : idx + 1));

                return (
                  <div key={`orig-${idx}`} style={{ margin: '4px' }}>
                    <MarigoldFlower
                      type="orange"
                      size={origCount + (stage !== 'count_initial' ? addCount : 0) > 12 ? 44 : 52}
                      isHighlighted={countedOriginal[idx] !== undefined || countedTotal[idx] !== undefined}
                      countBadge={countBadge}
                      onClick={stage === 'count_initial'
                        ? () => handleTapOriginalFlower(idx)
                        : stage === 'count_total'
                        ? () => handleTapTotalFlower(idx)
                        : undefined}
                    />
                  </div>
                );
              })}

              {/* PLUS SIGN DIVIDER (Shown in Stage 2 to visually distinguish added group) */}
              {(stage === 'adding_animation' || stage === 'count_total') && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  border: '2px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#ea580c',
                  margin: '0 6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                  +
                </div>
              )}

              {/* NEWLY ADDED SUNNY YELLOW FLOWERS */}
              {(stage === 'adding_animation' || stage === 'count_total' || stage === 'celebrate_garland') && (
                Array.from({ length: stage === 'adding_animation' ? attachedCount : addCount }).map((_, idx) => {
                  const globalIdx = origCount + idx;
                  const countBadge = stage === 'count_total'
                    ? (countedTotal[globalIdx] ?? null)
                    : (stage === 'celebrate_garland' ? globalIdx + 1 : null);

                  return (
                    <div key={`add-${idx}`} className="anim-pop" style={{ margin: '4px' }}>
                      <MarigoldFlower
                        type="yellow"
                        size={origCount + addCount > 12 ? 44 : 52}
                        isHighlighted={countedTotal[globalIdx] !== undefined}
                        countBadge={countBadge}
                        onClick={stage === 'count_total' ? () => handleTapTotalFlower(globalIdx) : undefined}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend helper indicator */}
            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ea580c' }} />
                <span style={{ color: '#ea580c' }}>Original Garland ({origCount} Orange)</span>
              </div>
              {(stage === 'adding_animation' || stage === 'count_total' || stage === 'celebrate_garland') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#facc15', border: '1px solid #ca8a04' }} />
                  <span style={{ color: '#ca8a04' }}>Added Flowers ({addCount} Yellow)</span>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* EQUATION DISPLAY (In Stage 2)                                  */}
          {/* ============================================================== */}
          {(stage === 'count_total' || stage === 'adding_animation') && (
            <div className="anim-pop" style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '12px 24px',
              margin: '18px auto 0 auto',
              maxWidth: '380px',
              border: '2px solid #f59e0b',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '1.6rem',
              fontWeight: 900,
              fontFamily: 'var(--font-kids)'
            }}>
              <span style={{ color: '#ea580c' }}>{origCount}</span>
              <span style={{ color: '#94a3b8' }}>+</span>
              <span style={{ color: '#ca8a04' }}>{addCount}</span>
              <span style={{ color: '#94a3b8' }}>=</span>
              <span style={{
                background: '#fef3c7',
                border: '2px dashed #f59e0b',
                borderRadius: '10px',
                padding: '2px 14px',
                color: userAnswer === totalCount ? 'var(--clr-correct)' : '#ea580c'
              }}>
                {userAnswer === totalCount ? totalCount : '?'}
              </span>
            </div>
          )}

          {/* ============================================================== */}
          {/* INTERACTIVE ANSWER SELECTION                                   */}
          {/* ============================================================== */}
          {(stage === 'count_initial' || stage === 'count_total') && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '12px'
              }}>
                {stage === 'count_initial'
                  ? "How many orange flowers are there in this laddi?"
                  : `How many flowers do we have altogether? (${origCount} + ${addCount})`}
              </div>

              {/* Number Option Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {getChoiceOptions(stage === 'count_initial' ? origCount : totalCount).map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      if (stage === 'count_initial') {
                        handleSelectOriginalAnswer(num);
                      } else {
                        handleSelectTotalAnswer(num);
                      }
                    }}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '18px',
                      background: userAnswer === num
                        ? (num === (stage === 'count_initial' ? origCount : totalCount) ? 'var(--clr-correct)' : 'var(--clr-wrong)')
                        : '#ffffff',
                      border: '3px solid #fed7aa',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-kids)',
                      color: userAnswer === num ? '#ffffff' : '#1e293b',
                      cursor: 'pointer',
                      transform: userAnswer === num ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.15s'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Banner */}
          {feedback && (
            <div className="anim-pop" style={{
              marginTop: '16px',
              padding: '10px 18px',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.98rem',
              background: feedback.type === 'success' ? '#dcfce7' : feedback.type === 'error' ? '#fee2e2' : '#fef3c7',
              color: feedback.type === 'success' ? '#15803d' : feedback.type === 'error' ? '#b91c1c' : '#b45309',
              border: `2px solid ${feedback.type === 'success' ? '#86efac' : feedback.type === 'error' ? '#fca5a5' : '#fde047'}`
            }}>
              {feedback.text}
            </div>
          )}

        </div>

        {/* Level Selector Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '14px',
          flexWrap: 'wrap'
        }}>
          {[1, 2, 3, 4].map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                setRoundIdx(0);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: level === lvl ? '#ea580c' : 'var(--clr-card)',
                color: level === lvl ? '#ffffff' : 'var(--clr-text-soft)',
                border: '1px solid var(--clr-border)',
                cursor: 'pointer'
              }}
            >
              {LEVEL_CONFIGS[lvl].name.split(':')[0]}
            </button>
          ))}
        </div>

      </div>

      {/* Episodic Story Modal with Mini Speaker & Next Button */}
      <GameStoryModal
        isOpen={storyChapter.isOpen}
        onClose={handleCloseStoryChapter}
        title={storyChapter.title}
        icon={storyChapter.icon}
        badge={storyChapter.badge}
        story={storyChapter.story}
        buttonText={storyChapter.buttonText}
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Decoration Complete! 🇮🇳🌼"
          subtitle={`You counted the ${origCount} orange flowers, added ${addCount} yellow flowers, and made a grand garland of ${totalCount} flowers! Our school looks beautiful for Independence Day!`}
          stars={3}
          onNextLevel={handleNextRoundOrLevel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={level < 4 || roundIdx + 1 < currentLevelData.rounds.length}
        />
      )}
    </QuizLayout>
  );
}
