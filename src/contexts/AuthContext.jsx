import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const USERS = [
  { id: 'sergiy', name: 'Сергій', role: 'facility' },
  { id: 'evgenii', name: 'Євгеній', role: 'admin' },
  { id: 'anna', name: 'Анна', role: 'manager', company: 'like' },
  { id: 'manager', name: 'Керівник', role: 'manager' },
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

  const login = (userId) => {
    const u = USERS.find(u => u.id === userId)
    if (u) setUser(u)
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, users: USERS, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
