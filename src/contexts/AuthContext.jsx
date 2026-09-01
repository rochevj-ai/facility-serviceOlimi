import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const USERS = [
  { id: 'sergiy', name: 'Сергій', role: 'facility' },
  { id: 'evgenii', name: 'Євгеній Рочев', role: 'admin', pin: '1233' },
  { id: 'liubov', name: 'Любов Деблюк', role: 'manager', company: 'tier' },
  { id: 'alina', name: 'Аліна Мокляк', role: 'manager', company: 'like' },
  { id: 'artem', name: 'Тимша Артем', role: 'manager', company: 'razom' },
  { id: 'maksym', name: 'Худолій Максим', role: 'manager', company: 'olimi' },
  { id: 'anastasiia', name: 'Анастасія', role: 'manager', company: 'like' },
  { id: 'anna', name: 'Анна', role: 'manager', company: 'razom' },
  { id: 'maryna', name: 'Марина Печонкіна', role: 'manager', company: 'office' },
  { id: 'guest', name: 'Інший користувач', role: 'manager' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fs_user')
    if (saved) {
      try { return JSON.parse(saved) } catch { return null }
    }
    return null
  })

  useEffect(() => {
    if (user) localStorage.setItem('fs_user', JSON.stringify(user))
    else localStorage.removeItem('fs_user')
  }, [user])

  const login = (userId, pin) => {
    const u = USERS.find(u => u.id === userId)
    if (!u) return false
    if (u.pin && u.pin !== pin) return false
    setUser(u)
    return true
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, users: USERS, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
