import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import { playPop, playSuccessChime, playGentleBoing, playVictoryFanfare } from '../../../core/soundEffects';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';
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

interface LevelConfig {
  level: number;
  minuend: number;
  subtrahend: number;
  diff: number;
  hDigit: number;
  tSub: number;
  oSub: number;
  title: string;
}

const TRICK_LEVELS: LevelConfig[] = [
  { level: 1, minuend: 500, subtrahend: 53, diff: 447, hDigit: 5, tSub: 5, oSub: 3, title: "Level 1: The Magic 500 − 53 Trick" },
  { level: 2, minuend: 300, subtrahend: 46, diff: 254, hDigit: 3, tSub: 4, oSub: 6, title: "Level 2: Sweet 300 − 46 Trick" },
  { level: 3, minuend: 400, subtrahend: 75, diff: 325, hDigit: 4, tSub: 7, oSub: 5, title: "Level 3: Golden 400 − 75 Trick" },
  { level: 4, minuend: 600, subtrahend: 82, diff: 518, hDigit: 6, tSub: 8, oSub: 2, title: "Level 4: Royal 600 − 82 Trick" },
  { level: 5, minuend: 700, subtrahend: 64, diff: 636, hDigit: 7, tSub: 6, oSub: 4, title: "Level 5: Grand 700 − 64 Trick" }
];

type StepPhase =
  | 'step1_ones_need'
  | 'step2_tens_need'
  | 'step3_hundreds_borrow'
  | 'step4_tens_borrow'
  | 'step5_check_conservation'
  | 'step6_subtract_ones'
  | 'step7_subtract_tens'
  | 'step8_subtract_hundreds'
  | 'complete';

