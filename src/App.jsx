import React, { useState, useEffect } from 'react';
import {
  Sparkles,
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
  Code
} from 'lucide-react';
import { toggleSound, isSoundEnabled } from './core/soundEffects';
import { MODULE_REGISTRY } from './registry';
import OpenSpecModal from './components/OpenSpecModal';

export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingSpec, setInspectingSpec] = useState(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('tenali-theme') || 'dark');
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [dyslexia, setDyslexia] = useState(() => localStorage.getItem('tenali-dyslexia') === 'true');

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

  // If a game is active, render its component
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
      g.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.competencyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--clr-bg)', color: 'var(--clr-text)' }}>
      {/* Header */}
      <header style={{
        padding: '16px 28px',
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
            fontSize: '1.4rem'
          }}>
            🧒
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.45rem',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.02em',
                color: 'var(--clr-text)'
              }}>
                Tenali <span style={{ color: 'var(--clr-accent)' }}>2.0</span>
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)'
              }}>
                OpenSpec v1.0
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--clr-text-soft)' }}>
              Segregated Modules • Foundational Math & Logic Adventures
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
              color: soundOn ? 'var(--clr-accent)' : 'var(--clr-text-soft)'
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
              color: dyslexia ? 'var(--clr-accent)' : 'var(--clr-text-soft)'
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
              color: 'var(--clr-text)'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Hub Body */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--clr-accent-soft)',
            color: 'var(--clr-accent)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Sparkles size={16} />
            <span>Interactive FLN Children's Mathematics Games</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 700,
            margin: '0 0 10px 0',
            color: 'var(--clr-text)'
          }}>
            Learn Through Stories, Manipulatives & Play
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--clr-text-soft)',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            Every module is strictly segregated into its own domain folder with full <strong>OpenSpec v1.0</strong> specifications, NCERT learning objectives, and multi-level progressions.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
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
              { id: 'all', label: 'All Modules', icon: <Gamepad2 size={16} /> },
              { id: 'addition', label: 'Addition', icon: <PlusCircle size={16} /> },
              { id: 'subtraction', label: 'Subtraction & Zero', icon: <MinusCircle size={16} /> },
              { id: 'counting-logic', label: 'Counting & Logic', icon: <Dices size={16} /> }
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
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
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
              placeholder="Search by name, tag or FLN code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
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

        {/* Modules Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '22px'
        }}>
          {filteredGames.map(game => (
            <div
              key={game.id}
              style={{
                background: 'var(--clr-card)',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--radius)',
                padding: '24px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
              }}
            >
              <div>
                {/* Top Row: Icon, Tag & OpenSpec Inspector */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: 'var(--clr-surface)',
                    border: '1px solid var(--clr-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: 'var(--shadow-btn)'
                  }}>
                    {game.icon}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setInspectingSpec(game)}
                      title="Inspect OpenSpec Document"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}
                    >
                      <Code size={12} />
                      <span>OpenSpec</span>
                    </button>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--clr-accent-soft)',
                      color: 'var(--clr-accent)'
                    }}>
                      {game.competencyCode}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--clr-text)',
                  margin: '0 0 8px 0',
                  lineHeight: 1.3
                }}>
                  {game.name}
                </h3>
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--clr-text-soft)',
                  lineHeight: 1.5,
                  margin: '0 0 16px 0'
                }}>
                  {game.overview}
                </p>
              </div>

              {/* Bottom Row: Levels & Play Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--clr-border)'
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-soft)', fontWeight: 600 }}>
                  ⭐ {game.levels.length} Levels Available
                </span>

                <button
                  onClick={() => setActiveGame(game)}
                  className="tenali-btn-primary"
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  <Play size={14} fill="#ffffff" />
                  <span>Play Module</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* OpenSpec Inspector Modal */}
      {inspectingSpec && (
        <OpenSpecModal
          spec={inspectingSpec}
          onClose={() => setInspectingSpec(null)}
        />
      )}
    </div>
  );
}
