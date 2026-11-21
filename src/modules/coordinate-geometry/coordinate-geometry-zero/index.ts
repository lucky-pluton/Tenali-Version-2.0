import CoordinateGeometryFromZeroGame from './CoordinateGeometryFromZeroGame';
import spec from './spec.json';
import { GameModule } from '../../../types';

export const coordinateGeometryZeroModule: GameModule = {
  spec: spec as any,
  Component: CoordinateGeometryFromZeroGame
};

export default coordinateGeometryZeroModule;
