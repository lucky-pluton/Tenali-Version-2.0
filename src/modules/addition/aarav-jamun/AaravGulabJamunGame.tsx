import React, { useState, useRef } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import GulabJamunEmoji from '../../../components/GulabJamunEmoji';
import { playSuccessChime, playGentleBoing, playMunch } from '../../../core/soundEffects';
import { Utensils, CheckCircle } from 'lucide-react';
import { GameProps } from '../../../types';

interface Giver {
  name: string;
  amount: number;
  role: string;
}

interface Scenario {
  title: string;
  giver: Giver[];
}

interface StoryChapterState {
  isOpen: boolean;
  title: string;
  icon: string | React.ReactNode;
  badge: string;
  story: string;
  buttonText: string;
  onProceed?: () => void;
}

interface FeedbackMessage {
  type: 'info' | 'success' | 'error';
  text: string;
}

// Speech synthesis helper for speaking numbers clearly and slowly
function speakNumber(num: number | string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(num));
      utterance.rate = 0.82; // Gentle, child-friendly slow pace
      utterance.pitch = 1.15; // Friendly warm pitch
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

export default function AaravGulabJamunGame({ onBack }: GameProps) {
  const [level, setLevel] = useState<number>(1);
  const [round, setRound] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);

  // Episodic Story Chapters: Story says something -> Activity happens -> Story continues!
  const [storyChapter, setStoryChapter] = useState<StoryChapterState>({
    isOpen: true,
    title: "Aarav's Sweet Birthday Surprise",
    icon: <GulabJamunEmoji size={72} variant="bowl" />,
    badge: "Chapter 1: The Birthday Morning",
    story: "Today is Aarav's birthday! He is sitting at the dining table with a big smile on his face. His Mother arrives first carrying a warm plate of fresh sweets!",
    buttonText: "Next ➔ Feed Mother's Sweets!",
    onProceed: () => {}
  });

  const handleCloseStoryChapter = () => {
    const callback = storyChapter.onProceed;
    setStoryChapter(prev => ({ ...prev, isOpen: false }));
    if (callback) callback();
  };

  const [stepIdx, setStepIdx] = useState<number>(0);
  const [totalEaten, setTotalEaten] = useState<number>(0);
  const [currentSpokenNumber, setCurrentSpokenNumber] = useState<number | null>(null);
  const [isFeeding, setIsFeeding] = useState<boolean>(false);

  const [totalInput, setTotalInput] = useState<string>('');
  const [chewing, setChewing] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<FeedbackMessage | null>(null);

  const feedingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const LEVEL_CONFIGS: Record<number, Scenario[]> = {
    1: [
      {
        title: "Aarav's Birthday!",
        giver: [
          { name: "Mother", amount: 1, role: "First, his mother feeds him 1 sweet." },
          { name: "Father", amount: 1, role: "Then, his father feeds him 1 sweet." },
          { name: "Sister", amount: 1, role: "Next, his sister feeds him 1 sweet." },
          { name: "Friend", amount: 1, role: "Finally, his friend feeds him 1 sweet." }
        ]
      }
    ],
    2: [
      {
        title: "Family Sweet Feast",
        giver: [
          { name: "Mother", amount: 2, role: "Mother feeds him 2 delicious sweets." },
          { name: "Father", amount: 3, role: "Father feeds him 3 more sweets." },
          { name: "Sister", amount: 2, role: "Sister feeds him 2 more sweets." },
          { name: "Friend", amount: 1, role: "Friend offers him 1 sweet." }
        ]
      }
    ],
    3: [
      {
        title: "Mega Sweet Party!",
        giver: [
          { name: "Mother", amount: 3, role: "Mother feeds Aarav 3 warm sweets." },
          { name: "Father", amount: 4, role: "Father lovingly feeds 4 sweets." },
          { name: "Sister", amount: 3, role: "Sister adds 3 more sweets." },
          { name: "Friend", amount: 2, role: "Friend shares 2 final sweets." }
        ]
      }
    ]
  };

  const currentLevelRounds = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[1];
  const currentScenario = currentLevelRounds[round % currentLevelRounds.length];
  const givers = currentScenario.giver;

  const grandTotal = givers.reduce((acc, curr) => acc + curr.amount, 0);

  // Slow, interactive one-by-one sweet feeding with voice counting
  const handleFeedOneByOne = () => {
    if (isFeeding || stepIdx >= givers.length) return;

    setIsFeeding(true);
    setFeedbackMsg(null);
    const amountToFeed = givers[stepIdx].amount;
    let fedThisTurn = 0;
    let runningCount = totalEaten;

    const feedSingleSweet = () => {
      fedThisTurn += 1;
      runningCount += 1;

      // Update total eaten, trigger chewing animation, speak the number!
      setTotalEaten(runningCount);
      setCurrentSpokenNumber(runningCount);
      playMunch();
      setChewing(true);
      speakNumber(runningCount);

      setTimeout(() => {
        setChewing(false);
      }, 400);

      if (fedThisTurn < amountToFeed) {
        // Feed next sweet slowly after 1100ms so child can count along easily
        feedingTimerRef.current = setTimeout(feedSingleSweet, 1100);
      } else {
        // Done with this person's treats
        feedingTimerRef.current = setTimeout(() => {
          setIsFeeding(false);
          const nextStep = stepIdx + 1;
          setStepIdx(nextStep);
          setCurrentSpokenNumber(null);

          if (nextStep < givers.length) {
            const nextGiver = givers[nextStep];
            setTimeout(() => {
              setStoryChapter({
                isOpen: true,
                title: `${nextGiver.name} Arrives!`,
                icon: nextStep === 1 ? '👨' : nextStep === 2 ? '👧' : '👦',
                badge: `Story Continues • Chapter ${nextStep + 1}`,
                story: `Aarav munched all of ${givers[stepIdx].name}'s treats! Just then, ${nextGiver.name} walks in with a fresh plate of ${nextGiver.amount} sweet${nextGiver.amount > 1 ? 's' : ''}! Let's feed Aarav!`,
                buttonText: `Next ➔ Feed ${nextGiver.name}'s Sweets!`,
                onProceed: () => {}
              });
            }, 600);
          } else {
            playSuccessChime();
            setFeedbackMsg({
              type: 'info',
              text: "Aarav is super full! Now count up the grand total of all the sweets he ate!"
            });

            setTimeout(() => {
              setStoryChapter({
                isOpen: true,
                title: "Aarav's Sweet Grand Total!",
                icon: "😋",
                badge: "Story Continues • The Grand Total",
                story: `Aarav rubs his happy round belly! "I am so full of delicious sweets!" he giggles. But wait—can you count up the GRAND TOTAL of all the sweets Aarav ate today?`,
                buttonText: "Next ➔ Count Grand Total!",
                onProceed: () => {}
              });
            }, 600);
          }
        }, 800);
      }
    };

    feedSingleSweet();
  };

  const handleCheckTotal = () => {
    const val = parseInt(totalInput.trim(), 10);
    if (val === grandTotal) {
      playSuccessChime();
      setStars(s => s + 3);
      setFeedbackMsg({
        type: 'success',
        text: `Correct! ${givers.map(g => g.amount).join(' + ')} = ${grandTotal} sweets in total!`
      });
      setTimeout(() => {
        setShowCelebration(true);
      }, 700);
    } else {
      playGentleBoing();
      setFeedbackMsg({
        type: 'error',
        text: `Not quite! Count all the gulab jamuns on the plate. He ate ${grandTotal} in total.`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setStepIdx(0);
    setTotalEaten(0);
    setCurrentSpokenNumber(null);
    setTotalInput('');
    setFeedbackMsg(null);
    const nextLvl = level < 3 ? level + 1 : 1;
    setLevel(nextLvl);
    setRound(r => r + 1);
    setStoryChapter({
      isOpen: true,
      title: "Family Sweet Feast!",
      icon: <GulabJamunEmoji size={72} variant="bowl" />,
      badge: `Level ${nextLvl} • Chapter 1`,
      story: `Aarav's family is back with an even bigger batch of sweets! Help feed Aarav and count each treat!`,
      buttonText: "Next ➔ Feed Mother's Sweets!",
      onProceed: () => {}
    });
  };

  const handleReplay = () => {
    setShowCelebration(false);
    if (feedingTimerRef.current) clearTimeout(feedingTimerRef.current as any);
    setStepIdx(0);
    setTotalEaten(0);
    setCurrentSpokenNumber(null);
    setIsFeeding(false);
    setTotalInput('');
    setFeedbackMsg(null);
    setStoryChapter({
      isOpen: true,
      title: "Aarav's Sweet Birthday Surprise",
      icon: <GulabJamunEmoji size={72} variant="bowl" />,
      badge: `Level ${level} • Chapter 1`,
      story: `Ready to count all of Aarav's birthday sweets again? Mother is ready with the first plate!`,
      buttonText: "Next ➔ Feed Mother's Sweets!",
      onProceed: () => {}
    });
  };

  return (
    <QuizLayout
      title="Aarav's Gulab Jamuns"
      subtitle="Feed Aarav sweets one by one, listen to the count, and find the total!"
      category="Addition"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryChapter(prev => ({ ...prev, isOpen: true }))}
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
              {currentScenario.title}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Step {Math.min(stepIdx + 1, 4)} of 4 • Feeding sweets slowly
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  handleReplay();
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: level === lvl ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: level === lvl ? '#fff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Feeding Scene */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Aarav Avatar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '6.5rem',
                transform: chewing ? 'scale(1.18) rotate(3deg)' : 'scale(1)',
                transition: 'transform 0.2s',
                filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.3))'
              }}>
                {stepIdx === 4 ? '🤤' : chewing ? '😋' : '🧒'}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--clr-text)',
                marginTop: '6px'
              }}>
                Aarav {stepIdx === 4 ? '(So Full!)' : ''}
              </div>

              {/* Big Spoken Number Floating Bubble */}
              {currentSpokenNumber !== null && (
                <div className="anim-pop" style={{
                  position: 'absolute',
                  top: '-16px',
                  right: '-16px',
                  background: 'var(--clr-accent)',
                  color: '#ffffff',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-kids)',
                  boxShadow: '0 4px 16px rgba(232, 134, 74, 0.5)'
                }}>
                  {currentSpokenNumber}
                </div>
              )}
            </div>

            {/* Sweets Plate */}
            <div style={{
              background: 'var(--clr-surface)',
              border: '2px dashed var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '16px 24px',
              minWidth: '260px',
              maxWidth: '380px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', marginBottom: '10px' }}>
                Gulab Jamuns on Plate: <strong style={{ color: 'var(--clr-accent)', fontSize: '1.2rem' }}>{totalEaten}</strong>
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '52px'
              }}>
                {Array.from({ length: totalEaten }).map((_, i) => (
                  <span
                    key={i}
                    onClick={() => speakNumber(i + 1)}
                    className="anim-pop"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '3px'
                    }}
                    title={`Gulab Jamun ${i + 1} - click to count`}
                  >
                    <GulabJamunEmoji size={38} variant="piece" />
                  </span>
                ))}
                {totalEaten === 0 && (
                  <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-soft)', fontStyle: 'italic', alignSelf: 'center' }}>
                    Ready for delicious sweets!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Story Speech */}
          <div style={{
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 18px',
            marginBottom: '20px',
            fontSize: '1.1rem',
            color: 'var(--clr-text)'
          }}>
            {stepIdx < givers.length ? (
              <span>
                <strong>{givers[stepIdx].name}:</strong> "{givers[stepIdx].role}" (Feeding {givers[stepIdx].amount} sweet{givers[stepIdx].amount > 1 ? 's' : ''} slowly)
              </span>
            ) : (
              <span>
                🎉 <strong>Aarav:</strong> "I had a wonderful birthday! How many sweets did I eat in total?"
              </span>
            )}
          </div>

          {/* Action Button: Feed or Calculate */}
          {stepIdx < givers.length ? (
            <button
              onClick={handleFeedOneByOne}
              disabled={isFeeding}
              className="tenali-btn-primary"
              style={{
                fontSize: '1.15rem',
                padding: '14px 32px',
                borderRadius: 'var(--radius-pill)',
                margin: '0 auto',
                opacity: isFeeding ? 0.7 : 1,
                cursor: isFeeding ? 'not-allowed' : 'pointer'
              }}
            >
              <Utensils size={20} />
              <span>
                {isFeeding
                  ? `Feeding sweet ${currentSpokenNumber || ''}...`
                  : `Feed ${givers[stepIdx].amount} Sweet${givers[stepIdx].amount > 1 ? 's' : ''}!`}
              </span>
            </button>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'var(--clr-text)',
                fontFamily: 'var(--font-kids)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {givers.map((g, idx) => (
                  <React.Fragment key={idx}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'var(--clr-surface)',
                      border: '1px solid var(--clr-border)'
                    }}>
                      {g.amount}
                    </span>
                    {idx < givers.length - 1 && <span>+</span>}
                  </React.Fragment>
                ))}
                <span>=</span>
                <input
                  type="number"
                  value={totalInput}
                  onChange={e => setTotalInput(e.target.value)}
                  placeholder="?"
                  autoFocus
                  style={{
                    width: '74px',
                    height: '50px',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--clr-accent)',
                    background: 'var(--clr-input)',
                    color: 'var(--clr-text)',
                    fontWeight: 700
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCheckTotal();
                  }}
                />
              </div>

              {/* Number Buttons for easy touch entry */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                  <button
                    key={n}
                    onClick={() => { setTotalInput(String(n)); speakNumber(n); }}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: 'var(--clr-surface)',
                      border: '1px solid var(--clr-border)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--clr-text)',
                      cursor: 'pointer'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCheckTotal}
                className="tenali-btn-primary"
                style={{
                  fontSize: '1.1rem',
                  padding: '12px 32px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle size={20} />
                <span>Check My Total</span>
              </button>
            </div>
          )}

          {feedbackMsg && (
            <div style={{
              marginTop: '16px',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              background: feedbackMsg.type === 'success' ? 'var(--clr-correct-bg)' : feedbackMsg.type === 'error' ? 'var(--clr-wrong-bg)' : 'var(--clr-accent-soft)',
              color: feedbackMsg.type === 'success' ? 'var(--clr-correct)' : feedbackMsg.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)',
              border: `1px solid ${feedbackMsg.type === 'success' ? 'var(--clr-correct)' : feedbackMsg.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}`
            }}>
              {feedbackMsg.text}
            </div>
          )}
        </div>

        {/* 4 Story Comic Strip Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px'
        }}>
          {givers.map((g, idx) => {
            const isCompleted = stepIdx > idx;
            const isCurrent = stepIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isCurrent ? 'var(--clr-surface)' : 'var(--clr-card)',
                  border: isCurrent
                    ? '2px solid var(--clr-accent)'
                    : isCompleted
                    ? '1px solid var(--clr-correct)'
                    : '1px solid var(--clr-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  textAlign: 'center',
                  opacity: stepIdx < idx ? 0.6 : 1,
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
                  {idx === 0 ? '👩' : idx === 1 ? '👨' : idx === 2 ? '👧' : '👦'}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--clr-text)', fontSize: '1rem' }}>
                  {g.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-soft)', marginTop: '4px' }}>
                  {isCompleted ? (
                    <span style={{ color: 'var(--clr-correct)', fontWeight: 600 }}>
                      Fed {g.amount} sweet{g.amount > 1 ? 's' : ''} ✓
                    </span>
                  ) : isCurrent ? (
                    <span style={{ color: 'var(--clr-accent)', fontWeight: 600 }}>Feeding now...</span>
                  ) : (
                    <span>Waiting turn</span>
                  )}
                </div>
              </div>
            );
          })}
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
          title="Sweet Math Champion!"
          subtitle={`Aarav ate all ${grandTotal} sweets! You counted every single one!`}
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
