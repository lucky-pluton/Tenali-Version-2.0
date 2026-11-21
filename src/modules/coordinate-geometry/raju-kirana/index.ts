import RajuKiranaGame from './RajuKiranaGame';
import { GameModule } from '../../../types';

const rajuKiranaModule: GameModule = {
  spec: {
    $schema: "https://tenali.fun/schemas/openspec-v1.json",
    specVersion: "1.0.0",
    id: "coordinate-geometry.raju-kirana",
    name: "Raju Kirana Bank Robbery: System of Equations",
    domain: "Coordinate Geometry",
    competencyCode: "MATH-COORD-03",
    competency: "Graphical solution of simultaneous linear equations in two variables and point of intersection",
    targetAge: "Ages 8-14 (Grades 5-9)",
    ncertStandard: "NCERT Class 9 Mathematics Chapter 4 & Class 10 Chapter 3: Pair of Linear Equations",
    overview: "Track a bank robbery suspect using daily receipts from Raju Kirana Store: x + y = 4, 2x + y = 8, 3x + y = 12. Plot the lines on the coordinate plane to discover the intersection point (4, 0).",
    learningOutcomes: [
      "Plot multiple linear equations on a single Cartesian plane",
      "Understand the intersection point as the simultaneous solution",
      "Interpret graphical coordinates in real-world contexts (chips and juice)",
      "Connect mathematics with forensic data analysis"
    ],
    levels: [
      { level: 1, name: "Raju Kirana Case", description: "Plot 3 receipt equations to find intersection (4, 0)", range: "x in [0,8], y in [0,14]" }
    ],
    stateMachine: ["plot_monday", "plot_tuesday", "plot_wednesday", "click_intersection", "solve_case"]
  } as any,
  Component: RajuKiranaGame
};

export default rajuKiranaModule;
export { RajuKiranaGame };
