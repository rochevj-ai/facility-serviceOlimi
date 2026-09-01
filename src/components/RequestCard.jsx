import { Link } from 'react-router-dom'
import { StatusBadge, PriorityBadge, CategoryLabel } from './UI'
import { getCompany } from '../data/reference'

export default function RequestCard({ request, showActions, onAccept }) {
  const r = request
  const company = getCompany(r.company)

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-number">{r.number}</span>
        <PriorityBadge priority={r.priority} />
      </div>
      <div className="card-object">
        {company?.label} → {r.object}
      </div>
      <div className="card-desc">{r.description}</div>
      <div className="card-footer">
        <StatusBadge status={r.status} />
        <CategoryLabel category={r.category} />
      </div>
      <div className="status-actions">
        <Link to={`/requests/${r.id}`} className="btn btn-ghost btn-sm">👁 Відкрити</Link>
        {showActions && r.status === 'new' && (
          <button className="btn btn-primary btn-sm" onClick={() => onAccept?.(r)}>
            👌 Прийняти
          </button>
        )}
      </div>
    </div>
  )
}
