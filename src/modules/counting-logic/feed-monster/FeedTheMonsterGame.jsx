import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import {
  playCakePick,
  playSuccessChime,
  playGentleBoing,
  playMonsterBurp,
  playMonsterGroan,
  playStomachGrowl,
  playBakeryBell,
  playMunch
} from '../../../core/soundEffects';
import { ShoppingBasket, ArrowRight, ArrowLeft, RefreshCw, Sparkles, CheckCircle, Heart, Utensils } from 'lucide-react';
import spec from './spec.json';

// Child-friendly slow speech synthesis helper
function speak(text, rate = 0.82, pitch = 1.15) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate; // Gentle child-friendly pace
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

const CAKE_VARIETIES = [
  { id: 'cupcake', emoji: '🧁', name: 'Berry Cupcake' },
  { id: 'slice', emoji: '🍰', name: 'Strawberry Shortcake' },
  { id: 'cake', emoji: '🎂', name: 'Birthday Cake' },
  { id: 'donut', emoji: '🍩', name: 'Glazed Donut' },
  { id: 'pancake', emoji: '🥞', name: 'Honey Pancakes' },
  { id: 'cookie', emoji: '🍪', name: 'Choco Cookie' }
];

export default function FeedTheMonsterGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  // Level configuration ranges
  const LEVEL_RANGES = {
    1: { min: 1, max: 3, name: "Level 1: Little Nibbler (1–3)" },
    2: { min: 1, max: 5, name: "Level 2: Hungry Buddy (1–5)" },
    3: { min: 1, max: 7, name: "Level 3: Big Appetite (1–7)" },
    4: { min: 1, max: 10, name: "Level 4: Monster Feast (1–10)" },
    5: { min: 1, max: 10, name: "Level 5: Master Baker (1–10 Challenge)" }
  };

  const generateTarget = (lvl) => {
    const range = LEVEL_RANGES[lvl] || LEVEL_RANGES[1];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const [targetNumber, setTargetNumber] = useState(() => generateTarget(1));

  // Game Stage: 'hunger' | 'bakery' | 'verdict'
  const [stage, setStage] = useState('hunger');

  // Stage 1: Counting the empty stomach slots
  const [countedSlots, setCountedSlots] = useState([]); // indices of slots clicked/counted
  const [hungerConfirmed, setHungerConfirmed] = useState(false);

  // Stage 2: Bakery collection basket (array of cake objects)
  // CRITICAL: Does NOT display the target count (e.g. no "0 / 3" or target spoiler!)
  const [basket, setBasket] = useState([]);

  // Stage 3: Verdict outcome ('too_few' | 'too_many' | 'exact')
  const [verdict, setVerdict] = useState(null);
  const [eatenCount, setEatenCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Initial stomach growl on hunger stage load (no long speech - count on click)
  useEffect(() => {
    if (stage === 'hunger') {
      const timer = setTimeout(() => {
        playStomachGrowl();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [stage, targetNumber]);

  // Stage 1: Child clicks each empty space in the monster's stomach to count 1, 2, 3...
  const handleCountStomachSlot = (slotIdx) => {
    if (countedSlots.includes(slotIdx)) return;

    playCakePick();
    const nextCount = countedSlots.length + 1;
    const newCounted = [...countedSlots, slotIdx];
    setCountedSlots(newCounted);

    // ONLY count the sequential number aloud: "1", "2", "3"!
    speak(String(nextCount), 0.85);

    if (newCounted.length === targetNumber) {
      setTimeout(() => {
        playSuccessChime();
        setHungerConfirmed(true);
      }, 500);
    }
  };

  // Transition from Stage 1 to Stage 2 (Bakery)
  const handleGoToBakery = () => {
    playBakeryBell();
    setStage('bakery');
  };

  // Stage 2: Add cake to basket and speak ONLY the count: 1, 2, 3...
  const handleAddCake = (cakeType) => {
    playCakePick();
    const nextBasketCount = basket.length + 1;
    setBasket(prev => [...prev, { ...cakeType, uid: Date.now() + Math.random(), cakeIndex: nextBasketCount }]);

    // Speak ONLY the count when picking cakes: 1, 2, 3...
    speak(String(nextBasketCount), 0.85);
  };

  // Stage 2: Remove specific cake from basket - speaks remaining count
  const handleRemoveCake = (uid) => {
    playCakePick();
    setBasket(prev => {
      const updated = prev.filter(c => c.uid !== uid);
      speak(String(updated.length), 0.85);
      return updated;
    });
  };

  // Stage 2: Deliver cakes to monster
  const handleDeliverCakes = () => {
    const count = basket.length;
    setStage('verdict');

    if (count < targetNumber) {
      playGentleBoing();
      setVerdict('too_few');
    } else if (count > targetNumber) {
      playMonsterGroan();
      setVerdict('too_many');
    } else {
      // Exact match!
      setVerdict('exact');
      playSuccessChime();
      setStars(s => s + 3);

      // Trigger animated one-by-one eating into the stomach and count along: 1, 2, 3...
      let currentEaten = 0;
      const eatInterval = setInterval(() => {
        currentEaten += 1;
        setEatenCount(currentEaten);
        playMunch();
        speak(String(currentEaten), 0.85);

        if (currentEaten >= targetNumber) {
          clearInterval(eatInterval);
          setTimeout(() => {
            playMonsterBurp();
            setTimeout(() => {
              setShowCelebration(true);
            }, 900);
          }, 600);
        }
      }, 550);
    }
  };

  // Return to bakery to correct cake count
  const handleReturnToBakery = () => {
    playBakeryBell();
    setStage('bakery');
    setVerdict(null);
    setEatenCount(0);
  };

  // Move to next level
  const handleNextLevel = () => {
    setShowCelebration(false);
    const nextLvl = level < 5 ? level + 1 : 1;
    setLevel(nextLvl);
    const newTarget = generateTarget(nextLvl);
    setTargetNumber(newTarget);
    setCountedSlots([]);
    setHungerConfirmed(false);
    setBasket([]);
    setVerdict(null);
    setEatenCount(0);
    setStage('hunger');
  };

  // Replay current level
  const handleReplay = () => {
    setShowCelebration(false);
    const newTarget = generateTarget(level);
    setTargetNumber(newTarget);
    setCountedSlots([]);
    setHungerConfirmed(false);
    setBasket([]);
    setVerdict(null);
    setEatenCount(0);
    setStage('hunger');
  };

  // Monster visual expressions
  const getMonsterVisual = () => {
    if (stage === 'verdict') {
      if (verdict === 'too_few') {
        return {
          face: '😢',
          bellyGlow: '#f87171',
          expression: "Heyyy! I'm still hungry!",
          burpText: null
        };
      }
      if (verdict === 'too_many') {
        return {
          face: '😵‍💫',
          bellyGlow: '#fb923c',
          expression: "WHOA! That's too many cakes!",
          burpText: null
        };
      }
      if (verdict === 'exact') {
        return {
          face: eatenCount >= targetNumber ? '😋' : '🤤',
          bellyGlow: '#4ade80',
          expression: "YUMMMM! Exactly the right number!",
          burpText: eatenCount >= targetNumber ? 'BURRRRP! ✨' : null
        };
      }
    }
    return {
      face: hungerConfirmed ? '😃' : '🤤',
      bellyGlow: '#fef08a',
      expression: hungerConfirmed ? "Yay! Let's get the cakes!" : "My tummy is growling for cakes!",
      burpText: null
    };
  };

  const monsterVisual = getMonsterVisual();

  return (
    <QuizLayout
      title="Feed the Monster!"
      subtitle="Count the empty spaces in the monster's tummy, visit the bakery, and bring the exact cakes!"
      category="Counting & One-to-One Match"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>

        {/* Level Indicator Tabs */}
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
              LEVEL {level} OF 5
            </span>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              color: 'var(--clr-text)',
              margin: '2px 0 0 0'
            }}>
              {LEVEL_RANGES[level].name}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  const newTarget = generateTarget(lvl);
                  setTargetNumber(newTarget);
                  setCountedSlots([]);
                  setHungerConfirmed(false);
                  setBasket([]);
                  setVerdict(null);
                  setEatenCount(0);
                  setStage('hunger');
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: level === lvl ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: level === lvl ? '#fff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                Lvl {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 1: DISCOVER THE MONSTER'S HUNGER (Visual Stomach + Click-to-Count)
        ───────────────────────────────────────────────────────────── */}
        {stage === 'hunger' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '26px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            {/* Monster Speech Bubble */}
            <div style={{
              display: 'inline-block',
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-accent)',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--clr-text)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-btn)'
            }}>
              💬 <em>"I'm SUPER hungry! Click each empty space inside my tummy to count how many cakes I want!"</em>
            </div>

            {/* REALISTIC CARTOON MONSTER WITH PROMINENT ROUND STOMACH */}
            <div style={{
              background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)',
              border: '4px solid #5b21b6',
              borderRadius: '50px 50px 60px 60px',
              padding: '24px 20px 30px 20px',
              maxWidth: '460px',
              margin: '0 auto 22px auto',
              boxShadow: '0 16px 36px rgba(109, 40, 217, 0.45)',
              color: '#ffffff',
              position: 'relative'
            }}>
              {/* Monster Ears / Horns */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '40px',
                fontSize: '2.5rem',
                transform: 'rotate(-20deg)'
              }}>
                🦄
              </div>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '40px',
                fontSize: '2.5rem',
                transform: 'rotate(20deg)'
              }}>
                🦄
              </div>

              {/* Monster Head & Eyes */}
              <div style={{ fontSize: '4.8rem', lineHeight: 1, marginBottom: '4px' }}>
                {monsterVisual.face}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#fef08a',
                marginBottom: '14px',
                letterSpacing: '0.02em'
              }}>
                Kumbakaran the Monster
              </div>

              {/* BIG ROUND MONSTER TUMMY / STOMACH CHAMBER */}
              <div style={{
                background: 'radial-gradient(ellipse at center, rgba(254, 240, 138, 0.25) 0%, rgba(20, 10, 40, 0.75) 100%)',
                border: '4px solid #fef08a',
                borderRadius: '50% 50% 48% 48% / 60% 60% 45% 45%',
                padding: '24px 18px 28px 18px',
                margin: '0 auto',
                maxWidth: '380px',
                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5), 0 0 24px rgba(254, 240, 138, 0.35)',
                position: 'relative'
              }}>
                {/* Tummy Ribs & Label */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#fef08a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px'
                }}>
                  <span>🫧</span>
                  <span>Inside Kumbakaran's Tummy</span>
                  <span>🫧</span>
                </div>

                {/* Empty Cake Plate Slots inside Stomach */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '12px',
                  minHeight: '80px',
                  alignItems: 'center'
                }}>
                  {Array.from({ length: targetNumber }).map((_, idx) => {
                    const isCounted = countedSlots.includes(idx);
                    const slotOrder = countedSlots.indexOf(idx) + 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleCountStomachSlot(idx)}
                        className={isCounted ? 'anim-pop' : 'anim-bounce'}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: isCounted ? '#fef08a' : 'rgba(255, 255, 255, 0.12)',
                          border: isCounted ? '3px solid #eab308' : '3px dashed #fef08a',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isCounted ? 'default' : 'pointer',
                          boxShadow: isCounted
                            ? '0 0 16px rgba(254, 240, 138, 0.8)'
                            : '0 4px 10px rgba(0,0,0,0.3)',
                          transform: isCounted ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 0.25s'
                        }}
                      >
                        {isCounted ? (
                          <span style={{
                            fontSize: '1.45rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-kids)',
                            color: '#713f12'
                          }}>
                            {slotOrder}
                          </span>
                        ) : (
                          <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>
                            🍽️
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cute Belly Button at base of tummy */}
                <div style={{
                  width: '12px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(254, 240, 138, 0.5)',
                  margin: '14px auto 0 auto'
                }} />
              </div>

              {/* Counting Status below Tummy */}
              <div style={{
                marginTop: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fef08a'
              }}>
                Tummy Spaces Counted: {countedSlots.length} / {targetNumber}
              </div>
            </div>

            {/* Prompt or Action Button */}
            {!hungerConfirmed ? (
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--clr-text)',
                margin: '0 auto 16px auto',
                fontWeight: 600
              }}>
                👉 Tap each empty space inside the monster's tummy to count 1, 2, 3!
              </p>
            ) : (
              <div className="anim-pop">
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--clr-correct)',
                  marginBottom: '16px'
                }}>
                  ✨ The monster wants {targetNumber} cakes! Remember this number!
                </div>
                <button
                  onClick={handleGoToBakery}
                  className="tenali-btn-primary"
                  style={{
                    fontSize: '1.2rem',
                    padding: '14px 34px',
                    borderRadius: 'var(--radius-pill)',
                    margin: '0 auto'
                  }}
                >
                  <span>Visit the Bakery & Collect Cakes! 🧁➡️</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 2: VISIT THE BAKERY (NO TARGET SPOILER IN BASKET!)
        ───────────────────────────────────────────────────────────── */}
        {stage === 'bakery' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            {/* Bakery Header & Shopkeeper (NO target count mentioned!) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '14px 20px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '3rem' }}>👨‍🍳</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-text)' }}>
                    Chef Pierre's Sweet Bakery
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--clr-text-soft)' }}>
                    "Welcome! Pick cakes from the shelves into your basket!"
                  </div>
                </div>
              </div>

              {/* Memory Prompt (Does NOT give away the exact number!) */}
              <div style={{
                background: 'var(--clr-accent-soft)',
                border: '2px solid var(--clr-accent)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--clr-accent)'
              }}>
                🤔 Remember how many cakes the monster wanted!
              </div>
            </div>

            {/* Cake Shelves (Tap to pick) */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontFamily: 'var(--font-display)',
                color: 'var(--clr-text)',
                marginBottom: '12px'
              }}>
                Fresh Cakes on the Shelf (Tap to pick into basket):
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '12px'
              }}>
                {CAKE_VARIETIES.map(cake => (
                  <button
                    key={cake.id}
                    onClick={() => handleAddCake(cake)}
                    style={{
                      background: 'var(--clr-surface)',
                      border: '2px solid var(--clr-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: 'var(--shadow-btn)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, border-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '2.6rem' }}>{cake.emoji}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                      {cake.name}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--clr-accent)',
                      fontWeight: 700
                    }}>
                      + Take Cake
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* PLAYER'S DELIVERY BASKET */}
            {/* CRITICAL: ONLY shows how many are currently in the basket, NEVER "/ 3" */}
            <div style={{
              background: '#fef3c7',
              border: '3px solid #d97706',
              borderRadius: '24px',
              padding: '20px',
              marginBottom: '24px',
              color: '#78350f',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.15rem' }}>
                  <ShoppingBasket size={24} />
                  <span>Your Delivery Basket</span>
                </div>

                {/* Only current total in basket (NO target spoiler!) */}
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  background: '#fde68a',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: '2px solid #b45309'
                }}>
                  Cakes in Basket: {basket.length}
                </div>
              </div>

              {/* Basket Contents with counted badges 1, 2, 3... */}
              {basket.length === 0 ? (
                <div style={{
                  padding: '24px',
                  border: '2px dashed #d97706',
                  borderRadius: '16px',
                  color: '#92400e',
                  fontWeight: 600
                }}>
                  🧺 Your basket is empty! Tap the cakes above to collect them (1, 2, 3...)!
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center',
                  padding: '10px 0'
                }}>
                  {basket.map((cake, idx) => (
                    <div
                      key={cake.uid}
                      className="anim-pop"
                      style={{
                        background: '#ffffff',
                        border: '2px solid #d97706',
                        borderRadius: '16px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}
                    >
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#d97706',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '1.8rem' }}>{cake.emoji}</span>
                      <button
                        onClick={() => handleRemoveCake(cake.uid)}
                        title="Remove cake from basket"
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deliver Button */}
            <button
              onClick={handleDeliverCakes}
              disabled={basket.length === 0}
              className="tenali-btn-primary"
              style={{
                fontSize: '1.25rem',
                padding: '14px 38px',
                borderRadius: 'var(--radius-pill)',
                opacity: basket.length === 0 ? 0.5 : 1,
                cursor: basket.length === 0 ? 'not-allowed' : 'pointer',
                margin: '0 auto'
              }}
            >
              <span>DELIVER THE CAKES TO THE MONSTER! 🚚🍰</span>
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 3: THE MONSTER'S VERDICT
        ───────────────────────────────────────────────────────────── */}
        {stage === 'verdict' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '28px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            {/* Monster Reaction Character */}
            <div style={{
              background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)',
              border: '4px solid #5b21b6',
              borderRadius: '50px 50px 60px 60px',
              padding: '24px 20px 30px 20px',
              maxWidth: '460px',
              margin: '0 auto 24px auto',
              boxShadow: '0 16px 36px rgba(109, 40, 217, 0.45)',
              color: '#ffffff',
              position: 'relative'
            }}>
              <div style={{ fontSize: '4.8rem', lineHeight: 1, marginBottom: '4px' }}>
                {monsterVisual.face}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#fef08a',
                marginBottom: '14px'
              }}>
                Kumbakaran the Monster
              </div>

              {/* Stomach filling animation on exact match */}
              <div style={{
                background: 'radial-gradient(ellipse at center, rgba(254, 240, 138, 0.25) 0%, rgba(20, 10, 40, 0.75) 100%)',
                border: '4px solid #fef08a',
                borderRadius: '50% 50% 48% 48% / 60% 60% 45% 45%',
                padding: '24px 18px 28px 18px',
                margin: '0 auto',
                maxWidth: '380px'
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  {Array.from({ length: targetNumber }).map((_, idx) => {
                    const isEaten = verdict === 'exact' && idx < eatenCount;
                    return (
                      <div
                        key={idx}
                        className={isEaten ? 'anim-pop' : ''}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: isEaten ? '#4ade80' : 'rgba(255, 255, 255, 0.15)',
                          border: isEaten ? '3px solid #16a34a' : '3px dashed #fef08a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.6rem',
                          boxShadow: isEaten ? '0 0 16px rgba(74, 222, 128, 0.8)' : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        {isEaten ? '🍰' : '🍽️'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Verdict Outcomes */}
            {verdict === 'too_few' && (
              <div className="anim-pop" style={{
                background: 'var(--clr-wrong-bg)',
                border: '2px solid var(--clr-wrong)',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto 20px auto'
              }}>
                <h3 style={{ color: 'var(--clr-wrong)', margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                  😢 Heyyy! I'm Still Hungry!
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', margin: '0 0 12px 0' }}>
                  "I wanted <strong>{targetNumber}</strong> cakes, but you brought only <strong>{basket.length}</strong>!"
                </p>
                <div style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: 800,
                  color: 'var(--clr-wrong)',
                  marginBottom: '16px'
                }}>
                  {targetNumber} - {basket.length} = {targetNumber - basket.length} more cakes needed!
                </div>
                <button
                  onClick={handleReturnToBakery}
                  className="tenali-btn-primary"
                  style={{
                    fontSize: '1.05rem',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--clr-accent)'
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Return to Bakery to Add More Cakes!</span>
                </button>
              </div>
            )}

            {verdict === 'too_many' && (
              <div className="anim-pop" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto 20px auto'
              }}>
                <h3 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                  😵‍💫 WHOA! That's Too Many Cakes!
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', margin: '0 0 12px 0' }}>
                  "My stomach will burst! I only wanted <strong>{targetNumber}</strong> cakes, but you brought <strong>{basket.length}</strong>!"
                </p>
                <div style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: 800,
                  color: '#ef4444',
                  marginBottom: '16px'
                }}>
                  {basket.length} - {targetNumber} = {basket.length - targetNumber} extra cakes!
                </div>
                <button
                  onClick={handleReturnToBakery}
                  className="tenali-btn-primary"
                  style={{
                    fontSize: '1.05rem',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-pill)',
                    background: '#ef4444'
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Return to Bakery to Remove Extra Cakes!</span>
                </button>
              </div>
            )}

            {verdict === 'exact' && (
              <div className="anim-pop" style={{
                background: 'var(--clr-correct-bg)',
                border: '2px solid var(--clr-correct)',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto'
              }}>
                <h3 style={{ color: 'var(--clr-correct)', margin: '0 0 8px 0', fontSize: '1.35rem' }}>
                  🎉 YUMMMM! Perfect!
                </h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--clr-text)', margin: '0 0 8px 0' }}>
                  You brought exactly <strong>{targetNumber}</strong> cakes! The monster's stomach is happy and full!
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {showCelebration && (
        <CelebrationModal
          title="Monster Feeder Champion!"
          subtitle={`You successfully matched the monster's hunger with exactly ${targetNumber} cakes!`}
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
