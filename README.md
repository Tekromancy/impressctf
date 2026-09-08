# The Crucible of Hackers 🏴‍☠️
### The History of CTFs, Red vs. Blue Teaming, and Open-Source Cyber Ranges
*An interactive 3D [impress.js](https://impress.js.org/) presentation.*

Inspired by the Tekromancy article: **"The Crucible of Hackers: The History of CTFs, Red vs. Blue Teaming, and Open-Source Lab Frameworks"** (`blog/src/content/blog/history-of-ctf-red-blue-teaming.md`) by Joshua Edward McLaughlin Cox.

---

## ⚡ Quick Start

### 1. Launch with Vite (Local Dev Server)
```bash
cd /mnt/unreal/git/tekromancy/impressctf
pnpm install
pnpm dev
```
Open `http://localhost:5173` in your browser.

### 2. Build for Production / Static Hosting
```bash
pnpm build
pnpm preview
```
The static distribution is output to `./dist` and is ready for any static web host (GitHub Pages, Cloudflare Pages, Nginx, Apache).

### 3. Open Directly via File or Python HTTP Server
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.

---

## 🎮 Presentation Controls & Navigation

| Key / Control | Action |
| :--- | :--- |
| <kbd>Space</kbd> / <kbd>→</kbd> / <kbd>Page Down</kbd> | Advance to next 3D step or substep |
| <kbd>←</kbd> / <kbd>Page Up</kbd> | Return to previous step |
| <kbd>O</kbd> | Jump to **3D Orbit Overview** (see all 14 stations in 3D space) |
| <kbd>M</kbd> | Toggle **Web Audio Synthesizer FX** (warp whoosh & terminal clicks) |
| <kbd>F</kbd> | Toggle **Fullscreen Mode** |
| <kbd>A</kbd> | Toggle **Autoplay** (7 seconds per slide) |
| <kbd>P</kbd> | Open **Presenter Console / Speaker Notes** window |
| <kbd>?</kbd> or <kbd>H</kbd> | Open **Help / Keyboard Shortcuts Dialog** |
| **HUD Jump Menu** | Select any station from the top navigation dropdown |

---

## 🛰️ 3D Flight Path (14 Stations)

1. **Station 01: `#title` (The Nexus)** — Epic 3D intro with cybernetic badge, hero image, and agenda.
2. **Station 02: `#origins` (Military Roots)** — RAND Corporation Soviet wargaming, Richard Marcinko & the 1980s US Navy Red Cell.
3. **Station 03: `#eligible-receiver` (Eligible Receiver 97)** — Pentagon's wake-up call; COTS tools and hacker scripts compromising command & control.
4. **Station 04: `#doctrine-triad` (The Combat Triad)** — Red Team adversary emulation, Blue Team SIEM/EDR, Purple Team continuous feedback loop.
5. **Station 05: `#defcon-genesis` (DEF CON 4 - 1996)** — Taped Ethernet cables across Las Vegas hotel floors, unmanaged hubs, and frantic bash loops.
6. **Station 06: `#attack-defense` (The Attack-Defense Crucible)** — Proprietary binaries, zero-day discovery, automated exploitation, and service SLA SLAs.
7. **Station 07: `#defcon-dynasty` (Organizers Dynasty)** — 30 years of DEF CON CTF collectives: K2, Goolsbey, Kenshoto, LegitBS, OOO, and Nautilus.
8. **Station 08: `#three-formats` (The 3 Modern Formats)** — Jeopardy vs. Attack-Defense vs. King of the Hill (KotH).
9. **Station 09: `#open-source-arsenal` (Open-Source Cyber Ranges)** — CTFd, Google kctf, RootTheBox, FAUST CTF, MITRE CALDERA, and GOAD.
10. **Station 10: `#comparison-matrix` (Platform Evaluation Matrix)** — Side-by-side technical evaluation of architecture, stack, deployment, and best use cases.
11. **Station 11: `#docker-walkthrough` (Hands-On CTFd Deployment)** — Docker Compose architecture, multi-container cluster, and 3-minute launch walkthrough.
12. **Station 12: `#future-frontier` (The Next Frontier)** — Autonomous AI agents (DARPA AIxCC), LLM patch synthesis, and Linux eBPF telemetry.
13. **Station 13: `#creed` (The Hacker's Creed & Conclusion)** — "Combat is the single fastest path to mastery in systems and security engineering."
14. **Station 14: `#overview` (3D Cyberspace Constellation)** — Camera zooms back 6,500px in Z-space to show all stations orbiting in 3D.

---

## 🛠️ Architecture & Special Effects

- **Core Engine:** Vendored [impress.js](https://impress.js.org/) with CSS3 3D transforms (`translate3d`, `rotateX`, `rotateY`, `rotateZ`, `scale`).
- **Dynamic Background Canvas (`js/cyber-canvas.js`):** Multi-layered perspective grid, drifting hex tokens (`0x90`, `FLAG{`, `eBPF`), and interactive constellation nodes with vector links.
- **Procedural Audio Synthesizer (`js/audio-fx.js`):** Pure Web Audio API synthesizing 3D warp whooshes, terminal clicks, and alert sirens with zero external audio assets.
- **HUD Overlay (`js/presentation.js`):** Glassmorphic top and bottom bars with live progress tracking, station title readout, autoplay timer, and jump selector.
- **Terminal Simulator:** High-fidelity CRT terminal windows with color-coded commands, parameter highlights, and simulated bash/docker traces.
