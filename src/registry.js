/**
 * TENALI 2.0 OPEN SPEC MODULE REGISTRY
 * Aggregates all segregated domain modules and validates them against OpenSpec v1.0
 */

import { validateOpenSpec } from './core/specSchema';

// Module imports from segregated folders
import aaravJamunModule from './modules/addition/aarav-jamun';
import riyaBraceletModule from './modules/addition/riya-bracelet';
import sunChariotModule from './modules/addition/sun-chariot';

import vanishingButtonsModule from './modules/subtraction/vanishing-buttons';
import schoolBusModule from './modules/subtraction/school-bus';

import lavaHopModule from './modules/counting-logic/lava-hop';
import sum7DiceModule from './modules/counting-logic/sum7-dice';

export const MODULE_REGISTRY = [
  {
    ...aaravJamunModule.spec,
    component: aaravJamunModule.Component,
    icon: '🍬',
    domainId: 'addition',
    tags: ['addition', 'story', 'food', 'multi-addend']
  },
  {
    ...riyaBraceletModule.spec,
    component: riyaBraceletModule.Component,
    icon: '📿',
    domainId: 'addition',
    tags: ['number bonds', 'making 10', 'beads', 'missing addend']
  },
  {
    ...sunChariotModule.spec,
    component: sunChariotModule.Component,
    icon: '🎡',
    domainId: 'addition',
    tags: ['wheels', 'pairs', 'fact families', 'chariot']
  },
  {
    ...vanishingButtonsModule.spec,
    component: vanishingButtonsModule.Component,
    icon: '🐒',
    domainId: 'subtraction',
    tags: ['subtraction', 'zero', 'story', 'monkey', 'buttons']
  },
  {
    ...schoolBusModule.spec,
    component: schoolBusModule.Component,
    icon: '🚌',
    domainId: 'subtraction',
    tags: ['subtraction', 'rhymes', 'countdown', 'bus']
  },
  {
    ...lavaHopModule.spec,
    component: lavaHopModule.Component,
    icon: '🌋',
    domainId: 'counting-logic',
    tags: ['counting', 'skip counting', 'lava', 'number line']
  },
  {
    ...sum7DiceModule.spec,
    component: sum7DiceModule.Component,
    icon: '🎲',
    domainId: 'counting-logic',
    tags: ['dice', 'spatial reasoning', 'sum 7', 'logic']
  }
];

// Perform OpenSpec validation
MODULE_REGISTRY.forEach(m => {
  validateOpenSpec(m);
});
