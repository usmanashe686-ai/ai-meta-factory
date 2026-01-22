'use client'

import { createContext, useContext, ReactNode } from 'react'

const AuthContext = createContext({ user: null, loading: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
