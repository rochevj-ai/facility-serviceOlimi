import { getStatus, getPriority, getCategory } from '../data/reference'

export function StatusBadge({ status }) {
  const s = getStatus(status)
  return <span className={`badge badge-${status}`}>{s.icon} {s.label}</span>
}

export function PriorityBadge({ priority }) {
  const p = getPriority(priority)
  return <span className={`badge badge-${priority}`}>{p.icon} {p.label}</span>
}

export function CategoryLabel({ category }) {
  const c = getCategory(category)
  return <span>{c.icon} {c.label}</span>
}

export function Toast({ message, onClose }) {
  if (!message) return null
  setTimeout(onClose, 3000)
  return (
    <div className="toast-container">
      <div className="toast">{message}</div>
    </div>
  )
}

export function Spinner() {
  return <div className="spinner" />
}

export function EmptyState({ icon = '📭', text }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <div>{text}</div>
    </div>
  )
}
