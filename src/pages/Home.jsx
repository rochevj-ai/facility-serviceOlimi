import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const isFacility = user?.role === 'facility'
  const isAdmin = user?.role === 'admin'

  const NAV = [
    { to: '/new', icon: '➕', label: 'Нова заявка', show: true },
    { to: '/my-work', icon: '👷', label: 'Мої роботи', show: isFacility || isAdmin },
    { to: '/requests', icon: '🔧', label: 'Заявки', show: true },
    { to: '/trips', icon: '🚗', label: 'Поїздки', show: isFacility || isAdmin },
    { to: '/daily-report', icon: '📋', label: 'Звіт за день', show: isFacility || isAdmin },
    { to: '/dashboard', icon: '📊', label: 'Dashboard', show: isAdmin },
  ]

  return (
    <div className="page">
      <div className="nav-grid">
        {NAV.filter(n => n.show).map(n => (
          <Link key={n.to} to={n.to} className="nav-btn">
            <span className="icon">{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
