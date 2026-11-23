import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playPop,
  playSuccessChime,
  playVictoryFanfare
} from '../../../core/soundEffects';
import {
  School,
  TrendingUp,
  Search,
  Wallet,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Home,
  Play
} from 'lucide-react';
import { GameProps } from '../../../types';

import ClassroomGridGame from '../classroom-grid/ClassroomGridGame';
import RahulExamGame from '../rahul-exam/RahulExamGame';
import RajuKiranaGame from '../raju-kirana/RajuKiranaGame';
import SamosaBudgetGame from '../samosa-budget/SamosaBudgetGame';

interface ChapterMeta {
  id: 1 | 2 | 3 | 4;
  title: string;
  hindiTitle: string;
  concept: string;
  icon: string;
  badge: string;
  tagline: string;
  summary: string;
  accentColor: string;
  bgGradient: string;
}

const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    title: "Classroom Ka Fish Market",
    hindiTitle: "क्लासरूम का फिश मार्केट",
    concept: "Origin, Coordinates & Straight Lines",
    icon: "🏫",
    badge: "Story 1 • Coordinates from Scratch",
    tagline: "Why pointing a finger fails & why we need (x, y)!",
    summary: "PT Sir storms in asking 'Is this a fish market?!' Anish shoots a paper bullet at Parth, Parth throws an eraser hitting Amit. Spot their exact desks from Origin (0,0) and discover the flying eraser's collinear line!",
    accentColor: "#3b82f6",
    bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.04) 100%)"
  },
  {
    id: 2,
    title: "Rahul Ki Night-Before Strategy",
    hindiTitle: "राहुल की नाईट-बिफोर स्ट्रैटेजी",
    concept: "Linear Equations y = mx + c",
    icon: "📈",
    badge: "Story 2 • Slope, Rate & Sleep",
    tagline: "8 PM before exam, 0 prep! How linear equations topped the class.",
    summary: "Rahul has only 8 hours to finish 40 PYQ questions. Learn how his hourly study rate becomes the Slope (m), his initial prep becomes the Y-Intercept (c), and how adjusting speed lets him sleep early!",
    accentColor: "#f59e0b",
    bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.04) 100%)"
  },
  {
    id: 3,
    title: "Raju Kirana Robbery Mystery",
    hindiTitle: "राजू किराना बैंक रॉबरी मिस्ट्री",
    concept: "Intersection of Simultaneous Lines",
    icon: "🔍",
    badge: "Story 3 • The Mathematical Fingerprint",
    tagline: "A bank heist, no fingerprints, and a secret chit: 'Chips & Juice'!",
    summary: "A mysterious well-wisher points police to Raju Kirana Store. Three strange grocery equations appear on receipts. Graph all 3 lines and find their unique intersection point (4, 0) to unmask the thief!",
    accentColor: "#ec4899",
    bgGradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(219, 39, 119, 0.04) 100%)"
  },
  {
    id: 4,
    title: "Canteen Ki Samosa Party",
    hindiTitle: "कैंटीन की समोसा पार्टी",
    concept: "Cost Functions & Budget Inequalities",
    icon: "🥟",
    badge: "Story 4 • Real-Life Constraints & C(x) ≤ 200",
    tagline: "Group pooled ₹200. Samosas ₹12 each + ₹20 box. How many can we eat?",
    summary: "Turn canteen pricing into a mathematical Cost Function C(x) = 12x + 20. Solve the budget inequality 12x + 20 ≤ 200 step-by-step so the whole friend group can feast without going broke!",
    accentColor: "#10b981",
    bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)"
  }
];

