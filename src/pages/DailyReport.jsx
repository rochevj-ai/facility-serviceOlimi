import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getRequests, saveDailyReport, sendTelegramNotify } from '../services/requests'
import { COMPANIES } from '../data/reference'
import { StatusBadge, Toast } from '../components/UI'

export default function DailyReport() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  // extra works
  const [extras, setExtras] = useState([])
  const addExtra = () => setExtras([...extras, { company: '', desc: '', minutes: 15, cost: 0 }])
  const updateExtra = (i, f, v) => {
    const next = [...extras]; next[i][f] = v; setExtras(next)
  }
  const removeExtra = (i) => setExtras(extras.filter((_, idx) => idx !== i))

  // mileage
  const [mileage, setMileage] = useState('')
  const [odometerStart, setOdometerStart] = useState('')
  const [odometerEnd, setOdometerEnd] = useState('')
  const [comment, setComment] = useState('')

  const computedMileage = odometerStart && odometerEnd
    ? Math.max(0, Number(odometerEnd) - Number(odometerStart))
    : Number(mileage) || 0

  useEffect(() => {
    getRequests().then(data => setRequests(data))
  }, [])

  // today's completed
  const todayDone = requests.filter(r => {
    if (r.status !== 'done') return false
    if (!r.completedAt) return false
    const d = r.completedAt.toDate ? r.completedAt.toDate() : new Date(r.completedAt)
    return d.toISOString().slice(0, 10) === today
  })

  const remaining = requests.filter(r =>
    ['accepted', 'in_progress', 'driving', 'needs_materials', 'waiting'].includes(r.status)
  )

  const totalMaterials = todayDone.reduce((s, r) => s + (r.materialCost || 0), 0)
  const totalMinutes = todayDone.reduce((s, r) => s + (r.workMinutes || 0), 0)

  const handleSubmit = async () => {
    if (saving) return
    setSaving(true)
    try {
      const report = {
        date: today,
        employee: user.name,
        completedRequests: todayDone.map(r => r.number),
        remainingRequests: remaining.map(r => r.number),
        extraWorks: extras.filter(e => e.desc.trim()),
        mileage: computedMileage,
        odometerStart: Number(odometerStart) || null,
        odometerEnd: Number(odometerEnd) || null,
        materialCost: totalMaterials,
        totalMinutes,
        comment,
      }
      await saveDailyReport(report)
      await sendTelegramNotify('daily_report', report)
      setToast('Звіт збережено та надіслано')
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      setToast('Помилка збереження')
    }
    setSaving(false)
  }

  const formatMinutes = (m) => {
    if (m < 60) return `${m} хв`
    return `${Math.floor(m / 60)} год ${m % 60 > 0 ? `${m % 60} хв` : ''}`
  }

  if (submitted) {
    return (
      <div className="page">
        <Toast message={toast} onClose={() => setToast('')} />
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <h2>Звіт за {today} збережено</h2>
          <p className="text-secondary mt-8">Звіт надіслано в Telegram</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Toast message={toast} onClose={() => setToast('')} />
      <h2 className="page-title">📋 Звіт за день</h2>
      <p className="text-sm text-secondary mb-16">{today} — {user.name}</p>

      {/* Today done */}
      <div className="card">
        <div className="form-label">✅ Виконано сьогодні ({todayDone.length})</div>
        {todayDone.length === 0 ? (
          <div className="text-sm text-secondary">Немає виконаних заявок</div>
        ) : (
          todayDone.map(r => (
            <div key={r.id} className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold">{r.number}</span>
              <span className="text-sm text-secondary truncate" style={{ flex: 1, margin: '0 8px' }}>
                {r.object} — {r.description?.slice(0, 40)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Remaining */}
      <div className="card">
        <div className="form-label">🔧 Залишилось ({remaining.length})</div>
        {remaining.length === 0 ? (
          <div className="text-sm text-secondary">Все виконано</div>
        ) : (
          remaining.map(r => (
            <div key={r.id} className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold">{r.number}</span>
              <StatusBadge status={r.status} />
            </div>
          ))
        )}
      </div>

      {/* Extra works */}
      <div className="card">
        <div className="form-label">➕ Додаткові роботи</div>
        {extras.map((ex, i) => (
          <div key={i} className="mb-16" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            <div className="form-group">
              <select
                className="form-input"
                value={ex.company}
                onChange={e => updateExtra(i, 'company', e.target.value)}
              >
                <option value="">Об'єкт…</option>
                {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Опис роботи…"
                value={ex.desc}
                onChange={e => updateExtra(i, 'desc', e.target.value)}
              />
            </div>
            <div className="flex gap-8">
              <input
                className="form-input"
                type="number"
                placeholder="Хвилин"
                value={ex.minutes}
                onChange={e => updateExtra(i, 'minutes', Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <input
                className="form-input"
                type="number"
                placeholder="Матеріали, грн"
                value={ex.cost}
                onChange={e => updateExtra(i, 'cost', Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <button className="btn btn-ghost btn-sm" onClick={() => removeExtra(i)}>✕</button>
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm btn-block" onClick={addExtra}>
          ➕ Додати виконану роботу
        </button>
      </div>

      {/* Mileage */}
      <div className="card">
        <div className="form-label">🚗 Службовий пробіг</div>
        <div className="form-group">
          <input
            className="form-input"
            type="number"
            placeholder="Загальний пробіг за день, км"
            value={mileage}
            onChange={e => setMileage(e.target.value)}
          />
        </div>
        <div className="text-sm text-secondary mb-8">або за одометром:</div>
        <div className="flex gap-8">
          <input
            className="form-input"
            type="number"
            placeholder="Початок"
            value={odometerStart}
            onChange={e => setOdometerStart(e.target.value)}
          />
          <input
            className="form-input"
            type="number"
            placeholder="Кінець"
            value={odometerEnd}
            onChange={e => setOdometerEnd(e.target.value)}
          />
        </div>
        {computedMileage > 0 && (
          <div className="font-bold mt-8">Пробіг: {computedMileage} км</div>
        )}
      </div>

      {/* Comment */}
      <div className="card">
        <div className="form-label">Коментар</div>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="Плани на завтра, примітки…"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="card">
        <div className="form-label">Підсумок</div>
        <div className="text-sm">✅ Виконано: {todayDone.length}</div>
        <div className="text-sm">🔧 Залишилось: {remaining.length}</div>
        <div className="text-sm">🚗 Пробіг: {computedMileage} км</div>
        <div className="text-sm">💰 Матеріали: {totalMaterials} грн</div>
        <div className="text-sm">⏱ Робочий час: {formatMinutes(totalMinutes)}</div>
      </div>

      <button
        className="btn btn-success btn-block btn-lg"
        disabled={saving}
        onClick={handleSubmit}
      >
        {saving ? 'Зберігаю…' : '✅ Завершити робочий день'}
      </button>
    </div>
  )
}
