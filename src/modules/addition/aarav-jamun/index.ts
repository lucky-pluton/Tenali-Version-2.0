import AaravGulabJamunGame from './AaravGulabJamunGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const aaravJamunModule: GameModule = {
  spec: spec as any,
  Component: AaravGulabJamunGame
};

export default aaravJamunModule;
export { AaravGulabJamunGame, spec };
