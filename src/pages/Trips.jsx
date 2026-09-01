import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../services/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { COMPANIES } from '../data/reference'
import { Toast, EmptyState, Spinner } from '../components/UI'

export default function Trips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [km, setKm] = useState('')
  const [purpose, setPurpose] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const q = query(collection(db, 'trips'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const todayTrips = trips.filter(t => t.date === today)
  const todayKm = todayTrips.reduce((s, t) => s + (t.km || 0), 0)

  // month stats
  const month = today.slice(0, 7)
  const monthTrips = trips.filter(t => t.date?.startsWith(month))
  const monthKm = monthTrips.reduce((s, t) => s + (t.km || 0), 0)

  const handleSave = async () => {
    if (!from.trim() || !to.trim() || !km) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'trips'), {
        date: today,
        from: from.trim(),
        to: to.trim(),
        km: Number(km) || 0,
        purpose: purpose.trim(),
        driver: user.name,
        createdAt: serverTimestamp(),
      })
      setToast('Поїздку збережено')
      setFrom(''); setTo(''); setKm(''); setPurpose('')
      setShowAdd(false)
      load()
    } catch (e) {
      console.error(e)
      setToast('Помилка: ' + e.message)
    }
    setSaving(false)
  }

  return (
    <div className="page">
      <Toast message={toast} onClose={() => setToast('')} />
      <h2 className="page-title">🚗 Поїздки</h2>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{todayKm}</div>
          <div className="stat-label">км сьогодні</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{monthKm}</div>
          <div className="stat-label">км за місяць</div>
        </div>
      </div>

      <button className="btn btn-primary btn-block mb-16" onClick={() => setShowAdd(!showAdd)}>
        ➕ Додати поїздку
      </button>

      {/* Add form */}
      {showAdd && (
        <div className="card mb-16">
          <div className="form-group">
            <label className="form-label">Звідки</label>
            <input className="form-input" placeholder="Наприклад: Офіс" value={from}
              onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Куди</label>
            <input className="form-input" placeholder="Наприклад: LIKE Центр" value={to}
              onChange={e => setTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Кілометри</label>
            <input className="form-input" type="number" placeholder="0" value={km}
              onChange={e => setKm(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Мета / заявка (необов'язково)</label>
            <input className="form-input" placeholder="Наприклад: FR-0027 ремонт дверей" value={purpose}
              onChange={e => setPurpose(e.target.value)} />
          </div>
          <button className="btn btn-success btn-block" disabled={!from.trim() || !to.trim() || !km || saving}
            onClick={handleSave}>
            {saving ? 'Зберігаю…' : '✅ Зберегти'}
          </button>
        </div>
      )}

      {/* Today's trips */}
      {loading ? <Spinner /> : (
        <>
          {todayTrips.length > 0 && (
            <>
              <div className="form-label mb-8">Сьогодні</div>
              {todayTrips.map(t => (
                <div key={t.id} className="card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{t.from} → {t.to}</span>
                    <span className="font-bold">{t.km} км</span>
                  </div>
                  {t.purpose && <div className="text-sm text-secondary mt-8">{t.purpose}</div>}
                </div>
              ))}
            </>
          )}

          {/* Month summary */}
          {monthTrips.length > todayTrips.length && (
            <>
              <div className="divider" />
              <div className="form-label mb-8">Раніше цього місяця</div>
              {monthTrips.filter(t => t.date !== today).map(t => (
                <div key={t.id} className="card">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">{t.date}</span>
                    <span className="font-bold">{t.km} км</span>
                  </div>
                  <div className="text-sm">{t.from} → {t.to}</div>
                  {t.purpose && <div className="text-sm text-secondary">{t.purpose}</div>}
                </div>
              ))}
            </>
          )}

          {trips.length === 0 && <EmptyState icon="🚗" text="Поїздок ще немає" />}
        </>
      )}
    </div>
  )
}
