import { useState } from 'react'

interface Props {
  connectMode: boolean
  onToggleConnect: () => void
  onAddBlob: () => void
  onShare: () => void
}

export default function Toolbar({ connectMode, onToggleConnect, onAddBlob, onShare }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleAction(fn: () => void) {
    fn()
    setMenuOpen(false)
  }

  return (
    <>
      <div className="toolbar">
        <div className="app-name">Who's <span>Talking?</span></div>

        {/* Desktop buttons */}
        <div className="toolbar-actions toolbar-desktop">
          <button className="btn btn-ghost" onClick={onShare} title="Copy this link to return to your parts mapping. Re-copy after making edits to save changes.">Copy Link to Save</button>
          <button
            className={`btn btn-connect${connectMode ? ' active' : ''}`}
            onClick={onToggleConnect}
          >
            Connect
          </button>
          <button className="btn btn-primary" onClick={onAddBlob}>+ New part</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-item" onClick={() => handleAction(onAddBlob)}>+ New part</button>
          <button
            className={`mobile-menu-item${connectMode ? ' active' : ''}`}
            onClick={() => handleAction(onToggleConnect)}
          >
            {connectMode ? 'Connect (on)' : 'Connect'}
          </button>
          <button className="mobile-menu-item" onClick={() => handleAction(onShare)}>Copy Link to Save</button>
        </div>
      )}

      {/* Backdrop to close menu */}
      {menuOpen && <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />}
    </>
  )
}
