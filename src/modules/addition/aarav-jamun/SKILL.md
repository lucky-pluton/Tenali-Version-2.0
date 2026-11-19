# Aarav's Gulab Jamun Adventure — Open Specification

## 1. Overview & Learning Objectives
* **Module ID:** `addition.aarav-jamun`
* **FLN Code:** `FLN-NUM-ADD-01`
* **NCERT Alignment:** Grade 1 Mathematics, Chapter 4 (*Adding Treats & Story Sums*)
* **Core Concept:** Cumulative multi-addend addition ($a + b + c + d = \text{Total}$) grounded in real-life storytelling.

## 2. Pedagogical Framework
1. **Concrete Manipulation:** Children see visual gulab jamuns placed onto the sweet plate with playful chewing sound effects.
2. **Pictorial Representation:** Each family member (Mother, Father, Sister, Friend) corresponds to a comic panel with $+N$ badge.
3. **Abstract Mathematics:** The child completes the full equation $\square + \square + \square + \square = \text{Total}$ using number pads.

## 3. State Machine & Transitions
```
[Setup / Intro] ➔ [Feeding Turn (1..4)] ➔ [Full Belly Dialog] ➔ [Equation Entry] ➔ [Celebration Modal]
```

## 4. Level Progression
* **Level 1 (Birthday Party):** $+1$ per person, total $\le 5$.
* **Level 2 (Family Feast):** $+2, +3, +1, +2$, total $\le 10$.
* **Level 3 (Mega Sweet Challenge):** Larger addends up to $20$.
