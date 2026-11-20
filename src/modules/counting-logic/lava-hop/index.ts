import LavaHopGame from './LavaHopGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const lavaHopModule: GameModule = {
  spec: spec as any,
  Component: LavaHopGame
};

export default lavaHopModule;
export { LavaHopGame, spec };
