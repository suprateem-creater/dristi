# Graph Report - dristi  (2026-09-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 193 nodes · 414 edges · 17 communities (12 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9f574c6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
1. `useCouple()` - 48 edges
2. `useSound()` - 30 edges
3. `react` - 30 edges
4. `spawnHearts()` - 17 edges
5. `compressImages()` - 8 edges
6. `Editor()` - 7 edges
7. `RomanticParticle` - 6 edges
8. `AnniversaryCake()` - 5 edges
9. `HeartbeatSection()` - 5 edges
10. `LoveLetter()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `HTML Document and Font Loader Entrypoint` --references--> `Heart Visual SVG Asset`  [EXTRACTED]
  index.html → public/heart.svg
- `DreamCard()` --calls--> `useSound()`  [EXTRACTED]
  src/components/FutureDreams.jsx → src/SoundContext.jsx
- `LoveCard()` --calls--> `useSound()`  [EXTRACTED]
  src/components/LoveReasons.jsx → src/SoundContext.jsx
- `Constellation()` --calls--> `useCouple()`  [EXTRACTED]
  src/components/Constellation.jsx → src/CoupleContext.jsx
- `CoupleInitials()` --calls--> `useCouple()`  [EXTRACTED]
  src/components/CoupleInitials.jsx → src/CoupleContext.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Interactive Romance Experiences** — readme_love_meter_spec, readme_constellation_spec, readme_quiz_spec [INFERRED 0.85]

## Communities (17 total, 4 thin omitted)

### Community 0 - "Navigation & Controls"
Cohesion: 0.10
Nodes (23): react, App(), AtmosphericBackground(), generateParticles(), Constellation(), CoupleInitials(), FloatingNav(), NAV_SECTIONS (+15 more)

### Community 1 - "Build & Dependencies Config"
Cohesion: 0.16
Nodes (21): Hero(), MainApp(), AnniversaryCake(), ForeverSection(), DEFAULT_HEARTBEAT_MESSAGES, HeartbeatSection(), PALETTES, spawnHearts() (+13 more)

### Community 2 - "Celebration & Memory Sections"
Cohesion: 0.08
Nodes (24): oxlint, devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/react, @types/react-dom, vite (+16 more)

### Community 3 - "App Core & Atmospheric Canvas"
Cohesion: 0.12
Nodes (17): firebase, framer-motion, leaflet, lucide-react, dependencies, firebase, framer-motion, leaflet (+9 more)

### Community 4 - "External Runtime Libraries"
Cohesion: 0.15
Nodes (12): CONSTELLATION_PRESETS, Editor(), POPULAR_CITIES, sanitizeForFirestore(), TABS, toDisplayDateFormat(), toInputDateFormat(), app (+4 more)

### Community 5 - "Hero & Visual Constellations"
Cohesion: 0.33
Nodes (6): MemoryCarousel(), PhotoGallery(), PolaroidWall(), compressImage(), compressImages(), formatFileSize()

### Community 6 - "Live Site Editor & Customizer"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 7 - "Timeline & Milestone Quiz"
Cohesion: 0.25
Nodes (4): DEFAULT_QUIZ_QUESTIONS, OPTION_LETTERS, QUIZ_SCATTER_HEARTS, Timeline()

### Community 8 - "Interactive Memory Map"
Cohesion: 0.33
Nodes (4): DEFAULT_MAP_LOCATIONS, heartIcon(), LoveMap(), Markers()

### Community 9 - "Time Capsule & Countdown"
Cohesion: 0.38
Nodes (6): CountdownGrid, FLOATING_HEARTS, getCountdown(), pad(), STATIC_STARS, TimeCapsule()

### Community 10 - "Linter & React Rules"
Cohesion: 0.33
Nodes (6): Orbiting Constellation Feature Specification, Live Customizer In-App Editor Specification, Love Meter Feature Specification, Sophia & Dev - Our Shared Journey Overview, Interactive Quiz Feature Specification, Web Audio API Synthesizer Architecture Specification

### Community 12 - "Anniversary Elapsed Timer"
Cohesion: 0.60
Nodes (3): Countdown(), getElapsed(), pad()

## Knowledge Gaps
- **59 isolated node(s):** `NAV_SECTIONS`, `BG_SPARKLES`, `DEFAULT_MESSAGES`, `STAR_CONFIG`, `CoupleContext` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 75 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Navigation & Controls` to `Build & Dependencies Config`, `External Runtime Libraries`, `Hero & Visual Constellations`, `Live Site Editor & Customizer`, `Timeline & Milestone Quiz`, `Interactive Memory Map`, `Time Capsule & Countdown`, `Anniversary Elapsed Timer`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `useCouple()` connect `Build & Dependencies Config` to `Navigation & Controls`, `External Runtime Libraries`, `Hero & Visual Constellations`, `Timeline & Milestone Quiz`, `Interactive Memory Map`, `Time Capsule & Countdown`, `Anniversary Elapsed Timer`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `plugins` connect `Live Site Editor & Customizer` to `Navigation & Controls`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `NAV_SECTIONS`, `BG_SPARKLES`, `DEFAULT_MESSAGES` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Navigation & Controls` be split into smaller, more focused modules?**
  _Cohesion score 0.10121951219512196 - nodes in this community are weakly interconnected._
- **Should `Celebration & Memory Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `App Core & Atmospheric Canvas` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._