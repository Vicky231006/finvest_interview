# FIN_CORE: A Dual-Lens Interactive Landing Portal

An interactive educational and developer-centric landing platform that offers a dual-lens experience: a playful, snap-scroll guided learning journey for beginners, and a high-fidelity, nerdy edge sandbox console for developers.

This document outlines the visual structure, layout decisions, color strategies, and interactive micro-interactions designed to balance the needs of both audiences without causing cognitive fatigue or boredom.

---

## Design Q&A: Dual-Lens UX/UI Architecture

### 1. Dual-Track Layout: Balancing Accessibility and Technical Depth

#### The Core Problem
How do you build a single page that teaches financial beginners the basics (without overwhelming them with dry charts and heavy numbers) while simultaneously engaging advanced developers (without boring them with slow, basic content)?

#### The Solution: The 50/50 Split Portal Entry
Instead of dropping all users onto a standard marketing page with a persistent header toggle, the application introduces a **Scene 0 (Entry Portal)**. 
*   **Visual Split Screen**: The viewport is divided into two distinct aesthetic hemispheres:
    *   **Explore (Beginner)**: Light, approachable typography, soft descriptions, and a bright green badge.
    *   **Dev Stack (Developer)**: Monospaced code labels, terminal command previews, and a tech-centric dark console feel.
*   **Hover Scaling (Kinetic Friction)**: When hovering over either pane, the hovered side expands dynamically (`flex: 1.25` vs `flex: 0.75` transitions), signaling path selection with motion feedback.
*   **Complete Separation**: Clicking a pane locks the viewport into that specific track's fullscreen container. This ensures that a beginner never sees deep raw JSON configurations by accident, and a developer isn't forced to scroll through high-level text summaries.

---

### 2. Visual Structure: Fullscreen Snap Scrolling

Both tracks are laid out inside a fullscreen vertical scroll container driven by CSS scroll snapping:
```css
.snap-container {
  height: 100vh;
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
}
.snap-section {
  height: 100vh;
  scroll-snap-align: start;
}
```
#### Why Scroll Snapping?
*   **Pacing (Chunking)**: Scroll snapping forces one scene to occupy the screen at a time. This guarantees that the user is focused on a single visual concept (e.g., *only* compound interest or *only* exponential retry backoff) before scrolling further, eliminating information clutter.
*   **Crossover Transitions**: By removing persistent global toggles, the navigation flow becomes linear. When a user reaches the final module (Scene 5/6), the layout transitions into a dedicated **Crossover Gateway Card**. This card summarizes their accomplishments and provides a clean call-to-action button to cross over to the opposite track, encouraging exploration when the user is mentally ready.
*   **Portal Exit & Helpers**: A subtle fixed button in the corner (`← Exit to Portal`) allows users to escape back to the split screen at any point. Down arrows at the bottom of each slide guide the user smoothly through the progression.

---

### 3. The "Neon Ledger" Color Palette & Tone

The color palette pairs the high-energy "Neon Kinetic Lime" with a structure of dark "Midnight" and "Carbon" neutrals, keeping the layout clean and readable.

| Token | Hex Value | Role / Context | Contrast Ratio |
|---|---|---|---|
| **Midnight Void** | `#0b0f19` | The default canvas background. Safe, low-fatigue deep dark slate. | *N/A (Base)* |
| **Carbon Surface** | `#161b22` | Cards, panels, and path-node container backgrounds. | `6.13:1` against text |
| **Steel Wireframe** | `#30363d` | Universal border outlines. Replaces soft dropshadows. | *N/A (Borders)* |
| **Ice Cap Ink** | `#f0f6fc` | Main off-white readable typography. | `>10:1` against BG |
| **Cool Muted Gray** | `#8b949e` | Secondary labels, descriptions, and console headers. | `6.13:1` against Card |
| **Neon Kinetic Lime** | `#ccff00` | Primary action triggers, active path highlight, and beginner indicators. | `15.78:1` against Void |
| **Dracula Green** | `#50fa7b` | Developer console success status, active logs, and dev action highlights. | `15.78:1` against Void |

