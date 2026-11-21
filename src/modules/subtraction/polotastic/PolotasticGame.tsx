import React, { useState } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import { playPop, playSuccessChime, playGentleBoing, playVictoryFanfare } from '../../../core/soundEffects';
import { Sparkles, ArrowRight, RotateCcw, Package, Box, Disc } from 'lucide-react';
import { GameProps } from '../../../types';
import spec from './spec.json';

// Child-friendly slow speech synthesis helper
function speak(text: string | number, rate: number = 0.82, pitch: number = 1.15): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

interface PoloLevel {
  level: number;
  minuend: number;
  subtrahend: number;
  diff: number;
  initialPackets: number; // Hundreds
  initialRolls: number;   // Tens
  initialSingles: number; // Ones
  subPackets: number;
  subRolls: number;
  subSingles: number;
  title: string;
}

const POLO_LEVELS: PoloLevel[] = [
  { level: 1, minuend: 35, subtrahend: 12, diff: 23, initialPackets: 0, initialRolls: 3, initialSingles: 5, subPackets: 0, subRolls: 1, subSingles: 2, title: "Level 1: Direct Takeaway (35 − 12)" },
  { level: 2, minuend: 42, subtrahend: 17, diff: 25, initialPackets: 0, initialRolls: 4, initialSingles: 2, subPackets: 0, subRolls: 1, subSingles: 7, title: "Level 2: Unrolling a Roll (42 − 17)" },
  { level: 3, minuend: 54, subtrahend: 28, diff: 26, initialPackets: 0, initialRolls: 5, initialSingles: 4, subPackets: 0, subRolls: 2, subSingles: 8, title: "Level 3: Roll Breaking (54 − 28)" },
  { level: 4, minuend: 125, subtrahend: 47, diff: 78, initialPackets: 1, initialRolls: 2, initialSingles: 5, subPackets: 0, subRolls: 4, subSingles: 7, title: "Level 4: Packet Unpacking (125 − 47)" },
  { level: 5, minuend: 204, subtrahend: 58, diff: 146, initialPackets: 2, initialRolls: 0, initialSingles: 4, subPackets: 0, subRolls: 5, subSingles: 8, title: "Level 5: Zero-Roll Cascade (204 − 58)" }
];

