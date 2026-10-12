import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, reportsApi } from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/ErrorState'

export default function AdminPage() {
  const [tab, setTab] = useState('stats')

  const TABS = [
    ['stats', '📊 Overview'],
    ['users', '👥 Users'],
    ['reports', '🚨 Reports'],
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: '#e06c75', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Admin</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--warm-cream)', margin: 0 }}>Dashboard</h1>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
        {TABS.map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)} style={{
            background: 'none', border: 'none', padding: '10px 20px',
            borderBottom: tab === val ? '2px solid var(--plum)' : '2px solid transparent',
            color: tab === val ? 'var(--warm-cream)' : 'var(--text-muted)',
            fontSize: 13, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'stats' && <StatsPanel />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'reports' && <ReportsPanel />}
    </div>
  )
}

function StatsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats(),
    select: (res) => res.data?.data,
  })

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <LoadingSpinner size={28} />
    </div>
  )

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0 },
    { label: 'Total Posts', value: data?.totalPosts ?? 0 },
    { label: 'Pending Reports', value: data?.pendingReports ?? 0 },
    { label: 'Active Sessions', value: data?.activeSessions ?? 0 },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
      {stats.map(s => (
        <div key={s.label} className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--warm-cream)' }}>{s.value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function UsersPanel() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [deductModal, setDeductModal] = useState(null)
  const [deductAmount, setDeductAmount] = useState(5)
  const [deductReason, setDeductReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', q],
    queryFn: () => adminApi.listUsers({ q }),
    select: (res) => res.data?.data,
  })

  const suspendMut = useMutation({
    mutationFn: (id) => adminApi.suspendUser(id, { days: 7 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  })
  const banMut = useMutation({
    mutationFn: (id) => adminApi.banUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  })
  const liftMut = useMutation({
    mutationFn: (id) => adminApi.liftRestriction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  })
  const deductMut = useMutation({
    mutationFn: ({ id, data }) => adminApi.deductCredits(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminUsers'] })
      setDeductModal(null)
      setDeductReason('')
      setDeductAmount(5)
    },
  })

  return (
    <div>
      <input
        className="input"
        placeholder="Search users…"
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{ maxWidth: 340, marginBottom: 16 }}
      />
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><LoadingSpinner size={28} /></div>
      ) : !data?.users?.length ? (
        <EmptyState message="No users found." icon="👥" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.users.map(u => (
            <div key={u._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Avatar src={u.avatar} name={u.fullName} size={38} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{u.fullName}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                  @{u.username} · {u.email} · {u.credits} credits
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 2,
                  background: u.status === 'active' ? 'rgba(152,195,121,0.15)' : 'rgba(224,108,117,0.15)',
                  color: u.status === 'active' ? '#98c379' : '#e06c75',
                }}>{u.status}</span>
                {u.status === 'active' && (
                  <>
                    <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => suspendMut.mutate(u._id)}
                      disabled={suspendMut.isPending}>
                      Suspend 7d
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => window.confirm('Permanently ban this user?') && banMut.mutate(u._id)}
                      disabled={banMut.isPending}>
                      Ban
                    </button>
                  </>
                )}
                {u.status !== 'active' && (
                  <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}
                    onClick={() => liftMut.mutate(u._id)}
                    disabled={liftMut.isPending}>
                    Lift
                  </button>
                )}
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setDeductModal(u)}>
                  Deduct Credits
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deduct credits modal */}
      {deductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1a0a07', border: '1px solid var(--border)', borderRadius: 12, padding: 28, width: '100%', maxWidth: 380 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', marginBottom: 16 }}>
              Deduct Credits — {deductModal.fullName}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="number"
                className="input"
                value={deductAmount}
                onChange={e => setDeductAmount(Number(e.target.value))}
                min={1}
                placeholder="Amount"
              />
              <input
                type="text"
                className="input"
                value={deductReason}
                onChange={e => setDeductReason(e.target.value)}
                placeholder="Reason (required)"
              />
            </div>
            {deductMut.error && (
              <p style={{ color: '#e06c75', fontSize: 13, marginTop: 10 }}>
                {deductMut.error.response?.data?.message || 'Failed to deduct credits'}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setDeductModal(null)} disabled={deductMut.isPending}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => deductMut.mutate({ id: deductModal._id, data: { amount: deductAmount, reason: deductReason } })}
                disabled={!deductReason.trim() || deductMut.isPending}
              >
                {deductMut.isPending ? <LoadingSpinner size={14} /> : 'Deduct'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportsPanel() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => reportsApi.list({ status: 'pending' }),
    select: (res) => res.data?.data,
  })

  const resolveMut = useMutation({
    mutationFn: (id) => reportsApi.resolve(id, { status: 'reviewed' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminReports'] }),
  })
  const dismissMut = useMutation({
    mutationFn: (id) => reportsApi.resolve(id, { status: 'dismissed' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminReports'] }),
  })

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <LoadingSpinner size={28} />
    </div>
  )
  if (!data?.reports?.length) return <EmptyState message="No pending reports." icon="🚨" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.reports.map(r => (
        <div key={r._id} className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                Report: {r.targetType} ·{' '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>
                  by {r.reporter?.fullName}
                </span>
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{r.reason}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => resolveMut.mutate(r._id)}
                disabled={resolveMut.isPending}
              >
                Reviewed
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => dismissMut.mutate(r._id)}
                disabled={dismissMut.isPending}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
