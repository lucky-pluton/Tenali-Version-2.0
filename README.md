# Tenali Version 2.0 🧒✨

[![Live Preview](https://img.shields.io/badge/UI%2FUX-tenali.fun-E8864A?style=for-the-badge&logo=globe&logoColor=white)](https://tenali.fun)
[![OpenSpec Standard](https://img.shields.io/badge/OpenSpec-v1.0.0-38BDF8?style=for-the-badge&logo=json&logoColor=white)](#openspec-v10-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-5CB87A?style=for-the-badge)](LICENSE)

**Tenali Version 2.0** is an interactive educational mathematics and logic platform for children (Ages 5–9 / Grades 1–3). Built directly on the visual and interaction design language of [tenali.fun](https://tenali.fun), it transforms foundational mathematics (NCERT & Foundational Literacy and Numeracy - FLN) into playful, tactile, story-driven game modules.

Every module is strictly **segregated** into its own domain package with a formal **OpenSpec v1.0** specification, multi-level progression, and concrete-to-abstract manipulatives.

---

## 🌟 Modules & Games

### 1. ➕ Addition & Number Bonds
* **🍬 Aarav's Gulab Jamun Adventure** (`src/modules/addition/aarav-jamun/`)
  * *FLN Code:* `FLN-NUM-ADD-01`
  * *Levels:* 3 (Birthday Party $\rightarrow$ Family Feast $\rightarrow$ Grand Feast)
  * *Pedagogy:* Cumulative multi-addend story addition ($a + b + c + d = \text{Total}$) with feeding animations, sweet plate manipulatives, and chewing sound effects.
* **📿 Make My Bracelet — Number Bonds to 10** (`src/modules/addition/riya-bracelet/`)
  * *FLN Code:* `FLN-NUM-BONDS-10`
  * *Levels:* 3 (The Bead Shop $\rightarrow$ Room Hunt $\rightarrow$ 20-Bead Necklace)
  * *Pedagogy:* Missing addend discovery ($N + ? = 10$) with an interactive circular SVG bracelet that strings beads in real-time.
* **🎡 Konark Sun Chariot Wheels** (`src/modules/addition/sun-chariot/`)
  * *FLN Code:* `FLN-NUM-FACT-FAM`
  * *Levels:* 3 (Hub 7 $\rightarrow$ Hub 8 $\rightarrow$ Konark Hub 9)
  * *Pedagogy:* Radial number decomposition and commutative fact families ($a + b = \text{Hub}$).

### 2. ➖ Subtraction & Concept of Zero
* **🐒 Vanishing Buttons — Gola Monkey & Zero** (`src/modules/subtraction/vanishing-buttons/`)
  * *FLN Code:* `FLN-NUM-SUB-ZERO`
  * *Levels:* 3 (4-Button Shirt $\rightarrow$ Garden Party $\rightarrow$ Subtraction Detective)
  * *Pedagogy:* Subtraction as removal/taking away. As Gola eats bananas, his belly grows and buttons pop off with a spring pop, culminating in the ontological discovery of **Zero (0)** as *none*.
* **🚌 Five Little Children — School Bus Countdown** (`src/modules/subtraction/school-bus/`)
  * *FLN Code:* `FLN-NUM-SUB-COUNTDOWN`
  * *Levels:* 2 (Rhyme Bus 5 $\rightarrow$ Excursion Tour Bus 10)
  * *Pedagogy:* Action rhyming and backward countdown ($5-1=4 \dots 1-1=0$) with an interactive yellow school bus and scenic stop milestones.

### 3. 🎲 Counting & Spatial Logic
* **🌋 Lava Hop Adventure — Stepping Stones** (`src/modules/counting-logic/lava-hop/`)
  * *FLN Code:* `FLN-NUM-COUNT-PATH`
  * *Levels:* 3 (Volcano Trail $\rightarrow$ Skip Hop by 2s $\rightarrow$ Multiples of 5)
  * *Pedagogy:* Stepping-stone hopscotch path, 1-to-1 counting correspondence, skip counting, and set cardinality.
* **🎲 Sum 7 Dice Game — The Magic Pair** (`src/modules/counting-logic/sum7-dice/`)
  * *FLN Code:* `FLN-NUM-SPATIAL-DICE7`
  * *Levels:* 3 (Magic 7 Discovery $\rightarrow$ Fast Pair Solver $\rightarrow$ Hidden Face Detective)
  * *Pedagogy:* 3D spatial rotation and the universal die invariant: $\text{Top} + \text{Bottom} = 7$.

---

## 📐 OpenSpec v1.0 Architecture

Every module is completely self-contained within `src/modules/<domain>/<module-name>/`:

```
<module-name>/
├── <GameComponent>.jsx   # Interactive React 19 UI & game mechanics
├── spec.json             # Machine-readable OpenSpec v1.0 manifest
├── SKILL.md              # Formal human-readable pedagogical specification
└── index.js              # Standard export { spec, Component }
```

### Spec Schema
Each `spec.json` defines:
```json
{
  "$schema": "https://tenali.fun/schemas/openspec-v1.json",
  "specVersion": "1.0.0",
  "id": "addition.aarav-jamun",
  "name": "Aarav's Gulab Jamun Adventure",
  "domain": "Addition & Multi-Addend Sums",
  "competencyCode": "FLN-NUM-ADD-01",
  "targetAge": "Ages 5-8 (Grades 1-2)",
  "ncertStandard": "Grade 1 Mathematics: Joyful Mathematics Chapter 4",
  "learningOutcomes": [...],
  "levels": [...],
  "stateMachine": [...]
}
```

An interactive **"OpenSpec"** badge is available in both the game hub and within each game's top navigation bar, allowing teachers and developers to inspect the underlying learning specifications on the fly.

---

## 🎨 Design System & UI/UX

* **Typography:** `Source Serif 4` for titles/headers, `DM Sans` for body copy, `Fredoka` for playful numbers, and `Lexend` for dyslexia-friendly reading.
* **Palette:**
  * Dark Mode (Default): `#1a1614` (Espresso background), `#2c2622` (Card surface), `#ede8e3` (Ivory text), `#e8864a` (Terracotta accent).
  * Light Mode: `#f5f0eb` (Warm background), `#fffdf9` (Card surface), `#2c2420` (Dark text).
* **Audio Synthesizer:** Zero external audio dependencies. Uses Web Audio API oscillator synthesis for pops, munches, dice rolls, hops, chimes, and victory fanfares, with global sound toggle.

---

## 🚀 Getting Started

### Prerequisites
* Node.js $\ge 18$
* npm $\ge 9$

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/lucky-pluton/Tenali-Version-2.0.git
cd "Tenali-Version-2.0"

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📄 License
MIT License. Inspired by and created for the Tenali educational ecosystem.
