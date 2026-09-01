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
}

export default function Login() {
  const { users, login } = useAuth()

  return (
    <div className="login-screen">
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔧</div>
      <h1>Facility Service</h1>
      <p>Оберіть профіль для входу</p>
      <div className="login-list">
        {users.map(u => (
          <button key={u.id} className="nav-btn" onClick={() => login(u.id)}>
            <span className="icon">
              {u.role === 'facility' ? '👷' : u.role === 'admin' ? '⚙️' : '👤'}
            </span>
            <div>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 400 }}>
                {ROLE_LABELS[u.role]}{u.company ? ` · ${COMPANY_LABELS[u.company]}` : ''}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
