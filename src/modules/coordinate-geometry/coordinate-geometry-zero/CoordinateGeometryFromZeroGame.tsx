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
  Compass
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
  summary: string;
  accentColor: string;
}

const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    title: "Classroom Ka Fish Market",
    hindiTitle: "क्लासरूम का फिश मार्केट",
    concept: "Origin, Coordinates & Straight Lines",
    icon: "🏫",
    badge: "Chapter 1 • Points & Collinearity",
    summary: "Spot Parth (2,7) & Anish (3,9) from PT teacher's Origin (0,0), and find Amit's collinear seat on line y = 2x + 3!",
    accentColor: "#3b82f6"
  },
  {
    id: 2,
    title: "Rahul Ki Night-Before Strategy",
    hindiTitle: "राहुल की नाईट-बिफोर स्ट्रैटेजी",
    concept: "Linear Equations y = mx + c",
    icon: "📈",
    badge: "Chapter 2 • Slope & Study Rate",
    summary: "Formulate y = mx + c! Adjust study speed (slope m) to conquer 40 PYQ questions and maximize sleep hours!",
    accentColor: "#f59e0b"
  },
  {
    id: 3,
    title: "Raju Kirana Robbery Mystery",
    hindiTitle: "राजू किराना बैंक रॉबरी मिस्ट्री",
    concept: "Intersection of Simultaneous Lines",
    icon: "🔍",
    badge: "Chapter 3 • Intersecting Equations",
    summary: "Graph 3 daily purchase lines (x+y=4, 2x+y=8, 3x+y=12) and find the intersection point (4, 0) to catch the thief!",
    accentColor: "#ec4899"
  },
  {
    id: 4,
    title: "Canteen Ki Samosa Party",
    hindiTitle: "कैंटीन की समोसा पार्टी",
    concept: "Cost Functions & Budget Inequalities",
    icon: "🥟",
    badge: "Chapter 4 • Constraints & C(x) ≤ 200",
    summary: "Model group costs with C(x) = 12x + 20 and solve the budget inequality 12x + 20 ≤ 200 to feast without going broke!",
    accentColor: "#10b981"
  }
];

export default function CoordinateGeometryFromZeroGame({ onBack }: GameProps) {
  const [activeChapter, setActiveChapter] = useState<1 | 2 | 3 | 4>(1);
  const [chapterStars, setChapterStars] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });
  // Default to false so module opens immediately to Chapter 1 without a blocking popup
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

  const handleSelectChapter = (ch: 1 | 2 | 3 | 4) => {
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

  const currentMeta = CHAPTERS.find(c => c.id === activeChapter) || CHAPTERS[0];

  return (
    <QuizLayout
      title="Coordinate Geometry: From Zero"
      subtitle="Master coordinates, linear equations, graphs & intersections through 4 real-life stories!"
      category="Coordinate Geometry • शून्य से शुरू"
      level={activeChapter}
      stars={totalStars}
      onBack={onBack}
      onOpenStory={() => setMasterStoryOpen(true)}
    >
      <div style={{ width: '100%', maxWidth: '940px', margin: '0 auto' }}>

        {/* ============================================================== */}
        {/* CHAPTER NAVIGATION BAR (4 PROGRESSIVE STORIES)                 */}
        {/* ============================================================== */}
        <div style={{
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: '20px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Header with Title and Story Overview Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--clr-accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                NCERT Class 9-10 • Real-Life Stories
              </span>
              <h2 style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.25rem',
                margin: '2px 0 0 0',
                color: 'var(--clr-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📐</span>
                <span>Coordinate Geometry From Zero (शून्य से शिखर)</span>
              </h2>
            </div>

            <button
              onClick={() => {
                playPop(550);
                setMasterStoryOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
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
              <span>Story Overview (कहानियों का सार)</span>
            </button>
          </div>

          {/* 4 Story Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
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
                    borderRadius: '14px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isActive ? `0 4px 16px ${ch.accentColor}30` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{ch.icon}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: isDone ? '#10b981' : isActive ? ch.accentColor : 'var(--clr-border)',
                      color: '#ffffff'
                    }}>
                      {isDone ? '⭐ 3/3' : `Story ${ch.id}`}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: isActive ? ch.accentColor : 'var(--clr-text)',
                    lineHeight: 1.25,
                    marginBottom: '3px'
                  }}>
                    {ch.title}
                  </div>

                  <div style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: 'var(--clr-text-soft)'
                  }}>
                    {ch.concept}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* ACTIVE STORY RENDER                                            */}
        {/* ============================================================== */}
        <div>
          {activeChapter === 1 && (
            <ClassroomGridGame
              isEmbedded={true}
              onBack={onBack}
              onNextChapter={() => handleAdvanceFromChapter(1)}
              onChapterStars={(stars) => handleUpdateChapterStars(1, stars)}
            />
          )}

          {activeChapter === 2 && (
            <RahulExamGame
              isEmbedded={true}
              onBack={onBack}
              onNextChapter={() => handleAdvanceFromChapter(2)}
              onChapterStars={(stars) => handleUpdateChapterStars(2, stars)}
            />
          )}

          {activeChapter === 3 && (
            <RajuKiranaGame
              isEmbedded={true}
              onBack={onBack}
              onNextChapter={() => handleAdvanceFromChapter(3)}
              onChapterStars={(stars) => handleUpdateChapterStars(3, stars)}
            />
          )}

          {activeChapter === 4 && (
            <SamosaBudgetGame
              isEmbedded={true}
              onBack={onBack}
              onNextChapter={() => handleAdvanceFromChapter(4)}
              onChapterStars={(stars) => handleUpdateChapterStars(4, stars)}
            />
          )}
        </div>

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
• 🏫 Story 1 (Classroom Grid): Plot Parth (2,7) & Anish (3,9) from Origin (0,0) and find Amit's seat on the straight line!
• 📈 Story 2 (Rahul's Exam): Model study speed with y = mx + c to finish 40 questions and get peaceful sleep!
• 🔍 Story 3 (Raju Kirana Robbery): Graph 3 daily receipts and find their unique intersection point (4, 0) to catch the thief!
• 🥟 Story 4 (Samosa Party): Model canteen costs with C(x) = 12x + 20 and solve the budget inequality (≤ ₹200)!`}
        buttonText="Let's Play ➔"
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
            setActiveChapter(1);
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
