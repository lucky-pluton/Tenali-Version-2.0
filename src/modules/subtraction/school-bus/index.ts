import SchoolBusCountdownGame from './SchoolBusCountdownGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const schoolBusModule: GameModule = {
  spec: spec as any,
  Component: SchoolBusCountdownGame
};

export default schoolBusModule;
export { SchoolBusCountdownGame, spec };
