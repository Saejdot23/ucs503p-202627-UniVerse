import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute, { PublicRoute, AdminRoute } from './components/layout/ProtectedRoute'
import AppNav from './components/layout/AppNav'
import { PageLoader } from './components/ui/LoadingSpinner'

// Pages
import LandingPage from './pages/landing/LandingPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/profile/ProfilePage'
import SkillSwapPage from './pages/skillswap/SkillSwapPage'
import ChannelsPage from './pages/channels/ChannelsPage'
import ChatPage from './pages/chat/ChatPage'
import ConversationPage from './pages/chat/ConversationPage'
import SessionsPage from './pages/sessions/SessionsPage'
import SessionDetailPage from './pages/sessions/SessionDetailPage'
import CreditHistoryPage from './pages/profile/CreditHistoryPage'
import SavedPostsPage from './pages/profile/SavedPostsPage'
import AdminPage from './pages/admin/AdminPage'

// App layout wrapper — shows AppNav on authenticated pages
function AppLayout({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      {user && !isLanding && <AppNav />}
      {children}
    </>
  )
}

// Handle OAuth callback errors
function AuthErrorHandler() {
  const params = new URLSearchParams(window.location.search)
  const authError = params.get('authError')
  if (authError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--near-black)' }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: 32 }}>
          <p style={{ fontSize: 32, marginBottom: 16 }}>⚠</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--warm-cream)', marginBottom: 12, fontSize: 24 }}>
            Login Failed
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            {decodeURIComponent(authError).replace(/_/g, ' ')}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }
  return null
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) return <PageLoader />

  // Check for auth error on landing page
  const authErrorEl = <AuthErrorHandler />

  return (
    <>
      {authErrorEl}
      <AppLayout>
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          {/* Protected authenticated routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skillswap"
            element={
              <ProtectedRoute>
                <SkillSwapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skillswap/:mode"
            element={
              <ProtectedRoute>
                <SkillSwapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels"
            element={
              <ProtectedRoute>
                <ChannelsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels/:channel"
            element={
              <ProtectedRoute>
                <ChannelsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels/:channel/:postId"
            element={
              <ProtectedRoute>
                <ChannelsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
          <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
          <Route path="/profile/credits" element={<ProtectedRoute><CreditHistoryPage /></ProtectedRoute>} />
          <Route path="/profile/saved" element={<ProtectedRoute><SavedPostsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
