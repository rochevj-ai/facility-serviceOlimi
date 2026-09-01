import { useState, useEffect } from 'react'
import { getRequests } from '../services/requests'
import { Spinner } from '../components/UI'

export default function Dashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRequests().then(data => { setRequests(data); setLoading(false) })
  }, [])

  if (loading) return <div className="page"><Spinner /></div>

  const today = new Date().toISOString().slice(0, 10)
  const month = today.slice(0, 7)

  const isToday = (r) => {
    if (!r.createdAt) return false
    const d = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
    return d.toISOString().slice(0, 10) === today
  }

  const isMonth = (r) => {
    if (!r.createdAt) return false
    const d = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt)
    return d.toISOString().slice(0, 7) === month
  }

  const todayNew = requests.filter(r => isToday(r) && r.status === 'new').length
  const inWork = requests.filter(r => ['in_progress', 'driving', 'accepted'].includes(r.status)).length
  const needsMat = requests.filter(r => r.status === 'needs_materials').length
  const urgentActive = requests.filter(r => r.priority === 'urgent' && !['done', 'cancelled'].includes(r.status)).length
  const todayDone = requests.filter(r => {
    if (r.status !== 'done' || !r.completedAt) return false
    const d = r.completedAt.toDate ? r.completedAt.toDate() : new Date(r.completedAt)
    return d.toISOString().slice(0, 10) === today
  }).length

  const monthReqs = requests.filter(isMonth)
  const monthDone = monthReqs.filter(r => r.status === 'done').length
  const monthMaterials = monthReqs.reduce((s, r) => s + (r.materialCost || 0), 0)
  const monthMileage = monthReqs.reduce((s, r) => s + (r.mileage || 0), 0)

  return (
    <div className="page">
      <h2 className="page-title">📊 Dashboard</h2>

      <div className="form-label mb-8">Сьогодні</div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>{todayNew}</div>
          <div className="stat-label">🆕 Нових</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f97316' }}>{inWork}</div>
          <div className="stat-label">🔧 В роботі</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ec4899' }}>{needsMat}</div>
          <div className="stat-label">🛒 Матеріали</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>{urgentActive}</div>
          <div className="stat-label">🔴 Термінових</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
          <div className="stat-value" style={{ color: '#22c55e' }}>{todayDone}</div>
          <div className="stat-label">✅ Виконано сьогодні</div>
        </div>
      </div>

      <div className="divider" />

      <div className="form-label mb-8">Цього місяця</div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{monthReqs.length}</div>
          <div className="stat-label">Заявок</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>{monthDone}</div>
          <div className="stat-label">Виконано</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{monthMaterials.toLocaleString()}</div>
          <div className="stat-label">💰 Матеріали, грн</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{monthMileage}</div>
          <div className="stat-label">🚗 Пробіг, км</div>
        </div>
      </div>
    </div>
  )
}
