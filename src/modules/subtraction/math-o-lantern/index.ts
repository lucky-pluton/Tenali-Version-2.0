import MathOLanternGame from './MathOLanternGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const mathOLanternModule: GameModule = {
  spec: spec as any,
  Component: MathOLanternGame
};

export default mathOLanternModule;
export { MathOLanternGame, spec };
