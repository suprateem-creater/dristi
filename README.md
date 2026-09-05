# 🌹 Sophia & Dev — Our Shared Journey 💖

A premium, interactive, and beautifully animated dark-romantic digital scrapbook and website built to celebrate the shared memories, milestones, and love story of **Sophia** and **Dev**.

This web application combines rich aesthetics, smooth physics-based animations, customized synthesised sound effects, and an in-app **Live Customizer Editor** that allows you to personalize every detail on-the-fly.

---

## 🌟 Key Features & Interactive Experiences

### 1. 🌌 Atmospheric Night Sky Background
- A dark-romantic radial gradient background hosting layered, physics-faint floating hearts and champagne-colored ambient stars.
- Interactive **canvas particle spawners** that burst with tiny floating hearts whenever you click or tap options, cards, or interactive buttons.

### 2. 💖 "Still Not Enough ∞" Love Meter
- An interactive slider that lets you show the scale of your affection.
- Connected directly to a custom **Web Audio API synthesizer** that generates a continuous, soft magical chime shimmer. As the slider approaches 100%, the pitch and intensity rise smoothly to mirror "overflowing love."

### 3. ✨ Orbiting Constellation ("Words of Love")
- A central pulsing heart surrounded by 6–8 glowing stars slowly orbiting around it.
- **Micro-animations**: Clicking any star triggers a smooth vector travel to the center heart, which reacts with a double-beat pulse before revealing a hidden love message.
- Closing the message triggers a smooth flight back to its original orbit.

### 4. 🏆 "How Well Do You Know Us?" Interactive Quizzes
- Dual quiz systems: A main section quiz and a nested timeline-bottom milestone quiz.
- **Card-less Glassmorphism**: Translucent rose-tinted tiles (`bg-white/5` and `backdrop-blur`) that float on the dark page.
- **Visual Score Stack**: Center double-beat SVG heart, score count-up ticker animation, and vertical details representation (`X of Y correct`).
- **Web Audio Arpeggios**: Triggers major arpeggio chords (`timeline-today` & `celebration`) when answering and completing the quiz.

### 5. 📸 Drag-and-Drop Polaroid Wall
- Interactive polaroid pictures featuring realistic shadows and handwritten captions.
- Physics-based grab/drag interactions using Framer Motion.

### 6. 🗺️ Memory Map
- Plot significant milestones and dates on a custom-designed dark glass interactive map layout.

### 7. 🎂 Interactive Anniversary Cake
- Blow out the candles with a click to trigger smooth flame fades and celebratory arpeggios.

### 8. ✏️ In-App Live Site Customizer
- Click the floating **✏️ Customize Site** button to slide out a complete edit panel.
- Change names, dates, initials, colors, backgrounds, specific quiz questions, and timeline milestones inside the browser.
- Saves instantly to `localStorage` (`sophia_dev_custom_couple_config`) to persist changes across page refreshes.

---

## 🛠️ Technology Stack & Libraries

- **Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/) (ultra-fast build and HMR)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) (physics, layout transitions, drag gestures)
- **Sound Engine**: Web Audio API Synthesizer (custom programmatically generated chimes, notes, and arpeggios — no heavy audio assets required)
- **Styling**: Vanilla CSS (`src/index.css`) + TailwindCSS v4 utility classes
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure Overview

```bash
dristi/
├── public/                 # Static public assets
├── src/
│   ├── components/         # Interactive UI components
│   │   ├── AnniversaryCake.jsx     # Candle interaction and audio cue
│   │   ├── Constellation.jsx       # Orbiting "Words of Love" constellation
│   │   ├── FloatingNav.jsx         # Dark glass navigation bar capsule
│   │   ├── LoveMap.jsx             # Milestones map layout
│   │   ├── LoveQuiz.jsx            # Main interactive quiz
│   │   ├── PolaroidWall.jsx        # Drag-and-drop polaroid collage
│   │   └── Timeline.jsx            # Milestones and nested TimelineQuizCard
│   ├── CoupleContext.jsx   # State management for customization sync
│   ├── SoundContext.jsx    # Web Audio Synthesizer sound generator context
│   ├── coupleData.js       # Default couple config data (Names, Quiz, Timelines)
│   ├── App.jsx             # Core layout page router and section registry
│   ├── Editor.jsx          # Live Customize customizer form panel
│   ├── index.css           # Global typography and dark-romantic CSS overrides
│   └── main.jsx            # Mount point
├── package.json            # Dependencies and script definitions
└── README.md               # GitHub documentation
```

---

## 🚀 Getting Started & Local Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/our-journey.git
cd our-journey
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the port specified in terminal).

### 4. Create Production Build
To bundle the project into optimized static files for hosting:
```bash
npm run build
```
This generates a production-ready bundle in the `dist/` directory.

---

## 🎨 Quick Manual Customization Guide

While you can customize everything live using the in-app **Customizer Editor** panel, you can also set the permanent defaults directly in the code:

1. Open [src/coupleData.js](file:///c:/Users/SUPRATEEM/Downloads/dristi/src/coupleData.js) in your editor.
2. Edit the default name configuration at the top:
   ```javascript
   export const couple = {
     partner1: "Sophia",
     partner2: "Dev",
     initials: "S ♡ D",
     anniversaryDate: "September 15, 2026",
     song: "Perfect",
     songArtist: "Ed Sheeran",
     // Add your timeline entries, quiz questions, and secrets here...
   };
   ```
3. Save the file. The site will hot-reload automatically to reflect your new default data.

---

## 🌐 Deployment to GitHub Pages

To host this website for free on GitHub Pages:

1. Install the `gh-pages` package:
   ```bash
   npm install gh-pages --save-dev
   ```
2. Open your `package.json` and add a `homepage` property:
   ```json
   "homepage": "https://<your-github-username>.github.io/<your-repo-name>",
   ```
3. Add deploy scripts to your `package.json` under `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Run the deploy command:
   ```bash
   npm run deploy
   ```

Your site will build and push to a `gh-pages` branch, rendering live in a couple of minutes!

---

## 💝 License

This project is open-source and available under the **MIT License**. Build something beautiful for someone you love! 🌹✨
