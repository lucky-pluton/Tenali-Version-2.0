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
import { ShoppingBasket, ArrowRight, ArrowLeft, RefreshCw, Sparkles, CheckCircle, Heart } from 'lucide-react';

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

  // Generate target hunger number based on level
  const generateTarget = (lvl) => {
    const range = LEVEL_RANGES[lvl] || LEVEL_RANGES[1];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const [targetNumber, setTargetNumber] = useState(() => generateTarget(1));

  // Game Stage: 'hunger' | 'bakery' | 'verdict' | 'eating'
  const [stage, setStage] = useState('hunger');

  // Stage 1: Selected number of hunger slots
  const [hungerGuess, setHungerGuess] = useState(null);
  const [hungerFeedback, setHungerFeedback] = useState(null);

  // Stage 2: Bakery collection basket (array of cake objects)
  const [basket, setBasket] = useState([]);

  // Stage 3: Verdict outcome ('too_few' | 'too_many' | 'exact')
  const [verdict, setVerdict] = useState(null);
  const [eatenCount, setEatenCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Play stomach growl on initial hunger stage load
  useEffect(() => {
    if (stage === 'hunger') {
      const timer = setTimeout(() => {
        playStomachGrowl();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [stage, targetNumber]);

  // Handle stage 1: Child counts and selects hunger slots
  const handleSelectHungerCount = (num) => {
    setHungerGuess(num);
    if (num === targetNumber) {
      playSuccessChime();
      setHungerFeedback({
        type: 'success',
        text: `Yes! Exactly ${targetNumber} cakes! The monster's stomach has ${targetNumber} empty spaces!`
      });
    } else {
      playGentleBoing();
      setHungerFeedback({
        type: 'error',
        text: num > targetNumber
          ? `That's a bit too high! Count each empty circle inside the tummy again.`
          : `That's a bit too low! Count each empty circle carefully.`
      });
    }
  };

  // Transition from Stage 1 to Stage 2
  const handleGoToBakery = () => {
    playBakeryBell();
    setStage('bakery');
  };

  // Stage 2: Add cake to basket
  const handleAddCake = (cakeType) => {
    playCakePick();
    setBasket(prev => [...prev, { ...cakeType, uid: Date.now() + Math.random() }]);
  };

  // Stage 2: Remove specific cake from basket
  const handleRemoveCake = (uid) => {
    playCakePick();
    setBasket(prev => prev.filter(c => c.uid !== uid));
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

      // Trigger animated one-by-one eating
      let currentEaten = 0;
      const eatInterval = setInterval(() => {
        currentEaten += 1;
        setEatenCount(currentEaten);
        playMunch();

        if (currentEaten >= targetNumber) {
          clearInterval(eatInterval);
          setTimeout(() => {
            playMonsterBurp();
            setTimeout(() => {
              setShowCelebration(true);
            }, 900);
          }, 600);
        }
      }, 450);
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    const nextLvl = level < 5 ? level + 1 : 1;
    setLevel(nextLvl);
    resetRound(nextLvl);
  };

  const resetRound = (lvl = level) => {
    setShowCelebration(false);
    setTargetNumber(generateTarget(lvl));
    setStage('hunger');
    setHungerGuess(null);
    setHungerFeedback(null);
    setBasket([]);
    setVerdict(null);
    setEatenCount(0);
  };

  // Monster face expression depending on stage & verdict
  const getMonsterExpression = () => {
    if (stage === 'verdict') {
      if (verdict === 'too_few') return { face: '🥺', mood: 'Still Hungry!', color: '#38bdf8' };
      if (verdict === 'too_many') return { face: '😵‍💫', mood: 'Tummy Ache! Overstuffed!', color: '#ef4444' };
      if (verdict === 'exact') return { face: '😋', mood: 'Super Happy! Eating All Cakes!', color: '#10b981' };
    }
    if (stage === 'hunger' && hungerGuess === targetNumber) {
      return { face: '😃', mood: 'Ready for Bakery!', color: '#10b981' };
    }
    return { face: '👹', mood: 'SUPER Hungry!', color: '#f59e0b' };
  };

  const monsterState = getMonsterExpression();

  return (
    <QuizLayout
      title="Feed the Monster!"
      subtitle="Count the monster's hunger, collect cakes from the bakery, and feed him!"
      category="Counting"
      level={level}
      stars={stars}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>
        {/* Level Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '12px 18px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: 'var(--clr-text)',
              margin: 0
            }}>
              {LEVEL_RANGES[level].name}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              {stage === 'hunger'
                ? 'Step 1: Count empty stomach slots'
                : stage === 'bakery'
                ? 'Step 2: Collect cakes in the bakery'
                : 'Step 3: Monster\'s Verdict'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  resetRound(lvl);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: level === lvl ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: level === lvl ? '#fff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)'
                }}
              >
                Lvl {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 1: DISCOVER THE MONSTER'S HUNGER
        ───────────────────────────────────────────────────────────── */}
        {stage === 'hunger' && (
          <div style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '28px 20px',
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
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--clr-text)',
              marginBottom: '20px',
              position: 'relative'
            }}>
              💬 "I'm SUPER hungry! Look inside my tummy and count how many cakes I want!"
            </div>

            {/* Cartoon Monster Body */}
            <div style={{
              background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)',
              border: '4px solid #5b21b6',
              borderRadius: '40px',
              padding: '30px 20px',
              maxWidth: '440px',
              margin: '0 auto 24px auto',
              boxShadow: '0 12px 32px rgba(109, 40, 217, 0.4)',
              color: '#ffffff',
              position: 'relative'
            }}>
              {/* Monster Eyes & Face */}
              <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '8px' }}>
                {monsterState.face}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#fef08a',
                marginBottom: '16px'
              }}>
                Barnaby the Hungry Monster
              </div>

              {/* Monster Stomach Window */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '3px solid #fef08a',
                borderRadius: '24px',
                padding: '18px 14px',
                margin: '0 auto',
                maxWidth: '360px'
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#fef08a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px'
                }}>
                  ⬇️ Monster's Empty Stomach Slots ⬇️
                </div>

                {/* Empty Cake Slots */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  {Array.from({ length: targetNumber }).map((_, idx) => (
                    <div
                      key={idx}
                      className="anim-bounce"
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '3px dashed #fef08a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: '#fef08a',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question & Number Input */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                color: 'var(--clr-text)',
                margin: '0 0 12px 0'
              }}>
                How many cakes does the monster want?
              </h3>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {Array.from({ length: LEVEL_RANGES[level].max }).map((_, i) => {
                  const num = i + 1;
                  const isSelected = hungerGuess === num;
                  const isCorrect = isSelected && num === targetNumber;

                  return (
                    <button
                      key={num}
                      onClick={() => handleSelectHungerCount(num)}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: isCorrect ? 'var(--clr-correct)' : isSelected ? 'var(--clr-wrong)' : 'var(--clr-surface)',
                        border: '2px solid var(--clr-border)',
                        color: isSelected ? '#ffffff' : 'var(--clr-text)',
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        boxShadow: 'var(--shadow-btn)'
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback & Proceed to Bakery Button */}
            {hungerFeedback && (
              <div className="anim-pop" style={{
                maxWidth: '480px',
                margin: '0 auto 20px auto',
                padding: '12px 18px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                background: hungerFeedback.type === 'success' ? 'var(--clr-correct-bg)' : 'var(--clr-wrong-bg)',
                color: hungerFeedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)',
                border: `1px solid ${hungerFeedback.type === 'success' ? 'var(--clr-correct)' : 'var(--clr-wrong)'}`
              }}>
                {hungerFeedback.text}
              </div>
            )}

            {hungerGuess === targetNumber && (
              <button
                onClick={handleGoToBakery}
                className="tenali-btn-primary anim-pop"
                style={{
                  fontSize: '1.2rem',
                  padding: '14px 34px',
                  borderRadius: 'var(--radius-pill)',
                  margin: '0 auto'
                }}
              >
                <span>Visit the Bakery & Collect {targetNumber} Cakes! 🧁</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 2: VISIT THE BAKERY
        ───────────────────────────────────────────────────────────── */}
        {stage === 'bakery' && (
          <div style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            {/* Bakery Header & Shopkeeper */}
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
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--clr-text)' }}>
                    Chef Pierre's Sweet Bakery
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
                    "Tap any cake to put it into your basket!"
                  </div>
                </div>
              </div>

              {/* Target Reminder Badge */}
              <div style={{
                background: 'var(--clr-accent-soft)',
                border: '2px solid var(--clr-accent)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--clr-accent)'
              }}>
                🎯 Monster Wants: {targetNumber} Cakes
              </div>
            </div>

            {/* Bakery Cake Shelves */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontFamily: 'var(--font-display)',
                color: 'var(--clr-text)',
                marginBottom: '12px'
              }}>
                Fresh Cakes on the Shelf (Tap to pick):
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
                      transition: 'transform 0.15s, border-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '2.5rem' }}>{cake.emoji}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                      {cake.name}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--clr-accent)',
                      fontWeight: 700
                    }}>
                      + Add
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Player's Collection Basket */}
            <div style={{
              background: '#fef3c7',
              border: '3px solid #d97706',
              borderRadius: '24px',
              padding: '20px',
              marginBottom: '24px',
              color: '#78350f'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.1rem' }}>
                  <ShoppingBasket size={24} />
                  <span>Your Delivery Basket</span>
                </div>

                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-kids)',
                  color: basket.length === targetNumber ? '#059669' : basket.length > targetNumber ? '#dc2626' : '#d97706'
                }}>
                  Cakes Collected: {basket.length} / {targetNumber}
                </div>
              </div>

              {/* Basket Contents Tray */}
              <div style={{
                background: '#ffffff',
                border: '2px dashed #b45309',
                borderRadius: '16px',
                padding: '14px',
                minHeight: '74px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                {basket.map((cake) => (
                  <div
                    key={cake.uid}
                    onClick={() => handleRemoveCake(cake.uid)}
                    title="Tap to remove from basket"
                    className="anim-pop"
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #f59e0b',
                      borderRadius: '12px',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{cake.emoji}</span>
                    <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>✕</span>
                  </div>
                ))}

                {basket.length === 0 && (
                  <span style={{ color: '#92400e', fontSize: '0.95rem', fontStyle: 'italic' }}>
                    The basket is empty! Tap the cakes above to collect them.
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '6px', color: '#92400e' }}>
                Tip: If you add too many cakes by mistake, tap any cake in the basket to remove it!
              </div>
            </div>

            {/* Deliver Cakes Button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                onClick={() => setStage('hunger')}
                className="tenali-btn-secondary"
                style={{ fontSize: '1rem', padding: '12px 24px' }}
              >
                <ArrowLeft size={18} />
                <span>Peek at Monster's Tummy</span>
              </button>

              <button
                onClick={handleDeliverCakes}
                disabled={basket.length === 0}
                className="tenali-btn-primary"
                style={{
                  fontSize: '1.15rem',
                  padding: '14px 34px',
                  borderRadius: 'var(--radius-pill)',
                  opacity: basket.length === 0 ? 0.6 : 1
                }}
              >
                <span>DELIVER THE CAKES! 🚀</span>
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 3: THE MONSTER'S VERDICT
        ───────────────────────────────────────────────────────────── */}
        {stage === 'verdict' && (
          <div style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '28px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            {/* Monster Reaction Character */}
            <div style={{
              background: verdict === 'exact'
                ? 'linear-gradient(180deg, #059669 0%, #047857 100%)'
                : verdict === 'too_many'
                ? 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
              border: '4px solid rgba(255,255,255,0.2)',
              borderRadius: '40px',
              padding: '24px 20px',
              maxWidth: '460px',
              margin: '0 auto 20px auto',
              color: '#ffffff',
              boxShadow: '0 12px 28px rgba(0,0,0,0.35)'
            }}>
              <div style={{ fontSize: '5.5rem', lineHeight: 1, marginBottom: '6px' }}>
                {monsterState.face}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '14px'
              }}>
                Barnaby: {monsterState.mood}
              </div>

              {/* Stomach Slots During Verdict */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '20px',
                padding: '14px',
                maxWidth: '380px',
                margin: '0 auto'
              }}>
                <div style={{ fontSize: '0.82rem', color: '#fef08a', marginBottom: '8px', fontWeight: 700 }}>
                  {verdict === 'exact' ? 'Full Tummy!' : `Stomach Needs: ${targetNumber} Cakes`}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                  {Array.from({ length: targetNumber }).map((_, idx) => {
                    const isFilled = verdict === 'exact' ? idx < eatenCount : idx < basket.length;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: isFilled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                          border: isFilled ? '2px solid #ffffff' : '2px dashed #fef08a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem'
                        }}
                      >
                        {isFilled ? (basket[idx]?.emoji || '🧁') : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CASE A: TOO FEW CAKES */}
            {verdict === 'too_few' && (
              <div className="anim-pop" style={{
                background: 'var(--clr-surface)',
                border: '2px solid var(--clr-accent)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto'
              }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--clr-text)', marginBottom: '8px' }}>
                  "Heyyy! I'm still hungry!"
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', marginBottom: '14px' }}>
                  I wanted <strong>{targetNumber}</strong> cakes, but you brought only <strong>{basket.length}</strong>!
                </p>

                {/* Math Equation */}
                <div style={{
                  background: 'var(--clr-input)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1.4rem',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: 700,
                  color: 'var(--clr-accent)',
                  marginBottom: '18px'
                }}>
                  <span>{targetNumber}</span>
                  <span>-</span>
                  <span>{basket.length}</span>
                  <span>=</span>
                  <span>{targetNumber - basket.length} More Needed!</span>
                </div>

                <div>
                  <button
                    onClick={() => setStage('bakery')}
                    className="tenali-btn-primary"
                    style={{ fontSize: '1.1rem', padding: '12px 28px', borderRadius: 'var(--radius-pill)' }}
                  >
                    <span>Return to Bakery & Get {targetNumber - basket.length} More 🧁</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASE B: TOO MANY CAKES */}
            {verdict === 'too_many' && (
              <div className="anim-pop" style={{
                background: 'var(--clr-surface)',
                border: '2px solid var(--clr-wrong)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto'
              }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--clr-wrong)', marginBottom: '8px' }}>
                  "WHOA! That's too many cakes!"
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--clr-text-soft)', marginBottom: '14px' }}>
                  I only wanted <strong>{targetNumber}</strong> cakes, but you brought <strong>{basket.length}</strong>!
                </p>

                {/* Math Equation */}
                <div style={{
                  background: 'var(--clr-input)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1.4rem',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: 700,
                  color: 'var(--clr-wrong)',
                  marginBottom: '18px'
                }}>
                  <span>{basket.length}</span>
                  <span>-</span>
                  <span>{targetNumber}</span>
                  <span>=</span>
                  <span>{basket.length - targetNumber} Extra Cakes!</span>
                </div>

                <div>
                  <button
                    onClick={() => setStage('bakery')}
                    className="tenali-btn-primary"
                    style={{
                      background: 'var(--clr-wrong)',
                      fontSize: '1.1rem',
                      padding: '12px 28px',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  >
                    <span>Return to Bakery & Remove {basket.length - targetNumber} Extra</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASE C: EXACT RIGHT NUMBER */}
            {verdict === 'exact' && (
              <div className="anim-pop" style={{
                background: 'var(--clr-surface)',
                border: '2px solid var(--clr-correct)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto'
              }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--clr-correct)', marginBottom: '6px' }}>
                  "YUMMMM! Perfect!"
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)' }}>
                  You brought exactly <strong>{targetNumber}</strong> cakes! Barnaby's tummy is happy and full!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showCelebration && (
        <CelebrationModal
          title="Mission Completed!"
          subtitle={`You fed the monster exactly ${targetNumber} delicious cakes!`}
          stars={3}
          onNextLevel={handleNextLevel}
          onReplay={() => resetRound()}
          onHome={onBack}
          hasNextLevel={level < 5}
        />
      )}
    </QuizLayout>
  );
}