#### Naming & Contrast Rules
*   **The 10% Accent Rule**: Neon Kinetic Lime and Dracula Green are used strictly as accents (outlines, sliders, status nodes). By capping their surface area to $\le 10\%$, we maintain their utility as focus-guiding elements without causing visual clutter.
*   **The Flat-by-Default Rule**: No ambient dropshadows or glassmorphic blurs are allowed. Hierarchy is generated strictly by carbon offset container colors and sharp 1px borders. This gives the interface a premium, structured, and technical feel.

---

### 4. Interactive Elements & Custom Animations

To avoid boring advanced students and overwhelming beginners, every learning scene embeds custom interactive micro-widgets with informative, vetted copy:

#### A. Beginner Track (Visual Metaphors)
1.  **Trend Dynamics SVG Line Graph**: Uses an inline SVG line graph simulating a real stock index (with grid lines and gradient under-fills).
    *   *2-Second Animation*: The line draws itself smoothly from left to right over **2 seconds** using CSS path stroke-dasharray animations on load, building anticipation.
    *   *Slider Control*: Dragging the volume slider transitions the final line node (`cy` coordinates) and shifts the chart colors dynamically (lime for Bullish, red for Bearish) to visually represent supply/demand equilibrium.
2.  **ROI & Compounding Graph**: A slider-driven compound interest widget.
    *   *Scale-Bounded Resize*: The compound growth bar resizes dynamically based on calculated yields. Its height is bounded (`minHeight: 20px`, `maxHeight: 80px`) with a smooth cubic-bezier transition, ensuring that even a 500%+ yield output doesn't bleed out of its card container.
3.  **Risk Diversification Crash Simulator**: Users allocate high-risk stocks vs gold/bonds. Triggering a "Market Crash" runs a 1.2-second simulation, visually highlighting how diversified portfolios cushion catastrophic hits.
4.  **Leverage Limits Indicator**: A liquidation boundary meter. Dragging leverage multipliers to high ratios (e.g. 10x) displays a warning: a small market move against you automatically prompts a red glowing `LIQUIDATED (-100%)` state.
5.  **Inflation purchasing power shrinker**: Sliders for duration and inflation rates show the value of ₹10,000 decaying. An inline shopping cart vector icon dynamically shrinks in scale (`scale(relativeValue)`) to represent purchasing capacity erosion.

#### B. Developer Track (Nerdy Engineering Concepts)
1.  **Replay Prevention Handshake**: A terminal simulating connection handshakes. Toggling replay headers runs a mock `curl` post, printing timestamps validation errors (`TIMESTAMP_EXPIRED` or reused nonce blocks).
2.  **WebSocket Stream Latency Comparison**: A side-by-side active network log comparison. Runs WSS packets (continuous ticks at 150ms showing 2-byte payloads and 12ms ping) alongside heavy HTTP REST polls (1.2KB headers, 180ms delays), teaching socket optimization.
3.  **Geo-Routing Comparator**: Clicking global edge locations (Tokyo, Frankfurt, London, Oregon) updates latency pings and network hops, illustrating how network distances translate directly into order price slippage.
4.  **Exponential Backoff with Jitter**: Toggling server failures starts log tracers retry attempts at $2^{\text{attempt}} + \text{random jitter}$ seconds, demonstrating how random noise prevents the "thundering herd" crash cycle on recovering endpoints.
5.  **HMAC-SHA256 Verification Shell**: A webhook signature validation terminal. Typing the expected shared secret key (`fin_sec_key_123`) live-hashes the JSON payload to verify authentication (`200 OK` vs `401 Unauthorized`).

---

## Project Execution & Validation

To build and run the portal, use the scripts below:

### Setup & Installation
```bash
npm install
```

### Run Development Server
```bash
npm start
```

### Build Production Bundle
```bash
npm run build
```

### Run Test Suite
```bash
npm test -- --watchAll=false
```
