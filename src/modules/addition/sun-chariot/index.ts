import SunChariotWheelGame from './SunChariotWheelGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const sunChariotModule: GameModule = {
  spec: spec as any,
  Component: SunChariotWheelGame
};

export default sunChariotModule;
export { SunChariotWheelGame, spec };
