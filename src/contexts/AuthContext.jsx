import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ role: 'user', name: 'Visiteur' })

  const isAdmin = user?.role === 'admin'

  const loginAsAdmin = () => setUser({ role: 'admin', name: 'Admin' })
  const loginAsUser = () => setUser({ role: 'user', name: 'Visiteur' })
  const toggleRole = () => isAdmin ? loginAsUser() : loginAsAdmin()

  return (
    <AuthContext.Provider value={{ user, isAdmin, loginAsAdmin, loginAsUser, toggleRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}