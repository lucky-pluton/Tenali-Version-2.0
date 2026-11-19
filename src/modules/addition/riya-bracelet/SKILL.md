# Make My Bracelet — Open Specification

## 1. Overview & Learning Objectives
* **Module ID:** `addition.riya-bracelet`
* **FLN Code:** `FLN-NUM-BONDS-10`
* **NCERT Alignment:** Grade 1 & 2 Mathematics (*Making Tens & Number Bonds*)
* **Core Concept:** Number bonds to 10 ($N + ? = 10$) using an interactive circular bracelet string.

## 2. Pedagogical Framework
1. **Visual Ring Manipulative:** A circular SVG bracelet with colored bead slots shows both present and missing beads.
2. **Missing Addend Model:** Formalizes $N + \square = 10$, preventing the common misconception that the equals sign only means "perform addition".
3. **Overfill / Underfill Feedback:** If a child enters a number that is too large or too small, the system explains: *"Too many beads! $3 + 8 = 11$ (1 leftover). We want exactly 10!"*

## 3. State Machine & Transitions
```
[Prompt Setup] ➔ [Select Bead Jar / Number] ➔ [Animate Bead String] ➔ [Check Target] ➔ [Celebration Modal]
```

## 4. Level Progression
* **Level 1 (The Bead Shop):** Basic pairs to 10 ($3+7, 7+3, 4+6, 8+2$).
* **Level 2 (Room Hunt):** Story search (Under Table, Behind Plant, Toy Box).
* **Level 3 (20-Bead Necklace):** Advanced bonds to 20 ($14+6, 11+9, 16+4$).
