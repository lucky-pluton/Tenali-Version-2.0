import VanishingButtonsGame from './VanishingButtonsGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const vanishingButtonsModule: GameModule = {
  spec: spec as any,
  Component: VanishingButtonsGame
};

export default vanishingButtonsModule;
export { VanishingButtonsGame, spec };
