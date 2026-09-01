import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { COMPANIES, OBJECTS_BY_COMPANY, CATEGORIES, PRIORITIES, DEADLINES } from '../data/reference'
import { createRequest, sendTelegramNotify } from '../services/requests'
import { Toast } from '../components/UI'

export default function NewRequest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const [company, setCompany] = useState('')
  const [object, setObject] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [deadline, setDeadline] = useState('this_week')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [contact, setContact] = useState(user?.name || '')
  const [contactPhone, setContactPhone] = useState('')

  const objects = OBJECTS_BY_COMPANY[company] || []

  const handleSubmit = async () => {
    if (saving) return

    if (!company) { setError('Оберіть напрямок'); return }
    if (!object) { setError('Оберіть об\'єкт'); return }
    if (!category) { setError('Оберіть категорію'); return }
    if (!description.trim()) { setError('Опишіть що потрібно зробити'); return }

    setError('')
    setSaving(true)
    try {
      const form = {
        company, object, category, description,
        priority, deadline, deadlineDate,
        contact, contactPhone,
        createdBy: user.name,
      }
      const req = await createRequest(form)
      await sendTelegramNotify('new_request', req)
      setToast(`Заявку ${req.number} створено`)
      setTimeout(() => navigate('/requests'), 1200)
    } catch (e) {
      console.error(e)
      setError('Помилка: ' + e.message)
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <Toast message={toast} onClose={() => setToast('')} />
      <h2 className="page-title">➕ Нова заявка</h2>

      <div className="form-group">
        <label className="form-label">Напрямок / компанія</label>
        <div className="chip-grid">
          {COMPANIES.map(c => (
            <button
              key={c.id}
              type="button"
              className={`chip ${company === c.id ? 'selected' : ''}`}
              onClick={() => { setCompany(c.id); setObject('') }}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {company && (
        <div className="form-group">
          <label className="form-label">Об'єкт</label>
          <div className="chip-grid">
            {objects.map(o => (
              <button
                key={o}
                type="button"
                className={`chip ${object === o ? 'selected' : ''}`}
                onClick={() => setObject(o)}
              >{o}</button>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Категорія</label>
        <div className="chip-grid">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              className={`chip ${category === c.id ? 'selected' : ''}`}
              onClick={() => setCategory(c.id)}
            >{c.icon} {c.label}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Що потрібно зробити?</label>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="Опишіть проблему або роботу…"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Пріоритет</label>
        {PRIORITIES.map(p => (
          <div
            key={p.id}
            className={`priority-option ${priority === p.id ? 'selected' : ''}`}
            style={priority === p.id ? { borderColor: p.color, color: p.color } : {}}
            onClick={() => setPriority(p.id)}
          >
            <span className="icon">{p.icon}</span>
            <div>
              <div className="label">{p.label}</div>
              <div className="desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">Бажаний строк</label>
        <div className="chip-grid">
          {DEADLINES.map(d => (
            <button
              key={d.id}
              type="button"
              className={`chip ${deadline === d.id ? 'selected' : ''}`}
              onClick={() => setDeadline(d.id)}
            >{d.label}</button>
          ))}
        </div>
        {deadline === 'custom' && (
          <input
            type="date"
            className="form-input mt-8"
            value={deadlineDate}
            onChange={e => setDeadlineDate(e.target.value)}
          />
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Контактна особа</label>
        <input
          className="form-input"
          placeholder="Ім'я"
          value={contact}
          onChange={e => setContact(e.target.value)}
        />
        <input
          className="form-input mt-8"
          placeholder="Телефон (необов'язково)"
          type="tel"
          value={contactPhone}
          onChange={e => setContactPhone(e.target.value)}
        />
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-block btn-lg"
        disabled={saving}
        onClick={handleSubmit}
      >
        {saving ? 'Зберігаю…' : '✅ Створити заявку'}
      </button>
    </div>
  )
}
