# Who's Talking? Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React canvas app where users create animated blob "parts," connect them with labeled lines, and share the result via a URL.

**Architecture:** Single-page Vite + React + TypeScript app with all state in React `useState`. No routing (hash-based). Canvas is a full-viewport div with absolutely positioned blob wrappers and an SVG overlay for connection lines. All persistence is via `window.location.hash`.

**Tech Stack:** Vite, React 18, TypeScript, Vitest + @testing-library/react, plain CSS, Vercel static hosting.

---

## File Map

```
src/
├── main.tsx                   # mounts App into #root
├── App.tsx                    # all state, all handlers, root layout
├── types.ts                   # Blob and Connection interfaces
├── constants.ts               # SHAPES_MORPH, COLORS, NAMES, SIZE_PX, MORPH_DURS
├── faces.tsx                  # FACES array with JSX draw functions (needs .tsx)
├── utils.ts                   # randInt, randItem, getBlobCenter, serialize, deserialize
├── index.css                  # global styles: dot-grid, toolbar, animations, editor
├── test-setup.ts              # @testing-library/jest-dom import
├── __tests__/
│   ├── utils.test.ts          # pure function tests
│   └── App.test.tsx           # state logic tests
└── components/
    ├── Toolbar.tsx            # app name + Share + Connect + New Part buttons
    ├── Canvas.tsx             # canvas div + ConnectionsSvg + BlobWrapper list
    ├── BlobWrapper.tsx        # positioned wrapper: drag, click, name pill, tooltip
    ├── BlobSvg.tsx            # SVG with SMIL morph path + face
    ├── ConnectionsSvg.tsx     # SVG overlay: lines, hit zones, preview, label pills
    ├── LineEditor.tsx         # floating input for line label + delete button
    ├── EditorPanel.tsx        # right-side panel: name, color, size, face, desc
    └── Toast.tsx              # "Link copied" notification
```

---

## Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test-setup.ts`

- [ ] **Step 1: Initialize Vite project**

```bash
cd /Users/cassandralang/ifs-app
npm create vite@latest . -- --template react-ts --force
```

Expected: Vite scaffolds `src/`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest in vite.config.ts**

Replace the contents of `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `src/test-setup.ts`:
```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 6: Verify dev server and tests run**

```bash
npm run dev
# Should open at http://localhost:5173 with default Vite React page

npm run test:run
# Should show: 0 tests found (no failures)
```

- [ ] **Step 7: Commit**

```bash
git init   # only if not already a git repo
git add .
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

## Task 2: Types, constants, and face data

**Files:**
- Create: `src/types.ts`, `src/constants.ts`, `src/faces.tsx`

- [ ] **Step 1: Create src/types.ts**

```ts
export interface Blob {
  id: string
  name: string
  color: string
  size: 'sm' | 'md' | 'lg'
  face: string
  desc: string
  shape: number
  x: number
  y: number
}

export interface Connection {
  id: string
  from: string
  to: string
  label: string
}

export interface AppState {
  blobs: Blob[]
  connections: Connection[]
}
```

- [ ] **Step 2: Create src/constants.ts**

```ts
// 5 blob shapes × 3 morph states each (same command structure for SMIL interpolation)
export const SHAPES_MORPH: string[][] = [
  [
    'M60,10 C85,5 95,30 90,55 C85,80 65,95 40,90 C15,85 5,65 10,40 C15,15 35,15 60,10Z',
    'M64,6 C90,2 98,28 86,58 C80,86 62,100 35,92 C10,82 2,62 8,38 C12,14 36,20 64,6Z',
    'M55,14 C82,8 92,34 94,52 C88,76 64,92 45,88 C18,88 8,66 14,40 C18,12 36,12 55,14Z',
  ],
  [
    'M55,8 C80,8 98,28 95,55 C92,82 70,98 45,92 C20,86 4,68 8,42 C12,16 30,8 55,8Z',
    'M60,4 C86,6 100,24 92,58 C88,84 66,100 40,96 C14,86 2,64 4,40 C8,16 28,4 60,4Z',
    'M50,12 C76,10 96,32 98,52 C94,80 72,96 50,88 C24,88 6,72 10,44 C14,16 32,12 50,12Z',
  ],
  [
    'M65,12 C88,10 96,35 90,58 C84,81 60,96 38,88 C16,80 6,58 12,36 C18,14 42,14 65,12Z',
    'M60,16 C84,6 100,30 92,56 C86,82 64,100 34,92 C10,82 2,60 8,38 C14,18 40,20 60,16Z',
    'M70,8 C92,12 92,40 88,60 C80,82 56,94 42,84 C20,78 10,56 16,32 C20,10 46,10 70,8Z',
  ],
  [
    'M50,8 C76,6 96,26 94,52 C92,78 74,96 48,94 C22,92 4,74 6,48 C8,22 24,10 50,8Z',
    'M56,4 C82,4 98,24 96,54 C92,82 70,98 44,98 C18,88 2,70 2,46 C4,20 28,6 56,4Z',
    'M44,12 C70,8 94,28 92,50 C90,76 76,94 52,90 C26,96 8,78 10,50 C12,24 22,14 44,12Z',
  ],
  [
    'M58,6 C84,4 98,24 96,50 C94,76 76,98 50,96 C24,94 2,76 4,50 C6,24 32,8 58,6Z',
    'M64,2 C90,2 100,22 94,54 C90,80 72,100 46,98 C20,90 2,72 4,48 C6,22 36,6 64,2Z',
    'M52,10 C78,8 94,28 96,46 C96,72 78,96 54,92 C28,96 4,78 6,52 C8,26 28,12 52,10Z',
  ],
]

