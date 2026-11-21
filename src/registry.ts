/**
 * MODULE REGISTRY
 * Aggregates all game modules with relatable, authentic Indian/Hindi titles and strict TypeScript types
 */

import React from 'react';
import GulabJamunEmoji from './components/GulabJamunEmoji';

// Addition Modules
import aaravJamunModule from './modules/addition/aarav-jamun';
import riyaBraceletModule from './modules/addition/riya-bracelet';
import sunChariotModule from './modules/addition/sun-chariot';
import marigoldMagicModule from './modules/addition/marigold-magic';

// Subtraction Modules
import vanishingButtonsModule from './modules/subtraction/vanishing-buttons';
import schoolBusModule from './modules/subtraction/school-bus';
import trickOrThinkModule from './modules/subtraction/trick-or-think';
import frogHopModule from './modules/subtraction/math-o-lantern';

// Counting & Logic Modules
import lavaHopModule from './modules/counting-logic/lava-hop';
import sum7DiceModule from './modules/counting-logic/sum7-dice';
import feedMonsterModule from './modules/counting-logic/feed-monster';

// Coordinate Geometry Master Module (Stories 1 to 4 Unified)
import coordinateGeometryZeroModule from './modules/coordinate-geometry/coordinate-geometry-zero';

import { GameCard } from './types';

export const MODULE_REGISTRY: GameCard[] = [
  // --- COUNTING & LOGIC GAMES ---
  {
    id: 'feed-monster',
    name: "Kumbhakarna Ki Dawat!",
    component: feedMonsterModule.Component,
    icon: '👹',
    domainId: 'counting-logic',
    levelsCount: 5,
    tags: ['kumbhakarna', 'dawat', 'feast', 'puri-sabzi', 'dosa-idli', 'dhokla', 'counting', 'desi']
  },
  {
    id: 'lava-hop',
    name: "Nadi Aur Pahar",
    component: lavaHopModule.Component,
    icon: '🏞️',
    domainId: 'counting-logic',
    levelsCount: 3,
    tags: ['nadi aur pahar', 'nadi', 'pahar', 'river and mountain', 'bachpan', 'schoolyard', 'stepping stones', 'counting']
  },
  {
    id: 'sum7-dice',
    name: "Ludo Ka Jaadui Paasa",
    component: sum7DiceModule.Component,
    icon: '🎲',
    domainId: 'counting-logic',
    levelsCount: 3,
    tags: ['paasa', 'dice', 'ludo', 'saap-seedhi', 'magic 7', 'mystery', 'logic']
  },

  // --- ADDITION GAMES ---
  {
    id: 'aarav-jamun',
    name: "Aarav Ke Gulab Jamun",
    component: aaravJamunModule.Component,
    icon: React.createElement(GulabJamunEmoji, { size: 54, variant: 'bowl' }),
    domainId: 'addition',
    levelsCount: 3,
    tags: ['aarav', 'gulab jamun', 'sweets', 'mithai', 'birthday', 'addition', 'feeding']
  },
  {
    id: 'riya-bracelet',
    name: "Riya Ki Moti Mala",
    component: riyaBraceletModule.Component,
    icon: '📿',
    domainId: 'addition',
    levelsCount: 4,
    tags: ['riya', 'moti', 'mala', 'bracelet', 'kangan', 'making 10', 'number bonds']
  },
  {
    id: 'sun-chariot',
    name: "Surya Rath Ka Pahiya",
    component: sunChariotModule.Component,
    icon: '🎡',
    domainId: 'addition',
    levelsCount: 3,
    tags: ['surya rath', 'konark', 'chakra', 'wheel', 'pairs', 'fact families']
  },
  {
    id: 'marigold-magic',
    name: "Genda Phool – School Ki Sajawat",
    component: marigoldMagicModule.Component,
    icon: '🌼',
    domainId: 'addition',
    levelsCount: 4,
    tags: ['genda phool', 'marigold', 'laddi', 'mala', 'independence day', 'school', 'addition']
  },

  // --- SUBTRACTION GAMES ---
  {
    id: 'vanishing-buttons',
    name: "Natkhat Bandar Aur Button",
    component: vanishingButtonsModule.Component,
    icon: '🐒',
    domainId: 'subtraction',
    levelsCount: 3,
    tags: ['bandar', 'natkhat', 'monkey', 'buttons', 'kurta', 'subtraction', 'zero']
  },
  {
    id: 'school-bus',
    name: "Chhuk-Chhuk School Bus",
    component: schoolBusModule.Component,
    icon: '🚌',
    domainId: 'subtraction',
    levelsCount: 2,
    tags: ['school bus', 'panch bachhe', 'five children', 'countdown', 'subtraction', 'poem']
  },
  {
    id: 'trick-or-think',
    name: "Gubbarewala Chacha",
    component: trickOrThinkModule.Component,
    icon: '🎈',
    domainId: 'subtraction',
    levelsCount: 5,
    tags: ['gubbarewala', 'balloons', 'mela', 'take away', 'flying balloons', 'counting', 'subtraction']
  },
  {
    id: 'frog-hop',
    name: "Mendhak Ki Chhalang",
    component: frogHopModule.Component,
    icon: '🐸',
    domainId: 'subtraction',
    levelsCount: 5,
    tags: ['mendhak', 'chhalang', 'frog hop', 'lotus pond', 'lily pads', 'kamal', 'number line']
  },

  // --- COORDINATE GEOMETRY (STORIES 1 TO 4 UNIFIED IN ONE MODULE) ---
  {
    id: 'coordinate-geometry-zero',
    name: "Coordinate Geometry: From Zero",
    component: coordinateGeometryZeroModule.Component,
    icon: '📐',
    domainId: 'coordinate-geometry',
    levelsCount: 4,
    tags: [
      'coordinate geometry',
      'from zero',
      'cartesian plane',
      'classroom grid',
      'fish market',
      'rahul exam',
      'topper strategy',
      'raju kirana',
      'robbery mystery',
      'samosa party',
      'budget',
      'linear equations',
      'y=mx+c',
      'intersection',
      'collinear',
      'geogebra'
    ]
  }
];
