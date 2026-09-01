import { useState, useEffect } from 'react'
import { getRequests } from '../services/requests'
import { STATUSES, COMPANIES } from '../data/reference'
import RequestCard from '../components/RequestCard'
import { Spinner, EmptyState } from '../components/UI'

export default function RequestsList() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getRequests()
      setRequests(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const filtered = requests.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false
    if (filterCompany && r.company !== filterCompany) return false
    return true
  })

  return (
    <div className="page">
      <div className="flex justify-between items-center mb-16">
        <h2 className="page-title" style={{ margin: 0 }}>🔧 Заявки</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
          🔍 Фільтр
        </button>
      </div>

      {showFilters && (
        <div className="card mb-16">
          <div className="form-group">
            <label className="form-label">Статус</label>
            <div className="chip-grid">
              <button className={`chip ${!filterStatus ? 'selected' : ''}`} onClick={() => setFilterStatus('')}>Всі</button>
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  className={`chip ${filterStatus === s.id ? 'selected' : ''}`}
                  onClick={() => setFilterStatus(s.id)}
                >{s.icon} {s.label}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Напрямок</label>
            <div className="chip-grid">
              <button className={`chip ${!filterCompany ? 'selected' : ''}`} onClick={() => setFilterCompany('')}>Всі</button>
              {COMPANIES.map(c => (
                <button
                  key={c.id}
                  className={`chip ${filterCompany === c.id ? 'selected' : ''}`}
                  onClick={() => setFilterCompany(c.id)}
                >{c.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState text="Заявок не знайдено" />
      ) : (
        filtered.map(r => <RequestCard key={r.id} request={r} />)
      )}
    </div>
  )
}
