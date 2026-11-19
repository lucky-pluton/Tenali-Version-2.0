/**
 * MODULE REGISTRY
 * Aggregates all game modules with clean, friendly titles
 */

import aaravJamunModule from './modules/addition/aarav-jamun';
import riyaBraceletModule from './modules/addition/riya-bracelet';
import sunChariotModule from './modules/addition/sun-chariot';

import vanishingButtonsModule from './modules/subtraction/vanishing-buttons';
import schoolBusModule from './modules/subtraction/school-bus';

import lavaHopModule from './modules/counting-logic/lava-hop';
import sum7DiceModule from './modules/counting-logic/sum7-dice';
import feedMonsterModule from './modules/counting-logic/feed-monster';

export const MODULE_REGISTRY = [
  {
    id: 'feed-monster',
    name: "Feed the Monster!",
    component: feedMonsterModule.Component,
    icon: '👹',
    domainId: 'counting-logic',
    levelsCount: 5,
    tags: ['monster', 'cakes', 'bakery', 'counting', 'one-to-one']
  },
  {
    id: 'aarav-jamun',
    name: "Aarav's Gulab Jamuns",
    component: aaravJamunModule.Component,
    icon: '🍬',
    domainId: 'addition',
    levelsCount: 3,
    tags: ['addition', 'story', 'food', 'sweets']
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
    tags: ['subtraction', 'bus', 'countdown']
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
