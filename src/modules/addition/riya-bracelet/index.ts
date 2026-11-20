import RiyaBraceletGame from './RiyaBraceletGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

const riyaBraceletModule: GameModule = {
  spec: spec as any,
  Component: RiyaBraceletGame
};

export default riyaBraceletModule;
export { RiyaBraceletGame, spec };
