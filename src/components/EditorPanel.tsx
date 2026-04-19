import { COLORS } from '../constants'
import { FACES } from '../faces'
import type { Blob } from '../types'

interface Props {
  blob: Blob
  onChange: (changes: Partial<Blob>) => void
}

const SIZES: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg']
const SIZE_LABELS: Record<string, string> = { sm: 'Small', md: 'Medium', lg: 'Large' }

export default function EditorPanel({ blob, onChange }: Props) {
  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value.trim()
    if (val) onChange({ name: val })
    else e.target.value = blob.name // restore if blank
  }

  return (
    <div className="editor">
      <div className="editor-title">Edit part</div>

      <div className="editor-section">
        <div className="editor-label">Name</div>
        <input
          className="name-input"
          defaultValue={blob.name}
          key={blob.id} // reset when blob changes
          onChange={e => onChange({ name: e.target.value || blob.name })}
          onBlur={handleNameBlur}
        />
      </div>

      <hr />

      <div className="editor-section">
        <div className="editor-label">Color</div>
        <div className="color-row">
          {COLORS.map(c => (
            <div
              key={c}
              className={`color-dot${blob.color === c ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => onChange({ color: c })}
            />
          ))}
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-label">Size</div>
        <div className="size-row">
          {SIZES.map(s => (
            <div
              key={s}
              className={`size-btn${blob.size === s ? ' active' : ''}`}
              onClick={() => onChange({ size: s })}
            >
              {SIZE_LABELS[s]}
            </div>
          ))}
        </div>
      </div>

      <div className="editor-section">
        <div className="editor-label">Face</div>
        <div className="face-grid">
          {FACES.map(f => (
            <div
              key={f.id}
              className={`face-btn${blob.face === f.id ? ' active' : ''}`}
              onClick={() => onChange({ face: f.id })}
            >
              <svg width="34" height="34" viewBox="0 0 100 100">{f.draw()}</svg>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div className="editor-section">
        <div className="editor-label">About this part</div>
        <textarea
          className="desc-input"
          placeholder="What does this part do? When does it show up? What does it need?…"
          defaultValue={blob.desc}
          key={blob.id}
          onChange={e => onChange({ desc: e.target.value })}
        />
      </div>
    </div>
  )
}
