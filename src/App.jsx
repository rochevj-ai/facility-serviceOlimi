import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import NewRequest from './pages/NewRequest'
import RequestsList from './pages/RequestsList'
import RequestView from './pages/RequestView'
import MyWork from './pages/MyWork'
import CompleteRequest from './pages/CompleteRequest'
import DailyReport from './pages/DailyReport'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="header">
      {!isHome && (
        <button className="header-back" onClick={() => navigate(-1)}>←</button>
      )}
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🔧 Facility Service</h1>
      <div className="header-right">
        <span className="header-user">{user?.name}</span>
        <button
          className="header-back"
          onClick={logout}
          title="Вийти"
          style={{ fontSize: '1.1rem' }}
        >⏻</button>
      </div>
    </header>
  )
}

export default function App() {
  const { user } = useAuth()

  if (!user) return <Login />

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<NewRequest />} />
        <Route path="/requests" element={<RequestsList />} />
        <Route path="/requests/:id" element={<RequestView />} />
        <Route path="/my-work" element={<MyWork />} />
        <Route path="/complete/:id" element={<CompleteRequest />} />
        <Route path="/daily-report" element={<DailyReport />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}
