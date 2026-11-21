/**
 * MODULE REGISTRY
 * Aggregates all game modules with clean, friendly titles and strict TypeScript types
 */

import React from 'react';
import GulabJamunEmoji from './components/GulabJamunEmoji';
import aaravJamunModule from './modules/addition/aarav-jamun';
import riyaBraceletModule from './modules/addition/riya-bracelet';
import sunChariotModule from './modules/addition/sun-chariot';
import marigoldMagicModule from './modules/addition/marigold-magic';

import vanishingButtonsModule from './modules/subtraction/vanishing-buttons';
import schoolBusModule from './modules/subtraction/school-bus';
import trickOrThinkModule from './modules/subtraction/trick-or-think';
import mathOLanternModule from './modules/subtraction/math-o-lantern';
import polotasticModule from './modules/subtraction/polotastic';

import lavaHopModule from './modules/counting-logic/lava-hop';
import sum7DiceModule from './modules/counting-logic/sum7-dice';
import feedMonsterModule from './modules/counting-logic/feed-monster';

import { GameCard } from './types';

export const MODULE_REGISTRY: GameCard[] = [
  {
    id: 'feed-monster',
    name: "Feed Kumbhakarna!",
    component: feedMonsterModule.Component,
    icon: '👹',
    domainId: 'counting-logic',
    levelsCount: 5,
    tags: ['kumbhakarna', 'multilingual-cuisine', 'puri-sabzi', 'dosa-idli', 'dhokla', 'feast', 'counting']
  },
  {
    id: 'aarav-jamun',
    name: "Aarav's Gulab Jamuns",
    component: aaravJamunModule.Component,
    icon: React.createElement(GulabJamunEmoji, { size: 54, variant: 'bowl' }),
    domainId: 'addition',
    levelsCount: 3,
    tags: ['addition', 'story', 'food', 'sweets', 'gulab jamun', 'gulab-jamun']
  },
  {
    id: 'riya-bracelet',
    name: "Riya's Bracelet",
    component: riyaBraceletModule.Component,
    icon: '📿',
    domainId: 'addition',
    levelsCount: 4,
    tags: ['number bonds', 'making 10', 'beads', 'riya']
  },
  {
    id: 'sun-chariot',
    name: "Sun Chariot Wheel",
    component: sunChariotModule.Component,
    icon: '🎡',
    domainId: 'addition',
    levelsCount: 3,
    tags: ['wheel', 'pairs', 'fact families']
  },
  {
    id: 'marigold-magic',
    name: "Marigold Magic – Decorate the School!",
    component: marigoldMagicModule.Component,
    icon: '🌼',
    domainId: 'addition',
    levelsCount: 4,
    tags: ['addition', 'counting', 'marigold', 'flowers', 'independence day', 'garland', 'laddi', 'school']
  },
  {
    id: 'vanishing-buttons',
    name: "Vanishing Buttons",
    component: vanishingButtonsModule.Component,
    icon: '🐒',
    domainId: 'subtraction',
    levelsCount: 3,
    tags: ['subtraction', 'zero', 'monkey', 'buttons']
  },
  {
    id: 'school-bus',
    name: "Five Little Children",
    component: schoolBusModule.Component,
    icon: '🚌',
    domainId: 'subtraction',
    levelsCount: 2,
    tags: ['subtraction', 'bus', 'school bus', 'five little children', 'countdown', 'poem', 'ncert']
  },
  {
    id: 'trick-or-think',
    name: "Gubbarewala: The Flying Balloons",
    component: trickOrThinkModule.Component,
    icon: '🎈',
    domainId: 'subtraction',
    levelsCount: 5,
    tags: ['subtraction', 'balloons', 'gubbarewala', 'take away', 'flying balloons', 'counting', 'easy', 'mela']
  },
  {
    id: 'math-o-lantern',
    name: "Math O' Lantern: Jump & Count-Up",
    component: mathOLanternModule.Component,
    icon: '🏮',
    domainId: 'subtraction',
    levelsCount: 5,
    tags: ['subtraction', 'counting up', 'number line', 'friendly numbers', 'benchmark jumps', 'sandbox']
  },
  {
    id: 'polotastic',
    name: "Polotastic: Bundles & Unrolling",
    component: polotasticModule.Component,
    icon: '🍬',
    domainId: 'subtraction',
    levelsCount: 5,
    tags: ['subtraction', 'base 10', 'place value', 'bundles', 'unrolling', 'rolls', 'packets']
  },
  {
    id: 'lava-hop',
    name: "Lava Hop",
    component: lavaHopModule.Component,
    icon: '🌋',
    domainId: 'counting-logic',
    levelsCount: 3,
    tags: ['counting', 'lava', 'hopscotch']
  },
  {
    id: 'sum7-dice',
    name: "Magic Seven Discovery",
    component: sum7DiceModule.Component,
    icon: '🎲',
    domainId: 'counting-logic',
    levelsCount: 3,
    tags: ['dice', 'magic 7', 'mystery', 'logic']
  }
];
