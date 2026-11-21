import TrickOrThinkGame from './TrickOrThinkGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const trickOrThinkModule: GameModule = {
  spec: spec as any,
  Component: TrickOrThinkGame
};

export default trickOrThinkModule;
export { TrickOrThinkGame, spec };
