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
