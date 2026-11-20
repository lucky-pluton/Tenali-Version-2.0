import React, { useState, useEffect } from 'react';
import QuizLayout from '../../../components/QuizLayout';
import CelebrationModal from '../../../components/CelebrationModal';
import GameStoryModal from '../../../components/GameStoryModal';
import {
  playFeastItemPick,
  playSuccessChime,
  playGentleBoing,
  playMonsterBurp,
  playMonsterGroan,
  playStomachGrowl,
  playKitchenBell,
  playMunch
} from '../../../core/soundEffects';
import { ShoppingBasket, ArrowRight, ArrowLeft } from 'lucide-react';
import { GameProps } from '../../../types';

interface FeastVariety {
  id: string;
  emoji: string;
  name: string;
}

interface BasketItem extends FeastVariety {
  uid: number;
  itemIndex: number;
}

interface StoryChapterState {
  isOpen: boolean;
  title: string;
  icon: string;
  badge: string;
  story: string;
  buttonText: string;
  onProceed?: () => void;
}

// Child-friendly slow speech synthesis helper
function speak(text: string | number, rate: number = 0.82, pitch: number = 1.15): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.rate = rate; // Gentle child-friendly pace
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  }
}

const FEAST_VARIETIES: FeastVariety[] = [
  { id: 'golden-puri', emoji: '🫓', name: 'Golden Puffed Puri' },
  { id: 'aloo-sabzi', emoji: '🍲', name: 'Aloo Sabzi Bowl' },
  { id: 'masala-puri', emoji: '🫓', name: 'Crispy Masala Puri' },
  { id: 'chana-sabzi', emoji: '🥘', name: 'Chana Masala Bowl' },
  { id: 'bhatura', emoji: '🫓', name: 'Fluffy Bhatura' },
  { id: 'paneer-sabzi', emoji: '🥣', name: 'Paneer Sabzi Bowl' }
];

/**
 * Large Traditional Indian Plate of Puri Sabzi
 * Displays an oversized Indian thali with several golden, puffed-up puris
 * and a traditional katori bowl of aromatic Indian potato sabzi (aloo sabzi).
 * Held naturally by Kumbhakarna's hands on both sides in eating posture.
 */
