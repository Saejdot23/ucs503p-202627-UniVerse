/**
 * AuthContext
 *
 * Provides the authenticated user and auth actions to the entire app.
 * The current user is fetched once on mount (GET /auth/me).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await authApi.getMe()
      setUser(res.data?.data || null)
      setError(null)
    } catch (err) {
      // 401 means not logged in — this is expected on the landing page
      if (err.response?.status !== 401) {
        console.error('[auth] Failed to fetch current user:', err?.message)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the API fails, clear local state
    }
    setUser(null)
    window.location.href = '/'
  }

  const refreshUser = () => fetchCurrentUser()

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
