import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowRight, Sparkles, X } from 'lucide-react';
import { playPop } from '../core/soundEffects';

export interface GameStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  story: string;
  icon?: string | React.ReactNode;
  badge?: string;
  buttonText?: string;
}

/**
 * GameStoryModal
 * Presents an illustrated, responsive game story before gameplay starts.
 * Features:
 *  - "Next ➔" / "Let's Play!" button so the child can proceed whenever they want.
 *  - Mini speaker button (🔊) to read the story aloud at a gentle, child-friendly pace.
 *  - Responsive max-height with scrollable body so it NEVER exceeds the screen viewport.
 *  - Top-right close button (X) and backdrop click to dismiss.
 */
export default function GameStoryModal({
  isOpen,
  onClose,
  title,
  story,
  icon = "📖",
  badge = "Story Time",
  buttonText = "Next ➔ Let's Play!"
}: GameStoryModalProps) {
  const [isReading, setIsReading] = useState(false);

  // Stop reading if modal is closed or unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      window.speechSynthesis.cancel();
      playPop();
      const textToRead = `${title}. ${story}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.85; // Slow, child-friendly storytelling pace
      utterance.pitch = 1.1;

      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);

      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const handleNext = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
    playPop();
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleNext();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <div
        className="anim-pop"
        style={{
          background: 'var(--clr-card)',
          border: '2px solid var(--clr-accent)',
          borderRadius: '24px',
          padding: '24px 22px',
          maxWidth: '540px',
          width: '100%',
          maxHeight: 'min(90vh, 640px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), var(--shadow-glow)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Top-right close button */}
        <button
          onClick={handleNext}
          aria-label="Close story"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'var(--clr-surface)',
            border: '1px solid var(--clr-border)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--clr-text-soft)',
            zIndex: 10,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--clr-accent)';
            e.currentTarget.style.borderColor = 'var(--clr-accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--clr-text-soft)';
            e.currentTarget.style.borderColor = 'var(--clr-border)';
          }}
        >
          <X size={18} />
        </button>

        {/* Story Category Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: 'var(--clr-accent-soft)',
          color: 'var(--clr-accent)',
          padding: '4px 14px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
          alignSelf: 'center'
        }}>
          <Sparkles size={14} />
          <span>{badge}</span>
        </div>

        {/* Big Cheerful Animated Icon */}
        <div style={{
          fontSize: '3rem',
          margin: '2px 0 6px 0',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
          animation: 'bounceSlow 2.5s infinite ease-in-out'
        }}>
          {icon}
        </div>

        {/* Story Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--clr-text)',
          margin: '0 0 10px 0',
          lineHeight: 1.25
        }}>
          {title}
        </h2>

        {/* Mini Speaker Button for Listening to Story */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <button
            onClick={handleToggleSpeak}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: isReading ? 'var(--clr-accent)' : 'var(--clr-surface)',
              color: isReading ? '#ffffff' : 'var(--clr-text)',
              border: '2px solid var(--clr-accent)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isReading ? '0 0 14px var(--clr-accent)' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
            title={isReading ? "Stop listening" : "Listen to story read aloud"}
          >
            {isReading ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isReading ? "Stop Voice ⏹️" : "Listen Aloud 🔊"}</span>
          </button>
        </div>

        {/* Scrollable Story Content Box */}
        <div style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: '16px',
          padding: '14px 18px',
          fontSize: '0.96rem',
          lineHeight: 1.6,
          color: 'var(--clr-text)',
          textAlign: 'left',
          marginBottom: '16px',
          fontFamily: 'var(--font-display)',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)',
          overflowY: 'auto',
          maxHeight: '260px',
          whiteSpace: 'pre-line'
        }}>
          {story}
        </div>

        {/* Action Button: Next ➔ Let's Play! */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
          <button
            onClick={handleNext}
            className="tenali-btn-primary"
            style={{
              padding: '12px 34px',
              fontSize: '1.05rem',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(232, 134, 74, 0.45)',
              cursor: 'pointer'
            }}
          >
            <span>{buttonText}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
