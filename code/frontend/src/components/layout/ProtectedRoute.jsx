import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../ui/LoadingSpinner'

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * Shows a loader while auth is resolving, then either renders
 * children or redirects to the landing page.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

/**
 * AdminRoute — additionally requires role === "admin".
 */
export function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/" state={{ from: location }} replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}

/**
 * PublicRoute — only shown to unauthenticated users.
 * Redirects authenticated users to the dashboard.
 */
export function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (user) return <Navigate to="/dashboard" replace />

  return children
}
