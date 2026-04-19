export default function Toast({ show }: { show: boolean }) {
  return <div className={`toast${show ? ' show' : ''}`}>Link copied to clipboard</div>
}
