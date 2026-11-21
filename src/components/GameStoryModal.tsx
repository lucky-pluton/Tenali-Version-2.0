import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowRight, Sparkles } from 'lucide-react';
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
 * Presents an illustrated, optional game story before gameplay starts.
 * Features:
 *  - "Next ➔" / "Let's Play!" button so the child can proceed whenever they want.
 *  - Mini speaker button (🔊) to read the story aloud at a gentle, child-friendly pace.
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
    <div style={{
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
      padding: '20px'
    }}>
      <div
        className="anim-pop"
        style={{
          background: 'var(--clr-card)',
          border: '2px solid var(--clr-accent)',
          borderRadius: '24px',
          padding: '30px 28px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), var(--shadow-glow)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Story Category Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--clr-accent-soft)',
          color: 'var(--clr-accent)',
          padding: '4px 14px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '12px'
        }}>
          <Sparkles size={14} />
          <span>{badge}</span>
        </div>

        {/* Big Cheerful Animated Icon */}
        <div style={{
          fontSize: '4.5rem',
          margin: '4px 0 10px 0',
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))',
          animation: 'bounceSlow 2.5s infinite ease-in-out'
        }}>
          {icon}
        </div>

        {/* Story Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          fontWeight: 800,
          color: 'var(--clr-text)',
          margin: '0 0 14px 0',
          lineHeight: 1.25
        }}>
          {title}
        </h2>

        {/* Mini Speaker Button for Listening to Story */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <button
            onClick={handleToggleSpeak}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              background: isReading ? 'var(--clr-accent)' : 'var(--clr-surface)',
              color: isReading ? '#ffffff' : 'var(--clr-text)',
              border: '2px solid var(--clr-accent)',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isReading ? '0 0 14px var(--clr-accent)' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
            title={isReading ? "Stop listening" : "Listen to story read aloud"}
          >
            {isReading ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isReading ? "Stop Voice ⏹️" : "Listen Aloud 🔊"}</span>
          </button>
        </div>

        {/* Story Paragraph */}
        <div style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: '16px',
          padding: '18px 22px',
          fontSize: '1.08rem',
          lineHeight: 1.65,
          color: 'var(--clr-text)',
          textAlign: 'left',
          marginBottom: '24px',
          fontFamily: 'var(--font-display)',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)'
        }}>
          {story}
        </div>

        {/* Action Button: Next ➔ Let's Play! */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleNext}
            className="tenali-btn-primary"
            style={{
              padding: '14px 38px',
              fontSize: '1.15rem',
              borderRadius: 'var(--radius-pill)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px rgba(232, 134, 74, 0.45)',
              cursor: 'pointer'
            }}
          >
            <span>{buttonText}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
