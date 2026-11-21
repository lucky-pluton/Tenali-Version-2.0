import RahulExamGame from './RahulExamGame';
import { GameModule } from '../../../types';

const rahulExamModule: GameModule = {
  spec: {
    $schema: "https://tenali.fun/schemas/openspec-v1.json",
    specVersion: "1.0.0",
    id: "coordinate-geometry.rahul-exam",
    name: "Rahul Ki Night-Before Exam Strategy",
    domain: "Coordinate Geometry",
    competencyCode: "MATH-COORD-02",
    competency: "Linear equations in two variables (y = mx + c), slope as rate of change, y-intercept as initial value, and real-world optimization",
    targetAge: "Ages 8-14 (Grades 5-9)",
    ncertStandard: "NCERT Class 9 Mathematics Chapter 4: Linear Equations in Two Variables",
    overview: "Rahul plans his night-before exam prep using y = 5x. When he discovers 10 questions already known, the equation shifts to y = 5x + 10. Adjust study rate slope m to calculate sleep time before exam.",
    learningOutcomes: [
      "Understand linear equation y = mx + c",
      "Interpret slope m as rate (questions per hour)",
      "Interpret y-intercept c as initial value",
      "Calculate sleep hours vs study time trade-offs"
    ],
    levels: [
      { level: 1, name: "Night-Before Prep", description: "Explore y = 5x, y = 5x + 10, and sleep trade-offs", range: "0-40 Questions" }
    ],
    stateMachine: ["plan_a_rate", "plan_b_intercept", "plan_c_slope_sleep", "celebrate_topper"]
  } as any,
  Component: RahulExamGame
};

export default rahulExamModule;
export { RahulExamGame };
