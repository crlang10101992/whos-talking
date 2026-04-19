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