export default function PolotasticGame({ onBack }: GameProps) {
  const [level, setLevel] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);
  const [storyOpen, setStoryOpen] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const lvl = POLO_LEVELS[level - 1] || POLO_LEVELS[0];
  const { minuend, subtrahend, diff, initialPackets, initialRolls, initialSingles, subPackets, subRolls, subSingles } = lvl;

  // Active bundle counts on shop counter
  const [packets, setPackets] = useState<number>(initialPackets);
  const [rolls, setRolls] = useState<number>(initialRolls);
  const [singles, setSingles] = useState<number>(initialSingles);

  // Taken away so far
  const [takenSingles, setTakenSingles] = useState<number>(0);
  const [takenRolls, setTakenRolls] = useState<number>(0);
  const [takenPackets, setTakenPackets] = useState<number>(0);

  // Reset state for new level
  const resetForLevel = (newLevel: PoloLevel) => {
    setPackets(newLevel.initialPackets);
    setRolls(newLevel.initialRolls);
    setSingles(newLevel.initialSingles);
    setTakenSingles(0);
    setTakenRolls(0);
    setTakenPackets(0);
  };

  const handleNextLevel = () => {
    setShowCelebration(false);
    const nextLvl = level < 5 ? level + 1 : 1;
    setLevel(nextLvl);
    resetForLevel(POLO_LEVELS[nextLvl - 1]);
  };

  const handleReplay = () => {
    setShowCelebration(false);
    resetForLevel(lvl);
  };

  // Check if singles need unrolling
  const needsUnroll = singles < (subSingles - takenSingles);
  const needsUnpack = rolls === 0 && packets > 0 && needsUnroll;

  // Action: Unpack 1 packet into 10 rolls
  const handleUnpackPacket = () => {
    if (packets <= 0) return;
    playPop(520);
    setPackets(p => p - 1);
    setRolls(r => r + 10);
    speak("Unpacked 1 Packet into 10 Rolls of Polos!", 0.85);
  };

  // Action: Unroll 1 roll into 10 loose singles
  const handleUnrollRoll = () => {
    if (rolls <= 0) return;
    playPop(660);
    setRolls(r => r - 1);
    setSingles(s => s + 10);
    speak("Unrolled 1 Roll into 10 loose Polo sweets!", 0.85);
  };

  // Action: Take away 1 single
  const handleTakeawaySingle = () => {
    if (takenSingles >= subSingles) return;
    if (singles <= 0) {
      playGentleBoing();
      speak("No more loose singles! You must unroll a roll first!", 0.85);
      return;
    }
    playPop(780);
    setSingles(s => s - 1);
    const nextTaken = takenSingles + 1;
    setTakenSingles(nextTaken);
    speak(String(nextTaken), 0.85);

    checkIfFinished(nextTaken, takenRolls, takenPackets);
  };

  // Action: Take away 1 roll
  const handleTakeawayRoll = () => {
    if (takenRolls >= subRolls) return;
    if (rolls <= 0) {
      playGentleBoing();
      speak("No rolls left! Unpack a packet first!", 0.85);
      return;
    }
    playPop(520);
    setRolls(r => r - 1);
    const nextTaken = takenRolls + 1;
    setTakenRolls(nextTaken);
    speak(`${nextTaken} rolls`, 0.85);

    checkIfFinished(takenSingles, nextTaken, takenPackets);
  };

  // Action: Take away 1 packet
  const handleTakeawayPacket = () => {
    if (takenPackets >= subPackets) return;
    if (packets <= 0) return;
    playPop(440);
    setPackets(p => p - 1);
    const nextTaken = takenPackets + 1;
    setTakenPackets(nextTaken);

    checkIfFinished(takenSingles, takenRolls, nextTaken);
  };

  const checkIfFinished = (ts: number, tr: number, tp: number) => {
    if (ts >= subSingles && tr >= subRolls && tp >= subPackets) {
      setTimeout(() => {
        playVictoryFanfare();
        playSuccessChime();
        setStars(s => s + 3);
        setShowCelebration(true);
      }, 700);
    }
  };

  const isCompleted = takenSingles >= subSingles && takenRolls >= subRolls && takenPackets >= subPackets;

  return (
    <QuizLayout
      title="Polotastic"
      subtitle={`Solve ${minuend} − ${subtrahend} by unrolling Polo bundles and taking away sweets!`}
      category="Place Value Bundling & Subtraction"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryOpen(true)}
    >
      <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>

        {/* Level & Target Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--clr-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '12px 20px',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-accent)', textTransform: 'uppercase' }}>
              Place Value Units • {lvl.title}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--clr-text)', fontFamily: 'var(--font-kids)' }}>
              Order to fulfill: Take away {subtrahend} sweets from {minuend}
            </div>
          </div>

          <div style={{
            background: 'var(--clr-accent-soft)',
            border: '2px solid var(--clr-accent)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--clr-accent)'
          }}>
            Level {level} / 5
          </div>
        </div>

        {/* SHOPKEEPER'S MANIPULATIVE COUNTER */}
        <div style={{
          background: 'var(--clr-card)',
          border: '2px solid var(--clr-border)',
          borderRadius: 'var(--radius)',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--clr-text)', margin: 0, fontWeight: 800 }}>
              🏪 Pip's Sweet Counter (Place Value Bundles)
            </h4>

            {/* Total sweets on counter */}
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              color: 'var(--clr-accent)',
              background: 'var(--clr-accent-soft)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)'
            }}>
              Current Total: {packets * 100 + rolls * 10 + singles} sweets
            </div>
          </div>

          {/* Place-Value Bundles Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '18px'
          }}>
            {/* PACKETS COLUMN (Hundreds = 100 sweets) */}
            <div style={{
              background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #22c55e',
              borderRadius: '16px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem' }}>📦</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#15803d' }}>
                Packets (Hundreds)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', marginBottom: '8px' }}>
                1 Packet = 10 Rolls (100)
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '6px',
                border: '1px solid #86efac',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#14532d',
                marginBottom: '10px'
              }}>
                {packets} Packet{packets !== 1 ? 's' : ''} ({packets * 100})
              </div>

              {/* Unpack Button */}
              {packets > 0 && needsUnpack && (
                <button
                  onClick={handleUnpackPacket}
                  className="anim-pop"
                  style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  ⚡ Unpack 1 Packet ➔ 10 Rolls
                </button>
              )}
            </div>

            {/* ROLLS COLUMN (Tens = 10 sweets) */}
            <div style={{
              background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
              border: '2px solid #3b82f6',
              borderRadius: '16px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem' }}>🧻</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1d4ed8' }}>
                Rolls (Tens)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', marginBottom: '8px' }}>
                1 Roll = 10 Singles (10)
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '6px',
                border: '1px solid #93c5fd',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#1e3a8a',
                marginBottom: '10px'
              }}>
                {rolls} Roll{rolls !== 1 ? 's' : ''} ({rolls * 10})
              </div>

              {/* Unroll Button */}
              {rolls > 0 && needsUnroll && (
                <button
                  onClick={handleUnrollRoll}
                  className="anim-pop"
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  ⚡ Unroll 1 Roll ➔ 10 Singles
                </button>
              )}
            </div>

            {/* SINGLES COLUMN (Ones = 1 sweet) */}
            <div style={{
              background: 'linear-gradient(180deg, #fefce8 0%, #fef08a 100%)',
              border: '2px solid #eab308',
              borderRadius: '16px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem' }}>🍬</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#a16207' }}>
                Singles (Ones)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#ca8a04', marginBottom: '8px' }}>
                Individual loose Polo sweets
              </div>

              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '6px',
                border: '1px solid #fde047',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#713f12',
                marginBottom: '10px'
              }}>
                {singles} Single{singles !== 1 ? 's' : ''} ({singles})
              </div>

              {/* Status Notice */}
              {needsUnroll && (
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#b45309',
                  background: 'rgba(234, 179, 8, 0.25)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  ⚠️ Need {subSingles - takenSingles} singles! Unroll a roll above!
                </div>
              )}
            </div>
          </div>

          {/* FULFILL ORDER / TAKEAWAY INTERACTION AREA */}
          <div style={{
            background: 'var(--clr-surface)',
            border: '2px dashed var(--clr-border)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h5 style={{ fontSize: '0.95rem', color: 'var(--clr-text)', margin: '0 0 10px 0', fontWeight: 800 }}>
              🛒 Fulfill the Customer's Order: Take Away {subtrahend} Sweets ({subPackets} Packets, {subRolls} Rolls, {subSingles} Singles)
            </h5>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* Takeaway Singles Button */}
              <button
                onClick={handleTakeawaySingle}
                disabled={takenSingles >= subSingles || singles <= 0}
                className="tenali-btn-primary"
                style={{
                  background: takenSingles >= subSingles ? 'var(--clr-correct)' : '#eab308',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 18px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: takenSingles >= subSingles ? 'default' : 'pointer',
                  opacity: (takenSingles >= subSingles || singles <= 0) ? 0.6 : 1
                }}
              >
                {takenSingles >= subSingles ? `✓ Taken ${takenSingles}/${subSingles} Singles` : `− Take 1 Single (Need ${subSingles - takenSingles} more)`}
              </button>

              {/* Takeaway Rolls Button */}
              {subRolls > 0 && (
                <button
                  onClick={handleTakeawayRoll}
                  disabled={takenRolls >= subRolls || rolls <= 0}
                  className="tenali-btn-primary"
                  style={{
                    background: takenRolls >= subRolls ? 'var(--clr-correct)' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: takenRolls >= subRolls ? 'default' : 'pointer',
                    opacity: (takenRolls >= subRolls || rolls <= 0) ? 0.6 : 1
                  }}
                >
                  {takenRolls >= subRolls ? `✓ Taken ${takenRolls}/${subRolls} Rolls` : `− Take 1 Roll (Need ${subRolls - takenRolls} more)`}
                </button>
              )}

              {/* Takeaway Packets Button */}
              {subPackets > 0 && (
                <button
                  onClick={handleTakeawayPacket}
                  disabled={takenPackets >= subPackets || packets <= 0}
                  className="tenali-btn-primary"
                  style={{
                    background: takenPackets >= subPackets ? 'var(--clr-correct)' : '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: takenPackets >= subPackets ? 'default' : 'pointer',
                    opacity: (takenPackets >= subPackets || packets <= 0) ? 0.6 : 1
                  }}
                >
                  {takenPackets >= subPackets ? `✓ Taken ${takenPackets}/${subPackets} Packets` : `− Take 1 Packet`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* REMAINING SWEETS SUMMARY */}
        {isCompleted && (
          <div className="anim-pop" style={{
            background: 'var(--clr-correct-bg)',
            border: '2px solid var(--clr-correct)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'var(--clr-correct)', fontSize: '1.4rem', margin: '0 0 8px 0' }}>
              🎉 Order Fulfilled Perfectly!
            </h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--clr-text)', margin: '0 0 12px 0' }}>
              You took away {subtrahend} sweets! Sweets remaining on the counter:
            </p>

            <div style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              fontFamily: 'var(--font-kids)',
              color: 'var(--clr-accent)',
              marginBottom: '16px'
            }}>
              {packets > 0 ? `${packets} Packets (${packets * 100}) + ` : ''}
              {rolls > 0 ? `${rolls} Rolls (${rolls * 10}) + ` : ''}
              {singles} Singles = {diff} Sweets!
            </div>

            <button
              onClick={handleNextLevel}
              className="tenali-btn-primary"
              style={{
                fontSize: '1.15rem',
                padding: '12px 30px',
                borderRadius: 'var(--radius-pill)',
                margin: '0 auto',
                cursor: 'pointer'
              }}
            >
              <span>{level < 5 ? `Next Level (${level + 1}) ➔` : 'Replay Polotastic 🔄'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Story Modal */}
      <GameStoryModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        title="Pip's Polotastic Sweet Shop"
        badge="Place Value Story"
        icon="🍬"
        story={`Welcome to Pip's Sweet Shop! Sweets here are neatly organized into place-value bundles: Singles (Ones), Rolls of 10 (Tens), and Packets of 100 (Hundreds)! A hungry customer needs ${subtrahend} sweets from our counter of ${minuend} sweets. If you run out of loose singles, just tap a roll to unroll it into 10 loose sweets!`}
        buttonText="Next ➔ Start Packing Sweets!"
      />

      {/* Level Complete Celebration Modal */}
      {showCelebration && (
        <CelebrationModal
          title="Polotastic Bundling Master!"
          subtitle={`You solved ${minuend} − ${subtrahend} = ${diff} by unrolling Polo bundles!`}
          stars={3}
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onHome={onBack}
          hasNextLevel={level < 5}
        />
      )}
    </QuizLayout>
  );
}