function PuriSabziPlate() {
  return (
    <div style={{
      position: 'relative',
      margin: '6px auto 14px auto',
      width: '100%',
      maxWidth: '390px',
      filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.4))'
    }}>
      <svg
        viewBox="0 0 400 230"
        width="100%"
        height="auto"
        style={{ display: 'block', overflow: 'visible' }}
        role="img"
        aria-label="Large traditional Indian plate of Puri Sabzi with golden puffed puris and potato curry"
      >
        <defs>
          {/* Metallic Thali Gradients */}
          <linearGradient id="thaliRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="thaliInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="45%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Golden Puffed Puri Gradients */}
          <radialGradient id="puriGrad1" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#fde047" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>

          <radialGradient id="puriGrad2" cx="35%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="20%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>

          <radialGradient id="puriGrad3" cx="40%" cy="35%" r="62%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="30%" stopColor="#facc15" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="90%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          {/* Potato Sabzi Gravy Gradient */}
          <radialGradient id="sabziGravyGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="35%" stopColor="#ea580c" />
            <stop offset="70%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>

          {/* Katori (Bowl) Metallic Gradient */}
          <linearGradient id="katoriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Hands/Paws Gradient */}
          <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* KUMBHAKARNA'S HANDS HOLDING THE OVERSIZED THALI                */}
        {/* ============================================================== */}
        {/* Left Arm & Hand gripping the left rim */}
        <g id="kumbhakarna-left-hand">
          <path
            d="M 16 100 Q 4 122 20 142 Q 38 150 52 138 L 48 114 Z"
            fill="url(#handGrad)"
            stroke="#5b21b6"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M 28 112 Q 40 106 48 114 Q 44 124 32 122 Z"
            fill="#a78bfa"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
          <path
            d="M 26 124 Q 42 120 46 130 Q 38 138 28 134 Z"
            fill="#8b5cf6"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
          <path
            d="M 28 136 Q 42 133 44 143 Q 34 150 26 144 Z"
            fill="#7c3aed"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
          <path
            d="M 32 100 Q 46 96 48 106 Q 42 114 30 110 Z"
            fill="#c4b5fd"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
        </g>

        {/* Right Arm & Hand gripping the right rim */}
        <g id="kumbhakarna-right-hand">
          <path
            d="M 384 100 Q 396 122 380 142 Q 362 150 348 138 L 352 114 Z"
            fill="url(#handGrad)"
            stroke="#5b21b6"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M 372 112 Q 360 106 352 114 Q 356 124 368 122 Z"
            fill="#a78bfa"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
          <path
            d="M 374 124 Q 358 120 354 130 Q 362 138 372 134 Z"
            fill="#8b5cf6"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
          <path
            d="M 372 136 Q 358 133 356 143 Q 366 150 374 144 Z"
            fill="#7c3aed"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
          <path
            d="M 368 100 Q 354 96 352 106 Q 358 114 370 110 Z"
            fill="#c4b5fd"
            stroke="#5b21b6"
            strokeWidth="2.5"
          />
        </g>

        {/* ============================================================== */}
        {/* TRADITIONAL INDIAN STEEL THALI (OVERSIZED SERVING)            */}
        {/* ============================================================== */}
        {/* Thali Outer Rim */}
        <ellipse
          cx="200"
          cy="126"
          rx="168"
          ry="84"
          fill="url(#thaliRimGrad)"
          stroke="#475569"
          strokeWidth="4"
        />
        {/* Thali Rim Bevel / Ridge */}
        <ellipse
          cx="200"
          cy="125"
          rx="158"
          ry="76"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        {/* Thali Interior Base */}
        <ellipse
          cx="200"
          cy="126"
          rx="152"
          ry="72"
          fill="url(#thaliInnerGrad)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        {/* Polished Rim Highlight Arc */}
        <path
          d="M 60 120 Q 200 60 340 120"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* ============================================================== */}
        {/* AROMATIC STEAM RISING FROM HOT FOOD                           */}
        {/* ============================================================== */}
        <g opacity="0.65">
          <path
            d="M 130 58 Q 122 42 134 30 Q 146 18 138 6"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 175 52 Q 185 38 174 24 Q 163 12 172 2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 285 55 Q 295 40 285 28 Q 275 16 284 4"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* ============================================================== */}
        {/* SEVERAL GOLDEN, PUFFED-UP PURIS                                */}
        {/* ============================================================== */}
        {/* Puri 1: Back-Left Puffed Puri */}
        <g id="puri-1">
          <ellipse
            cx="115"
            cy="100"
            rx="56"
            ry="40"
            fill="url(#puriGrad1)"
            stroke="#92400e"
            strokeWidth="3"
            transform="rotate(-8 115 100)"
          />
          <ellipse
            cx="108"
            cy="92"
            rx="36"
            ry="22"
            fill="#fef08a"
            opacity="0.65"
            transform="rotate(-8 108 92)"
          />
          <ellipse
            cx="102"
            cy="88"
            rx="16"
            ry="8"
            fill="#ffffff"
            opacity="0.75"
            transform="rotate(-8 102 88)"
          />
          <circle cx="95" cy="102" r="2.5" fill="#92400e" opacity="0.7" />
          <circle cx="122" cy="94" r="2" fill="#b45309" opacity="0.8" />
          <circle cx="132" cy="108" r="3" fill="#78350f" opacity="0.6" />
          <circle cx="82" cy="95" r="2" fill="#b45309" opacity="0.6" />
        </g>

        {/* Puri 2: Center-Back Puffed Puri */}
        <g id="puri-2">
          <ellipse
            cx="185"
            cy="92"
            rx="58"
            ry="42"
            fill="url(#puriGrad2)"
            stroke="#92400e"
            strokeWidth="3"
            transform="rotate(6 185 92)"
          />
          <ellipse
            cx="178"
            cy="84"
            rx="38"
            ry="24"
            fill="#fffbeb"
            opacity="0.65"
            transform="rotate(6 178 84)"
          />
          <ellipse
            cx="172"
            cy="80"
            rx="18"
            ry="9"
            fill="#ffffff"
            opacity="0.8"
            transform="rotate(6 172 80)"
          />
          <circle cx="165" cy="96" r="2.5" fill="#78350f" opacity="0.7" />
          <circle cx="196" cy="88" r="3" fill="#92400e" opacity="0.7" />
          <circle cx="210" cy="98" r="2" fill="#b45309" opacity="0.6" />
          <circle cx="152" cy="86" r="2" fill="#92400e" opacity="0.6" />
        </g>

        {/* Puri 3: Front-Left Golden Hero Puri (Oversized & Puffed Up!) */}
        <g id="puri-3">
          <ellipse
            cx="105"
            cy="138"
            rx="62"
            ry="45"
            fill="url(#puriGrad3)"
            stroke="#78350f"
            strokeWidth="3.5"
            transform="rotate(-4 105 138)"
          />
          <path
            d="M 52 142 Q 105 182 158 142"
            fill="none"
            stroke="#92400e"
            strokeWidth="2.5"
            opacity="0.5"
          />
          <ellipse
            cx="98"
            cy="128"
            rx="42"
            ry="26"
            fill="#fef08a"
            opacity="0.75"
            transform="rotate(-4 98 128)"
          />
          <ellipse
            cx="92"
            cy="122"
            rx="20"
            ry="10"
            fill="#ffffff"
            opacity="0.85"
            transform="rotate(-4 92 122)"
          />
          <circle cx="80" cy="132" r="3" fill="#78350f" opacity="0.75" />
          <circle cx="118" cy="130" r="2.5" fill="#92400e" opacity="0.8" />
          <circle cx="135" cy="142" r="3.5" fill="#78350f" opacity="0.7" />
          <circle cx="95" cy="148" r="2" fill="#b45309" opacity="0.7" />
          <circle cx="68" cy="140" r="2.5" fill="#92400e" opacity="0.6" />
        </g>

        {/* Puri 4: Front-Center Golden Puffed Puri (Generously Overlapping) */}
        <g id="puri-4">
          <ellipse
            cx="178"
            cy="142"
            rx="64"
            ry="46"
            fill="url(#puriGrad1)"
            stroke="#78350f"
            strokeWidth="3.5"
            transform="rotate(4 178 142)"
          />
          <ellipse
            cx="170"
            cy="132"
            rx="44"
            ry="27"
            fill="#fffbeb"
            opacity="0.7"
            transform="rotate(4 170 132)"
          />
          <ellipse
            cx="164"
            cy="126"
            rx="22"
            ry="11"
            fill="#ffffff"
            opacity="0.9"
            transform="rotate(4 164 126)"
          />
          <circle cx="152" cy="138" r="3" fill="#92400e" opacity="0.8" />
          <circle cx="192" cy="134" r="2.5" fill="#78350f" opacity="0.75" />
          <circle cx="212" cy="146" r="3.5" fill="#92400e" opacity="0.7" />
          <circle cx="168" cy="154" r="2" fill="#b45309" opacity="0.7" />
          <circle cx="138" cy="148" r="2.5" fill="#78350f" opacity="0.65" />
        </g>

        {/* ============================================================== */}
        {/* TRADITIONAL BOWL (KATORI) OF INDIAN POTATO SABZI (ALOO SABZI)  */}
        {/* ============================================================== */}
        <g id="katori-potato-sabzi">
          {/* Metal Katori Outer Body */}
          <ellipse
            cx="285"
            cy="124"
            rx="54"
            ry="38"
            fill="url(#katoriGrad)"
            stroke="#334155"
            strokeWidth="3.5"
          />
          {/* Katori Inner Rim */}
          <ellipse
            cx="285"
            cy="120"
            rx="50"
            ry="33"
            fill="#f8fafc"
            stroke="#64748b"
            strokeWidth="2"
          />
          {/* Rich Spiced Golden-Red Potato Curry Gravy */}
          <ellipse
            cx="285"
            cy="121"
            rx="46"
            ry="29"
            fill="url(#sabziGravyGrad)"
            stroke="#9a3412"
            strokeWidth="1.5"
          />
          {/* Gravy Shimmer / Oil Gloss */}
          <ellipse
            cx="272"
            cy="114"
            rx="16"
            ry="7"
            fill="rgba(255,255,255,0.45)"
            transform="rotate(-10 272 114)"
          />

          {/* Golden Spiced Potato Cubes (Aloo) */}
          <g>
            <polygon
              points="260,112 278,106 288,118 268,124"
              fill="#fde047"
              stroke="#b45309"
              strokeWidth="2"
            />
            <polygon
              points="268,124 288,118 284,126 264,128"
              fill="#ea580c"
              opacity="0.8"
            />
          </g>

          <g>
            <polygon
              points="282,104 300,102 306,114 288,116"
              fill="#facc15"
              stroke="#b45309"
              strokeWidth="2"
            />
            <polygon
              points="288,116 306,114 302,122 284,122"
              fill="#c2410c"
              opacity="0.75"
            />
          </g>

          <g>
            <polygon
              points="272,122 292,120 295,132 276,134"
              fill="#fde047"
              stroke="#b45309"
              strokeWidth="1.8"
            />
            <polygon
              points="276,134 295,132 290,138 272,138"
              fill="#ea580c"
              opacity="0.8"
            />
          </g>

          <g>
            <polygon
              points="250,116 264,112 268,122 254,126"
              fill="#facc15"
              stroke="#b45309"
              strokeWidth="1.8"
            />
          </g>

          <g>
            <polygon
              points="298,114 314,110 318,120 302,124"
              fill="#eab308"
              stroke="#92400e"
              strokeWidth="1.8"
            />
          </g>

          {/* Cumin Seeds / Tadka Masala Dots */}
          <ellipse cx="276" cy="110" rx="2.5" ry="1.2" fill="#451a03" transform="rotate(25 276 110)" />
          <ellipse cx="295" cy="112" rx="2.5" ry="1.2" fill="#451a03" transform="rotate(-35 295 112)" />
          <ellipse cx="266" cy="120" rx="2" ry="1" fill="#451a03" transform="rotate(40 266 120)" />
          <ellipse cx="286" cy="128" rx="2.2" ry="1.1" fill="#451a03" transform="rotate(15 286 128)" />

          {/* Fresh Green Coriander Garnish (Dhaniya Leaves) */}
          <g transform="translate(278, 112)">
            <path
              d="M 0 0 C -4 -5 -10 -2 -6 3 C -2 8 4 6 0 0 Z"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="1.2"
            />
            <path
              d="M 0 0 C 4 -6 10 -4 7 2 C 4 6 -1 5 0 0 Z"
              fill="#16a34a"
              stroke="#14532d"
              strokeWidth="1.2"
            />
            <circle cx="0" cy="1" r="1.5" fill="#4ade80" />
          </g>

          <g transform="translate(290, 118)">
            <path
              d="M 0 0 C -3 -4 -7 -1 -4 3 C -1 5 3 4 0 0 Z"
              fill="#16a34a"
              stroke="#14532d"
              strokeWidth="1"
            />
            <path
              d="M 0 0 C 3 -4 7 -2 5 2 C 2 5 -1 4 0 0 Z"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="1"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function FeedTheMonsterGame({ onBack }: GameProps) {
  const [level, setLevel] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);

  // Level configuration ranges
  const LEVEL_RANGES: Record<number, { min: number; max: number; name: string }> = {
    1: { min: 1, max: 3, name: "Level 1: Little Nibbler (1–3)" },
    2: { min: 1, max: 5, name: "Level 2: Hungry Buddy (1–5)" },
    3: { min: 1, max: 7, name: "Level 3: Big Appetite (1–7)" },
    4: { min: 1, max: 10, name: "Level 4: Monster Feast (1–10)" },
    5: { min: 1, max: 10, name: "Level 5: Royal Halwai (1–10 Challenge)" }
  };

  const generateTarget = (lvl: number): number => {
    const range = LEVEL_RANGES[lvl] || LEVEL_RANGES[1];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const [targetNumber, setTargetNumber] = useState<number>(() => generateTarget(1));

  // Episodic Story Chapters: Story says something -> Activity happens -> Story continues!
  const [storyChapter, setStoryChapter] = useState<StoryChapterState>({
    isOpen: true,
    title: "Kumbhakarna's Rumbly Tummy",
    icon: "😴",
    badge: "Chapter 1: The Waking Giant",
    story: "Deep in the enchanted forest, Kumbhakarna the gentle giant is waking up from his six-month nap. His tummy rumbles like thunder: GURRRLE! Look inside his belly to see how many Puri Sabzi items he is dreaming of today!",
    buttonText: "Next ➔ Count Stomach Spaces!",
    onProceed: () => {}
  });

  const handleCloseStoryChapter = () => {
    const callback = storyChapter.onProceed;
    setStoryChapter(prev => ({ ...prev, isOpen: false }));
    if (callback) callback();
  };

  // Game Stage: 'hunger' | 'bakery' | 'verdict'
  const [stage, setStage] = useState<'hunger' | 'bakery' | 'verdict'>('hunger');

  // Stage 1: Counting the empty stomach slots
  const [countedSlots, setCountedSlots] = useState<number[]>([]);
  const [hungerConfirmed, setHungerConfirmed] = useState<boolean>(false);

  // Stage 2: Kitchen collection basket (array of feast objects)
  // CRITICAL: Does NOT display the target count (e.g. no "0 / 3" or target spoiler!)
  const [basket, setBasket] = useState<BasketItem[]>([]);

  // Stage 3: Verdict outcome ('too_few' | 'too_many' | 'exact' | null)
  const [verdict, setVerdict] = useState<'too_few' | 'too_many' | 'exact' | null>(null);
  const [eatenCount, setEatenCount] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Initial stomach growl on hunger stage load (no long speech - count on click)
  useEffect(() => {
    if (stage === 'hunger') {
      const timer = setTimeout(() => {
        playStomachGrowl();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [stage, targetNumber]);

  // Stage 1: Child clicks each empty space in the monster's stomach to count 1, 2, 3...
  const handleCountStomachSlot = (slotIdx: number) => {
    if (countedSlots.includes(slotIdx)) return;

    playFeastItemPick();
    const nextCount = countedSlots.length + 1;
    const newCounted = [...countedSlots, slotIdx];
    setCountedSlots(newCounted);

    // ONLY count the sequential number aloud: "1", "2", "3"!
    speak(String(nextCount), 0.85);

    if (newCounted.length === targetNumber) {
      setTimeout(() => {
        playSuccessChime();
        setHungerConfirmed(true);

        // Story continues!
        setStoryChapter({
          isOpen: true,
          title: "Off to the Royal Feast Kitchen!",
          icon: "🍲",
          badge: "Story Continues • Chapter 2",
          story: `Kumbhakarna's tummy needs exactly ${targetNumber} Puri Sabzi items! You jump on your bicycle and zoom down to the Royal Kitchen. The chef smiles: "Namaste! Pick golden puris and steaming sabzi bowls from my counter to fill your basket!"`,
          buttonText: "Next ➔ Go to Royal Kitchen!",
          onProceed: () => {
            handleGoToKitchen();
          }
        });
      }, 500);
    }
  };

  // Transition from Stage 1 to Stage 2 (Kitchen)
  const handleGoToKitchen = () => {
    playKitchenBell();
    setStage('bakery');
  };

  // Stage 2: Add item to basket and speak ONLY the count: 1, 2, 3...
  const handleAddFeastItem = (item: FeastVariety) => {
    playFeastItemPick();
    const nextBasketCount = basket.length + 1;
    setBasket(prev => [...prev, { ...item, uid: Date.now() + Math.random(), itemIndex: nextBasketCount }]);

    // Speak ONLY the count when picking items: 1, 2, 3...
    speak(String(nextBasketCount), 0.85);
  };

  // Stage 2: Remove specific item from basket - speaks remaining count
  const handleRemoveFeastItem = (uid: number) => {
    playFeastItemPick();
    setBasket(prev => {
      const updated = prev.filter(c => c.uid !== uid);
      speak(String(updated.length), 0.85);
      return updated;
    });
  };

  // Stage 2: Deliver feast to monster
  const handleDeliverFeast = () => {
    const count = basket.length;
    setStage('verdict');

    if (count < targetNumber) {
      playGentleBoing();
      setVerdict('too_few');
      setStoryChapter({
        isOpen: true,
        title: "Kumbhakarna is Still Hungry!",
        icon: "😢",
        badge: "Story Continues",
        story: `GURRRLE! Kumbhakarna's tummy still rumbles! He looks down and whispers: "My belly still has empty room! I only got ${count} items, but I need ${targetNumber}!" Let's go back to the kitchen and fetch ${targetNumber - count} more!`,
        buttonText: "Next ➔ Get More Food!",
        onProceed: () => {
          handleReturnToKitchen();
        }
      });
    } else if (count > targetNumber) {
      playMonsterGroan();
      setVerdict('too_many');
      setStoryChapter({
        isOpen: true,
        title: "Too Much Food!",
        icon: "😵",
        badge: "Story Continues",
        story: `Uh oh! Kumbhakarna holds his bulging belly: "Whoa, that is ${count} items! My tummy will pop if I eat all of those! I only need ${targetNumber}!" Let's return to the kitchen and take out ${count - targetNumber} extra items!`,
        buttonText: "Next ➔ Remove Extra Food!",
        onProceed: () => {
          handleReturnToKitchen();
        }
      });
    } else {
      // Exact match!
      setVerdict('exact');
      playSuccessChime();
      setStars(s => s + 3);

      // Story continues to Chapter 3: The Monster Feast!
      setStoryChapter({
        isOpen: true,
        title: "The Monster Feast Begins!",
        icon: "😋",
        badge: "Story Continues • Chapter 3",
        story: `Kumbakaran's eyes light up with pure joy! "YUMMMM! Exactly ${targetNumber} delicious servings, just what my tummy was dreaming of!" Look at this giant plate of Puri Sabzi with golden puffed puris and hot potato sabzi! Watch him feast and gobble it down!`,
        buttonText: "Next ➔ Watch Kumbakaran Feast!",
        onProceed: () => {
          // Trigger animated one-by-one eating into the stomach and count along: 1, 2, 3...
          let currentEaten = 0;
          const eatInterval = setInterval(() => {
            currentEaten += 1;
            setEatenCount(currentEaten);
            playMunch();
            speak(String(currentEaten), 0.85);

            if (currentEaten >= targetNumber) {
              clearInterval(eatInterval);
              setTimeout(() => {
                playMonsterBurp();
                setTimeout(() => {
                  setShowCelebration(true);
                }, 900);
              }, 600);
            }
          }, 550);
        }
      });
    }
  };

  // Return to kitchen to correct feast count
  const handleReturnToKitchen = () => {
    playKitchenBell();
    setStage('bakery');
    setVerdict(null);
    setEatenCount(0);
  };

  // Move to next level
  const handleNextLevel = () => {
    setShowCelebration(false);
    const nextLvl = level < 5 ? level + 1 : 1;
    setLevel(nextLvl);
    const newTarget = generateTarget(nextLvl);
    setTargetNumber(newTarget);
    setCountedSlots([]);
    setHungerConfirmed(false);
    setBasket([]);
    setVerdict(null);
    setEatenCount(0);
    setStage('hunger');
    setStoryChapter({
      isOpen: true,
      title: "Kumbakaran's Hunger Grows!",
      icon: "😴",
      badge: `Level ${nextLvl} • Chapter 1`,
      story: `Kumbakaran took a tiny snooze and woke up ready for another meal! Let's peek into his tummy and count the empty spaces to see his new appetite!`,
      buttonText: "Next ➔ Count Stomach Spaces!",
      onProceed: () => {}
    });
  };

  // Replay current level
  const handleReplay = () => {
    setShowCelebration(false);
    const newTarget = generateTarget(level);
    setTargetNumber(newTarget);
    setCountedSlots([]);
    setHungerConfirmed(false);
    setBasket([]);
    setVerdict(null);
    setEatenCount(0);
    setStage('hunger');
    setStoryChapter({
      isOpen: true,
      title: "Kumbhakarna's Rumbly Tummy",
      icon: "😴",
      badge: `Level ${level} • Chapter 1`,
      story: `Let's help Kumbhakarna again! Count the empty plates inside his belly to see how many Puri Sabzi items he wants!`,
      buttonText: "Next ➔ Count Stomach Spaces!",
      onProceed: () => {}
    });
  };

  // Monster visual expressions
  const getMonsterVisual = () => {
    if (stage === 'verdict') {
      if (verdict === 'too_few') {
        return {
          face: '😢',
          bellyGlow: '#f87171',
          expression: "Heyyy! I'm still hungry!",
          burpText: null
        };
      }
      if (verdict === 'too_many') {
        return {
          face: '😵‍💫',
          bellyGlow: '#fb923c',
          expression: "WHOA! That's too much food!",
          burpText: null
        };
      }
      if (verdict === 'exact') {
        return {
          face: eatenCount >= targetNumber ? '😋' : '🤤',
          bellyGlow: '#4ade80',
          expression: "YUMMMM! Exactly the right number!",
          burpText: eatenCount >= targetNumber ? 'BURRRRP! ✨' : null
        };
      }
    }
    return {
      face: hungerConfirmed ? '😃' : '🤤',
      bellyGlow: '#fef08a',
      expression: hungerConfirmed ? "Yay! Let's get the feast!" : "My tummy is growling for Puri Sabzi!",
      burpText: null
    };
  };

  const monsterVisual = getMonsterVisual();

  return (
    <QuizLayout
      title="Feed Kumbhakarna!"
      subtitle="Count the empty spaces in Kumbhakarna's tummy, visit the royal kitchen, and bring the exact Puri Sabzi feast!"
      category="Counting & One-to-One Match"
      level={level}
      stars={stars}
      onBack={onBack}
      onOpenStory={() => setStoryChapter(prev => ({ ...prev, isOpen: true }))}
    >
      <div style={{ width: '100%', maxWidth: '850px' }}>

        {/* Level Indicator Tabs */}
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
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-accent)' }}>
              LEVEL {level} OF 5
            </span>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              color: 'var(--clr-text)',
              margin: '2px 0 0 0'
            }}>
              {LEVEL_RANGES[level].name}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  const newTarget = generateTarget(lvl);
                  setTargetNumber(newTarget);
                  setCountedSlots([]);
                  setHungerConfirmed(false);
                  setBasket([]);
                  setVerdict(null);
                  setEatenCount(0);
                  setStage('hunger');
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: level === lvl ? 'var(--clr-accent)' : 'var(--clr-surface)',
                  color: level === lvl ? '#fff' : 'var(--clr-text-soft)',
                  border: '1px solid var(--clr-border)',
                  cursor: 'pointer'
                }}
              >
                Lvl {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STAGE 1: DISCOVER THE MONSTER'S HUNGER (Visual Stomach + Click-to-Count)
        ───────────────────────────────────────────────────────────── */}
        {stage === 'hunger' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '26px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            {/* Monster Speech Bubble */}
            <div style={{
              display: 'inline-block',
              background: 'var(--clr-surface)',
              border: '2px solid var(--clr-accent)',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--clr-text)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-btn)'
            }}>
              💬 <em>"I'm SUPER hungry! Click each empty space inside my tummy to count how many Puri Sabzi items I want!"</em>
            </div>

            {/* REALISTIC CARTOON MONSTER WITH PROMINENT ROUND STOMACH */}
            <div style={{
              background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)',
              border: '4px solid #5b21b6',
              borderRadius: '50px 50px 60px 60px',
              padding: '24px 20px 30px 20px',
              maxWidth: '460px',
              margin: '0 auto 22px auto',
              boxShadow: '0 16px 36px rgba(109, 40, 217, 0.45)',
              color: '#ffffff',
              position: 'relative'
            }}>
              {/* Monster Ears / Horns */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '40px',
                fontSize: '2.5rem',
                transform: 'rotate(-20deg)'
              }}>
                🦄
              </div>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '40px',
                fontSize: '2.5rem',
                transform: 'rotate(20deg)'
              }}>
                🦄
              </div>

              {/* Monster Head & Eyes */}
              <div style={{ fontSize: '4.8rem', lineHeight: 1, marginBottom: '4px' }}>
                {monsterVisual.face}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#fef08a',
                marginBottom: '14px',
                letterSpacing: '0.02em'
              }}>
                Kumbakaran the Monster
              </div>

              {/* BIG ROUND MONSTER TUMMY / STOMACH CHAMBER */}
              <div style={{
                background: 'radial-gradient(ellipse at center, rgba(254, 240, 138, 0.25) 0%, rgba(20, 10, 40, 0.75) 100%)',
                border: '4px solid #fef08a',
                borderRadius: '50% 50% 48% 48% / 60% 60% 45% 45%',
                padding: '24px 18px 28px 18px',
                margin: '0 auto',
                maxWidth: '380px',
                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5), 0 0 24px rgba(254, 240, 138, 0.35)',
                position: 'relative'
              }}>
                {/* Tummy Ribs & Label */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#fef08a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '14px'
                }}>
                  <span>🫧</span>
                  <span>Inside Kumbakaran's Tummy</span>
                  <span>🫧</span>
                </div>

                {/* Empty Feast Plate Slots inside Stomach */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '12px',
                  minHeight: '80px',
                  alignItems: 'center'
                }}>
                  {Array.from({ length: targetNumber }).map((_, idx) => {
                    const isCounted = countedSlots.includes(idx);
                    const slotOrder = countedSlots.indexOf(idx) + 1;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleCountStomachSlot(idx)}
                        className={isCounted ? 'anim-pop' : 'anim-bounce'}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: isCounted ? '#fef08a' : 'rgba(255, 255, 255, 0.12)',
                          border: isCounted ? '3px solid #eab308' : '3px dashed #fef08a',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isCounted ? 'default' : 'pointer',
                          boxShadow: isCounted
                            ? '0 0 16px rgba(254, 240, 138, 0.8)'
                            : '0 4px 10px rgba(0,0,0,0.3)',
                          transform: isCounted ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 0.25s'
                        }}
                      >
                        {isCounted ? (
                          <span style={{
                            fontSize: '1.45rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-kids)',
                            color: '#713f12'
                          }}>
                            {slotOrder}
                          </span>
                        ) : (
                          <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>
                            🍽️
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cute Belly Button at base of tummy */}
                <div style={{
                  width: '12px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(254, 240, 138, 0.5)',
                  margin: '14px auto 0 auto'
                }} />
              </div>

              {/* Counting Status below Tummy */}
              <div style={{
                marginTop: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fef08a'
              }}>
                Tummy Spaces Counted: {countedSlots.length} / {targetNumber}
              </div>
            </div>

            {/* Prompt or Action Button */}
            {!hungerConfirmed ? (
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--clr-text)',
                margin: '0 auto 16px auto',
                fontWeight: 600
              }}>
                👉 Tap each empty space inside the monster's tummy to count 1, 2, 3!
              </p>
            ) : (
              <div className="anim-pop">
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--clr-correct)',
                  marginBottom: '16px'
                }}>
                  ✨ Kumbhakarna wants {targetNumber} Puri Sabzi items! Remember this number!
                </div>
                <button
                  onClick={handleGoToKitchen}
                  className="tenali-btn-primary"
                  style={{
                    fontSize: '1.2rem',
                    padding: '14px 34px',
                    borderRadius: 'var(--radius-pill)',
                    margin: '0 auto',
                    cursor: 'pointer'
                  }}
                >
                  <span>Visit the Royal Kitchen & Collect the Feast! 🍲➡️</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 2: VISIT THE ROYAL KITCHEN (NO TARGET SPOILER IN BASKET!)
        ───────────────────────────────────────────────────────────── */}
        {stage === 'bakery' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center'
          }}>
            {/* Kitchen Header & Halwai (NO target count mentioned!) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--radius)',
              padding: '14px 20px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '3rem' }}>👨‍🍳</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-text)' }}>
                    Chacha Halwai's Royal Rasoi
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--clr-text-soft)' }}>
                    "Namaste! Pick hot puris and savory sabzi bowls from the counter into your basket!"
                  </div>
                </div>
              </div>

              {/* Memory Prompt (Does NOT give away the exact number!) */}
              <div style={{
                background: 'var(--clr-accent-soft)',
                border: '2px solid var(--clr-accent)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--clr-accent)'
              }}>
                🤔 Remember how many feast items Kumbhakarna wanted!
              </div>
            </div>

            {/* Feast Counter (Tap to pick) */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontFamily: 'var(--font-display)',
                color: 'var(--clr-text)',
                marginBottom: '12px'
              }}>
                Royal Feast Counter (Tap to pick puris & sabzi into basket):
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '12px'
              }}>
                {FEAST_VARIETIES.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddFeastItem(item)}
                    style={{
                      background: 'var(--clr-surface)',
                      border: '2px solid var(--clr-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: 'var(--shadow-btn)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, border-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '2.6rem' }}>{item.emoji}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-text)' }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--clr-accent)',
                      fontWeight: 700
                    }}>
                      + Take Item
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* PLAYER'S DELIVERY BASKET */}
            {/* CRITICAL: ONLY shows how many are currently in the basket, NEVER "/ 3" */}
            <div style={{
              background: '#fef3c7',
              border: '3px solid #d97706',
              borderRadius: '24px',
              padding: '20px',
              marginBottom: '24px',
              color: '#78350f',
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.15rem' }}>
                  <ShoppingBasket size={24} />
                  <span>Your Delivery Basket</span>
                </div>

                {/* Only current total in basket (NO target spoiler!) */}
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  background: '#fde68a',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-pill)',
                  border: '2px solid #b45309'
                }}>
                  Feast Items in Basket: {basket.length}
                </div>
              </div>

              {/* Basket Contents with counted badges 1, 2, 3... */}
              {basket.length === 0 ? (
                <div style={{
                  padding: '24px',
                  border: '2px dashed #d97706',
                  borderRadius: '16px',
                  color: '#92400e',
                  fontWeight: 600
                }}>
                  🧺 Your basket is empty! Tap the puris and sabzi bowls above to collect them (1, 2, 3...)!
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center',
                  padding: '10px 0'
                }}>
                  {basket.map((item, idx) => (
                    <div
                      key={item.uid}
                      className="anim-pop"
                      style={{
                        background: '#ffffff',
                        border: '2px solid #d97706',
                        borderRadius: '16px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}
                    >
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#d97706',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '1.8rem' }}>{item.emoji}</span>
                      <button
                        onClick={() => handleRemoveFeastItem(item.uid)}
                        title="Remove item from basket"
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deliver Button */}
            <button
              onClick={handleDeliverFeast}
              disabled={basket.length === 0}
              className="tenali-btn-primary"
              style={{
                fontSize: '1.25rem',
                padding: '14px 38px',
                borderRadius: 'var(--radius-pill)',
                opacity: basket.length === 0 ? 0.5 : 1,
                cursor: basket.length === 0 ? 'not-allowed' : 'pointer',
                margin: '0 auto'
              }}
            >
              <span>DELIVER THE PURI SABZI FEAST TO KUMBHAKARNA! 🚚🍛</span>
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 3: THE MONSTER'S VERDICT
        ───────────────────────────────────────────────────────────── */}
        {stage === 'verdict' && (
          <div className="anim-pop" style={{
            background: 'var(--clr-card)',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius)',
            padding: '28px 20px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            {/* Monster Reaction Character */}
            <div style={{
              background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)',
              border: '4px solid #5b21b6',
              borderRadius: '50px 50px 60px 60px',
              padding: '24px 20px 30px 20px',
              maxWidth: '460px',
              margin: '0 auto 24px auto',
              boxShadow: '0 16px 36px rgba(109, 40, 217, 0.45)',
              color: '#ffffff',
              position: 'relative'
            }}>
              <div style={{ fontSize: '4.8rem', lineHeight: 1, marginBottom: '4px' }}>
                {monsterVisual.face}
              </div>
              <div style={{
                fontFamily: 'var(--font-kids)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#fef08a',
                marginBottom: '14px'
              }}>
                Kumbhakarna the Monster
              </div>

              {/* Large Traditional Indian Plate of Puri Sabzi held naturally in his hands */}
              {verdict === 'exact' && (
                <div className="anim-pop" style={{ margin: '4px auto 14px auto' }}>
                  <PuriSabziPlate />
                </div>
              )}

              {/* Stomach filling animation on exact match */}
              <div style={{
                background: 'radial-gradient(ellipse at center, rgba(254, 240, 138, 0.25) 0%, rgba(20, 10, 40, 0.75) 100%)',
                border: '4px solid #fef08a',
                borderRadius: '50% 50% 48% 48% / 60% 60% 45% 45%',
                padding: '24px 18px 28px 18px',
                margin: '0 auto',
                maxWidth: '380px'
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  {Array.from({ length: targetNumber }).map((_, idx) => {
                    const isEaten = verdict === 'exact' && idx < eatenCount;
                    return (
                      <div
                        key={idx}
                        className={isEaten ? 'anim-pop' : ''}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: isEaten ? '#4ade80' : 'rgba(255, 255, 255, 0.15)',
                          border: isEaten ? '3px solid #16a34a' : '3px dashed #fef08a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.6rem',
                          boxShadow: isEaten ? '0 0 16px rgba(74, 222, 128, 0.8)' : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        {isEaten ? '🫓' : '🍽️'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Verdict Outcomes */}
            {verdict === 'too_few' && (
              <div className="anim-pop" style={{
                background: 'var(--clr-wrong-bg)',
                border: '2px solid var(--clr-wrong)',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto 20px auto'
              }}>
                <h3 style={{ color: 'var(--clr-wrong)', margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                  😢 Heyyy! I'm Still Hungry!
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', margin: '0 0 12px 0' }}>
                  "I wanted <strong>{targetNumber}</strong> feast items, but you brought only <strong>{basket.length}</strong>!"
                </p>
                <div style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: 800,
                  color: 'var(--clr-wrong)',
                  marginBottom: '16px'
                }}>
                  {targetNumber} - {basket.length} = {targetNumber - basket.length} more items needed!
                </div>
                <button
                  onClick={handleReturnToKitchen}
                  className="tenali-btn-primary"
                  style={{
                    fontSize: '1.05rem',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--clr-accent)',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Return to Kitchen to Add More Food!</span>
                </button>
              </div>
            )}

            {verdict === 'too_many' && (
              <div className="anim-pop" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto 20px auto'
              }}>
                <h3 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                  😵‍💫 WHOA! That's Too Much Food!
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'var(--clr-text)', margin: '0 0 12px 0' }}>
                  "My stomach will burst! I only wanted <strong>{targetNumber}</strong> feast items, but you brought <strong>{basket.length}</strong>!"
                </p>
                <div style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-kids)',
                  fontWeight: 800,
                  color: '#ef4444',
                  marginBottom: '16px'
                }}>
                  {basket.length} - {targetNumber} = {basket.length - targetNumber} extra items!
                </div>
                <button
                  onClick={handleReturnToKitchen}
                  className="tenali-btn-primary"
                  style={{
                    fontSize: '1.05rem',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-pill)',
                    background: '#ef4444',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Return to Kitchen to Remove Extra Food!</span>
                </button>
              </div>
            )}

            {verdict === 'exact' && (
              <div className="anim-pop" style={{
                background: 'var(--clr-correct-bg)',
                border: '2px solid var(--clr-correct)',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '520px',
                margin: '0 auto'
              }}>
                <h3 style={{ color: 'var(--clr-correct)', margin: '0 0 8px 0', fontSize: '1.35rem' }}>
                  🎉 YUMMMM! Perfect!
                </h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--clr-text)', margin: '0 0 8px 0' }}>
                  You brought exactly <strong>{targetNumber}</strong> treats! Kumbhakarna enjoys his giant plate of golden Puri Sabzi! His stomach is happy and full!
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Episodic Story Modal with Mini Speaker & Next Button */}
      <GameStoryModal
        isOpen={storyChapter.isOpen}
        onClose={handleCloseStoryChapter}
        title={storyChapter.title}
        icon={storyChapter.icon}
        badge={storyChapter.badge}
        story={storyChapter.story}
        buttonText={storyChapter.buttonText}
      />

      {showCelebration && (
        <CelebrationModal
          title="Monster Feeder Champion!"
          subtitle={`You successfully matched Kumbhakarna's hunger with a giant feast of Puri Sabzi!`}
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
