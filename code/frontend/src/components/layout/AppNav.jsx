/**
 * AppNav — the top navigation bar for authenticated pages.
 * Completely separate from the landing page Nav.
 */

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'
import NotificationBell from './NotificationBell'
import logoImg from '../../assets/logo.png'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Skill Swap', path: '/skillswap' },
  { label: 'Channels', path: '/channels' },
  { label: 'Sessions', path: '/sessions' },
  { label: 'Messages', path: '/chat' },
]

export default function AppNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(24, 8, 7, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <UniLogo />
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--warm-cream)',
          letterSpacing: '0.02em',
        }}>UniVerse</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--warm-cream)' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                background: active ? 'rgba(232, 210, 174, 0.08)' : 'transparent',
                transition: 'all 0.2s',
                letterSpacing: '0.03em',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <NotificationBell />

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,210,174,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Avatar src={user?.avatar} name={user?.fullName} size={30} />
            <span style={{ fontSize: 13, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName?.split(' ')[0]}
            </span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                minWidth: 180,
                zIndex: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
              onMouseLeave={() => setMenuOpen(false)}
            >
              {[
                { label: 'My Profile', action: () => navigate(`/profile/${user?.username}`) },
                { label: 'Credits History', action: () => navigate('/profile/credits') },
                { label: 'Saved Posts', action: () => navigate('/profile/saved') },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setMenuOpen(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,210,174,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {item.label}
                </button>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
              <button
                onClick={logout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#e06c75',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,108,117,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function UniLogo() {
  return (
    <img
      src={logoImg}
      alt="UniVerse logo"
      width={26}
      height={26}
      style={{ objectFit: 'contain', flexShrink: 0 }}
    />
  )
}
