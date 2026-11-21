import SamosaBudgetGame from './SamosaBudgetGame';
import { GameModule } from '../../../types';

const samosaBudgetModule: GameModule = {
  spec: {
    $schema: "https://tenali.fun/schemas/openspec-v1.json",
    specVersion: "1.0.0",
    id: "coordinate-geometry.samosa-budget",
    name: "School Canteen Ki Samosa Party: Cost Functions",
    domain: "Coordinate Geometry",
    competencyCode: "MATH-COORD-04",
    competency: "Linear cost functions C(x) = mx + c, input-output relationships, and linear inequalities in real-world budgeting",
    targetAge: "Ages 8-14 (Grades 5-9)",
    ncertStandard: "NCERT Class 9 Mathematics Chapter 4 & Class 11 Chapter 6: Linear Inequalities and Relations & Functions",
    overview: "Plan a samosa order with friends: samosas cost ₹12 each + ₹20 packaging fee. Express as cost function C(x) = 12x + 20 and solve 12x + 20 <= 200 to find the maximum affordable samosas.",
    learningOutcomes: [
      "Understand why a reusable mathematical rule is named a function C(x)",
      "Distinguish fixed costs (intercept) from variable per-unit costs (slope)",
      "Evaluate cost functions for various inputs",
      "Formulate and solve linear inequalities (12x + 20 <= 200)"
    ],
    levels: [
      { level: 1, name: "Samosa Budget Challenge", description: "C(x) = 12x + 20 and budget <= 200", range: "0 to 20 Samosas" }
    ],
    stateMachine: ["investigate_bill", "build_equation", "define_function", "solve_inequality"]
  } as any,
  Component: SamosaBudgetGame
};

export default samosaBudgetModule;
export { SamosaBudgetGame };
