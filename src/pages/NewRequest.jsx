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

  const [form, setForm] = useState({
    company: '',
    object: '',
    category: '',
    description: '',
    priority: 'normal',
    deadline: 'this_week',
    deadlineDate: '',
    contact: user?.name || '',
    contactPhone: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const objects = OBJECTS_BY_COMPANY[form.company] || []
  const canSubmit = form.company && form.object && form.category && form.description.trim()

  const handleSubmit = async () => {
    if (!canSubmit || saving) return
    setSaving(true)
    try {
      const req = await createRequest({ ...form, createdBy: user.name })
      await sendTelegramNotify('new_request', req)
      setToast(`Заявку ${req.number} створено`)
      setTimeout(() => navigate('/requests'), 1200)
    } catch (e) {
      console.error(e)
      setToast('Помилка при створенні')
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
              className={`chip ${form.company === c.id ? 'selected' : ''}`}
              onClick={() => { set('company', c.id); set('object', '') }}
            >{c.label}</button>
          ))}
        </div>
      </div>

      {form.company && (
        <div className="form-group">
          <label className="form-label">Об'єкт</label>
          <div className="chip-grid">
            {objects.map(o => (
              <button
                key={o}
                className={`chip ${form.object === o ? 'selected' : ''}`}
                onClick={() => set('object', o)}
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
              className={`chip ${form.category === c.id ? 'selected' : ''}`}
              onClick={() => set('category', c.id)}
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
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Пріоритет</label>
        {PRIORITIES.map(p => (
          <div
            key={p.id}
            className={`priority-option ${form.priority === p.id ? 'selected' : ''}`}
            style={form.priority === p.id ? { borderColor: p.color, color: p.color } : {}}
            onClick={() => set('priority', p.id)}
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
              className={`chip ${form.deadline === d.id ? 'selected' : ''}`}
              onClick={() => set('deadline', d.id)}
            >{d.label}</button>
          ))}
        </div>
        {form.deadline === 'custom' && (
          <input
            type="date"
            className="form-input mt-8"
            value={form.deadlineDate}
            onChange={e => set('deadlineDate', e.target.value)}
          />
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Контактна особа</label>
        <input
          className="form-input"
          placeholder="Ім'я"
          value={form.contact}
          onChange={e => set('contact', e.target.value)}
        />
        <input
          className="form-input mt-8"
          placeholder="Телефон (необов'язково)"
          type="tel"
          value={form.contactPhone}
          onChange={e => set('contactPhone', e.target.value)}
        />
      </div>

      <button
        className={`btn ${canSubmit ? 'btn-primary' : 'btn-ghost'} btn-block btn-lg`}
        disabled={!canSubmit || saving}
        onClick={handleSubmit}
      >
        {saving ? 'Зберігаю…' : '✅ Створити заявку'}
      </button>
    </div>
  )
}
