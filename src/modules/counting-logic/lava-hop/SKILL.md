# Lava Hop Adventure — Open Specification

## 1. Overview & Learning Objectives
* **Module ID:** `counting-logic.lava-hop`
* **FLN Code:** `FLN-NUM-COUNT-PATH`
* **NCERT Alignment:** Grade 1 & 2 Mathematics (*Counting, Number Line Hop & Skip Counting*)
* **Core Concept:** Linear path traversal, 1-to-1 counting correspondence, and skip counting patterns.

## 2. Pedagogical Framework
1. **Interactive Hopscotch Track:** White stones (Safe) alternating with red tiles (Lava).
2. **Audio-Kinesthetic Feedback:** Tapping safe stones produces a spring hop sound (`playHop()`), prompting verbal recitation ($1, 2, 3 \dots$).
3. **Cardinality Verification:** After reaching the `FINISH` line, child reflects on set cardinality: *"How many safe blocks did you hop on?"*

## 3. State Machine & Transitions
```
[Start Flag] ➔ [Hop on Safe Stone] ➔ [Dodge Lava Check] ➔ [Reach Finish] ➔ [Answer Total Count] ➔ [Celebration Modal]
```

## 4. Level Progression
* **Level 1 (Trail):** Mixed safe/lava sequence of 10 stones.
* **Level 2 (Skip Hop by 2s):** Evens: $2, 4, 6, 8, 10, 12$.
* **Level 3 (Skip Hop by 5s):** Multiples: $5, 10, 15, 20, 25$.
