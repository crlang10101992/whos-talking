import { describe, it, expect } from 'vitest'
import { randInt, getBlobCenter, serialize, deserialize } from '../utils'
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
