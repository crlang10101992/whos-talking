# Who's Talking? — Design Spec

## Overview

A lightweight, browser-based canvas app for Internal Family Systems (IFS) practice. Users create colored blob "parts," name them, customize their appearance, connect them with labeled lines, and share the result via a URL — no login, no backend.

---

## Goals

- Make IFS parts mapping accessible and playful for non-therapists
- Zero friction: open URL, start adding parts immediately
- Shareable: one link captures the full canvas state
- Runs entirely in the browser (static hosting, no server needed)

---

## App Name

**Who's Talking?**
Font: BioRhyme Expanded, bold

---

## Canvas

- Full-viewport freeform canvas with a dot-grid background (`#F7F4EF` + subtle dots)
- Blobs are absolutely positioned and freely draggable via pointer events (mouse + touch)
- Toolbar fixed at top; editor panel fixed at right when a blob is selected
- No zoom or pan in v1

---

## Blobs (Parts)

Each blob is an SVG rendered inside a positioned wrapper div.

### Shape & Animation

- 5 blob shapes, each defined by 3 morph-state paths (same command structure for SMIL interpolation)
- **Edge morphing**: SMIL `<animate>` on the path `d` attribute cycles between 3 variants (3.3–4.6s, eased)
- **Rotation wobble**: CSS keyframe animation on the SVG element (3 variants, 4.5–5.8s)
- Both animations run simultaneously for an organic, living feel

### Shape Assignment

- Shape is **randomly assigned** on blob creation (0–4)
- Shape is **not user-editable** in v1 — it is part of each part's unique identity

### Data Model

```ts
interface Blob {
  id: string              // Date.now() string
  name: string            // display name (default: random from NAMES list)
  color: string           // hex, one of 10 palette options
  size: 'sm' | 'md' | 'lg'
  face: string            // face id (see Faces)
  desc: string            // free-text description (default: '')
  shape: number           // 0–4, randomly assigned, not user-editable
  x: number               // canvas-relative left of wrapper div
  y: number               // canvas-relative top of wrapper div
}
```

**Rendered blob sizes (SVG only, not including name pill):**
- `sm` → 72px × 72px
- `md` → 100px × 100px
- `lg` → 138px × 138px

### Default Blob Names

New blobs are randomly assigned a name from:
`['The Protector', 'The Critic', 'The Caregiver', 'The Exile', 'The Manager', 'The Firefighter', 'The Curious One', 'The Rebel']`

Empty names are not valid — the name pill is always shown. If the user clears the name input, it should not be saved blank (treat as no-op or restore previous value).

### Blob Creation Position

New blobs appear at a **random position within the visible canvas area**, at least 60px from each edge and at least 220px from the right edge (to avoid the editor panel). Exact formula: `x = randInt(60, canvasWidth - 220)`, `y = randInt(60, canvasHeight - 220)`.

### Stacking Order / Z-Index

- Blobs render in DOM order; later blobs appear on top of earlier ones
- When a blob is **clicked/selected**, it is moved to the end of the `blobs` array and re-rendered last, bringing it visually to the front
- The `blobs` array order defines the share state — reordering is part of the blob model

### Name Pill

- Displayed below the blob SVG
- Hovering shows a dark tooltip with `blob.desc` (only if desc is non-empty)
- Empty name is not permitted (see above)

---

## Faces

9 options, rendered as SVG elements within the blob's 100×100 viewBox. All use flat dark (`#1a1a2e`) shapes — no sclera/shine detail. Style is small, cute, centered. Exact SVG paths are left to engineer discretion within these constraints; the reference mockup at `docs/superpowers/brainstorm/ifs-session/canvas-mockup.html` contains the validated face designs.

| ID | Label | Eyes | Mouth |
|----|-------|------|-------|
| happy | Happy | Arc squint | Wide smile |
| simple | Simple | Dot circles | Gentle smile |
| sad | Sad | Dot circles | Frown |
| surprised | Surprised | Large dots | Oval |
| laughing | Laughing | Arc squint | Big open smile |
| love | In Love | Pink hearts | Smile |
| wink | Wink | One dot + one arc | Smile |
| angry | Fierce | Dots + angled brows | Frown |
| nervous | Nervous | Offset dots | Wavy mouth |

