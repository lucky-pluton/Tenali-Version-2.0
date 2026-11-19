# Sum 7 Dice Game — Open Specification

## 1. Overview & Learning Objectives
* **Module ID:** `counting-logic.sum7-dice`
* **FLN Code:** `FLN-NUM-SPATIAL-DICE7`
* **NCERT Alignment:** Grade 1 & 2 Mathematics (*3D Shapes, Solid Geometry & Dice Faces*)
* **Core Concept:** Standard six-sided dice invariant ($\text{Face} + \text{Opposite Face} = 7$) and 3D spatial orientation.

## 2. Pedagogical Framework
1. **Interactive Polyhedral Model:** Rolling a 3D isometric die with realistic pip placement.
2. **The Invariant Law of Dice:** Directly demonstrates that across every orientation, $\text{Top} + \text{Bottom} = 7$.
3. **Algebraic Deduction:** Prompts children to deduce the unseen face: $\text{Bottom} = 7 - \text{Top}$.

## 3. State Machine & Transitions
```
[Roll Die] ➔ [Top Face Revealed] ➔ [Predict Hidden Bottom Face] ➔ [Animate Inversion] ➔ [Verify 7-Sum] ➔ [Track Discovered Pairs] ➔ [Celebration Modal]
```

## 4. Level Progression
* **Level 1 (Discovery):** Guided roll and predict ($1+6, 2+5, 3+4$).
* **Level 2 (Speed Matcher):** Rapid complementary recall.
* **Level 3 (Mystery Detective):** Multi-dice hidden orientations.
