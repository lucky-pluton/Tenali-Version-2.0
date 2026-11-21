import ClassroomGridGame from './ClassroomGridGame';
import { GameModule } from '../../../types';

const classroomGridModule: GameModule = {
  spec: {
    $schema: "https://tenali.fun/schemas/openspec-v1.json",
    specVersion: "1.0.0",
    id: "coordinate-geometry.classroom-grid",
    name: "Classroom Ka Fish Market: Coordinate Grid",
    domain: "Coordinate Geometry",
    competencyCode: "MATH-COORD-01",
    competency: "Cartesian coordinates plotting, ordered pairs (x, y), line trajectories, and collinearity",
    targetAge: "Ages 8-14 (Grades 5-9)",
    ncertStandard: "NCERT Class 9 Mathematics Chapter 3: Coordinate Geometry",
    overview: "PT teacher at (0,0), student desks on (row, seat). Plot Parth and Anish, track the eraser trajectory, and determine Amit's seat using straight line equations.",
    learningOutcomes: [
      "Understand Cartesian plane (x-axis as rows, y-axis as seats)",
      "Plot ordered pairs (x, y)",
      "Discover linear trajectories and collinearity",
      "Calculate linear equation y = mx + c"
    ],
    levels: [
      { level: 1, name: "Classroom Paper Bullet", description: "Parth (2,7), Anish (3,9), find Amit (1,5)", range: "Grid 5x10" }
    ],
    stateMachine: ["plot_parth", "plot_anish", "deduce_amit", "collinear_reveal"]
  } as any,
  Component: ClassroomGridGame
};

export default classroomGridModule;
export { ClassroomGridGame };
