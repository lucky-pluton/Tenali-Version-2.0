# Five Little Children — Open Specification

## 1. Overview & Learning Objectives
* **Module ID:** `subtraction.school-bus`
* **FLN Code:** `FLN-NUM-SUB-COUNTDOWN`
* **NCERT Alignment:** Grade 1 Mathematics (*Five Little Children Rhyme & Subtraction*)
* **Core Concept:** Sequential backward countdown ($5 \rightarrow 0$) integrating musical rhyme meter with arithmetic decrementing.

## 2. Pedagogical Framework
1. **Interactive Yellow Bus Manipulative:** Visual passenger seats inside the school bus showing kids leaving at each bus stop.
2. **Rhyme Meter Integration:** *"Five little children, raise your hand! Here comes your stand. One steps out with a roar... Now we are four!"*
3. **Zero Reinforcement:** At the final stop, *"Now there are none!"* directly teaches the numerical equivalence of *none* to *zero (0)*.

## 3. State Machine & Transitions
```
[Stop Arrival] ➔ [Read Rhyme Verse] ➔ [Child Disembarks] ➔ [Enter Remaining Kids] ➔ [Advance Stop] ➔ [Celebration Modal]
```

## 4. Level Progression
* **Level 1 (Rhyme Bus):** 1 child leaves per stop ($5 \rightarrow 4 \rightarrow 3 \rightarrow 2 \rightarrow 1 \rightarrow 0$).
* **Level 2 (Excursion Bus):** Multi-child exits ($10 - 2 = 8, 8 - 3 = 5, 5 - 2 = 3, 3 - 3 = 0$).
