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
  const [toastMessage, setToastMessage] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)
  const hasUnsavedRef = useRef(false)
  const loadedFromSavedLinkRef = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restore from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const state = deserialize(hash)
      setBlobs(state.blobs)
      setConnections(state.connections)
      loadedFromSavedLinkRef.current = true
    }
  }, [])

  const showSaveReminder = useCallback(() => {
    if (!hasUnsavedRef.current || !loadedFromSavedLinkRef.current) return
    setToastMessage("Don't forget to copy your link to save these changes.")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }, [])

  const markUnsaved = useCallback(() => {
    hasUnsavedRef.current = true
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(showSaveReminder, 30000)
  }, [showSaveReminder])

  // ---- Blob handlers ----

  const addBlob = useCallback(() => {
    const canvas = canvasRef.current
    const w = canvas?.clientWidth ?? 800
    const h = canvas?.clientHeight ?? 600
    const blob = makeNewBlob(w, h)
    setBlobs(prev => [...prev, blob])
    setSelectedId(blob.id)
    setConnectMode(false)
    markUnsaved()
  }, [markUnsaved])

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
    markUnsaved()
  }, [markUnsaved])

  const moveBlob = useCallback((id: string, x: number, y: number) => {
    setBlobs(prev => prev.map(b => b.id === id ? { ...b, x, y } : b))
    markUnsaved()
  }, [markUnsaved])

  const deleteBlob = useCallback((id: string) => {
    setBlobs(prev => prev.filter(b => b.id !== id))
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id))
    setSelectedId(null)
    markUnsaved()
  }, [markUnsaved])

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
        markUnsaved()
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
    markUnsaved()
  }, [editingConnId, markUnsaved])

  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id))
    setEditingConnId(null)
    markUnsaved()
  }, [markUnsaved])

  const closeLineEditor = useCallback(() => {
    setEditingConnId(null)
  }, [])

  // ---- Share ----

  const shareLink = useCallback(() => {
    const hash = serialize({ blobs, connections })
    window.location.hash = hash
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    hasUnsavedRef.current = false
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    setToastMessage('Link copied — paste it to return to this mapping')
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
          onDelete={() => deleteBlob(selectedBlob.id)}
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
      <Toast show={showToast} message={toastMessage} />
    </>
  )
}
