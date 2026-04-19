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
