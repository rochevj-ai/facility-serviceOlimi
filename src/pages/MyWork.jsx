import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getRequests, updateStatus, sendTelegramNotify } from '../services/requests'
import RequestCard from '../components/RequestCard'
import { Spinner, EmptyState, Toast } from '../components/UI'

const ACTIVE_STATUSES = ['new', 'accepted', 'driving', 'in_progress', 'needs_materials', 'waiting']

export default function MyWork() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const all = await getRequests()
      setRequests(all.filter(r => ACTIVE_STATUSES.includes(r.status)))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAccept = async (req) => {
    await updateStatus(req.id, 'accepted', user.name, 'Заявку прийнято')
    await sendTelegramNotify('status_change', { ...req, status: 'accepted', by: user.name })
    setToast(`${req.number} прийнято`)
    load()
  }

  // group by priority
  const urgent = requests.filter(r => r.priority === 'urgent')
  const normal = requests.filter(r => r.priority === 'normal')
  const planned = requests.filter(r => r.priority === 'planned')

  return (
    <div className="page">
      <Toast message={toast} onClose={() => setToast('')} />
      <h2 className="page-title">👷 Мої роботи</h2>

      {loading ? <Spinner /> : requests.length === 0 ? (
        <EmptyState icon="✅" text="Всі заявки виконано" />
      ) : (
        <>
          {urgent.length > 0 && (
            <>
              <div className="form-label" style={{ color: '#ef4444' }}>🔴 Термінові</div>
              {urgent.map(r => (
                <RequestCard key={r.id} request={r} showActions onAccept={handleAccept} />
              ))}
            </>
          )}
          {normal.length > 0 && (
            <>
              <div className="form-label mt-16" style={{ color: '#eab308' }}>🟡 Звичайні</div>
              {normal.map(r => (
                <RequestCard key={r.id} request={r} showActions onAccept={handleAccept} />
              ))}
            </>
          )}
          {planned.length > 0 && (
            <>
              <div className="form-label mt-16" style={{ color: '#22c55e' }}>🟢 Планові</div>
              {planned.map(r => (
                <RequestCard key={r.id} request={r} showActions onAccept={handleAccept} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
