import FeedTheMonsterGame from './FeedTheMonsterGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const feedMonsterModule: GameModule = {
  spec: spec as any,
  Component: FeedTheMonsterGame
};

export default feedMonsterModule;
export { FeedTheMonsterGame, spec };
export { default as KumbhakarnaFace } from './KumbhakarnaFace';