// Duration (seconds) for each shape's morph cycle
export const MORPH_DURS = [3.8, 4.6, 3.3, 4.2, 3.7]

// CSS wobble animation names assigned by blob DOM position
export const WOBBLE_ANIMS = ['wobble1', 'wobble2', 'wobble3']

// 10-color palette
export const COLORS = [
  '#7C6AF7', '#F7836A', '#4BAE8A', '#F5C842', '#60ADEF',
  '#E879A0', '#8BC34A', '#FF9F40', '#A0522D', '#48CAE4',
]

// Default names for new blobs
export const NAMES = [
  'The Protector', 'The Critic', 'The Caregiver', 'The Exile',
  'The Manager', 'The Firefighter', 'The Curious One', 'The Rebel',
]

// Rendered SVG size in pixels per size tier (NOT including name pill)
export const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: 72,
  md: 100,
  lg: 138,
}
```

- [ ] **Step 3: Create src/faces.tsx**

Copy face SVG data from the validated mockup at
`docs/superpowers/brainstorm/ifs-session/canvas-mockup.html` (search for `const FACES`).
Each face gets a JSX `draw` function instead of a string template. Example structure:

```tsx
import React from 'react'

export interface Face {
  id: string
  label: string
  draw: () => React.ReactElement
}

export const FACES: Face[] = [
  {
    id: 'happy',
    label: 'Happy',
    draw: () => (
      <>
        <path d="M31,46 Q37,41 43,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M57,46 Q63,41 69,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M34,59 Q50,70 66,59" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'simple',
    label: 'Simple',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M38,60 Q50,68 62,60" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'sad',
    label: 'Sad',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M38,64 Q50,56 62,64" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'surprised',
    label: 'Surprised',
    draw: () => (
      <>
        <circle cx="37" cy="45" r="6" fill="#1a1a2e"/>
        <circle cx="63" cy="45" r="6" fill="#1a1a2e"/>
        <ellipse cx="50" cy="63" rx="6" ry="7" fill="#1a1a2e"/>
      </>
    ),
  },
  {
    id: 'laughing',
    label: 'Laughing',
    draw: () => (
      <>
        <path d="M31,46 Q37,41 43,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M57,46 Q63,41 69,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M32,58 Q50,74 68,58" stroke="#1a1a2e" strokeWidth="2" fill="#1a1a2e"/>
        <path d="M34,58 Q50,70 66,58" fill="white"/>
      </>
    ),
  },
  {
    id: 'love',
    label: 'In Love',
    draw: () => (
      <>
        <path d="M29,42 C29,38 33,37 37,41 C41,37 45,38 45,42 C45,47 37,53 37,53 C37,53 29,47 29,42Z" fill="#E879A0"/>
        <path d="M55,42 C55,38 59,37 63,41 C67,37 71,38 71,42 C71,47 63,53 63,53 C63,53 55,47 55,42Z" fill="#E879A0"/>
        <path d="M38,63 Q50,71 62,63" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'wink',
    label: 'Wink',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M57,46 Q63,41 69,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M38,60 Q50,68 62,60" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'angry',
    label: 'Fierce',
    draw: () => (
      <>
        <path d="M28,38 L42,43" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round"/>
        <path d="M72,38 L58,43" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="37" cy="48" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="48" r="4" fill="#1a1a2e"/>
        <path d="M38,63 Q50,56 62,63" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'nervous',
    label: 'Nervous',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M36,62 Q41,57 46,62 Q50,67 54,62 Q59,57 64,62" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
]
```

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/constants.ts src/faces.tsx
git commit -m "feat: add types, constants, and face data"
```

---

## Task 3: Utility functions with tests

**Files:**
- Create: `src/utils.ts`, `src/__tests__/utils.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { randInt, randItem, getBlobCenter, serialize, deserialize } from '../utils'
import type { Blob, Connection } from '../types'

const makeBlob = (overrides: Partial<Blob> = {}): Blob => ({
  id: '1', name: 'Test', color: '#fff', size: 'md', face: 'simple',
  desc: '', shape: 0, x: 100, y: 200, ...overrides,
})

describe('randInt', () => {
  it('returns a value within [min, max]', () => {
    for (let i = 0; i < 100; i++) {
      const val = randInt(5, 10)
      expect(val).toBeGreaterThanOrEqual(5)
      expect(val).toBeLessThanOrEqual(10)
    }
  })
})

describe('getBlobCenter', () => {
  it('returns center for md blob (100px)', () => {
    const blob = makeBlob({ x: 50, y: 80, size: 'md' })
    expect(getBlobCenter(blob)).toEqual({ x: 100, y: 130 })
  })
  it('returns center for sm blob (72px)', () => {
    const blob = makeBlob({ x: 0, y: 0, size: 'sm' })
    expect(getBlobCenter(blob)).toEqual({ x: 36, y: 36 })
  })
  it('returns center for lg blob (138px)', () => {
    const blob = makeBlob({ x: 10, y: 20, size: 'lg' })
    expect(getBlobCenter(blob)).toEqual({ x: 79, y: 89 })
  })
})

describe('serialize / deserialize', () => {
  it('round-trips blobs and connections', () => {
    const blobs = [makeBlob()]
    const connections: Connection[] = [{ id: 'c1', from: '1', to: '2', label: 'hello' }]
    const hash = serialize({ blobs, connections })
    const result = deserialize(hash)
    expect(result.blobs).toEqual(blobs)
    expect(result.connections).toEqual(connections)
  })

  it('handles unicode (emoji, accented chars) in desc', () => {
    const blobs = [makeBlob({ desc: '😊 café naïve' })]
    const hash = serialize({ blobs, connections: [] })
    const result = deserialize(hash)
    expect(result.blobs[0].desc).toBe('😊 café naïve')
  })

  it('returns empty state for empty string', () => {
    const result = deserialize('')
    expect(result.blobs).toEqual([])
    expect(result.connections).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run
```

Expected: FAIL — `Cannot find module '../utils'`

- [ ] **Step 3: Create src/utils.ts**

```ts
import { SIZE_PX, NAMES, COLORS, SHAPES_MORPH } from './constants'
import type { Blob, Connection, AppState } from './types'

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randItem<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

export function getBlobCenter(blob: Blob): { x: number; y: number } {
  const size = SIZE_PX[blob.size]
  return { x: blob.x + size / 2, y: blob.y + size / 2 }
}

/** Unicode-safe base64 encode of full canvas state */
export function serialize(state: AppState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))))
}

/** Decode a hash string back to AppState; returns empty state on failure */
export function deserialize(hash: string): AppState {
  const empty: AppState = { blobs: [], connections: [] }
  if (!hash) return empty
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash)))) as AppState
  } catch {
    return empty
  }
}

/** Build a fresh Blob with random defaults */
export function makeNewBlob(canvasWidth: number, canvasHeight: number): Blob {
  return {
    id: Date.now().toString(),
    name: randItem(NAMES),
    color: randItem(COLORS),
    size: 'md',
    face: 'simple',
    desc: '',
    shape: randInt(0, SHAPES_MORPH.length - 1),
    x: randInt(60, Math.max(100, canvasWidth - 220)),
    y: randInt(60, Math.max(100, canvasHeight - 220)),
  }
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npm run test:run
```

Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils.ts src/__tests__/utils.test.ts
git commit -m "feat: add utility functions with tests"
```

---

## Task 4: Global styles and fonts

**Files:**
- Modify: `index.html`, `src/index.css`
- Delete: `src/App.css` (Vite default, not needed)

- [ ] **Step 1: Update index.html**

Replace `<head>` contents with:
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Who's Talking?</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=BioRhyme+Expanded:wght@700&family=Inter:wght@400;500;600&family=Nunito:wght@600;700&display=swap" rel="stylesheet" />
</head>
```

- [ ] **Step 2: Replace src/index.css**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: #F7F4EF;
  overflow: hidden;
  height: 100vh;
}

#root { height: 100vh; }

/* ---- Toolbar ---- */
.toolbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
  border-bottom: 1px solid #E8E2DA;
  padding: 10px 20px;
  display: flex; align-items: center; justify-content: space-between;
  height: 57px;
}
.app-name {
  font-family: 'BioRhyme Expanded', serif;
  font-weight: 700; font-size: 20px; color: #2D2D2D;
}
.app-name span { color: #7C6AF7; }
.toolbar-actions { display: flex; gap: 10px; }

/* ---- Buttons ---- */
.btn {
  padding: 8px 16px; border-radius: 100px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  border: none; transition: all 0.15s;
}
.btn-primary { background: #7C6AF7; color: #fff; }
.btn-primary:hover { background: #6857e0; }
.btn-ghost { background: transparent; color: #555; border: 1px solid #DDD; }
.btn-ghost:hover { background: #F0EDE8; }
.btn-connect { background: transparent; color: #555; border: 1px solid #DDD; }
.btn-connect:hover { background: #F0EDE8; }
.btn-connect.active { background: #7C6AF7; color: white; border-color: #7C6AF7; }

/* ---- Canvas ---- */
.canvas {
  position: fixed; inset: 57px 0 0 0;
  background: #F7F4EF;
  background-image: radial-gradient(circle, #D8D2C8 1px, transparent 1px);
  background-size: 28px 28px;
  overflow: hidden;
}
.canvas.connect-mode { cursor: crosshair; }

/* ---- Blob ---- */
.blob-wrapper {
  position: absolute;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  user-select: none; cursor: grab; z-index: 1;
}
.blob-wrapper:active { cursor: grabbing; }
.blob-wrapper.selected .blob-svg {
  filter: drop-shadow(0 0 10px rgba(124,106,247,0.5));
}
.blob-wrapper.connecting-source .blob-svg {
  filter: drop-shadow(0 0 14px rgba(124,106,247,0.9));
}
.blob-name {
  font-family: 'Nunito', sans-serif; font-weight: 600;
  font-size: 13px; color: #333;
  background: rgba(255,255,255,0.88); padding: 3px 10px;
  border-radius: 100px; border: 1px solid rgba(0,0,0,0.08);
  white-space: nowrap; cursor: default; transition: border-color 0.15s;
}
.blob-name:hover { border-color: #7C6AF7; }
.blob-wrapper.selected .blob-name { border-color: #7C6AF7; }

/* ---- Blob wobble animations (rotation only; morphing handled by SMIL) ---- */
@keyframes wobble1 {
  0%,100% { transform: rotate(0deg); }
  30%     { transform: rotate(1.5deg); }
  70%     { transform: rotate(-1deg); }
}
@keyframes wobble2 {
  0%,100% { transform: rotate(0deg); }
  25%     { transform: rotate(-2deg); }
  65%     { transform: rotate(1.2deg); }
}
@keyframes wobble3 {
  0%,100% { transform: rotate(0deg); }
  40%     { transform: rotate(1deg); }
  80%     { transform: rotate(-1.5deg); }
}

/* ---- Editor Panel ---- */
.editor {
  position: fixed; right: 16px; top: 73px;
  width: 230px; max-height: calc(100vh - 90px); overflow-y: auto;
  background: white; border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  padding: 18px; border: 1px solid #EDE8E0; z-index: 50;
}
.editor::-webkit-scrollbar { width: 4px; }
.editor::-webkit-scrollbar-thumb { background: #DDD; border-radius: 4px; }
.editor-title {
  font-size: 11px; letter-spacing: 0.1em;
  text-transform: uppercase; color: #999; margin-bottom: 14px;
}
.editor-section { margin-bottom: 16px; }
.editor-label { font-size: 12px; color: #666; margin-bottom: 8px; }
.editor hr { border: none; border-top: 1px solid #F0EAE2; margin: 4px 0 16px; }

/* ---- Color swatches ---- */
.color-row { display: flex; gap: 7px; flex-wrap: wrap; }
.color-dot {
  width: 24px; height: 24px; border-radius: 50%;
  cursor: pointer; border: 2px solid transparent; transition: transform 0.1s;
}
.color-dot:hover { transform: scale(1.15); }
.color-dot.active { border-color: #333; }

/* ---- Size buttons ---- */
.size-row { display: flex; gap: 6px; }
.size-btn {
  flex: 1; padding: 6px; border-radius: 8px;
  border: 1px solid #E0DAD2; background: #FAF8F5;
  font-size: 12px; color: #555; cursor: pointer; text-align: center;
}
.size-btn.active { background: #7C6AF7; color: white; border-color: #7C6AF7; }

/* ---- Face grid ---- */
.face-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.face-btn {
  padding: 8px 4px; border-radius: 10px;
  border: 1px solid #E0DAD2; background: #FAF8F5;
  cursor: pointer; text-align: center;
  font-size: 9px; color: #666;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.face-btn.active { background: #EEF; border-color: #7C6AF7; }

/* ---- Text inputs ---- */
.name-input {
  width: 100%; padding: 8px 10px; border-radius: 8px;
  border: 1px solid #E0DAD2; font-family: 'Nunito', sans-serif;
  font-size: 13px; color: #333; background: #FAF8F5; outline: none;
}
.name-input:focus { border-color: #7C6AF7; }
.desc-input {
  width: 100%; padding: 8px 10px; border-radius: 8px;
  border: 1px solid #E0DAD2; font-size: 12px; color: #444;
  background: #FAF8F5; outline: none;
  resize: none; line-height: 1.5; min-height: 80px; font-family: 'Inter', sans-serif;
}
.desc-input:focus { border-color: #7C6AF7; }
.desc-input::placeholder { color: #BBB; }

/* ---- Name tooltip ---- */
.name-tooltip {
  position: fixed; z-index: 300;
  background: rgba(30,26,46,0.93); color: white;
  padding: 10px 14px; border-radius: 12px;
  font-size: 13px; line-height: 1.5; max-width: 240px;
  pointer-events: none;
  white-space: pre-wrap; word-break: break-word;
  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
}

/* ---- Line label floating editor ---- */
.line-editor {
  position: fixed; z-index: 300;
  background: white; border: 1px solid #E0DAD2;
  border-radius: 12px; padding: 8px 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  display: flex; align-items: center; gap: 8px;
}
.line-label-input {
  border: none; outline: none;
  font-size: 13px; width: 150px;
  font-family: 'Inter', sans-serif; color: #333; background: transparent;
}
.line-delete-btn {
  border: none; background: none; cursor: pointer;
  color: #BBB; font-size: 15px; padding: 0; line-height: 1;
}
.line-delete-btn:hover { color: #E879A0; }

/* ---- Toast ---- */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #2D2D2D; color: white; padding: 10px 20px;
  border-radius: 100px; font-size: 13px;
  opacity: 0; transition: opacity 0.2s; pointer-events: none; z-index: 200;
}
.toast.show { opacity: 1; }

/* ---- Empty state ---- */
.empty-state {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  text-align: center; pointer-events: none;
}
.empty-state p { font-size: 15px; color: #AAA; margin-top: 8px; }
```

- [ ] **Step 3: Delete src/App.css**

```bash
rm src/App.css
```

- [ ] **Step 4: Commit**

```bash
git add index.html src/index.css
git rm src/App.css
git commit -m "feat: add global styles and font configuration"
```

---

## Task 5: App state and root layout

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Write App.tsx**

Replace `src/App.tsx` completely:

```tsx
import { useState, useCallback, useEffect, useRef } from 'react'
import type { Blob, Connection } from './types'
import { makeNewBlob, serialize, deserialize } from './utils'
import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import EditorPanel from './components/EditorPanel'
import Toast from './components/Toast'
import LineEditor from './components/LineEditor'
import './index.css'

export default function App() {
  const [blobs, setBlobs] = useState<Blob[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [connectMode, setConnectMode] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [editingConnId, setEditingConnId] = useState<string | null>(null)
  const [lineEditorPos, setLineEditorPos] = useState({ x: 0, y: 0 })
  const [showToast, setShowToast] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Restore from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const state = deserialize(hash)
      setBlobs(state.blobs)
      setConnections(state.connections)
    }
  }, [])

  // ---- Blob handlers ----

  const addBlob = useCallback(() => {
    const canvas = canvasRef.current
    const w = canvas?.clientWidth ?? 800
    const h = canvas?.clientHeight ?? 600
    const blob = makeNewBlob(w, h)
    setBlobs(prev => [...prev, blob])
    setSelectedId(blob.id)
    setConnectMode(false)
  }, [])

  const selectBlob = useCallback((id: string) => {
    setSelectedId(id)
    // Move selected blob to end of array (brings to front in DOM)
    setBlobs(prev => {
      const idx = prev.findIndex(b => b.id === id)
      if (idx === -1 || idx === prev.length - 1) return prev
      return [...prev.slice(0, idx), ...prev.slice(idx + 1), prev[idx]]
    })
  }, [])

  const updateBlob = useCallback((id: string, changes: Partial<Blob>) => {
    setBlobs(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b))
  }, [])

  const moveBlob = useCallback((id: string, x: number, y: number) => {
    setBlobs(prev => prev.map(b => b.id === id ? { ...b, x, y } : b))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedId(null)
  }, [])

  // ---- Connect mode handlers ----

  const toggleConnectMode = useCallback(() => {
    setConnectMode(prev => {
      if (!prev) setSelectedId(null) // close editor when entering connect mode
      return !prev
    })
    setConnectingFrom(null)
  }, [])

  const handleBlobClick = useCallback((blobId: string) => {
    if (!connectMode) {
      selectBlob(blobId)
      return
    }
    if (!connectingFrom) {
      setConnectingFrom(blobId)
    } else if (connectingFrom === blobId) {
      setConnectingFrom(null)
    } else {
      const exists = connections.some(c =>
        (c.from === connectingFrom && c.to === blobId) ||
        (c.from === blobId && c.to === connectingFrom)
      )
      if (!exists) {
        const conn: Connection = {
          id: Date.now().toString(),
          from: connectingFrom,
          to: blobId,
          label: '',
        }
        setConnections(prev => [...prev, conn])
      }
      setConnectingFrom(null)
    }
  }, [connectMode, connectingFrom, connections])

  const cancelConnect = useCallback(() => {
    setConnectingFrom(null)
  }, [])

  // ---- Connection label handlers ----

  const openLineEditor = useCallback((connId: string, screenX: number, screenY: number) => {
    setEditingConnId(connId)
    setLineEditorPos({ x: screenX, y: screenY })
  }, [])

  const saveLineLabel = useCallback((label: string) => {
    if (!editingConnId) return
    setConnections(prev =>
      prev.map(c => c.id === editingConnId ? { ...c, label } : c)
    )
    setEditingConnId(null)
  }, [editingConnId])

  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id))
    setEditingConnId(null)
  }, [])

  const closeLineEditor = useCallback(() => {
    setEditingConnId(null)
  }, [])

  // ---- Share ----

  const shareLink = useCallback(() => {
    const hash = serialize({ blobs, connections })
    window.location.hash = hash
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }, [blobs, connections])

  const selectedBlob = blobs.find(b => b.id === selectedId) ?? null
  const editingConn = connections.find(c => c.id === editingConnId) ?? null

  return (
    <>
      <Toolbar
        connectMode={connectMode}
        onToggleConnect={toggleConnectMode}
        onAddBlob={addBlob}
        onShare={shareLink}
      />
      <Canvas
        canvasRef={canvasRef}
        blobs={blobs}
        connections={connections}
        selectedId={selectedId}
        connectMode={connectMode}
        connectingFrom={connectingFrom}
        onBlobClick={handleBlobClick}
        onBlobMove={moveBlob}
        onCanvasClick={deselectAll}
        onCancelConnect={cancelConnect}
        onOpenLineEditor={openLineEditor}
      />
      {selectedBlob && !connectMode && (
        <EditorPanel
          blob={selectedBlob}
          onChange={(changes) => updateBlob(selectedBlob.id, changes)}
        />
      )}
      {editingConn && (
        <LineEditor
          connection={editingConn}
          position={lineEditorPos}
          onSave={saveLineLabel}
          onDelete={() => deleteConnection(editingConn.id)}
          onClose={closeLineEditor}
        />
      )}
      <Toast show={showToast} />
    </>
  )
}
```

- [ ] **Step 2: Update src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Create stub components so the app compiles**

Create these minimal stubs (they'll be replaced in later tasks):

`src/components/Toolbar.tsx`:
```tsx
export default function Toolbar(_: any) { return <div className="toolbar"><div className="app-name">Who's <span>Talking?</span></div></div> }
```

`src/components/Canvas.tsx`:
```tsx
export default function Canvas(_: any) { return <div className="canvas" /> }
```

`src/components/EditorPanel.tsx`:
```tsx
export default function EditorPanel(_: any) { return null }
```

`src/components/Toast.tsx`:
```tsx
export default function Toast({ show }: { show: boolean }) {
  return <div className={`toast${show ? ' show' : ''}`}>Link copied to clipboard</div>
}
```

`src/components/LineEditor.tsx`:
```tsx
export default function LineEditor(_: any) { return null }
```

- [ ] **Step 4: Verify app compiles**

```bash
npm run dev
```

Expected: App loads at `http://localhost:5173` with toolbar visible, no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/components/
git commit -m "feat: add App state and component stubs"
```

---

## Task 6: BlobSvg and BlobWrapper components

**Files:**
- Create: `src/components/BlobSvg.tsx`, `src/components/BlobWrapper.tsx`

- [ ] **Step 1: Create src/components/BlobSvg.tsx**

```tsx
import { SHAPES_MORPH, MORPH_DURS, SIZE_PX } from '../constants'
import { FACES } from '../faces'
import type { Blob } from '../types'

interface Props {
  blob: Blob
  wobbleClass: string
}

export default function BlobSvg({ blob, wobbleClass }: Props) {
  const paths = SHAPES_MORPH[blob.shape]
  const dur = `${MORPH_DURS[blob.shape]}s`
  const size = SIZE_PX[blob.size]
  const face = FACES.find(f => f.id === blob.face) ?? FACES[0]

  return (
    <svg
      className={`blob-svg ${wobbleClass}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transformOrigin: 'center center' }}
    >
      <path d={paths[0]} fill={blob.color} opacity="0.92">
        <animate
          attributeName="d"
          dur={dur}
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.33;0.66;1"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
          values={`${paths[0]};${paths[1]};${paths[2]};${paths[0]}`}
        />
      </path>
      {face.draw()}
    </svg>
  )
}
```

- [ ] **Step 2: Create src/components/BlobWrapper.tsx**

```tsx
import { useRef, useState, useEffect } from 'react'
import { SIZE_PX, WOBBLE_ANIMS } from '../constants'
import type { Blob } from '../types'
import BlobSvg from './BlobSvg'

interface Props {
  blob: Blob
  index: number
  isSelected: boolean
  isConnectingSource: boolean
  connectMode: boolean
  onClick: () => void
  onMove: (x: number, y: number) => void
}

interface TooltipState { visible: boolean; x: number; y: number }

export default function BlobWrapper({
  blob, index, isSelected, isConnectingSource, connectMode, onClick, onMove,
}: Props) {
  const dragRef = useRef<{ startX: number; startY: number; blobX: number; blobY: number } | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0 })
  const wobbleClass = WOBBLE_ANIMS[index % WOBBLE_ANIMS.length]

  const classNames = [
    'blob-wrapper',
    isSelected ? 'selected' : '',
    isConnectingSource ? 'connecting-source' : '',
  ].filter(Boolean).join(' ')

  function onPointerDown(e: React.PointerEvent) {
    if (connectMode) return // drag disabled in connect mode
    e.preventDefault()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, blobX: blob.x, blobY: blob.y }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    onMove(dragRef.current.blobX + dx, dragRef.current.blobY + dy)
  }

  function onPointerUp() {
    dragRef.current = null
  }

  function onNameMouseEnter(e: React.MouseEvent) {
    if (!blob.desc) return
    setTooltip({ visible: true, x: e.clientX + 14, y: e.clientY - 12 })
  }

  function onNameMouseMove(e: React.MouseEvent) {
    if (!blob.desc) return
    setTooltip(prev => ({ ...prev, x: e.clientX + 14, y: e.clientY - 12 }))
  }

  function onNameMouseLeave() {
    setTooltip(prev => ({ ...prev, visible: false }))
  }

  return (
    <>
      <div
        className={classNames}
        style={{ left: blob.x, top: blob.y }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        <BlobSvg blob={blob} wobbleClass={wobbleClass} />
        <div
          className="blob-name"
          onMouseEnter={onNameMouseEnter}
          onMouseMove={onNameMouseMove}
          onMouseLeave={onNameMouseLeave}
        >
          {blob.name}
        </div>
      </div>
      {tooltip.visible && blob.desc && (
        <div className="name-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {blob.desc}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify in dev server**

```bash
npm run dev
```

Add a blob via the (still stubbed) toolbar. Won't work yet — that's fine. Components just need to compile without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/BlobSvg.tsx src/components/BlobWrapper.tsx
git commit -m "feat: add BlobSvg and BlobWrapper components"
```

---

## Task 7: Canvas and Toolbar — wire everything together

**Files:**
- Modify: `src/components/Canvas.tsx`, `src/components/Toolbar.tsx`
- Create: `src/components/ConnectionsSvg.tsx`

- [ ] **Step 1: Replace src/components/Toolbar.tsx**

```tsx
interface Props {
  connectMode: boolean
  onToggleConnect: () => void
  onAddBlob: () => void
  onShare: () => void
}

export default function Toolbar({ connectMode, onToggleConnect, onAddBlob, onShare }: Props) {
  return (
    <div className="toolbar">
      <div className="app-name">Who's <span>Talking?</span></div>
      <div className="toolbar-actions">
        <button className="btn btn-ghost" onClick={onShare}>Share link</button>
        <button
          className={`btn btn-connect${connectMode ? ' active' : ''}`}
          onClick={onToggleConnect}
        >
          Connect
        </button>
        <button className="btn btn-primary" onClick={onAddBlob}>+ New part</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/ConnectionsSvg.tsx**

```tsx
import { useRef } from 'react'
import type { Blob, Connection } from '../types'
import { getBlobCenter } from '../utils'

interface Props {
  blobs: Blob[]
  connections: Connection[]
  connectingFrom: string | null
  mousePos: { x: number; y: number } | null
  onLineClick: (connId: string, screenX: number, screenY: number) => void
}

export default function ConnectionsSvg({ blobs, connections, connectingFrom, mousePos, onLineClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const getCenter = (blobId: string) => {
    const blob = blobs.find(b => b.id === blobId)
    return blob ? getBlobCenter(blob) : null
  }

  const sourceCenter = connectingFrom ? getCenter(connectingFrom) : null

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        overflow: 'visible', pointerEvents: 'none', zIndex: 0,
      }}
    >
      {/* Rendered connections */}
      {connections.map(conn => {
        const from = getCenter(conn.from)
        const to = getCenter(conn.to)
        if (!from || !to) return null
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        const labelW = conn.label ? Math.max(conn.label.length * 6.5 + 20, 40) : 0
        const labelH = 20

        return (
          <g key={conn.id}>
            {/* Visible dashed line */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="#7C6AF7" strokeWidth="2"
              strokeDasharray="7,5" strokeLinecap="round"
              style={{ pointerEvents: 'none' }}
            />

            {/* Label pill */}
            {conn.label && (
              <>
                <rect
                  x={mx - labelW / 2} y={my - labelH / 2}
                  width={labelW} height={labelH} rx={10}
                  fill="white" stroke="#C4BAF0" strokeWidth="1"
                  style={{ pointerEvents: 'none' }}
                />
                <text
                  x={mx} y={my + 4}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif" fontSize="11" fill="#555"
                  style={{ pointerEvents: 'none' }}
                >
                  {conn.label}
                </text>
              </>
            )}

            {/* Wide invisible hit zone */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="transparent" strokeWidth="20"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation()
                const rect = svgRef.current?.closest('.canvas')?.getBoundingClientRect()
                onLineClick(conn.id, (rect?.left ?? 0) + mx, (rect?.top ?? 0) + my)
              }}
            />
          </g>
        )
      })}

      {/* Preview line while connecting */}
      {sourceCenter && mousePos && (
        <line
          x1={sourceCenter.x} y1={sourceCenter.y}
          x2={mousePos.x} y2={mousePos.y}
          stroke="#7C6AF7" strokeWidth="2"
          strokeDasharray="6,5" strokeLinecap="round"
          opacity="0.5"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  )
}
```

- [ ] **Step 3: Replace src/components/Canvas.tsx**

```tsx
import { useRef, useState, RefObject } from 'react'
import type { Blob, Connection } from '../types'
import BlobWrapper from './BlobWrapper'
import ConnectionsSvg from './ConnectionsSvg'

interface Props {
  canvasRef: RefObject<HTMLDivElement>
  blobs: Blob[]
  connections: Connection[]
  selectedId: string | null
  connectMode: boolean
  connectingFrom: string | null
  onBlobClick: (id: string) => void
  onBlobMove: (id: string, x: number, y: number) => void
  onCanvasClick: () => void
  onCancelConnect: () => void
  onOpenLineEditor: (connId: string, screenX: number, screenY: number) => void
}

export default function Canvas({
  canvasRef, blobs, connections, selectedId, connectMode, connectingFrom,
  onBlobClick, onBlobMove, onCanvasClick, onCancelConnect, onOpenLineEditor,
}: Props) {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  function handleCanvasClick(e: React.MouseEvent) {
    if (e.target !== canvasRef.current) return
    if (connectMode) { onCancelConnect(); return }
    onCanvasClick()
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!connectMode || !connectingFrom) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  function handleMouseLeave() {
    setMousePos(null)
  }

  const isEmpty = blobs.length === 0

  return (
    <div
      ref={canvasRef}
      className={`canvas${connectMode ? ' connect-mode' : ''}`}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ConnectionsSvg
        blobs={blobs}
        connections={connections}
        connectingFrom={connectingFrom}
        mousePos={mousePos}
        onLineClick={onOpenLineEditor}
      />

      {blobs.map((blob, index) => (
        <BlobWrapper
          key={blob.id}
          blob={blob}
          index={index}
          isSelected={blob.id === selectedId}
          isConnectingSource={blob.id === connectingFrom}
          connectMode={connectMode}
          onClick={() => onBlobClick(blob.id)}
          onMove={(x, y) => onBlobMove(blob.id, x, y)}
        />
      ))}

      {isEmpty && (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="#EDE8E0"/>
            <text x="24" y="30" textAnchor="middle" fontSize="20">✦</text>
          </svg>
          <p>Click <strong>+ New part</strong> to meet your first part</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify in dev server**

```bash
npm run dev
```

1. Click "+ New part" — a blob should appear on the canvas with animation
2. Drag it around
3. Click "Connect", click blob A, click blob B — a dashed line should appear between them
4. Click another blob while one is selected — panel would be blank (EditorPanel not yet implemented)

- [ ] **Step 5: Commit**

```bash
git add src/components/Toolbar.tsx src/components/Canvas.tsx src/components/ConnectionsSvg.tsx
git commit -m "feat: wire up canvas, toolbar, blobs, and connection lines"
```

---

## Task 8: Editor Panel

**Files:**
- Modify: `src/components/EditorPanel.tsx`

- [ ] **Step 1: Replace src/components/EditorPanel.tsx**

```tsx
import { COLORS, SIZE_PX } from '../constants'
import { FACES } from '../faces'
import type { Blob } from '../types'

interface Props {
  blob: Blob
  onChange: (changes: Partial<Blob>) => void
}

const SIZES: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg']
const SIZE_LABELS: Record<string, string> = { sm: 'Small', md: 'Medium', lg: 'Large' }

export default function EditorPanel({ blob, onChange }: Props) {
  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value.trim()
    if (val) onChange({ name: val })
    else e.target.value = blob.name // restore if blank
  }

  return (
    <div className="editor">
      <div className="editor-title">Edit part</div>

      <div className="editor-section">
        <div className="editor-label">Name</div>
        <input
          className="name-input"
          defaultValue={blob.name}
          key={blob.id} // reset when blob changes
          onChange={e => onChange({ name: e.target.value || blob.name })}
          onBlur={handleNameBlur}
        />
      </div>

      <hr />

      <div className="editor-section">
        <div className="editor-label">Color</div>
        <div className="color-row">
          {COLORS.map(c => (
            <div
              key={c}
              className={`color-dot${blob.color === c ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => onChange({ color: c })}
            />
          ))}
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-label">Size</div>
        <div className="size-row">
          {SIZES.map(s => (
            <div
              key={s}
              className={`size-btn${blob.size === s ? ' active' : ''}`}
              onClick={() => onChange({ size: s })}
            >
              {SIZE_LABELS[s]}
            </div>
          ))}
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-label">Face</div>
        <div className="face-grid">
          {FACES.map(f => (
            <div
              key={f.id}
              className={`face-btn${blob.face === f.id ? ' active' : ''}`}
              onClick={() => onChange({ face: f.id })}
            >
              <svg width="34" height="34" viewBox="0 0 100 100">{f.draw()}</svg>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div className="editor-section">
        <div className="editor-label">About this part</div>
        <textarea
          className="desc-input"
          placeholder="What does this part do? When does it show up? What does it need?…"
          defaultValue={blob.desc}
          key={blob.id}
          onChange={e => onChange({ desc: e.target.value })}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in dev server**

1. Add a blob, click it — editor panel should appear on the right
2. Change name, color, size, face — blob should update live
3. Type in description textarea
4. Click canvas background — panel should close
5. Click Connect button — panel should close

- [ ] **Step 3: Commit**

```bash
git add src/components/EditorPanel.tsx
git commit -m "feat: implement editor panel"
```

---

## Task 9: Line Label Editor

**Files:**
- Modify: `src/components/LineEditor.tsx`

- [ ] **Step 1: Replace src/components/LineEditor.tsx**

```tsx
import { useRef, useEffect, useState } from 'react'
import type { Connection } from '../types'

interface Props {
  connection: Connection
  position: { x: number; y: number }
  onSave: (label: string) => void
  onDelete: () => void
  onClose: () => void
}

export default function LineEditor({ connection, position, onSave, onDelete, onClose }: Props) {
  const [value, setValue] = useState(connection.label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(connection.label)
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [connection.id])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { onSave(value); return }
    if (e.key === 'Escape') { onClose(); return }
  }

  function handleBlur() {
    // Small delay so delete button click can fire before blur closes
    setTimeout(() => onSave(value), 100)
  }

  return (
    <div
      className="line-editor"
      style={{ left: position.x - 95, top: position.y - 44 }}
    >
      <input
        ref={inputRef}
        className="line-label-input"
        type="text"
        placeholder="Add a note…"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <button
        className="line-delete-btn"
        title="Remove connection"
        onMouseDown={e => e.preventDefault()} // prevent blur before click
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify in dev server**

1. Create a connection between two blobs
2. Click the line — floating editor should appear at the midpoint
3. Type a note, press Enter — note pill should appear on the line
4. Click the line again — editor re-opens with existing label
5. Click ✕ — connection is deleted
6. Press Escape — editor closes without saving

- [ ] **Step 3: Commit**

```bash
git add src/components/LineEditor.tsx
git commit -m "feat: implement line label editor"
```

---

## Task 10: Toast notification

**Files:**
- Modify: `src/components/Toast.tsx`

- [ ] **Step 1: Replace src/components/Toast.tsx**

```tsx
interface Props { show: boolean }

export default function Toast({ show }: Props) {
  return (
    <div className={`toast${show ? ' show' : ''}`}>
      Link copied to clipboard
    </div>
  )
}
```

- [ ] **Step 2: Verify share flow end-to-end**

1. Add 2–3 blobs, connect them, add labels
2. Click "Share link" — toast appears, URL hash updates
3. Copy the URL, open in a new tab — same canvas should restore exactly

- [ ] **Step 3: Commit**

```bash
git add src/components/Toast.tsx
git commit -m "feat: implement toast and verify share/restore flow"
```

---

## Task 11: State logic tests

**Files:**
- Create: `src/__tests__/App.test.tsx`

- [ ] **Step 1: Write App-level logic tests**

Create `src/__tests__/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { makeNewBlob } from '../utils'
import type { Connection } from '../types'

describe('makeNewBlob', () => {
  it('creates blob with required fields', () => {
    const blob = makeNewBlob(800, 600)
    expect(blob.id).toBeTruthy()
    expect(blob.name).toBeTruthy()
    expect(['#7C6AF7','#F7836A','#4BAE8A','#F5C842','#60ADEF',
             '#E879A0','#8BC34A','#FF9F40','#A0522D','#48CAE4']).toContain(blob.color)
    expect(['sm','md','lg']).toContain(blob.size)
    expect(blob.face).toBe('simple')
    expect(blob.desc).toBe('')
    expect(blob.shape).toBeGreaterThanOrEqual(0)
    expect(blob.shape).toBeLessThanOrEqual(4)
    expect(blob.x).toBeGreaterThanOrEqual(60)
    expect(blob.y).toBeGreaterThanOrEqual(60)
  })
})

describe('connection deduplication logic', () => {
  it('detects duplicate in either direction', () => {
    const connections: Connection[] = [
      { id: '1', from: 'a', to: 'b', label: '' },
    ]
    const isDupe = (from: string, to: string) =>
      connections.some(c =>
        (c.from === from && c.to === to) || (c.from === to && c.to === from)
      )
    expect(isDupe('a', 'b')).toBe(true)
    expect(isDupe('b', 'a')).toBe(true)
    expect(isDupe('a', 'c')).toBe(false)
  })
})
```

- [ ] **Step 2: Run all tests**

```bash
npm run test:run
```

Expected: All tests pass (utils + App logic).

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/App.test.tsx
git commit -m "test: add App state logic tests"
```

---

## Task 12: Deploy to Vercel

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Add vercel.json**

Create `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Verify production build**

```bash
npm run build
```

Expected: `dist/` directory created with `index.html` and assets. No build errors.

- [ ] **Step 3: Push to GitHub**

If not already on GitHub:
```bash
# Create a repo at github.com named "whos-talking" first, then:
git remote add origin https://github.com/<your-username>/whos-talking.git
git push -u origin main
```

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel
```

Follow the prompts:
- "Set up and deploy?" → Y
- "Which scope?" → select your account
- "Link to existing project?" → N
- "Project name?" → `whos-talking`
- "In which directory is your code?" → `./`
- Vercel auto-detects Vite; confirm settings

Expected output includes a `.vercel.app` URL. Open it and verify the full app works.

- [ ] **Step 5: Commit vercel config**

```bash
git add vercel.json
git commit -m "feat: add Vercel deployment config"
git push
```

Future pushes to `main` will auto-deploy via Vercel's GitHub integration.
