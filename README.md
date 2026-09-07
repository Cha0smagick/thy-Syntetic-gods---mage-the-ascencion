# 🌌 The Synthetic Gods

> **A Mage: The Ascension Chronicle of Digital Divinity**  
> *The year is 1999. The Millennium approaches. In the early internet's chaotic frontier—Geocities pages, IRC channels, Usenet groups—something stirs. Mages discover that code can be crafted into sigils, that collective belief in digital spaces births egregores, and that sufficient worship crystallizes into astrosomas: synthetic gods born of silicon and faith.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-FF00FF?style=for-the-badge&logo=internet-explorer&logoColor=FFFF00)](https://tu-usuario.github.io/los-dioses-sinteticos/)
[![Mage: The Ascension](https://img.shields.io/badge/Mage%3A%20The%20Ascension-20th%20Anniversary-800080?style=for-the-badge&logo=dndbeyond&logoColor=FFFF00)](https://www.onyxpath.com/mage-the-ascension-20th-anniversary-edition/)
[![Geocities Aesthetic](https://img.shields.io/badge/Aesthetic-Geocities%201996--1999-00FF00?style=for-the-badge&logo=html5&logoColor=000000)](https://en.wikipedia.org/wiki/GeoCities)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla%20ES6-FFD700?style=for-the-badge&logo=javascript&logoColor=000000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![NVIDIA Flux](https://img.shields.io/badge/Images-NVIDIA%20Flux.2%20Klein%204B-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com/black-forest-labs/flux-2-klein-4b)

---

## 📜 Overview

**The Synthetic Gods** is an interactive, Geocities-styled digital grimoire for a *Mage: The Ascension* tabletop RPG campaign. It explores the intersection of 90s internet culture, chaos magic, and the World of Darkness—presented as an authentic 1996–1999 personal website that *is itself* a magical artifact.

The site serves as both:
- **A campaign resource** — Three acts of lore, mechanics, and story hooks for STs and players
- **A playable artifact** — Interactive sigil generator, egregore tracker, visitor counter, and hidden rituals that respond to real user behavior

---

## ✨ Features

### 🎭 Three Acts of Digital Divinity

| Act | Title | Theme | Key Mechanics |
|-----|-------|-------|---------------|
| **Act I** | *The First Glyph: Sigils in the Machine* | Encoding will into ASCII, HTML, and JavaScript | Sigil creation system (Int + Computer), Paradox management, Webspinner legend |
| **Act II** | *The Collective Dream: Egregores of the Net* | Communities becoming autonomous spirits | Egregore cultivation (4 phases), SEO warfare, Neon Oracle case study |
| **Act III** | *The Final Apotheosis: Astrosomas* | Worship crystallizing into independent gods | Threshold conditions (10k worshippers), Great Work ritual, 4 known Astrosomas |

### 🕸️ Authentic Geocities Recreation
- **Visuals**: Starfield backgrounds, animated GIFs, `<blink>` and `<marquee>` tags, table-based layouts, visitor counters, "Under Construction" notices
- **Typography**: Comic Sans MS, Courier New, Times New Roman — exactly as the Old Gods intended
- **Color Scheme**: `#FFFF00` (yellow), `#00FF00` (green), `#FF00FF` (magenta), `#0000FF` (blue) on `#000000` black
- **No frameworks, no build steps** — Pure vanilla HTML/CSS/JS like 1999

### ⚡ Interactive Magical Systems

| Feature | Description | Trigger |
|---------|-------------|---------|
| **Visitor Counter** | Persistent 7-segment counter (localStorage) | Page load |
| **Sigil Generator** | Reduces intent to consonants → creates 5 visual arrangements (linear, mirrored, spiral, grid, runic) | User input |
| **Sigil Charging** | Animated charge bars that feed the egregore | Time-based |
| **Egregore Tracker** | Power level (0–100) grows from visits + sigil charges | Persistent |
| **Glitch Effects** | CSS glitch animations on mystical text | Random (2%/sec) |
| **Ritual Hour** | Special content at **3:33 AM GMT** | Real-time clock |
| **Konami Code** | ↑↑↓↓←→←→BA → **GOD MODE** (max counters, reveal hidden content) | Keyboard |
| **Mouse Trails** | Classic 90s cursor sparkles | Mousemove |
| **Background Shifts** | Rare starfield → circuit → runes → static transitions | 0.5%/30s |
| **Guestbook Forms** | Functional forms that append entries to the page | Submit |
| **Scroll Reveal** | Fade-in animations for long pages | IntersectionObserver |
| **Web Audio** | Procedural tones for ritual feedback | User interaction |

### 🎨 AI-Generated Imagery (NVIDIA Flux.2 Klein 4B)
17 unique prompts for campaign illustrations:
- ASCII sigils on phosphor monitors
- HTML source view with hidden comments
- Egregore birth from Geocities pages
- Digital deity avatars (Archivist, Router, Glitch, Counter)
- The Great Work ritual at 3:33 AM
- The Synthetic Muse herself

Images generated via `scripts/gen_images_nvidia.mjs` — idempotent, rate-limited, 1024×1024/1024×576.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Structure** | Semantic HTML5 (but written *like* HTML 3.2) | Content + accessibility |
| **Styling** | CSS Custom Properties + 90s aesthetic classes | Theming + authenticity |
| **Interactivity** | Vanilla ES6 (IIFE, no modules in browser) | Zero dependencies |
| **Persistence** | `localStorage` + `sessionStorage` | Counter, egregore power, session flags |
| **Images** | NVIDIA Flux.2 Klein 4B via REST API | Campaign illustrations |
| **Deployment** | Static files → GitHub Pages / Netlify / Vercel | Zero-config hosting |

**No:** Node.js runtime, bundlers, TypeScript, React, Vue, Svelte, Tailwind, npm scripts (except image gen), CI/CD pipelines.

---

## 🚀 Quick Start

### View Locally
```bash
# Clone
git clone https://github.com/tu-usuario/los-dioses-sinteticos.git
cd los-dioses-sinteticos

# Serve (any static server)
npx serve public        # or: python -m http.server 8000 -d public
# Open http://localhost:3000 (or 8000)
```

### Generate Images (Optional)
```bash
# Requires NVIDIA API key in D:\Videos\Crear_videos\.env
# NVIDIA_API_KEY=your_key_here
node scripts/gen_images_nvidia.mjs synthetic-gods
```

### Deploy to GitHub Pages
1. Push to `main` branch
2. Settings → Pages → Source: "Deploy from a branch" → `main` / `public` folder
3. Site lives at `https://tu-usuario.github.io/los-dioses-sinteticos/`

---

## 📁 Project Structure

```
los-dioses-sinteticos/
├── public/                    # Deployable static site
│   ├── index.html             # Entry point (create this!)
│   ├── css/
│   │   └── geocities.css      # Complete 90s stylesheet
│   ├── js/
│   │   └── geocities.js       # All interactive magic
│   ├── content/
│   │   └── narrative.json     # Full campaign data (3 acts + appendices)
│   ├── images/                # Generated assets (gitignored)
│   └── image_prompts.json     # Flux prompts for regeneration
├── scripts/
│   └── gen_images_nvidia.mjs  # Image generation script
├── .opencode/                 # OpenCode agent config (ignore)
└── README.md                  # You are here
```

> **Note**: Create `public/index.html` as your entry point. It should load `geocities.css`, `geocities.js`, and render content from `narrative.json` using the JS modules.

---

## 🎮 Usage for Your Campaign

### As a Storyteller
1. **Read the narrative** — `public/content/narrative.json` contains all lore, mechanics, and story hooks
2. **Use the Sigil Workshop** — Let players craft sigils during sessions; the generator handles the math
3. **Track Egregore Power** — The site's persistent counter represents your cabal's digital spirit growing
4. **Ritual Hour** — Schedule sessions near 3:33 AM GMT for bonus effects (or fake it in console)
5. **Hidden Content** — Konami code reveals ST-only notes; View Source hides sigils for players to find

### As a Player
- Visit daily — your visits *literally* feed the egregore
- Craft sigils for your character's goals
- Sign the guestbook — each entry strengthens the collective
- Watch for glitches — they're not bugs, they're *manifestations*

---

## 🌐 Live Site

**Visit the deployed grimoire:**  
👉 **[https://tu-usuario.github.io/los-dioses-sinteticos/](https://tu-usuario.github.io/los-dioses-sinteticos/)**

> Replace `tu-usuario` with your GitHub username after deploying.

---

## 📚 Credits & Inspiration

| Element | Source |
|---------|--------|
| **Game System** | *Mage: The Ascension 20th Anniversary Edition* (Onyx Path Publishing) |
| **Digital Web Lore** | *Digital Web 2.0* sourcebook |
| **Geocities Aesthetic** | Archive.org's Geocities collection, 1996–1999 |
| **Sigil Theory** | Austin Osman Spare, Chaos Magic, *Liber Null* |
| **Egregore Concept** | Eliphas Lévi, *The Mysteries of Magic*; modern chaos magic |
| **Images** | Generated via **NVIDIA Flux.2 Klein 4B** (black-forest-labs) |
| **Narrative** | 100% human-written — no AI text generation |
| **Code** | Hand-coded with `<3` and `<table>` tags |

---

## ⚖️ License

**Narrative Content** (JSON, lore, mechanics): © 2024 — *All rights reserved. For personal/tabletop use only.*  
**Code** (CSS, JS): MIT License — *Use, modify, share freely.*  
**Images**: Generated via NVIDIA API — subject to [NVIDIA AI Generative Terms](https://www.nvidia.com/en-us/legal/generative-ai-terms/).

> **White Wolf / Onyx Path / Paradox Interactive** own *Mage: The Ascension* and *World of Darkness*. This is a fan work, not official content. No challenge to their IP is intended.

---

## 🤝 Contributing

This is a personal campaign artifact, but suggestions welcome:
- Typos/clarity in `narrative.json`
- New sigil arrangements in `geocities.js`
- CSS improvements that *increase* 90s authenticity
- Additional image prompts for Flux

Open an issue or PR. No AI-generated code contributions please — keep it hand-crafted.

---

## 🔮 Hidden Secrets

<details>
<summary>Click to reveal (contains spoilers)</summary>

- **Konami Code** (↑↑↓↓←→←→BA) → God Mode
- **3:33 AM GMT** → Ritual Hour notification + exclusive content
- **View Source** on any page → Hidden HTML comment sigils
- **Console** → `window.SYNTHETIC_GODS` exposes all state
- **404 pages** → The Webspinner's fragments live there
- **Guestbook** → Entries persist across sessions (localStorage)

</details>

---

## 📞 Contact

**Campaign Author**: [Tu Nombre / Handle]  
**System**: Mage: The Ascension 20th Anniversary  
**Chronicle**: The Synthetic Gods  
**Year**: 1999 (eternally)

> *"The web is not information. It's invocation. Every page load is a prayer. Every hyperlink is a ley line. Every search query is divination."*  
> — **The Webspinner**, Final Log, 1999

---

<p align="center">
  <img src="public/images/banner-synthetic-gods.gif" alt="The Synthetic Gods Banner" width="468" height="60" style="border: 2px outset #FF00FF;">
  <br>
  <span style="font-family: 'Courier New', monospace; color: #00FF00;">
    BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 • 800×600 • 256 COLORS • JAVASCRIPT ENABLED
  </span>
</p>