# Graph Report - dristi  (2026-09-02)

## Corpus Check
- Corpus is ~45,802 words - fits in a single context window. You may not need a graph.

## Summary
- 188 nodes · 410 edges · 17 communities (13 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 1,200 input · 800 output

## Community Hubs (Navigation)
- Navigation & Controls
- Build & Dependencies Config
- Celebration & Memory Sections
- App Core & Atmospheric Canvas
- External Runtime Libraries
- Hero & Visual Constellations
- Live Site Editor & Customizer
- Timeline & Milestone Quiz
- Interactive Memory Map
- Time Capsule & Countdown
- Linter & React Rules
- System Documentation & Feature Specs
- Anniversary Elapsed Timer
- Web Entrypoint & Brand Asset
- Favicon Asset
- SVG Icons Asset

## God Nodes (most connected - your core abstractions)
1. `useCouple()` - 49 edges
2. `react` - 30 edges
3. `useSound()` - 30 edges
4. `spawnHearts()` - 17 edges
5. `compressImages()` - 8 edges
6. `Editor()` - 7 edges
7. `RomanticParticle` - 6 edges
8. `scripts` - 5 edges
9. `AnniversaryCake()` - 5 edges
10. `Countdown()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `HTML Document and Font Loader Entrypoint` --references--> `Heart Visual SVG Asset`  [EXTRACTED]
  index.html → public/heart.svg
- `Hero()` --calls--> `useCouple()`  [EXTRACTED]
  src/App.jsx → src/CoupleContext.jsx
- `MainApp()` --calls--> `useCouple()`  [EXTRACTED]
  src/App.jsx → src/CoupleContext.jsx
- `AnniversaryCake()` --calls--> `useCouple()`  [EXTRACTED]
  src/components/AnniversaryCake.jsx → src/CoupleContext.jsx
- `Countdown()` --calls--> `useCouple()`  [EXTRACTED]
  src/components/Countdown.jsx → src/CoupleContext.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Interactive Romance Experiences** — readme_love_meter_spec, readme_constellation_spec, readme_quiz_spec [INFERRED 0.85]

## Communities (17 total, 3 thin omitted)

### Community 0 - "Navigation & Controls"
Cohesion: 0.13
Nodes (19): plugins, oxc, react, FloatingNav(), NAV_SECTIONS, DreamCard(), DEFAULT_LABELS, LoveMeter() (+11 more)

### Community 1 - "Build & Dependencies Config"
Cohesion: 0.08
Nodes (24): oxlint, devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, vite (+16 more)

### Community 2 - "Celebration & Memory Sections"
Cohesion: 0.14
Nodes (13): AnniversaryCake(), ForeverSection(), DEFAULT_HEARTBEAT_MESSAGES, HeartbeatSection(), HeartCanvas(), PALETTES, RomanticParticle, spawnHearts() (+5 more)

### Community 3 - "App Core & Atmospheric Canvas"
Cohesion: 0.19
Nodes (10): App(), AtmosphericBackground(), generateParticles(), CoupleInitials(), KissButton(), CoupleContext, CoupleProvider(), couple (+2 more)

### Community 4 - "External Runtime Libraries"
Cohesion: 0.12
Nodes (17): firebase, framer-motion, leaflet, lucide-react, dependencies, firebase, framer-motion, leaflet (+9 more)

### Community 5 - "Hero & Visual Constellations"
Cohesion: 0.22
Nodes (11): Hero(), MainApp(), Constellation(), FutureDreams(), MemoryCarousel(), PhotoGallery(), PolaroidWall(), useCouple() (+3 more)

### Community 6 - "Live Site Editor & Customizer"
Cohesion: 0.22
Nodes (11): CONSTELLATION_PRESETS, Editor(), POPULAR_CITIES, sanitizeForFirestore(), toDisplayDateFormat(), toInputDateFormat(), app, db (+3 more)

### Community 7 - "Timeline & Milestone Quiz"
Cohesion: 0.22
Nodes (5): DEFAULT_QUIZ_QUESTIONS, OPTION_LETTERS, QUIZ_SCATTER_HEARTS, Timeline(), TimelineQuizCard()

### Community 8 - "Interactive Memory Map"
Cohesion: 0.33
Nodes (4): DEFAULT_MAP_LOCATIONS, heartIcon(), LoveMap(), Markers()

### Community 9 - "Time Capsule & Countdown"
Cohesion: 0.38
Nodes (6): CountdownGrid, FLOATING_HEARTS, getCountdown(), pad(), STATIC_STARS, TimeCapsule()

### Community 10 - "Linter & React Rules"
Cohesion: 0.33
Nodes (5): rules, react/only-export-components, react/rules-of-hooks, $schema, warn

### Community 11 - "System Documentation & Feature Specs"
Cohesion: 0.33
Nodes (6): Orbiting Constellation Feature Specification, Live Customizer In-App Editor Specification, Love Meter Feature Specification, Sophia & Dev - Our Shared Journey Overview, Interactive Quiz Feature Specification, Web Audio API Synthesizer Architecture Specification

### Community 12 - "Anniversary Elapsed Timer"
Cohesion: 0.60
Nodes (3): Countdown(), getElapsed(), pad()

## Knowledge Gaps
- **58 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+53 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 70 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Navigation & Controls` to `Celebration & Memory Sections`, `App Core & Atmospheric Canvas`, `Hero & Visual Constellations`, `Live Site Editor & Customizer`, `Timeline & Milestone Quiz`, `Interactive Memory Map`, `Time Capsule & Countdown`, `Anniversary Elapsed Timer`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `useCouple()` connect `Hero & Visual Constellations` to `Navigation & Controls`, `Celebration & Memory Sections`, `App Core & Atmospheric Canvas`, `Live Site Editor & Customizer`, `Timeline & Milestone Quiz`, `Interactive Memory Map`, `Time Capsule & Countdown`, `Anniversary Elapsed Timer`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `plugins` connect `Navigation & Controls` to `Linter & React Rules`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _58 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Navigation & Controls` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
- **Should `Build & Dependencies Config` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Celebration & Memory Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._
## Backend Health & Services Audit
- **Cloud Firestore (db)**: Active & Healthy. Read, write, and delete tested successfully on /configs.
- **JSONBlob Cloud API**: Failing (HTTP 403). Requests automatically fall back to Firestore.
- **Firebase Storage (storage)**: Exported in src/firebase.js but unreferenced (dead code). Media is encoded as base64 in Firestore documents.
- **Payload Constraint**: Firestore 1MB document limit applies to base64 images saved in couple configurations.


### Animation Upgrade: KissButton (Anti-Gravity & Spring Physics)
- **Component**: src/components/KissButton.jsx
- **Pillar 1 (Weightlessness & Easing)**: Replaced standard ease-in/out with Apple standard cubic-bezier(0.16, 1, 0.3, 1) and physical spring kinematics (mass: 0.5, stiffness: 350, damping: 22).
- **Pillar 5 (Magnetic Interactivity)**: Implemented MagneticButton with dynamic cursor tracking (useMotionValue + useSpring) that pulls toward the cursor and oscillates back to resting state.
- **Pillar 2 (Depth & Drop Shadows)**: Multi-layered diffused drop shadows and living aura pulse.
- **Accessibility**: Full useReducedMotion fallback gating.


### UI/UX Overhaul: Site Customizer (`src/Editor.jsx`)
- **Pillar 4 (Palette & Advanced Glassmorphism)**: Replaced hacky 120-line inline `<style>` overrides with native obsidian dark theme (`#08070B`), multi-tier diffused drop shadows, and 28px blurred glassmorphic cards (`rgba(255, 255, 255, 0.03)`).
- **Pillar 1 (Kinetic Easing & Motion)**: Implemented Framer Motion `layoutId="activeTabPill"` for organic FLIP sliding tab navigation, paired with `<AnimatePresence mode="wait">` and Apple standard easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Pillar 5 (Micro-interactions)**: Floating glass action dock centered at bottom (`fixed bottom-6`), spring-animated save feedback, and direct Firestore saving with sub-second response.
- **Form Architecture**: Clean, reusable `InputField`, `TextAreaField`, and repeater card components across all 5 sections.


### Typography, Spacing & Form Controls Polish (`src/Editor.jsx`)
- **Pillar 2 (Extreme Whitespace & Breathing Room)**: Upgraded section padding (`p-7 sm:p-9 md:p-10`), form element gaps (`space-y-6 sm:space-y-7`), and sub-card margins to give every field physical volume and floating depth.
- **Pillar 3 (Typography as Architecture)**: Display headings formatted with fluid serif typography (`text-2xl sm:text-[26px] font-serif tracking-wide`), uppercase tracking labels (`text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#EAD6C3]/90`), and monospace badges.
- **Pillars 4 & 5 (Luxury Text Boxes & Inputs)**:
  - Deep obsidian input background (`bg-[#0D0A14]/70 hover:bg-[#120D1C]/80 focus:bg-[#150F21]`).
  - Inset shadow depth: `shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.04)]`.
  - Focused champagne/rose bloom: `focus:border-[#EAD6C3] focus:ring-2 focus:ring-[#EAD6C3]/25 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0_20px_rgba(234,214,195,0.15)]`.
  - Roomier padding: `px-4.5 py-3 sm:py-3.5` with legible `text-[14px] sm:text-[15px]` body typography.
