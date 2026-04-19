import { useRef, useState } from 'react'
import { WOBBLE_ANIMS } from '../constants'
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
