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
