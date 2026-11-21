import FrogHopGame from './FrogHopGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const frogHopModule: GameModule = {
  spec: spec as any,
  Component: FrogHopGame
};

export default frogHopModule;
export { FrogHopGame, spec };
