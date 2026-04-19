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

// Suppress unused import warnings — Connection is used as a type in other modules
export type { Connection }
