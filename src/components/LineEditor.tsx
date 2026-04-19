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
