import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRequest, updateStatus, setNeedsMaterials, sendTelegramNotify } from '../services/requests'
import { getCompany, getCategory } from '../data/reference'
import { StatusBadge, PriorityBadge, Spinner, Toast } from '../components/UI'

export default function RequestView() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [req, setReq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [showMaterials, setShowMaterials] = useState(false)
  const [matForm, setMatForm] = useState({ text: '', cost: '', comment: '' })

  const load = async () => {
    const data = await getRequest(id)
    setReq(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div className="page"><Spinner /></div>
  if (!req) return <div className="page"><p>Заявку не знайдено</p></div>

  const company = getCompany(req.company)
  const cat = getCategory(req.category)
  const isFacility = user?.role === 'facility' || user?.role === 'admin'
  const isActive = !['done', 'cancelled'].includes(req.status)

  const changeStatus = async (status, note) => {
    await updateStatus(id, status, user.name, note)
    await sendTelegramNotify('status_change', { ...req, status, by: user.name })
    setToast(`Статус змінено`)
    load()
  }

  const handleMaterialsSubmit = async () => {
    await setNeedsMaterials(id, {
      materialsNeeded: matForm.text,
      estimatedCost: Number(matForm.cost) || 0,
      comment: matForm.comment,
      by: user.name,
    })
    setShowMaterials(false)
    setToast('Запит на матеріали збережено')
    load()
  }

  const formatTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page">
      <Toast message={toast} onClose={() => setToast('')} />

      <div className="card">
        <div className="flex justify-between items-center mb-8">
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{req.number}</span>
          <PriorityBadge priority={req.priority} />
        </div>
        <StatusBadge status={req.status} />
        <div className="divider" />
        <div className="text-sm mb-8"><strong>Об'єкт:</strong> {company?.label} → {req.object}</div>
        <div className="text-sm mb-8"><strong>Категорія:</strong> {cat.icon} {cat.label}</div>
        <div className="text-sm mb-8"><strong>Контакт:</strong> {req.contact} {req.contactPhone && `(${req.contactPhone})`}</div>
        <div className="divider" />
        <div style={{ fontSize: '.95rem', lineHeight: 1.5 }}>{req.description}</div>

        {req.status === 'done' && req.workDescription && (
          <>
            <div className="divider" />
            <div className="form-label">Виконана робота</div>
            <div style={{ fontSize: '.95rem' }}>{req.workDescription}</div>
            {req.materials?.length > 0 && (
              <div className="mt-8">
                <table className="materials-table">
                  <thead><tr><th>Матеріал</th><th className="price">Сума</th></tr></thead>
                  <tbody>
                    {req.materials.map((m, i) => (
                      <tr key={i}><td>{m.name}</td><td className="price">{m.price} грн</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="materials-total">Разом: {req.materialCost} грн</div>
              </div>
            )}
            {req.workMinutes > 0 && (
              <div className="text-sm mt-8">⏱ Час: {req.workMinutes >= 60 ? `${Math.floor(req.workMinutes / 60)} год ${req.workMinutes % 60 > 0 ? req.workMinutes % 60 + ' хв' : ''}` : `${req.workMinutes} хв`}</div>
            )}
            {req.mileage > 0 && (
              <div className="text-sm mt-8">🚗 Пробіг: {req.mileage} км</div>
            )}
          </>
        )}

        {req.materialsNeeded && (
          <>
            <div className="divider" />
            <div className="form-label">🛒 Потрібні матеріали</div>
            <div className="text-sm">{req.materialsNeeded}</div>
            {req.estimatedCost > 0 && <div className="text-sm mt-8">Орієнтовно: {req.estimatedCost} грн</div>}
            {req.materialsComment && <div className="text-sm mt-8 text-secondary">{req.materialsComment}</div>}
          </>
        )}
      </div>

      {isFacility && isActive && (
        <div className="card">
          <div className="form-label">Дії</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {req.status === 'new' && (
              <button className="btn btn-primary btn-block" onClick={() => changeStatus('accepted', 'Заявку прийнято')}>
                👌 Прийняти
              </button>
            )}
            {['accepted', 'needs_materials'].includes(req.status) && (
              <button className="btn btn-warning btn-block" onClick={() => changeStatus('driving', 'Виїхав')}>
                🚗 Виїхав
              </button>
            )}
            {['accepted', 'driving'].includes(req.status) && (
              <button className="btn btn-ghost btn-block" onClick={() => changeStatus('in_progress', 'В роботі')}>
                🔧 В роботі
              </button>
            )}
            {!['done', 'cancelled', 'needs_materials'].includes(req.status) && (
              <button className="btn btn-outline btn-block" onClick={() => setShowMaterials(true)}>
                🛒 Потрібні матеріали
              </button>
            )}
            {['in_progress', 'driving', 'accepted'].includes(req.status) && (
              <button className="btn btn-success btn-block" onClick={() => navigate(`/complete/${id}`)}>
                ✅ Виконати заявку
              </button>
            )}
            {req.status !== 'cancelled' && (
              <button className="btn btn-danger btn-sm" onClick={() => changeStatus('cancelled', 'Скасовано')}>
                ❌ Скасувати
              </button>
            )}
          </div>
        </div>
      )}

      {req.timeline?.length > 0 && (
        <div className="card">
          <div className="form-label mb-8">Історія</div>
          <div className="timeline">
            {req.timeline.map((t, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-time">{formatTime(t.at)} — {t.by}</div>
                <div className="timeline-text">{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMaterials && (
        <div className="overlay" onClick={() => setShowMaterials(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-title">🛒 Потрібні матеріали</div>
            <div className="form-group">
              <label className="form-label">Що потрібно купити?</label>
              <textarea className="form-textarea" rows={3} value={matForm.text}
                onChange={e => setMatForm(f => ({ ...f, text: e.target.value }))}
                placeholder="Перелік матеріалів…" />
            </div>
            <div className="form-group">
              <label className="form-label">Орієнтовна сума (грн)</label>
              <input className="form-input" type="number" value={matForm.cost}
                onChange={e => setMatForm(f => ({ ...f, cost: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Коментар</label>
              <textarea className="form-textarea" rows={2} value={matForm.comment}
                onChange={e => setMatForm(f => ({ ...f, comment: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-block" onClick={handleMaterialsSubmit}>Зберегти</button>
          </div>
        </div>
      )}
    </div>
  )
}
