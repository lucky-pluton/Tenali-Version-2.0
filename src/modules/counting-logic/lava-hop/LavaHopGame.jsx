import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import { playHop, playSuccessChime, playGentleBoing } from '../../../core/soundEffects';
import spec from './spec.json';

export default function LavaHopGame({ onBack }) {
  const [level, setLevel] = useState(1);
  const [stars, setStars] = useState(0);

  const LEVEL_CONFIGS = {
    1: {
      title: "Volcano Trail — Count the Safe Stones",
      targetCount: 6,
      blocks: [
        { id: 1, type: 'safe', label: '1' },
        { id: 2, type: 'lava', label: '🔥' },
        { id: 3, type: 'safe', label: '2' },
        { id: 4, type: 'safe', label: '3' },
        { id: 5, type: 'lava', label: '🔥' },
        { id: 6, type: 'safe', label: '4' },
        { id: 7, type: 'lava', label: '🔥' },
        { id: 8, type: 'safe', label: '5' },
        { id: 9, type: 'lava', label: '🔥' },
        { id: 10, type: 'safe', label: '6' }
      ]
    },
    2: {
      title: "Skip Hop by 2s — Even Number Stepping Stones",
      targetCount: 6,
      blocks: [
        { id: 1, type: 'lava', label: '🔥' },
        { id: 2, type: 'safe', label: '2' },
        { id: 3, type: 'lava', label: '🔥' },
        { id: 4, type: 'safe', label: '4' },
        { id: 5, type: 'lava', label: '🔥' },
        { id: 6, type: 'safe', label: '6' },
        { id: 7, type: 'lava', label: '🔥' },
        { id: 8, type: 'safe', label: '8' },
        { id: 9, type: 'lava', label: '🔥' },
        { id: 10, type: 'safe', label: '10' },
        { id: 11, type: 'lava', label: '🔥' },
        { id: 12, type: 'safe', label: '12' }
      ]
    },
    3: {
      title: "Volcanic Island Master — Skip Hop by 5s",
      targetCount: 5,
      blocks: [
        { id: 1, type: 'lava', label: '🔥' },
        { id: 2, type: 'safe', label: '5' },
        { id: 3, type: 'lava', label: '🔥' },
        { id: 4, type: 'safe', label: '10' },
        { id: 5, type: 'lava', label: '🔥' },
        { id: 6, type: 'safe', label: '15' },
        { id: 7, type: 'lava', label: '🔥' },
        { id: 8, type: 'safe', label: '20' },
        { id: 9, type: 'lava', label: '🔥' },
        { id: 10, type: 'safe', label: '25' }
      ]
    }
  };

  const currentConfig = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[1];
  const [currentBlockIdx, setCurrentBlockIdx] = useState(-1);
  const [hoppedBlocks, setHoppedBlocks] = useState([]);
  const [reachedFinish, setReachedFinish] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const totalSafeBlocks = currentConfig.blocks.filter(b => b.type === 'safe').length;

  const handleHopOnBlock = (index) => {
    const block = currentConfig.blocks[index];
    if (block.type === 'lava') {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: 'Sizzle! That is bubbling LAVA! Only hop on the safe white blocks!'
      });
      return;
    }

    playHop();
    setCurrentBlockIdx(index);

    if (!hoppedBlocks.includes(index)) {
      setHoppedBlocks(prev => [...prev, index]);
    }

    const safeIndices = currentConfig.blocks
      .map((b, i) => (b.type === 'safe' ? i : -1))
      .filter(i => i !== -1);
    const lastSafeIndex = safeIndices[safeIndices.length - 1];

    if (index === lastSafeIndex) {
      playSuccessChime();
      setReachedFinish(true);
      setFeedback({
        type: 'info',
        text: 'Awesome! You reached the FINISH line! Now, how many safe blocks did you hop on?'
      });
    } else {
      setFeedback({
        type: 'info',
        text: `Hopped on stone ${block.label}! Keep going to the Finish!`
      });
    }
  };

  const handleCheckCount = (ans) => {
    const val = parseInt(ans, 10);
    if (val === totalSafeBlocks) {
      playSuccessChime();
      setStars(s => s + 3);
      setFeedback({
        type: 'success',
        text: `You are a Counting Champion! You safely hopped across all ${totalSafeBlocks} stones!`
      });
      setTimeout(() => {
        setShowCelebration(true);
      }, 800);
    } else {
      playGentleBoing();
      setFeedback({
        type: 'error',
        text: `Count the safe stones again! You hopped on all the white stones from Start to Finish.`
      });
    }
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    setCurrentBlockIdx(-1);
    setHoppedBlocks([]);
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
    setCurrentBlockIdx(-1);
    setHoppedBlocks([]);
    setReachedFinish(false);
    setFeedback(null);
  };

  return (
    <QuizLayout
      title="Lava Hop Adventure — Stepping Stones"
      subtitle="Hop only on safe white blocks, dodge the hot lava, and count as you go!"
      category="Counting & Pathfinding"
      level={level}
      stars={stars}
      spec={spec}
      onBack={onBack}
    >
      <div style={{ width: '100%', maxWidth: '950px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '14px 20px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: 'var(--clr-text)',
              margin: 0
            }}>
              {currentConfig.title}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--clr-text-soft)' }}>
              Stones Hopped: {hoppedBlocks.length} / {totalSafeBlocks} • Dodge the Red Lava!
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
                  border: '1px solid var(--clr-border)'
                }}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(180deg, #1e1b18 0%, #291a18 100%)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius)',
          padding: '30px 20px',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          marginBottom: '20px',
          overflowX: 'auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(0,0,0,0.4)',
            padding: '8px 20px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '28px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '18px', height: '18px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #94a3b8' }} />
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>White Stone = SAFE ✓</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '18px', height: '18px', background: '#ef4444', borderRadius: '4px', border: '1px solid #b91c1c' }} />
              <span style={{ color: '#fca5a5', fontWeight: 600 }}>Red Stone = LAVA ✗</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '10px 0'
          }}>
            <div style={{
              background: '#10b981',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              position: 'relative'
            }}>
              START 🚩
              {currentBlockIdx === -1 && (
                <div style={{
                  position: 'absolute',
                  top: '-32px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '1.8rem'
                }}>
                  🧒
                </div>
              )}
            </div>

            {currentConfig.blocks.map((block, idx) => {
              const isSafe = block.type === 'safe';
              const isPlayerHere = currentBlockIdx === idx;
              const isHopped = hoppedBlocks.includes(idx);

              return (
                <div
                  key={idx}
                  onClick={() => handleHopOnBlock(idx)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: isSafe ? '#f8fafc' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: isPlayerHere
                      ? '3px solid var(--clr-accent)'
                      : isSafe
                      ? '2px solid #cbd5e1'
                      : '2px solid #b91c1c',
                    boxShadow: isPlayerHere
                      ? '0 0 16px var(--clr-accent)'
                      : isSafe
                      ? '0 4px 10px rgba(0,0,0,0.2)'
                      : '0 4px 12px rgba(239, 68, 68, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transform: isPlayerHere ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  {isPlayerHere && (
                    <div style={{
                      position: 'absolute',
                      top: '-34px',
                      fontSize: '2rem',
                      animation: 'bounceSlow 1s infinite'
                    }}>
                      🧒
                    </div>
                  )}

                  <span style={{
                    fontSize: isSafe ? '1.25rem' : '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-kids)',
                    color: isSafe ? '#1e293b' : '#ffffff'
                  }}>
                    {block.label}
                  </span>

                  {isHopped && isSafe && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      fontSize: '0.75rem',
                      color: '#10b981',
                      fontWeight: 800
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{
              background: '#f59e0b',
              color: '#1a1614',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}>
              🏁 FINISH
            </div>
          </div>

          {feedback && (
            <div className="anim-pop" style={{
              margin: '24px auto 0 auto',
              maxWidth: '560px',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              background: feedback.type === 'success' ? 'var(--clr-correct-bg)' : feedback.type === 'error' ? 'var(--clr-wrong-bg)' : 'var(--clr-accent-soft)',
              color: feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)',
              border: `1px solid ${feedback.type === 'success' ? 'var(--clr-correct)' : feedback.type === 'error' ? 'var(--clr-wrong)' : 'var(--clr-accent)'}`
            }}>
              {feedback.text}
            </div>
          )}
        </div>

        {reachedFinish && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '2px solid var(--clr-accent)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              color: 'var(--clr-text)',
              marginBottom: '10px'
            }}>
              🎉 You Escaped the Lava!
            </h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--clr-text-soft)', marginBottom: '18px' }}>
              How many white safe blocks did you hop on in total?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {[4, 5, 6, 7, 8, 10, 12].map(n => (
                <button
                  key={n}
                  onClick={() => handleCheckCount(n)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: 'var(--clr-surface)',
                    border: '2px solid var(--clr-border)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--clr-text)',
                    boxShadow: 'var(--shadow-btn)'
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCelebration && (
        <CelebrationModal
          title="Counting Champion!"
          subtitle={`You hopped across all ${totalSafeBlocks} safe stones and conquered the lava!`}
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
