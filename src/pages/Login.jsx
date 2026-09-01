import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const ROLE_LABELS = {
  admin: 'Адміністратор',
  facility: 'Facility Manager',
  manager: 'Керівник',
}

const COMPANY_LABELS = {
  tier: 'TIER',
  olimi: 'OLIMI',
  like: 'LIKE',
  razom: 'RAZOM',
  office: 'Офіс',
}

export default function Login() {
  const { users, login } = useAuth()
  const [pinFor, setPinFor] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleClick = (u) => {
    if (u.pin) {
      setPinFor(u)
      setPin('')
      setError('')
    } else {
      login(u.id)
    }
  }

  const handlePin = () => {
    const ok = login(pinFor.id, pin)
    if (!ok) {
      setError('Невірний пароль')
      setPin('')
    }
  }

  if (pinFor) {
    return (
      <div className="login-screen">
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔐</div>
        <h1>{pinFor.name}</h1>
        <p>Введіть пароль</p>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <input
            className="form-input"
            type="password"
            inputMode="numeric"
            placeholder="Пароль"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePin()}
            autoFocus
            style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: 8, marginBottom: 12 }}
          />
          {error && <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary btn-block" onClick={handlePin}>Увійти</button>
          <button className="btn btn-ghost btn-block mt-8" onClick={() => setPinFor(null)}>← Назад</button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-screen">
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔧</div>
      <h1>Facility Service</h1>
      <p>Оберіть профіль для входу</p>
      <div className="login-list">
        {users.map(u => (
          <button key={u.id} className="nav-btn" onClick={() => handleClick(u)}>
            <span className="icon">
              {u.role === 'facility' ? '👷' : u.role === 'admin' ? '⚙️' : '👤'}
            </span>
            <div>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 400 }}>
                {ROLE_LABELS[u.role]}{u.company ? ` · ${COMPANY_LABELS[u.company] || u.company}` : ''}
              </div>
            </div>
            {u.pin && <span style={{ marginLeft: 'auto', fontSize: '.9rem' }}>🔐</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
