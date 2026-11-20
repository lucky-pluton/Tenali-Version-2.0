import MarigoldMagicGame from './MarigoldMagicGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const marigoldMagicModule: GameModule = {
  spec: spec as any,
  Component: MarigoldMagicGame
};

export default marigoldMagicModule;
export { MarigoldMagicGame, spec };