export default function CoordinateGeometryFromZeroGame({ onBack }: GameProps) {
  // 0 = Hub (all 4 stories cards overview screen), 1..4 = active story game
  const [activeChapter, setActiveChapter] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [chapterStars, setChapterStars] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });
  const [masterStoryOpen, setMasterStoryOpen] = useState<boolean>(false);
  const [showGrandCelebration, setShowGrandCelebration] = useState<boolean>(false);

  // Total stars across all 4 chapters
  const totalStars = Object.values(chapterStars).reduce((sum, s) => sum + s, 0);

  const handleUpdateChapterStars = (chapterId: number, starsEarned: number) => {
    setChapterStars(prev => ({
      ...prev,
      [chapterId]: Math.max(prev[chapterId] || 0, starsEarned)
    }));
  };

  const handleSelectChapter = (ch: 0 | 1 | 2 | 3 | 4) => {
    playPop(520 + ch * 60);
    setActiveChapter(ch);
  };

  const handleAdvanceFromChapter = (completedCh: 1 | 2 | 3 | 4) => {
    handleUpdateChapterStars(completedCh, 3);
    playSuccessChime();

    if (completedCh < 4) {
      const nextCh = (completedCh + 1) as 1 | 2 | 3 | 4;
      setActiveChapter(nextCh);
    } else {
      playVictoryFanfare();
      setShowGrandCelebration(true);
    }
  };

  return (
    <QuizLayout
      title="Coordinate Geometry: From Zero"
      subtitle="Master coordinates, linear equations, graphs & intersections through 4 real-life stories!"
      category="Coordinate Geometry • शून्य से शुरू"
      level={activeChapter === 0 ? 1 : activeChapter}
      stars={totalStars}
      onBack={activeChapter === 0 ? onBack : () => setActiveChapter(0)}
      onOpenStory={() => setMasterStoryOpen(true)}
    >
      <div style={{ width: '100%', maxWidth: '940px', margin: '0 auto' }}>

        {/* ============================================================== */}
        {/* PERSISTENT TOP NAVIGATION TABS (ALWAYS VISIBLE & CLICKABLE)    */}
        {/* ============================================================== */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: '20px',
          padding: '14px 16px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>📐</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                NCERT Class 9-10 • Choose Any Story
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  playPop(500);
                  setActiveChapter(0);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  background: activeChapter === 0 ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: activeChapter === 0 ? '#ffffff' : 'var(--clr-text)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                <Home size={14} />
                <span>All 4 Stories Hub</span>
              </button>

              <button
                onClick={() => {
                  playPop(550);
                  setMasterStoryOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: 'rgba(232, 134, 74, 0.12)',
                  color: 'var(--clr-accent)',
                  border: '1px solid var(--clr-accent)',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={14} />
                <span>Overview</span>
              </button>
            </div>
          </div>

          {/* 4 Story Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '8px'
          }}>
            {CHAPTERS.map(ch => {
              const isActive = ch.id === activeChapter;
              const starsEarned = chapterStars[ch.id] || 0;
              const isDone = starsEarned > 0;

              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChapter(ch.id)}
                  style={{
                    background: isActive
                      ? `${ch.accentColor}18`
                      : 'var(--clr-surface)',
                    border: isActive
                      ? `2px solid ${ch.accentColor}`
                      : '1px solid var(--clr-border)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isActive ? `0 4px 14px ${ch.accentColor}25` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{ch.icon}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isActive ? ch.accentColor : 'var(--clr-text)' }}>
                        Story {ch.id}
                      </span>
                    </div>
                    {isDone && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-pill)',
                        background: '#10b981',
                        color: '#ffffff'
                      }}>
                        ⭐ 3/3
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--clr-text)',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {ch.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 0: ALL 4 STORIES OVERVIEW HUB (DEFAULT LANDING VIEW)      */}
        {/* ============================================================== */}
        {activeChapter === 0 && (
          <div className="anim-pop">
            {/* Friendly Hub Hero Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
              border: '2px solid #818cf8',
              borderRadius: '24px',
              padding: '28px 24px',
              marginBottom: '24px',
              color: '#ffffff',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(254, 240, 138, 0.2)',
                border: '1px solid #fef08a',
                color: '#fef08a',
                fontSize: '0.82rem',
                fontWeight: 800,
                marginBottom: '12px'
              }}>
                <Sparkles size={14} />
                <span>NO FORMULAS MEMORIZED • PURE INTUITION</span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-kids)',
                fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                margin: '0 0 8px 0',
                color: '#ffffff',
                lineHeight: 1.2
              }}>
                Coordinate Geometry: From Zero (शून्य से शिखर) 📐
              </h2>

              <p style={{
                fontSize: '1rem',
                color: '#c7d2fe',
                margin: '0 0 16px 0',
                lineHeight: 1.5,
                maxWidth: '720px'
              }}>
                Discover why coordinates were invented! Instead of jumping straight into equations, explore 4 real-life stories where everyday puzzles—from a chaotic classroom to an exam night strategy and a grocery store heist—reveal the power of points, lines, slopes, and intersections!
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => handleSelectChapter(1)}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Play size={16} fill="#ffffff" />
                  <span>Start from Story 1 ➔</span>
                </button>

                <div style={{
                  fontSize: '0.88rem',
                  color: '#a5b4fc',
                  fontWeight: 600
                }}>
                  ✨ Or tap any story card below to jump in!
                </div>
              </div>
            </div>

            {/* 4 Interactive Story Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
              marginBottom: '24px'
            }}>
              {CHAPTERS.map(ch => {
                const starsEarned = chapterStars[ch.id] || 0;
                const isDone = starsEarned > 0;

                return (
                  <div
                    key={ch.id}
                    className="anim-pop"
                    onClick={() => handleSelectChapter(ch.id)}
                    style={{
                      background: 'var(--clr-card)',
                      border: `2px solid ${ch.accentColor}`,
                      borderRadius: '20px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-card)',
                      transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 28px ${ch.accentColor}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                    }}
                  >
                    <div>
                      {/* Top Meta Line */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          background: `${ch.accentColor}18`,
                          color: ch.accentColor,
                          fontSize: '0.74rem',
                          fontWeight: 800
                        }}>
                          <span>{ch.badge}</span>
                        </div>

                        <span style={{ fontSize: '2rem' }}>{ch.icon}</span>
                      </div>

                      {/* Story Titles */}
                      <h3 style={{
                        fontFamily: 'var(--font-kids)',
                        fontSize: '1.25rem',
                        margin: '0 0 2px 0',
                        color: 'var(--clr-text)',
                        lineHeight: 1.25
                      }}>
                        {ch.title}
                      </h3>
                      <div style={{
                        fontSize: '0.85rem',
                        color: ch.accentColor,
                        fontWeight: 700,
                        marginBottom: '10px'
                      }}>
                        {ch.hindiTitle}
                      </div>

                      {/* Tagline / Hook */}
                      <p style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--clr-text)',
                        margin: '0 0 8px 0',
                        lineHeight: 1.4
                      }}>
                        {ch.tagline}
                      </p>

                      {/* Summary Text */}
                      <p style={{
                        fontSize: '0.84rem',
                        color: 'var(--clr-text-soft)',
                        margin: '0 0 16px 0',
                        lineHeight: 1.45
                      }}>
                        {ch.summary}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div style={{
                      paddingTop: '12px',
                      borderTop: '1px solid var(--clr-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isDone ? '#10b981' : 'var(--clr-text-soft)' }}>
                        {isDone ? '✅ Completed (3/3 ⭐)' : '⏳ Ready to Play'}
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: ch.accentColor,
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        boxShadow: `0 3px 10px ${ch.accentColor}40`
                      }}>
                        <span>Play Story {ch.id}</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ACTIVE STORY RENDER (WHEN CHAPTER 1, 2, 3, OR 4 IS SELECTED)  */}
        {/* ============================================================== */}
        {activeChapter > 0 && (
          <div>
            {activeChapter === 1 && (
              <ClassroomGridGame
                isEmbedded={true}
                onBack={() => setActiveChapter(0)}
                onNextChapter={() => handleAdvanceFromChapter(1)}
                onChapterStars={(stars) => handleUpdateChapterStars(1, stars)}
              />
            )}

            {activeChapter === 2 && (
              <RahulExamGame
                isEmbedded={true}
                onBack={() => setActiveChapter(0)}
                onNextChapter={() => handleAdvanceFromChapter(2)}
                onChapterStars={(stars) => handleUpdateChapterStars(2, stars)}
              />
            )}

            {activeChapter === 3 && (
              <RajuKiranaGame
                isEmbedded={true}
                onBack={() => setActiveChapter(0)}
                onNextChapter={() => handleAdvanceFromChapter(3)}
                onChapterStars={(stars) => handleUpdateChapterStars(3, stars)}
              />
            )}

            {activeChapter === 4 && (
              <SamosaBudgetGame
                isEmbedded={true}
                onBack={() => setActiveChapter(0)}
                onNextChapter={() => handleAdvanceFromChapter(4)}
                onChapterStars={(stars) => handleUpdateChapterStars(4, stars)}
              />
            )}
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MASTER STORY OVERVIEW MODAL                                    */}
      {/* ============================================================== */}
      <GameStoryModal
        isOpen={masterStoryOpen}
        onClose={() => setMasterStoryOpen(false)}
        title="Coordinate Geometry: From Zero!"
        badge="Complete Learning Journey • शून्य से शिखर"
        icon="📐"
        story={`Coordinate geometry connects numbers, lines, and real-life mystery solving!

Explore 4 exciting real-life stories:
• 🏫 Story 1 (Classroom Grid): Why pointing a finger fails, how PT Sir at Origin (0,0) identifies Parth (2,7) & Anish (3,9), and finding Amit's seat on the straight line!
• 📈 Story 2 (Rahul's Exam): 8 PM exam night strategy! Model study speed with y = mx + c to finish 40 questions and get peaceful sleep!
• 🔍 Story 3 (Raju Kirana Robbery): Graph 3 daily receipts and find their unique intersection point (4, 0) to unmask the thief!
• 🥟 Story 4 (Samosa Party): Model canteen costs with C(x) = 12x + 20 and solve the budget inequality (≤ ₹200) without going broke!`}
        buttonText="Let's Explore ➔"
      />

      {/* ============================================================== */}
      {/* GRAND FINALE CELEBRATION MODAL                                 */}
      {/* ============================================================== */}
      {showGrandCelebration && (
        <CelebrationModal
          title="Coordinate Geometry Master! 🏆🎓📐"
          subtitle="Incredible achievement! You conquered all 4 real-life stories: Origin (0,0), straight lines, linear equations y = mx + c, simultaneous intersections, and budget inequalities!"
          stars={12}
          onNextLevel={() => {
            setShowGrandCelebration(false);
            setActiveChapter(0);
          }}
          onReplay={() => {
            setShowGrandCelebration(false);
            setActiveChapter(1);
          }}
          onHome={onBack}
          hasNextLevel={false}
        />
      )}
    </QuizLayout>
  );
}