Default face on creation: `simple`.

---

## Editor Panel

Opens on blob click, fixed to the right side. Sections:

1. **Name** — text input, updates pill live
2. **Color** — 10 color swatches (see palette below)
3. **Size** — Small / Medium / Large toggle
4. **Face** — 3-column grid of face options with label
5. **About this part** — textarea, saved to `blob.desc`, shown in hover tooltip on canvas

### Color Palette (10 swatches)

`#7C6AF7` `#F7836A` `#4BAE8A` `#F5C842` `#60ADEF` `#E879A0` `#8BC34A` `#FF9F40` `#A0522D` `#48CAE4`

### Editor Panel Lifecycle

- **Opens** when a blob is clicked (in normal mode)
- **Switches** to another blob if a second blob is clicked while the panel is open
- **Closes** when the user clicks the canvas background (outside any blob)
- **Closes** when connect mode is activated (the current blob is deselected)
- No explicit close button needed in v1

---

## Connections

### Data Model

```ts
interface Connection {
  id: string
  from: string   // blob id
  to: string     // blob id
  label: string  // optional note on the line (default: '')
}
```

### Connect Mode

- Toolbar "Connect" button toggles connect mode (turns purple when active)
- **Drag is disabled while connect mode is active** — pointer down on a blob in connect mode initiates a connection, not a drag
- Canvas cursor becomes crosshair
- Click blob A → glows as source (purple drop-shadow)
- Click blob B → dashed line created; source glow cleared
- Click same blob → cancels the in-progress connection
- Click canvas background → cancels the in-progress connection
- Duplicate connections (same pair, either direction) are silently ignored

### Line Endpoint Calculation

Lines connect the **visual centers** of the two blobs:

```
centerX = blob.x + svgSize / 2
centerY = blob.y + svgSize / 2
```

where `svgSize` is 72, 100, or 138 depending on `blob.size`. The name pill below the SVG is not included in this calculation.

### Rendering

- SVG overlay inside canvas div, `z-index: 0` (behind all blob wrappers); blob wrapper divs must be explicitly set to `z-index: 1` to ensure correct layering
- Lines: `stroke: #7C6AF7`, `stroke-width: 2`, `stroke-dasharray: 7,5`, `stroke-linecap: round`
- Wide transparent hit zone (`stroke-width: 20`) for click/hover interaction
- Hover: line lightens to `#A694F5`
- Preview line follows cursor while connecting (opacity 0.5, dashed)

### Labels

- Click a line → floating editor appears at the line midpoint in screen coordinates, computed using `canvas.getBoundingClientRect()`: `screenX = canvasRect.left + mx`, `screenY = canvasRect.top + my`
- Text input + ✕ delete button
- Enter or blur saves the label; Escape cancels without saving
- Saved label renders as a white pill (rounded rect + Inter 11px text) centered on the line in the SVG
- ✕ button in the editor deletes the connection entirely

---

## Sharing

- "Share link" button serializes the full canvas state and writes it to `window.location.hash`
- Serialization must be Unicode-safe (user `desc` fields may contain emoji or accented text):
  ```js
  window.location.hash = btoa(unescape(encodeURIComponent(JSON.stringify({ blobs, connections }))));
  ```
- Deserialization on page load:
  ```js
  const state = JSON.parse(decodeURIComponent(escape(atob(window.location.hash.slice(1)))));
  ```
- URL is copied to clipboard; a toast confirms
- On page load: if a hash is present, parse and restore `blobs` and `connections`
- Share is a full snapshot — not collaborative/real-time

---

## Tech Stack

- **Framework**: React (Next.js or Vite, static export)
- **Styling**: Tailwind CSS or plain CSS modules
- **SVG**: inline, no external library
- **Fonts**: Inter (UI), Nunito (blob names), BioRhyme Expanded (logo)
- **Hosting**: Vercel (free `.vercel.app` subdomain, no custom domain required for v1)
- **No backend, no database, no auth**

---

## Out of Scope (v1)

- User accounts / persistent storage
- Zoom / pan on canvas
- Mobile-optimized layout (desktop-first)
- Undo/redo
- Multiple canvases
- Export to image/PDF
- Shape selection by user
- Collaborative / real-time editing
