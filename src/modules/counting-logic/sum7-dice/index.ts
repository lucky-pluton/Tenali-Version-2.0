import Sum7DiceGame from './Sum7DiceGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const sum7DiceModule: GameModule = {
  spec: spec as any,
  Component: Sum7DiceGame
};

export default sum7DiceModule;
export { Sum7DiceGame, spec };
