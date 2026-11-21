import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  MinusCircle,
  Dices,
  Search,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  BookOpen,
  Gamepad2,
  Play,
  Compass
} from 'lucide-react';
import { toggleSound, isSoundEnabled } from './core/soundEffects';
import { MODULE_REGISTRY } from './registry';
import { GameCard, DomainCategory } from './types';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameCard | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<DomainCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // If a game is selected, render it
  if (activeGame) {
    const GameComp = activeGame.component;
    return <GameComp onBack={() => setActiveGame(null)} />;
  }

  // Filter games based on search and category
  const filteredGames = MODULE_REGISTRY.filter(g => {
    const matchesCategory =
      categoryFilter === 'all' || g.domainId === categoryFilter;
    const matchesQuery =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', color: 'var(--clr-text)' }}>
      {/* Header */}
      <header style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--clr-border)',
        background: 'var(--clr-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--clr-accent-soft)',
            border: '2px solid var(--clr-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🧒
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em',
              color: 'var(--clr-text)'
            }}>
              Tenali <span style={{ color: 'var(--clr-accent)' }}>Kids</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
              Fun Math Adventures
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            style={{
              padding: '9px',
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

          <button
            onClick={handleToggleDyslexia}
            title={dyslexia ? 'Dyslexia Font Active' : 'Switch to Dyslexia Font'}
            style={{
              padding: '9px',
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

          <button
            onClick={toggleTheme}
            title="Toggle Light / Dark Mode"
            style={{
              padding: '9px',
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

      {/* Main Hub Body */}
      <main style={{ maxWidth: '1050px', margin: '0 auto', padding: '28px 20px' }}>
        {/* Simple & Inviting Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)',
            fontWeight: 700,
            margin: '0 0 6px 0',
            color: 'var(--clr-text)'
          }}>
            Choose a Game & Play! 🌟
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--clr-text-soft)',
            margin: 0
          }}>
            Tap any game below to start playing!
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px'
        }}>
          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'var(--clr-card)',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--clr-border)',
            overflowX: 'auto',
            maxWidth: '100%'
          }}>
            {[
              { id: 'all' as DomainCategory, label: 'All / सब खेल', icon: <Gamepad2 size={16} /> },
              { id: 'counting-logic' as DomainCategory, label: 'Counting / गिनती', icon: <Dices size={16} /> },
              { id: 'addition' as DomainCategory, label: 'Addition / जोड़', icon: <PlusCircle size={16} /> },
              { id: 'subtraction' as DomainCategory, label: 'Subtraction / घटाव', icon: <MinusCircle size={16} /> },
              { id: 'coordinate-geometry' as DomainCategory, label: 'Coordinate Geometry / निर्देशांक', icon: <Compass size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  background: categoryFilter === tab.id ? 'var(--clr-accent)' : 'transparent',
                  color: categoryFilter === tab.id ? '#ffffff' : 'var(--clr-text-soft)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--clr-text-soft)'
              }}
            />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--clr-surface)',
                border: '1px solid var(--clr-border)',
                color: 'var(--clr-text)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Clean, Child-Friendly Games Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {filteredGames.map(game => (
            <div
              key={game.id}
              onClick={() => setActiveGame(game)}
              style={{
                background: 'var(--clr-card)',
                border: '2px solid var(--clr-border)',
                borderRadius: '20px',
                padding: '24px 18px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.borderColor = 'var(--clr-accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.borderColor = 'var(--clr-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              {/* Big Cheerful Icon */}
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '24px',
                background: 'var(--clr-surface)',
                border: '2px solid var(--clr-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.8rem',
                marginBottom: '14px',
                boxShadow: 'var(--shadow-btn)'
              }}>
                {game.icon}
              </div>

              {/* Basic Game Name Only (No long text walls!) */}
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--clr-text)',
                margin: '0 0 10px 0',
                lineHeight: 1.3
              }}>
                {game.name}
              </h3>

              {/* Levels Badge */}
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--clr-text-soft)',
                marginBottom: '16px'
              }}>
                ⭐ {game.levelsCount} Levels
              </div>

              {/* Big Friendly Play Button */}
              <button
                className="tenali-btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-pill)',
                  marginTop: 'auto'
                }}
              >
                <Play size={16} fill="#ffffff" />
                <span>Play</span>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
