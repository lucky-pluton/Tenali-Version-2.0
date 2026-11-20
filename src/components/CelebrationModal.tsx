import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowRight, Star } from 'lucide-react';
import { playVictoryFanfare } from '../core/soundEffects';

export interface CelebrationModalProps {
  title?: string;
  subtitle?: string;
  stars?: number;
  score?: number;
  onNextLevel?: () => void;
  onReplay?: () => void;
  onHome?: () => void;
  hasNextLevel?: boolean;
}

export default function CelebrationModal({
  title = "Awesome Job!",
  subtitle = "You completed the challenge!",
  stars = 3,
  score = 100,
  onNextLevel,
  onReplay,
  onHome,
  hasNextLevel = true
}: CelebrationModalProps) {
  useEffect(() => {
    playVictoryFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore in tests
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="anim-pop" style={{
        background: 'var(--clr-card)',
        border: '2px solid var(--clr-accent)',
        borderRadius: 'var(--radius)',
        maxWidth: '440px',
        width: '100%',
        padding: '32px 24px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)',
        position: 'relative'
      }}>
        {/* Trophy Icon Badge */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--clr-accent-soft)',
          border: '2px solid var(--clr-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '-68px auto 16px auto',
          color: 'var(--clr-accent)',
          boxShadow: '0 4px 16px rgba(232, 134, 74, 0.3)'
        }}>
          <Trophy size={36} />
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          color: 'var(--clr-text)',
          margin: '0 0 6px 0'
        }}>
          {title}
        </h2>

        <p style={{
          fontSize: '1rem',
          color: 'var(--clr-text-soft)',
          marginBottom: '20px'
        }}>
          {subtitle}
        </p>

        {/* Star Rating */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}>
          {[1, 2, 3].map(s => (
            <div
              key={s}
              style={{
                color: s <= stars ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                transform: s <= stars ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.3s'
              }}
            >
              <Star size={36} fill={s <= stars ? '#f59e0b' : 'none'} />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {hasNextLevel && onNextLevel && (
            <button
              onClick={onNextLevel}
              className="tenali-btn-primary"
              style={{ width: '100%', fontSize: '1rem', padding: '12px' }}
            >
              <span>Next Level</span>
              <ArrowRight size={18} />
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {onReplay && (
              <button
                onClick={onReplay}
                className="tenali-btn-secondary"
                style={{ flex: 1, fontSize: '0.95rem' }}
              >
                <RotateCcw size={16} />
                <span>Play Again</span>
              </button>
            )}

            {onHome && (
              <button
                onClick={onHome}
                className="tenali-btn-secondary"
                style={{ flex: 1, fontSize: '0.95rem' }}
              >
                <span>All Games</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
