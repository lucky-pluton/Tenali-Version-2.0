import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';
import { toggleSound, isSoundEnabled } from '../core/soundEffects';
import { QuizLayoutProps } from '../types/common';

export default function QuizLayout({
  title,
  subtitle,
  category,
  onBack,
  onOpenStory,
  stars = 0,
  level = 1,
  children
}: QuizLayoutProps) {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('tenali-theme') || 'dark');
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [dyslexia, setDyslexia] = useState<boolean>(() => localStorage.getItem('tenali-dyslexia') === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tenali-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-a11y-dyslexia', dyslexia ? 'true' : 'false');
    localStorage.setItem('tenali-dyslexia', dyslexia ? 'true' : 'false');
  }, [dyslexia]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleSound = () => {
    const updated = toggleSound();
    setSoundOn(updated);
  };

  const handleToggleDyslexia = () => {
    setDyslexia(prev => !prev);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--clr-bg)' }}>
      {/* Top Navigation Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--clr-border)',
        background: 'var(--clr-card)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to Games"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--clr-text)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                {title}
              </h1>
              {category && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--clr-accent-soft)',
                  color: 'var(--clr-accent)'
                }}>
                  {category}
                </span>
              )}
            </div>
            {subtitle && (
              <p style={{
                fontSize: '0.82rem',
                color: 'var(--clr-text-soft)',
                margin: '2px 0 0 0'
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Story Button */}
          {onOpenStory && (
            <button
              onClick={onOpenStory}
              title="Story Time"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-accent)',
                color: 'var(--clr-accent)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={15} />
              <span>Story</span>
            </button>
          )}

          {/* Level Pill */}
          {level > 0 && (
            <div className="tenali-pill" style={{ color: 'var(--clr-accent)', borderColor: 'var(--clr-border-highlight)' }}>
              <span>Level {level}</span>
            </div>
          )}

          {/* Stars Pill */}
          <div className="tenali-pill" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
            <Sparkles size={16} />
            <span>{stars} ⭐</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            style={{
              padding: '8px',
              borderRadius: '50%',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: soundOn ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
              cursor: 'pointer'
            }}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Dyslexia Font Toggle */}
          <button
            onClick={handleToggleDyslexia}
            title={dyslexia ? 'Dyslexia Font Active' : 'Switch to Dyslexia Font'}
            style={{
              padding: '8px',
              borderRadius: '50%',
              background: dyslexia ? 'var(--clr-accent-soft)' : 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: dyslexia ? 'var(--clr-accent)' : 'var(--clr-text-soft)',
              cursor: 'pointer'
            }}
          >
            <BookOpen size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              padding: '8px',
              borderRadius: '50%',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--clr-text)',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Game Container */}
      <main style={{
        flex: 1,
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {children}
      </main>
    </div>
  );
}
