import PolotasticGame from './PolotasticGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const polotasticModule: GameModule = {
  spec: spec as any,
  Component: PolotasticGame
};

export default polotasticModule;
export { PolotasticGame, spec };