export default function TrickOrThinkGame({ onBack }: GameProps) {
  const [level, setLevel] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const currentLevelConfig = TRICK_LEVELS[level - 1] || TRICK_LEVELS[0];
  const { minuend, subtrahend, diff, hDigit, tSub, oSub } = currentLevelConfig;

  // Active step phase
  const [step, setStep] = useState<StepPhase>('step1_ones_need');
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Story modal state
  const [storyOpen, setStoryOpen] = useState<boolean>(true);

  // Regrouping values
  const [hValue, setHValue] = useState<number>(hDigit);
  const [tValue, setTValue] = useState<number>(0);
  const [oValue, setOValue] = useState<number>(0);

  // Slashed indicators for vertical place-value board
  const [hSlashed, setHSlashed] = useState<boolean>(false);
  const [tSlashedOnce, setTSlashedOnce] = useState<boolean>(false);
  const [tSlashedTwice, setTSlashedTwice] = useState<boolean>(false);
  const [oSlashed, setOSlashed] = useState<boolean>(false);

  // Result digits
  const [oResult, setOResult] = useState<number | null>(null);
  const [tResult, setTResult] = useState<number | null>(null);
  const [hResult, setHResult] = useState<number | null>(null);

  // Reset board for a level
  const resetBoardForLevel = (lvlConfig: LevelConfig) => {
    setStep('step1_ones_need');
    setFeedback(null);
    setHValue(lvlConfig.hDigit);
    setTValue(0);
    setOValue(0);
    setHSlashed(false);
    setTSlashedOnce(false);
    setTSlashedTwice(false);
    setOSlashed(false);
    setOResult(null);
    setTResult(null);
    setHResult(null);
  };

  // Next level handler
  const handleNextLevel = () => {
    setShowCelebration(false);
    const nextLvl = level < 5 ? level + 1 : 1;
    setLevel(nextLvl);
    resetBoardForLevel(TRICK_LEVELS[nextLvl - 1]);
  };

  const handleReplay = () => {
    setShowCelebration(false);
    resetBoardForLevel(currentLevelConfig);
  };

  // Multiple-choice question generator per step
  const getStepQuestion = () => {
    switch (step) {
      case 'step1_ones_need':
        return {
          question: `The Ones House has 0 candies, but needs to give ${oSub} candies! Who should the Ones house ask first?`,
          options: [
            { text: "The Tens House next door 🗼", correct: true, feedback: "Spot on! In place value, always ask your immediate neighbor to the left first!" },
            { text: "The Hundreds House 🏰", correct: false, feedback: "You cannot skip neighbors! Always ask the Tens house first." },
            { text: "Search the street 🛣️", correct: false, feedback: "Ask your friendly neighbor on the left: the Tens house!" }
          ]
        };

      case 'step2_tens_need':
        return {
          question: `The Tens House also has 0 candies! Where should the Tens house go to borrow candies?`,
          options: [
            { text: "The Hundreds House 🏰", correct: true, feedback: "Correct! The Tens house asks its wealthy neighbor to the left: Hundreds!" },
            { text: "Back to the Ones House 🎃", correct: false, feedback: "The Ones house is empty too! Tens must ask Hundreds on the left." },
            { text: "Give up! 🤷", correct: false, feedback: "Don't give up! Hundreds has plenty of candies!" }
          ]
        };

      case 'step3_hundreds_borrow':
        return {
          question: `The Hundreds House (having ${hDigit} hundreds) shares 1 Hundred (= 10 Tens). What happens now?`,
          options: [
            { text: `Hundreds becomes ${hDigit - 1}, and Tens gets 10 Tens! 🔄`, correct: true, feedback: `Bravo! Hundreds drops from ${hDigit} to ${hDigit - 1}, and Tens now has 10 tens!` },
            { text: `Hundreds stays ${hDigit} and Tens gets 100 Tens`, correct: false, feedback: `1 Hundred equals exactly 10 Tens!` },
            { text: `Tens gets only 1 candy`, correct: false, feedback: `1 Hundred gives 10 Tens, which is 100 candies!` }
          ]
        };

      case 'step4_tens_borrow':
        return {
          question: `The Tens House now has 10 Tens. It passes 1 Ten (= 10 Ones) to the Ones House. How many Tens remain?`,
          options: [
            { text: "Tens has 9 tens left, and Ones has 10 ones! 🍬", correct: true, feedback: "Awesome! 10 − 1 = 9 tens remaining, and Ones now has 10 ones!" },
            { text: "Tens has 10 tens left", correct: false, feedback: "Tens gave away 1 ten, so 10 − 1 = 9!" },
            { text: "Ones only gets 1 single candy", correct: false, feedback: "1 Ten gives exactly 10 ones!" }
          ]
        };

      case 'step5_check_conservation':
        return {
          question: `Look at the street now: ${(hDigit - 1) * 100} (in Hundreds) + 90 (in Tens) + 10 (in Ones). What is the total?`,
          options: [
            { text: `${(hDigit - 1) * 100} + 90 + 10 = ${minuend} candies! No candy was lost! ✨`, correct: true, feedback: `Mathematical Magic! Not a single candy was lost! Value is conserved: ${minuend} = ${(hDigit - 1) * 100} + 90 + 10!` },
            { text: "The candies vanished into thin air!", correct: false, feedback: `Add them up: ${(hDigit - 1) * 100} + 90 + 10 = ${minuend}!` },
            { text: `There are more than ${minuend} candies now`, correct: false, feedback: `The total is exactly ${minuend}!` }
          ]
        };

      case 'step6_subtract_ones':
        return {
          question: `Now subtract the Ones column: 10 ones − ${oSub} needed = ?`,
          options: [
            { text: `10 − ${oSub} = ${10 - oSub} ones 🎃`, correct: true, feedback: `Terrific! 10 − ${oSub} = ${10 - oSub} in the Ones column!` },
            { text: `10 − ${oSub} = ${10 - oSub + 1}`, correct: false, feedback: `Count carefully: 10 take away ${oSub} leaves ${10 - oSub}.` },
            { text: `10 − ${oSub} = ${Math.max(1, 10 - oSub - 1)}`, correct: false, feedback: `Double check: 10 − ${oSub} = ${10 - oSub}.` }
          ]
        };

      case 'step7_subtract_tens':
        return {
          question: `Now subtract the Tens column: 9 tens − ${tSub} needed = ?`,
          options: [
            { text: `9 − ${tSub} = ${9 - tSub} tens 🗼`, correct: true, feedback: `Superb! 9 − ${tSub} = ${9 - tSub} in the Tens column!` },
            { text: `9 − ${tSub} = ${9 - tSub + 1}`, correct: false, feedback: `Check again: 9 take away ${tSub} leaves ${9 - tSub}.` },
            { text: `9 − ${tSub} = ${Math.max(1, 9 - tSub - 1)}`, correct: false, feedback: `Subtract carefully: 9 − ${tSub} = ${9 - tSub}.` }
          ]
        };

      case 'step8_subtract_hundreds':
        return {
          question: `Finally, subtract the Hundreds column: ${hDigit - 1} hundreds − 0 = ?`,
          options: [
            { text: `${hDigit - 1} − 0 = ${hDigit - 1} hundreds 🏰`, correct: true, feedback: `Spectacular! ${hDigit - 1} hundreds remain!` },
            { text: `${hDigit - 1} − 0 = 0`, correct: false, feedback: `Taking away 0 leaves the same number: ${hDigit - 1}!` }
          ]
        };

      default:
        return null;
    }
  };

  const currentQ = getStepQuestion();

  // Answer handler
  const handleOptionClick = (opt: { text: string; correct: boolean; feedback: string }) => {
    if (opt.correct) {
      playSuccessChime();
      setFeedback({ text: opt.feedback, isCorrect: true });
      speak(opt.feedback, 0.85);

      // Advance step state
      setTimeout(() => {
        setFeedback(null);
        if (step === 'step1_ones_need') {
          setStep('step2_tens_need');
        } else if (step === 'step2_tens_need') {
          setStep('step3_hundreds_borrow');
        } else if (step === 'step3_hundreds_borrow') {
          setHSlashed(true);
          setHValue(hDigit - 1);
          setTSlashedOnce(true);
          setTValue(10);
          setStep('step4_tens_borrow');
        } else if (step === 'step4_tens_borrow') {
          setTSlashedTwice(true);
          setTValue(9);
          setOSlashed(true);
          setOValue(10);
          setStep('step5_check_conservation');
        } else if (step === 'step5_check_conservation') {
          setStep('step6_subtract_ones');
        } else if (step === 'step6_subtract_ones') {
          setOResult(10 - oSub);
          setStep('step7_subtract_tens');
        } else if (step === 'step7_subtract_tens') {
          setTResult(9 - tSub);
          setStep('step8_subtract_hundreds');
        } else if (step === 'step8_subtract_hundreds') {
          setHResult(hDigit - 1);
          setStep('complete');
          playVictoryFanfare();
          setStars(s => s + 3);
          setTimeout(() => {
            setShowCelebration(true);
          }, 800);
        }
      }, 900);
    } else {
      playGentleBoing();
      setFeedback({ text: opt.feedback, isCorrect: false });
      speak(opt.feedback, 0.85);
    }
  };

  return (
    <QuizLayout
      title="Trick-or-Think"
      subtitle={`Solve ${minuend} − ${subtrahend} through place-value borrowing across zeros!`}
      category="Subtraction with Regrouping"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>

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
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-accent)', textTransform: 'uppercase' }}>
              Place Value Subtraction • {currentLevelConfig.title}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              Problem: {minuend} − {subtrahend} = {step === 'complete' ? diff : '?'}
            </div>
          </div>

          <div style={{
            background: 'var(--clr-accent-soft)',
            border: '2px solid var(--clr-accent)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--clr-accent)'
          }}>
            Level {level} / 5
          </div>
        </div>

        {/* 3 LIVING HOUSES NEIGHBORHOOD */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '20px 16px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h4 style={{
            textAlign: 'center',
            fontSize: '1rem',
            color: 'var(--clr-text-soft)',
            margin: '0 0 16px 0',
            fontWeight: 700
          }}>
            🏘️ The 3 Place-Value Houses on Sweet Street
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Hundreds House */}
            <div style={{
              background: 'linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%)',
              border: '3px solid #7c3aed',
              borderRadius: '20px',
              padding: '16px 12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '2.8rem' }}>🏰</span>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#5b21b6', marginTop: '4px' }}>
                Hundreds House (H)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6d28d9', fontWeight: 600 }}>
                Holds 100s bundles
              </div>

              <div style={{
                background: '#ffffff',
                border: '2px solid #7c3aed',
                borderRadius: '12px',
                padding: '8px',
                marginTop: '10px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#5b21b6', fontWeight: 700 }}>Current Value:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4c1d95' }}>
                  {hValue} Hundred{hValue !== 1 ? 's' : ''} ({hValue * 100})
                </div>
              </div>
            </div>

            {/* Tens House */}
            <div style={{
              background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)',
              border: '3px solid #0284c7',
              borderRadius: '20px',
              padding: '16px 12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '2.8rem' }}>🗼</span>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0369a1', marginTop: '4px' }}>
                Tens House (T)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
                Holds 10s rolls
              </div>

              <div style={{
                background: '#ffffff',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                padding: '8px',
                marginTop: '10px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700 }}>Current Value:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0c4a6e' }}>
                  {tValue} Ten{tValue !== 1 ? 's' : ''} ({tValue * 10})
                </div>
              </div>
            </div>

            {/* Ones House */}
            <div style={{
              background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
              border: '3px solid #d97706',
              borderRadius: '20px',
              padding: '16px 12px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '2.8rem' }}>🎃</span>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#92400e', marginTop: '4px' }}>
                Ones House (O)
              </div>
              <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 600 }}>
                Holds loose 1s candies
              </div>

              <div style={{
                background: '#ffffff',
                border: '2px solid #d97706',
                borderRadius: '12px',
                padding: '8px',
                marginTop: '10px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>Current Value:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#78350f' }}>
                  {oValue} One{oValue !== 1 ? 's' : ''} ({oValue})
                </div>
              </div>
            </div>
          </div>

          {/* Conservation banner if regrouped */}
          {(hSlashed || oSlashed) && (
            <div className="anim-pop" style={{
              background: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '10px 16px',
              marginTop: '14px',
              textAlign: 'center',
              color: '#065f46',
              fontSize: '0.92rem',
              fontWeight: 800
            }}>
              ✨ Value Conservation Check: {hValue * 100} + {tValue * 10} + {oValue} = {hValue * 100 + tValue * 10 + oValue} total candies! (Not a single candy was lost!)
            </div>
          )}
        </div>

        {/* VERTICAL PLACE-VALUE NOTEBOOK BOARD */}
        <div style={{
          background: 'var(--clr-surface)',
          border: '2px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '24px 20px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h4 style={{
            fontSize: '1rem',
            color: 'var(--clr-text-soft)',
            margin: '0 0 12px 0',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            📝 School Copybook Regrouping Column View
          </h4>

          {/* Vertical Math Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 70px 70px 70px',
            fontFamily: 'monospace, monospace',
            fontSize: '1.6rem',
            fontWeight: 900,
            rowGap: '6px',
            textAlign: 'center',
            alignItems: 'center',
            padding: '16px 24px',
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-border)',
            borderRadius: '16px'
          }}>
            {/* Headers */}
            <div style={{ color: 'var(--clr-text-soft)', fontSize: '0.9rem' }}></div>
            <div style={{ color: '#7c3aed', fontSize: '1rem', fontWeight: 800 }}>H</div>
            <div style={{ color: '#0284c7', fontSize: '1rem', fontWeight: 800 }}>T</div>
            <div style={{ color: '#d97706', fontSize: '1rem', fontWeight: 800 }}>O</div>

            {/* Regrouped Numbers Row (Top annotations) */}
            <div></div>
            {/* Hundreds top */}
            <div style={{ color: '#7c3aed', fontSize: '1.1rem', fontWeight: 800 }}>
              {hSlashed ? hValue : ''}
            </div>
            {/* Tens top */}
            <div style={{ color: '#0284c7', fontSize: '1.1rem', fontWeight: 800 }}>
              {tSlashedTwice ? '9' : tSlashedOnce ? '10' : ''}
            </div>
            {/* Ones top */}
            <div style={{ color: '#d97706', fontSize: '1.1rem', fontWeight: 800 }}>
              {oSlashed ? '10' : ''}
            </div>

            {/* Minuend Row */}
            <div></div>
            {/* H digit */}
            <div style={{
              color: 'var(--clr-text)',
              textDecoration: hSlashed ? 'line-through' : 'none',
              opacity: hSlashed ? 0.4 : 1
            }}>
              {hDigit}
            </div>
            {/* T digit */}
            <div style={{
              color: 'var(--clr-text)',
              textDecoration: tSlashedOnce ? 'line-through' : 'none',
              opacity: tSlashedOnce ? 0.4 : 1
            }}>
              0
            </div>
            {/* O digit */}
            <div style={{
              color: 'var(--clr-text)',
              textDecoration: oSlashed ? 'line-through' : 'none',
              opacity: oSlashed ? 0.4 : 1
            }}>
              0
            </div>

            {/* Subtrahend Row */}
            <div style={{ color: 'var(--clr-wrong)', fontSize: '1.4rem' }}>−</div>
            <div style={{ color: 'var(--clr-text)' }}>&nbsp;</div>
            <div style={{ color: 'var(--clr-text)' }}>{tSub}</div>
            <div style={{ color: 'var(--clr-text)' }}>{oSub}</div>

            {/* Equals Divider Line */}
            <div style={{ gridColumn: '1 / -1', height: '3px', background: 'var(--clr-text)', margin: '4px 0' }} />

            {/* Result Row */}
            <div></div>
            <div style={{
              color: hResult !== null ? 'var(--clr-correct)' : 'var(--clr-text-soft)',
              fontWeight: 900
            }}>
              {hResult !== null ? hResult : '?'}
            </div>
            <div style={{
              color: tResult !== null ? 'var(--clr-correct)' : 'var(--clr-text-soft)',
              fontWeight: 900
            }}>
              {tResult !== null ? tResult : '?'}
            </div>
            <div style={{
              color: oResult !== null ? 'var(--clr-correct)' : 'var(--clr-text-soft)',
              fontWeight: 900
            }}>
              {oResult !== null ? oResult : '?'}
            </div>
          </div>
        </div>

        {/* INTERACTIVE QUESTION PANEL */}
        {currentQ && (
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
              <HelpCircle size={22} color="var(--clr-accent)" />
              <span>{currentQ.question}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(opt)}
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
                    boxShadow: 'var(--shadow-btn)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
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

        {/* STEP COMPLETE VICTORY STATE */}
        {step === 'complete' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-correct-bg)',
            border: '2px solid var(--clr-correct)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--clr-correct)', fontSize: '1.4rem', margin: '0 0 8px 0' }}>
              🎉 Incredible Regrouping Mastery!
            </h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--clr-text)', margin: '0 0 16px 0' }}>
              You solved <strong>{minuend} − {subtrahend} = {diff}</strong> through step-by-step place-value borrowing across zeros!
            </p>

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
              <span>{level < 5 ? `Next Level (${level + 1}) ➔` : 'Play Again 🔄'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Story Modal */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="The Mystery of 500 − 53"
        badge="Regrouping Story"
        icon="🏰"
        story={`Three friendly houses along Sweet Street hold ${minuend} candies! But when trick-or-treaters need ${subtrahend} candies, the Ones house and Tens house discover their bowls have 0 candies! How can they borrow from Hundreds without losing a single sweet? Join the houses on an exciting borrowing adventure!`}
        buttonText="Next ➔ Start Borrowing!"
      />

      {/* Level Complete Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Place Value Master!"
          subtitle={`You successfully solved ${minuend} − ${subtrahend} = ${diff} through place-value borrowing!`}
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
