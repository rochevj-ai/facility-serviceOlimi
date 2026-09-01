import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRequest, completeRequest, sendTelegramNotify } from '../services/requests'
import { Spinner, Toast } from '../components/UI'

const TIME_OPTIONS = [
  { label: '15 хв', value: 15 },
  { label: '30 хв', value: 30 },
  { label: '45 хв', value: 45 },
  { label: '1 год', value: 60 },
  { label: '1.5 год', value: 90 },
  { label: '2 год', value: 120 },
  { label: '3 год', value: 180 },
  { label: '4+ год', value: 240 },
]

export default function CompleteRequest() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [req, setReq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [workDesc, setWorkDesc] = useState('')
  const [materials, setMaterials] = useState([])
  const [workMinutes, setWorkMinutes] = useState(60)
  const [mileage, setMileage] = useState('')

  useEffect(() => {
    getRequest(id).then(data => { setReq(data); setLoading(false) })
  }, [id])

  const addMaterial = () => setMaterials([...materials, { name: '', price: '' }])
  const updateMaterial = (idx, field, value) => {
    const next = [...materials]; next[idx][field] = value; setMaterials(next)
  }
  const removeMaterial = (idx) => setMaterials(materials.filter((_, i) => i !== idx))
  const totalCost = materials.reduce((s, m) => s + (Number(m.price) || 0), 0)

  const handleComplete = async () => {
    if (!workDesc.trim() || saving) return
    setSaving(true)
    try {
      const payload = {
        by: user.name,
        workDescription: workDesc,
        materials: materials.filter(m => m.name.trim()),
        materialCost: totalCost,
        workMinutes,
        mileage: Number(mileage) || 0,
      }
      await completeRequest(id, payload)
      await sendTelegramNotify('completed', { ...req, ...payload })
      setToast(`${req.number} виконано`)
      setTimeout(() => navigate('/my-work'), 1200)
    } catch (e) {
      console.error(e)
      setToast('Помилка при збереженні')
      setSaving(false)
    }
  }

  if (loading) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <Toast message={toast} onClose={() => setToast('')} />
      <h2 className="page-title">✅ Виконати {req?.number}</h2>

      <div className="form-group">
        <label className="form-label">Що зроблено?</label>
        <textarea className="form-textarea" rows={3} placeholder="Опис виконаних робіт…"
          value={workDesc} onChange={e => setWorkDesc(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Матеріали</label>
        {materials.map((m, i) => (
          <div key={i} className="flex gap-8 mb-8">
            <input className="form-input" style={{ flex: 2 }} placeholder="Назва"
              value={m.name} onChange={e => updateMaterial(i, 'name', e.target.value)} />
            <input className="form-input" style={{ flex: 1 }} placeholder="грн" type="number"
              value={m.price} onChange={e => updateMaterial(i, 'price', e.target.value)} />
            <button className="btn btn-ghost btn-sm" onClick={() => removeMaterial(i)}>✕</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={addMaterial}>➕ Додати матеріал</button>
        {totalCost > 0 && <div className="materials-total mt-8">Разом: {totalCost} грн</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Час роботи</label>
        <div className="chip-grid">
          {TIME_OPTIONS.map(t => (
            <button key={t.value}
              className={`chip ${workMinutes === t.value ? 'selected' : ''}`}
              onClick={() => setWorkMinutes(t.value)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">🚗 Службовий пробіг (км)</label>
        <input className="form-input" type="number" placeholder="0"
          value={mileage} onChange={e => setMileage(e.target.value)} />
      </div>

      <button
        className={`btn ${workDesc.trim() ? 'btn-success' : 'btn-ghost'} btn-block btn-lg`}
        disabled={!workDesc.trim() || saving}
        onClick={handleComplete}
      >
        {saving ? 'Зберігаю…' : '✅ Завершити'}
      </button>
    </div>
  )
}
